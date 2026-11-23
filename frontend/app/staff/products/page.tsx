'use client';

import React, { useCallback, useEffect, useState } from 'react';
import CategoryManagerModal from '../../../components/staff/products/CategoryManagerModal';
import ProductFormModal from '../../../components/staff/products/ProductFormModal';
import ProductTable from '../../../components/staff/products/ProductTable';
import StockPriceModal from '../../../components/staff/products/StockPriceModal';
import StorePreviewModal from '../../../components/staff/products/StorePreviewModal';
import {
  categoriesApi,
  CategoryItem,
} from '../../../services/categories.api';
import {
  CreateProductPayload,
  ProductItem,
  productsApi,
  ProductSummary,
  UpdateStockPricePayload,
} from '../../../services/products.api';

export default function StaffProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [summary, setSummary] = useState<ProductSummary>({
    tongsophienban: 0,
    dangkinhdoanh: 0,
    saphethang: 0,
    hethang: 0,
    ngungkinhdoanh: 0,
    tongmaytonkho: 0,
  });

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'newest' | 'price_asc' | 'price_desc' | 'name_asc'
  >('newest');

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [stockPriceTarget, setStockPriceTarget] = useState<ProductItem | null>(
    null,
  );
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [storePreviewOpen, setStorePreviewOpen] = useState(false);

  const [banner, setBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [catList, prodRes] = await Promise.all([
        categoriesApi.getAll(true),
        productsApi.getForStaff({
          search: search.trim() || undefined,
          madanhmuc: selectedCategory ? Number(selectedCategory) : undefined,
          dungluong: selectedStorage || undefined,
          trangthai: selectedStatus || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          sortBy,
        }),
      ]);
      setCategories(catList);
      setProducts(prodRes.data);
      setSummary(prodRes.summary);
    } catch (err: any) {
      setBanner({
        type: 'error',
        text: err.message || 'Không thể tải danh sách sản phẩm',
      });
    } finally {
      setLoading(false);
    }
  }, [
    search,
    selectedCategory,
    selectedStorage,
    selectedStatus,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveProduct = async (payload: CreateProductPayload) => {
    if (editingProduct) {
      await productsApi.update(editingProduct.masanpham, payload);
      setBanner({
        type: 'success',
        text: `Đã cập nhật thông tin phiên bản "${payload.tensanpham} (${payload.dungluong} - ${payload.mausac})" thành công.`,
      });
    } else {
      await productsApi.create(payload);
      setBanner({
        type: 'success',
        text: `Đã thêm mới phiên bản "${payload.tensanpham} (${payload.dungluong} - ${payload.mausac})" vào bảng SAN_PHAM & TON_KHO.`,
      });
    }
    await loadData();
  };

  const handleQuickStockPrice = async (
    masanpham: number,
    payload: UpdateStockPricePayload,
  ) => {
    await productsApi.updateStockPrice(masanpham, payload);
    setBanner({
      type: 'success',
      text: `Đã cập nhật Giá bán & Tồn kho (bảng TON_KHO) cho sản phẩm #${masanpham}.`,
    });
    await loadData();
  };

  const handleHideProduct = async (masanpham: number) => {
    try {
      const res = await productsApi.hideProduct(masanpham);
      setBanner({
        type: 'success',
        text: res.message,
      });
      await loadData();
    } catch (err: any) {
      setBanner({
        type: 'error',
        text: err.message || 'Lỗi khi ẩn sản phẩm',
      });
    }
  };

  const handleRestoreProduct = async (masanpham: number) => {
    try {
      const res = await productsApi.restoreProduct(masanpham);
      setBanner({
        type: 'success',
        text: res.message,
      });
      await loadData();
    } catch (err: any) {
      setBanner({
        type: 'error',
        text: err.message || 'Lỗi khi khôi phục sản phẩm',
      });
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStorage('');
    setSelectedStatus('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Quản Lý Danh Mục, Sản Phẩm iPhone & Tồn Kho
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý phiên bản màu sắc, dung lượng, mã SKU • Cập nhật giá & tồn kho (`TON_KHO`) • Ẩn sản phẩm ngừng kinh doanh (Soft Delete)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setStorePreviewOpen(true)}
            className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
          >
            👁️ Kiểm thử Trang Khách hàng (Ẩn SP)
          </button>

          <button
            type="button"
            onClick={() => setCategoryModalOpen(true)}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            🗂️ Quản lý Danh mục ({categories.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setProductModalOpen(true);
            }}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
          >
            + Thêm Phiên Bản iPhone Mới
          </button>
        </div>
      </div>

      {banner && (
        <div
          className={`flex items-center justify-between rounded-2xl border px-5 py-3.5 text-sm font-medium shadow-sm ${
            banner.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <span>
            {banner.type === 'success' ? '✅ ' : '⚠️ '}
            {banner.text}
          </span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="ml-4 text-xs font-bold underline opacity-75 hover:opacity-100"
          >
            Đóng
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">
            Tổng số phiên bản
          </div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">
            {summary.tongsophienban}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Bảng SAN_PHAM</div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
          <div className="text-xs font-semibold text-blue-700">
            Đang kinh doanh
          </div>
          <div className="mt-1 text-2xl font-extrabold text-blue-800">
            {summary.dangkinhdoanh}
          </div>
          <div className="mt-0.5 text-[11px] text-blue-600">
            Hiển thị cho khách
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700">
            Tổng máy tồn kho
          </div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-800">
            {summary.tongmaytonkho}
          </div>
          <div className="mt-0.5 text-[11px] text-emerald-600">
            Bảng TON_KHO
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <div className="text-xs font-semibold text-amber-800">
            Sắp hết hàng (≤ 5)
          </div>
          <div className="mt-1 text-2xl font-extrabold text-amber-900">
            {summary.saphethang}
          </div>
          <div className="mt-0.5 text-[11px] text-amber-700">
            Cần nhập bổ sung
          </div>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-4 shadow-sm">
          <div className="text-xs font-semibold text-orange-800">
            Tạm hết hàng (0)
          </div>
          <div className="mt-1 text-2xl font-extrabold text-orange-900">
            {summary.hethang}
          </div>
          <div className="mt-0.5 text-[11px] text-orange-700">
            HET_HANG
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 shadow-sm">
          <div className="text-xs font-semibold text-red-700">
            Đã ẩn / Ngừng bán
          </div>
          <div className="mt-1 text-2xl font-extrabold text-red-800">
            {summary.ngungkinhdoanh}
          </div>
          <div className="mt-0.5 text-[11px] text-red-600">
            Soft Delete
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
            🔍 Tìm kiếm & Lọc sản phẩm (Theo Tên, Mã SKU, Dòng iPhone, Dung lượng & Khoảng giá)
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên iPhone, mã SKU, màu sắc..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">Tất cả dòng iPhone</option>
              {categories.map((cat) => (
                <option key={cat.madanhmuc} value={cat.madanhmuc}>
                  {cat.tendanhmuc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStorage}
              onChange={(e) => setSelectedStorage(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">Tất cả dung lượng</option>
              <option value="128GB">128GB</option>
              <option value="256GB">256GB</option>
              <option value="512GB">512GB</option>
              <option value="1TB">1TB</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DANG_BAN">Đang kinh doanh</option>
              <option value="HET_HANG">Tạm hết hàng</option>
              <option value="NGUNG_KINH_DOANH">Ngừng kinh doanh (Đã ẩn)</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              <option value="newest">Mới nhất trước</option>
              <option value="price_desc">Giá cao → thấp</option>
              <option value="price_asc">Giá thấp → cao</option>
              <option value="name_asc">Tên A → Z</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <span className="text-xs font-semibold text-slate-600">
            Khoảng giá (VNĐ):
          </span>
          <input
            type="number"
            min={0}
            step="1000000"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Giá từ (VD: 15000000)"
            className="w-44 rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
          />
          <span className="text-slate-400">—</span>
          <input
            type="number"
            min={0}
            step="1000000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Đến giá (VD: 40000000)"
            className="w-44 rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
          />
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {[
              { label: 'Dưới 20 triệu', min: '', max: '20000000' },
              { label: '20 - 30 triệu', min: '20000000', max: '30000000' },
              { label: 'Trên 30 triệu', min: '30000000', max: '' },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setMinPrice(preset.min);
                  setMaxPrice(preset.max);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Đang tải dữ liệu sản phẩm và tồn kho...
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={(product) => {
            setEditingProduct(product);
            setProductModalOpen(true);
          }}
          onQuickStockPrice={(product) => setStockPriceTarget(product)}
          onHide={handleHideProduct}
          onRestore={handleRestoreProduct}
        />
      )}

      <ProductFormModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSubmit={handleSaveProduct}
        categories={categories}
        editingProduct={editingProduct}
      />

      <StockPriceModal
        open={Boolean(stockPriceTarget)}
        product={stockPriceTarget}
        onClose={() => setStockPriceTarget(null)}
        onSubmit={handleQuickStockPrice}
      />

      <CategoryManagerModal
        open={categoryModalOpen}
        categories={categories}
        onClose={() => setCategoryModalOpen(false)}
        onCreateCategory={async (tendanhmuc, mota) => {
          await categoriesApi.create({ tendanhmuc, mota });
          await loadData();
        }}
        onUpdateCategory={async (madanhmuc, tendanhmuc, mota) => {
          await categoriesApi.update(madanhmuc, { tendanhmuc, mota });
          await loadData();
        }}
        onDeleteCategory={async (madanhmuc) => {
          await categoriesApi.remove(madanhmuc);
          await loadData();
        }}
      />

      <StorePreviewModal
        open={storePreviewOpen}
        onClose={() => setStorePreviewOpen(false)}
        allStaffProducts={products}
      />
    </div>
  );
}
