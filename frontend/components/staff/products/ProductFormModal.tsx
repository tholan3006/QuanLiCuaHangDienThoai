'use client';

import React, { useEffect, useState } from 'react';
import { CategoryItem } from '../../../services/categories.api';
import {
  CreateProductPayload,
  ProductItem,
} from '../../../services/products.api';

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProductPayload) => Promise<void>;
  categories: CategoryItem[];
  editingProduct?: ProductItem | null;
}

const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];
const COLOR_SUGGESTIONS = [
  'Titan Sa Mạc',
  'Titan Tự Nhiên',
  'Titan Đen',
  'Titan Trắng',
  'Xanh Lưu Ly',
  'Hồng',
  'Titan Xanh',
  'Tím',
  'Trắng Starlight',
];

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  categories,
  editingProduct,
}: ProductFormModalProps) {
  const [tensanpham, setTensanpham] = useState('');
  const [madanhmuc, setMadanhmuc] = useState<number>(categories[0]?.madanhmuc || 1);
  const [dungluong, setDungluong] = useState('256GB');
  const [mausac, setMausac] = useState('');
  const [sku, setSku] = useState('');
  const [giaban, setGiaban] = useState<string>('');
  const [soluong, setSoluong] = useState<string>('10');
  const [hinhanh, setHinhanh] = useState('');
  const [mota, setMota] = useState('');
  const [trangthai, setTrangthai] = useState<
    'DANG_BAN' | 'NGUNG_KINH_DOANH' | 'HET_HANG'
  >('DANG_BAN');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setTensanpham(editingProduct.tensanpham);
      setMadanhmuc(editingProduct.madanhmuc);
      setDungluong(editingProduct.dungluong);
      setMausac(editingProduct.mausac);
      setSku(editingProduct.sku || '');
      setGiaban(String(editingProduct.giaban));
      setSoluong(String(editingProduct.soluongton));
      setHinhanh(editingProduct.hinhanh || '');
      setMota(
        (editingProduct.mota || '').replace(/\[SKU:\s*[^\]]+\]\s*/i, ''),
      );
      setTrangthai(editingProduct.trangthai);
    } else {
      setTensanpham('');
      setMadanhmuc(categories[0]?.madanhmuc || 1);
      setDungluong('256GB');
      setMausac('Titan Tự Nhiên');
      setSku('');
      setGiaban('29990000');
      setSoluong('15');
      setHinhanh(
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80',
      );
      setMota('');
      setTrangthai('DANG_BAN');
    }
    setError(null);
  }, [editingProduct, categories, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = Number(giaban);
    const parsedStock = Number(soluong);

    if (!tensanpham.trim()) {
      setError('Vui lòng nhập tên sản phẩm iPhone (tensanpham)');
      return;
    }
    if (!mausac.trim()) {
      setError('Vui lòng nhập màu sắc phiên bản (mausac)');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Giá bán (giaban) phải lớn hơn 0 (Ràng buộc CHECK)');
      return;
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setError('Số lượng tồn kho (soluong) phải là số nguyên >= 0 (Ràng buộc CHECK)');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        tensanpham: tensanpham.trim(),
        madanhmuc: Number(madanhmuc),
        dungluong,
        mausac: mausac.trim(),
        sku: sku.trim() || undefined,
        giaban: parsedPrice,
        soluong: parsedStock,
        hinhanh: hinhanh.trim() || undefined,
        mota: mota.trim() || undefined,
        trangthai,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50 rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingProduct
                ? `Chỉnh sửa sản phẩm #${editingProduct.masanpham}`
                : 'Thêm mới phiên bản iPhone (SAN_PHAM & TON_KHO)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý từng phiên bản theo dòng máy, màu sắc, dung lượng và mã SKU riêng biệt
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Danh mục dòng iPhone (<code className="text-blue-600">madanhmuc</code>) *
              </label>
              <select
                value={madanhmuc}
                onChange={(e) => setMadanhmuc(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.madanhmuc} value={c.madanhmuc}>
                    #{c.madanhmuc} - {c.tendanhmuc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Mã định danh phiên bản (<code className="text-blue-600">SKU</code>)
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="VD: IP16PM-256-DES (Tự tạo nếu để trống)"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Tên sản phẩm (<code className="text-blue-600">tensanpham</code>) *
              </label>
              <input
                type="text"
                value={tensanpham}
                onChange={(e) => setTensanpham(e.target.value)}
                placeholder="VD: iPhone 16 Pro Max"
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Dung lượng (<code className="text-blue-600">dungluong</code>) *
              </label>
              <select
                value={dungluong}
                onChange={(e) => setDungluong(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              >
                {STORAGE_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Màu sắc (<code className="text-blue-600">mausac</code>) *
              </label>
              <input
                type="text"
                list="iphone-colors"
                value={mausac}
                onChange={(e) => setMausac(e.target.value)}
                placeholder="VD: Titan Sa Mạc"
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />
              <datalist id="iphone-colors">
                {COLOR_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Giá bán VNĐ (<code className="text-blue-600">giaban &gt; 0</code>) *
              </label>
              <input
                type="number"
                min={1}
                step="1000"
                value={giaban}
                onChange={(e) => setGiaban(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-blue-700 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Số lượng tồn (<code className="text-blue-600">TON_KHO.soluong</code>) *
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={soluong}
                onChange={(e) => setSoluong(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Trạng thái (<code className="text-blue-600">trangthai</code>)
              </label>
              <select
                value={trangthai}
                onChange={(e) => setTrangthai(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              >
                <option value="DANG_BAN">Đang kinh doanh (DANG_BAN)</option>
                <option value="HET_HANG">Tạm hết hàng (HET_HANG)</option>
                <option value="NGUNG_KINH_DOANH">
                  Ngừng kinh doanh / Ẩn (NGUNG_KINH_DOANH)
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Đường dẫn hình ảnh (<code className="text-blue-600">hinhanh</code>)
            </label>
            <input
              type="text"
              value={hinhanh}
              onChange={(e) => setHinhanh(e.target.value)}
              placeholder="https://... hoặc /images/products/..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Mô tả kỹ thuật (<code className="text-blue-600">mota</code>)
            </label>
            <textarea
              rows={3}
              value={mota}
              onChange={(e) => setMota(e.target.value)}
              placeholder="Nhập thông số màn hình, chip xử lý, camera..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting
                ? 'Đang lưu CSDL...'
                : editingProduct
                  ? 'Lưu thay đổi'
                  : 'Thêm sản phẩm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
