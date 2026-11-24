import { ApiError, apiRequest } from '../lib/api-client';
import { authApi } from './auth.api';
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

const STORAGE_ORDERS_KEY = 'iphone_demo_orders_v1';

function getLocalOrders(): OrderItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
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
   * Tích hợp trực tiếp với API NestJS của TV4: POST /orders
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
      // Gọi API Backend của TV4
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
      if (err instanceof ApiError) {
        throw err;
      }

      // Fallback lưu LocalStorage khi Backend chưa bật
      const allOrders = getLocalOrders();
      const nextId =
        allOrders.reduce((max, o) => Math.max(max, o.madonhang), 100) + 1;

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

      const newOrder: OrderItem = {
        madonhang: nextId,
        makhachhang: customer.makhachhang,
        manhanvien: null,
        ngaydat: new Date().toISOString(),
        ngayxacnhan: null,
        tongtien,
        phuongthucthanhtoan: payload.phuongthucthanhtoan || 'COD',
        trangthai: 'CHO_XAC_NHAN',
        ghichu: payload.ghichu || null,
        KHACH_HANG: {
          makhachhang: customer.makhachhang,
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
      return all.filter((o) => o.makhachhang === customer.makhachhang);
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
   * Khách hàng hủy đơn hàng đang chờ xác nhận: PATCH /orders/:id/cancel
   */
  async cancel(id: number): Promise<{ success: boolean; message: string }> {
    try {
      return await apiRequest(`/orders/${id}/cancel`, { method: 'PATCH' });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const all = getLocalOrders();
      const idx = all.findIndex((o) => o.madonhang === Number(id));
      if (idx === -1) throw new Error(`Không tìm thấy đơn hàng #${id}`);
      if (all[idx].trangthai !== 'CHO_XAC_NHAN') {
        throw new Error('Khách hàng chỉ có quyền hủy đơn hàng ở trạng thái Chờ xác nhận');
      }
      all[idx].trangthai = 'DA_HUY';
      saveLocalOrders(all);
      return { success: true, message: 'Đã hủy đơn hàng thành công' };
    }
  },
};
