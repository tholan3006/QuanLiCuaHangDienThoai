'use client';

import {
  ArrowRight,
  Check,
  Palette,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import ProductCard from '../../../../components/store/ProductCard';
import StoreToast, { ToastMessage } from '../../../../components/store/StoreToast';
import { ProductItem, productsApi } from '../../../../services/products.api';
import { useCartStore } from '../../../../stores/cart.store';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [siblingProducts, setSiblingProducts] = useState<ProductItem[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Số lượng khách chọn mua
  const [quantity, setQuantity] = useState(1);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToCart = useCartStore((state) => state.addToCart);

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
    async function fetchDetail() {
      if (!productId || isNaN(productId)) {
        setError('Mã sản phẩm không hợp lệ');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const prod = await productsApi.getById(productId);
        setProduct(prod);

        // Lấy các phiên bản cùng tên máy (để đổi dung lượng/màu)
        const allStore = await productsApi.getForStore({ madanhmuc: prod.madanhmuc });
        const siblings = allStore.data.filter(
          (p) => p.tensanpham.toLowerCase() === prod.tensanpham.toLowerCase(),
        );
        setSiblingProducts(siblings);

        // Lấy sản phẩm gợi ý
        const related = allStore.data
          .filter((p) => p.masanpham !== prod.masanpham)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (err: any) {
        setError(err?.message || 'Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
    setQuantity(1);
  }, [productId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
        <div className="text-xs text-slate-500 font-semibold mt-3">
          Đang tải chi tiết phiên bản iPhone...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Không tìm thấy thông tin sản phẩm
        </h2>
        <p className="text-xs text-slate-500">
          {error || 'Sản phẩm này không tồn tại hoặc đã ngừng kinh doanh (Soft Delete).'}
        </p>
        <Link
          href="/products"
          className="inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
        >
          ➔ Quay lại Danh sách Sản phẩm
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.soluongton <= 0 || product.trangthai === 'HET_HANG';
  const isLowStock = product.soluongton > 0 && product.soluongton <= 5;

  const handleQuantityChange = (delta: number) => {
    const next = quantity + delta;
    if (next < 1) return;
    if (next > product.soluongton) {
      addToast(
        `Số lượng yêu cầu vượt quá tồn kho hiện tại (chỉ còn ${product.soluongton} máy)`,
        false,
      );
      return;
    }
    setQuantity(next);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, quantity);
    addToast(res.message, res.success);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, quantity);
    if (res.success) {
      router.push('/checkout');
    } else {
      addToast(res.message, false);
    }
  };

  // Lọc các màu sắc và dung lượng sẵn có của dòng máy này
  const availableStorages = Array.from(new Set(siblingProducts.map((p) => p.dungluong)));
  const availableColors = Array.from(new Set(siblingProducts.map((p) => p.mausac)));

  const handleSelectSibling = (storage: string, color: string) => {
    const matched = siblingProducts.find(
      (p) => p.dungluong === storage && p.mausac === color,
    );
    if (matched) {
      router.push(`/products/${matched.masanpham}`);
    } else {
      const fallback = siblingProducts.find((p) => p.dungluong === storage);
      if (fallback) router.push(`/products/${fallback.masanpham}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-sky-600 transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-sky-600 transition-colors">
          Sản phẩm
        </Link>
        <span>/</span>
        <Link
          href={`/products?madanhmuc=${product.madanhmuc}`}
          className="hover:text-sky-600 transition-colors"
        >
          {product.DANH_MUC?.tendanhmuc || 'Dòng iPhone'}
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-900 truncate max-w-xs">
          {product.tensanpham} ({product.dungluong} - {product.mausac})
        </span>
      </nav>

      {/* Thông tin Chi Tiết Sản Phẩm */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cột trái: Hình ảnh & Badge */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex items-center justify-center">
            {product.hinhanh ? (
              <img
                src={product.hinhanh}
                alt={product.tensanpham}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-xs text-slate-400">Chưa có ảnh</div>
            )}

            {/* Badges */}
            <span className="absolute top-4 left-4 rounded-xl bg-slate-900/90 backdrop-blur px-3 py-1 text-xs font-bold text-white shadow">
              {product.dungluong}
            </span>

            <span
              className={`absolute top-4 right-4 rounded-xl px-3 py-1 text-xs font-bold shadow ${
                isOutOfStock
                  ? 'bg-rose-500 text-white'
                  : isLowStock
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
              }`}
            >
              {isOutOfStock
                ? 'Tạm hết hàng'
                : isLowStock
                  ? `Sắp hết (Còn ${product.soluongton})`
                  : `Sẵn hàng (${product.soluongton} máy)`}
            </span>
          </div>

          {/* Khối cam kết Apple Care */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 space-y-2 text-xs text-sky-950">
            <div className="font-bold flex items-center gap-2 text-sm text-sky-900">
              <ShieldCheck className="h-5 w-5 text-sky-600" />
              <span>Bảo Hành Apple Chính Hãng 12 Tháng</span>
            </div>
            <p className="text-[11px] leading-relaxed text-sky-800">
              Sản phẩm phiên bản VN/A chính hãng, được bảo hành 12 tháng tại các trung tâm Apple Care ủy quyền trên toàn quốc. 1 đổi 1 trong 30 ngày nếu lỗi phần cứng.
            </p>
          </div>
        </div>

        {/* Cột phải: Thông số, Biến thể & Đặt Mua */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600 mb-1">
              <span>{product.DANH_MUC?.tendanhmuc}</span>
              <span>•</span>
              <span>Mã SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {product.tensanpham}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center text-amber-500 font-bold gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-slate-800">5.0</span>
                <span className="text-slate-400">(Đánh giá tốt)</span>
              </div>
              <span>•</span>
              <span className="font-semibold text-emerald-600">
                Kho: {product.soluongton} máy
              </span>
            </div>
          </div>

          {/* Khung Giá Bán */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Giá bán niêm yết (Đã gồm VAT)</div>
            <div className="text-3xl font-black text-rose-600 tracking-tight">
              {product.giaban.toLocaleString('vi-VN')} ₫
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold text-[10px]">
                Miễn phí vận chuyển
              </span>
              <span>Trả góp 0% qua thẻ tín dụng</span>
            </div>
          </div>

          {/* Lựa chọn Dung lượng (Bộ nhớ) */}
          {availableStorages.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                1. Chọn Dung Lượng Bộ Nhớ
              </label>
              <div className="flex flex-wrap gap-2.5">
                {availableStorages.map((st) => {
                  const isCurrent = st === product.dungluong;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleSelectSibling(st, product.mausac)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
                        isCurrent
                          ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lựa chọn Màu sắc */}
          {availableColors.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-sky-600" />
                <span>2. Chọn Màu Sắc: <strong className="text-slate-900">{product.mausac}</strong></span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {availableColors.map((col) => {
                  const isCurrent = col === product.mausac;
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => handleSelectSibling(product.dungluong, col)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
                        isCurrent
                          ? 'border-sky-600 bg-sky-50 text-sky-700 ring-2 ring-sky-600/30'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bộ chọn số lượng (Chặn vượt tồn kho) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              3. Số Lượng Mua (Tối đa {product.soluongton} máy)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-2xl border border-slate-300 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-black text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.soluongton || isOutOfStock}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                >
                  +
                </button>
              </div>

              <div className="text-xs text-slate-500">
                Thành tiền: <strong className="text-rose-600 text-sm font-black">{(product.giaban * quantity).toLocaleString('vi-VN')} ₫</strong>
              </div>
            </div>
          </div>

          {/* Nút Mua hàng & Thêm Giỏ */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 rounded-xl py-3.5 px-6 text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Thêm Vào Giỏ Hàng</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`flex-1 rounded-xl py-3.5 px-6 text-xs font-extrabold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>{isOutOfStock ? 'Tạm Hết Hàng' : 'Mua Ngay (Checkout)'}</span>
            </button>
          </div>

          {/* Mô tả chi tiết */}
          {product.mota && (
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Mô tả sản phẩm
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {product.mota}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bảng Thông Số Kỹ Thuật Chi Tiết */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-sky-600" />
          <span>Thông Số Kỹ Thuật Chi Tiết</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-2">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Mã SKU:</span>
              <span className="font-bold text-slate-800">{product.sku}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Dòng sản phẩm:</span>
              <span className="font-bold text-slate-800">{product.DANH_MUC?.tendanhmuc}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Dung lượng bộ nhớ:</span>
              <span className="font-bold text-slate-800">{product.dungluong}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Màu sắc phiên bản:</span>
              <span className="font-bold text-slate-800">{product.mausac}</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-2">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Tình trạng máy:</span>
              <span className="font-bold text-emerald-600">Mới 100% Nguyên Hộp (VN/A)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Số lượng trong kho:</span>
              <span className="font-bold text-slate-800">{product.soluongton} máy</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Thời gian bảo hành:</span>
              <span className="font-bold text-slate-800">12 Tháng Apple Care</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Trạng thái kinh doanh:</span>
              <span className="font-bold text-sky-600">
                {product.trangthai === 'DANG_BAN' ? 'Đang kinh doanh' : product.trangthai}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sản phẩm gợi ý liên quan */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Sản Phẩm Cùng Dòng Máy
            </h3>
            <Link
              href={`/products?madanhmuc=${product.madanhmuc}`}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Xem tất cả ({siblingProducts.length})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.masanpham}
                product={p}
                onAddedToCart={addToast}
              />
            ))}
          </div>
        </div>
      )}

      {/* Toast Alert */}
      <StoreToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
