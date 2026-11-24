import { apiRequest } from '../lib/api-client';

export type UserRole = 'KHACH_HANG' | 'NHAN_VIEN' | 'ADMIN';

export interface CustomerProfile {
  mataikhoan: number;
  makhachhang?: number;
  manhanvien?: number;
  tendangnhap: string;
  email: string;
  hoten: string;
  sdt: string;
  diachi: string;
  role: UserRole;
  chucvu?: string;
  trangthai?: 'HOAT_DONG' | 'KHOA';
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

const STORAGE_SESSION_KEY = 'iphone_customer_session_v2';
const STORAGE_TOKEN_KEY = 'access_token';
const STORAGE_REGISTERED_USERS_KEY = 'iphone_registered_customers_v2';
const STORAGE_ALL_USERS_KEY = 'iphone_all_users_v2';

// Danh sách tài khoản mẫu chuẩn bị sẵn theo đúng database_script.sql
export const DEMO_USERS: CustomerProfile[] = [
  // 1. Quản trị viên (ADMIN)
  {
    mataikhoan: 1,
    tendangnhap: 'admin',
    email: 'admin@iphonestore.vn',
    hoten: 'Quản Trị Viên Hệ Thống',
    sdt: '0909999999',
    diachi: 'Trung Tâm Điều Hành iStore, TP. Hồ Chí Minh',
    role: 'ADMIN',
    chucvu: 'System Administrator',
    trangthai: 'HOAT_DONG',
    matkhau: '123456',
  },
  // 2. Nhân viên bán hàng (NHAN_VIEN)
  {
    mataikhoan: 2,
    manhanvien: 1,
    tendangnhap: 'nhanvien1',
    email: 'nhanvien1@iphonestore.vn',
    hoten: 'Trần Minh Tuấn',
    sdt: '0901000002',
    diachi: '45 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    role: 'NHAN_VIEN',
    chucvu: 'Chuyên viên bán hàng (Staff)',
    trangthai: 'HOAT_DONG',
    matkhau: '123456',
  },
  {
    mataikhoan: 3,
    manhanvien: 2,
    tendangnhap: 'nhanvien2',
    email: 'nhanvien2@iphonestore.vn',
    hoten: 'Lê Thị Thu Hà',
    sdt: '0901000003',
    diachi: '88 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh',
    role: 'NHAN_VIEN',
    chucvu: 'Trưởng ca bán hàng (Staff)',
    trangthai: 'HOAT_DONG',
    matkhau: '123456',
  },
  // 3. Khách hàng (KHACH_HANG)
  {
    mataikhoan: 4,
    makhachhang: 1,
    tendangnhap: 'khachhang1',
    email: 'khachhang1@gmail.com',
    hoten: 'Nguyễn Văn An',
    sdt: '0901234567',
    diachi: '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    role: 'KHACH_HANG',
    trangthai: 'HOAT_DONG',
    matkhau: '123456',
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
    trangthai: 'HOAT_DONG',
    matkhau: '123456',
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
    trangthai: 'HOAT_DONG',
    matkhau: '123456',
  },
];

export const DEMO_CUSTOMERS = DEMO_USERS.filter((u) => u.role === 'KHACH_HANG');
export const DEMO_STAFF = DEMO_USERS.filter((u) => u.role === 'NHAN_VIEN');
export const DEMO_ADMIN = DEMO_USERS.find((u) => u.role === 'ADMIN');

function getAllStoredUsers(): CustomerProfile[] {
  if (typeof window === 'undefined') return DEMO_USERS;
  const raw = localStorage.getItem(STORAGE_ALL_USERS_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_ALL_USERS_KEY, JSON.stringify(DEMO_USERS));
    return DEMO_USERS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEMO_USERS;
  }
}

