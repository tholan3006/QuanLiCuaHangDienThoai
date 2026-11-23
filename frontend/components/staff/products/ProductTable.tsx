'use client';

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
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
          Đã ẩn ({product.soluongton} máy)
        </span>
      );
    }
    if (product.soluongton === 0 || product.trangthai === 'HET_HANG') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
          Hết hàng (0 máy)
        </span>
      );
    }
    if (product.soluongton <= 5) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
          Sắp hết ({product.soluongton} máy)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        Còn hàng ({product.soluongton} máy)
      </span>
    );
  };

  const renderStatusBadge = (trangthai: ProductItem['trangthai']) => {
    switch (trangthai) {
      case 'DANG_BAN':
        return (
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            Đang kinh doanh
          </span>
        );
      case 'HET_HANG':
        return (
          <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 border border-orange-200">
            Tạm hết hàng
          </span>
        );
      case 'NGUNG_KINH_DOANH':
        return (
          <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200">
            Ngừng kinh doanh (Ẩn)
          </span>
        );
    }
  };

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="text-3xl mb-2">📱</div>
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
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-4 py-3.5">Mã / SKU</th>
              <th className="px-4 py-3.5">Sản phẩm iPhone</th>
              <th className="px-4 py-3.5">Danh mục</th>
              <th className="px-4 py-3.5">Phiên bản</th>
              <th className="px-4 py-3.5 text-right">Giá bán (giaban)</th>
              <th className="px-4 py-3.5 text-center">Tồn kho (TON_KHO)</th>
              <th className="px-4 py-3.5 text-center">Trạng thái</th>
              <th className="px-4 py-3.5 text-right">Thao tác quản lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((p) => {
              const isHidden = p.trangthai === 'NGUNG_KINH_DOANH';
              return (
                <tr
                  key={p.masanpham}
                  className={`transition-colors ${
                    isHidden
                      ? 'bg-slate-50/80 text-slate-500'
                      : 'hover:bg-blue-50/30'
                  }`}
                >
                  <td className="px-4 py-3.5 align-middle">
                    <div className="font-mono text-xs font-bold text-slate-800">
                      #{p.masanpham}
                    </div>
                    <div className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 border border-slate-200">
                      {p.sku}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {p.hinhanh ? (
                          <img
                            src={p.hinhanh}
                            alt={p.tensanpham}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">📱</span>
                        )}
                      </div>
                      <div>
                        <div
                          className={`font-bold ${
                            isHidden
                              ? 'line-through text-slate-500'
                              : 'text-slate-900'
                          }`}
                        >
                          {p.tensanpham}
                        </div>
                        {p.mota && (
                          <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                            {p.mota.replace(/\[SKU:\s*[^\]]+\]\s*/i, '')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 align-middle">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {p.DANH_MUC?.tendanhmuc || `Danh mục #${p.madanhmuc}`}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex w-fit items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                        {p.dungluong}
                      </span>
                      <span className="text-xs font-medium text-slate-700">
                        Màu: <strong>{p.mausac}</strong>
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 align-middle text-right font-bold text-blue-700">
                    {p.giaban.toLocaleString('vi-VN')} ₫
                  </td>

                  <td className="px-4 py-3.5 align-middle text-center">
                    {renderStockBadge(p)}
                  </td>

                  <td className="px-4 py-3.5 align-middle text-center">
                    {renderStatusBadge(p.trangthai)}
                  </td>

                  <td className="px-4 py-3.5 align-middle text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onQuickStockPrice(p)}
                        title="Cập nhật nhanh Giá bán, Tồn kho (TON_KHO) & Hình ảnh"
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        Giá & Kho
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Sửa
                      </button>

                      {isHidden ? (
                        <button
                          type="button"
                          onClick={() => onRestore(p.masanpham)}
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          Mở bán lại
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onHide(p.masanpham)}
                          title="Soft Delete: Ẩn khỏi trang khách hàng, không xóa vật lý"
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Ẩn SP
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
