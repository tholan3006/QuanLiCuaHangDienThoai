'use client';

import { ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { authApi, openCustomerAuthModal } from '../../services/auth.api';
import { ProductItem } from '../../services/products.api';
import { useCartStore } from '../../stores/cart.store';

interface ProductCardProps {
  product: ProductItem;
  onAddedToCart?: (message: string, isSuccess: boolean) => void;
}

export default function ProductCard({ product, onAddedToCart }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const isOutOfStock = product.soluongton <= 0 || product.trangthai === 'HET_HANG';
  const isLowStock = product.soluongton > 0 && product.soluongton <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    // NGHIỆP VỤ: Khách chưa đăng nhập -> Chặn và bật Modal Đăng Nhập
    const curCustomer = authApi.getCurrentCustomer();
    if (!curCustomer) {
      openCustomerAuthModal(
        'Vui lòng đăng nhập tài khoản Khách Hàng để thêm sản phẩm vào giỏ hàng!',
      );
      return;
    }

    setAdding(true);
    const result = addToCart(product, 1);
    setAdding(false);

    if (onAddedToCart) {
      onAddedToCart(result.message, result.success);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-xl transition-all duration-200">
      <div>
        {/* Khung ảnh sản phẩm studio trong suốt, không viền hộp thô */}
        <Link
          href={`/products/${product.masanpham}`}
          className="block relative aspect-square w-full overflow-hidden rounded-2xl mb-3.5 p-4 flex items-center justify-center bg-slate-50/60 dark:bg-slate-800/40 group-hover:bg-slate-100/80 dark:group-hover:bg-slate-800/70 transition-colors"
        >
          {product.hinhanh ? (
            <img
              src={product.hinhanh}
              alt={product.tensanpham}
              className="h-full w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-300">
              iPhone
            </div>
          )}

          {/* Badge dung lượng */}
          <span className="absolute top-2.5 left-2.5 rounded-lg bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
            {product.dungluong}
          </span>

          {/* Badge tình trạng tồn kho */}
          <span
            className={`absolute top-2.5 right-2.5 rounded-lg px-2 py-0.5 text-[10px] font-extrabold backdrop-blur shadow-sm ${
              isOutOfStock
                ? 'bg-rose-500/95 text-white'
                : isLowStock
                  ? 'bg-amber-500/95 text-white'
                  : 'bg-emerald-600/95 text-white'
            }`}
          >
            {isOutOfStock
              ? 'Hết hàng'
              : isLowStock
                ? `Còn ${product.soluongton} máy`
                : 'Còn hàng'}
          </span>
        </Link>

        {/* Thông tin sản phẩm */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400 truncate">
            {product.DANH_MUC?.tendanhmuc || 'iPhone'} • SKU: {product.sku}
          </div>

          <Link
            href={`/products/${product.masanpham}`}
            className="block font-extrabold text-slate-900 dark:text-white text-base leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1"
          >
            {product.tensanpham}
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Màu: <strong className="text-slate-800 dark:text-slate-200">{product.mausac}</strong>
            </span>
            <span>•</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Kho: {product.soluongton} máy
            </span>
          </div>
        </div>

        {/* Giá bán */}
        <div className="mt-3">
          <div className="text-lg font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {product.giaban.toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Trả góp 0% • Bảo hành 12 tháng Apple Care
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            isOutOfStock
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-sky-600 dark:hover:text-white border border-slate-200 dark:border-slate-700'
          }`}
          title={isOutOfStock ? 'Sản phẩm tạm hết hàng' : 'Thêm vào giỏ hàng'}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>{isOutOfStock ? 'Hết Hàng' : 'Thêm Giỏ'}</span>
        </button>

        <Link
          href={`/products/${product.masanpham}`}
          className="rounded-xl bg-slate-900 dark:bg-sky-600 py-2 px-3 text-xs font-bold text-white hover:bg-sky-600 dark:hover:bg-sky-500 transition-colors shrink-0 flex items-center gap-1"
        >
          <span>Chi Tiết</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
