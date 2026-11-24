'use client';

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  LogIn,
  MapPin,
  Phone,
  User,
  UserPlus,
  X,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  authApi,
  CustomerProfile,
  DEMO_CUSTOMERS,
  RegisterPayload,
} from '../../services/auth.api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (customer: CustomerProfile) => void;
  title?: string;
  description?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState('khachhang1');
  const [matkhau, setMatkhau] = useState('123456');

  // Register form state
  const [regForm, setRegForm] = useState<RegisterPayload>({
    hoten: '',
    tendangnhap: '',
    email: '',
    matkhau: '',
    sdt: '',
    diachi: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  // Lắng nghe sự kiện mở modal toàn cục từ các nút trên website
  useEffect(() => {
    const handleOpen = (e: any) => {
      if (e.detail?.message) {
        setCustomMessage(e.detail.message);
      } else {
        setCustomMessage(null);
      }
      setError(null);
    };
    window.addEventListener('open-auth-modal', handleOpen);
    return () => window.removeEventListener('open-auth-modal', handleOpen);
  }, []);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const customer = await authApi.login(identifier, matkhau);
      onSuccess?.(customer);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (regForm.matkhau !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    setLoading(true);
    try {
      const customer = await authApi.register(regForm);
      setSuccessMsg('Đăng ký tài khoản thành công! Bạn đã được tự động đăng nhập.');
      setTimeout(() => {
        onSuccess?.(customer);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Đăng ký tài khoản thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (index: number) => {
    const customer = authApi.loginDemo(index);
    onSuccess?.(customer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 my-8">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Đóng"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="flex items-center gap-3 pr-8 pb-3 border-b border-slate-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sky-400 font-bold shrink-0 shadow-sm">
            {tab === 'login' ? <User className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
              {title || (tab === 'login' ? 'Tài Khoản Khách Hàng' : 'Tạo Tài Khoản Mới')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-normal">
              {customMessage || description || 'Đăng nhập để trải nghiệm mua sắm & đặt hàng iPhone chính hãng.'}
            </p>
          </div>
        </div>

        {/* Chuyển Tab Đăng Nhập / Đăng Ký */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              tab === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Đăng Nhập</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              tab === 'register'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Đăng Ký Tài Khoản</span>
          </button>
        </div>

        {/* Alert Thông báo lỗi hoặc thành công */}
        {error && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: FORM ĐĂNG NHẬP */}
        {tab === 'login' ? (
          <>
            <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên đăng nhập hoặc Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder="khachhang1 hoặc email@gmail.com"
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all text-slate-900 bg-white"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu (mặc định: 123456)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={matkhau}
                    onChange={(e) => setMatkhau(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all text-slate-900 bg-white"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-lg hover:bg-slate-800 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
              </button>
            </form>

            {/* Khối Đăng Nhập Nhanh Tài Khoản Mẫu (Demo) */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="text-center mb-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Tài khoản mẫu có sẵn (1 Click)</span>
              </div>

              <div className="space-y-1.5">
                {DEMO_CUSTOMERS.map((c, idx) => (
                  <button
                    key={c.mataikhoan}
                    type="button"
                    onClick={() => handleQuickLogin(idx)}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-left text-xs hover:bg-sky-50 hover:border-sky-300 transition-all group"
                  >
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-sky-700">
                        {c.hoten} <span className="text-slate-400 font-normal">({c.tendangnhap})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{c.email}</div>
                    </div>
                    <span className="text-[11px] font-bold text-sky-600 flex items-center gap-0.5">
                      Chọn <ArrowRight className="h-3 w-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* TAB 2: FORM ĐĂNG KÝ BẰNG TAY */
          <form onSubmit={handleRegister} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên của bạn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={regForm.hoten}
                onChange={(e) => setRegForm({ ...regForm, hoten: e.target.value })}
                required
                placeholder="VD: Nguyễn Văn Nam"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên đăng nhập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regForm.tendangnhap}
                  onChange={(e) => setRegForm({ ...regForm, tendangnhap: e.target.value })}
                  required
                  placeholder="VD: vannam2024"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email liên hệ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  required
                  placeholder="VD: nam@gmail.com"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={regForm.matkhau}
                  onChange={(e) => setRegForm({ ...regForm, matkhau: e.target.value })}
                  required
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhập lại mật khẩu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Khớp với mật khẩu trên"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại nhận hàng <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={regForm.sdt}
                    onChange={(e) => setRegForm({ ...regForm, sdt: e.target.value })}
                    required
                    placeholder="VD: 0912345678"
                    className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 bg-white"
                  />
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ giao hàng (Tùy chọn)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regForm.diachi}
                    onChange={(e) => setRegForm({ ...regForm, diachi: e.target.value })}
                    placeholder="VD: 123 Đường 3/2, Q.10"
                    className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 bg-white"
                  />
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow-lg shadow-sky-600/30 hover:bg-sky-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>{loading ? 'Đang tạo tài khoản...' : 'Đăng Ký & Đăng Nhập Ngay'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