function saveAllUsers(users: CustomerProfile[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_ALL_USERS_KEY, JSON.stringify(users));
  }
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
   * Lấy thông tin tài khoản đang đăng nhập hiện tại từ LocalStorage
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
   * Đăng xuất khách hàng / nhân viên
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
   * Đăng nhập người dùng bằng tài khoản / mật khẩu (hỗ trợ cả Admin, Staff, Khách hàng)
   */
  async login(identifier: string, matkhau: string): Promise<CustomerProfile> {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Nếu Backend có endpoint auth thì gọi thử
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

    // 2. Kiểm tra trong danh sách tất cả tài khoản hệ thống
    const allUsers = getAllStoredUsers();
    const matched = allUsers.find(
      (c) => c.email.toLowerCase() === cleanId || c.tendangnhap.toLowerCase() === cleanId,
    );

    if (matched) {
      if (matched.trangthai === 'KHOA') {
        throw new Error('Tài khoản này hiện đang bị KHÓA bởi Quản trị viên hệ thống!');
      }
      if (matkhau === '123456' || matkhau === matched.matkhau || matkhau === matched.tendangnhap) {
        this.setSession(matched);
        return matched;
      }
      throw new Error('Mật khẩu bạn vừa nhập không chính xác!');
    }

    throw new Error('Tài khoản không tồn tại trên hệ thống! (Gợi ý test: khachhang1, nhanvien1 hoặc admin / 123456)');
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

    const allUsers = getAllStoredUsers();

    if (allUsers.some((u) => u.tendangnhap.toLowerCase() === cleanUsername)) {
      throw new Error(`Tên đăng nhập "${payload.tendangnhap}" đã được sử dụng. Vui lòng chọn tên khác!`);
    }
    if (allUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`Email "${payload.email}" đã được đăng ký trên hệ thống!`);
    }

    const newId = allUsers.reduce((max, u) => Math.max(max, u.mataikhoan), 10) + 1;
    const newCustomer: CustomerProfile = {
      mataikhoan: newId,
      makhachhang: newId,
      tendangnhap: cleanUsername,
      email: cleanEmail,
      hoten: payload.hoten.trim(),
      sdt: payload.sdt.trim(),
      diachi: payload.diachi.trim() || 'TP. Hồ Chí Minh',
      role: 'KHACH_HANG',
      trangthai: 'HOAT_DONG',
      matkhau: payload.matkhau,
    };

    allUsers.push(newCustomer);
    saveAllUsers(allUsers);
    this.setSession(newCustomer, `reg_token_${newId}`);
    return newCustomer;
  },

  /**
   * Đăng nhập nhanh bằng 1 click
   */
  loginDemo(index = 0): CustomerProfile {
    const customer = DEMO_CUSTOMERS[index] || DEMO_CUSTOMERS[0];
    this.setSession(customer);
    return customer;
  },

  /**
   * Đăng nhập trực tiếp theo username (cho các nút demo)
   */
  loginDirect(tendangnhap: string): CustomerProfile | null {
    const all = getAllStoredUsers();
    const user = all.find((u: CustomerProfile) => u.tendangnhap === tendangnhap);
    if (user) {
      this.setSession(user);
      return user;
    }
    return null;
  },

  /**
   * Đăng nhập nhanh tài khoản nhân viên (Staff)
   */
  loginStaff(index = 0): CustomerProfile {
    const staff = DEMO_STAFF[index] || DEMO_STAFF[0];
    this.setSession(staff);
    return staff;
  },

  /**
   * Đăng nhập nhanh tài khoản Quản trị viên (Admin)
   */
  loginAdmin(): CustomerProfile {
    const admin = DEMO_ADMIN || DEMO_USERS[0];
    this.setSession(admin);
    return admin;
  },

  /**
   * Cập nhật thông tin tài khoản
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

    // Cập nhật lại trong danh sách allUsers
    const all = getAllStoredUsers();
    const idx = all.findIndex((u) => u.mataikhoan === current.mataikhoan);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updated };
      saveAllUsers(all);
    }

    return updated;
  },

  /**
   * ADMIN SERVER: Quản lý danh sách tài khoản (Thêm, Xóa, Sửa, Phân quyền)
   */
  adminGetAllUsers(): CustomerProfile[] {
    return getAllStoredUsers();
  },

  adminUpdateUser(
    mataikhoan: number,
    data: Partial<Pick<CustomerProfile, 'role' | 'trangthai' | 'hoten' | 'sdt' | 'email' | 'chucvu'>>,
  ): CustomerProfile {
    const all = getAllStoredUsers();
    const idx = all.findIndex((u) => u.mataikhoan === mataikhoan);
    if (idx === -1) throw new Error(`Không tìm thấy tài khoản #${mataikhoan}`);

    all[idx] = { ...all[idx], ...data };
    saveAllUsers(all);

    // Nếu người dùng bị sửa chính là người đang đăng nhập -> cập nhật session
    const current = this.getCurrentCustomer();
    if (current && current.mataikhoan === mataikhoan) {
      this.setSession(all[idx]);
    }

    return all[idx];
  },

  adminCreateUser(user: Omit<CustomerProfile, 'mataikhoan'>): CustomerProfile {
    const all = getAllStoredUsers();
    if (all.some((u) => u.tendangnhap.toLowerCase() === user.tendangnhap.toLowerCase())) {
      throw new Error(`Tên đăng nhập "${user.tendangnhap}" đã tồn tại!`);
    }
    const newId = all.reduce((max, u) => Math.max(max, u.mataikhoan), 10) + 1;
    const newUser: CustomerProfile = {
      ...user,
      mataikhoan: newId,
      trangthai: user.trangthai || 'HOAT_DONG',
      matkhau: user.matkhau || '123456',
    };
    all.push(newUser);
    saveAllUsers(all);
    return newUser;
  },

  adminDeleteUser(mataikhoan: number): boolean {
    const all = getAllStoredUsers();
    const idx = all.findIndex((u) => u.mataikhoan === mataikhoan);
    if (idx === -1) throw new Error(`Không tìm thấy tài khoản #${mataikhoan}`);
    if (all[idx].tendangnhap === 'admin') {
      throw new Error('Không thể xóa tài khoản Quản Trị Viên gốc (Root Admin)!');
    }
    all.splice(idx, 1);
    saveAllUsers(all);
    return true;
  },
};
