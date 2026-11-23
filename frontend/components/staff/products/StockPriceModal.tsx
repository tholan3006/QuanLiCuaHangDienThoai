'use client';

import React, { useEffect, useState } from 'react';
import {
  ProductItem,
  UpdateStockPricePayload,
} from '../../../services/products.api';

interface StockPriceModalProps {
  open: boolean;
  product: ProductItem | null;
  onClose: () => void;
  onSubmit: (masanpham: number, payload: UpdateStockPricePayload) => Promise<void>;
}

export default function StockPriceModal({
  open,
  product,
  onClose,
  onSubmit,
}: StockPriceModalProps) {
  const [giaban, setGiaban] = useState<string>('');
  const [soluong, setSoluong] = useState<string>('');
  const [hinhanh, setHinhanh] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setGiaban(String(product.giaban));
      setSoluong(String(product.soluongton));
      setHinhanh(product.hinhanh || '');
      setError(null);
    }
  }, [product, open]);

  if (!open || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = Number(giaban);
    const parsedStock = Number(soluong);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Giá bán (giaban) bắt buộc phải > 0 (Ràng buộc CHECK)');
      return;
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setError('Số lượng tồn kho (TON_KHO.soluong) phải >= 0 (Ràng buộc CHECK)');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(product.masanpham, {
        giaban: parsedPrice,
        soluong: parsedStock,
        hinhanh: hinhanh.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật giá & tồn kho');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-emerald-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cập nhật Giá bán, Tồn kho (TON_KHO) & Hình ảnh
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              #{product.masanpham} • {product.tensanpham} ({product.dungluong} -{' '}
              {product.mausac})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Giá bán mới VNĐ (<code className="text-emerald-700">SAN_PHAM.giaban</code>)
            </label>
            <input
              type="number"
              min={1}
              step="1000"
              value={giaban}
              onChange={(e) => setGiaban(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold text-emerald-700 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Số lượng tồn kho mới (<code className="text-emerald-700">TON_KHO.soluong</code>)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoluong(String(Math.max(0, Number(soluong) - 1)))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-100"
              >
                -1
              </button>
              <input
                type="number"
                min={0}
                step={1}
                value={soluong}
                onChange={(e) => setSoluong(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-center text-sm font-bold focus:border-emerald-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSoluong(String(Number(soluong) + 5))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold hover:bg-slate-100"
              >
                +5
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Đường dẫn hình ảnh (<code className="text-emerald-700">SAN_PHAM.hinhanh</code>)
            </label>
            <input
              type="text"
              value={hinhanh}
              onChange={(e) => setHinhanh(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {product.TON_KHO && product.TON_KHO.length > 0 && (
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <div className="text-xs font-semibold text-slate-700 mb-1.5">
                Lịch sử cập nhật bảng TON_KHO gần nhất:
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1 text-xs text-slate-600">
                {product.TON_KHO.slice(0, 5).map((tk) => (
                  <div key={tk.matonkho} className="flex justify-between">
                    <span>Mã tồn kho #{tk.matonkho}</span>
                    <span className="font-semibold text-slate-800">
                      Số lượng: {tk.soluong} máy
                    </span>
                    <span>
                      {new Date(tk.ngaycapnhat).toLocaleString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Đang cập nhật...' : 'Lưu Giá & Tồn kho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
