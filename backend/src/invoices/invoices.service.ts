import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { FilterInvoiceDto } from './dto/filter-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lập hóa đơn bán hàng khi đơn hàng được duyệt thành công
   * Hỗ trợ nhận TransactionClient (tx) từ TV4 để chạy trong cùng Prisma Transaction
   */
  async createInvoice(dto: CreateInvoiceDto, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;

    // 1. Kiểm tra đơn hàng có tồn tại không
    const order = await client.dON_HANG.findUnique({
      where: { madonhang: dto.madonhang },
      include: {
        KHACH_HANG: true,
        NHAN_VIEN: true,
        CHI_TIET_DON_HANG: {
          include: {
            SAN_PHAM: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với mã #${dto.madonhang}`);
    }

    if (order.trangthai === 'DA_HUY') {
      throw new BadRequestException('Không thể lập hóa đơn cho đơn hàng đã bị hủy');
    }

    // 2. Kiểm tra xem đơn hàng đã có hóa đơn chưa
    const existingInvoice = await client.hOA_DON.findUnique({
      where: { madonhang: dto.madonhang },
    });

    if (existingInvoice) {
      throw new ConflictException(
        `Đơn hàng #${dto.madonhang} đã có hóa đơn #${existingInvoice.mahoadon}`,
      );
    }

    // 3. Xác định nhân viên lập, tổng tiền và hình thức thanh toán
    const staffId = dto.manhanvien || order.manhanvien || null;
    const tongtien = dto.tongtien !== undefined ? dto.tongtien : Number(order.tongtien);
    const hinhthuctt = dto.hinhthuctt || order.phuongthucthanhtoan || 'COD';
    const trangthai = dto.trangthai || 'ISSUED';

    // 4. Tạo bản ghi hóa đơn
    const invoice = await client.hOA_DON.create({
      data: {
        madonhang: dto.madonhang,
        tongtien,
        hinhthuctt,
        trangthai,
        manhanvien: staffId,
      },
      include: {
        DON_HANG: {
          include: {
            KHACH_HANG: true,
            NHAN_VIEN: true,
            CHI_TIET_DON_HANG: {
              include: {
                SAN_PHAM: true,
              },
            },
          },
        },
        NHAN_VIEN: true,
      },
    });

    return invoice;
  }

  /**
   * Hủy hóa đơn (chuyển sang trạng thái VOID) khi đơn hàng đã duyệt bị hủy
   * Nhận TransactionClient (tx) từ TV4 để bảo đảm an toàn giao dịch
   */
  async voidInvoice(madonhang: number, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;

    const invoice = await client.hOA_DON.findUnique({
      where: { madonhang },
    });

    // Nếu đơn hàng chưa từng có hóa đơn (ví dụ hủy khi còn PENDING) thì không cần VOID
    if (!invoice) {
      return null;
    }

    const updatedInvoice = await client.hOA_DON.update({
      where: { madonhang },
      data: {
        trangthai: 'VOID',
      },
      include: {
        DON_HANG: true,
        NHAN_VIEN: true,
      },
    });

    return updatedInvoice;
  }

  /**
   * Tra cứu danh sách hóa đơn theo khoảng thời gian và tiêu chí lọc
   * Dành cho Nhân viên / Admin
   */
  async findAll(filter: FilterInvoiceDto) {
    const { search, trangthai, hinhthuctt, fromDate, toDate, manhanvien, page = 1, limit = 10 } = filter;

    const where: Prisma.HOA_DONWhereInput = {};

    // Lọc theo trạng thái ISSUED / VOID
    if (trangthai && trangthai !== 'ALL') {
      where.trangthai = trangthai;
    }

    // Lọc theo hình thức thanh toán
    if (hinhthuctt) {
      where.hinhthuctt = hinhthuctt;
    }

    // Lọc theo nhân viên lập
    if (manhanvien) {
      where.manhanvien = Number(manhanvien);
    }

    // Lọc theo khoảng ngày lập
    if (fromDate || toDate) {
      where.ngaylap = {};
      if (fromDate) {
        where.ngaylap.gte = new Date(`${fromDate}T00:00:00.000Z`);
      }
      if (toDate) {
        where.ngaylap.lte = new Date(`${toDate}T23:59:59.999Z`);
      }
    }

    // Tìm kiếm theo từ khóa (Mã HĐ, Mã đơn hàng, Tên khách hàng, SĐT)
    if (search && search.trim().length > 0) {
      const keyword = search.trim();
      const numKeyword = Number(keyword);

      const searchConditions: Prisma.HOA_DONWhereInput[] = [
        {
          DON_HANG: {
            KHACH_HANG: {
              hoten: { contains: keyword, mode: 'insensitive' },
            },
          },
        },
        {
          DON_HANG: {
            KHACH_HANG: {
              sdt: { contains: keyword },
            },
          },
        },
        {
          NHAN_VIEN: {
            hoten: { contains: keyword, mode: 'insensitive' },
          },
        },
      ];

      if (!isNaN(numKeyword)) {
        searchConditions.push(
          { mahoadon: numKeyword },
          { madonhang: numKeyword },
        );
      }

      where.OR = searchConditions;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [total, items, totalIssued, totalVoid, totalRevenueAgg] = await Promise.all([
      this.prisma.hOA_DON.count({ where }),
      this.prisma.hOA_DON.findMany({
        where,
        skip,
        take,
        orderBy: { ngaylap: 'desc' },
        include: {
          DON_HANG: {
            include: {
              KHACH_HANG: true,
              NHAN_VIEN: true,
              CHI_TIET_DON_HANG: {
                include: {
                  SAN_PHAM: true,
                },
              },
            },
          },
          NHAN_VIEN: true,
        },
      }),
      this.prisma.hOA_DON.count({ where: { ...where, trangthai: 'ISSUED' } }),
      this.prisma.hOA_DON.count({ where: { ...where, trangthai: 'VOID' } }),
      this.prisma.hOA_DON.aggregate({
        where: { ...where, trangthai: 'ISSUED' },
        _sum: { tongtien: true },
      }),
    ]);

    return {
      success: true,
      data: items,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
        totalIssued,
        totalVoid,
        totalIssuedRevenue: Number(totalRevenueAgg._sum.tongtien || 0),
      },
    };
  }

  /**
   * Lấy chi tiết một hóa đơn theo mã mahoadon
   */
  async findOne(mahoadon: number) {
    const invoice = await this.prisma.hOA_DON.findUnique({
      where: { mahoadon },
      include: {
        DON_HANG: {
          include: {
            KHACH_HANG: {
              include: {
                TAI_KHOAN: {
                  select: { email: true, tendangnhap: true },
                },
              },
            },
            NHAN_VIEN: true,
            CHI_TIET_DON_HANG: {
              include: {
                SAN_PHAM: {
                  include: {
                    DANH_MUC: true,
                  },
                },
              },
            },
          },
        },
        NHAN_VIEN: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy hóa đơn #${mahoadon}`);
    }

    return invoice;
  }

  /**
   * Tìm hóa đơn theo mã đơn hàng madonhang
   */
  async findByOrder(madonhang: number) {
    const invoice = await this.prisma.hOA_DON.findUnique({
      where: { madonhang },
      include: {
        DON_HANG: {
          include: {
            KHACH_HANG: true,
            NHAN_VIEN: true,
            CHI_TIET_DON_HANG: {
              include: {
                SAN_PHAM: true,
              },
            },
          },
        },
        NHAN_VIEN: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Đơn hàng #${madonhang} chưa được lập hóa đơn`);
    }

    return invoice;
  }
}
