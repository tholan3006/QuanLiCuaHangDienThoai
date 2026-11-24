'use client';

import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  MapPin,
  Package,
  Phone,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  User,
  X,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { OrderItem, ordersApi } from '../../../services/orders.api';

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getAllForStaff(filterStatus);
      setOrders(data);
    } catch (err: any) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleApprove = async (id: number) => {
    if (!confirm(`Bạn có chắc chắn muốn duyệt đơn hàng #${id}? Số lượng tồn kho sẽ tự động giảm đi.`)) {
      return;
    }
    setActionLoading(id);
    setAlertMsg(null);
    try {
      const res = await ordersApi.approveOrder(id);
      setAlertMsg({ text: res.message });
      await fetchOrders();
      if (selectedOrder?.madonhang === id) {
        const updated = await ordersApi.getById(id);
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      setAlertMsg({ text: err?.message || 'Lỗi khi duyệt đơn hàng', isError: true });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: number) => {
    const reason = prompt(`Nhập lý do hủy đơn hàng #${id}:`, 'Khách yêu cầu hủy hoặc sai thông tin');
    if (!reason) return;

    setActionLoading(id);
    setAlertMsg(null);
    try {
      const res = await ordersApi.cancel(id, reason);
      setAlertMsg({ text: res.message });
      await fetchOrders();
      if (selectedOrder?.madonhang === id) {
        const updated = await ordersApi.getById(id);
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      setAlertMsg({ text: err?.message || 'Lỗi khi hủy đơn hàng', isError: true });
    } finally {
      setActionLoading(null);
    }
  };

  // Lọc theo từ khóa tìm kiếm
  const filteredOrders = orders.filter((o) => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase();
    const matchId = String(o.madonhang).includes(kw);
    const matchName = o.KHACH_HANG?.hoten?.toLowerCase().includes(kw);
    const matchPhone = o.KHACH_HANG?.sdt?.includes(kw);
    return matchId || matchName || matchPhone;
  });

  // Thống kê nhanh
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.trangthai === 'CHO_XAC_NHAN').length;
  const approvedCount = orders.filter((o) => o.trangthai === 'DA_XAC_NHAN').length;
  const completedCount = orders.filter((o) => o.trangthai === 'HOAN_THANH').length;
  const revenue = orders
    .filter((o) => o.trangthai === 'HOAN_THANH' || o.trangthai === 'DA_XAC_NHAN')
    .reduce((sum, o) => sum + o.tongtien, 0);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'CHO_XAC_NHAN':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3 text-amber-600" />
            <span>Chờ Duyệt</span>
          </span>
        );
      case 'DA_XAC_NHAN':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 border border-sky-200">
            <CheckCircle2 className="h-3 w-3 text-sky-600" />
            <span>Đã Duyệt</span>
          </span>
        );
      case 'DANG_GIAO':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
            <Truck className="h-3 w-3 text-indigo-600" />
            <span>Đang Giao</span>
          </span>
        );
      case 'HOAN_THANH':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            <span>Hoàn Thành</span>
          </span>
        );
      case 'DA_HUY':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3 text-rose-600" />
            <span>Đã Hủy</span>
          </span>
        );
      default:
        return <span className="text-xs font-bold text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang & Quy định nghiệp vụ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            Phân hệ Quản lý Bán hàng • Mục A4 (20 điểm)
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý & Duyệt Đơn Hàng iPhone
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Quy tắc nghiệp vụ: Khi duyệt đơn hàng, số máy trong kho sẽ <strong>tự động giảm</strong>. Khi hủy đơn, số lượng sẽ <strong>được hoàn lại kho</strong>.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* Thông báo thao tác */}
      {alertMsg && (
        <div
          className={`rounded-2xl p-4 text-xs font-semibold flex items-center justify-between border ${
            alertMsg.isError
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.isError ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            )}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="text-gray-400 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Thẻ Thống Kê Nhanh */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">Tổng Đơn Hàng</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Trên toàn hệ thống</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <div className="text-xs font-semibold text-amber-700">Chờ Duyệt (Cần Xử Lý)</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Chưa trừ kho</div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 shadow-sm">
          <div className="text-xs font-semibold text-sky-700">Đã Duyệt / Đang Giao</div>
          <div className="text-2xl font-black text-sky-600 mt-1">{approvedCount}</div>
          <div className="text-[11px] text-sky-600 mt-0.5">Đã trừ kho máy</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700">Doanh Thu Ghi Nhận</div>
          <div className="text-xl font-black text-emerald-600 mt-1 truncate">
            {revenue.toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Đơn duyệt & hoàn thành</div>
        </div>
      </div>

      {/* Thanh Bộ Lọc & Tìm Kiếm */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Lọc Trạng Thái */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'CHO_XAC_NHAN', label: 'Chờ duyệt' },
            { key: 'DA_XAC_NHAN', label: 'Đã duyệt' },
            { key: 'HOAN_THANH', label: 'Hoàn thành' },
            { key: 'DA_HUY', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                filterStatus === tab.key
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ô Tìm Kiếm */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo mã đơn, tên, SĐT khách..."
            className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        </div>
      </div>

      {/* Bảng Danh Sách Đơn Hàng */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-4 py-3.5">Mã Đơn</th>
              <th className="px-4 py-3.5">Khách Hàng & Liên Hệ</th>
              <th className="px-4 py-3.5">Sản Phẩm Đặt Mua</th>
              <th className="px-4 py-3.5 text-right">Tổng Tiền</th>
              <th className="px-4 py-3.5">Thanh Toán</th>
              <th className="px-4 py-3.5">Trạng Thái</th>
              <th className="px-4 py-3.5 text-center">Thao Tác Quản Lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-xs text-gray-500">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
                  <div>Đang tải dữ liệu đơn hàng...</div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-xs text-gray-400">
                  Không tìm thấy đơn hàng nào khớp với điều kiện lọc.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isPending = order.trangthai === 'CHO_XAC_NHAN';
                const isApproved = order.trangthai === 'DA_XAC_NHAN';
                const isOperating = actionLoading === order.madonhang;

                return (
                  <tr key={order.madonhang} className="hover:bg-gray-50/60 transition-colors">
                    {/* Mã Đơn & Ngày Đặt */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-mono font-bold text-gray-900">
                        #{order.madonhang}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(order.ngaydat).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </td>

                    {/* Khách Hàng */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-bold text-gray-900">
                        {order.KHACH_HANG?.hoten || 'Khách vãng lai'}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        <span>{order.KHACH_HANG?.sdt || 'Chưa có SĐT'}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">
                        {order.KHACH_HANG?.diachi || 'Giao tại cửa hàng'}
                      </div>
                    </td>

                    {/* Sản Phẩm */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="space-y-1">
                        {order.CHI_TIET_DON_HANG?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              {item.SAN_PHAM?.tensanpham || 'iPhone'}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              ({item.SAN_PHAM?.dungluong} - {item.SAN_PHAM?.mausac})
                            </span>
                            <span className="rounded bg-gray-100 px-1.5 py-0.2 text-[10px] font-extrabold text-blue-700">
                              x{item.soluong}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Tổng Tiền */}
                    <td className="px-4 py-3.5 align-top text-right font-black text-rose-600 text-sm">
                      {order.tongtien.toLocaleString('vi-VN')} ₫
                    </td>

                    {/* Phương Thức Thanh Toán */}
                    <td className="px-4 py-3.5 align-top">
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-700">
                        {order.phuongthucthanhtoan === 'COD' ? 'Tiền mặt (COD)' : 'Chuyển khoản'}
                      </span>
                    </td>

                    {/* Trạng Thái */}
                    <td className="px-4 py-3.5 align-top">
                      {renderStatusBadge(order.trangthai)}
                    </td>

                    {/* Thao Tác Quản Lý (Mục A4) */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* Nút Xem Chi Tiết */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          title="Xem chi tiết đơn hàng"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Nút Duyệt Đơn (Chỉ hiện khi Chờ Duyệt) */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleApprove(order.madonhang)}
                            disabled={isOperating}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                            title="Duyệt đơn hàng và trừ tồn kho"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Duyệt Đơn</span>
                          </button>
                        )}

                        {/* Nút Hủy Đơn */}
                        {(isPending || isApproved) && (
                          <button
                            type="button"
                            onClick={() => handleCancel(order.madonhang)}
                            disabled={isOperating}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-50 transition-colors"
                            title="Hủy đơn hàng và hoàn lại kho"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Hủy</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Xem Chi Tiết & In Hóa Đơn */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 my-8">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    Chi Tiết Đơn Hàng #{selectedOrder.madonhang}
                  </h3>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Đặt lúc: {new Date(selectedOrder.ngaydat).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
              <div>{renderStatusBadge(selectedOrder.trangthai)}</div>
            </div>

            {/* Thông tin người nhận */}
            <div className="mt-4 rounded-2xl bg-gray-50 p-4 space-y-1.5 text-xs">
              <div className="font-bold text-gray-800 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-600" />
                <span>Người nhận: {selectedOrder.KHACH_HANG?.hoten}</span>
              </div>
              <div className="text-gray-600 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                <span>Số điện thoại: {selectedOrder.KHACH_HANG?.sdt}</span>
              </div>
              <div className="text-gray-600 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span>Địa chỉ giao hàng: {selectedOrder.KHACH_HANG?.diachi}</span>
              </div>
              {selectedOrder.ghichu && (
                <div className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2 font-medium">
                  Ghi chú: {selectedOrder.ghichu}
                </div>
              )}
            </div>

            {/* Danh sách sản phẩm trong đơn */}
            <div className="mt-4 space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Danh Sách Sản Phẩm Mua ({selectedOrder.CHI_TIET_DON_HANG?.length})
              </div>
              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden">
                {selectedOrder.CHI_TIET_DON_HANG?.map((item) => (
                  <div key={item.machitiet} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-50 p-1 flex items-center justify-center shrink-0 border border-gray-100">
                        {item.SAN_PHAM?.hinhanh ? (
                          <img
                            src={item.SAN_PHAM.hinhanh}
                            alt=""
                            className="h-full w-full object-contain filter drop-shadow-sm"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{item.SAN_PHAM?.tensanpham}</div>
                        <div className="text-[11px] text-gray-500">
                          {item.SAN_PHAM?.dungluong} • {item.SAN_PHAM?.mausac} • SKU: {item.SAN_PHAM?.sku}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-rose-600">{item.dongia.toLocaleString('vi-VN')} ₫</div>
                      <div className="text-[11px] text-gray-500">Số lượng: x{item.soluong}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tổng cộng */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs font-semibold text-gray-600">Tổng thanh toán:</div>
              <div className="text-xl font-black text-rose-600">
                {selectedOrder.tongtien.toLocaleString('vi-VN')} ₫
              </div>
            </div>

            {/* Footer hành động modal */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>In Hóa Đơn</span>
              </button>

              {selectedOrder.trangthai === 'CHO_XAC_NHAN' && (
                <button
                  type="button"
                  onClick={() => handleApprove(selectedOrder.madonhang)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Duyệt Đơn Hàng</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
