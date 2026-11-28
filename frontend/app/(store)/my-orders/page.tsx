'use client';

import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import StoreToast, { ToastMessage } from '../../../components/store/StoreToast';
import { useLanguage } from '../../../contexts/LanguageContext';
import { authApi, CustomerProfile, openCustomerAuthModal } from '../../../services/auth.api';
import { OrderItem, ordersApi } from '../../../services/orders.api';

export default function MyOrdersPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, isSuccess: boolean) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type: isSuccess ? 'success' : 'warning' }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      console.warn('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const curCustomer = authApi.getCurrentCustomer();
    setCustomer(curCustomer);

    const handleAuth = () => {
      setCustomer(authApi.getCurrentCustomer());
    };
    window.addEventListener('auth-change', handleAuth);
    return () => window.removeEventListener('auth-change', handleAuth);
  }, []);

  useEffect(() => {
    if (mounted && customer) {
      fetchMyOrders();
    } else if (mounted && !customer) {
      setLoading(false);
    }
  }, [mounted, customer]);

  // Khách bấm "Xác nhận đã nhận hàng"
  const handleConfirmReceived = async (orderId: number) => {
    if (!confirm(lang === 'VI' ? `Bạn xác nhận đã nhận được kiện hàng cho đơn #${orderId}?` : `Confirm receipt for order #${orderId}?`)) {
      return;
    }
    setConfirmingId(orderId);
    try {
      const res = await ordersApi.confirmReceipt(orderId);
      addToast(
        res.message || (lang === 'VI' ? 'Xác nhận nhận hàng thành công!' : 'Order received confirmed!'),
        true,
      );
      await fetchMyOrders();
      setActiveTab('HOAN_THANH');
    } catch (err: any) {
      addToast(err?.message || (lang === 'VI' ? 'Lỗi xác nhận đơn hàng' : 'Error confirming receipt'), false);
    } finally {
      setConfirmingId(null);
    }
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-xs text-slate-500 dark:text-slate-400">
        {lang === 'VI' ? 'Đang nạp dữ liệu đơn hàng...' : 'Loading your orders...'}
      </div>
    );
  }

  // Nếu chưa đăng nhập: Yêu cầu đăng nhập để xem đơn hàng
  if (!customer) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-14 text-center space-y-6 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto border border-sky-100 dark:border-sky-800">
            <ShoppingBag className="h-9 w-9 text-sky-600 dark:text-sky-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {lang === 'VI' ? 'Xem Đơn Hàng Của Bạn' : 'View Your Orders'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {lang === 'VI'
                ? 'Vui lòng đăng nhập tài khoản Khách Hàng để kiểm tra lịch sử đơn hàng, tiến độ giao hàng và xác nhận nhận hàng.'
                : 'Please sign in to view your orders, delivery status, and confirm receipts.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => openCustomerAuthModal(lang === 'VI' ? 'Vui lòng đăng nhập để xem đơn hàng!' : 'Please sign in to view orders!')}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-slate-800 dark:hover:bg-sky-500 transition-all"
            >
              <span>{t('auth_required_btn')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Lọc đơn hàng theo tab
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    return o.trangthai === activeTab;
  });

  const pendingCount = orders.filter((o) => o.trangthai === 'CHO_XAC_NHAN').length;
  const shippingCount = orders.filter((o) => o.trangthai === 'DANG_GIAO').length;
  const completedCount = orders.filter((o) => o.trangthai === 'HOAN_THANH').length;
  const cancelledCount = orders.filter((o) => o.trangthai === 'DA_HUY').length;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'CHO_XAC_NHAN':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="h-3 w-3 text-amber-600" />
            <span>{lang === 'VI' ? 'Chờ Duyệt' : 'Pending'}</span>
          </span>
        );
      case 'DA_XAC_NHAN':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 text-xs font-bold text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
            <CheckCircle2 className="h-3 w-3 text-sky-600" />
            <span>{lang === 'VI' ? 'Đã Duyệt (Đang chuẩn bị)' : 'Confirmed'}</span>
          </span>
        );
      case 'DANG_GIAO':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Truck className="h-3 w-3 text-indigo-600" />
            <span>{lang === 'VI' ? 'Đang Giao Đến Bạn' : 'Out for Delivery'}</span>
          </span>
        );
      case 'HOAN_THANH':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>{lang === 'VI' ? 'Hoàn Thành' : 'Completed'}</span>
          </span>
        );
      case 'DA_HUY':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <XCircle className="h-3 w-3 text-rose-600" />
            <span>{lang === 'VI' ? 'Đã Hủy' : 'Cancelled'}</span>
          </span>
        );
      default:
        return <span className="text-xs font-bold text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Tiêu đề & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            {t('home')} / {lang === 'VI' ? 'Lịch sử mua hàng' : 'Order History'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Package className="h-7 w-7 text-sky-600 dark:text-sky-400" />
            <span>{lang === 'VI' ? 'Đơn Hàng Của Bạn' : 'Your Orders'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'VI'
              ? 'Theo dõi quy trình: Chờ duyệt ➔ Đã duyệt ➔ Đang giao đến bạn ➔ Bấm xác nhận đã nhận đơn ➔ Hoàn thành'
              : 'Track status: Pending ➔ Confirmed ➔ Out for delivery ➔ Confirm receipt ➔ Completed'}
          </p>
        </div>

        <button
          onClick={fetchMyOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{lang === 'VI' ? 'Làm mới' : 'Refresh'}</span>
        </button>
      </div>

      {/* Tabs Phân Loại Trạng Thái */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { key: 'ALL', label: lang === 'VI' ? 'Tất cả' : 'All', count: orders.length },
          { key: 'CHO_XAC_NHAN', label: lang === 'VI' ? 'Chờ duyệt' : 'Pending', count: pendingCount },
          { key: 'DANG_GIAO', label: lang === 'VI' ? 'Đang giao đến bạn' : 'Shipping', count: shippingCount },
          { key: 'HOAN_THANH', label: lang === 'VI' ? 'Hoàn thành' : 'Completed', count: completedCount },
          { key: 'DA_HUY', label: lang === 'VI' ? 'Đã hủy' : 'Cancelled', count: cancelledCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white dark:bg-sky-600 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Danh sách đơn hàng */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-sky-600 border-t-transparent mb-2" />
          <div>{lang === 'VI' ? 'Đang tải đơn hàng...' : 'Loading orders...'}</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto">
            <Package className="h-8 w-8 text-slate-400" />
          </div>
          <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            {lang === 'VI' ? 'Không có đơn hàng nào trong mục này.' : 'No orders in this section.'}
          </div>
          <Link
            href="/products"
            className="inline-block rounded-xl bg-slate-900 dark:bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-sky-500"
          >
            ➔ {lang === 'VI' ? 'Tiếp tục mua sắm' : 'Continue Shopping'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isShipping = order.trangthai === 'DANG_GIAO';
            const isOperating = confirmingId === order.madonhang;

            return (
              <div
                key={order.madonhang}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4 transition-colors"
              >
                {/* Header card đơn hàng */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-sky-600 dark:text-sky-400">
                      #{order.madonhang}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(order.ngaydat).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>

                  <div>{renderStatusBadge(order.trangthai)}</div>
                </div>

                {/* Danh sách sản phẩm trong đơn */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.CHI_TIET_DON_HANG?.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 p-1 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                          {item.SAN_PHAM?.hinhanh ? (
                            <img
                              src={item.SAN_PHAM.hinhanh}
                              alt={item.SAN_PHAM.tensanpham}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400">iPhone</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {item.SAN_PHAM?.tensanpham || 'iPhone'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.SAN_PHAM?.dungluong} • {item.SAN_PHAM?.mausac} • x{item.soluong}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {(item.dongia * item.soluong).toLocaleString('vi-VN')} ₫
                        </div>
                        <div className="text-[10px] text-slate-400">{item.dongia.toLocaleString('vi-VN')} ₫ / máy</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer đơn: Tổng tiền, địa chỉ & NÚT XÁC NHẬN NHẬN HÀNG */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <div>
                      <span>{lang === 'VI' ? 'Người nhận:' : 'Recipient:'} </span>
                      <strong className="text-slate-900 dark:text-slate-100">
                        {order.KHACH_HANG?.hoten} - {order.KHACH_HANG?.sdt}
                      </strong>
                    </div>
                    {order.KHACH_HANG?.diachi && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lang === 'VI' ? 'Giao đến:' : 'Address:'} {order.KHACH_HANG.diachi}
                      </div>
                    )}
                    {order.ghichu && (
                      <div className="text-[11px] text-slate-500 italic">
                        {lang === 'VI' ? 'Ghi chú / ĐVVC:' : 'Note:'} {order.ghichu}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">{t('total_payment')}:</div>
                      <div className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">
                        {order.tongtien.toLocaleString('vi-VN')} ₫
                      </div>
                    </div>

                    {/* NÚT XÁC NHẬN ĐÃ NHẬN HÀNG: HIỆN KHI ĐƠN ĐANG GIAO ĐẾN BẠN */}
                    {isShipping && (
                      <button
                        type="button"
                        onClick={() => handleConfirmReceived(order.madonhang)}
                        disabled={isOperating}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{isOperating ? (lang === 'VI' ? 'Đang xác nhận...' : 'Processing...') : (lang === 'VI' ? 'Xác nhận đã nhận hàng' : 'Confirm Receipt')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <StoreToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
