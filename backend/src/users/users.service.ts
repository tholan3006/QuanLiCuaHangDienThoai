import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppRole, ROLE_NAMES, toAppRole } from '../auth/auth.constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const accounts = await this.prisma.tAI_KHOAN.findMany({
      include: {
        VAI_TRO: true,
        NHAN_VIEN: true,
        KHACH_HANG: true,
      },
      orderBy: { mataikhoan: 'asc' },
    });

    return accounts.map((account) => {
      const role = toAppRole(account.VAI_TRO.tenvaitro);
      return {
        mataikhoan: account.mataikhoan,
        tendangnhap: account.tendangnhap,
        email: account.email,
        fullName: this.getFullName(account, role),
        role,
        isActive: account.trangthai === 'HOAT_DONG',
      };
    });
  }

  async create(dto: CreateUserDto) {
    const roleName = ROLE_NAMES[dto.role];
    const role = await this.prisma.vAI_TRO.findUnique({
      where: { tenvaitro: roleName },
    });
    if (!role) {
      throw new ConflictException(`Vai trò ${dto.role} chưa được cấu hình`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const accountId = await this.prisma.$transaction(async (tx) => {
        const account = await tx.tAI_KHOAN.create({
          data: {
            tendangnhap: dto.email,
            email: dto.email,
            matkhau: passwordHash,
            trangthai: 'HOAT_DONG',
            mavaitro: role.mavaitro,
          },
        });
        await this.createProfile(
          tx,
          account.mataikhoan,
          dto.role,
          dto.email.split('@')[0],
        );
        return account.mataikhoan;
      });
      return this.findById(accountId);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Tên đăng nhập hoặc email đã được sử dụng');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const account = await tx.tAI_KHOAN.findUnique({
            where: { mataikhoan: id },
            include: { VAI_TRO: true, NHAN_VIEN: true, KHACH_HANG: true },
          });
          if (!account) throw new NotFoundException('Không tìm thấy tài khoản');

          const currentRole = toAppRole(account.VAI_TRO.tenvaitro);
          const nextRole = dto.role ?? currentRole;
          if (!nextRole) throw new ConflictException('Vai trò hiện tại không hợp lệ');

          const fullName = dto.email
            ? dto.email.split('@')[0]
            : this.getFullName(account, currentRole);

          if (
            currentRole === 'ADMIN' &&
            nextRole !== 'ADMIN' &&
            account.trangthai === 'HOAT_DONG'
          ) {
            await this.ensureAnotherActiveAdmin(tx, id);
          }

          const role = await tx.vAI_TRO.findUnique({
            where: { tenvaitro: ROLE_NAMES[nextRole] },
          });
          if (!role) {
            throw new ConflictException(`Vai trò ${nextRole} chưa được cấu hình`);
          }

          await tx.tAI_KHOAN.update({
            where: { mataikhoan: id },
            data: {
              ...(dto.email !== undefined && {
                email: dto.email,
                ...(dto.email !== account.email && { tendangnhap: dto.email }),
              }),
              mavaitro: role.mavaitro,
            },
          });
          await this.createProfile(tx, id, nextRole, fullName);

          return this.findById(id, tx);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Tên đăng nhập hoặc email đã được sử dụng');
      }
      throw error;
    }
  }

  async setActive(id: number, isActive: boolean, actorId: number) {
    return this.prisma.$transaction(
      async (tx) => {
        const account = await tx.tAI_KHOAN.findUnique({
          where: { mataikhoan: id },
          include: { VAI_TRO: true },
        });
        if (!account) throw new NotFoundException('Không tìm thấy tài khoản');

        if (!isActive && id === actorId && account.VAI_TRO.tenvaitro === ROLE_NAMES.ADMIN) {
          throw new ConflictException('Không thể khóa tài khoản Admin đang đăng nhập');
        }
        if (
          !isActive &&
          account.trangthai === 'HOAT_DONG' &&
          account.VAI_TRO.tenvaitro === ROLE_NAMES.ADMIN
        ) {
          await this.ensureAnotherActiveAdmin(tx, id);
        }

        await tx.tAI_KHOAN.update({
          where: { mataikhoan: id },
          data: { trangthai: isActive ? 'HOAT_DONG' : 'KHOA' },
        });
        return this.findById(id, tx);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  private async createProfile(
    client: Prisma.TransactionClient | PrismaService,
    accountId: number,
    role: AppRole,
    fullName: string,
  ) {
    if (role === 'ADMIN' || role === 'STAFF') {
      await client.nHAN_VIEN.upsert({
        where: { mataikhoan: accountId },
        create: { mataikhoan: accountId, hoten: fullName },
        update: { hoten: fullName },
      });
    } else if (role === 'CUSTOMER') {
      await client.kHACH_HANG.upsert({
        where: { mataikhoan: accountId },
        create: { mataikhoan: accountId, hoten: fullName },
        update: { hoten: fullName },
      });
    }
  }

  private async ensureAnotherActiveAdmin(
    tx: Prisma.TransactionClient,
    excludedId: number,
  ) {
    const remaining = await tx.tAI_KHOAN.count({
      where: {
        mataikhoan: { not: excludedId },
        trangthai: 'HOAT_DONG',
        VAI_TRO: { tenvaitro: ROLE_NAMES.ADMIN },
      },
    });
    if (remaining === 0) {
      throw new ConflictException('Không thể khóa hoặc hạ quyền Admin cuối cùng');
    }
  }

  private async findById(
    id: number,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const account = await client.tAI_KHOAN.findUnique({
      where: { mataikhoan: id },
      include: { VAI_TRO: true, NHAN_VIEN: true, KHACH_HANG: true },
    });
    if (!account) throw new NotFoundException('Không tìm thấy tài khoản');

    const role = toAppRole(account.VAI_TRO.tenvaitro);
    return {
      mataikhoan: account.mataikhoan,
      tendangnhap: account.tendangnhap,
      email: account.email,
      fullName: this.getFullName(account, role),
      role,
      isActive: account.trangthai === 'HOAT_DONG',
    };
  }

  private getFullName(
    account: {
      NHAN_VIEN: { hoten: string }[];
      KHACH_HANG: { hoten: string }[];
    },
    role: AppRole | undefined,
  ) {
    if (role === 'CUSTOMER') return account.KHACH_HANG[0]?.hoten ?? '';
    return account.NHAN_VIEN[0]?.hoten ?? account.KHACH_HANG[0]?.hoten ?? '';
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
