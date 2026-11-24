'use client';

import {
  ArrowUpDown,
  Check,
  Package,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import ProductCard from '../../../components/store/ProductCard';
import StoreToast, { ToastMessage } from '../../../components/store/StoreToast';
import { categoriesApi, CategoryItem } from '../../../services/categories.api';
import { ProductItem, productsApi } from '../../../services/products.api';

function StoreProductsContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // States bộ lọc - Hỗ trợ Live Search tức thì khi gõ
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('madanhmuc') || '',
  );
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [priceQuickFilter, setPriceQuickFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<
    'newest' | 'price_asc' | 'price_desc' | 'name_asc'
  >('newest');

  // Toasts
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

  // Cập nhật khi searchParams trên URL thay đổi
  useEffect(() => {
    const paramSearch = searchParams.get('search');
    const paramCat = searchParams.get('madanhmuc');
    if (paramSearch !== null) setSearch(paramSearch);
    if (paramCat !== null) setSelectedCategory(paramCat);
  }, [searchParams]);

  // Xử lý bộ lọc giá nhanh
  const handlePriceQuickFilter = (type: string) => {
    setPriceQuickFilter(type);
    switch (type) {
      case 'UNDER_20':
        setMinPrice('');
        setMaxPrice('20000000');
        break;
      case '20_TO_30':
        setMinPrice('20000000');
        setMaxPrice('30000000');
        break;
      case '30_TO_40':
        setMinPrice('30000000');
        setMaxPrice('40000000');
        break;
      case 'OVER_40':
        setMinPrice('40000000');
        setMaxPrice('');
        break;
      default:
        setMinPrice('');
        setMaxPrice('');
        break;
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStorage('');
    setMinPrice('');
    setMaxPrice('');
    setPriceQuickFilter('ALL');
    setSortBy('newest');
  };

  // Tải danh mục một lần khi mount
  useEffect(() => {
    categoriesApi.getAll(false).then(setCategories).catch(console.error);
  }, []);

  // Lọc sản phẩm realtime: gọi ngay khi search, category, price thay đổi (Debounce 200ms cho search)
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const prods = await productsApi.getForStore({
          search: search.trim() || undefined,
          madanhmuc: selectedCategory ? Number(selectedCategory) : undefined,
          dungluong: selectedStorage || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          sortBy,
        });
        setProducts(prods.data);
      } catch (err) {
        console.error('Lỗi lọc sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedStorage, minPrice, maxPrice, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Tiêu đề & Breadcrumb */}
      <div>
        <div className="text-xs text-slate-500 mb-1">
          Trang chủ / Sản phẩm iPhone chính hãng
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Danh Sách & Bộ Lọc Sản Phẩm iPhone
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Hệ thống phân phối các dòng iPhone mới nhất, hỗ trợ lọc tức thì theo tên máy, dung lượng và khoảng giá.
        </p>
      </div>

      {/* Bộ Lọc & Tìm Kiếm Đa Tiêu Chí */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-sky-600" />
            <span className="text-sm font-extrabold text-slate-800">Bộ Lọc Tìm Kiếm Tức Thì</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 border border-sky-200">
              Tìm thấy {products.length} sản phẩm
            </span>

            {(search || selectedCategory || selectedStorage || minPrice || maxPrice || sortBy !== 'newest') && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Đặt lại bộ lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Hàng 1: Tìm kiếm tức thì, Dòng máy, Dung lượng, Sắp xếp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Ô tìm kiếm tức thì */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Gõ tên máy / màu sắc / SKU (Lọc tức thì)
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="VD: 16 Pro, Sa Mạc, IP16..."
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Dòng máy (Danh mục) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dòng iPhone
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="">Tất cả các dòng</option>
              {categories.map((c) => (
                <option key={c.madanhmuc} value={c.madanhmuc}>
                  {c.tendanhmuc}
                </option>
              ))}
            </select>
          </div>

          {/* Dung lượng */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dung lượng lưu trữ
            </label>
            <select
              value={selectedStorage}
              onChange={(e) => setSelectedStorage(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="">Tất cả dung lượng</option>
              <option value="128GB">128GB</option>
              <option value="256GB">256GB</option>
              <option value="512GB">512GB</option>
              <option value="1TB">1TB (Khủng)</option>
            </select>
          </div>

          {/* Sắp xếp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sắp xếp theo
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao ↗</option>
              <option value="price_desc">Giá: Cao đến Thấp ↘</option>
              <option value="name_asc">Tên sản phẩm A → Z</option>
            </select>
          </div>
        </div>

        {/* Hàng 2: Lọc khoảng giá nhanh & nhập tay */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-700 mr-1">Mức giá:</span>
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'UNDER_20', label: 'Dưới 20 triệu' },
              { id: '20_TO_30', label: '20 - 30 triệu' },
              { id: '30_TO_40', label: '30 - 40 triệu' },
              { id: 'OVER_40', label: 'Trên 40 triệu' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePriceQuickFilter(p.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  priceQuickFilter === p.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPriceQuickFilter('CUSTOM');
              }}
              placeholder="Giá từ (₫)"
              className="w-28 rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs focus:border-sky-600 focus:outline-none"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPriceQuickFilter('CUSTOM');
              }}
              placeholder="Đến giá (₫)"
              className="w-28 rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs focus:border-sky-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Danh Sách Sản Phẩm */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
          <div className="text-xs text-slate-500 font-semibold mt-3">
            Đang lọc dữ liệu sản phẩm...
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center space-y-4 shadow-sm">
          <Package className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            Không tìm thấy sản phẩm nào phù hợp
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Không có phiên bản iPhone nào thỏa mãn điều kiện từ khóa &quot;{search}&quot; hoặc khoảng giá bạn vừa chọn.
          </p>
          <button
            onClick={resetFilters}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            Xóa bộ lọc & Xem tất cả
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard
              key={p.masanpham}
              product={p}
              onAddedToCart={addToast}
            />
          ))}
        </div>
      )}

      {/* Toast Alert */}
      <StoreToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function StoreProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-xs text-slate-500">
          Đang tải trang sản phẩm...
        </div>
      }
    >
      <StoreProductsContent />
    </Suspense>
  );
}
