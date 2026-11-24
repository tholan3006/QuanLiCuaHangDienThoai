'use client';

import { ArrowRight, Check, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { authApi, openCustomerAuthModal } from '../../services/auth.api';
import { ProductItem } from '../../services/products.api';
import { useCartStore } from '../../stores/cart.store';

interface ProductCardProps {
  product: ProductItem;
  onAddedToCart?: (message: string, isSuccess: boolean) => void;
}

export default function ProductCard({ product, onAddedToCart }: ProductCardProps) {
  const { t, lang } = useLanguage();
  const [adding, setAdding] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const isOutOfStock = product.soluongton <= 0 || product.trangthai === 'HET_HANG';
  const isLowStock = product.soluongton > 0 && product.soluongton <= 5;

  // Tính giá niêm yết ảo cao hơn 10% để hiển thị giảm giá chuẩn CellphoneS
  const originalPrice = Math.round((product.giaban * 1.1) / 100000) * 100000;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    // NGHIỆP VỤ: Khách chưa đăng nhập -> Chặn và bật Modal Đăng Nhập
    const curCustomer = authApi.getCurrentCustomer();
    if (!curCustomer) {
      openCustomerAuthModal(
        lang === 'VI'
          ? 'Vui lòng đăng nhập tài khoản Khách Hàng để thêm sản phẩm vào giỏ hàng!'
          : 'Please sign in to your customer account to add items to the cart!',
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
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-xl transition-all duration-300">
      <div>
        {/* Top Badges: Chuẩn CellphoneS (Trả góp 0%, Dung lượng, Tồn kho) */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2 py-0.5 text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
              {lang === 'VI' ? 'Trả góp 0%' : '0% Installment'}
            </span>
            <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
              {product.dungluong}
            </span>
          </div>

          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
              isOutOfStock
                ? 'bg-rose-500 text-white'
                : isLowStock
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600/90 text-white'
            }`}
          >
            {isOutOfStock
              ? t('out_of_stock')
              : isLowStock
                ? `${t('only_left')} ${product.soluongton} ${t('units_left')}`
                : t('in_stock')}
          </span>
        </div>

        {/* Khung ảnh sản phẩm trong suốt - TUYỆT ĐỐI KHÔNG NỀN TRẮNG */}
        <Link
          href={`/products/${product.masanpham}`}
          className="block relative aspect-square w-full p-4 flex items-center justify-center bg-transparent group-hover:scale-105 transition-transform duration-300 overflow-hidden"
        >
          {product.hinhanh ? (
            <img
              src={product.hinhanh}
              alt={product.tensanpham}
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-300">
              iPhone
            </div>
          )}
        </Link>

        {/* Thông tin sản phẩm */}
        <div className="space-y-1 mt-2">
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
              {t('color_label')}: <strong className="text-slate-800 dark:text-slate-200">{product.mausac}</strong>
            </span>
            <span>•</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {t('stock_label')}: {product.soluongton} {t('units_left')}
            </span>
          </div>
        </div>

        {/* Giá bán niêm yết & giá gạch đỏ kiểu CellphoneS */}
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {product.giaban.toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-xs text-slate-400 line-through">
              {originalPrice.toLocaleString('vi-VN')} ₫
            </span>
          </div>

          {/* Hộp khuyến mãi độc quyền CellphoneS */}
          <div className="mt-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
            <span className="truncate">
              {lang === 'VI' ? 'Thu cũ đổi mới trợ giá đến 2 Triệu' : 'Trade-in bonus up to 2M VND'}
            </span>
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
          title={isOutOfStock ? t('out_of_stock') : t('add_to_cart')}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>{isOutOfStock ? t('out_of_stock') : t('add_to_cart')}</span>
        </button>

        <Link
          href={`/products/${product.masanpham}`}
          className="rounded-xl bg-slate-900 dark:bg-sky-600 py-2 px-3 text-xs font-bold text-white hover:bg-sky-600 dark:hover:bg-sky-500 transition-colors shrink-0 flex items-center gap-1"
        >
          <span>{t('view_details')}</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
