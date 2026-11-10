import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockPriceDto } from './dto/update-stock-price.dto';

/**
 * ProductsService - Quản lý bảng SAN_PHAM & TON_KHO (TV2)
 * Khớp 100% với mục "2.1. Sơ đồ quan hệ giữa các bảng":
 * - SAN_PHAM (masanpham, tensanpham, dungluong, mausac, giaban, mota, hinhanh, trangthai, madanhmuc)
 * - TON_KHO (matonkho, masanpham, soluong, ngaycapnhat)
 */
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Trích xuất hoặc tự động tạo mã SKU định danh cho từng phiên bản (tên + dung lượng + màu sắc)
   */
  private extractOrGenerateSku(product: {
    masanpham: number;
    tensanpham: string;
    dungluong: string;
    mausac: string;
    mota?: string | null;
  }): string {
    const match = product.mota?.match(/\[SKU:\s*([A-Za-z0-9\-_]+)\]/i);
    if (match?.[1]) {
      return match[1].toUpperCase();
    }
    const cleanModel = product.tensanpham
      .toUpperCase()
      .replace(/IPHONE\s*/i, 'IP')
      .replace(/PRO\s*MAX/i, 'PM')
      .replace(/PLUS/i, 'PL')
      .replace(/PRO/i, 'P')
      .replace(/[^A-Z0-9]/g, '');
    const cleanColor = product.mausac
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 3);
    return `${cleanModel}-${product.dungluong.toUpperCase()}-${cleanColor || 'STD'}-${product.masanpham}`;
  }

  /**
   * Chuẩn hóa dữ liệu sản phẩm trả về kèm số lượng tồn kho hiện tại từ bảng TON_KHO và mã SKU
   */
  private formatProductResponse(item: any) {
    const latestStockRecord = item.TON_KHO?.[0];
    const soluongton = latestStockRecord ? latestStockRecord.soluong : 0;
    const sku = this.extractOrGenerateSku(item);

    return {
      masanpham: item.masanpham,
      sku,
      tensanpham: item.tensanpham,
      dungluong: item.dungluong,
      mausac: item.mausac,
      giaban: Number(item.giaban),
      mota: item.mota,
      hinhanh: item.hinhanh,
      trangthai: item.trangthai,
      madanhmuc: item.madanhmuc,
      soluongton,
      ngaycapnhatkho: latestStockRecord?.ngaycapnhat || null,
      DANH_MUC: item.DANH_MUC || undefined,
      TON_KHO: item.TON_KHO || undefined,
      sodonhangdaco: item._count?.CHI_TIET_DON_HANG ?? undefined,
      cothemua: item.trangthai === 'DANG_BAN' && soluongton > 0,
    };
  }

  /**
   * Xây dựng điều kiện lọc dùng chung cho truy vấn bảng SAN_PHAM
   */
  private buildWhereClause(
    filter: FilterProductDto,
    forCustomerStore: boolean,
  ): Prisma.SAN_PHAMWhereInput {
    const where: Prisma.SAN_PHAMWhereInput = {};

    // Trang khách hàng: Tuyệt đối ẩn sản phẩm ngừng kinh doanh (Soft Delete)
    if (forCustomerStore) {
      where.trangthai = { not: 'NGUNG_KINH_DOANH' };
    } else if (filter.trangthai) {
      where.trangthai = filter.trangthai;
    }

    if (filter.madanhmuc !== undefined) {
      where.madanhmuc = Number(filter.madanhmuc);
    }

    if (filter.dungluong) {
      where.dungluong = { equals: filter.dungluong.trim(), mode: 'insensitive' };
    }

    if (filter.mausac) {
      where.mausac = { contains: filter.mausac.trim(), mode: 'insensitive' };
    }

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      if (
        filter.minPrice !== undefined &&
        filter.maxPrice !== undefined &&
        Number(filter.minPrice) > Number(filter.maxPrice)
      ) {
        throw new BadRequestException(
          'Giá tối thiểu (minPrice) không được lớn hơn giá tối đa (maxPrice)',
        );
      }

      where.giaban = {};
      if (filter.minPrice !== undefined) {
        where.giaban.gte = Number(filter.minPrice);
      }
      if (filter.maxPrice !== undefined) {
        where.giaban.lte = Number(filter.maxPrice);
      }
    }

    if (filter.search?.trim()) {
      const keyword = filter.search.trim();
      where.OR = [
        { tensanpham: { contains: keyword, mode: 'insensitive' } },
        { mausac: { contains: keyword, mode: 'insensitive' } },
        { dungluong: { contains: keyword, mode: 'insensitive' } },
        { mota: { contains: keyword, mode: 'insensitive' } },
        { DANH_MUC: { tendanhmuc: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  private buildOrderBy(
    sortBy?: FilterProductDto['sortBy'],
  ): Prisma.SAN_PHAMOrderByWithRelationInput {
    switch (sortBy) {
      case 'price_asc':
        return { giaban: 'asc' };
      case 'price_desc':
        return { giaban: 'desc' };
      case 'name_asc':
        return { tensanpham: 'asc' };
      case 'newest':
      default:
        return { masanpham: 'desc' };
    }
  }

  /**
   * 1. DÀNH CHO KHÁCH HÀNG (STORE):
   * Lấy danh sách sản phẩm đang kinh doanh (ẩn hoàn toàn sản phẩm NGUNG_KINH_DOANH)
   */
  async findAllForStore(filter: FilterProductDto) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 20;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filter, true);
    const orderBy = this.buildOrderBy(filter.sortBy);

    const [items, total] = await Promise.all([
      this.prisma.sAN_PHAM.findMany({
        where,
        include: {
          DANH_MUC: true,
          TON_KHO: {
            orderBy: { ngaycapnhat: 'desc' },
            take: 1,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.sAN_PHAM.count({ where }),
    ]);

    return {
      data: items.map((item) => this.formatProductResponse(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 2. DÀNH CHO NHÂN VIÊN BÁN HÀNG (STAFF):
   * Lấy đầy đủ danh sách sản phẩm (kể cả đã ẩn / ngừng kinh doanh) kèm thống kê tồn kho từ bảng TON_KHO
   */
  async findAllForStaff(filter: FilterProductDto) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 50;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filter, false);
    const orderBy = this.buildOrderBy(filter.sortBy);

    const [items, total, allProducts] = await Promise.all([
      this.prisma.sAN_PHAM.findMany({
        where,
        include: {
          DANH_MUC: true,
          TON_KHO: {
            orderBy: { ngaycapnhat: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              CHI_TIET_DON_HANG: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.sAN_PHAM.count({ where }),
      this.prisma.sAN_PHAM.findMany({
        include: {
          TON_KHO: {
            orderBy: { ngaycapnhat: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const normalizedAll = allProducts.map((p) => ({
      trangthai: p.trangthai,
      soluong: p.TON_KHO[0]?.soluong ?? 0,
    }));

    const summary = {
      tongsophienban: normalizedAll.length,
      dangkinhdoanh: normalizedAll.filter((p) => p.trangthai === 'DANG_BAN').length,
      saphethang: normalizedAll.filter(
        (p) => p.trangthai !== 'NGUNG_KINH_DOANH' && p.soluong > 0 && p.soluong <= 5,
      ).length,
      hethang: normalizedAll.filter(
        (p) => p.trangthai === 'HET_HANG' || (p.trangthai === 'DANG_BAN' && p.soluong === 0),
      ).length,
      ngungkinhdoanh: normalizedAll.filter((p) => p.trangthai === 'NGUNG_KINH_DOANH').length,
      tongmaytonkho: normalizedAll
        .filter((p) => p.trangthai !== 'NGUNG_KINH_DOANH')
        .reduce((acc, cur) => acc + cur.soluong, 0),
    };

    return {
      data: items.map((item) => this.formatProductResponse(item)),
      summary,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 3. XEM CHI TIẾT SẢN PHẨM CHO KHÁCH HÀNG (STORE)
   */
  async findOneForStore(masanpham: number) {
    const product = await this.prisma.sAN_PHAM.findUnique({
      where: { masanpham },
      include: {
        DANH_MUC: true,
        TON_KHO: {
          orderBy: { ngaycapnhat: 'desc' },
          take: 1,
        },
      },
    });

    if (!product || product.trangthai === 'NGUNG_KINH_DOANH') {
      throw new NotFoundException(
        'Sản phẩm này đã ngừng kinh doanh hoặc không tồn tại trên cửa hàng',
      );
    }

    const variants = await this.prisma.sAN_PHAM.findMany({
      where: {
        tensanpham: product.tensanpham,
        trangthai: { not: 'NGUNG_KINH_DOANH' },
      },
      include: {
        TON_KHO: {
          orderBy: { ngaycapnhat: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ dungluong: 'asc' }, { mausac: 'asc' }],
    });

    return {
      ...this.formatProductResponse(product),
      cacphienbancungdong: variants.map((v) => this.formatProductResponse(v)),
    };
  }

  /**
   * 4. XEM CHI TIẾT SẢN PHẨM CHO NHÂN VIÊN (STAFF)
   */
  async findOneForStaff(masanpham: number) {
    const product = await this.prisma.sAN_PHAM.findUnique({
      where: { masanpham },
      include: {
        DANH_MUC: true,
        TON_KHO: {
          orderBy: { ngaycapnhat: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            CHI_TIET_DON_HANG: true,
            CHI_TIET_GIO_HANG: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có masanpham = ${masanpham}`);
    }

    return this.formatProductResponse(product);
  }

  /**
   * 5. THÊM MỚI SẢN PHẨM IPHONE VÀO BẢNG SAN_PHAM & KHỞI TẠO BẢNG TON_KHO
   */
  async create(dto: CreateProductDto) {
    const tensanpham = dto.tensanpham.trim();
    const dungluong = dto.dungluong.trim().toUpperCase();
    const mausac = dto.mausac.trim();
    const soluong = dto.soluong ?? 0;

    // Kiểm tra danh mục tồn tại
    const category = await this.prisma.dANH_MUC.findUnique({
      where: { madanhmuc: dto.madanhmuc },
    });
    if (!category) {
      throw new BadRequestException(`Danh mục madanhmuc = ${dto.madanhmuc} không tồn tại`);
    }

    // Kiểm tra trùng tổ hợp phiên bản (tensanpham + dungluong + mausac)
    const existingVariant = await this.prisma.sAN_PHAM.findFirst({
      where: {
        tensanpham: { equals: tensanpham, mode: 'insensitive' },
        dungluong: { equals: dungluong, mode: 'insensitive' },
        mausac: { equals: mausac, mode: 'insensitive' },
      },
    });
    if (existingVariant) {
      throw new ConflictException(
        `Phiên bản "${tensanpham} - ${dungluong} - ${mausac}" đã tồn tại trong hệ thống (masanpham = #${existingVariant.masanpham})`,
      );
    }

    // Xử lý gắn mã SKU vào mô tả nếu nhân viên nhập mã SKU riêng
    let mota = dto.mota?.trim() || '';
    if (dto.sku?.trim()) {
      const cleanSku = dto.sku.trim().toUpperCase();
      mota = `[SKU: ${cleanSku}] ${mota.replace(/\[SKU:\s*[^\]]+\]\s*/i, '')}`.trim();
    }

    const trangthai =
      dto.trangthai === 'NGUNG_KINH_DOANH'
        ? 'NGUNG_KINH_DOANH'
        : soluong === 0
          ? 'HET_HANG'
          : 'DANG_BAN';

    const created = await this.prisma.$transaction(async (tx) => {
      const product = await tx.sAN_PHAM.create({
        data: {
          tensanpham,
          dungluong,
          mausac,
          giaban: dto.giaban,
          mota: mota || null,
          hinhanh: dto.hinhanh?.trim() || null,
          trangthai,
          madanhmuc: dto.madanhmuc,
          TON_KHO: {
            create: {
              soluong,
            },
          },
        },
        include: {
          DANH_MUC: true,
          TON_KHO: {
            orderBy: { ngaycapnhat: 'desc' },
            take: 1,
          },
        },
      });

      return product;
    });

    return this.formatProductResponse(created);
  }

  /**
   * 6. CHỈNH SỬA THÔNG TIN SẢN PHẨM IPHONE & CẬP NHẬT BẢNG TON_KHO
   */
  async update(masanpham: number, dto: UpdateProductDto) {
    const current = await this.prisma.sAN_PHAM.findUnique({
      where: { masanpham },
      include: {
        TON_KHO: {
          orderBy: { ngaycapnhat: 'desc' },
          take: 1,
        },
      },
    });

    if (!current) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có masanpham = ${masanpham}`);
    }

    if (dto.madanhmuc !== undefined && dto.madanhmuc !== current.madanhmuc) {
      const category = await this.prisma.dANH_MUC.findUnique({
        where: { madanhmuc: dto.madanhmuc },
      });
      if (!category) {
        throw new BadRequestException(`Danh mục madanhmuc = ${dto.madanhmuc} không tồn tại`);
      }
    }

    const nextName = dto.tensanpham !== undefined ? dto.tensanpham.trim() : current.tensanpham;
    const nextStorage =
      dto.dungluong !== undefined ? dto.dungluong.trim().toUpperCase() : current.dungluong;
    const nextColor = dto.mausac !== undefined ? dto.mausac.trim() : current.mausac;
    const currentStock = current.TON_KHO[0]?.soluong ?? 0;
    const nextStock = dto.soluong !== undefined ? dto.soluong : currentStock;

    // Kiểm tra trùng tổ hợp phiên bản (tensanpham + dungluong + mausac)
    const variantDup = await this.prisma.sAN_PHAM.findFirst({
      where: {
        masanpham: { not: masanpham },
        tensanpham: { equals: nextName, mode: 'insensitive' },
        dungluong: { equals: nextStorage, mode: 'insensitive' },
        mausac: { equals: nextColor, mode: 'insensitive' },
      },
    });
    if (variantDup) {
      throw new ConflictException(
        `Phiên bản "${nextName} - ${nextStorage} - ${nextColor}" đã tồn tại ở sản phẩm #${variantDup.masanpham}`,
      );
    }

    let nextMota = dto.mota !== undefined ? dto.mota?.trim() || '' : current.mota || '';
    if (dto.sku?.trim()) {
      const cleanSku = dto.sku.trim().toUpperCase();
      nextMota = `[SKU: ${cleanSku}] ${nextMota.replace(/\[SKU:\s*[^\]]+\]\s*/i, '')}`.trim();
    }

    let nextStatus = dto.trangthai ?? current.trangthai;
    if (nextStatus !== 'NGUNG_KINH_DOANH') {
      nextStatus = nextStock === 0 ? 'HET_HANG' : 'DANG_BAN';
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Nếu có cập nhật số lượng tồn kho, lưu vào bảng TON_KHO
      if (dto.soluong !== undefined) {
        await tx.tON_KHO.create({
          data: {
            masanpham,
            soluong: nextStock,
          },
        });
      }

      return tx.sAN_PHAM.update({
        where: { masanpham },
        data: {
          tensanpham: nextName,
          dungluong: nextStorage,
          mausac: nextColor,
          giaban: dto.giaban !== undefined ? dto.giaban : current.giaban,
          mota: nextMota || null,
          hinhanh: dto.hinhanh !== undefined ? dto.hinhanh?.trim() || null : current.hinhanh,
          trangthai: nextStatus,
          madanhmuc: dto.madanhmuc ?? current.madanhmuc,
        },
        include: {
          DANH_MUC: true,
          TON_KHO: {
            orderBy: { ngaycapnhat: 'desc' },
            take: 1,
          },
        },
      });
    });

    return this.formatProductResponse(updated);
  }

  /**
   * 7. CẬP NHẬT NHANH GIÁ BÁN, SỐ LƯỢNG TỒN KHO VÀ HÌNH ẢNH
   */
  async updatePriceStockImage(masanpham: number, dto: UpdateStockPriceDto) {
    return this.update(masanpham, dto);
  }

  /**
   * 8. ẨN / NGỪNG KINH DOANH SẢN PHẨM (SOFT DELETE)
   * Đảm bảo sản phẩm ngừng kinh doanh được ẩn khỏi trang khách hàng và không thể đặt mua.
   * Tuyệt đối không xóa vật lý sản phẩm đã có đơn hàng!
   */
  async softDelete(masanpham: number) {
    const product = await this.prisma.sAN_PHAM.findUnique({
      where: { masanpham },
      include: {
        _count: {
          select: {
            CHI_TIET_DON_HANG: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có masanpham = ${masanpham}`);
    }

    const updated = await this.prisma.sAN_PHAM.update({
      where: { masanpham },
      data: {
        trangthai: 'NGUNG_KINH_DOANH',
      },
      include: {
        DANH_MUC: true,
        TON_KHO: {
          orderBy: { ngaycapnhat: 'desc' },
          take: 1,
        },
      },
    });

    return {
      message:
        product._count.CHI_TIET_DON_HANG > 0
          ? `Sản phẩm "${product.tensanpham} (${product.dungluong} - ${product.mausac})" đã phát sinh ${product._count.CHI_TIET_DON_HANG} đơn hàng. Hệ thống đã chuyển sang trạng thái NGUNG_KINH_DOANH (Soft Delete) để ẩn khỏi trang khách hàng và bảo toàn lịch sử đơn hàng.`
          : `Đã ẩn sản phẩm "${product.tensanpham} (${product.dungluong} - ${product.mausac})" (NGUNG_KINH_DOANH) khỏi trang khách hàng thành công.`,
      data: this.formatProductResponse(updated),
    };
  }

  /**
   * 9. KHÔI PHỤC KINH DOANH SẢN PHẨM ĐÃ ẨN
   */
  async restore(masanpham: number) {
    const product = await this.prisma.sAN_PHAM.findUnique({
      where: { masanpham },
      include: {
        TON_KHO: {
          orderBy: { ngaycapnhat: 'desc' },
          take: 1,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có masanpham = ${masanpham}`);
    }

    const currentStock = product.TON_KHO[0]?.soluong ?? 0;
    const newStatus = currentStock > 0 ? 'DANG_BAN' : 'HET_HANG';

    const updated = await this.prisma.sAN_PHAM.update({
      where: { masanpham },
      data: {
        trangthai: newStatus,
      },
      include: {
        DANH_MUC: true,
        TON_KHO: {
          orderBy: { ngaycapnhat: 'desc' },
          take: 1,
        },
      },
    });

    return {
      message: `Đã mở bán trở lại sản phẩm "${product.tensanpham}" với trạng thái ${newStatus}.`,
      data: this.formatProductResponse(updated),
    };
  }

  /**
   * 10. KIỂM TRA SẢN PHẨM CÓ THỂ ĐẶT MUA HAY KHÔNG (Chặn sản phẩm NGUNG_KINH_DOANH)
   */
  async verifyPurchasable(masanpham: number, soluongmua = 1) {
    if (soluongmua <= 0) {
      throw new BadRequestException('Số lượng đặt mua phải lớn hơn 0');
    }

    const product = await this.prisma.sAN_PHAM.findUnique({
      where: { masanpham },
      include: {
        TON_KHO: {
          orderBy: { ngaycapnhat: 'desc' },
          take: 1,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Sản phẩm #${masanpham} không tồn tại`);
    }

    if (product.trangthai === 'NGUNG_KINH_DOANH') {
      throw new BadRequestException(
        `Sản phẩm "${product.tensanpham} (${product.dungluong} - ${product.mausac})" đã ngừng kinh doanh và không thể đặt mua`,
      );
    }

    const currentStock = product.TON_KHO[0]?.soluong ?? 0;
    if (product.trangthai === 'HET_HANG' || currentStock < soluongmua) {
      throw new BadRequestException(
        `Sản phẩm "${product.tensanpham} (${product.dungluong} - ${product.mausac})" hiện chỉ còn ${currentStock} máy trong kho, không đủ số lượng yêu cầu (${soluongmua})`,
      );
    }

    return {
      purchasable: true,
      masanpham: product.masanpham,
      tensanpham: product.tensanpham,
      dungluong: product.dungluong,
      mausac: product.mausac,
      dongia: Number(product.giaban),
      soluongmua,
      thanhtien: Number(product.giaban) * soluongmua,
      soluongtonhientai: currentStock,
    };
  }
}
