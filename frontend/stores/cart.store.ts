import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductItem } from '../services/products.api';

export interface CartItem {
  masanpham: number;
  sku: string;
  tensanpham: string;
  dungluong: string;
  mausac: string;
  giaban: number;
  soluong: number;
  soluongton: number; // Tồn kho thực tế để chặn vượt
  hinhanh?: string | null;
  madanhmuc: number;
  tendanhmuc?: string;
  // Cờ cảnh báo khi đối chiếu Checkout
  priceChanged?: boolean;
  oldPrice?: number;
  outOfStock?: boolean;
  discontinued?: boolean;
  stockAdjusted?: boolean;
}

export interface CartSyncWarning {
  masanpham: number;
  tensanpham: string;
  type: 'PRICE_CHANGED' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'STOCK_REDUCED';
  message: string;
  oldPrice?: number;
  newPrice?: number;
  availableStock?: number;
}

interface CartStore {
  items: CartItem[];
  // Thao tác giỏ hàng cơ bản
  addToCart: (product: ProductItem, quantity?: number) => { success: boolean; message: string };
  updateQuantity: (masanpham: number, quantity: number) => { success: boolean; message: string };
  removeFromCart: (masanpham: number) => void;
  clearCart: () => void;

  // Tính toán
  getTotalItems: () => number;
  getTotalAmount: () => number;

  // Đối chiếu với dữ liệu sản phẩm mới nhất từ API (nghiệp vụ Checkout)
  syncWithLatestProducts: (latestProducts: ProductItem[]) => CartSyncWarning[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product: ProductItem, quantity = 1) => {
        if (product.trangthai === 'NGUNG_KINH_DOANH') {
          return {
            success: false,
            message: `Sản phẩm "${product.tensanpham}" đã ngừng kinh doanh, không thể thêm vào giỏ hàng.`,
          };
        }

        const tonkho = Number(product.soluongton ?? 0);
        if (tonkho <= 0 || product.trangthai === 'HET_HANG') {
          return {
            success: false,
            message: `Sản phẩm "${product.tensanpham}" hiện đang tạm hết hàng trong kho.`,
          };
        }

        const items = get().items;
        const existingIndex = items.findIndex((i) => i.masanpham === product.masanpham);

        if (existingIndex > -1) {
          const currentQty = items[existingIndex].soluong;
          const targetQty = currentQty + quantity;

          if (targetQty > tonkho) {
            return {
              success: false,
              message: `Kho chỉ còn ${tonkho} máy. Bạn đã có ${currentQty} máy trong giỏ hàng nên không thể thêm vượt quá số lượng tồn kho.`,
            };
          }

          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            soluong: targetQty,
            soluongton: tonkho,
            giaban: product.giaban, // Luôn đồng bộ giá mới
          };

          set({ items: updatedItems });
          return {
            success: true,
            message: `Đã cập nhật số lượng "${product.tensanpham}" thành ${targetQty} trong giỏ hàng.`,
          };
        }

        if (quantity > tonkho) {
          return {
            success: false,
            message: `Kho chỉ còn ${tonkho} máy, không đủ số lượng ${quantity} bạn yêu cầu.`,
          };
        }

        const newItem: CartItem = {
          masanpham: product.masanpham,
          sku: product.sku,
          tensanpham: product.tensanpham,
          dungluong: product.dungluong,
          mausac: product.mausac,
          giaban: product.giaban,
          soluong: quantity,
          soluongton: tonkho,
          hinhanh: product.hinhanh,
          madanhmuc: product.madanhmuc,
          tendanhmuc: product.DANH_MUC?.tendanhmuc,
        };

