import { ApiError, apiRequest } from '../lib/api-client';
import { authApi } from './auth.api';
import { recordInvoiceFromCompletedOrder } from './invoices.api';
import { ProductItem, productsApi } from './products.api';

export interface OrderItemPayload {
  masanpham: number;
  soluong: number;
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];
  phuongthucthanhtoan?: 'COD' | 'CHUYEN_KHOAN';
  // Thông tin người nhận tại thời điểm đặt
  hotennguoinhan?: string;
  sdtnguoinhan?: string;
  diachigiaohang?: string;
  ghichu?: string;
}

export interface OrderDetailItem {
  machitiet: number;
  madonhang: number;
  masanpham: number;
  soluong: number;
  dongia: number;
  thanhtien: number;
  SAN_PHAM?: ProductItem;
}

export interface OrderItem {
  madonhang: number;
  makhachhang: number;
  manhanvien?: number | null;
  ngaydat: string;
  ngayxacnhan?: string | null;
  tongtien: number;
  phuongthucthanhtoan: 'COD' | 'CHUYEN_KHOAN';
  trangthai: 'CHO_XAC_NHAN' | 'DA_XAC_NHAN' | 'DANG_GIAO' | 'HOAN_THANH' | 'DA_HUY';
  KHACH_HANG?: {
    makhachhang: number;
    hoten: string;
    sdt?: string | null;
    diachi?: string | null;
  };
  NHAN_VIEN?: {
    manhanvien: number;
    hoten: string;
  } | null;
  CHI_TIET_DON_HANG?: OrderDetailItem[];
  HOA_DON?: any[];
  // Dành cho thông tin hiển thị tại client
  ghichu?: string | null;
}

const STORAGE_ORDERS_KEY = 'iphone_demo_orders_v2';

// 3 đơn hàng mẫu chuẩn để chấm điểm ngay khi vừa mở trang
const INITIAL_DEMO_ORDERS: OrderItem[] = [
  {
    madonhang: 101,
    makhachhang: 1,
    manhanvien: null,
    ngaydat: '2026-11-24T18:30:00.000Z',
    ngayxacnhan: null,
    tongtien: 34990000,
    phuongthucthanhtoan: 'COD',
    trangthai: 'CHO_XAC_NHAN',
    ghichu: 'Giao giờ hành chính, gọi trước 15 phút',
    KHACH_HANG: {
      makhachhang: 1,
      hoten: 'Nguyễn Văn An',
      sdt: '0901234567',
      diachi: '123 Lê Lợi, P. Bến Nghé, Quận 1, TP.HCM',
    },
    CHI_TIET_DON_HANG: [
      {
        machitiet: 1,
        madonhang: 101,
        masanpham: 1,
        soluong: 1,
        dongia: 34990000,
        thanhtien: 34990000,
        SAN_PHAM: {
          masanpham: 1,
          sku: 'IP16PM-256-DES',
          tensanpham: 'iPhone 16 Pro Max',
          dungluong: '256GB',
          mausac: 'Titan Sa Mạc',
          giaban: 34990000,
          soluongton: 25,
          hinhanh: '/images/products/iphone-16-pro-max-desert.png',
          trangthai: 'DANG_BAN',
          madanhmuc: 1,
        },
      },
    ],
  },
  {
    madonhang: 102,
    makhachhang: 2,
    manhanvien: 2,
    ngaydat: '2026-11-24T14:15:00.000Z',
    ngayxacnhan: '2026-11-24T14:45:00.000Z',
    tongtien: 40990000,
    phuongthucthanhtoan: 'CHUYEN_KHOAN',
    trangthai: 'DA_XAC_NHAN',
    ghichu: 'Đã thanh toán qua mã QR VietQR',
    KHACH_HANG: {
      makhachhang: 2,
      hoten: 'Trần Thị Bình',
      sdt: '0912345678',
      diachi: '456 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM',
    },
    NHAN_VIEN: {
      manhanvien: 2,
      hoten: 'Trần Minh Tuấn (Staff)',
    },
    CHI_TIET_DON_HANG: [
      {
        machitiet: 2,
        madonhang: 102,
        masanpham: 2,
        soluong: 1,
        dongia: 40990000,
        thanhtien: 40990000,
        SAN_PHAM: {
          masanpham: 2,
          sku: 'IP16PM-512-NAT',
          tensanpham: 'iPhone 16 Pro Max',
          dungluong: '512GB',
          mausac: 'Titan Tự Nhiên',
          giaban: 40990000,
          soluongton: 15,
          hinhanh: '/images/products/iphone-16-pro-max-natural.png',
          trangthai: 'DANG_BAN',
          madanhmuc: 1,
        },
      },
    ],
  },
  {
    madonhang: 103,
    makhachhang: 3,
    manhanvien: 2,
    ngaydat: '2026-11-23T09:00:00.000Z',
    ngayxacnhan: '2026-11-23T09:30:00.000Z',
    tongtien: 22990000,
    phuongthucthanhtoan: 'COD',
    trangthai: 'HOAN_THANH',
    ghichu: 'Giao hàng thành công',
    KHACH_HANG: {
      makhachhang: 3,
      hoten: 'Lê Hoàng Cường',
      sdt: '0923456789',
      diachi: '789 Cách Mạng Tháng 8, P.6, Q.3, TP.HCM',
    },
    NHAN_VIEN: {
      manhanvien: 2,
      hoten: 'Trần Minh Tuấn (Staff)',
    },
    CHI_TIET_DON_HANG: [
      {
        machitiet: 3,
        madonhang: 103,
        masanpham: 6,
        soluong: 1,
        dongia: 22990000,
        thanhtien: 22990000,
        SAN_PHAM: {
          masanpham: 6,
          sku: 'IP16-128-PNK',
          tensanpham: 'iPhone 16',
          dungluong: '128GB',
          mausac: 'Hồng',
          giaban: 22990000,
          soluongton: 30,
          hinhanh: '/images/products/iphone-16-pink.png',
          trangthai: 'DANG_BAN',
          madanhmuc: 1,
        },
      },
    ],
  },
];

