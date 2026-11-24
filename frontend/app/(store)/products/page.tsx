'use client';

import {
  Package,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import ProductCard from '../../../components/store/ProductCard';
import StoreToast, { ToastMessage } from '../../../components/store/StoreToast';
import { useLanguage } from '../../../contexts/LanguageContext';
import { categoriesApi, CategoryItem } from '../../../services/categories.api';
import { ProductItem, productsApi } from '../../../services/products.api';

function StoreProductsContent() {
  const { t, lang } = useLanguage();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
          {t('home')} / {t('products')} iPhone {lang === 'VI' ? 'chính hãng' : 'Official'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('products_page_title')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('products_page_sub')}
        </p>
      </div>

      {/* Bộ Lọc & Tìm Kiếm Đa Tiêu Chí */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {t('filter_panel_title')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-sky-50 dark:bg-sky-950/60 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              {t('found_products')} {products.length} {t('products_unit')}
            </span>

            {(search || selectedCategory || selectedStorage || minPrice || maxPrice || sortBy !== 'newest') && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t('reset_filter')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Hàng 1: Tìm kiếm tức thì, Dòng máy, Dung lượng, Sắp xếp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Ô tìm kiếm tức thì */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('search_live_label')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'VI' ? 'VD: 16 Pro, Sa Mạc, IP16...' : 'E.g: 16 Pro, Desert, IP16...'}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-9 pr-3.5 py-2 text-xs focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          {/* Dòng máy (Danh mục) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('iphone_series_filter')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 text-xs focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="">{t('all_series')}</option>
              {categories.map((c) => (
                <option key={c.madanhmuc} value={c.madanhmuc}>
                  {c.tendanhmuc}
                </option>
              ))}
            </select>
          </div>

          {/* Dung lượng */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('storage_filter')}
            </label>
            <select
              value={selectedStorage}
              onChange={(e) => setSelectedStorage(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 text-xs focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="">{t('all_storages')}</option>
              <option value="128GB">128GB</option>
              <option value="256GB">256GB</option>
              <option value="512GB">512GB</option>
              <option value="1TB">1TB (Flagship)</option>
            </select>
          </div>

          {/* Sắp xếp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('sort_by')}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 text-xs focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="newest">{t('sort_newest')}</option>
              <option value="price_asc">{t('sort_price_asc')}</option>
              <option value="price_desc">{t('sort_price_desc')}</option>
              <option value="name_asc">{t('sort_name_asc')}</option>
            </select>
          </div>
        </div>

        {/* Hàng 2: Lọc khoảng giá nhanh & nhập tay */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">
              {t('price_range_label')}:
            </span>
            {[
              { id: 'ALL', label: lang === 'VI' ? 'Tất cả' : 'All' },
              { id: 'UNDER_20', label: t('price_under_20') },
              { id: '20_TO_30', label: t('price_20_30') },
              { id: '30_TO_40', label: t('price_30_40') },
              { id: 'OVER_40', label: t('price_over_40') },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePriceQuickFilter(p.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  priceQuickFilter === p.id
                    ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
              placeholder={t('price_from_input')}
              className="w-28 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-2.5 py-1.5 text-xs focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none"
            />
            <span className="text-slate-400 dark:text-slate-500">-</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPriceQuickFilter('CUSTOM');
              }}
              placeholder={t('price_to_input')}
              className="w-28 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-2.5 py-1.5 text-xs focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Danh Sách Sản Phẩm */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-3">
            {lang === 'VI' ? 'Đang lọc dữ liệu sản phẩm...' : 'Filtering product data...'}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 text-center space-y-4 shadow-sm">
          <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {t('no_product_found')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t('no_product_desc')}
          </p>
          <button
            onClick={resetFilters}
            className="rounded-xl bg-slate-900 dark:bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors"
          >
            {t('reset_view_all')}
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
