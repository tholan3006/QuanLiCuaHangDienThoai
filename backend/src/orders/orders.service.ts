import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InvoicesService } from '../invoices/invoices.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, isStaff } from './auth-user';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';

// Trạng thái theo schema.prisma: PENDING = CHO_XAC_NHAN, APPROVED = DA_XAC_NHAN, CANCELLED = DA_HUY
const PENDING = 'CHO_XAC_NHAN';
const APPROVED = 'DA_XAC_NHAN';
const CANCELLED = 'DA_HUY';
// Seed của TV5 dùng HOAN_THANH cho đơn đã duyệt, nên coi các trạng thái này đều là "đã duyệt"
const APPROVED_STATES = [APPROVED, 'DANG_GIAO', 'HOAN_THANH'];

const ORDER_INCLUDE: Prisma.DON_HANGInclude = {
  KHACH_HANG: true,
  NHAN_VIEN: true,
  HOA_DON: true,
  CHI_TIET_DON_HANG: { include: { SAN_PHAM: true } },
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoices: InvoicesService,
  ) {}

  // ---------------------------------------------------------------------------
  // Hàm phụ
  // ---------------------------------------------------------------------------
  private assertStaff(user: AuthUser) {
    if (!isStaff(user)) {
      throw new ForbiddenException('Chỉ nhân viên hoặc Admin mới được thực hiện thao tác này');
    }
  }

  private async getCustomer(user: AuthUser) {
    const customer = await this.prisma.kHACH_HANG.findUnique({
      where: { mataikhoan: user.mataikhoan },
    });
    if (!customer) {
      throw new ForbiddenException('Tài khoản này chưa có hồ sơ khách hàng');
    }
    return customer;
  }

  /**
   * Tăng/giảm tồn kho của 1 sản phẩm trong cùng transaction.
   * delta < 0: trừ kho, chỉ thành công khi còn đủ hàng (điều kiện soluong >= số cần trừ nằm ngay trong câu UPDATE).
   * delta > 0: hoàn kho.
   */
  private async changeStock(
    tx: Prisma.TransactionClient,
    masanpham: number,
    delta: number,
    tensanpham: string,
  ) {
    const row = await tx.tON_KHO.findFirst({
      where: { masanpham },
      orderBy: { matonkho: 'asc' },
    });
    if (!row) {
      throw new BadRequestException(`Sản phẩm "${tensanpham}" chưa có dữ liệu tồn kho`);
    }

    const result = await tx.tON_KHO.updateMany({
      where: delta < 0 ? { matonkho: row.matonkho, soluong: { gte: -delta } } : { matonkho: row.matonkho },
      data: {
        soluong: delta < 0 ? { decrement: -delta } : { increment: delta },
        ngaycapnhat: new Date(),
      },
    });

    if (result.count === 0) {
      throw new BadRequestException(`Sản phẩm "${tensanpham}" không đủ tồn kho để duyệt đơn`);
    }
  }

  private buildListWhere(filter: FilterOrderDto): Prisma.DON_HANGWhereInput {
    const where: Prisma.DON_HANGWhereInput = {};

    if (filter.trangthai && filter.trangthai !== 'ALL') {
      where.trangthai = filter.trangthai;
    }

    if (filter.fromDate || filter.toDate) {
      where.ngaydat = {};
      if (filter.fromDate) where.ngaydat.gte = new Date(`${filter.fromDate}T00:00:00.000Z`);
      if (filter.toDate) where.ngaydat.lte = new Date(`${filter.toDate}T23:59:59.999Z`);
    }

    return where;
  }

  private async paginate(where: Prisma.DON_HANGWhereInput, filter: FilterOrderDto) {
    const page = Number(filter.page ?? 1);
    const limit = Number(filter.limit ?? 10);

    const [total, items] = await Promise.all([
      this.prisma.dON_HANG.count({ where }),
      this.prisma.dON_HANG.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { ngaydat: 'desc' },
        include: ORDER_INCLUDE,
      }),
    ]);

    return {
      success: true,
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  // ---------------------------------------------------------------------------
  // 1. Đặt hàng: tạo đơn CHO_XAC_NHAN, CHƯA trừ tồn kho
  // ---------------------------------------------------------------------------
  async createOrder(user: AuthUser, dto: CreateOrderDto) {
    const customer = await this.getCustomer(user);

    // Gộp các dòng trùng sản phẩm (bảng chi tiết có UNIQUE madonhang + masanpham)
    const qtyByProduct = new Map<number, number>();
    for (const item of dto.items) {
      qtyByProduct.set(item.masanpham, (qtyByProduct.get(item.masanpham) ?? 0) + item.soluong);
    }
    const ids = [...qtyByProduct.keys()];

    return this.prisma.$transaction(async (tx) => {
      const products = await tx.sAN_PHAM.findMany({
        where: { masanpham: { in: ids } },
        include: { TON_KHO: true },
      });
      const byId = new Map(products.map((p) => [p.masanpham, p]));

      let tongtien = new Prisma.Decimal(0);
      const details: { masanpham: number; soluong: number; dongia: Prisma.Decimal; thanhtien: Prisma.Decimal }[] = [];

      for (const [masanpham, soluong] of qtyByProduct) {
        const product = byId.get(masanpham);
        if (!product) {
          throw new NotFoundException(`Không tìm thấy sản phẩm #${masanpham}`);
        }
        if (product.trangthai !== 'DANG_BAN') {
          throw new BadRequestException(`Sản phẩm "${product.tensanpham}" đã ngừng kinh doanh hoặc hết hàng`);
        }
        const tonkho = product.TON_KHO.reduce((sum, t) => sum + t.soluong, 0);
        if (soluong > tonkho) {
          throw new BadRequestException(
            `Sản phẩm "${product.tensanpham}" chỉ còn ${tonkho} máy, không đủ số lượng ${soluong}`,
          );
        }

        // Giá lấy từ CSDL tại thời điểm đặt (snapshot), không tin giá client gửi lên
        const thanhtien = product.giaban.mul(soluong);
        tongtien = tongtien.add(thanhtien);
        details.push({ masanpham, soluong, dongia: product.giaban, thanhtien });
      }

      return tx.dON_HANG.create({
        data: {
          makhachhang: customer.makhachhang,
          tongtien,
          phuongthucthanhtoan: dto.phuongthucthanhtoan ?? 'COD',
          trangthai: PENDING,
          CHI_TIET_DON_HANG: { create: details },
        },
        include: ORDER_INCLUDE,
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Duyệt đơn: CHO_XAC_NHAN -> DA_XAC_NHAN, trừ kho, lập hóa đơn ISSUED (1 transaction)
  // ---------------------------------------------------------------------------
  async approveOrder(user: AuthUser, madonhang: number) {
    this.assertStaff(user);
    const staff = await this.prisma.nHAN_VIEN.findUnique({ where: { mataikhoan: user.mataikhoan } });

    return this.prisma.$transaction(async (tx) => {
      // "Chiếm" đơn bằng UPDATE có điều kiện trạng thái: 2 nhân viên bấm cùng lúc thì chỉ 1 người thành công
      const claimed = await tx.dON_HANG.updateMany({
        where: { madonhang, trangthai: PENDING },
        data: {
          trangthai: APPROVED,
          manhanvien: staff?.manhanvien ?? null,
          ngayxacnhan: new Date(),
        },
      });

      if (claimed.count === 0) {
        const existing = await tx.dON_HANG.findUnique({ where: { madonhang } });
        if (!existing) throw new NotFoundException(`Không tìm thấy đơn hàng #${madonhang}`);
        throw new ConflictException(
          `Đơn hàng #${madonhang} không ở trạng thái chờ duyệt (hiện tại: ${existing.trangthai})`,
        );
      }

      const details = await tx.cHI_TIET_DON_HANG.findMany({
        where: { madonhang },
        include: { SAN_PHAM: true },
      });

      for (const d of details) {
        if (d.SAN_PHAM.trangthai === 'NGUNG_KINH_DOANH') {
          throw new BadRequestException(`Sản phẩm "${d.SAN_PHAM.tensanpham}" đã ngừng kinh doanh, không thể duyệt đơn`);
        }
        await this.changeStock(tx, d.masanpham, -d.soluong, d.SAN_PHAM.tensanpham);
      }

      // TV5 lập hóa đơn ISSUED trong cùng transaction; lỗi ở đây thì cả đơn + kho đều rollback
      await this.invoices.createInvoice({ madonhang, manhanvien: staff?.manhanvien }, tx);

      return tx.dON_HANG.findUnique({ where: { madonhang }, include: ORDER_INCLUDE });
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Hủy đơn
  //    - Chờ duyệt: khách (đơn của mình) hoặc nhân viên/Admin; không đụng kho, không có hóa đơn
  //    - Đã duyệt: chỉ nhân viên/Admin; hoàn kho + hóa đơn VOID (1 transaction)
  // ---------------------------------------------------------------------------
  async cancelOrder(user: AuthUser, madonhang: number) {
    const staff = isStaff(user);
    const customer = staff ? null : await this.getCustomer(user);

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.dON_HANG.findUnique({
        where: { madonhang },
        include: { CHI_TIET_DON_HANG: { include: { SAN_PHAM: true } } },
      });
      if (!order) throw new NotFoundException(`Không tìm thấy đơn hàng #${madonhang}`);

      if (customer && order.makhachhang !== customer.makhachhang) {
        throw new ForbiddenException('Bạn chỉ được hủy đơn hàng của chính mình');
      }
      if (order.trangthai === CANCELLED) {
        throw new ConflictException(`Đơn hàng #${madonhang} đã được hủy trước đó`);
      }

      const wasApproved = APPROVED_STATES.includes(order.trangthai);
      if (!staff && wasApproved) {
        throw new ForbiddenException('Đơn hàng đã được duyệt, vui lòng liên hệ nhân viên để hủy');
      }

      // UPDATE có điều kiện trạng thái hiện tại: chống hủy 2 lần => chống hoàn kho nhiều lần
      const claimed = await tx.dON_HANG.updateMany({
        where: { madonhang, trangthai: order.trangthai },
        data: { trangthai: CANCELLED },
      });
      if (claimed.count === 0) {
        throw new ConflictException('Đơn hàng vừa được người khác xử lý, vui lòng tải lại trang');
      }

      if (wasApproved) {
        for (const d of order.CHI_TIET_DON_HANG) {
          await this.changeStock(tx, d.masanpham, d.soluong, d.SAN_PHAM.tensanpham);
        }
        await this.invoices.voidInvoice(madonhang, tx);
      }

      return tx.dON_HANG.findUnique({ where: { madonhang }, include: ORDER_INCLUDE });
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Truy vấn
  // ---------------------------------------------------------------------------
  /** "Đơn mua của tôi" (khách) */
  async findMine(user: AuthUser, filter: FilterOrderDto) {
    const customer = await this.getCustomer(user);
    const where = { ...this.buildListWhere(filter), makhachhang: customer.makhachhang };
    return this.paginate(where, filter);
  }

  /** Toàn bộ đơn hàng (nhân viên / Admin) */
  async findAll(user: AuthUser, filter: FilterOrderDto) {
    this.assertStaff(user);
    const where = this.buildListWhere(filter);

    const keyword = filter.search?.trim();
    if (keyword) {
      const num = Number(keyword);
      const or: Prisma.DON_HANGWhereInput[] = [
        { KHACH_HANG: { hoten: { contains: keyword, mode: 'insensitive' } } },
        { KHACH_HANG: { sdt: { contains: keyword } } },
      ];
      if (!isNaN(num)) or.push({ madonhang: num });
      where.OR = or;
    }

    return this.paginate(where, filter);
  }

  async findOne(user: AuthUser, madonhang: number) {
    const order = await this.prisma.dON_HANG.findUnique({
      where: { madonhang },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException(`Không tìm thấy đơn hàng #${madonhang}`);

    if (!isStaff(user)) {
      const customer = await this.getCustomer(user);
      if (order.makhachhang !== customer.makhachhang) {
        throw new ForbiddenException('Bạn chỉ được xem đơn hàng của chính mình');
      }
    }
    return order;
  }
}
