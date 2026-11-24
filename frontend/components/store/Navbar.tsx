'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { authApi, CustomerProfile } from '../../services/auth.api';
import { useCartStore } from '../../stores/cart.store';
import AuthModal from './AuthModal';

export default function StoreNavbar() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const items = useCartStore((state) => state.items);

  useEffect(() => {
    // Đếm tổng số lượng món trong giỏ
    const total = items.reduce((sum, i) => sum + i.soluong, 0);
    setCartCount(total);
  }, [items]);

  useEffect(() => {
    setCustomer(authApi.getCurrentCustomer());
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleLogout = () => {
    authApi.logout();
    setCustomer(null);
    setUserMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur text-white">
        {/* Top bar thông báo chính hãng */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700 py-1.5 px-4 text-center text-xs font-semibold text-white/95">
          <span>✨ Đại lý Ủy quyền Chính thức của Apple tại Việt Nam • Thu cũ đổi mới trợ giá 2 Triệu • Bảo hành Apple Care 12 Tháng</span>
        </div>

        {/* Main Navbar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950 font-bold text-xl group-hover:bg-blue-400 group-hover:text-white transition-all shadow-md">
              
            </span>
            <div>
              <div className="font-extrabold tracking-tight text-base sm:text-lg flex items-center gap-1.5 text-white">
                iPhone Store <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded-md">VN</span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Hệ Thống Phân Phối iPhone Chính Hãng
              </div>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm iPhone 16 Pro Max, Titan Sa Mạc, 256GB..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-500 transition-colors"
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Link danh mục sản phẩm */}
            <Link
              href="/products"
              className="hidden lg:flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              📱 Sản Phẩm
            </Link>

            {/* Giỏ hàng với badge */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-white hover:border-blue-500 hover:bg-slate-800 transition-all shadow-sm"
            >
              <span className="text-base">🛒</span>
              <span className="hidden sm:inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-extrabold text-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth */}
            {customer ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-slate-100 hover:border-blue-500 transition-all"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                    👤
                  </span>
                  <span className="max-w-[100px] truncate">{customer.hoten}</span>
                  <span className="text-[10px] text-slate-400">▾</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-700 bg-slate-800 p-2 shadow-2xl z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-700/60">
                      <div className="font-bold text-white">{customer.hoten}</div>
                      <div className="text-[11px] text-slate-400 truncate">{customer.email}</div>
                      <div className="mt-1 inline-block rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                        Khách hàng thành viên
                      </div>
                    </div>

                    <Link
                      href="/checkout"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-slate-200 hover:bg-slate-700/80 transition-colors"
                    >
                      💳 Đặt hàng (Checkout)
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition-all"
              >
                <span>🔑</span>
                <span>Đăng Nhập</span>
              </button>
            )}

            {/* Chuyển sang giao diện quản lý của TV2 / TV4 / TV5 */}
            <Link
              href="/staff/products"
              className="rounded-2xl border border-slate-700 bg-slate-800/40 px-3 py-2 text-[11px] font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-all hidden md:flex items-center gap-1"
              title="Chuyển tới giao diện dành cho nhân viên quản lý sản phẩm"
            >
              <span>👨‍💼</span>
              <span>Nhân viên</span>
            </Link>
          </div>
        </div>

        {/* Sub-navigation các dòng iPhone */}
        <nav className="border-t border-slate-800/60 bg-slate-900/60 overflow-x-auto scrollbar-none">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2 sm:px-6 text-xs text-slate-300">
            <Link
              href="/products"
              className="shrink-0 rounded-lg px-3 py-1 font-semibold hover:bg-slate-800 hover:text-white transition-colors"
            >
              Tất cả iPhone
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              href="/products?madanhmuc=1"
              className="shrink-0 rounded-lg px-3 py-1 font-semibold text-blue-400 hover:bg-slate-800 transition-colors"
            >
              iPhone 16 Series
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              href="/products?madanhmuc=2"
              className="shrink-0 rounded-lg px-3 py-1 font-semibold hover:bg-slate-800 hover:text-white transition-colors"
            >
              iPhone 15 Series
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              href="/products?madanhmuc=3"
              className="shrink-0 rounded-lg px-3 py-1 font-semibold hover:bg-slate-800 hover:text-white transition-colors"
            >
              iPhone 14 Series
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              href="/products?madanhmuc=4"
              className="shrink-0 rounded-lg px-3 py-1 font-semibold hover:bg-slate-800 hover:text-white transition-colors"
            >
              iPhone 13 Series
            </Link>
          </div>
        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(c) => setCustomer(c)}
      />
    </>
  );
}
