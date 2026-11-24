'use client';

import {
  ArrowLeft,
  ArrowRight,
  Lock,
  LogIn,
  ShoppingBag,
  Trash2,
  Truck,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import StoreToast, { ToastMessage } from '../../../components/store/StoreToast';
import {
  authApi,
  CustomerProfile,
  openCustomerAuthModal,
} from '../../../services/auth.api';
import { useCartStore } from '../../../stores/cart.store';

export default function StoreCartPage() {
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
        `Không thể tăng thêm. Sản phẩm chỉ còn ${tonkho} máy trong kho!`,
        false,
      );
      return;
    }
    const res = updateQuantity(masanpham, nextQty);
    addToast(res.message, res.success);
  };

  const handleRemoveItem = (masanpham: number, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa "${name}" khỏi giỏ hàng?`)) {
      removeFromCart(masanpham);
      addToast(`Đã xóa "${name}" khỏi giỏ hàng.`, true);
    }
  };

  const handleClearCart = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) {
      clearCart();
      addToast('Đã làm rỗng giỏ hàng.', true);
    }
  };

  const handleProceedOrder = () => {
    if (!customer) {
      openCustomerAuthModal('Vui lòng đăng nhập để tiến hành đặt hàng!');
      return;
    }
    router.push('/checkout');
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-xs text-slate-500">
        Đang nạp dữ liệu giỏ hàng...
      </div>
    );
  }

  // NGHIỆP VỤ BẮT BUỘC: NẾU CHƯA ĐĂNG NHẬP -> HIỂN THỊ YÊU CẦU ĐĂNG NHẬP
  if (!customer) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-14 text-center space-y-6 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50 text-sky-600 mx-auto shadow-inner border border-sky-100">
            <Lock className="h-9 w-9 text-sky-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Yêu Cầu Đăng Nhập Tài Khoản
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Theo quy định mua sắm tại iStore, khách hàng cần đăng nhập tài khoản để xem, quản lý giỏ hàng và thực hiện quy trình đặt hàng an toàn.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openCustomerAuthModal('Vui lòng đăng nhập để xem và quản lý giỏ hàng!')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-slate-800 transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Đăng Nhập Hoặc Đăng Ký Ngay</span>
            </button>

            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-5 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
            >
              <span>Xem Danh Sách iPhone</span>
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
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 mb-1">
            Trang chủ / Giỏ hàng mua sắm
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="h-7 w-7 text-sky-600" />
            <span>Giỏ Hàng Của Bạn</span>
          </h1>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearCart}
            className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Xóa tất cả</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        /* Giao diện Giỏ Hàng Trống */
        <div className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-20 text-center space-y-5 shadow-sm max-w-2xl mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto">
            <ShoppingBag className="h-10 w-10 text-slate-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Giỏ hàng của bạn đang trống!
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Hãy khám phá các dòng iPhone 16 Pro Max, iPhone 15 Series chính hãng với nhiều ưu đãi và thêm vào giỏ hàng ngay.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-slate-800 transition-all"
            >
              <span>Khám Phá Sản Phẩm Ngay</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Giao diện Giỏ Hàng Có Sản Phẩm */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột Trái: Danh sách sản phẩm (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm divide-y divide-slate-100">
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
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-50 p-2 flex items-center justify-center border border-slate-100 hover:border-slate-300 transition-all"
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
                        <div className="text-[11px] font-bold text-sky-600">
                          {item.tendanhmuc || 'iPhone'} • SKU: {item.sku}
                        </div>
                        <Link
                          href={`/products/${item.masanpham}`}
                          className="font-bold text-slate-900 text-sm hover:text-sky-600 transition-colors line-clamp-1"
                        >
                          {item.tensanpham}
                        </Link>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>Bản: <strong>{item.dungluong}</strong></span>
                          <span>•</span>
                          <span>Màu: <strong>{item.mausac}</strong></span>
                        </div>
                        <div className="text-xs font-bold text-rose-600 sm:hidden">
                          {item.giaban.toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                    </div>

                    {/* Đơn giá (desktop) */}
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-bold text-slate-900">
                        {item.giaban.toLocaleString('vi-VN')} ₫
                      </div>
                      <div className="text-[10px] text-slate-400">Đơn giá</div>
                    </div>

                    {/* Bộ đếm số lượng (Chặn vượt tồn kho) */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                      <div className="flex items-center rounded-xl border border-slate-300 bg-white p-0.5 shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.masanpham, item.soluong, -1, item.soluongton)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-xs font-black text-slate-900">
                          {item.soluong}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.masanpham, item.soluong, 1, item.soluongton)}
                          disabled={isMax}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                          title={isMax ? `Kho chỉ còn ${item.soluongton} máy` : 'Tăng số lượng'}
                        >
                          +
                        </button>
                      </div>

                      {isMax && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Tối đa ({item.soluongton} máy)
                        </span>
                      )}
                    </div>

                    {/* Thành tiền & Nút Xóa */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-black text-rose-600">
                          {(item.giaban * item.soluong).toLocaleString('vi-VN')} ₫
                        </div>
                        <div className="text-[10px] text-slate-400 sm:block hidden">Thành tiền</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.masanpham, item.tensanpham)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Thông báo chính sách giao hàng */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center gap-3 text-xs text-emerald-950">
              <Truck className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Đơn hàng của bạn đủ điều kiện Miễn Phí Vận Chuyển toàn quốc!</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Giao nhanh trong 2 giờ tại TP.HCM & Hà Nội, 24-48 giờ trên toàn quốc.
                </p>
              </div>
            </div>
          </div>

          {/* Cột Phải: Tóm Tắt Đơn Hàng (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100">
                Tóm Tắt Đơn Hàng
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Khách hàng đặt:</span>
                  <span className="font-bold text-slate-900">{customer.hoten}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Số lượng sản phẩm:</span>
                  <span className="font-bold text-slate-900">{totalCount} máy</span>
                </div>

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
                  <span>Bảo hành chính hãng:</span>
                  <span className="font-bold text-slate-900">12 Tháng Apple Care</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Tổng thanh toán:</span>
                  <span className="text-[11px] text-slate-400">(Đã bao gồm thuế VAT)</span>
                </div>
                <div className="text-2xl font-black text-rose-600 tracking-tight">
                  {totalAmount.toLocaleString('vi-VN')} ₫
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleProceedOrder}
                  className="w-full rounded-xl bg-slate-900 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <span>Tiến Hành Đặt Hàng & Thanh Toán</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <Link
                  href="/products"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Tiếp Tục Chọn Sản Phẩm Khác</span>
                </Link>
              </div>
            </div>

            {/* Thông tin hỗ trợ */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-500 space-y-1.5">
              <div className="font-bold text-slate-800">Cần tư vấn hỗ trợ?</div>
              <p className="text-[11px] leading-relaxed">
                Gọi ngay hotline miễn phí <strong>1800 6868</strong> để được chuyên viên iStore tư vấn chi tiết về cấu hình máy và chính sách thanh toán.
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
