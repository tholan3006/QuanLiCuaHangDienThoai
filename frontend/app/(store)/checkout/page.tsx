'use client';

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  QrCode,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import AuthModal from '../../../components/store/AuthModal';
import StoreToast, { ToastMessage } from '../../../components/store/StoreToast';
import { authApi, CustomerProfile, DEMO_CUSTOMERS } from '../../../services/auth.api';
import { ordersApi } from '../../../services/orders.api';
import { productsApi } from '../../../services/products.api';
import { CartSyncWarning, useCartStore } from '../../../stores/cart.store';

export default function StoreCheckoutPage() {
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

  const items = useCartStore((state) => state.items);
  const syncWithLatestProducts = useCartStore((state) => state.syncWithLatestProducts);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalAmount = useCartStore((state) => state.getTotalAmount);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

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
            'Hệ thống vừa đối chiếu giá và tồn kho mới nhất từ CSDL. Vui lòng xem thông báo cập nhật bên dưới!',
            false,
          );
        }
      } catch (err) {
        console.warn('Không thể kết nối API để đối chiếu tồn kho:', err);
      } finally {
        setSyncing(false);
      }
    }

    if (mounted) {
      verifyWithApi();
    }
  }, [mounted, syncWithLatestProducts]);

  // Cập nhật form khi đăng nhập thành công
  const handleAuthSuccess = (c: CustomerProfile) => {
    setCustomer(c);
    setHoten(c.hoten || '');
    setSdt(c.sdt || '');
    setDiachi(c.diachi || '');
    addToast(`Đăng nhập thành công! Xin chào ${c.hoten}.`, true);
  };

  // Xóa sản phẩm bị ngừng bán hoặc hết hàng
  const handleRemoveInvalidItem = (masanpham: number) => {
    removeFromCart(masanpham);
    setSyncWarnings((prev) => prev.filter((w) => w.masanpham !== masanpham));
    addToast('Đã gỡ sản phẩm không hợp lệ khỏi giỏ hàng.', true);
  };

  // Xử lý Gửi Đơn Đặt Hàng
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Bắt buộc đăng nhập
    if (!customer) {
      setIsAuthModalOpen(true);
      addToast('Vui lòng đăng nhập tài khoản trước khi gửi yêu cầu đặt hàng!', false);
      return;
    }

    // 2. Kiểm tra giỏ hàng
    if (items.length === 0) {
      addToast('Giỏ hàng đang trống, không thể đặt hàng.', false);
      return;
    }

    // 3. Kiểm tra sản phẩm ngừng kinh doanh hoặc hết hàng
    const invalidItems = items.filter((i) => i.discontinued || i.outOfStock || i.soluongton === 0);
    if (invalidItems.length > 0) {
      addToast(
        'Trong giỏ có sản phẩm đã ngừng kinh doanh hoặc hết hàng. Vui lòng xóa trước khi đặt hàng!',
        false,
      );
      return;
    }

    // 4. Kiểm tra thông tin nhận hàng
    if (!hoten.trim() || !sdt.trim() || !diachi.trim()) {
      addToast('Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng.', false);
      return;
    }

    setSubmitting(true);
    try {
      // Gửi yêu cầu đặt hàng tới API Backend TV4 (POST /orders)
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

      // Lưu thông tin người nhận vào profile khách hàng
      authApi.updateProfile({
        hoten: hoten.trim(),
        sdt: sdt.trim(),
        diachi: diachi.trim(),
      });

      // Đặt hàng thành công
      setOrderSuccess(res.data);
      clearCart();
    } catch (err: any) {
      addToast(err?.message || 'Đặt hàng thất bại. Vui lòng kiểm tra lại tồn kho!', false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-xs text-slate-500">
        Đang nạp dữ liệu thanh toán...
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MÀN HÌNH ĐẶT HÀNG THÀNH CÔNG
  // ---------------------------------------------------------------------------
  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl space-y-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          <div>
            <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 mb-2">
              Đặt Hàng Thành Công
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Cảm Ơn Quý Khách Đã Đặt Hàng!
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Đơn hàng của bạn đã được tiếp nhận và ghi nhận ở trạng thái{' '}
              <strong className="text-amber-700 font-bold">Chờ xác nhận (CHO_XAC_NHAN)</strong>.
            </p>
          </div>

          {/* Chi tiết tóm tắt đơn vừa đặt */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-slate-200 font-bold">
              <span className="text-slate-600">Mã đơn hàng:</span>
              <span className="text-sky-600 text-sm font-black">#{orderSuccess.madonhang}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">Người nhận hàng:</span>
              <span className="font-bold text-slate-900">{hoten} - {sdt}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">Địa chỉ giao:</span>
              <span className="font-bold text-slate-900 text-right max-w-xs">{diachi}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">Phương thức:</span>
              <span className="font-bold text-slate-900">
                {paymentMethod === 'COD'
                  ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                  : 'Chuyển khoản ngân hàng (VietQR)'}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
              <span className="text-slate-900 text-sm">Tổng thanh toán:</span>
              <span className="text-rose-600 text-base font-black">
                {Number(orderSuccess.tongtien || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          {/* Hướng dẫn chuyển khoản nếu chọn CHUYEN_KHOAN */}
          {paymentMethod === 'CHUYEN_KHOAN' && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 text-left text-xs text-sky-950 space-y-2">
              <div className="font-bold text-sm text-sky-900 flex items-center gap-2">
                <QrCode className="h-4 w-4 text-sky-600" />
                <span>Thông Tin Chuyển Khoản Ngân Hàng (VietQR)</span>
              </div>
              <p className="text-[11px] text-sky-800">
                Quý khách vui lòng chuyển khoản với cú pháp: <strong>DH{orderSuccess.madonhang} {sdt}</strong>
              </p>
              <div className="bg-white p-3.5 rounded-xl border border-sky-200 space-y-1 font-mono text-[11px] text-slate-800">
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
              href="/"
              className="rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow hover:bg-slate-800 transition-colors"
            >
              ➔ Về Trang Chủ Tiếp Tục Mua Sắm
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
        <h2 className="text-xl font-bold text-slate-900">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-xs text-slate-500">
          Vui lòng thêm sản phẩm vào giỏ trước khi tiến hành thanh toán.
        </p>
        <Link
          href="/products"
          className="inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
        >
          ➔ Chọn Sản Phẩm iPhone
        </Link>
      </div>
    );
  }

  const totalAmount = getTotalAmount();
  const totalCount = getTotalItems();
  const hasDiscontinued = items.some((i) => i.discontinued);
  const hasOutOfStock = items.some((i) => i.outOfStock || i.soluongton === 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Tiêu đề & Breadcrumb */}
      <div>
        <div className="text-xs text-slate-500 mb-1">
          Trang chủ / Giỏ hàng / Đặt hàng & Thanh toán
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <CreditCard className="h-7 w-7 text-sky-600" />
          <span>Đặt Hàng & Thanh Toán (Checkout)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Vui lòng kiểm tra thông tin người nhận, danh sách sản phẩm và đối chiếu giá bán trước khi gửi đơn hàng.
        </p>
      </div>

      {/* CẢNH BÁO ĐỐI CHIẾU TỒN KHO & GIÁ TỪ API */}
      {syncWarnings.length > 0 && (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Thông Báo Đối Chiếu Dữ Liệu Tức Thời Từ API Hệ Thống:</span>
          </div>

          <div className="space-y-2">
            {syncWarnings.map((w, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between rounded-xl bg-white/90 p-3 border border-amber-200 text-xs text-amber-900 gap-3"
              >
                <div>
                  <div className="font-bold">
                    [{w.type === 'PRICE_CHANGED'
                      ? 'THAY ĐỔI GIÁ'
                      : w.type === 'DISCONTINUED'
                        ? 'NGỪNG KINH DOANH'
                        : w.type === 'OUT_OF_STOCK'
                          ? 'HẾT HÀNG'
                          : 'ĐIỀU CHỈNH TỒN KHO'}] {w.tensanpham}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{w.message}</div>
                </div>

                {(w.type === 'DISCONTINUED' || w.type === 'OUT_OF_STOCK') && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInvalidItem(w.masanpham)}
                    className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-500"
                  >
                    Xóa Khỏi Giỏ
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
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">
                    1
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Tài Khoản Đặt Hàng
                  </h3>
                </div>

                {customer ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Đã đăng nhập</span>
                  </span>
                ) : (
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                    Chưa đăng nhập
                  </span>
                )}
              </div>

              {customer ? (
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {customer.hoten} ({customer.tendangnhap})
                    </div>
                    <div className="text-slate-500">{customer.email} • SĐT: {customer.sdt || 'Chưa có'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Đổi tài khoản
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs space-y-3">
                  <div className="font-bold text-rose-800 text-sm flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Quy định hệ thống: Khách hàng phải đăng nhập trước khi gửi đơn hàng!</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    Đăng nhập giúp bạn theo dõi lịch sử đơn hàng, cập nhật tình trạng giao nhận và hưởng chính sách bảo hành Apple Care.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow"
                    >
                      Đăng Nhập Ngay ➔
                    </button>

                    <span className="text-[11px] text-slate-500">hoặc chọn nhanh:</span>
                    {DEMO_CUSTOMERS.map((c, idx) => (
                      <button
                        key={c.mataikhoan}
                        type="button"
                        onClick={() => {
                          const user = authApi.loginDemo(idx);
                          handleAuthSuccess(user);
                        }}
                        className="rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                      >
                        {c.tendangnhap}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Thông tin Người nhận hàng */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">
                  2
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Thông Tin Người Nhận & Địa Chỉ Giao Hàng
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên người nhận <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hoten}
                    onChange={(e) => setHoten(e.target.value)}
                    required
                    placeholder="Nguyễn Văn An"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-sky-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={sdt}
                    onChange={(e) => setSdt(e.target.value)}
                    required
                    placeholder="0901234567"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-sky-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Địa chỉ nhận hàng chi tiết <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={diachi}
                    onChange={(e) => setDiachi(e.target.value)}
                    required
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-sky-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ghi chú đơn hàng (Tùy chọn)
                  </label>
                  <textarea
                    rows={2}
                    value={ghichu}
                    onChange={(e) => setGhichu(e.target.value)}
                    placeholder="Giao trong giờ hành chính, gọi trước khi giao..."
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:border-sky-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Phương thức Thanh toán */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">
                  3
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Chọn Phương Thức Thanh Toán
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label
                  className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
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
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-slate-700" />
                      <span>Thanh toán khi nhận hàng (COD)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kiểm tra hàng trước khi thanh toán tiền mặt cho nhân viên giao hàng.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                    paymentMethod === 'CHUYEN_KHOAN'
                      ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-600/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
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
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5 text-sky-600" />
                      <span>Chuyển khoản ngân hàng (VietQR)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Quét mã QR tự động điền số tiền và nội dung chuyển khoản.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Xác nhận Sản phẩm & Tổng tiền (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Xác Nhận Đơn Hàng ({totalCount} máy)
                </h3>
                <Link
                  href="/cart"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700"
                >
                  Sửa giỏ hàng ➔
                </Link>
              </div>

              {/* Danh sách sản phẩm trong giỏ */}
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.masanpham} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center">
                        {item.hinhanh ? (
                          <img src={item.hinhanh} alt={item.tensanpham} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-xs text-slate-300">iPhone</span>
                        )}
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                          {item.soluong}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{item.tensanpham}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.dungluong} • {item.mausac}
                        </div>
                        {item.priceChanged && (
                          <span className="text-[10px] font-bold text-amber-600 block">
                            (Giá vừa cập nhật)
                          </span>
                        )}
                        {item.discontinued && (
                          <span className="text-[10px] font-bold text-rose-600 block">
                            (Đã ngừng bán!)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-900">
                        {(item.giaban * item.soluong).toLocaleString('vi-VN')} ₫
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.giaban.toLocaleString('vi-VN')} ₫ / máy
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bảng tính chi phí */}
              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính tiền hàng:</span>
                  <span className="font-bold text-slate-900">
                    {totalAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-bold text-emerald-600">Miễn phí (0 ₫)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Thời gian giao hàng dự kiến:</span>
                  <span className="font-bold text-slate-900">1 - 2 ngày làm việc</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Tổng thanh toán:</span>
                    <span className="text-[10px] text-slate-400">Đã bao gồm VAT</span>
                  </div>
                  <div className="text-2xl font-black text-rose-600">
                    {totalAmount.toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              </div>

              {/* Nút Đặt hàng */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || hasDiscontinued || hasOutOfStock}
                  className="w-full rounded-xl bg-slate-900 py-4 text-xs sm:text-sm font-black text-white shadow-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <span>{submitting ? 'Đang gửi yêu cầu đặt hàng...' : 'XÁC NHẬN ĐẶT HÀNG NGAY'}</span>
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>

                {(hasDiscontinued || hasOutOfStock) && (
                  <p className="text-[11px] text-rose-600 font-semibold text-center mt-2">
                    Vui lòng gỡ bỏ các sản phẩm hết hàng hoặc ngừng kinh doanh trước khi đặt hàng.
                  </p>
                )}
              </div>
            </div>

            {/* Khối chính sách an toàn */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2 text-xs text-slate-600">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sky-600" />
                <span>Chính Sách Kiểm Tra Đơn Hàng An Toàn</span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-500 leading-relaxed">
                <li>Backend NestJS tự động kiểm tra lại tồn kho và giá bán trong CSDL trước khi tạo đơn hàng.</li>
                <li>Đơn hàng mới được lưu ở trạng thái <code>CHO_XAC_NHAN</code>, kho chỉ bị trừ khi nhân viên duyệt đơn.</li>
                <li>Khách hàng được quyền hủy đơn chờ duyệt bất kỳ lúc nào tại mục Đơn mua.</li>
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
