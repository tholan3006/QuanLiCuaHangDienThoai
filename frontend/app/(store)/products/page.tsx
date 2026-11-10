'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import {
  categoriesApi,
  CategoryItem,
} from '../../../services/categories.api';
import { ProductItem, productsApi } from '../../../services/products.api';

export default function StoreProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'newest' | 'price_asc' | 'price_desc' | 'name_asc'
  >('newest');
  const [loading, setLoading] = useState(true);

  const loadStoreProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        categoriesApi.getAll(false),
        productsApi.getForStore({
          search: search.trim() || undefined,
          madanhmuc: selectedCategory ? Number(selectedCategory) : undefined,
          dungluong: selectedStorage || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          sortBy,
        }),
      ]);
      setCategories(cats);
      setProducts(prods.data);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedStorage, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    loadStoreProducts();
  }, [loadStoreProducts]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
              
            </span>
            <span className="font-extrabold text-slate-900 text-base">
              iPhone Store — Trang Khách Hàng
            </span>
          </Link>

          <Link
            href="/staff/products"
            className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700"
          >
            Chuyển sang Quản lý Sản phẩm (Nhân viên) →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">
                Danh Mục & Sản Phẩm iPhone Chính Hãng
              </h1>
              <p className="text-xs text-slate-500">
                Các sản phẩm ngừng kinh doanh (`NGUNG_KINH_DOANH`) đã được tự động ẩn khỏi danh sách này
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              Hiển thị {products.length} phiên bản đang kinh doanh
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên iPhone, màu sắc..."
              className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">Tất cả dòng iPhone</option>
              {categories.map((c) => (
                <option key={c.madanhmuc} value={c.madanhmuc}>
                  {c.tendanhmuc}
                </option>
              ))}
            </select>

            <select
              value={selectedStorage}
              onChange={(e) => setSelectedStorage(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">Tất cả dung lượng</option>
              <option value="128GB">128GB</option>
              <option value="256GB">256GB</option>
              <option value="512GB">512GB</option>
              <option value="1TB">1TB</option>
            </select>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Giá từ"
                className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs"
              />
              <span>-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Đến giá"
                className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="price_desc">Giá cao → thấp</option>
              <option value="name_asc">Tên A → Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-500 border border-slate-200">
            Đang tải danh sách iPhone...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <div
                key={p.masanpham}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden rounded-xl bg-slate-100 mb-3 flex items-center justify-center">
                    {p.hinhanh ? (
                      <img
                        src={p.hinhanh}
                        alt={p.tensanpham}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">📱</span>
                    )}
                    <span className="absolute top-2 left-2 rounded-lg bg-slate-900/80 px-2 py-0.5 text-[11px] font-bold text-white">
                      {p.dungluong}
                    </span>
                  </div>

                  <div className="text-[11px] font-semibold text-blue-600">
                    {p.DANH_MUC?.tendanhmuc} • Mã SKU: {p.sku}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-0.5">
                    {p.tensanpham}
                  </h3>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Màu sắc: <strong>{p.mausac}</strong>
                  </div>
                  <div className="mt-2 text-lg font-extrabold text-red-600">
                    {p.giaban.toLocaleString('vi-VN')} ₫
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      p.soluongton > 0 ? 'text-emerald-700' : 'text-orange-600'
                    }`}
                  >
                    {p.soluongton > 0
                      ? `Còn ${p.soluongton} máy`
                      : 'Tạm hết hàng'}
                  </span>
                  <Link
                    href={`/products/${p.masanpham}`}
                    className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-600"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
