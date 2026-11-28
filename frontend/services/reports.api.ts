import { apiRequest } from '../lib/api-client';
import { getLocalInvoices } from './invoices.api';
import { getLocalOrders } from './orders.api';

export interface ReportFilterParams {
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
  period?: 'day' | 'month' | 'year';
}

export interface DashboardSummaryData {
  dateRange: {
    start: string;
    end: string;
  };
  revenue: {
    netRevenue: number;
    averageOrderValue: number;
    issuedInvoiceCount: number;
    voidInvoiceCount: number;
  };
  orders: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    cancellationRate: number;
  };
  products: {
    totalSoldQuantity: number;
  };
}

export interface RevenueTrendData {
  labels: string[];
  datasets: {
    revenues: number[];
    orders: number[];
  };
}

export interface TopProductItem {
  masanpham: number;
  tensanpham: string;
  dungluong: string;
  mausac: string;
  giaban: number;
  hinhanh?: string | null;
  tendanhmuc: string;
  soldQuantity: number;
  totalRevenue: number;
}

export interface PaymentAndStatusData {
  paymentMethods: {
    cod: { count: number; revenue: number };
    transfer: { count: number; revenue: number };
  };
  orderStatuses: {
    completed: number;
    pending: number;
    cancelled: number;
    total: number;
  };
}

// Fallback data khi chưa bật backend
const FALLBACK_SUMMARY: DashboardSummaryData = {
  dateRange: {
    start: '2026-11-01T00:00:00.000Z',
    end: '2026-11-30T23:59:59.999Z',
  },
  revenue: {
    netRevenue: 80470000, // 34.990.000 + 45.480.000 (đã trừ hóa đơn VOID 57.980.000)
    averageOrderValue: 40235000,
    issuedInvoiceCount: 2,
    voidInvoiceCount: 1,
  },
  orders: {
    totalOrders: 5,
    completedOrders: 2,
    pendingOrders: 1,
    cancelledOrders: 2, // Đơn #4 (hủy sau duyệt) + Đơn #5 (hủy lúc pending)
    cancellationRate: 40.0, // 2 / 5 = 40%
  },
  products: {
    totalSoldQuantity: 3, // 1 máy SP #1 + 1 máy SP #9 + 1 máy SP #13
  },
};

