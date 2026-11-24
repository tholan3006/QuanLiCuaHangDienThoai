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
  matkhau?: string;
}

export interface RegisterPayload {
  hoten: string;
  tendangnhap: string;
  email: string;
  matkhau: string;
  sdt: string;
  diachi: string;
}

const STORAGE_SESSION_KEY = 'iphone_customer_session_v1';
const STORAGE_TOKEN_KEY = 'access_token';
const STORAGE_REGISTERED_USERS_KEY = 'iphone_registered_customers_v1';

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

function getStoredRegisteredUsers(): CustomerProfile[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_REGISTERED_USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveRegisteredUser(user: CustomerProfile) {
  if (typeof window === 'undefined') return;
  const list = getStoredRegisteredUsers();
  list.push(user);
  localStorage.setItem(STORAGE_REGISTERED_USERS_KEY, JSON.stringify(list));
}

/**
 * Mở modal đăng nhập từ bất kỳ nút nào trên website kèm lời nhắn
 */
export function openCustomerAuthModal(message?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { message } }));
  }
}

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
   * Lưu phiên đăng nhập và kích hoạt event đồng bộ toàn hệ thống
   */
  setSession(customer: CustomerProfile, token = 'demo_token_' + customer.mataikhoan) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(customer));
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      localStorage.setItem('auth_role', customer.role);
      localStorage.setItem('auth_mataikhoan', String(customer.mataikhoan));
      window.dispatchEvent(new Event('auth-change'));
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
      window.dispatchEvent(new Event('auth-change'));
    }
  },

  /**
   * Đăng nhập khách hàng bằng tài khoản / mật khẩu
   */
  async login(identifier: string, matkhau: string): Promise<CustomerProfile> {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Nếu Backend TV1 có endpoint auth thì gọi thử
    try {
      const res = await apiRequest<{ access_token: string; user: CustomerProfile }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: cleanId, matkhau }),
      });
      if (res?.user && res?.access_token) {
        this.setSession(res.user, res.access_token);
        return res.user;
      }
    } catch {
      // Tiếp tục kiểm tra danh sách tài khoản local
    }

    // 2. Kiểm tra danh sách khách hàng đã đăng ký bằng tay
    const registered = getStoredRegisteredUsers();
    const matchedRegistered = registered.find(
      (c) => c.email.toLowerCase() === cleanId || c.tendangnhap.toLowerCase() === cleanId,
    );
    if (matchedRegistered) {
      if (matchedRegistered.matkhau && matchedRegistered.matkhau !== matkhau) {
        throw new Error('Mật khẩu bạn vừa nhập không đúng!');
      }
      this.setSession(matchedRegistered);
      return matchedRegistered;
    }

    // 3. Fallback: Kiểm tra danh sách khách hàng mẫu (DEMO)
    const matched = DEMO_CUSTOMERS.find(
      (c) => c.email.toLowerCase() === cleanId || c.tendangnhap.toLowerCase() === cleanId,
    );

    if (matched && (matkhau === '123456' || matkhau === matched.tendangnhap)) {
      this.setSession(matched);
      return matched;
    }

    throw new Error('Tài khoản hoặc mật khẩu không chính xác! (Gợi ý test: khachhang1 / 123456 hoặc tạo tài khoản mới)');
  },

  /**
   * Đăng ký tài khoản Khách Hàng mới bằng tay
   */
  async register(payload: RegisterPayload): Promise<CustomerProfile> {
    const cleanUsername = payload.tendangnhap.trim().toLowerCase();
    const cleanEmail = payload.email.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('Tên đăng nhập phải có ít nhất 3 ký tự!');
    }
    if (!cleanEmail.includes('@')) {
      throw new Error('Địa chỉ email không hợp lệ!');
    }
    if (!payload.matkhau || payload.matkhau.length < 6) {
      throw new Error('Mật khẩu bảo mật phải có ít nhất 6 ký tự!');
    }
    if (!payload.hoten.trim()) {
      throw new Error('Vui lòng nhập họ và tên của bạn!');
    }
    if (!payload.sdt.trim()) {
      throw new Error('Vui lòng cung cấp số điện thoại liên hệ nhận hàng!');
    }

    // Kiểm tra trùng lặp
    const existingRegistered = getStoredRegisteredUsers();
    const allUsers = [...DEMO_CUSTOMERS, ...existingRegistered];

    if (allUsers.some((u) => u.tendangnhap.toLowerCase() === cleanUsername)) {
      throw new Error(`Tên đăng nhập "${payload.tendangnhap}" đã được sử dụng. Vui lòng chọn tên khác!`);
    }
    if (allUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`Email "${payload.email}" đã được đăng ký trên hệ thống!`);
    }

    // Tạo mã mới
    const newId = 100 + existingRegistered.length + 1;
    const newCustomer: CustomerProfile = {
      mataikhoan: newId,
      makhachhang: newId,
      tendangnhap: cleanUsername,
      email: cleanEmail,
      hoten: payload.hoten.trim(),
      sdt: payload.sdt.trim(),
      diachi: payload.diachi.trim() || 'TP. Hồ Chí Minh',
      role: 'KHACH_HANG',
      matkhau: payload.matkhau,
    };

    saveRegisteredUser(newCustomer);
    this.setSession(newCustomer, `reg_token_${newId}`);
    return newCustomer;
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
