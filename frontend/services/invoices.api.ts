import { ApiError, apiRequest } from '../lib/api-client';

export interface InvoiceDetailItem {
  machitiet: number;
  masanpham: number;
  soluong: number;
  dongia: number;
  thanhtien: number;
  SAN_PHAM?: {
    masanpham: number;
    tensanpham: string;
    dungluong: string;
    mausac: string;
    hinhanh?: string | null;
  };
}

export interface InvoiceItem {
  mahoadon: number;
  madonhang: number;
  ngaylap: string;
  tongtien: number;
  hinhthuctt: string;
  trangthai: 'ISSUED' | 'VOID';
  manhanvien?: number | null;
  NHAN_VIEN?: {
    manhanvien: number;
    hoten: string;
    sdt?: string | null;
  } | null;
  DON_HANG?: {
    madonhang: number;
    makhachhang: number;
    ngaydat: string;
    tongtien: number;
    trangthai: string;
    phuongthucthanhtoan: string;
    KHACH_HANG?: {
      makhachhang: number;
      hoten: string;
      sdt?: string | null;
      diachi?: string | null;
    };
    CHI_TIET_DON_HANG?: InvoiceDetailItem[];
  };
}

export interface InvoiceFilterParams {
  search?: string;
  trangthai?: string;
  hinhthuctt?: string;
  fromDate?: string;
  toDate?: string;
  manhanvien?: number;
  page?: number;
  limit?: number;
}

export interface InvoiceListResponse {
  success: boolean;
  data: InvoiceItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    totalIssued: number;
    totalVoid: number;
    totalIssuedRevenue: number;
  };
}

// Dữ liệu mẫu chuẩn cho 4 trường hợp nghiệp vụ (khi chạy không có backend)
export const DEFAULT_INVOICES: InvoiceItem[] = [
  {
    mahoadon: 1,
    madonhang: 2,
    ngaylap: '2026-11-12T10:20:00.000Z',
    tongtien: 34990000,
    hinhthuctt: 'CHUYEN_KHOAN',
    trangthai: 'ISSUED',
    manhanvien: 1,
    NHAN_VIEN: {
      manhanvien: 1,
      hoten: 'Trần Minh Tuấn',
      sdt: '0901000002',
    },
    DON_HANG: {
      madonhang: 2,
      makhachhang: 2,
      ngaydat: '2026-11-12T10:00:00.000Z',
      tongtien: 34990000,
      trangthai: 'HOAN_THANH',
      phuongthucthanhtoan: 'CHUYEN_KHOAN',
      KHACH_HANG: {
        makhachhang: 2,
        hoten: 'Vũ Ngọc Ánh',
        sdt: '0912345672',
        diachi: '56 Nguyễn Văn Cừ, Quận 5, TP.HCM',
      },
      CHI_TIET_DON_HANG: [
        {
          machitiet: 2,
          masanpham: 1,
          soluong: 1,
          dongia: 34990000,
          thanhtien: 34990000,
          SAN_PHAM: {
            masanpham: 1,
            tensanpham: 'iPhone 16 Pro Max',
            dungluong: '256GB',
            mausac: 'Titan Sa Mạc',
            hinhanh: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
          },
        },
      ],
    },
  },
  {
    mahoadon: 2,
    madonhang: 3,
    ngaylap: '2026-11-14T14:50:00.000Z',
    tongtien: 45480000,
    hinhthuctt: 'COD',
    trangthai: 'ISSUED',
    manhanvien: 2,
    NHAN_VIEN: {
      manhanvien: 2,
      hoten: 'Lê Thị Thu Hà',
      sdt: '0901000003',
    },
    DON_HANG: {
      madonhang: 3,
      makhachhang: 3,
      ngaydat: '2026-11-14T14:30:00.000Z',
      tongtien: 45480000,
      trangthai: 'HOAN_THANH',
      phuongthucthanhtoan: 'COD',
      KHACH_HANG: {
        makhachhang: 3,
        hoten: 'Đặng Quốc Bảo',
        sdt: '0912345673',
        diachi: '102 Hoàng Diệu, Quận 4, TP.HCM',
      },
      CHI_TIET_DON_HANG: [
        {
          machitiet: 3,
          masanpham: 9,
          soluong: 1,
          dongia: 29490000,
          thanhtien: 29490000,
          SAN_PHAM: {
            masanpham: 9,
            tensanpham: 'iPhone 15 Pro Max',
            dungluong: '256GB',
            mausac: 'Titan Tự Nhiên',
            hinhanh: 'https://images.unsplash.com/photo-1695048132832-b41495f12eb4?w=600&q=80',
          },
        },
        {
          machitiet: 4,
          masanpham: 13,
          soluong: 1,
          dongia: 15990000,
          thanhtien: 15990000,
          SAN_PHAM: {
            masanpham: 13,
            tensanpham: 'iPhone 14',
            dungluong: '128GB',
            mausac: 'Tím',
            hinhanh: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
          },
        },
      ],
    },
  },
  {
    mahoadon: 3,
    madonhang: 4,
    ngaylap: '2026-11-05T08:35:00.000Z',
    tongtien: 57980000,
    hinhthuctt: 'CHUYEN_KHOAN',
    trangthai: 'VOID', // Minh chứng hủy hóa đơn khi đơn hàng bị hủy
    manhanvien: 1,
    NHAN_VIEN: {
      manhanvien: 1,
      hoten: 'Trần Minh Tuấn',
      sdt: '0901000002',
    },
    DON_HANG: {
      madonhang: 4,
      makhachhang: 1,
      ngaydat: '2026-11-05T08:00:00.000Z',
      tongtien: 57980000,
      trangthai: 'DA_HUY',
      phuongthucthanhtoan: 'CHUYEN_KHOAN',
      KHACH_HANG: {
        makhachhang: 1,
        hoten: 'Phạm Hoàng Nam',
        sdt: '0912345671',
        diachi: '12 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
      },
      CHI_TIET_DON_HANG: [
        {
          machitiet: 5,
          masanpham: 4,
          soluong: 2,
          dongia: 28990000,
          thanhtien: 57980000,
          SAN_PHAM: {
            masanpham: 4,
            tensanpham: 'iPhone 16 Pro',
            dungluong: '128GB',
            mausac: 'Titan Trắng',
            hinhanh: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
          },
        },
      ],
    },
  },
];

