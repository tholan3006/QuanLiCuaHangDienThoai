'use client';

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  QrCode,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import AuthModal from '../../../components/store/AuthModal';
import StoreToast, { ToastMessage } from '../../../components/store/StoreToast';
import { useLanguage } from '../../../contexts/LanguageContext';
import { authApi, CustomerProfile, DEMO_USERS } from '../../../services/auth.api';
import { ordersApi } from '../../../services/orders.api';
import { productsApi } from '../../../services/products.api';
import { CartSyncWarning, useCartStore } from '../../../stores/cart.store';

export default function StoreCheckoutPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // States form người nhận
  const [hoten, setHoten] = useState('');
  const [sdt, setSdt] = useState('');
  const [diachi, setDiachi] = useState('');
  const [ghichu, setGhichu] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CHUYEN_KHOAN'>('COD');

  // Trạng thái kiểm tra & đặt hàng
  const [syncing, setSyncing] = useState(true);
  const [syncWarnings, setSyncWarnings] = useState<CartSyncWarning[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const allCartItems = useCartStore((state) => state.items);
  const syncWithLatestProducts = useCartStore((state) => state.syncWithLatestProducts);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('selected_checkout_ids');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedIds(parsed);
        }
      }
    } catch {}
  }, []);

  const items = selectedIds.length > 0
    ? allCartItems.filter((i) => selectedIds.includes(i.masanpham))
    : allCartItems;

  const addToast = (message: string, isSuccess: boolean) => {
    const id = Date.now().toString();
    setToasts((prev) => [
      ...prev,
      { id, message, type: isSuccess ? 'success' : 'warning' },
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Bước 1: Khởi tạo và kiểm tra session khách hàng
  useEffect(() => {
    setMounted(true);
    const curCustomer = authApi.getCurrentCustomer();
    setCustomer(curCustomer);
    if (curCustomer) {
      setHoten(curCustomer.hoten || '');
      setSdt(curCustomer.sdt || '');
      setDiachi(curCustomer.diachi || '');
    }
  }, []);

  // Bước 2: ĐỐI CHIẾU GIÁ BÁN VÀ TÌNH TRẠNG SẢN PHẨM MỚI NHẤT TỪ API
  useEffect(() => {
    async function verifyWithApi() {
      if (items.length === 0) {
        setSyncing(false);
        return;
      }

      setSyncing(true);
      try {
        const res = await productsApi.getForStaff();
        const warnings = syncWithLatestProducts(res.data);
        setSyncWarnings(warnings);

        if (warnings.length > 0) {
          addToast(
            lang === 'VI'
              ? 'Hệ thống vừa đối chiếu giá và tồn kho mới nhất từ CSDL. Vui lòng xem thông báo cập nhật bên dưới!'
              : 'Inventory & prices updated from server. Please review notifications below!',
            false,
          );
        }
      } catch (err) {
        console.warn('Không thể kết nối API để đối chiếu tồn kho:', err);
      } finally {
        setSyncing(false);
      }
    }

    verifyWithApi();
  }, []);

  const handleAuthSuccess = (loggedUser: CustomerProfile) => {
    setCustomer(loggedUser);
    setHoten(loggedUser.hoten || '');
    setSdt(loggedUser.sdt || '');
    setDiachi(loggedUser.diachi || '');
    setIsAuthModalOpen(false);
    addToast(
      lang === 'VI'
        ? `Xin chào ${loggedUser.hoten}! Đã đồng bộ thông tin nhận hàng.`
        : `Welcome ${loggedUser.hoten}! Shipping details synced.`,
      true,
    );
  };

  const handleRemoveInvalidItem = (masanpham: number) => {
    removeFromCart(masanpham);
    setSyncWarnings((prev) => prev.filter((w) => w.masanpham !== masanpham));
    addToast(lang === 'VI' ? 'Đã gỡ sản phẩm không hợp lệ khỏi giỏ hàng.' : 'Removed invalid product from cart.', true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // RÀNG BUỘC 1: Bắt buộc đăng nhập
    if (!customer) {
      addToast(lang === 'VI' ? 'Vui lòng đăng nhập tài khoản trước khi gửi yêu cầu đặt hàng!' : 'Please sign in before submitting your order!', false);
      setIsAuthModalOpen(true);
      return;
    }

    // RÀNG BUỘC 2: Kiểm tra giỏ hàng
    if (items.length === 0) {
      addToast(lang === 'VI' ? 'Giỏ hàng của bạn đang trống!' : 'Your cart is empty!', false);
      return;
    }

    // RÀNG BUỘC 3: Chặn nếu có sản phẩm ngừng kinh doanh hoặc hết hàng
    const hasDiscontinued = items.some((i) => i.discontinued);
    if (hasDiscontinued) {
      addToast(lang === 'VI' ? 'Giỏ hàng chứa sản phẩm đã ngừng kinh doanh. Vui lòng xóa trước khi đặt hàng!' : 'Cart contains discontinued items. Please remove them before ordering!', false);
      return;
    }

    const hasOutOfStock = items.some((i) => i.outOfStock || i.soluongton === 0);
    if (hasOutOfStock) {
      addToast(lang === 'VI' ? 'Giỏ hàng chứa sản phẩm đã hết hàng trong kho. Vui lòng gỡ bỏ trước khi tiếp tục!' : 'Cart contains out-of-stock items. Please remove them before proceeding!', false);
      return;
    }

    // RÀNG BUỘC 4: Kiểm tra thông tin người nhận
    if (!hoten.trim() || !sdt.trim() || !diachi.trim()) {
      addToast(lang === 'VI' ? 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng!' : 'Please fill in full name, phone number, and delivery address!', false);
      return;
    }

    setSubmitting(true);
    try {
      const res = await ordersApi.create({
        items: items.map((i) => ({
          masanpham: i.masanpham,
          soluong: i.soluong,
        })),
        phuongthucthanhtoan: paymentMethod,
        hotennguoinhan: hoten.trim(),
        sdtnguoinhan: sdt.trim(),
        diachigiaohang: diachi.trim(),
        ghichu: ghichu.trim() || undefined,
      });

      // Đặt hàng thành công
      setOrderSuccess(res.data);
      // Chỉ xóa các sản phẩm vừa đặt khỏi giỏ hàng
      items.forEach((i) => removeFromCart(i.masanpham));
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('selected_checkout_ids');
      }
    } catch (err: any) {
      addToast(err?.message || (lang === 'VI' ? 'Đặt hàng thất bại. Vui lòng kiểm tra lại tồn kho!' : 'Order failed. Please check stock!'), false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-xs text-slate-500 dark:text-slate-400">
        {lang === 'VI' ? 'Đang nạp dữ liệu thanh toán...' : 'Loading order details...'}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MÀN HÌNH ĐẶT HÀNG THÀNH CÔNG
  // ---------------------------------------------------------------------------
  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl space-y-6 text-center transition-colors">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div>
            <span className="inline-block rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
              {lang === 'VI' ? 'Đặt Hàng Thành Công' : 'Order Placed Successfully'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t('order_success_title')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {t('order_success_sub')}{' '}
              <strong className="text-amber-700 dark:text-amber-400 font-bold">
                {lang === 'VI' ? 'Chờ xác nhận (CHO_XAC_NHAN)' : 'Pending Confirmation (CHO_XAC_NHAN)'}
              </strong>.
            </p>
          </div>

          {/* Chi tiết tóm tắt đơn vừa đặt */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-5 text-left space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700 font-bold">
              <span className="text-slate-600 dark:text-slate-400">{t('order_code_label')}:</span>
              <span className="text-sky-600 dark:text-sky-400 text-sm font-black">#{orderSuccess.madonhang}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{t('recipient_label')}:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{hoten} - {sdt}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{t('delivery_address_label')}:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-right max-w-xs">{diachi}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{t('payment_method_title')}:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {paymentMethod === 'COD'
                  ? t('cod_label')
                  : t('bank_transfer_label')}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold">
              <span className="text-slate-900 dark:text-slate-100 text-sm">{t('total_payment')}:</span>
              <span className="text-rose-600 dark:text-rose-400 text-base font-black">
                {Number(orderSuccess.tongtien || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          {/* Hướng dẫn chuyển khoản nếu chọn CHUYEN_KHOAN */}
          {paymentMethod === 'CHUYEN_KHOAN' && (
            <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/40 p-5 text-left text-xs text-sky-950 dark:text-sky-200 space-y-2">
              <div className="font-bold text-sm text-sky-900 dark:text-sky-300 flex items-center gap-2">
                <QrCode className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span>{lang === 'VI' ? 'Thông Tin Chuyển Khoản Ngân Hàng (VietQR)' : 'VietQR Bank Transfer Details'}</span>
              </div>
              <p className="text-[11px] text-sky-800 dark:text-sky-300">
                {lang === 'VI' ? 'Quý khách vui lòng chuyển khoản với cú pháp:' : 'Please transfer with description:'}{' '}
                <strong>DH{orderSuccess.madonhang} {sdt}</strong>
              </p>
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-sky-200 dark:border-sky-800 space-y-1 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                <div>Ngân hàng: <strong>MB BANK (Ngân hàng Quân Đội)</strong></div>
                <div>Số tài khoản: <strong>090123456789</strong></div>
                <div>Chủ tài khoản: <strong>ISTORE VIETNAM</strong></div>
                <div>Số tiền: <strong>{Number(orderSuccess.tongtien || 0).toLocaleString('vi-VN')} ₫</strong></div>
              </div>
            </div>
          )}

          {/* Nút hành động */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/my-orders"
              className="rounded-xl bg-sky-600 px-6 py-3 text-xs font-bold text-white shadow hover:bg-sky-500 transition-colors flex items-center gap-1.5"
            >
              <span>{lang === 'VI' ? 'Xem Đơn Hàng Của Bạn' : 'View Your Orders'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {t('back_home_btn')}
            </Link>
          </div>
        </div>
      </div>
    );
  }



  // ---------------------------------------------------------------------------
  // GIAO DIỆN KHI GIỎ HÀNG RỖNG
  // ---------------------------------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {t('empty_cart_title')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {lang === 'VI'
            ? 'Vui lòng thêm sản phẩm vào giỏ trước khi tiến hành thanh toán.'
            : 'Please add products to your cart before proceeding with checkout.'}
        </p>
        <Link
          href="/products"
          className="inline-block rounded-xl bg-slate-900 dark:bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-sky-500"
        >
          ➔ {lang === 'VI' ? 'Chọn Sản Phẩm iPhone' : 'Explore iPhone Catalog'}
        </Link>
      </div>
    );
  }

  const totalAmount = items.reduce((sum, item) => sum + item.giaban * item.soluong, 0);
  const totalCount = items.reduce((sum, item) => sum + item.soluong, 0);
  const hasDiscontinued = items.some((i) => i.discontinued);
  const hasOutOfStock = items.some((i) => i.outOfStock || i.soluongton === 0);

  // Demo customers for quick login
  const demoCustomers = DEMO_USERS.filter((u) => u.role === 'KHACH_HANG');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Tiêu đề & Breadcrumb */}
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
          {t('home')} / {t('cart')} / {t('checkout_heading')}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <CreditCard className="h-7 w-7 text-sky-600 dark:text-sky-400" />
          <span>{t('checkout_heading')}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('checkout_sub')}
        </p>
      </div>

      {/* CẢNH BÁO ĐỐI CHIẾU TỒN KHO & GIÁ TỪ API */}
      {syncWarnings.length > 0 && (
        <div className="rounded-3xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{lang === 'VI' ? 'Thông Báo Đối Chiếu Dữ Liệu Tức Thời Từ API Hệ Thống:' : 'Real-time API Snapshot Alerts:'}</span>
          </div>

          <div className="space-y-2">
            {syncWarnings.map((w, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between rounded-xl bg-white/90 dark:bg-slate-900/90 p-3 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 gap-3"
              >
                <div>
                  <div className="font-bold">
                    [{w.type === 'PRICE_CHANGED'
                      ? (lang === 'VI' ? 'THAY ĐỔI GIÁ' : 'PRICE CHANGED')
                      : w.type === 'DISCONTINUED'
                        ? (lang === 'VI' ? 'NGỪNG KINH DOANH' : 'DISCONTINUED')
                        : w.type === 'OUT_OF_STOCK'
                          ? (lang === 'VI' ? 'HẾT HÀNG' : 'OUT OF STOCK')
                          : (lang === 'VI' ? 'ĐIỀU CHỈNH TỒN KHO' : 'STOCK ADJUSTED')}] {w.tensanpham}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{w.message}</div>
                </div>

                {(w.type === 'DISCONTINUED' || w.type === 'OUT_OF_STOCK') && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInvalidItem(w.masanpham)}
                    className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-500"
                  >
                    {lang === 'VI' ? 'Xóa Khỏi Giỏ' : 'Remove Item'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: Thông tin Khách hàng, Giao hàng, Phương thức (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Trạng thái Đăng nhập (Bắt buộc) */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 dark:bg-sky-600 text-white font-bold text-xs">
                    1
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                    {lang === 'VI' ? 'Tài Khoản Đặt Hàng' : 'Ordering Account'}
                  </h3>
                </div>

                {customer ? (
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>{lang === 'VI' ? 'Đã đăng nhập' : 'Signed In'}</span>
                  </span>
                ) : (
                  <span className="rounded-full bg-rose-50 dark:bg-rose-950/60 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    {lang === 'VI' ? 'Chưa đăng nhập' : 'Not Signed In'}
                  </span>
                )}
              </div>

              {customer ? (
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {customer.hoten} ({customer.tendangnhap})
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">{customer.email} • SĐT: {customer.sdt || 'Chưa có'}</div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 p-4 text-xs space-y-3">
                  <div className="font-bold text-rose-800 dark:text-rose-300 text-sm flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{lang === 'VI' ? 'Quy định hệ thống: Khách hàng phải đăng nhập trước khi gửi đơn hàng!' : 'Policy: Customer sign-in is required before placing orders!'}</span>
                  </div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">
                    {lang === 'VI'
                      ? 'Đăng nhập giúp bạn theo dõi lịch sử đơn hàng, cập nhật tình trạng giao nhận và hưởng chính sách bảo hành Apple Care.'
                      : 'Signing in allows tracking order history, checking delivery updates, and securing Apple Care warranties.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="rounded-xl bg-slate-900 dark:bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-sky-500 shadow"
                    >
                      {t('auth_required_btn')} ➔
                    </button>

                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lang === 'VI' ? 'hoặc chọn nhanh:' : 'or quick select:'}
                    </span>
                    {demoCustomers.map((c) => (
                      <button
                        key={c.mataikhoan}
                        type="button"
                        onClick={() => {
                          const user = authApi.loginDirect(c.tendangnhap);
                          if (user) handleAuthSuccess(user);
                        }}
                        className="rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {c.tendangnhap}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Thông tin Người nhận hàng */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 dark:bg-sky-600 text-white font-bold text-xs">
                  2
                </span>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  {t('recipient_info_title')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('recipient_name_label')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hoten}
                    onChange={(e) => setHoten(e.target.value)}
                    required
                    placeholder="Nguyễn Văn An"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('recipient_phone_label')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={sdt}
                    onChange={(e) => setSdt(e.target.value)}
                    required
                    placeholder="0901234567"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('recipient_address_label')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={diachi}
                    onChange={(e) => setDiachi(e.target.value)}
                    required
                    placeholder={lang === 'VI' ? 'Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP' : 'House number, street, ward, district, city'}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('order_note_label')}
                  </label>
                  <textarea
                    rows={2}
                    value={ghichu}
                    onChange={(e) => setGhichu(e.target.value)}
                    placeholder={lang === 'VI' ? 'Giao trong giờ hành chính, gọi trước khi giao...' : 'Deliver during business hours, call before delivery...'}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-xs focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Phương thức Thanh toán */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 dark:bg-sky-600 text-white font-bold text-xs">
                  3
                </span>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  {t('payment_method_title')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label
                  className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-slate-900 dark:border-sky-500 bg-slate-50 dark:bg-sky-950/40 ring-2 ring-slate-900/10 dark:ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-0.5 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                      <span>{t('cod_label')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {lang === 'VI'
                        ? 'Kiểm tra hàng trước khi thanh toán tiền mặt cho nhân viên giao hàng.'
                        : 'Inspect goods before paying cash to the courier.'}
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                    paymentMethod === 'CHUYEN_KHOAN'
                      ? 'border-sky-600 dark:border-sky-400 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-600/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CHUYEN_KHOAN"
                    checked={paymentMethod === 'CHUYEN_KHOAN'}
                    onChange={() => setPaymentMethod('CHUYEN_KHOAN')}
                    className="mt-0.5 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{t('bank_transfer_label')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {lang === 'VI'
                        ? 'Quét mã QR tự động điền số tiền và nội dung chuyển khoản.'
                        : 'Scan VietQR code with pre-filled amount and order syntax.'}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Xác nhận Sản phẩm & Tổng tiền (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  {lang === 'VI' ? `Xác Nhận Đơn Hàng (${totalCount} máy)` : `Order Confirmation (${totalCount} items)`}
                </h3>
                <Link
                  href="/cart"
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700"
                >
                  {lang === 'VI' ? 'Sửa giỏ hàng ➔' : 'Edit cart ➔'}
                </Link>
              </div>

              {/* Danh sách sản phẩm trong giỏ */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.masanpham} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center">
                        {item.hinhanh ? (
                          <img src={item.hinhanh} alt={item.tensanpham} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-xs text-slate-300">iPhone</span>
                        )}
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 dark:bg-sky-600 text-[10px] font-bold text-white">
                          {item.soluong}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{item.tensanpham}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.dungluong} • {item.mausac}
                        </div>
                        {item.priceChanged && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                            ({lang === 'VI' ? 'Giá vừa cập nhật' : 'Price updated'})
                          </span>
                        )}
                        {item.discontinued && (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block">
                            ({lang === 'VI' ? 'Đã ngừng bán!' : 'Discontinued!'})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {(item.giaban * item.soluong).toLocaleString('vi-VN')} ₫
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {item.giaban.toLocaleString('vi-VN')} ₫ / {t('units_left')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bảng tính chi phí */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
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
                  <span>{t('estimated_delivery_label')}:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{t('expected_delivery')}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{t('total_payment')}:</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{t('vat_included')}</span>
                  </div>
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {totalAmount.toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              </div>

              {/* Nút Đặt hàng */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || hasDiscontinued || hasOutOfStock}
                  className="w-full rounded-xl bg-slate-900 dark:bg-sky-600 py-4 text-xs sm:text-sm font-black text-white shadow-xl hover:bg-slate-800 dark:hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <span>
                    {submitting
                      ? (lang === 'VI' ? 'Đang gửi yêu cầu đặt hàng...' : 'Submitting order...')
                      : t('confirm_order_btn')}
                  </span>
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>

                {(hasDiscontinued || hasOutOfStock) && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold text-center mt-2">
                    {lang === 'VI'
                      ? 'Vui lòng gỡ bỏ các sản phẩm hết hàng hoặc ngừng kinh doanh trước khi đặt hàng.'
                      : 'Please remove out-of-stock or discontinued items before ordering.'}
                  </p>
                )}
              </div>
            </div>

            {/* Khối chính sách an toàn */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span>{lang === 'VI' ? 'Chính Sách Kiểm Tra Đơn Hàng An Toàn' : 'Secure Order Verification Policy'}</span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-500 dark:text-slate-400 leading-relaxed">
                <li>
                  {lang === 'VI'
                    ? 'Backend NestJS tự động kiểm tra lại tồn kho và giá bán trong CSDL trước khi tạo đơn hàng.'
                    : 'NestJS backend automatically verifies live inventory and pricing in the database before order creation.'}
                </li>
                <li>
                  {lang === 'VI'
                    ? 'Đơn hàng mới được lưu ở trạng thái CHO_XAC_NHAN, kho chỉ bị trừ khi nhân viên duyệt đơn.'
                    : 'New orders are recorded as CHO_XAC_NHAN; inventory is only deducted upon staff approval.'}
                </li>
                <li>
                  {lang === 'VI'
                    ? 'Khách hàng được quyền hủy đơn chờ duyệt bất kỳ lúc nào tại mục Đơn mua.'
                    : 'Customers can cancel pending orders at any time from their order history.'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Toast Alert */}
      <StoreToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
