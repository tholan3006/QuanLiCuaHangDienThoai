'use client';

import React, { useState } from 'react';
import { authApi, CustomerProfile, DEMO_CUSTOMERS } from '../../services/auth.api';

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
  title = 'Đăng nhập tài khoản Khách Hàng',
  description = 'Vui lòng đăng nhập để tiếp tục quy trình mua sắm & đặt hàng iPhone.',
}: AuthModalProps) {
  const [identifier, setIdentifier] = useState('khachhang1');
  const [matkhau, setMatkhau] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const customer = await authApi.login(identifier, matkhau);
      onSuccess?.(customer);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập thất bại');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-lg">
              
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên đăng nhập hoặc Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="khachhang1 hoặc khachhang1@gmail.com"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu (mặc định: 123456)
            </label>
            <input
              type="password"
              value={matkhau}
              onChange={(e) => setMatkhau(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-60 transition-all"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-center mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ⚡ Đăng nhập nhanh tài khoản mẫu (Demo)
            </span>
          </div>

          <div className="space-y-2">
            {DEMO_CUSTOMERS.map((c, idx) => (
              <button
                key={c.mataikhoan}
                type="button"
                onClick={() => handleQuickLogin(idx)}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-left text-xs hover:bg-blue-50 hover:border-blue-300 transition-all group"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-blue-700">
                    {c.hoten} ({c.tendangnhap})
                  </div>
                  <div className="text-[11px] text-slate-500">{c.email}</div>
                </div>
                <span className="text-[11px] font-bold text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm group-hover:border-blue-400">
                  Chọn ➔
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