const FALLBACK_TREND: RevenueTrendData = {
  labels: [
    '2026-11-01',
    '2026-11-03',
    '2026-11-05',
    '2026-11-08',
    '2026-11-10',
    '2026-11-12',
    '2026-11-14',
    '2026-11-16',
    '2026-11-18',
    '2026-11-20',
  ],
  datasets: {
    revenues: [0, 0, 0, 0, 0, 34990000, 45480000, 0, 0, 0],
    orders: [0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  },
};

const FALLBACK_TOP_PRODUCTS: TopProductItem[] = [
  {
    masanpham: 1,
    tensanpham: 'iPhone 16 Pro Max',
    dungluong: '256GB',
    mausac: 'Titan Sa Mạc',
    giaban: 34990000,
    tendanhmuc: 'iPhone 16 Series',
    hinhanh: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
    soldQuantity: 1,
    totalRevenue: 34990000,
  },
  {
    masanpham: 9,
    tensanpham: 'iPhone 15 Pro Max',
    dungluong: '256GB',
    mausac: 'Titan Tự Nhiên',
    giaban: 29490000,
    tendanhmuc: 'iPhone 15 Series',
    hinhanh: 'https://images.unsplash.com/photo-1695048132832-b41495f12eb4?w=600&q=80',
    soldQuantity: 1,
    totalRevenue: 29490000,
  },
  {
    masanpham: 13,
    tensanpham: 'iPhone 14',
    dungluong: '128GB',
    mausac: 'Tím',
    giaban: 15990000,
    tendanhmuc: 'iPhone 14 Series',
    hinhanh: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
    soldQuantity: 1,
    totalRevenue: 15990000,
  },
];

const FALLBACK_PAYMENT_STATUS: PaymentAndStatusData = {
  paymentMethods: {
    cod: { count: 1, revenue: 45480000 },
    transfer: { count: 1, revenue: 34990000 },
  },
  orderStatuses: {
    completed: 2,
    pending: 1,
    cancelled: 2,
    total: 5,
  },
};

export async function fetchDashboardSummary(
  params: ReportFilterParams = {},
): Promise<{ success: boolean; data: DashboardSummaryData }> {
  const query = new URLSearchParams();
  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);
  if (params.month) query.set('month', String(params.month));
  if (params.year) query.set('year', String(params.year));

  try {
    return await apiRequest(`/reports/summary?${query.toString()}`);
  } catch (error) {
    console.warn('[reports.api] Fallback summary tính toán trực tiếp từ CSDL:', error);
    const invoices = getLocalInvoices();
    const orders = getLocalOrders();

    const issuedInvoices = invoices.filter((i) => i.trangthai === 'ISSUED');
    const voidInvoices = invoices.filter((i) => i.trangthai === 'VOID');
    const netRevenue = issuedInvoices.reduce((sum, i) => sum + Number(i.tongtien), 0);
    const issuedInvoiceCount = issuedInvoices.length;
    const voidInvoiceCount = voidInvoices.length;
    const averageOrderValue = issuedInvoiceCount > 0 ? Math.round(netRevenue / issuedInvoiceCount) : 0;

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.trangthai === 'HOAN_THANH').length;
    const pendingOrders = orders.filter((o) => o.trangthai === 'CHO_XAC_NHAN').length;
    const cancelledOrders = orders.filter((o) => o.trangthai === 'DA_HUY').length;
    const cancellationRate = totalOrders > 0 ? Number(((cancelledOrders / totalOrders) * 100).toFixed(1)) : 0;

    let totalSoldQuantity = 0;
    orders.forEach((o) => {
      if (o.trangthai === 'HOAN_THANH' || o.trangthai === 'DA_XAC_NHAN' || o.trangthai === 'DANG_GIAO') {
        o.CHI_TIET_DON_HANG?.forEach((ct) => {
          totalSoldQuantity += ct.soluong || 1;
        });
      }
    });

    return {
      success: true,
      data: {
        dateRange: {
          start: '2026-11-01T00:00:00.000Z',
          end: '2026-11-30T23:59:59.999Z',
        },
        revenue: {
          netRevenue,
          averageOrderValue,
          issuedInvoiceCount,
          voidInvoiceCount,
        },
        orders: {
          totalOrders,
          completedOrders,
          pendingOrders,
          cancelledOrders,
          cancellationRate,
        },
        products: {
          totalSoldQuantity,
        },
      },
    };
  }
}

export async function fetchRevenueTrend(
  params: ReportFilterParams = {},
): Promise<{ success: boolean; data: RevenueTrendData }> {
  const query = new URLSearchParams();
  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);
  if (params.month) query.set('month', String(params.month));
  if (params.year) query.set('year', String(params.year));

  try {
    return await apiRequest(`/reports/revenue-trend?${query.toString()}`);
  } catch (error) {
    console.warn('[reports.api] Fallback revenue trend:', error);
    return { success: true, data: FALLBACK_TREND };
  }
}

export async function fetchTopSellingProducts(
  limit = 5,
  params: ReportFilterParams = {},
): Promise<{ success: boolean; data: TopProductItem[] }> {
  const query = new URLSearchParams();
  query.set('limit', String(limit));
  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);

  try {
    return await apiRequest(`/reports/top-products?${query.toString()}`);
  } catch (error) {
    console.warn('[reports.api] Fallback top products:', error);
    return { success: true, data: FALLBACK_TOP_PRODUCTS };
  }
}

export async function fetchPaymentAndStatusStats(
  params: ReportFilterParams = {},
): Promise<{ success: boolean; data: PaymentAndStatusData }> {
  const query = new URLSearchParams();
  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);

  try {
    return await apiRequest(`/reports/payment-and-status?${query.toString()}`);
  } catch (error) {
    console.warn('[reports.api] Fallback payment & status:', error);
    return { success: true, data: FALLBACK_PAYMENT_STATUS };
  }
}