        set({ items: [...items, newItem] });
        return {
          success: true,
          message: `Đã thêm "${product.tensanpham} (${product.dungluong} - ${product.mausac})" vào giỏ hàng thành công!`,
        };
      },

      updateQuantity: (masanpham: number, quantity: number) => {
        const items = get().items;
        const item = items.find((i) => i.masanpham === masanpham);
        if (!item) {
          return { success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng.' };
        }

        if (quantity <= 0) {
          set({ items: items.filter((i) => i.masanpham !== masanpham) });
          return { success: true, message: `Đã xóa "${item.tensanpham}" khỏi giỏ hàng.` };
        }

        if (quantity > item.soluongton) {
          return {
            success: false,
            message: `Số lượng tối đa có thể mua là ${item.soluongton} máy (tồn kho hiện tại).`,
          };
        }

        set({
          items: items.map((i) =>
            i.masanpham === masanpham ? { ...i, soluong: quantity } : i,
          ),
        });

        return {
          success: true,
          message: `Đã cập nhật số lượng thành ${quantity}.`,
        };
      },

      removeFromCart: (masanpham: number) => {
        set({ items: get().items.filter((i) => i.masanpham !== masanpham) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.soluong, 0);
      },

      getTotalAmount: () => {
        return get().items.reduce((sum, item) => sum + item.giaban * item.soluong, 0);
      },

      syncWithLatestProducts: (latestProducts: ProductItem[]) => {
        const productMap = new Map(latestProducts.map((p) => [p.masanpham, p]));
        const currentItems = get().items;
        const warnings: CartSyncWarning[] = [];
        const updatedItems: CartItem[] = [];

        for (const item of currentItems) {
          const fresh = productMap.get(item.masanpham);

          if (!fresh || fresh.trangthai === 'NGUNG_KINH_DOANH') {
            warnings.push({
              masanpham: item.masanpham,
              tensanpham: item.tensanpham,
              type: 'DISCONTINUED',
              message: `Sản phẩm "${item.tensanpham}" đã ngừng kinh doanh (Soft Delete). Vui lòng loại bỏ khỏi giỏ hàng trước khi đặt.`,
            });
            updatedItems.push({
              ...item,
              discontinued: true,
              soluongton: 0,
            });
            continue;
          }

          const freshStock = Number(fresh.soluongton ?? 0);
          let targetQty = item.soluong;
          let stockAdjusted = false;
          let outOfStock = false;

          if (freshStock <= 0 || fresh.trangthai === 'HET_HANG') {
            outOfStock = true;
            warnings.push({
              masanpham: item.masanpham,
              tensanpham: item.tensanpham,
              type: 'OUT_OF_STOCK',
              message: `Sản phẩm "${item.tensanpham}" hiện đã hết hàng trong kho.`,
            });
          } else if (item.soluong > freshStock) {
            targetQty = freshStock;
            stockAdjusted = true;
            warnings.push({
              masanpham: item.masanpham,
              tensanpham: item.tensanpham,
              type: 'STOCK_REDUCED',
              availableStock: freshStock,
              message: `Tồn kho của "${item.tensanpham}" chỉ còn ${freshStock} máy. Hệ thống đã tự động điều chỉnh số lượng mua từ ${item.soluong} về ${freshStock}.`,
            });
          }

          let priceChanged = false;
          let oldPrice: number | undefined;
          if (fresh.giaban !== item.giaban) {
            priceChanged = true;
            oldPrice = item.giaban;
            warnings.push({
              masanpham: item.masanpham,
              tensanpham: item.tensanpham,
              type: 'PRICE_CHANGED',
              oldPrice: item.giaban,
              newPrice: fresh.giaban,
              message: `Giá sản phẩm "${item.tensanpham}" đã thay đổi từ ${item.giaban.toLocaleString('vi-VN')}₫ thành ${fresh.giaban.toLocaleString('vi-VN')}₫. Hệ thống đã cập nhật theo giá niêm yết mới nhất.`,
            });
          }

          updatedItems.push({
            ...item,
            giaban: fresh.giaban,
            soluong: targetQty,
            soluongton: freshStock,
            priceChanged,
            oldPrice,
            outOfStock,
            discontinued: false,
            stockAdjusted,
          });
        }

        set({ items: updatedItems });
        return warnings;
      },
    }),
    {
      name: 'iphone_cart_v1',
    },
  ),
);
