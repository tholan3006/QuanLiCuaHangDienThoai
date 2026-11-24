'use client';

import {
  ArrowLeft,
  ArrowRight,
  Lock,
  LogIn,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import StoreToast, { ToastMessage } from '../../../components/store/StoreToast';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  authApi,
  CustomerProfile,
  openCustomerAuthModal,
} from '../../../services/auth.api';
import { useCartStore } from '../../../stores/cart.store';

export default function StoreCartPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalAmount = useCartStore((state) => state.getTotalAmount);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  useEffect(() => {
    setMounted(true);
    setCustomer(authApi.getCurrentCustomer());

    const handleAuthChange = () => {
      setCustomer(authApi.getCurrentCustomer());
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const addToast = (message: string, isSuccess: boolean) => {
    const id = Date.now().toString();
    setToasts((prev) => [
      ...prev,
      { id, message, type: isSuccess ? 'success' : 'warning' },
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateQty = (
    masanpham: number,
    currentQty: number,
    delta: number,
    tonkho: number,
  ) => {
    const nextQty = currentQty + delta;
    if (nextQty > tonkho) {
      addToast(
        lang === 'VI'
          ? `Không thể tăng thêm. Sản phẩm chỉ còn ${tonkho} máy trong kho!`
          : `Cannot increase quantity. Only ${tonkho} units left in stock!`,
        false,
      );
      return;
    }
    const res = updateQuantity(masanpham, nextQty);
    addToast(res.message, res.success);
  };

  const handleRemoveItem = (masanpham: number, name: string) => {
    if (confirm(lang === 'VI' ? `Bạn có chắc muốn xóa "${name}" khỏi giỏ hàng?` : `Remove "${name}" from cart?`)) {
      removeFromCart(masanpham);
      addToast(lang === 'VI' ? `Đã xóa "${name}" khỏi giỏ hàng.` : `Removed "${name}" from cart.`, true);
    }
  };

  const handleClearCart = () => {
    if (confirm(lang === 'VI' ? 'Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng?' : 'Clear all items in your cart?')) {
      clearCart();
      addToast(lang === 'VI' ? 'Đã làm rỗng giỏ hàng.' : 'Cart emptied.', true);
    }
  };

  const handleProceedOrder = () => {
    if (!customer) {
      openCustomerAuthModal(lang === 'VI' ? 'Vui lòng đăng nhập để tiến hành đặt hàng!' : 'Please sign in to proceed with order!');
      return;
    }
    router.push('/checkout');
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-xs text-slate-500 dark:text-slate-400">
        {lang === 'VI' ? 'Đang nạp dữ liệu giỏ hàng...' : 'Loading cart data...'}
      </div>
    );
  }

  // NGHIỆP VỤ BẮT BUỘC: NẾU TÀI KHOẢN LÀ NHÂN VIÊN HOẶC ADMIN -> CHẶN STOREFRONT CART
  if (customer && (customer.role === 'NHAN_VIEN' || customer.role === 'ADMIN')) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-14 text-center space-y-6 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto shadow-inner border border-indigo-100 dark:border-indigo-800">
            <Lock className="h-9 w-9 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {lang === 'VI' ? 'Tài Khoản Quản Lý / Nhân Viên' : 'Staff / Admin Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {lang === 'VI'
                ? `Bạn đang đăng nhập bằng tài khoản ${customer.role === 'ADMIN' ? 'Quản Trị Viên' : 'Nhân Viên'}. Storefront và giỏ hàng chỉ phục vụ Khách Hàng mua sắm. Nhân viên vui lòng sử dụng Cổng Quản Lý.`
                : `You are signed in as ${customer.role === 'ADMIN' ? 'Admin' : 'Staff'}. Shopping cart is exclusively reserved for Customers.`}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={customer.role === 'ADMIN' ? '/admin' : '/staff/products'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-indigo-500 transition-all"
            >
              <span>{lang === 'VI' ? 'Về Cổng Quản Lý' : 'Go to Management Portal'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // NGHIỆP VỤ BẮT BUỘC: NẾU CHƯA ĐĂNG NHẬP -> HIỂN THỊ YÊU CẦU ĐĂNG NHẬP
  if (!customer) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-14 text-center space-y-6 shadow-sm transition-colors">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto shadow-inner border border-sky-100 dark:border-sky-800">
            <Lock className="h-9 w-9 text-sky-600 dark:text-sky-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t('auth_required_title')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {t('auth_required_desc')}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openCustomerAuthModal(lang === 'VI' ? 'Vui lòng đăng nhập để xem và quản lý giỏ hàng!' : 'Please sign in to view and manage your cart!')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-slate-800 dark:hover:bg-sky-500 transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>{t('auth_required_btn')}</span>
            </button>

            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-5 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <span>{lang === 'VI' ? 'Xem Danh Sách iPhone' : 'Explore iPhone Series'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <StoreToast toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  const totalAmount = getTotalAmount();
  const totalCount = getTotalItems();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Tiêu đề */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            {t('home')} / {t('cart')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="h-7 w-7 text-sky-600 dark:text-sky-400" />
            <span>{t('your_cart')}</span>
          </h1>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearCart}
            className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{t('clear_cart')}</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        /* Giao diện Giỏ Hàng Trống */
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 sm:p-20 text-center space-y-5 shadow-sm max-w-2xl mx-auto transition-colors">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto">
            <ShoppingBag className="h-10 w-10 text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('empty_cart_title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              {t('empty_cart_desc')}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-slate-800 dark:hover:bg-sky-500 transition-all"
            >
              <span>{t('explore_btn')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Giao diện Giỏ Hàng Có Sản Phẩm */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột Trái: Danh sách sản phẩm (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
              {items.map((item) => {
                const isMax = item.soluong >= item.soluongton;
                return (
                  <div
                    key={item.masanpham}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Ảnh & Thông tin */}
                    <div className="flex items-center gap-4 flex-1">
                      <Link
                        href={`/products/${item.masanpham}`}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800 p-2 flex items-center justify-center border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                      >
                        {item.hinhanh ? (
                          <img
                            src={item.hinhanh}
                            alt={item.tensanpham}
                            className="h-full w-full object-contain filter drop-shadow-sm"
                          />
                        ) : (
                          <span className="text-xs text-slate-300">iPhone</span>
                        )}
                      </Link>

                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                          {item.tendanhmuc || 'iPhone'} • SKU: {item.sku}
                        </div>
                        <Link
                          href={`/products/${item.masanpham}`}
                          className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-sky-600 dark:hover:text-sky-400 transition-colors line-clamp-1"
                        >
                          {item.tensanpham}
                        </Link>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>{lang === 'VI' ? 'Bản' : 'Model'}: <strong className="text-slate-700 dark:text-slate-300">{item.dungluong}</strong></span>
                          <span>•</span>
                          <span>{t('color_label')}: <strong className="text-slate-700 dark:text-slate-300">{item.mausac}</strong></span>
                        </div>
                        <div className="text-xs font-bold text-rose-600 dark:text-rose-400 sm:hidden">
                          {item.giaban.toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                    </div>

                    {/* Đơn giá (desktop) */}
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.giaban.toLocaleString('vi-VN')} ₫
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{t('unit_price')}</div>
                    </div>

                    {/* Bộ đếm số lượng (Chặn vượt tồn kho) */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                      <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.masanpham, item.soluong, -1, item.soluongton)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-xs font-black text-slate-900 dark:text-slate-100">
                          {item.soluong}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.masanpham, item.soluong, 1, item.soluongton)}
                          disabled={isMax}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 transition-colors"
                          title={isMax ? `Kho chỉ còn ${item.soluongton} máy` : 'Tăng số lượng'}
                        >
                          +
                        </button>
                      </div>

                      {isMax && (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                          {lang === 'VI' ? `Tối đa (${item.soluongton} máy)` : `Max (${item.soluongton})`}
                        </span>
                      )}
                    </div>

                    {/* Thành tiền & Nút Xóa */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-black text-rose-600 dark:text-rose-400">
                          {(item.giaban * item.soluong).toLocaleString('vi-VN')} ₫
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 sm:block hidden">{t('subtotal_label')}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.masanpham, item.tensanpham)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title={lang === 'VI' ? 'Xóa sản phẩm' : 'Remove item'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Thông báo chính sách giao hàng */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 flex items-center gap-3 text-xs text-emerald-950 dark:text-emerald-300">
              <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">{t('free_shipping_title')}</span>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
                  {t('free_shipping_sub')}
                </p>
              </div>
            </div>
          </div>

          {/* Cột Phải: Tóm Tắt Đơn Hàng (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base pb-3 border-b border-slate-100 dark:border-slate-800">
                {t('order_summary')}
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{lang === 'VI' ? 'Khách hàng đặt:' : 'Customer:'}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{customer.hoten}</span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t('total_items')}:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{totalCount} {t('units_left')}</span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t('subtotal_goods')}:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {totalAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t('shipping_fee')}:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{t('free')}</span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t('official_warranty')}:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{t('apple_care_12m')}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{t('total_payment')}:</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{t('vat_included')}</span>
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                  {totalAmount.toLocaleString('vi-VN')} ₫
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleProceedOrder}
                  className="w-full rounded-xl bg-slate-900 dark:bg-sky-600 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg hover:bg-slate-800 dark:hover:bg-sky-500 transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('proceed_order')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <Link
                  href="/products"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 text-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{t('continue_shopping')}</span>
                </Link>
              </div>
            </div>

            {/* Thông tin hỗ trợ */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-4 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {lang === 'VI' ? 'Cần tư vấn hỗ trợ?' : 'Need Assistance?'}
              </div>
              <p className="text-[11px] leading-relaxed">
                {lang === 'VI'
                  ? 'Gọi ngay hotline miễn phí 1800 6868 để được chuyên viên iStore tư vấn chi tiết về cấu hình máy và chính sách thanh toán.'
                  : 'Call our toll-free hotline 1800 6868 for expert guidance on iPhone specifications and payment options.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      <StoreToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
