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
import ProductCard, {
  COLOR_TRANSLATIONS,
  getLocalizedColor,
} from '../../../../components/store/ProductCard';
import StoreToast, { ToastMessage } from '../../../../components/store/StoreToast';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { authApi, CustomerProfile, openCustomerAuthModal } from '../../../../services/auth.api';
import { ProductItem, productsApi } from '../../../../services/products.api';
import { useCartStore } from '../../../../stores/cart.store';

// Danh sách dung lượng tiêu chuẩn của Apple
const STANDARD_STORAGES = ['128GB', '256GB', '512GB', '1TB'];

// Bảng màu sắc tương ứng với mã màu thẩm mỹ
const COLOR_MAP: Record<string, string> = {
  'Titan Sa Mạc': '#C5A988',
  'Titan Tự Nhiên': '#9B9994',
  'Titan Trắng': '#E3E4E6',
  'Titan Đen': '#36373A',
  'Titan Xanh': '#2E3A48',
  'Hồng': '#E8A5B8',
  'Xanh Lưu Ly': '#37578D',
  'Xanh Mòng Két': '#66827A',
  'Đen': '#1F2024',
  'Trắng': '#F2F2F2',
  'Trắng Ánh Sao': '#F0EFE9',
  'Đen Midnight': '#1F2024',
  'Xanh Dương': '#37578D',
  'Tím': '#C7BCE1',
  'Vàng': '#F6E5A8',
  'Xanh Alpine': '#536557',
};

