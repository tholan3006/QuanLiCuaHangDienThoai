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
import { useLanguage } from '../../contexts/LanguageContext';
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
  const { lang } = useLanguage();
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
      setError(err?.message || (lang === 'VI' ? 'Đăng nhập không thành công' : 'Sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (regForm.matkhau !== confirmPassword) {
      setError(lang === 'VI' ? 'Mật khẩu nhập lại không khớp!' : 'Passwords do not match!');
      return;
    }
    if (regForm.matkhau.length < 6) {
      setError(lang === 'VI' ? 'Mật khẩu phải từ 6 ký tự trở lên!' : 'Password must be at least 6 characters!');
      return;
    }

    setLoading(true);
    try {
      const customer = await authApi.register(regForm);
      setSuccessMsg(lang === 'VI' ? 'Đăng ký thành công! Đang đăng nhập...' : 'Registration successful! Signing in...');
      setTimeout(() => {
        onSuccess?.(customer);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err?.message || (lang === 'VI' ? 'Đăng ký không thành công' : 'Registration failed'));
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
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 my-8 transition-colors">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="flex items-center gap-3 pr-8 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 dark:bg-sky-600 text-sky-400 dark:text-white font-bold shrink-0 shadow-sm">
            {tab === 'login' ? <User className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg leading-tight">
              {title || (tab === 'login' ? (lang === 'VI' ? 'Tài Khoản Khách Hàng' : 'Customer Account') : (lang === 'VI' ? 'Tạo Tài Khoản Mới' : 'Create New Account'))}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              {customMessage || description || (lang === 'VI' ? 'Đăng nhập để trải nghiệm mua sắm & đặt hàng iPhone chính hãng.' : 'Sign in to experience genuine iPhone shopping & fast delivery.')}
            </p>
          </div>
        </div>

        {/* Chuyển Tab Đăng Nhập / Đăng Ký */}
        <div className="mt-4 flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              tab === 'login'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>{lang === 'VI' ? 'Đăng Nhập' : 'Sign In'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              tab === 'register'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>{lang === 'VI' ? 'Đăng Ký Tài Khoản' : 'Register Account'}</span>
          </button>
        </div>

        {/* Alert Thông báo lỗi hoặc thành công */}
        {error && (
          <div className="mt-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: FORM ĐĂNG NHẬP */}
        {tab === 'login' ? (
          <>
            <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'VI' ? 'Tên đăng nhập hoặc Email' : 'Username or Email'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder={lang === 'VI' ? 'khachhang1 hoặc email@gmail.com' : 'khachhang1 or email@gmail.com'}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 pl-9 pr-3.5 py-2.5 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'VI' ? 'Mật khẩu (mặc định: 123456)' : 'Password (default: 123456)'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={matkhau}
                    onChange={(e) => setMatkhau(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 pl-9 pr-3.5 py-2.5 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 dark:bg-sky-600 py-3 text-xs font-bold text-white shadow-lg hover:bg-slate-800 dark:hover:bg-sky-500 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span>{loading ? (lang === 'VI' ? 'Đang xác thực...' : 'Verifying...') : (lang === 'VI' ? 'Đăng Nhập' : 'Sign In')}</span>
              </button>
            </form>

            {/* Khối Đăng Nhập Nhanh Tài Khoản Mẫu (Demo) */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-center mb-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>{lang === 'VI' ? 'Tài khoản mẫu có sẵn (1 Click)' : 'Demo Accounts (1-Click)'}</span>
              </div>

              <div className="space-y-1.5">
                {DEMO_CUSTOMERS.map((c, idx) => (
                  <button
                    key={c.mataikhoan}
                    type="button"
                    onClick={() => handleQuickLogin(idx)}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-2 text-left text-xs hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-300 dark:hover:border-sky-700 transition-all group"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-700 dark:group-hover:text-sky-300">
                        {c.hoten} <span className="text-slate-400 dark:text-slate-500 font-normal">({c.tendangnhap})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{c.email}</div>
                    </div>
                    <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-0.5">
                      {lang === 'VI' ? 'Chọn' : 'Select'} <ArrowRight className="h-3 w-3" />
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'VI' ? 'Họ và tên của bạn' : 'Full Name'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={regForm.hoten}
                onChange={(e) => setRegForm({ ...regForm, hoten: e.target.value })}
                required
                placeholder="VD: Nguyễn Văn Nam"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'VI' ? 'Tên đăng nhập' : 'Username'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regForm.tendangnhap}
                  onChange={(e) => setRegForm({ ...regForm, tendangnhap: e.target.value })}
                  required
                  placeholder="VD: vannam2024"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'VI' ? 'Email liên hệ' : 'Email'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  required
                  placeholder="VD: nam@gmail.com"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'VI' ? 'Mật khẩu' : 'Password'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={regForm.matkhau}
                  onChange={(e) => setRegForm({ ...regForm, matkhau: e.target.value })}
                  required
                  placeholder={lang === 'VI' ? 'Ít nhất 6 ký tự' : 'At least 6 chars'}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'VI' ? 'Nhập lại mật khẩu' : 'Confirm Password'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder={lang === 'VI' ? 'Khớp với mật khẩu trên' : 'Repeat password'}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'VI' ? 'Số điện thoại' : 'Phone'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={regForm.sdt}
                    onChange={(e) => setRegForm({ ...regForm, sdt: e.target.value })}
                    required
                    placeholder="VD: 0912345678"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 pl-8 pr-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                  />
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'VI' ? 'Địa chỉ giao hàng' : 'Address'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regForm.diachi}
                    onChange={(e) => setRegForm({ ...regForm, diachi: e.target.value })}
                    placeholder={lang === 'VI' ? 'VD: 123 Đường 3/2, Q.10' : 'E.g: 123 District 10'}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 pl-8 pr-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
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
              <span>{loading ? (lang === 'VI' ? 'Đang tạo tài khoản...' : 'Creating account...') : (lang === 'VI' ? 'Đăng Ký & Đăng Nhập Ngay' : 'Register & Sign In Now')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
