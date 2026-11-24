'use client';

import {
  ChevronDown,
  LogIn,
  LogOut,
  Search,
  ShieldAlert,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { authApi, CustomerProfile } from '../../services/auth.api';
import { ProductItem, productsApi } from '../../services/products.api';
import { useCartStore } from '../../stores/cart.store';
import AuthModal from './AuthModal';

export default function StoreNavbar() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // States tìm kiếm gợi ý tức thì (Live Autocomplete Search)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<ProductItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const items = useCartStore((state) => state.items);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const total = items.reduce((sum, i) => sum + i.soluong, 0);
    setCartCount(total);
  }, [items]);

  useEffect(() => {
    setCustomer(authApi.getCurrentCustomer());
  }, []);

  // Xử lý tìm kiếm gợi ý tức thời khi người dùng gõ phím
  useEffect(() => {
    const query = searchKeyword.trim();
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productsApi.getForStore({ search: query, limit: 6 });
        setSearchResults(res.data);
      } catch (err) {
        console.error('Lỗi tìm kiếm gợi ý:', err);
      } finally {
        setIsSearching(false);
      }
    }, 150); // debounce 150ms cực nhạy

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchKeyword.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleSelectProduct = (masanpham: number) => {
    setShowSuggestions(false);
    setSearchKeyword('');
    router.push(`/products/${masanpham}`);
  };

  const handleLogout = () => {
    authApi.logout();
    setCustomer(null);
    setUserMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur text-white shadow-sm">
        {/* Main Navbar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 gap-4">
          {/* Logo IStore */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/80 group-hover:border-blue-500 transition-all shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.2 3.5C15.9 2.5 17 1.9 18.2 1.8C18.3 3.1 17.8 4.3 17 5.2C16.2 6.1 15 6.7 13.8 6.6C13.7 5.3 14.3 4.2 15.2 3.5Z" fill="#38BDF8"/>
                <path d="M19.3 10.3C19.2 8.3 20.8 7.2 20.9 7.1C19.9 5.8 18.4 5.6 17.9 5.6C16.6 5.5 15.4 6.3 14.8 6.3C14.1 6.3 13.1 5.6 12 5.6C10.6 5.6 9.3 6.4 8.6 7.6C7.2 10 8.3 13.7 9.7 15.7C10.4 16.7 11.2 17.7 12.3 17.6C13.4 17.5 13.8 16.9 15 16.9C16.2 16.9 16.6 17.6 17.8 17.6C18.9 17.6 19.6 16.7 20.3 15.7C21.1 14.5 21.4 13.4 21.5 13.3C21.4 13.2 19.4 12.4 19.3 10.3Z" fill="#F8FAFC"/>
              </svg>
            </div>
            <div>
              <div className="font-black tracking-tight text-lg sm:text-xl flex items-center leading-none">
                <span className="text-sky-400">i</span>
                <span className="text-white">Store</span>
              </div>
              <div className="text-[11px] text-slate-400 tracking-wide mt-1 hidden sm:block">
                Hệ thống phân phối iPhone
              </div>
            </div>
          </Link>

          {/* Ô TÌM KIẾM GỢI Ý TỨC THÌ (Instant Autocomplete Search Bar) */}
          <div ref={searchContainerRef} className="flex-1 max-w-md relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Tìm iPhone 16 Pro Max, Titan Sa Mạc, 256GB..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 pl-10 pr-9 py-2 text-xs text-white placeholder-slate-400 focus:border-sky-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            {/* DROPDOWN GỢI Ý SẢN PHẨM REALTIME */}
            {showSuggestions && searchKeyword.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-700 bg-slate-800/95 backdrop-blur-md p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-700/60 flex items-center justify-between">
                  <span>Gợi ý sản phẩm ({searchResults.length})</span>
                  {isSearching && <span className="text-sky-400 animate-pulse">Đang tìm...</span>}
                </div>

                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-700/40 max-h-80 overflow-y-auto">
                    {searchResults.map((item) => (
                      <button
                        key={item.masanpham}
                        type="button"
                        onClick={() => handleSelectProduct(item.masanpham)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-700/70 text-left transition-colors group"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-white p-1 flex items-center justify-center overflow-hidden">
                          {item.hinhanh ? (
                            <img
                              src={item.hinhanh}
                              alt={item.tensanpham}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">iPhone</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-white group-hover:text-sky-400 transition-colors truncate">
                            {item.tensanpham}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {item.dungluong} • Màu {item.mausac}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-rose-400">
                            {item.giaban.toLocaleString('vi-VN')} ₫
                          </div>
                          <div className="text-[10px] text-emerald-400">
                            {item.soluongton > 0 ? `Còn ${item.soluongton} máy` : 'Hết hàng'}
                          </div>
                        </div>
                      </button>
                    ))}

                    <div className="pt-2 px-2">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full rounded-lg bg-slate-700/60 py-2 text-center text-xs font-bold text-sky-400 hover:bg-slate-700 transition-colors"
                      >
                        Xem tất cả kết quả cho &quot;{searchKeyword}&quot; ➔
                      </button>
                    </div>
                  </div>
                ) : !isSearching ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Không tìm thấy iPhone nào khớp với &quot;{searchKeyword}&quot;
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Action buttons (Sản phẩm, Giỏ hàng, Tài khoản) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Link danh mục sản phẩm */}
            <Link
              href="/products"
              className="hidden lg:flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span>Sản Phẩm</span>
            </Link>

            {/* Giỏ hàng với badge */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-white hover:border-sky-500 hover:bg-slate-800 transition-all shadow-sm"
            >
              <ShoppingBag className="h-4 w-4 text-sky-400" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-extrabold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth */}
            {customer ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-100 hover:border-sky-500 transition-all"
                >
                  <User className="h-4 w-4 text-sky-400" />
                  <span className="max-w-[100px] truncate">{customer.hoten}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-700 bg-slate-800 p-2 shadow-2xl z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-700/60">
                      <div className="font-bold text-white">{customer.hoten}</div>
                      <div className="text-[11px] text-slate-400 truncate">{customer.email}</div>
                      <div className="mt-1 inline-block rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                        Khách hàng thành viên
                      </div>
                    </div>

                    <Link
                      href="/checkout"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <span>Tiến hành Đặt hàng (Checkout)</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/30 hover:bg-sky-500 transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}

            {/* Chuyển sang giao diện quản lý nhân viên (Mục A4 của TV2 / TV4 / TV5) */}
            <Link
              href="/staff/products"
              className="rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-2 text-[11px] font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-all hidden md:flex items-center gap-1.5"
              title="Chuyển tới giao diện dành cho nhân viên bán hàng"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
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
              className="shrink-0 rounded-lg px-3 py-1 font-semibold text-sky-400 hover:bg-slate-800 transition-colors"
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
