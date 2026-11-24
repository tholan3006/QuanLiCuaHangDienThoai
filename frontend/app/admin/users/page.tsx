'use client';

import {
  AlertCircle,
  CheckCircle2,
  Key,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { authApi, CustomerProfile, UserRole } from '../../../services/auth.api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchKw, setSearchKw] = useState('');
  const [alertMsg, setAlertMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  // Modal thêm tài khoản
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    hoten: string;
    tendangnhap: string;
    email: string;
    matkhau: string;
    sdt: string;
    diachi: string;
    role: UserRole;
    chucvu: string;
  }>({
    hoten: '',
    tendangnhap: '',
    email: '',
    matkhau: '123456',
    sdt: '',
    diachi: '',
    role: 'NHAN_VIEN',
    chucvu: 'Nhân viên bán hàng',
  });

  const loadUsers = () => {
    setLoading(true);
    try {
      const data = authApi.adminGetAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = (mataikhoan: number, newRole: UserRole) => {
    try {
      authApi.adminUpdateUser(mataikhoan, { role: newRole });
      setAlertMsg({ text: `Đã cập nhật phân quyền tài khoản #${mataikhoan} thành "${newRole}"!` });
      loadUsers();
    } catch (err: any) {
      setAlertMsg({ text: err?.message || 'Lỗi khi cập nhật quyền', isError: true });
    }
  };

  const handleToggleLock = (user: CustomerProfile) => {
    if (user.tendangnhap === 'admin') {
      alert('Không thể khóa tài khoản Quản Trị Viên gốc (Root Admin)!');
      return;
    }
    const nextStatus = user.trangthai === 'KHOA' ? 'HOAT_DONG' : 'KHOA';
    try {
      authApi.adminUpdateUser(user.mataikhoan, { trangthai: nextStatus });
      setAlertMsg({
        text: `Đã ${nextStatus === 'KHOA' ? 'KHÓA' : 'MỞ KHÓA'} tài khoản "${user.tendangnhap}" thành công!`,
      });
      loadUsers();
    } catch (err: any) {
      setAlertMsg({ text: err?.message || 'Lỗi cập nhật trạng thái', isError: true });
    }
  };

  const handleDelete = (user: CustomerProfile) => {
    if (user.tendangnhap === 'admin') {
      alert('Không thể xóa tài khoản Quản Trị Viên gốc (Root Admin)!');
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa vĩnh viễn tài khoản "${user.tendangnhap}" (${user.hoten}) khỏi hệ thống?`)) {
      return;
    }
    try {
      authApi.adminDeleteUser(user.mataikhoan);
      setAlertMsg({ text: `Đã xóa tài khoản "${user.tendangnhap}" khỏi hệ thống.` });
      loadUsers();
    } catch (err: any) {
      setAlertMsg({ text: err?.message || 'Lỗi khi xóa tài khoản', isError: true });
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      authApi.adminCreateUser({
        hoten: formData.hoten.trim(),
        tendangnhap: formData.tendangnhap.trim(),
        email: formData.email.trim(),
        matkhau: formData.matkhau,
        sdt: formData.sdt.trim(),
        diachi: formData.diachi.trim(),
        role: formData.role,
        chucvu: formData.chucvu.trim(),
      });
      setAlertMsg({ text: `Đã tạo mới tài khoản "${formData.tendangnhap}" với vai trò ${formData.role}!` });
      setModalOpen(false);
      setFormData({
        hoten: '',
        tendangnhap: '',
        email: '',
        matkhau: '123456',
        sdt: '',
        diachi: '',
        role: 'NHAN_VIEN',
        chucvu: 'Nhân viên bán hàng',
      });
      loadUsers();
    } catch (err: any) {
      setAlertMsg({ text: err?.message || 'Lỗi khi tạo tài khoản', isError: true });
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterRole !== 'ALL' && u.role !== filterRole) return false;
    if (!searchKw.trim()) return true;
    const kw = searchKw.toLowerCase();
    return (
      u.tendangnhap.toLowerCase().includes(kw) ||
      u.hoten.toLowerCase().includes(kw) ||
      u.email.toLowerCase().includes(kw) ||
      u.sdt.includes(kw)
    );
  });

  // Thống kê
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const staffCount = users.filter((u) => u.role === 'NHAN_VIEN').length;
  const customerCount = users.filter((u) => u.role === 'KHACH_HANG').length;
  const lockedCount = users.filter((u) => u.trangthai === 'KHOA').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            Giao diện ADMIN Server • Phân hệ Quản trị (Mục II.2 - 10 điểm)
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý Tài Khoản & Phân Quyền Người Dùng
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Admin toàn quyền: Thêm mới, phân quyền (ADMIN / NHAN_VIEN / KHACH_HANG), khóa/mở khóa và quản lý hồ sơ.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition-all self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Thêm Tài Khoản Mới</span>
        </button>
      </div>

      {/* Thông báo thao tác */}
      {alertMsg && (
        <div
          className={`rounded-2xl p-4 text-xs font-semibold flex items-center justify-between border ${
            alertMsg.isError
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.isError ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="text-gray-400 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Thẻ Thống Kê Nhanh */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold">Tổng tài khoản</span>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-1 text-2xl font-black text-gray-900">{totalUsers}</div>
          <div className="text-[11px] text-gray-400">Bảng TAI_KHOAN</div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs font-semibold">Quản trị viên</span>
            <ShieldAlert className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-purple-800">{adminCount}</div>
          <div className="text-[11px] text-purple-600">Quyền ADMIN</div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-semibold">Nhân viên bán hàng</span>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-blue-800">{staffCount}</div>
          <div className="text-[11px] text-blue-600">Quyền NHAN_VIEN</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold">Khách hàng</span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-800">{customerCount}</div>
          <div className="text-[11px] text-emerald-600">Quyền KHACH_HANG</div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-semibold">Tài khoản bị khóa</span>
            <Lock className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-rose-800">{lockedCount}</div>
          <div className="text-[11px] text-rose-600">KHOA truy cập</div>
        </div>
      </div>

      {/* Bộ Lọc & Tìm Kiếm */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'ADMIN', label: 'Admin' },
            { key: 'NHAN_VIEN', label: 'Nhân viên' },
            { key: 'KHACH_HANG', label: 'Khách hàng' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterRole(tab.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                filterRole === tab.key
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchKw}
            onChange={(e) => setSearchKw(e.target.value)}
            placeholder="Tìm theo username, họ tên, email..."
            className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-xs focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        </div>
      </div>

      {/* Bảng Danh Sách Người Dùng */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3.5">ID / Username</th>
                <th className="px-4 py-3.5">Họ và Tên</th>
                <th className="px-4 py-3.5">Email & Số Điện Thoại</th>
                <th className="px-4 py-3.5">Vai Trò (Phân Quyền)</th>
                <th className="px-4 py-3.5 text-center">Trạng Thái</th>
                <th className="px-4 py-3.5 text-center">Thao Tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredUsers.map((u) => {
                const isRootAdmin = u.tendangnhap === 'admin';
                const isLocked = u.trangthai === 'KHOA';

                return (
                  <tr key={u.mataikhoan} className="hover:bg-gray-50/60 transition-colors">
                    {/* ID / Username */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="font-mono font-bold text-gray-900">
                        #{u.mataikhoan} • <span className="text-purple-600">{u.tendangnhap}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Pass: {u.matkhau || '123456'}
                      </div>
                    </td>

                    {/* Họ Tên */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="font-bold text-gray-900">{u.hoten}</div>
                      {u.chucvu && (
                        <div className="text-[11px] text-gray-500 mt-0.5">{u.chucvu}</div>
                      )}
                    </td>

                    {/* Email & SĐT */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="text-gray-900 font-medium">{u.email}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{u.sdt || 'Chưa có SĐT'}</div>
                    </td>

                    {/* Phân Quyền (Dropdown Đổi Role Ngay) */}
                    <td className="px-4 py-3.5 align-middle">
                      {isRootAdmin ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-purple-100 text-purple-800 px-2.5 py-1 text-xs font-bold border border-purple-200">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>ROOT ADMIN</span>
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.mataikhoan, e.target.value as UserRole)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-all focus:outline-none ${
                            u.role === 'ADMIN'
                              ? 'border-purple-300 bg-purple-50 text-purple-800'
                              : u.role === 'NHAN_VIEN'
                                ? 'border-blue-300 bg-blue-50 text-blue-800'
                                : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
                          <option value="NHAN_VIEN">Nhân Viên Bán Hàng (NHAN_VIEN)</option>
                          <option value="KHACH_HANG">Khách Hàng (KHACH_HANG)</option>
                        </select>
                      )}
                    </td>

                    {/* Trạng Thái Khóa / Hoạt Động */}
                    <td className="px-4 py-3.5 align-middle text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isLocked
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isLocked ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                        <span>{isLocked ? 'ĐÃ KHÓA' : 'HOẠT ĐỘNG'}</span>
                      </span>
                    </td>

                    {/* Thao Tác Admin */}
                    <td className="px-4 py-3.5 align-middle text-center">
                      {!isRootAdmin && (
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Nút Khóa / Mở Khóa */}
                          <button
                            type="button"
                            onClick={() => handleToggleLock(u)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
                              isLocked
                                ? 'border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                            title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {isLocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                            <span>{isLocked ? 'Mở Khóa' : 'Khóa'}</span>
                          </button>

                          {/* Nút Xóa */}
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Xóa tài khoản vĩnh viễn"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Mới Tài Khoản */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-gray-100 my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 text-white font-bold">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Thêm Tài Khoản Mới & Phân Quyền
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tạo tài khoản quản trị viên, nhân viên bán hàng hoặc khách hàng mới
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tên đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tendangnhap}
                    onChange={(e) => setFormData({ ...formData, tendangnhap: e.target.value })}
                    placeholder="VD: nhanvien3"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mật khẩu mặc định <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.matkhau}
                    onChange={(e) => setFormData({ ...formData, matkhau: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.hoten}
                  onChange={(e) => setFormData({ ...formData, hoten: e.target.value })}
                  placeholder="VD: Nguyễn Văn Hoàng"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="VD: hoang@istore.vn"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.sdt}
                    onChange={(e) => setFormData({ ...formData, sdt: e.target.value })}
                    placeholder="VD: 0901234567"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phân quyền (Vai trò) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-purple-600 focus:outline-none font-bold"
                  >
                    <option value="NHAN_VIEN">Nhân viên bán hàng (Staff)</option>
                    <option value="ADMIN">Quản trị viên (Admin)</option>
                    <option value="KHACH_HANG">Khách hàng thành viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Chức vụ / Ghi chú
                  </label>
                  <input
                    type="text"
                    value={formData.chucvu}
                    onChange={(e) => setFormData({ ...formData, chucvu: e.target.value })}
                    placeholder="VD: Chuyên viên tư vấn"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={formData.diachi}
                  onChange={(e) => setFormData({ ...formData, diachi: e.target.value })}
                  placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
