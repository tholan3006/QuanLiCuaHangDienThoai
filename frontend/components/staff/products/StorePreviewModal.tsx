'use client';

import React, { useEffect, useState } from 'react';
import { ProductItem, productsApi } from '../../../services/products.api';

interface StorePreviewModalProps {
  open: boolean;
  onClose: () => void;
  allStaffProducts: ProductItem[];
}

export default function StorePreviewModal({
  open,
  onClose,
  allStaffProducts,
}: StorePreviewModalProps) {
  const [storeProducts, setStoreProducts] = useState<ProductItem[]>([]);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      productsApi.getForStore().then((res) => setStoreProducts(res.data));
      setTestResult(null);
    }
  }, [open, allStaffProducts]);

  if (!open) return null;

  const hiddenProducts = allStaffProducts.filter(
    (p) => p.trangthai === 'NGUNG_KINH_DOANH',
  );

  const handleTestPurchase = async (masanpham: number) => {
    try {
      const res: any = await productsApi.checkPurchasable(masanpham, 1);
      setTestResult({
        ok: true,
        text: `Đặt mua hợp lệ: Sản phẩm "${res.tensanpham}" đang mở bán, đơn giá ${Number(
          res.dongia,
        ).toLocaleString('vi-VN')} ₫.`,
      });
    } catch (err: any) {
      setTestResult({
        ok: false,
        text: `CHẶN ĐẶT MUA THÀNH CÔNG: ${err.message}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-indigo-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kiểm thử Trang Khách Hàng & Chặn Đặt Mua Sản Phẩm Đã Ẩn (Soft Delete)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Minh chứng: Sản phẩm có{' '}
              <code className="font-bold text-red-600">
                trangthai = NGUNG_KINH_DOANH
              </code>{' '}
              bị ẩn hoàn toàn khỏi danh sách khách hàng và bị chặn khi gọi API đặt mua
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-100"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {testResult && (
            <div
              className={`rounded-xl px-4 py-3 text-sm font-medium border ${
                testResult.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              {testResult.ok ? '✅ ' : '🛡️ '}
              {testResult.text}
            </div>
          )}

          <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
            <div className="text-xs font-bold uppercase text-red-800 mb-2">
              1. Danh sách sản phẩm đã ẩn ({hiddenProducts.length} sản phẩm) — Không hiển thị ở Trang Khách hàng:
            </div>
            {hiddenProducts.length === 0 ? (
              <p className="text-xs text-slate-600">
                Hiện chưa có sản phẩm nào ở trạng thái NGUNG_KINH_DOANH.
              </p>
            ) : (
              <div className="space-y-2">
                {hiddenProducts.map((hp) => (
                  <div
                    key={hp.masanpham}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-3 border border-red-200"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-red-600 mr-2">
                        #{hp.masanpham} [{hp.sku}]
                      </span>
                      <span className="font-semibold text-slate-800">
                        {hp.tensanpham} ({hp.dungluong} - {hp.mausac})
                      </span>
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                        NGUNG_KINH_DOANH (Đã ẩn)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestPurchase(hp.masanpham)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Thử đặt mua sản phẩm đã ẩn này
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-bold uppercase text-slate-700 mb-3">
              2. Danh sách sản phẩm hiển thị ngoài Trang Khách hàng ({storeProducts.length} sản phẩm đang mở bán):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {storeProducts.map((sp) => (
                <div
                  key={sp.masanpham}
                  className="rounded-xl border border-slate-200 p-3.5 flex flex-col justify-between bg-slate-50/40"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-mono">{sp.sku}</span>
                      <span className="text-emerald-700 font-semibold">
                        Tồn: {sp.soluongton}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {sp.tensanpham}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {sp.dungluong} • {sp.mausac}
                    </div>
                    <div className="text-sm font-bold text-blue-600 mt-1.5">
                      {sp.giaban.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestPurchase(sp.masanpham)}
                    className="mt-3 w-full rounded-lg border border-blue-600 bg-white py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Kiểm tra đặt mua
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
