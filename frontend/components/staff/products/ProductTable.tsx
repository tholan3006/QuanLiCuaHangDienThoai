'use client';

import {
  Boxes,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Package,
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

  const renderStatusBadge = (trangthai: ProductItem['trangthai']) => {
    switch (trangthai) {
      case 'DANG_BAN':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
            <CheckCircle2 className="h-3 w-3 text-blue-600" />
            <span>Kinh doanh</span>
          </span>
        );
      case 'HET_HANG':
        return (
          <span className="rounded-lg bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            Tạm hết hàng
          </span>
        );
      case 'NGUNG_KINH_DOANH':
        return (
          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
            <EyeOff className="h-3 w-3 text-rose-500" />
            <span>Đã ẩn (Soft)</span>
          </span>
        );
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
          <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3.5">Mã / SKU</th>
              <th className="px-4 py-3.5">Sản Phẩm iPhone</th>
              <th className="px-4 py-3.5">Dòng Máy</th>
              <th className="px-4 py-3.5">Dung Lượng / Màu</th>
              <th className="px-4 py-3.5 text-right">Giá Bán</th>
              <th className="px-4 py-3.5 text-center">Tồn Kho</th>
              <th className="px-4 py-3.5 text-center">Trạng Thái</th>
              <th className="px-4 py-3.5 text-center">Thao Tác Quản Lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {products.map((p) => {
              const isHidden = p.trangthai === 'NGUNG_KINH_DOANH';
              return (
                <tr
                  key={p.masanpham}
                  className={`transition-colors ${
                    isHidden
                      ? 'bg-slate-50/60 text-slate-400'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Mã / SKU */}
                  <td className="px-4 py-3 align-middle">
                    <div className="font-mono text-xs font-bold text-slate-900">
                      #{p.masanpham}
                    </div>
                    <div className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 border border-slate-200">
                      {p.sku}
                    </div>
                  </td>

                  {/* Ảnh & Tên Sản Phẩm */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-1 flex items-center justify-center">
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
                          className={`font-bold text-sm truncate max-w-xs ${
                            isHidden
                              ? 'line-through text-slate-400'
                              : 'text-slate-900'
                          }`}
                        >
                          {p.tensanpham}
                        </div>
                        {p.mota && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                            {p.mota.replace(/\[SKU:\s*[^\]]+\]\s*/i, '')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Danh Mục */}
                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {p.DANH_MUC?.tendanhmuc || `Dòng #${p.madanhmuc}`}
                    </span>
                  </td>

                  {/* Phiên Bản */}
                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold">
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
                  <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                    {renderStockBadge(p)}
                  </td>

                  {/* Trạng Thái */}
                  <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                    {renderStatusBadge(p.trangthai)}
                  </td>

                  {/* Thao Tác Quản Lý (Với Icon Chuyên Nghiệp) */}
                  <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onQuickStockPrice(p)}
                        title="Cập nhật nhanh Giá bán & Tồn kho (TON_KHO)"
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        <Boxes className="h-3 w-3 text-emerald-600" />
                        <span>Kho & Giá</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        title="Chỉnh sửa toàn bộ thông tin sản phẩm"
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
                          onClick={() => onHide(p.masanpham)}
                          title="Soft Delete: Ẩn khỏi trang khách hàng, bảo toàn dữ liệu đơn hàng"
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          <EyeOff className="h-3 w-3 text-rose-500" />
                          <span>Ẩn</span>
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
