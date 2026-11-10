import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/**
 * CategoriesService - Quản lý bảng DANH_MUC (madanhmuc, tendanhmuc, mota) (TV2)
 * Đảm bảo quy tắc bảo toàn dữ liệu khi thêm, xem, sửa, xóa danh mục.
 */
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeDiscontinued = false) {
    const categories = await this.prisma.dANH_MUC.findMany({
      include: {
        _count: {
          select: {
            SAN_PHAM: includeDiscontinued
              ? true
              : { where: { trangthai: { not: 'NGUNG_KINH_DOANH' } } },
          },
        },
      },
      orderBy: { madanhmuc: 'asc' },
    });

    return categories.map((cat) => ({
      madanhmuc: cat.madanhmuc,
      tendanhmuc: cat.tendanhmuc,
      mota: cat.mota,
      soluongsanpham: cat._count.SAN_PHAM,
    }));
  }

  async findOne(madanhmuc: number, includeDiscontinued = false) {
    const category = await this.prisma.dANH_MUC.findUnique({
      where: { madanhmuc },
      include: {
        SAN_PHAM: {
          where: includeDiscontinued
            ? {}
            : { trangthai: { not: 'NGUNG_KINH_DOANH' } },
          include: {
            TON_KHO: {
              orderBy: { ngaycapnhat: 'desc' },
              take: 1,
            },
          },
          orderBy: { giaban: 'desc' },
        },
        _count: {
          select: { SAN_PHAM: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục iPhone có madanhmuc = ${madanhmuc}`);
    }

    return {
      ...category,
      tongsosanpham: category._count.SAN_PHAM,
    };
  }

  async create(dto: CreateCategoryDto) {
    const tendanhmuc = dto.tendanhmuc?.trim();
    if (!tendanhmuc) {
      throw new BadRequestException('tendanhmuc không được để trống');
    }

    const existing = await this.prisma.dANH_MUC.findFirst({
      where: {
        tendanhmuc: { equals: tendanhmuc, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new ConflictException(`Danh mục "${tendanhmuc}" đã tồn tại trong hệ thống`);
    }

    return this.prisma.dANH_MUC.create({
      data: {
        tendanhmuc,
        mota: dto.mota?.trim() || null,
      },
    });
  }

  async update(madanhmuc: number, dto: UpdateCategoryDto) {
    const current = await this.prisma.dANH_MUC.findUnique({
      where: { madanhmuc },
    });

    if (!current) {
      throw new NotFoundException(`Không tìm thấy danh mục iPhone có madanhmuc = ${madanhmuc}`);
    }

    const nextName =
      dto.tendanhmuc !== undefined ? dto.tendanhmuc.trim() : current.tendanhmuc;

    if (!nextName) {
      throw new BadRequestException('tendanhmuc không được để trống');
    }

    const duplicate = await this.prisma.dANH_MUC.findFirst({
      where: {
        madanhmuc: { not: madanhmuc },
        tendanhmuc: { equals: nextName, mode: 'insensitive' },
      },
    });

    if (duplicate) {
      throw new ConflictException(
        `Tên danh mục "${nextName}" đã được sử dụng bởi danh mục khác`,
      );
    }

    return this.prisma.dANH_MUC.update({
      where: { madanhmuc },
      data: {
        tendanhmuc: nextName,
        mota: dto.mota !== undefined ? dto.mota?.trim() || null : current.mota,
      },
    });
  }

  /**
   * Xóa danh mục theo quy tắc bảo toàn dữ liệu:
   * - Nếu danh mục đang chứa sản phẩm trong bảng SAN_PHAM, chặn xóa vật lý (ON DELETE RESTRICT).
   */
  async remove(madanhmuc: number) {
    const category = await this.prisma.dANH_MUC.findUnique({
      where: { madanhmuc },
      include: {
        _count: {
          select: { SAN_PHAM: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục iPhone có madanhmuc = ${madanhmuc}`);
    }

    if (category._count.SAN_PHAM > 0) {
      throw new BadRequestException(
        `Không thể xóa danh mục "${category.tendanhmuc}" vì đang chứa ${category._count.SAN_PHAM} sản phẩm trong bảng SAN_PHAM. ` +
          `Theo quy tắc bảo toàn dữ liệu, vui lòng chuyển các sản phẩm sang danh mục khác trước khi xóa.`,
      );
    }

    await this.prisma.dANH_MUC.delete({
      where: { madanhmuc },
    });

    return {
      message: `Đã xóa danh mục "${category.tendanhmuc}" thành công`,
      madanhmuc,
    };
  }
}