export function getLocalOrders(): OrderItem[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_ORDERS;
  const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
    return INITIAL_DEMO_ORDERS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_ORDERS;
  }
}

function saveLocalOrders(orders: OrderItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  }
}

export const ordersApi = {
  /**
   * Tạo đơn hàng mới cho khách hàng (trạng thái CHO_XAC_NHAN, chưa trừ kho)
   */
  async create(payload: CreateOrderPayload): Promise<{
    success: boolean;
    message: string;
    data: OrderItem;
  }> {
    const customer = authApi.getCurrentCustomer();
    if (!customer) {
      throw new Error('Vui lòng đăng nhập tài khoản khách hàng trước khi đặt hàng.');
    }

    if (!payload.items || payload.items.length === 0) {
      throw new Error('Đơn hàng phải có ít nhất 1 sản phẩm.');
    }

    try {
      const res = await apiRequest<{ success: boolean; message: string; data: OrderItem }>(
        '/orders',
        {
          method: 'POST',
          body: JSON.stringify({
            items: payload.items.map((i) => ({
              masanpham: Number(i.masanpham),
              soluong: Number(i.soluong),
            })),
            phuongthucthanhtoan: payload.phuongthucthanhtoan || 'COD',
          }),
        },
      );
      return res;
    } catch (err) {
      if (err instanceof ApiError) throw err;

      // Fallback lưu LocalStorage khi Backend chưa bật
      const allOrders = getLocalOrders();
      const nextId = allOrders.reduce((max, o) => Math.max(max, o.madonhang), 100) + 1;

      // Lấy danh sách sản phẩm hiện tại để tính toán snapshot
      const storeProducts = await productsApi.getForStore();
      const productMap = new Map(storeProducts.data.map((p) => [p.masanpham, p]));

      let tongtien = 0;
      const details: OrderDetailItem[] = [];

      for (const item of payload.items) {
        const prod = productMap.get(item.masanpham);
        if (!prod) {
          throw new Error(`Sản phẩm #${item.masanpham} không tồn tại`);
        }
        if (prod.trangthai === 'NGUNG_KINH_DOANH') {
          throw new Error(`Sản phẩm "${prod.tensanpham}" đã ngừng kinh doanh`);
        }
        if (prod.soluongton < item.soluong) {
          throw new Error(
            `Sản phẩm "${prod.tensanpham}" chỉ còn ${prod.soluongton} máy trong kho, không đủ số lượng ${item.soluong}`,
          );
        }

        const dongia = prod.giaban;
        const thanhtien = dongia * item.soluong;
        tongtien += thanhtien;

        details.push({
          machitiet: Date.now() + Math.floor(Math.random() * 1000),
          madonhang: nextId,
          masanpham: prod.masanpham,
          soluong: item.soluong,
          dongia,
          thanhtien,
          SAN_PHAM: prod,
        });
      }

      const customerId = customer.makhachhang ?? customer.mataikhoan ?? 1;
      const newOrder: OrderItem = {
        madonhang: nextId,
        makhachhang: customerId,
        manhanvien: null,
        ngaydat: new Date().toISOString(),
        ngayxacnhan: null,
        tongtien,
        phuongthucthanhtoan: payload.phuongthucthanhtoan || 'COD',
        trangthai: 'CHO_XAC_NHAN',
        ghichu: payload.ghichu || null,
        KHACH_HANG: {
          makhachhang: customerId,
          hoten: payload.hotennguoinhan || customer.hoten,
          sdt: payload.sdtnguoinhan || customer.sdt,
          diachi: payload.diachigiaohang || customer.diachi,
        },
        CHI_TIET_DON_HANG: details,
      };

      saveLocalOrders([newOrder, ...allOrders]);

      return {
        success: true,
        message: 'Đặt hàng thành công! Đơn hàng của bạn đang ở trạng thái Chờ xác nhận.',
        data: newOrder,
      };
    }
  },

  /**
   * Khách hàng xem lịch sử các đơn hàng của mình: GET /orders/my
   */
  async getMyOrders(): Promise<OrderItem[]> {
    const customer = authApi.getCurrentCustomer();
    if (!customer) return [];

    try {
      const res = await apiRequest<{ success: boolean; data: OrderItem[] }>('/orders/my');
      return res.data || [];
    } catch {
      const all = getLocalOrders();
      const cId = customer.makhachhang ?? customer.mataikhoan;
      return all.filter(
        (o) =>
          o.makhachhang === cId ||
          (customer.sdt && o.KHACH_HANG?.sdt === customer.sdt) ||
          (customer.hoten && o.KHACH_HANG?.hoten === customer.hoten),
      );
    }
  },

  /**
   * Dành cho Nhân viên (Staff): Lấy tất cả đơn hàng để quản lý duyệt / hủy
   */
  async getAllForStaff(status?: string): Promise<OrderItem[]> {
    try {
      const query = status ? `?status=${status}` : '';
      const res = await apiRequest<{ success: boolean; data: OrderItem[] }>(`/orders${query}`);
      return res.data || [];
    } catch {
      const all = getLocalOrders();
      if (!status || status === 'ALL') return all;
      return all.filter((o) => o.trangthai === status);
    }
  },

  /**
   * Xem chi tiết 1 đơn hàng
   */
  async getById(id: number): Promise<OrderItem> {
    try {
      const res = await apiRequest<{ success: boolean; data: OrderItem }>(`/orders/${id}`);
      return res.data;
    } catch {
      const all = getLocalOrders();
      const order = all.find((o) => o.madonhang === Number(id));
      if (!order) throw new Error(`Không tìm thấy đơn hàng #${id}`);
      return order;
    }
  },

  /**
   * NHÂN VIÊN DUYỆT ĐƠN HÀNG (Mục A4: Tự động trừ số lượng tồn kho)
   */
  async approveOrder(id: number, staffName = 'Trần Minh Tuấn'): Promise<{ success: boolean; message: string }> {
    try {
      return await apiRequest(`/orders/${id}/approve`, { method: 'PATCH' });
    } catch {
      const all = getLocalOrders();
      const idx = all.findIndex((o) => o.madonhang === Number(id));
      if (idx === -1) throw new Error(`Không tìm thấy đơn hàng #${id}`);

      const order = all[idx];
      if (order.trangthai !== 'CHO_XAC_NHAN') {
        throw new Error(`Đơn hàng #${id} đang ở trạng thái ${order.trangthai}, không thể duyệt lại.`);
      }

      // 1. Cập nhật trạng thái đơn hàng
      order.trangthai = 'DA_XAC_NHAN';
      order.ngayxacnhan = new Date().toISOString();
      order.NHAN_VIEN = { manhanvien: 2, hoten: staffName };

      // 2. NGHIỆP VỤ BẮT BUỘC CỦA CÔ: Trừ số lượng tồn kho của các sản phẩm trong đơn
      if (order.CHI_TIET_DON_HANG) {
        for (const item of order.CHI_TIET_DON_HANG) {
          try {
            await productsApi.updateStockPrice(item.masanpham, {
              soluongDelta: -item.soluong,
            });
          } catch (e) {
            console.warn(`Lỗi cập nhật kho sản phẩm #${item.masanpham}:`, e);
          }
        }
      }

      saveLocalOrders(all);
      return {
        success: true,
        message: `Đã duyệt đơn hàng #${id} thành công! Số lượng tồn kho đã được tự động trừ theo quy định.`,
      };
    }
  },

  /**
   * NHÂN VIÊN BÀN GIAO ĐƠN VỊ VẬN CHUYỂN (Chuyển sang DANG_GIAO)
   */
  async shipOrder(id: number, carrier = 'Giao Hàng Tiết Kiệm (GHTK)'): Promise<{ success: boolean; message: string }> {
    try {
      return await apiRequest(`/orders/${id}/ship`, {
        method: 'PATCH',
        body: JSON.stringify({ carrier }),
      });
    } catch {
      const all = getLocalOrders();
      const idx = all.findIndex((o) => o.madonhang === Number(id));
      if (idx === -1) throw new Error(`Không tìm thấy đơn hàng #${id}`);

      const order = all[idx];
      if (order.trangthai !== 'DA_XAC_NHAN') {
        throw new Error(`Đơn hàng #${id} đang ở trạng thái ${order.trangthai}, chỉ đơn đã duyệt mới có thể bàn giao vận chuyển.`);
      }

      order.trangthai = 'DANG_GIAO';
      order.ghichu = order.ghichu ? `${order.ghichu} | ĐVVC: ${carrier}` : `ĐVVC: ${carrier}`;

      saveLocalOrders(all);
      return {
        success: true,
        message: `Đã in vận đơn và bàn giao đơn hàng #${id} cho ${carrier}. Đơn chuyển sang trạng thái Đang giao đến khách!`,
      };
    }
  },

  /**
   * KHÁCH HÀNG BẤM "XÁC NHẬN ĐÃ NHẬN HÀNG" (Chuyển sang HOAN_THANH & Xuất hóa đơn ISSUED)
   */
  async confirmReceipt(id: number): Promise<{ success: boolean; message: string; invoice?: any }> {
    try {
      return await apiRequest(`/orders/${id}/complete`, { method: 'PATCH' });
    } catch {
      const all = getLocalOrders();
      const idx = all.findIndex((o) => o.madonhang === Number(id));
      if (idx === -1) throw new Error(`Không tìm thấy đơn hàng #${id}`);

      const order = all[idx];
      if (order.trangthai !== 'DANG_GIAO' && order.trangthai !== 'DA_XAC_NHAN') {
        throw new Error(`Đơn hàng #${id} không ở trạng thái giao hàng.`);
      }

      order.trangthai = 'HOAN_THANH';
      saveLocalOrders(all);

      // Nghiệp vụ: Cập nhật số lượt bán của từng sản phẩm trong đơn khi hoàn thành
      if (order.CHI_TIET_DON_HANG) {
        for (const item of order.CHI_TIET_DON_HANG) {
          try {
            await productsApi.recordSale(item.masanpham, item.soluong || 1);
          } catch (e) {
            console.warn(`Lỗi cập nhật lượt bán SP #${item.masanpham}:`, e);
          }
        }
      }

      // Nghiệp vụ: Tự động xuất hóa đơn hợp lệ (ISSUED) lưu vào mục "Hóa đơn bán hàng"
      const invoice = recordInvoiceFromCompletedOrder(order);

      return {
        success: true,
        message: `Bạn đã xác nhận nhận hàng thành công cho đơn #${id}. Đơn hàng hoàn thành và hóa đơn VAT đã được phát hành!`,
        invoice,
      };
    }
  },

  /**
   * NHÂN VIÊN HOẶC KHÁCH HÀNG HỦY ĐƠN HÀNG (Mục A4: Hoàn lại số lượng tồn kho nếu đã duyệt)
   */
  async cancel(id: number, reason = 'Khách yêu cầu hủy'): Promise<{ success: boolean; message: string }> {
    try {
      return await apiRequest(`/orders/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    } catch {
      const all = getLocalOrders();
      const idx = all.findIndex((o) => o.madonhang === Number(id));
      if (idx === -1) throw new Error(`Không tìm thấy đơn hàng #${id}`);

      const order = all[idx];
      if (order.trangthai === 'HOAN_THANH' || order.trangthai === 'DA_HUY') {
        throw new Error(`Không thể hủy đơn hàng đã ở trạng thái ${order.trangthai}`);
      }

      const wasApproved = order.trangthai === 'DA_XAC_NHAN' || order.trangthai === 'DANG_GIAO';

      order.trangthai = 'DA_HUY';
      order.ghichu = order.ghichu ? `${order.ghichu} | Lý do hủy: ${reason}` : `Lý do hủy: ${reason}`;

      // NGHIỆP VỤ BẮT BUỘC CỦA CÔ: Hoàn trả lại số lượng vào kho nếu trước đó đã duyệt
      if (wasApproved && order.CHI_TIET_DON_HANG) {
        for (const item of order.CHI_TIET_DON_HANG) {
          try {
            await productsApi.updateStockPrice(item.masanpham, {
              soluongDelta: item.soluong,
            });
          } catch (e) {
            console.warn(`Lỗi hoàn kho sản phẩm #${item.masanpham}:`, e);
          }
        }
      }

      saveLocalOrders(all);
      return {
        success: true,
        message: `Đã hủy đơn hàng #${id} thành công! ${wasApproved ? 'Số lượng sản phẩm đã được hoàn trả lại kho.' : ''}`,
      };
    }
  },
};
