import {
  ConflictException,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ROLE_NAMES, toAppRole } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const customerRole = await this.prisma.vAI_TRO.findUnique({
      where: { tenvaitro: ROLE_NAMES.CUSTOMER },
    });
    if (!customerRole) {
      throw new InternalServerErrorException('Vai trò CUSTOMER chưa được cấu hình');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const account = await this.prisma.tAI_KHOAN.create({
        data: {
          tendangnhap: dto.email,
          email: dto.email,
          matkhau: passwordHash,
          trangthai: 'HOAT_DONG',
          mavaitro: customerRole.mavaitro,
          KHACH_HANG: {
            create: { hoten: dto.email.split('@')[0] },
          },
        },
        include: { VAI_TRO: true },
      });

      return this.issueToken(account, 'CUSTOMER');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Tên đăng nhập hoặc email đã được sử dụng');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const account = await this.prisma.tAI_KHOAN.findFirst({
      where: {
        OR: [
          { tendangnhap: dto.identifier },
          { email: dto.identifier },
        ],
      },
      include: { VAI_TRO: true },
    });
    const validPassword =
      account && (await bcrypt.compare(dto.password, account.matkhau));

    if (!account || !validPassword || account.trangthai !== 'HOAT_DONG') {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    const role = toAppRole(account.VAI_TRO.tenvaitro);
    if (!role) {
      throw new UnauthorizedException('Tài khoản chưa được gán vai trò hợp lệ');
    }

    return this.issueToken(account, role);
  }

  private issueToken(
    account: {
      mataikhoan: number;
      tendangnhap: string;
      email: string;
    },
    role: string,
  ) {
    const user = {
      mataikhoan: account.mataikhoan,
      tendangnhap: account.tendangnhap,
      email: account.email,
      role,
    };
    return {
      access_token: this.jwtService.sign({ sub: account.mataikhoan }),
      user,
    };
  }
}
