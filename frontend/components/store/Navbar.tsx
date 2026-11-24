'use client';

import {
  ChevronDown,
  Globe,
  Lock,
  LogIn,
  LogOut,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  authApi,
  CustomerProfile,
  openCustomerAuthModal,
} from '../../services/auth.api';
import { ProductItem, productsApi } from '../../services/products.api';
import { useCartStore } from '../../stores/cart.store';
import AuthModal from './AuthModal';

const IPHONE_SERIES_TABS = [
  { id: 'all', labelKey: 'all_iphone', href: '/products' },
  { id: '16', label: 'iPhone 16 Series', href: '/products?madanhmuc=1' },
  { id: '15', label: 'iPhone 15 Series', href: '/products?madanhmuc=2' },
  { id: '14', label: 'iPhone 14 Series', href: '/products?madanhmuc=3' },
  { id: '13', label: 'iPhone 13 Series', href: '/products?madanhmuc=4' },
];

export default function StoreNavbar() {
  const { lang, toggleLang, t } = useLanguage();
  const router = useRouter();

  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // States tìm kiếm gợi ý tức thời
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<ProductItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const cartCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setCustomer(authApi.getCurrentCustomer());

    const handleAuthChange = () => {
      setCustomer(authApi.getCurrentCustomer());
    };
    window.addEventListener('auth-change', handleAuthChange);

    const handleOpenAuth = () => {
      setIsAuthModalOpen(true);
    };
    window.addEventListener('open-auth-modal', handleOpenAuth);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('open-auth-modal', handleOpenAuth);
    };
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
    }, 150);

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

  const handleLogout = () => {
    authApi.logout();
    setCustomer(null);
    setIsDropdownOpen(false);
    router.push('/');
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!customer) {
      e.preventDefault();
      openCustomerAuthModal(
        lang === 'VI'
          ? 'Vui lòng đăng nhập tài khoản Khách Hàng để xem và quản lý giỏ hàng!'
          : 'Please sign in to view and manage your shopping cart!',
      );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-md text-white transition-colors">
        {/* Header Chính */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Logo iStore */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-md border border-slate-700/80 group-hover:border-sky-500 transition-colors">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.86-12.03-14.34-6.1-9.14-10.88-19.78-14.34-31.93-3.46-12.14-5.19-23.75-5.19-34.82 0-14.59 3.52-26.68 10.57-36.26 7.05-9.58 16.03-14.47 26.96-14.67 4.58 0 9.8 1.14 15.66 3.42 5.86 2.28 9.77 3.48 11.73 3.59 1.52-.11 5.54-1.37 12.04-3.78 6.5-2.41 11.93-3.48 16.29-3.21 12.5.87 22.45 5.48 29.84 13.84-11.2 6.75-16.69 16.33-16.48 28.74.22 10.23 4.12 18.66 11.71 25.29 4.35 3.8 9.35 6.47 15.01 8-2.39 6.97-5.28 14.15-8.67 21.54zM119.22 33.15c0-7.39 2.66-14.24 7.98-20.55 5.32-6.31 11.79-10.35 19.41-12.12.87 6.96-.98 13.75-5.55 20.37-4.57 6.62-11.14 10.87-19.71 12.75-.43-.15-1.07-.23-1.92-.25-.14-.07-.21-.14-.21-.2z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">
                <span className="text-sky-400">i</span>Store
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight block">
                {lang === 'VI' ? 'Hệ thống phân phối iPhone' : 'Authorized iPhone Reseller'}
              </span>
            </div>
          </Link>

          {/* Ô Tìm Kiếm Autocomplete Tức Thời */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-2 sm:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t('search_placeholder')}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 text-white pl-10 pr-24 py-2.5 text-xs sm:text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-slate-400 transition-all shadow-inner"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-500 transition-colors"
              >
                {lang === 'VI' ? 'Tìm' : 'Search'}
              </button>
            </form>

            {/* Menu Gợi Ý Live Search Autocomplete */}
            {showSuggestions && searchKeyword.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{t('suggestions')}</span>
                  {isSearching && <span className="text-sky-400">{t('searching')}</span>}
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((item) => (
                      <button
                        key={item.masanpham}
                        type="button"
                        onClick={() => {
                          setShowSuggestions(false);
                          setSearchKeyword('');
                          window.scrollTo({ top: 0, behavior: 'instant' });
                          router.push(`/products/${item.masanpham}`);
                        }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-950 p-1 flex items-center justify-center overflow-hidden border border-slate-800">
                          {item.hinhanh ? (
                            <img
                              src={item.hinhanh}
                              alt={item.tensanpham}
                              className="h-full w-full object-contain filter drop-shadow-sm"
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
                            {item.dungluong} • {item.mausac}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-rose-400">
                            {item.giaban.toLocaleString('vi-VN')} ₫
                          </div>
                          <div className="text-[10px] text-emerald-400">
                            {item.soluongton > 0 ? `${t('only_left')} ${item.soluongton} ${t('units_left')}` : t('out_of_stock')}
                          </div>
                        </div>
                      </button>
                    ))}

                    <div className="pt-2 px-2">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full rounded-lg bg-slate-800 py-2 text-center text-xs font-bold text-sky-400 hover:bg-slate-700 transition-colors"
                      >
                        {t('view_all_for')} &quot;{searchKeyword}&quot; ➔
                      </button>
                    </div>
                  </div>
                ) : !isSearching ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    {t('not_found')} &quot;{searchKeyword}&quot;
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Action buttons (Ngôn ngữ EN/VI, Giỏ hàng, Tài khoản - ĐÃ XÓA SÁNG/TỐI VÀ NÚT PRODUCTS) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nút Toggle Ngôn ngữ EN / VI */}
            <button
              type="button"
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 hover:border-sky-500 hover:text-white transition-all shadow-sm"
              title="Switch Language (VI / EN)"
            >
              <Globe className="h-3.5 w-3.5 text-sky-400" />
              <span>{lang}</span>
            </button>

            {/* Giỏ hàng: Chỉ dành cho Khách Hàng hoặc Khách vãng lai. Nhân viên & Admin dùng nút Cổng Quản Lý */}
            {(!customer || customer.role === 'KHACH_HANG') ? (
              <Link
                href="/cart"
                onClick={handleCartClick}
                className="relative flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:border-sky-500 transition-all shadow-sm"
                title={customer ? t('cart') : t('sign_in')}
              >
                <ShoppingBag className="h-4 w-4 text-sky-400" />
                <span className="hidden sm:inline">{t('cart')}</span>
                {customer && cartCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-extrabold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                href={customer.role === 'ADMIN' ? '/admin' : '/staff/products'}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/50 bg-indigo-950/60 text-indigo-300 px-3 py-2 text-xs font-bold hover:bg-indigo-900/60 transition-all shadow-sm"
                title={customer.role === 'ADMIN' ? 'Hệ thống Quản Trị Server' : 'Cổng Bán Hàng & Sản Phẩm Nhân Viên'}
              >
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span className="hidden sm:inline">{customer.role === 'ADMIN' ? 'Admin Portal' : 'Staff Portal'}</span>
              </Link>
            )}

            {/* User Account / Auth Dropdown */}
            {customer ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-100 hover:border-sky-500 transition-all shadow-sm"
                >
                  <User className="h-4 w-4 text-sky-400" />
                  <span className="hidden sm:inline max-w-[120px] truncate">{customer.hoten}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 text-xs">
                    <div className="p-3 border-b border-slate-800">
                      <div className="font-bold text-white truncate text-sm">{customer.hoten}</div>
                      <div className="text-slate-400 text-[11px] truncate">{customer.email}</div>
                      <div className="mt-1 inline-block rounded-md bg-sky-950 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-800">
                        {customer.role === 'ADMIN'
                          ? 'Quản trị viên (Admin)'
                          : customer.role === 'NHAN_VIEN'
                            ? 'Nhân viên bán hàng (Staff)'
                            : t('member_customer')}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/cart"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4 text-slate-400" />
                        <span>{t('cart')} ({cartCount})</span>
                      </Link>

                      <Link
                        href="/checkout"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4 text-slate-400" />
                        <span>{t('order_payment')}</span>
                      </Link>

                      {/* Phân quyền RBAC nội bộ */}
                      {(customer.role === 'NHAN_VIEN' || customer.role === 'ADMIN') && (
                        <Link
                          href="/staff/products"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-blue-400 font-bold hover:bg-blue-950/50 transition-colors"
                        >
                          <Lock className="h-4 w-4 text-blue-400" />
                          <span>{t('staff_portal')}</span>
                        </Link>
                      )}

                      {customer.role === 'ADMIN' && (
                        <Link
                          href="/admin/users"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-purple-400 font-bold hover:bg-purple-950/50 transition-colors"
                        >
                          <ShieldCheck className="h-4 w-4 text-purple-400" />
                          <span>{t('admin_portal')}</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-rose-400 hover:bg-rose-950/50 font-bold transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('sign_out')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-sky-500 transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{t('sign_in')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Thanh Danh Mục Các Dòng iPhone Tabs */}
        <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-2">
          <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto text-xs font-semibold text-slate-300">
            {IPHONE_SERIES_TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="whitespace-nowrap hover:text-sky-400 transition-colors"
              >
                {tab.labelKey ? t(tab.labelKey as any) : tab.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedUser) => setCustomer(loggedUser)}
      />
    </>
  );
}