export async function fetchInvoices(params: InvoiceFilterParams = {}): Promise<InvoiceListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.trangthai) query.set('trangthai', params.trangthai);
  if (params.hinhthuctt) query.set('hinhthuctt', params.hinhthuctt);
  if (params.fromDate) query.set('fromDate', params.fromDate);
  if (params.toDate) query.set('toDate', params.toDate);
  if (params.manhanvien) query.set('manhanvien', String(params.manhanvien));
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  try {
    const res = await apiRequest<InvoiceListResponse>(`/invoices?${query.toString()}`);
    return res;
  } catch (error) {
    console.warn('[invoices.api] Sử dụng dữ liệu fallback offline:', error);
    
    // Fallback filter
    let list = [...DEFAULT_INVOICES];
    if (params.trangthai && params.trangthai !== 'ALL') {
      list = list.filter((item) => item.trangthai === params.trangthai);
    }
    if (params.hinhthuctt) {
      list = list.filter((item) => item.hinhthuctt === params.hinhthuctt);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (item) =>
          item.mahoadon.toString().includes(q) ||
          item.madonhang.toString().includes(q) ||
          item.DON_HANG?.KHACH_HANG?.hoten.toLowerCase().includes(q) ||
          item.DON_HANG?.KHACH_HANG?.sdt?.includes(q) ||
          item.NHAN_VIEN?.hoten.toLowerCase().includes(q),
      );
    }

    const totalIssued = list.filter((i) => i.trangthai === 'ISSUED').length;
    const totalVoid = list.filter((i) => i.trangthai === 'VOID').length;
    const totalIssuedRevenue = list
      .filter((i) => i.trangthai === 'ISSUED')
      .reduce((s, i) => s + Number(i.tongtien), 0);

    return {
      success: true,
      data: list,
      meta: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: list.length,
        totalPages: 1,
        totalIssued,
        totalVoid,
        totalIssuedRevenue,
      },
    };
  }
}

export async function fetchInvoiceById(id: number): Promise<InvoiceItem> {
  try {
    return await apiRequest<InvoiceItem>(`/invoices/${id}`);
  } catch (error) {
    const found = DEFAULT_INVOICES.find((i) => i.mahoadon === Number(id));
    if (found) return found;
    throw error;
  }
}

export async function voidInvoice(madonhang: number): Promise<InvoiceItem> {
  return await apiRequest<InvoiceItem>(`/invoices/${madonhang}/void`, {
    method: 'PATCH',
  });
}
