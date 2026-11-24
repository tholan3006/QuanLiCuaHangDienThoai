'use client';

import { ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { authApi, openCustomerAuthModal } from '../../services/auth.api';
import { ProductItem } from '../../services/products.api';
import { useCartStore } from '../../stores/cart.store';

// Bảng dịch màu sắc song ngữ chuẩn Apple
export const COLOR_TRANSLATIONS: Record<string, { VI: string; EN: string }> = {
  'Titan Sa Mạc': { VI: 'Titan Sa Mạc', EN: 'Desert Titanium' },
  'Titan Tự Nhiên': { VI: 'Titan Tự Nhiên', EN: 'Natural Titanium' },
  'Titan Trắng': { VI: 'Titan Trắng', EN: 'White Titanium' },
  'Titan Đen': { VI: 'Titan Đen', EN: 'Black Titanium' },
  'Titan Xanh': { VI: 'Titan Xanh', EN: 'Blue Titanium' },
  'Hồng': { VI: 'Hồng', EN: 'Pink' },
  'Xanh Lưu Ly': { VI: 'Xanh Lưu Ly', EN: 'Ultramarine' },
  'Xanh Mòng Két': { VI: 'Xanh Mòng Két', EN: 'Teal' },
  'Đen': { VI: 'Đen', EN: 'Black' },
  'Trắng': { VI: 'Trắng', EN: 'White' },
  'Trắng Ánh Sao': { VI: 'Trắng Ánh Sao', EN: 'Starlight' },
  'Đen Midnight': { VI: 'Đen Midnight', EN: 'Midnight' },
  'Xanh Dương': { VI: 'Xanh Dương', EN: 'Blue' },
  'Tím': { VI: 'Tím', EN: 'Purple' },
  'Vàng': { VI: 'Vàng', EN: 'Yellow' },
  'Xanh Alpine': { VI: 'Xanh Alpine', EN: 'Alpine Green' },
  'Xanh Lá': { VI: 'Xanh Lá', EN: 'Green' },
  'Đỏ': { VI: 'Đỏ', EN: '(PRODUCT)RED' },
};

export function getLocalizedColor(color: string, lang: 'VI' | 'EN'): string {
  if (lang === 'EN') {
    return COLOR_TRANSLATIONS[color]?.EN || color;
  }
  return COLOR_TRANSLATIONS[color]?.VI || color;
}

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

  const handleCardClick = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    // RÀNG BUỘC: Khách chưa đăng nhập -> Chặn và bật Modal Đăng Nhập
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

  const colorName = getLocalizedColor(product.mausac, lang);

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-xl transition-all duration-300">
      <div>
        {/* Top Badges (Đã xóa bỏ Trả góp 0% theo yêu cầu) */}
        <div className="flex items-center justify-between gap-1 mb-3">
          <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200">
            {product.dungluong}
          </span>

          <span
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
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
                : `${t('in_stock')} (${product.soluongton})`}
          </span>
        </div>

        {/* Khung ảnh sản phẩm trong suốt - TUYỆT ĐỐI KHÔNG NỀN TRẮNG */}
        <Link
          href={`/products/${product.masanpham}`}
          onClick={handleCardClick}
          className="block relative aspect-square w-full p-3 flex items-center justify-center bg-transparent group-hover:scale-105 transition-transform duration-300 overflow-hidden"
        >
          {product.hinhanh ? (
            <img
              src={product.hinhanh}
              alt={product.tensanpham}
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
              iPhone
            </div>
          )}
        </Link>

        {/* Thông tin sản phẩm */}
        <div className="space-y-1.5 mt-2">
          <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400 truncate">
            {product.DANH_MUC?.tendanhmuc || 'iPhone'} • SKU: {product.sku}
          </div>

          <Link
            href={`/products/${product.masanpham}`}
            onClick={handleCardClick}
            className="block font-black text-slate-900 dark:text-white text-base leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1"
          >
            {product.tensanpham}
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {t('color_label')}: <strong className="text-slate-800 dark:text-slate-200">{colorName}</strong>
            </span>
          </div>
        </div>

        {/* Giá bán niêm yết (Đã dọn dẹp sạch sẽ, không icon AI, không quảng cáo rườm rà) */}
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {product.giaban.toLocaleString('vi-VN')} ₫
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="mt-4 pt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-400 disabled:opacity-40 transition-all"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-sky-500" />
          <span>{t('add_to_cart')}</span>
        </button>

        <Link
          href={`/products/${product.masanpham}`}
          onClick={handleCardClick}
          className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-900 dark:bg-sky-600 py-2.5 px-3 text-xs font-bold text-white shadow hover:bg-slate-800 dark:hover:bg-sky-500 transition-all shrink-0"
        >
          <span>{t('view_details')}</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
