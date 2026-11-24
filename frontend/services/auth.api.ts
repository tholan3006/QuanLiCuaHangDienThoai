import { apiRequest } from '../lib/api-client';

export interface CustomerProfile {
  mataikhoan: number;
  makhachhang: number;
  tendangnhap: string;
  email: string;
  hoten: string;
  sdt: string;
  diachi: string;
  role: 'KHACH_HANG' | 'NHAN_VIEN' | 'ADMIN';
}

const STORAGE_SESSION_KEY = 'iphone_customer_session_v1';
const STORAGE_TOKEN_KEY = 'access_token';

// Danh sách tài khoản khách hàng mẫu chuẩn bị sẵn theo đúng database_script.sql & readme.txt
export const DEMO_CUSTOMERS: CustomerProfile[] = [
  {
    mataikhoan: 4,
    makhachhang: 1,
    tendangnhap: 'khachhang1',
    email: 'khachhang1@gmail.com',
    hoten: 'Nguyễn Văn An',
    sdt: '0901234567',
    diachi: '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    role: 'KHACH_HANG',
  },
  {
    mataikhoan: 5,
    makhachhang: 2,
    tendangnhap: 'khachhang2',
    email: 'khachhang2@gmail.com',
    hoten: 'Trần Thị Bình',
    sdt: '0912345678',
    diachi: '456 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    role: 'KHACH_HANG',
  },
  {
    mataikhoan: 6,
    makhachhang: 3,
    tendangnhap: 'khachhang3',
    email: 'khachhang3@gmail.com',
    hoten: 'Lê Hoàng Cường',
    sdt: '0923456789',
    diachi: '789 Cách Mạng Tháng 8, Phường 6, Quận 3, TP. Hồ Chí Minh',
    role: 'KHACH_HANG',
  },
];

export const authApi = {
  /**
   * Lấy thông tin khách hàng đang đăng nhập hiện tại từ LocalStorage
   */
  getCurrentCustomer(): CustomerProfile | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Lưu phiên đăng nhập
   */
  setSession(customer: CustomerProfile, token = 'demo_token_' + customer.mataikhoan) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(customer));
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      localStorage.setItem('auth_role', customer.role);
      localStorage.setItem('auth_mataikhoan', String(customer.mataikhoan));
    }
  },

  /**
   * Đăng xuất khách hàng
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem('auth_role');
      localStorage.removeItem('auth_mataikhoan');
    }
  },

  /**
   * Đăng nhập khách hàng bằng tài khoản / mật khẩu
   */
  async login(identifier: string, matkhau: string): Promise<CustomerProfile> {
    try {
      // Nếu Backend TV1 có endpoint auth thì gọi trực tiếp
      const res = await apiRequest<{ access_token: string; user: CustomerProfile }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, matkhau }),
      });
      if (res?.user && res?.access_token) {
        this.setSession(res.user, res.access_token);
        return res.user;
      }
    } catch {
      // Fallback: Kiểm tra trong danh sách khách hàng mẫu (mật khẩu mặc định 123456)
    }

    const cleanId = identifier.trim().toLowerCase();
    const matched = DEMO_CUSTOMERS.find(
      (c) => c.email.toLowerCase() === cleanId || c.tendangnhap.toLowerCase() === cleanId,
    );

    if (matched && (matkhau === '123456' || matkhau === matched.tendangnhap)) {
      this.setSession(matched);
      return matched;
    }

    throw new Error('Tài khoản hoặc mật khẩu không chính xác! (Gợi ý test: khachhang1 / 123456)');
  },

  /**
   * Đăng nhập nhanh bằng 1 click chọn tài khoản mẫu (tiện cho thầy cô / bạn bè chấm bài)
   */
  loginDemo(index = 0): CustomerProfile {
    const customer = DEMO_CUSTOMERS[index] || DEMO_CUSTOMERS[0];
    this.setSession(customer);
    return customer;
  },

  /**
   * Cập nhật thông tin giao hàng khách hàng
   */
  updateProfile(data: Partial<Pick<CustomerProfile, 'hoten' | 'sdt' | 'diachi'>>): CustomerProfile | null {
    const current = this.getCurrentCustomer();
    if (!current) return null;
    const updated: CustomerProfile = {
      ...current,
      hoten: data.hoten?.trim() || current.hoten,
      sdt: data.sdt?.trim() || current.sdt,
      diachi: data.diachi?.trim() || current.diachi,
    };
    this.setSession(updated);
    return updated;
  },
};
