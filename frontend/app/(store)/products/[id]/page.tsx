'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ProductItem, productsApi } from '../../../../services/products.api';

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    productsApi
      .getForStore()
      .then((res) => {
        const found = res.data.find((p) => p.masanpham === id);
        if (!found) {
          setError(
            'Sản phẩm này đã ngừng kinh doanh (Soft Delete) hoặc không tồn tại trên cửa hàng.',
          );
        } else {
          setProduct(found);
        }
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const handleOrderCheck = async () => {
    try {
      const res: any = await productsApi.checkPurchasable(id, 1);
      setPurchaseMsg(
        `✅ Đặt mua hợp lệ: ${res.tensanpham} - Thành tiền: ${Number(
          res.thanhtien,
        ).toLocaleString('vi-VN')} ₫`,
      );
    } catch (err: any) {
      setPurchaseMsg(`❌ Không thể đặt mua: ${err.message}`);
    }
  };

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm space-y-4">
          <div className="text-4xl">🚫</div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Sản phẩm không khả dụng
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'Đang tải thông tin sản phẩm...'}
          </p>
          <Link
            href="/products"
            className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white"
          >
            ← Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/products"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            ← Quay lại danh sách iPhone
          </Link>
          <span className="font-mono text-xs text-slate-500">
            Mã SP: #{product.masanpham} • SKU: {product.sku}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center rounded-2xl bg-slate-100 p-6 border border-slate-200">
            {product.hinhanh ? (
              <img
                src={product.hinhanh}
                alt={product.tensanpham}
                className="max-h-72 object-contain rounded-xl"
              />
            ) : (
              <span className="text-6xl">📱</span>
            )}
          </div>

          <div className="space-y-4">
            <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {product.DANH_MUC?.tendanhmuc}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {product.tensanpham}
            </h1>
            <div className="text-2xl font-extrabold text-red-600">
              {product.giaban.toLocaleString('vi-VN')} ₫
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-slate-500">Dung lượng</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {product.dungluong}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-slate-500">Màu sắc</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {product.mausac}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {product.mota}
            </p>

            <div className="text-xs font-semibold text-emerald-700">
              Tình trạng kho: Còn {product.soluongton} máy sẵn sàng giao ngay
            </div>

            {purchaseMsg && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-semibold text-blue-900">
                {purchaseMsg}
              </div>
            )}

            <button
              type="button"
              onClick={handleOrderCheck}
              disabled={product.soluongton <= 0}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
            >
              {product.soluongton > 0 ? 'Đặt Mua Ngay' : 'Tạm Hết Hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
