import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FilterReportDto } from './dto/filter-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Chuẩn hóa khoảng thời gian tìm kiếm từ FilterReportDto
   */
  private resolveDateRange(filter: FilterReportDto): { start: Date; end: Date } {
    let start: Date;
    let end: Date;

    if (filter.month && filter.year) {
      const year = Number(filter.year);
      const month = Number(filter.month) - 1; // 0-indexed
      start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
      end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    } else if (filter.startDate || filter.endDate) {
      start = filter.startDate
        ? new Date(`${filter.startDate}T00:00:00.000Z`)
        : new Date('2024-01-01T00:00:00.000Z');
      end = filter.endDate
        ? new Date(`${filter.endDate}T23:59:59.999Z`)
        : new Date();
    } else {
      // Mặc định: 30 ngày gần nhất
      const now = new Date();
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start.setUTCHours(0, 0, 0, 0);
      end = new Date();
      end.setUTCHours(23, 59, 59, 999);
    }

    return { start, end };
  }

  /**
   * 1. Tổng quan Dashboard:
   * - Tổng doanh thu bán ròng (CHỈ tính từ hóa đơn ISSUED, LOẠI BỎ hóa đơn VOID)
   * - Tổng số đơn hàng, đơn thành công, đơn hủy, tỷ lệ hủy (%)
   * - Tổng số lượng máy iPhone đã bán
   */
  async getDashboardSummary(filter: FilterReportDto) {
    const { start, end } = this.resolveDateRange(filter);

    // Lấy tất cả hóa đơn hợp lệ (ISSUED) trong kỳ
    const issuedInvoices = await this.prisma.hOA_DON.findMany({
      where: {
        trangthai: 'ISSUED',
        ngaylap: { gte: start, lte: end },
      },
      include: {
        DON_HANG: {
          include: {
            CHI_TIET_DON_HANG: true,
          },
        },
      },
    });

    // Lấy số hóa đơn bị VOID trong kỳ
    const voidInvoicesCount = await this.prisma.hOA_DON.count({
      where: {
        trangthai: 'VOID',
        ngaylap: { gte: start, lte: end },
      },
    });

    // Tính tổng doanh thu ròng từ các hóa đơn ISSUED
    const netRevenue = issuedInvoices.reduce(
      (sum, inv) => sum + Number(inv.tongtien),
      0,
    );

    // Tính tổng số lượng máy bán ra từ các hóa đơn ISSUED
    const totalSoldQuantity = issuedInvoices.reduce((sum, inv) => {
      const items = inv.DON_HANG?.CHI_TIET_DON_HANG || [];
      const orderQty = items.reduce((s, it) => s + it.soluong, 0);
      return sum + orderQty;
    }, 0);

    // Thống kê đơn hàng trong kỳ
    const allOrdersInPeriod = await this.prisma.dON_HANG.findMany({
      where: {
        ngaydat: { gte: start, lte: end },
      },
      select: {
        madonhang: true,
        trangthai: true,
        tongtien: true,
      },
    });

    const totalOrders = allOrdersInPeriod.length;
    const completedOrders = allOrdersInPeriod.filter(
      (o) => o.trangthai === 'HOAN_THANH' || o.trangthai === 'DA_XAC_NHAN',
    ).length;
    const pendingOrders = allOrdersInPeriod.filter(
      (o) => o.trangthai === 'CHO_XAC_NHAN',
    ).length;
    const cancelledOrders = allOrdersInPeriod.filter(
      (o) => o.trangthai === 'DA_HUY',
    ).length;

    const cancellationRate =
      totalOrders > 0
        ? Number(((cancelledOrders / totalOrders) * 100).toFixed(2))
        : 0;

    const averageOrderValue =
      issuedInvoices.length > 0
        ? Math.round(netRevenue / issuedInvoices.length)
        : 0;

    return {
      success: true,
      data: {
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        revenue: {
          netRevenue, // Doanh thu ròng (chỉ ISSUED)
          averageOrderValue,
          issuedInvoiceCount: issuedInvoices.length,
          voidInvoiceCount: voidInvoicesCount,
        },
        orders: {
          totalOrders,
          completedOrders,
          pendingOrders,
          cancelledOrders,
          cancellationRate, // % đơn hủy
        },
        products: {
          totalSoldQuantity, // Tổng máy bán
        },
      },
    };
  }

  /**
   * 2. Biểu đồ biến động doanh thu theo thời gian (Line/Bar Chart)
   */
  async getRevenueTrend(filter: FilterReportDto) {
    const { start, end } = this.resolveDateRange(filter);

    const invoices = await this.prisma.hOA_DON.findMany({
      where: {
        trangthai: 'ISSUED',
        ngaylap: { gte: start, lte: end },
      },
      select: {
        ngaylap: true,
        tongtien: true,
      },
      orderBy: { ngaylap: 'asc' },
    });

    // Nhóm theo ngày (YYYY-MM-DD)
    const mapByDate = new Map<string, { revenue: number; orderCount: number }>();

    for (const inv of invoices) {
      const dateKey = inv.ngaylap.toISOString().slice(0, 10);
      const current = mapByDate.get(dateKey) || { revenue: 0, orderCount: 0 };
      mapByDate.set(dateKey, {
        revenue: current.revenue + Number(inv.tongtien),
        orderCount: current.orderCount + 1,
      });
    }

    const labels: string[] = [];
    const revenueData: number[] = [];
    const ordersData: number[] = [];

    // Duyệt qua từng ngày trong khoảng thời gian để tạo chuỗi dữ liệu liền mạch
    const cur = new Date(start);
    while (cur <= end) {
      const dateStr = cur.toISOString().slice(0, 10);
      labels.push(dateStr);
      const val = mapByDate.get(dateStr) || { revenue: 0, orderCount: 0 };
      revenueData.push(val.revenue);
      ordersData.push(val.orderCount);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    return {
      success: true,
      data: {
        labels,
        datasets: {
          revenues: revenueData,
          orders: ordersData,
        },
      },
    };
  }

  /**
   * 3. Danh sách Top 5 sản phẩm bán chạy nhất
   * Tính từ các đơn hàng có hóa đơn ISSUED, loại bỏ hoàn toàn hóa đơn VOID
   */
  async getTopSellingProducts(limit = 5, filter?: FilterReportDto) {
    const { start, end } = filter
      ? this.resolveDateRange(filter)
      : this.resolveDateRange({});

    const issuedInvoices = await this.prisma.hOA_DON.findMany({
      where: {
        trangthai: 'ISSUED',
        ngaylap: { gte: start, lte: end },
      },
      select: {
        DON_HANG: {
          select: {
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
      },
    });

    const productMap = new Map<
      number,
      {
        masanpham: number;
        tensanpham: string;
        dungluong: string;
        mausac: string;
        giaban: number;
        hinhanh: string | null;
        tendanhmuc: string;
        soldQuantity: number;
        totalRevenue: number;
      }
    >();

    for (const inv of issuedInvoices) {
      const items = inv.DON_HANG?.CHI_TIET_DON_HANG || [];
      for (const it of items) {
        const sp = it.SAN_PHAM;
        if (!sp) continue;

        const current = productMap.get(sp.masanpham) || {
          masanpham: sp.masanpham,
          tensanpham: sp.tensanpham,
          dungluong: sp.dungluong,
          mausac: sp.mausac,
          giaban: Number(sp.giaban),
          hinhanh: sp.hinhanh,
          tendanhmuc: sp.DANH_MUC?.tendanhmuc || '',
          soldQuantity: 0,
          totalRevenue: 0,
        };

        current.soldQuantity += it.soluong;
        current.totalRevenue += Number(it.thanhtien);
        productMap.set(sp.masanpham, current);
      }
    }

    const sorted = Array.from(productMap.values())
      .sort((a, b) => b.soldQuantity - a.soldQuantity || b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    return {
      success: true,
      data: sorted,
    };
  }

  /**
   * 4. Thống kê theo hình thức thanh toán & trạng thái đơn hàng (Doughnut/Pie Chart)
   */
  async getPaymentAndOrderStatusStats(filter: FilterReportDto) {
    const { start, end } = this.resolveDateRange(filter);

    const [invoices, orders] = await Promise.all([
      this.prisma.hOA_DON.findMany({
        where: {
          trangthai: 'ISSUED',
          ngaylap: { gte: start, lte: end },
        },
        select: {
          hinhthuctt: true,
          tongtien: true,
        },
      }),
      this.prisma.dON_HANG.findMany({
        where: {
          ngaydat: { gte: start, lte: end },
        },
        select: {
          trangthai: true,
        },
      }),
    ]);

    // Thống kê phương thức thanh toán
    let codCount = 0;
    let codRevenue = 0;
    let bankCount = 0;
    let bankRevenue = 0;

    for (const inv of invoices) {
      if (inv.hinhthuctt === 'CHUYEN_KHOAN') {
        bankCount++;
        bankRevenue += Number(inv.tongtien);
      } else {
        codCount++;
        codRevenue += Number(inv.tongtien);
      }
    }

    // Thống kê trạng thái đơn
    let completed = 0;
    let pending = 0;
    let cancelled = 0;

    for (const o of orders) {
      if (o.trangthai === 'HOAN_THANH' || o.trangthai === 'DA_XAC_NHAN') {
        completed++;
      } else if (o.trangthai === 'DA_HUY') {
        cancelled++;
      } else {
        pending++;
      }
    }

    return {
      success: true,
      data: {
        paymentMethods: {
          cod: { count: codCount, revenue: codRevenue },
          transfer: { count: bankCount, revenue: bankRevenue },
        },
        orderStatuses: {
          completed,
          pending,
          cancelled,
          total: orders.length,
        },
      },
    };
  }

  /**
   * 5. Lưu bản ghi báo cáo vào bảng BAO_CAO_DOANH_THU
   */
  async createReportSnapshot(filter: FilterReportDto) {
    const { start, end } = this.resolveDateRange(filter);
    const summary = await this.getDashboardSummary(filter);

    const record = await this.prisma.bAO_CAO_DOANH_THU.create({
      data: {
        ngaybatdau: start,
        ngayketthuc: end,
        tongdoanhthu: summary.data.revenue.netRevenue,
        tongsodonhang: summary.data.orders.completedOrders,
        soluongsanphamdaban: summary.data.products.totalSoldQuantity,
      },
    });

    return {
      success: true,
      data: record,
    };
  }
}
