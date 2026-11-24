'use client';

import {
  Boxes,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Package,
  Trash2,
} from 'lucide-react';
import React from 'react';
import { ProductItem } from '../../../services/products.api';

interface ProductTableProps {
  products: ProductItem[];
  onEdit: (product: ProductItem) => void;
  onQuickStockPrice: (product: ProductItem) => void;
  onHide: (masanpham: number) => void;
  onRestore: (masanpham: number) => void;
}

export default function ProductTable({
  products,
  onEdit,
  onQuickStockPrice,
  onHide,
  onRestore,
}: ProductTableProps) {
  const renderStockBadge = (product: ProductItem) => {
    if (product.trangthai === 'NGUNG_KINH_DOANH') {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Đã ẩn ({product.soluongton})
        </span>
      );
    }
    if (product.soluongton === 0 || product.trangthai === 'HET_HANG') {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          Hết hàng (0)
        </span>
      );
    }
    if (product.soluongton <= 5) {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Sắp hết ({product.soluongton})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Còn hàng ({product.soluongton})
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DANG_BAN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 border border-sky-200">
            <CheckCircle2 className="h-3 w-3 text-sky-600" />
            <span>Kinh doanh</span>
          </span>
        );
      case 'NGUNG_KINH_DOANH':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 border border-rose-200">
            <EyeOff className="h-3 w-3 text-rose-500" />
            <span>Ngừng bán</span>
          </span>
        );
      case 'HET_HANG':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
            <span>Tạm hết</span>
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
            {status}
          </span>
        );
    }
  };

  const handleDeleteClick = (p: ProductItem) => {
    if (confirm(`Bạn có chắc muốn XÓA (ẩn khỏi kinh doanh) phiên bản sản phẩm #${p.masanpham} "${p.tensanpham} (${p.dungluong} - ${p.mausac})"?`)) {
      onHide(p.masanpham);
    }
  };

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">
          Không tìm thấy phiên bản sản phẩm iPhone phù hợp
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Hãy thử thay đổi từ khóa tìm kiếm, dòng iPhone hoặc khoảng giá lọc.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3.5 py-3.5 w-16 text-center">ID</th>
              <th className="px-4 py-3.5 min-w-[200px]">Sản Phẩm iPhone</th>
              <th className="px-3 py-3.5">Dòng Máy</th>
              <th className="px-3 py-3.5">Phiên Bản</th>
              <th className="px-4 py-3.5 text-right">Giá Bán</th>
              <th className="px-3.5 py-3.5 text-center">Tồn Kho</th>
              <th className="px-3.5 py-3.5 text-center">Trạng Thái</th>
              {/* CỘT THAO TÁC CÓ MIN-WIDTH & STICKY ĐỂ LUÔN HIỂN THỊ ĐẦY ĐỦ NÚT XÓA */}
              <th className="px-4 py-3.5 text-center min-w-[230px] sticky right-0 bg-slate-50/95 shadow-[-4px_0_8px_rgba(0,0,0,0.04)] z-10">
                Thao Tác Quản Lý
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {products.map((p) => {
              const isHidden = p.trangthai === 'NGUNG_KINH_DOANH';
              return (
                <tr
                  key={p.masanpham}
                  className={`group transition-colors ${
                    isHidden
                      ? 'bg-slate-50/60 text-slate-400'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Mã / SKU */}
                  <td className="px-3.5 py-3 align-middle text-center">
                    <span className="font-mono text-xs font-bold text-slate-900 block">
                      #{p.masanpham}
                    </span>
                    <span className="rounded bg-slate-100 px-1 py-0.2 font-mono text-[9px] text-slate-500 border border-slate-200">
                      {p.sku}
                    </span>
                  </td>

                  {/* Ảnh & Tên Sản Phẩm */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-1 flex items-center justify-center">
                        {p.hinhanh ? (
                          <img
                            src={p.hinhanh}
                            alt={p.tensanpham}
                            className="h-full w-full object-contain filter drop-shadow-sm"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`font-bold text-xs truncate max-w-xs ${
                            isHidden
                              ? 'line-through text-slate-400'
                              : 'text-slate-900'
                          }`}
                        >
                          {p.tensanpham}
                        </div>
                        {p.mota && (
                          <div className="text-[10px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                            {p.mota.replace(/\[SKU:\s*[^\]]+\]\s*/i, '')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Danh Mục */}
                  <td className="px-3 py-3 align-middle whitespace-nowrap">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {p.DANH_MUC?.tendanhmuc || `Dòng #${p.madanhmuc}`}
                    </span>
                  </td>

                  {/* Phiên Bản */}
                  <td className="px-3 py-3 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-slate-900 text-white px-1.5 py-0.5 text-[10px] font-bold">
                        {p.dungluong}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {p.mausac}
                      </span>
                    </div>
                  </td>

                  {/* Giá Bán */}
                  <td className="px-4 py-3 align-middle text-right font-black text-rose-600 text-xs sm:text-sm whitespace-nowrap">
                    {p.giaban.toLocaleString('vi-VN')} ₫
                  </td>

                  {/* Tồn Kho */}
                  <td className="px-3.5 py-3 align-middle text-center whitespace-nowrap">
                    {renderStockBadge(p)}
                  </td>

                  {/* Trạng Thái */}
                  <td className="px-3.5 py-3 align-middle text-center whitespace-nowrap">
                    {renderStatusBadge(p.trangthai)}
                  </td>

                  {/* Thao Tác Quản Lý (Luôn hiển thị đầy đủ Kho & Giá, Sửa, Xóa) */}
                  <td className="px-4 py-3 align-middle text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 transition-colors shadow-[-4px_0_8px_rgba(0,0,0,0.04)] z-10">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onQuickStockPrice(p)}
                        title="Cập nhật nhanh Giá bán & Tồn kho"
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        <Boxes className="h-3 w-3 text-emerald-600" />
                        <span>Kho & Giá</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        title="Chỉnh sửa thông tin sản phẩm"
                        className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-2 py-1 text-xs font-bold text-sky-800 hover:bg-sky-100 transition-colors"
                      >
                        <Edit3 className="h-3 w-3 text-sky-600" />
                        <span>Sửa</span>
                      </button>

                      {isHidden ? (
                        <button
                          type="button"
                          onClick={() => onRestore(p.masanpham)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                          title="Mở bán lại cho khách hàng"
                        >
                          <Eye className="h-3 w-3 text-slate-600" />
                          <span>Mở lại</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(p)}
                          title="Xóa / Ngừng kinh doanh sản phẩm này"
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