export default function ProductDetailPage() {
  const { t, lang } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [siblingProducts, setSiblingProducts] = useState<ProductItem[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Số lượng khách chọn mua
  const [quantity, setQuantity] = useState(1);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);

  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    setCustomer(authApi.getCurrentCustomer());
    const handleAuthChange = () => setCustomer(authApi.getCurrentCustomer());
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // TỰ ĐỘNG CUỘN LÊN ĐẦU TRANG MỖI KHI CLICK CHỌN SẢN PHẨM MỚI HOẶC KHÁC
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [productId]);

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
        setError(lang === 'VI' ? 'Mã sản phẩm không hợp lệ' : 'Invalid product ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const prod = await productsApi.getById(productId);
        setProduct(prod);
        setSelectedImage(prod.hinhanh || '');

        // Lấy các phiên bản cùng dòng máy (để đổi dung lượng/màu)
        const allStore = await productsApi.getForStore({ madanhmuc: prod.madanhmuc });
        const siblings = allStore.data.filter(
          (p) =>
            p.tensanpham.toLowerCase() === prod.tensanpham.toLowerCase() ||
            p.DANH_MUC?.madanhmuc === prod.madanhmuc,
        );
        setSiblingProducts(siblings);

        // Lấy sản phẩm gợi ý
        const related = allStore.data
          .filter((p) => p.masanpham !== prod.masanpham)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (err: any) {
        setError(err.message || (lang === 'VI' ? 'Không thể tải thông tin sản phẩm' : 'Failed to load product'));
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [productId, lang]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="inline-block h-9 w-9 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-3">
          {lang === 'VI' ? 'Đang tải chi tiết phiên bản iPhone...' : 'Loading iPhone details...'}
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {lang === 'VI' ? 'Không tìm thấy thông tin sản phẩm' : 'Product Not Found'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {error || (lang === 'VI' ? 'Sản phẩm này không tồn tại hoặc đã ngừng kinh doanh.' : 'This product does not exist or has been discontinued.')}
        </p>
        <Link
          href="/products"
          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
          className="inline-block rounded-xl bg-slate-900 dark:bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-sky-500"
        >
          ➔ {lang === 'VI' ? 'Quay lại Danh sách Sản phẩm' : 'Back to Product Catalog'}
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
        lang === 'VI'
          ? `Số lượng yêu cầu vượt quá tồn kho hiện tại (chỉ còn ${product.soluongton} máy)`
          : `Requested quantity exceeds available stock (only ${product.soluongton} left)`,
        false,
      );
      return;
    }
    setQuantity(next);
  };

  // KIỂM TRA ĐĂNG NHẬP TRƯỚC KHI THÊM GIỎ
  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const curCustomer = authApi.getCurrentCustomer();
    if (!curCustomer) {
      addToast(
        lang === 'VI'
          ? 'Vui lòng đăng nhập tài khoản Khách Hàng để thêm vào giỏ hàng!'
          : 'Please sign in to your customer account to add items to cart!',
        false,
      );
      openCustomerAuthModal(
        lang === 'VI'
          ? 'Vui lòng đăng nhập tài khoản để thêm sản phẩm vào giỏ hàng!'
          : 'Please sign in to add products to your cart!',
      );
      return;
    }

    // NGHIỆP VỤ: Nhân viên và Admin không mua hàng trên Storefront
    if (curCustomer.role === 'NHAN_VIEN' || curCustomer.role === 'ADMIN') {
      addToast(
        lang === 'VI'
          ? 'Tài khoản Nhân viên / Quản trị viên không thực hiện mua hàng trên Storefront!'
          : 'Staff / Admin accounts cannot purchase items on Storefront!',
        false,
      );
      return;
    }

    const res = addToCart(product, quantity);
    addToast(res.message, res.success);
  };

  // KIỂM TRA ĐĂNG NHẬP TRƯỚC KHI MUA NGAY
  const handleBuyNow = () => {
    if (isOutOfStock) return;

    const curCustomer = authApi.getCurrentCustomer();
    if (!curCustomer) {
      addToast(
        lang === 'VI'
          ? 'Vui lòng đăng nhập tài khoản Khách Hàng để tiến hành mua hàng!'
          : 'Please sign in to your customer account to proceed with purchase!',
        false,
      );
      openCustomerAuthModal(
        lang === 'VI'
          ? 'Vui lòng đăng nhập tài khoản để tiến hành mua hàng!'
          : 'Please sign in to proceed with purchase!',
      );
      return;
    }

    // NGHIỆP VỤ: Nhân viên và Admin không mua hàng trên Storefront
    if (curCustomer.role === 'NHAN_VIEN' || curCustomer.role === 'ADMIN') {
      addToast(
        lang === 'VI'
          ? 'Tài khoản Nhân viên / Quản trị viên không thực hiện mua hàng trên Storefront!'
          : 'Staff / Admin accounts cannot purchase items on Storefront!',
        false,
      );
      return;
    }

    const res = addToCart(product, quantity);
    if (res.success) {
      router.push('/checkout');
    } else {
      addToast(res.message, false);
    }
  };

  // Chuẩn bị danh sách ảnh gallery đầy đủ
  const galleryImages: string[] = [
    product.hinhanh || '',
    ...(product.hinhanhList || []),
  ].filter(
    (img, idx, arr) => img && arr.indexOf(img) === idx,
  );

  if (galleryImages.length === 1) {
    if (product.tensanpham.includes('Pro')) {
      galleryImages.push('/images/products/gallery/iphone-16-pro-angle.png');
      galleryImages.push('/images/products/gallery/iphone-16-pro-back.png');
    } else {
      galleryImages.push('/images/products/gallery/iphone-16-angle.png');
      galleryImages.push('/images/products/gallery/iphone-16-back.png');
    }
  }

  // Danh sách màu sắc thực tế của model hiện tại
  const directSiblings = siblingProducts.filter(
    (p) => p.tensanpham.toLowerCase() === product.tensanpham.toLowerCase(),
  );
  const availableColors = Array.from(new Set(directSiblings.map((p) => p.mausac)));
  const availableStorages = Array.from(new Set(directSiblings.map((p) => p.dungluong)));

  const handleSelectStorage = (st: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const matched = directSiblings.find((p) => p.dungluong === st && p.mausac === product.mausac);
    if (matched) {
      router.push(`/products/${matched.masanpham}`);
    } else {
      const anyWithStorage = directSiblings.find((p) => p.dungluong === st);
      if (anyWithStorage) {
        router.push(`/products/${anyWithStorage.masanpham}`);
      } else {
        addToast(
          lang === 'VI'
            ? `Phiên bản dung lượng ${st} tạm thời chưa sẵn sàng!`
            : `Storage capacity ${st} is temporarily unavailable!`,
          false,
        );
      }
    }
  };

  const handleSelectColor = (col: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const matched = directSiblings.find((p) => p.mausac === col);
    if (matched) {
      router.push(`/products/${matched.masanpham}`);
    } else {
      addToast(
        lang === 'VI'
          ? `Màu sắc ${getLocalizedColor(col, lang)} tạm thời chưa sẵn sàng!`
          : `Color ${getLocalizedColor(col, lang)} is temporarily unavailable!`,
        false,
      );
    }
  };

  const currentColorName = getLocalizedColor(product.mausac, lang);

  // Dịch phần mô tả sản phẩm sang tiếng Anh mượt mà khi lang === 'EN'
  const localizedDescription = lang === 'EN'
    ? `[SKU: ${product.sku}] Official ${product.dungluong} edition in ${currentColorName} finish, equipped with Super Retina XDR OLED display, advanced Apple Bionic/A-series processor, pro-grade camera system, and outstanding all-day battery life.`
    : product.mota;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
          {t('home')}
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
          {t('products')}
        </Link>
        <span>/</span>
        <Link
          href={`/products?madanhmuc=${product.madanhmuc}`}
          className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          {product.DANH_MUC?.tendanhmuc || 'iPhone Series'}
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">
          {product.tensanpham} ({product.dungluong} - {currentColorName})
        </span>
      </nav>

      {/* Thông tin Chi Tiết Sản Phẩm */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: GALLERY HÌNH ẢNH TRONG SUỐT (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Ảnh Lớn Chính */}
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-slate-50/80 dark:bg-slate-900/80 p-8 shadow-sm flex items-center justify-center border border-slate-200/80 dark:border-slate-800 transition-all">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.tensanpham}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_16px_32px_rgba(0,0,0,0.6)] transition-all duration-300"
              />
            ) : (
              <div className="text-xs text-slate-400">iPhone</div>
            )}

            {/* Badges */}
            <span className="absolute top-4 left-4 rounded-xl bg-slate-900/90 dark:bg-slate-800 backdrop-blur px-3 py-1 text-xs font-bold text-white shadow">
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
                ? t('out_of_stock')
                : isLowStock
                  ? `${t('only_left')} ${product.soluongton} ${t('units_left')}`
                  : `${t('in_stock')} (${product.soluongton} ${t('units_left')})`}
            </span>
          </div>

          {/* GALLERY THUMBNAILS (BẤM ĐỔI ẢNH PREVIEW) */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{lang === 'VI' ? `Hình ảnh chi tiết (${galleryImages.length} góc nhìn)` : `Product views (${galleryImages.length} angles)`}</span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
                {lang === 'VI' ? 'Click để đổi ảnh preview' : 'Click to preview'}
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {galleryImages.map((imgUrl, i) => {
                const isActive = (selectedImage || product.hinhanh) === imgUrl;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative h-20 w-20 shrink-0 rounded-2xl p-2 border transition-all flex items-center justify-center overflow-hidden ${
                      isActive
                        ? 'border-sky-600 ring-2 ring-sky-500/40 bg-white dark:bg-slate-800 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-slate-50 dark:bg-slate-900'
                    }`}
                    title={`View angle ${i + 1}`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${i + 1}`}
                      className="h-full w-full object-contain filter drop-shadow-sm"
                    />
                    {isActive && (
                      <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-sky-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Khối cam kết Apple Care */}
          <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/40 p-4 space-y-2 text-xs text-sky-950 dark:text-sky-200">
            <div className="font-bold flex items-center gap-2 text-sm text-sky-900 dark:text-sky-300">
              <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <span>{t('warranty_title')}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-sky-800 dark:text-sky-300">
              {t('warranty_desc')}
            </p>
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG SỐ, OPTIONS DUNG LƯỢNG & MÀU SẮC ĐA DẠNG (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 mb-1">
              <span>{product.DANH_MUC?.tendanhmuc}</span>
              <span>•</span>
              <span>SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {product.tensanpham}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center text-amber-500 font-bold gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-slate-800 dark:text-slate-200">5.0</span>
                <span className="text-slate-400 dark:text-slate-500">
                  {lang === 'VI' ? '(Đánh giá tốt)' : '(Highly rated)'}
                </span>
              </div>
              <span>•</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {t('stock_label')}: {product.soluongton} {t('units_left')} {lang === 'VI' ? 'có sẵn' : 'available'}
              </span>
            </div>
          </div>

          {/* Khung Giá Bán (ĐÃ XÓA TRẢ GÓP 0%) */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 shadow-sm space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {lang === 'VI' ? 'Giá bán niêm yết (Đã gồm VAT)' : 'Official Retail Price (VAT Incl.)'}
            </div>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {product.giaban.toLocaleString('vi-VN')} ₫
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-1 flex-wrap">
              <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 font-bold text-[10px]">
                {lang === 'VI' ? 'Miễn phí vận chuyển toàn quốc' : 'Free Nationwide Express Shipping'}
              </span>
            </div>
          </div>

          {/* 1. ĐA DẠNG LỰA CHỌN DUNG LƯỢNG (BỘ NHỚ) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>{t('select_storage_title')}</span>
              <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                {t('selected_storage_label')}: {product.dungluong}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {STANDARD_STORAGES.map((st) => {
                const isCurrent = st === product.dungluong;
                const hasVariant = availableStorages.includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectStorage(st)}
                    className={`rounded-2xl p-3 text-xs font-bold transition-all border text-center relative ${
                      isCurrent
                        ? 'border-slate-900 dark:border-sky-500 bg-slate-900 dark:bg-sky-600 text-white shadow-md'
                        : hasVariant
                          ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-extrabold">{st}</div>
                    <div className="text-[10px] mt-0.5 font-normal opacity-80">
                      {isCurrent ? t('selected_storage_label') : hasVariant ? t('available_storage') : t('out_storage')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ĐA DẠNG LỰA CHỌN MÀU SẮC (DỊCH MÀU THEO NGÔN NGỮ CHỌN) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>
                  {t('select_color_title')}: <strong className="text-slate-900 dark:text-slate-100">{currentColorName}</strong>
                </span>
              </div>
              <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                {availableColors.length} {t('colors_count')}
              </span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {availableColors.map((col) => {
                const isCurrent = col === product.mausac;
                const hexColor = COLOR_MAP[col] || '#94A3B8';
                const colLabel = getLocalizedColor(col, lang);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleSelectColor(col)}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all border ${
                      isCurrent
                        ? 'border-sky-600 dark:border-sky-400 bg-sky-50/80 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 ring-2 ring-sky-500/30 shadow-sm'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/20 shadow-inner shrink-0"
                      style={{ backgroundColor: hexColor }}
                    />
                    <span>{colLabel}</span>
                    {isCurrent && <Check className="h-3 w-3 text-sky-600 dark:text-sky-400 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. BỘ CHỌN SỐ LƯỢNG & NÚT MUA HÀNG (CHỈ DÀNH CHO KHÁCH HÀNG / GUEST) */}
          {customer && (customer.role === 'NHAN_VIEN' || customer.role === 'ADMIN') ? (
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>{lang === 'VI' ? 'Tài Khoản Quản Lý / Nhân Viên' : 'Staff / Admin Management Account'}</span>
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                {lang === 'VI'
                  ? `Bạn đang đăng nhập với quyền ${customer.role === 'ADMIN' ? 'Quản Trị Viên' : 'Nhân Viên Bán Hàng'}. Storefront chỉ phục vụ khách hàng mua sắm. Nhân viên không thực hiện đặt hàng trên giao diện này.`
                  : `You are signed in as ${customer.role === 'ADMIN' ? 'Admin' : 'Staff'}. Storefront purchasing is strictly for customers.`}
              </p>
              <div className="pt-1 flex flex-wrap gap-2.5">
                <Link
                  href={customer.role === 'ADMIN' ? '/admin' : '/staff/products'}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-bold shadow transition-all"
                >
                  <span>{lang === 'VI' ? 'Đến Cổng Quản Lý Sản Phẩm' : 'Go to Product Management'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/staff/orders"
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-indigo-800 dark:text-indigo-200 px-4 py-2.5 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all"
                >
                  <span>{lang === 'VI' ? 'Xem Danh Sách Đơn Hàng' : 'View Orders List'}</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* 3. BỘ CHỌN SỐ LƯỢNG (CHẶN VƯỢT TỒN KHO) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                  {t('purchase_quantity')} ({t('max_stock_label')} {product.soluongton} {t('units_left')})
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-sm font-black text-slate-900 dark:text-slate-100">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.soluongton || isOutOfStock}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t('subtotal_label')}: <strong className="text-rose-600 dark:text-rose-400 text-sm font-black">{(product.giaban * quantity).toLocaleString('vi-VN')} ₫</strong>
                  </div>
                </div>
              </div>

              {/* 4. NÚT MUA HÀNG & THÊM GIỎ */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 rounded-2xl py-3.5 px-6 text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                    isOutOfStock
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{t('add_cart_btn')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 rounded-2xl py-3.5 px-6 text-xs font-extrabold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  <span>{isOutOfStock ? t('out_of_stock') : t('buy_now_btn')}</span>
                </button>
              </div>
            </>
          )}

          {/* Mô tả chi tiết (Tự động dịch sang tiếng Anh khi chọn EN) */}
          {localizedDescription && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                {lang === 'VI' ? 'Mô tả sản phẩm' : 'Product Description'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                {localizedDescription}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bảng Thông Số Kỹ Thuật Chi Tiết */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <span>{t('specs_title')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-2">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">SKU:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{product.sku}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">{lang === 'VI' ? 'Dòng sản phẩm:' : 'Series:'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{product.DANH_MUC?.tendanhmuc}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">{lang === 'VI' ? 'Dung lượng:' : 'Capacity:'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{product.dungluong}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">{lang === 'VI' ? 'Màu sắc:' : 'Color:'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentColorName}</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-2">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">{lang === 'VI' ? 'Tình trạng máy:' : 'Condition:'}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {lang === 'VI' ? 'Mới 100% Nguyên Hộp (VN/A)' : 'Brand New 100% Sealed Box (VN/A)'}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">{lang === 'VI' ? 'Số lượng tồn kho:' : 'Stock Available:'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{product.soluongton} {t('units_left')}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">{lang === 'VI' ? 'Bảo hành:' : 'Warranty:'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{t('apple_care_12m')}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">{lang === 'VI' ? 'Trạng thái kinh doanh:' : 'Status:'}</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">
                {product.trangthai === 'DANG_BAN' ? (lang === 'VI' ? 'Đang kinh doanh' : 'Active & In Stock') : product.trangthai}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sản phẩm gợi ý liên quan */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t('related_title')}
            </h3>
            <Link
              href={`/products?madanhmuc=${product.madanhmuc}`}
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1"
            >
              <span>{lang === 'VI' ? `Xem tất cả (${siblingProducts.length})` : `View all (${siblingProducts.length})`}</span>
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
