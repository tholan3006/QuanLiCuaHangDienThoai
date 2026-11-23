'use client';

import React, { useState } from 'react';
import { CategoryItem } from '../../../services/categories.api';

interface CategoryManagerModalProps {
  open: boolean;
  categories: CategoryItem[];
  onClose: () => void;
  onCreateCategory: (tendanhmuc: string, mota?: string) => Promise<void>;
  onUpdateCategory: (
    madanhmuc: number,
    tendanhmuc: string,
    mota?: string,
  ) => Promise<void>;
  onDeleteCategory: (madanhmuc: number) => Promise<void>;
}

export default function CategoryManagerModal({
  open,
  categories,
  onClose,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagerModalProps) {
  const [tendanhmuc, setTendanhmuc] = useState('');
  const [mota, setMota] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!tendanhmuc.trim()) {
      setMessage({ type: 'error', text: 'Tên danh mục không được để trống' });
      return;
    }

    try {
      setLoading(true);
      if (editingId !== null) {
        await onUpdateCategory(editingId, tendanhmuc.trim(), mota.trim());
        setMessage({
          type: 'success',
          text: `Đã cập nhật danh mục #${editingId} thành công`,
        });
      } else {
        await onCreateCategory(tendanhmuc.trim(), mota.trim());
        setMessage({
          type: 'success',
          text: `Đã thêm danh mục "${tendanhmuc.trim()}" vào bảng DANH_MUC`,
        });
      }
      setTendanhmuc('');
      setMota('');
      setEditingId(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi xử lý danh mục' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    setMessage(null);
    try {
      setLoading(true);
      await onDeleteCategory(cat.madanhmuc);
      setMessage({
        type: 'success',
        text: `Đã xóa danh mục "${cat.tendanhmuc}" thành công`,
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Không thể xóa danh mục đang có sản phẩm',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Quản lý Danh mục Dòng iPhone (Bảng DANH_MUC)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thêm, xem, sửa và xóa theo quy tắc bảo toàn dữ liệu (ON DELETE RESTRICT)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-xs font-medium border ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {message.type === 'success' ? '✅ ' : '⚠️ '}
              {message.text}
            </div>
          )}

          <form
            onSubmit={handleSave}
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {editingId
                ? `Đang chỉnh sửa danh mục #${editingId}`
                : 'Thêm danh mục dòng iPhone mới'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={tendanhmuc}
                onChange={(e) => setTendanhmuc(e.target.value)}
                placeholder="Tên danh mục (VD: iPhone 17 Series)"
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
              <input
                type="text"
                value={mota}
                onChange={(e) => setMota(e.target.value)}
                placeholder="Mô tả dòng sản phẩm (mota)"
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              {editingId !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTendanhmuc('');
                    setMota('');
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Hủy sửa
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                {editingId !== null ? 'Cập nhật danh mục' : '+ Thêm danh mục'}
              </button>
            </div>
          </form>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-2.5">Mã (madanhmuc)</th>
                  <th className="px-4 py-2.5">Tên dòng iPhone (tendanhmuc)</th>
                  <th className="px-4 py-2.5 text-center">Số SP</th>
                  <th className="px-4 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map((cat) => (
                  <tr key={cat.madanhmuc} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-slate-500">
                      #{cat.madanhmuc}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900">
                        {cat.tendanhmuc}
                      </div>
                      {cat.mota && (
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {cat.mota}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {cat.soluongsanpham ?? 0} máy
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(cat.madanhmuc);
                          setTendanhmuc(cat.tendanhmuc);
                          setMota(cat.mota || '');
                          setMessage(null);
                        }}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
