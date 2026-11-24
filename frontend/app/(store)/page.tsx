'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import StoreBanner from '../../components/store/Banner';
import ProductCard from '../../components/store/ProductCard';
import StoreToast, { ToastMessage } from '../../components/store/StoreToast';
import { categoriesApi, CategoryItem } from '../../services/categories.api';
import { ProductItem, productsApi } from '../../services/products.api';

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

      {/* 2. Thanh Danh Mục Các Dòng iPhone */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Khám Phá Các Dòng iPhone Chính Hãng
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn dòng máy để xem đầy đủ các phiên bản dung lượng và màu sắc
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Tất cả sản phẩm</span>
            <span>➔</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {categories.map((c) => (
            <Link
              key={c.madanhmuc}
              href={`/products?madanhmuc=${c.madanhmuc}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  
                </span>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                  {c.soluongsanpham ?? 0} máy
                </span>
              </div>
              <div className="mt-3">
                <div className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  {c.tendanhmuc}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {c.mota || 'Chính hãng Apple VN/A'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Khối iPhone 16 Series - Flagship Mới Nhất */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between mb-6 pb-3 border-b border-slate-200 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 mb-1">
              🔥 THẾ HỆ MỚI NHẤT
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
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            Xem tất cả iPhone 16 ({iphone16Products.length}) ➔
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
            <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 mb-1">
              💎 KHUNG TITAN TIÊN TIẾN
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
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            Xem tất cả iPhone 15 ({iphone15Products.length}) ➔
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
          <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
              <div>
                <span className="rounded-md bg-emerald-500/20 text-emerald-300 px-2.5 py-1 text-[11px] font-bold border border-emerald-500/30">
                  ⚡ TOP BÁN CHẠY
                </span>
                <h3 className="text-2xl font-black mt-2">
                  Sản Phẩm Được Mua Nhiều Nhất
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Các mẫu iPhone được khách hàng yêu thích và lựa chọn nhiều nhất trong tháng
                </p>
              </div>
              <Link
                href="/products"
                className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 hover:bg-slate-100 transition-colors"
              >
                Xem Tất Cả ➔
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bestSellers.map((p) => (
                <div key={p.masanpham} className="text-slate-900">
                  <ProductCard product={p} onAddedToCart={addToast} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Toast Alert */}
      <StoreToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
