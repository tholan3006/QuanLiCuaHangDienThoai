'use client';

import { ArrowRight, Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import StoreBanner from '../../components/store/Banner';
import ProductCard from '../../components/store/ProductCard';
import StoreToast, { ToastMessage } from '../../components/store/StoreToast';
import { categoriesApi, CategoryItem } from '../../services/categories.api';
import { ProductItem, productsApi } from '../../services/products.api';

// Cấu hình hiển thị hấp dẫn các dòng iPhone chính hãng
const SERIES_SHOWCASE = [
  {
    madanhmuc: 1,
    title: 'iPhone 16 Series',
    tag: 'MỚI NHẤT 2024',
    tagColor: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
    desc: 'Chip A18 Pro • Camera Control • Viền Titan',
    fromPrice: '22.990.000 ₫',
    image: '/images/products/iphone-16-pro-max-desert.png',
  },
  {
    madanhmuc: 2,
    title: 'iPhone 15 Series',
    tag: 'ĐỈNH CAO TITAN',
    tagColor: 'bg-sky-500/10 text-sky-700 border-sky-500/30',
    desc: 'Cổng USB-C • Dynamic Island • Camera 48MP',
    fromPrice: '19.990.000 ₫',
    image: '/images/products/iphone-15-pro-max-natural.png',
  },
  {
    madanhmuc: 3,
    title: 'iPhone 14 Series',
    tag: 'BÁN CHẠY NHẤT',
    tagColor: 'bg-purple-500/10 text-purple-700 border-purple-500/30',
    desc: 'Màn hình OLED • Pin cả ngày • Hiệu năng mượt',
    fromPrice: '16.990.000 ₫',
    image: '/images/products/iphone-14-purple.png',
  },
  {
    madanhmuc: 4,
    title: 'iPhone 13 Series',
    tag: 'GIÁ TỐT QUỐC DÂN',
    tagColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
    desc: 'Chip A15 Bionic • Camera kép chéo • Bền bỉ',
    fromPrice: '13.490.000 ₫',
    image: '/images/products/iphone-13-starlight.png',
  },
];

export default function StoreHomePage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, isSuccess: boolean) => {
    const id = Date.now().toString();
    setToasts((prev) => [
      ...prev,
      { id, message, type: isSuccess ? 'success' : 'warning' },
    ]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, prods] = await Promise.all([
          categoriesApi.getAll(false),
          productsApi.getForStore({ limit: 20 }),
        ]);
        setCategories(cats);
        setProducts(prods.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu trang chủ:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Lọc sản phẩm theo danh mục và nổi bật
  const iphone16Products = products.filter(
    (p) => p.madanhmuc === 1 || p.tensanpham.includes('iPhone 16'),
  );
  const iphone15Products = products.filter(
    (p) => p.madanhmuc === 2 || p.tensanpham.includes('iPhone 15'),
  );
  const bestSellers = products
    .filter((p) => (p.sodonhangdaco ?? 0) > 0 || p.soluongton > 10)
    .slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Banner */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <StoreBanner />
      </div>

      {/* 2. KHỐI KHÁM PHÁ CÁC DÒNG IPHONE (THIẾT KẾ CARD THẨM MỸ, BẮT MẮT) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Khám Phá Các Dòng iPhone
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn thế hệ iPhone yêu thích để xem đầy đủ phiên bản màu sắc & dung lượng
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
          >
            <span>Tất cả sản phẩm</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4 Cards thế hệ iPhone với hình ảnh studio trực quan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERIES_SHOWCASE.map((item) => {
            const cat = categories.find((c) => c.madanhmuc === item.madanhmuc);
            const count = cat?.soluongsanpham ?? products.filter((p) => p.madanhmuc === item.madanhmuc).length;

            return (
              <Link
                key={item.madanhmuc}
                href={`/products?madanhmuc=${item.madanhmuc}`}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm hover:border-slate-400 hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-block rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold border uppercase tracking-wider ${item.tagColor}`}
                    >
                      {item.tag}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {count} phiên bản
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg mt-2 group-hover:text-sky-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {item.desc}
                  </p>
                </div>

                {/* Ảnh studio điện thoại trong suốt */}
                <div className="my-4 h-36 w-full flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50/70 p-2">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">Giá chỉ từ</div>
                    <div className="text-xs font-black text-rose-600">
                      {item.fromPrice}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    <span>Xem ngay</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Khối iPhone 16 Series - Flagship Mới Nhất */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between mb-6 pb-3 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 mb-1">
              <Sparkles className="h-3 w-3 text-amber-600" />
              <span>THẾ HỆ MỚI NHẤT</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              iPhone 16 Series
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đỉnh cao công nghệ Apple A18 Pro, nút Camera Control và khung Titan cấp 5
            </p>
          </div>
          <Link
            href="/products?madanhmuc=1"
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-900 hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <span>Xem tất cả iPhone 16 ({iphone16Products.length})</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
            Đang tải danh sách iPhone 16 Series...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {iphone16Products.slice(0, 4).map((p) => (
              <ProductCard
                key={p.masanpham}
                product={p}
                onAddedToCart={addToast}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Khối iPhone 15 Series */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between mb-6 pb-3 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-[11px] font-bold text-sky-800 mb-1">
              <span>KHUNG TITAN TIÊN TIẾN</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              iPhone 15 Series
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cổng kết nối USB-C tiện lợi, Dynamic Island và camera tiềm vọng 5x
            </p>
          </div>
          <Link
            href="/products?madanhmuc=2"
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-900 hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <span>Xem tất cả iPhone 15 ({iphone15Products.length})</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
            Đang tải danh sách iPhone 15 Series...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {iphone15Products.map((p) => (
              <ProductCard
                key={p.masanpham}
                product={p}
                onAddedToCart={addToast}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Khối Sản phẩm bán chạy */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-200">
            <Flame className="h-5 w-5 text-rose-500" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Gợi Ý Mua Sắm Nổi Bật
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {bestSellers.map((p) => (
              <ProductCard
                key={p.masanpham}
                product={p}
                onAddedToCart={addToast}
              />
            ))}
          </div>
        </section>
      )}

      {/* Toast Alert */}
      <StoreToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
