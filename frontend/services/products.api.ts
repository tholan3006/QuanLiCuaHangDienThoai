import { ApiError, apiRequest } from '../lib/api-client';
import { DEFAULT_CATEGORIES } from './categories.api';

export interface StockHistoryItem {
  matonkho: number;
  masanpham: number;
  soluong: number;
  ngaycapnhat: string;
}

export interface ProductItem {
  masanpham: number;
  sku: string;
  tensanpham: string;
  dungluong: '64GB' | '128GB' | '256GB' | '512GB' | '1TB' | '2TB' | string;
  mausac: string;
  giaban: number;
  mota?: string | null;
  hinhanh?: string | null;
  trangthai: 'DANG_BAN' | 'NGUNG_KINH_DOANH' | 'HET_HANG';
  madanhmuc: number;
  soluongton: number;
  ngaycapnhatkho?: string | null;
  sodonhangdaco?: number;
  cothemua?: boolean;
  DANH_MUC?: {
    madanhmuc: number;
    tendanhmuc: string;
    mota?: string | null;
  };
  TON_KHO?: StockHistoryItem[];
}

export interface ProductSummary {
  tongsophienban: number;
  dangkinhdoanh: number;
  saphethang: number;
  hethang: number;
  ngungkinhdoanh: number;
  tongmaytonkho: number;
}

export interface ProductFilterParams {
  search?: string;
  madanhmuc?: number;
  dungluong?: string;
  mausac?: string;
  minPrice?: number;
  maxPrice?: number;
  trangthai?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc';
  page?: number;
  limit?: number;
}

export interface CreateProductPayload {
  tensanpham: string;
  madanhmuc: number;
  dungluong: string;
  mausac: string;
  giaban: number;
  soluong: number;
  sku?: string;
  mota?: string;
  hinhanh?: string;
  trangthai?: 'DANG_BAN' | 'NGUNG_KINH_DOANH' | 'HET_HANG';
}

export interface UpdateStockPricePayload {
  giaban?: number;
  soluong?: number;
  hinhanh?: string;
}

const STORAGE_PRODUCTS_KEY = 'iphone_store_products_v1';

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    masanpham: 1,
    sku: 'IP16PM-256-DES',
    tensanpham: 'iPhone 16 Pro Max',
    dungluong: '256GB',
    mausac: 'Titan Sa Mạc',
    giaban: 34990000,
    mota: '[SKU: IP16PM-256-DES] Màn hình Super Retina XDR 6.9 inch, Chip A18 Pro, Camera 48MP Fusion, Zoom quang 5x.',
    hinhanh: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80',
    trangthai: 'DANG_BAN',
    madanhmuc: 1,
    soluongton: 25,
    ngaycapnhatkho: '2026-11-10T08:00:00.000Z',
    sodonhangdaco: 1,
    cothemua: true,
    DANH_MUC: DEFAULT_CATEGORIES[0],
    TON_KHO: [{ matonkho: 1, masanpham: 1, soluong: 25, ngaycapnhat: '2026-11-10T08:00:00.000Z' }],
  },
  {
    masanpham: 2,
    sku: 'IP16PM-512-NAT',
    tensanpham: 'iPhone 16 Pro Max',
    dungluong: '512GB',
    mausac: 'Titan Tự Nhiên',
    giaban: 40990000,
    mota: '[SKU: IP16PM-512-NAT] Màn hình Super Retina XDR 6.9 inch, Chip A18 Pro, bộ nhớ 512GB quay ProRes 4K 120fps.',
    hinhanh: 'https://images.unsplash.com/photo-1695048132832-b41495f12eb4?w=500&q=80',
    trangthai: 'DANG_BAN',
    madanhmuc: 1,
    soluongton: 15,
    ngaycapnhatkho: '2026-11-10T08:00:00.000Z',
    sodonhangdaco: 1,
    cothemua: true,
    DANH_MUC: DEFAULT_CATEGORIES[0],
    TON_KHO: [{ matonkho: 2, masanpham: 2, soluong: 15, ngaycapnhat: '2026-11-10T08:00:00.000Z' }],
  },
  {
    masanpham: 3,
    sku: 'IP16PM-1TB-BLK',
    tensanpham: 'iPhone 16 Pro Max',
    dungluong: '1TB',
    mausac: 'Titan Đen',
    giaban: 46990000,
    mota: '[SKU: IP16PM-1TB-BLK] Phiên bản cao cấp nhất 1TB, khung Titan cấp 5 siêu bền nhẹ.',
    hinhanh: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500&q=80',
    trangthai: 'DANG_BAN',
    madanhmuc: 1,
    soluongton: 4,
    ngaycapnhatkho: '2026-11-10T08:00:00.000Z',
    sodonhangdaco: 0,
    cothemua: true,
    DANH_MUC: DEFAULT_CATEGORIES[0],
    TON_KHO: [{ matonkho: 3, masanpham: 3, soluong: 4, ngaycapnhat: '2026-11-10T08:00:00.000Z' }],
  },
  {
    masanpham: 4,
    sku: 'IP16P-128-WHT',
    tensanpham: 'iPhone 16 Pro',
    dungluong: '128GB',
    mausac: 'Titan Trắng',
    giaban: 28990000,
    mota: '[SKU: IP16P-128-WHT] Màn hình 6.3 inch ProMotion 120Hz, Chip A18 Pro, nút điều khiển Camera Control.',
    hinhanh: 'https://images.unsplash.com/photo-1695048133021-be2def43f3b2?w=500&q=80',
    trangthai: 'DANG_BAN',
    madanhmuc: 1,
    soluongton: 20,
    ngaycapnhatkho: '2026-11-10T08:00:00.000Z',
    sodonhangdaco: 0,
    cothemua: true,
    DANH_MUC: DEFAULT_CATEGORIES[0],
    TON_KHO: [{ matonkho: 4, masanpham: 4, soluong: 20, ngaycapnhat: '2026-11-10T08:00:00.000Z' }],
  },
  {
    masanpham: 5,
    sku: 'IP16PL-256-ULT',
    tensanpham: 'iPhone 16 Plus',
    dungluong: '256GB',
    mausac: 'Xanh Lưu Ly',
    giaban: 25990000,
    mota: '[SKU: IP16PL-256-ULT] Màn hình lớn 6.7 inch, pin siêu trâu, Chip A18 hỗ trợ Apple Intelligence.',
    hinhanh: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=500&q=80',
    trangthai: 'DANG_BAN',
    madanhmuc: 1,
    soluongton: 18,
    ngaycapnhatkho: '2026-11-10T08:00:00.000Z',
    sodonhangdaco: 0,
    cothemua: true,
    DANH_MUC: DEFAULT_CATEGORIES[0],
    TON_KHO: [{ matonkho: 5, masanpham: 5, soluong: 18, ngaycapnhat: '2026-11-10T08:00:00.000Z' }],
  },
  {
    masanpham: 6,
    sku: 'IP16-128-PNK',
    tensanpham: 'iPhone 16',
    dungluong: '128GB',
    mausac: 'Hồng',
    giaban: 22990000,
    mota: '[SKU: IP16-128-PNK] Thiết kế camera dọc mới, nút Action Button và Camera Control hiện đại.',
    hinhanh: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&q=80',
    trangthai: 'DANG_BAN',
    madanhmuc: 1,
    soluongton: 30,
    ngaycapnhatkho: '2026-11-10T08:00:00.000Z',
    sodonhangdaco: 1,
    cothemua: true,
    DANH_MUC: DEFAULT_CATEGORIES[0],
    TON_KHO: [{ matonkho: 6, masanpham: 6, soluong: 30, ngaycapnhat: '2026-11-10T08:00:00.000Z' }],
  },
  {
    masanpham: 7,
    sku: 'IP15PM-256-NAT',
    tensanpham: 'iPhone 15 Pro Max',
    dungluong: '256GB',
    mausac: 'Titan Tự Nhiên',
    giaban: 29490000,
    mota: '[SKU: IP15PM-256-NAT] Khung viền Titan, chip A17 Pro 3nm, camera tiềm vọng 5x, cổng USB-C 3.',
    hinhanh: 'https://images.unsplash.com/photo-1695048132832-b41495f12eb4?w=500&q=80',
    trangthai: 'DANG_BAN',
    madanhmuc: 2,
    soluongton: 12,
    ngaycapnhatkho: '2026-11-10T08:00:00.000Z',
    sodonhangdaco: 1,
    cothemua: true,
    DANH_MUC: DEFAULT_CATEGORIES[1],
    TON_KHO: [{ matonkho: 7, masanpham: 7, soluong: 12, ngaycapnhat: '2026-11-10T08:00:00.000Z' }],
  },
  {
    masanpham: 8,
    sku: 'IP15PM-512-BLU',
    tensanpham: 'iPhone 15 Pro Max',
    dungluong: '512GB',
    mausac: 'Titan Xanh',
    giaban: 34990000,
    mota: '[SKU: IP15PM-512-BLU] Phiên bản 512GB màu Titan Xanh sang trọng, hiệu năng đỉnh cao.',
    hinhanh: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500&q=80',
    trangthai: 'DANG_BAN',
    madanhmuc: 2,
    soluongton: 3,
    ngaycapnhatkho: '2026-11-10T08:00:00.000Z',
    sodonhangdaco: 0,
    cothemua: true,
    DANH_MUC: DEFAULT_CATEGORIES[1],
    TON_KHO: [{ matonkho: 8, masanpham: 8, soluong: 3, ngaycapnhat: '2026-11-10T08:00:00.000Z' }],
  },
  {
    masanpham: 9,
    sku: 'IP15-128-PNK',
    tensanpham: 'iPhone 15',
    dungluong: '128GB',
    mausac: 'Hồng',
    giaban: 19490000,
    mota: '[SKU: IP15-128-PNK] Camera chính 48MP sắc nét, Dynamic Island, cổng sạc USB-C tiện lợi.',
    hinhanh: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&q=80',
    trangthai: 'DANG_BAN',
    madanhmuc: 2,
    soluongton: 22,
    ngaycapnhatkho: '2026-11-10T08:00:00.000Z',
    sodonhangdaco: 0,
    cothemua: true,
    DANH_MUC: DEFAULT_CATEGORIES[1],
    TON_KHO: [{ matonkho: 9, masanpham: 9, soluong: 22, ngaycapnhat: '2026-11-10T08:00:00.000Z' }],
  },
  {
    masanpham: 10,
    sku: 'IP14-128-PUR',
    tensanpham: 'iPhone 14',
    dungluong: '128GB',
    mausac: 'Tím',
    giaban: 15990000,
    mota: '[SKU: IP14-128-PUR] Thiết kế nhỏ gọn 6.1 inch, camera chụp đêm ấn tượng.',
    hinhanh: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=500&q=80',
    trangthai: 'DANG_BAN',
    madanhmuc: 3,
    soluongton: 16,
    ngaycapnhatkho: '2026-11-10T08:00:00.000Z',
    sodonhangdaco: 0,
    cothemua: true,
    DANH_MUC: DEFAULT_CATEGORIES[2],
    TON_KHO: [{ matonkho: 10, masanpham: 10, soluong: 16, ngaycapnhat: '2026-11-10T08:00:00.000Z' }],
  },
  {
    masanpham: 11,
    sku: 'IP13-128-STA',
    tensanpham: 'iPhone 13',
    dungluong: '128GB',
    mausac: 'Trắng Starlight',
    giaban: 13490000,
    mota: '[SKU: IP13-128-STA] Mẫu iPhone bán chạy nhất phân khúc tầm trung, hiệu năng mượt mà.',
    hinhanh: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500&q=80',
    trangthai: 'DANG_BAN',
    madanhmuc: 4,
    soluongton: 25,
    ngaycapnhatkho: '2026-11-10T08:00:00.000Z',
    sodonhangdaco: 0,
    cothemua: true,
    DANH_MUC: DEFAULT_CATEGORIES[3],
    TON_KHO: [{ matonkho: 11, masanpham: 11, soluong: 25, ngaycapnhat: '2026-11-10T08:00:00.000Z' }],
  },
  {
    masanpham: 12,
    sku: 'IP13PM-128-ALP',
    tensanpham: 'iPhone 13 Pro Max',
    dungluong: '128GB',
    mausac: 'Xanh Alpine',
    giaban: 21990000,
    mota: '[SKU: IP13PM-128-ALP] Sản phẩm đã ngừng kinh doanh (Soft Delete) - ẩn khỏi trang khách hàng nhưng bảo toàn lịch sử đơn hàng.',
    hinhanh: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500&q=80',
    trangthai: 'NGUNG_KINH_DOANH',
    madanhmuc: 4,
    soluongton: 0,
    ngaycapnhatkho: '2026-10-15T09:30:00.000Z',
    sodonhangdaco: 1,
    cothemua: false,
    DANH_MUC: DEFAULT_CATEGORIES[3],
    TON_KHO: [{ matonkho: 12, masanpham: 12, soluong: 0, ngaycapnhat: '2026-10-15T09:30:00.000Z' }],
  },
];

function getLocalProducts(): ProductItem[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  const raw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveLocalProducts(products: ProductItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  }
}

function applyLocalFilters(
  products: ProductItem[],
  filter: ProductFilterParams,
  forCustomerStore: boolean,
): ProductItem[] {
  let result = [...products];

  // Trang khách hàng: Tuyệt đối ẩn sản phẩm NGUNG_KINH_DOANH
  if (forCustomerStore) {
    result = result.filter((p) => p.trangthai !== 'NGUNG_KINH_DOANH');
  } else if (filter.trangthai) {
    result = result.filter((p) => p.trangthai === filter.trangthai);
  }

  if (filter.madanhmuc !== undefined) {
    result = result.filter((p) => p.madanhmuc === Number(filter.madanhmuc));
  }

  if (filter.dungluong) {
    result = result.filter(
      (p) => p.dungluong.toLowerCase() === filter.dungluong!.trim().toLowerCase(),
    );
  }

  if (filter.mausac) {
    const colorKw = filter.mausac.trim().toLowerCase();
    result = result.filter((p) => p.mausac.toLowerCase().includes(colorKw));
  }

  if (filter.minPrice !== undefined) {
    result = result.filter((p) => p.giaban >= Number(filter.minPrice));
  }

  if (filter.maxPrice !== undefined) {
    result = result.filter((p) => p.giaban <= Number(filter.maxPrice));
  }

  if (filter.search?.trim()) {
    const kw = filter.search.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.tensanpham.toLowerCase().includes(kw) ||
        p.sku.toLowerCase().includes(kw) ||
        p.mausac.toLowerCase().includes(kw) ||
        p.dungluong.toLowerCase().includes(kw) ||
        (p.DANH_MUC?.tendanhmuc || '').toLowerCase().includes(kw),
    );
  }

  switch (filter.sortBy) {
    case 'price_asc':
      result.sort((a, b) => a.giaban - b.giaban);
      break;
    case 'price_desc':
      result.sort((a, b) => b.giaban - a.giaban);
      break;
    case 'name_asc':
      result.sort((a, b) => a.tensanpham.localeCompare(b.tensanpham));
      break;
    case 'newest':
    default:
      result.sort((a, b) => b.masanpham - a.masanpham);
      break;
  }

  return result;
}

function buildQueryString(params: ProductFilterParams): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      sp.set(key, String(val));
    }
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export const productsApi = {
  /**
   * Lấy danh sách sản phẩm cho Nhân viên (bao gồm cả sản phẩm đã ẩn & thống kê tồn kho)
   */
  async getForStaff(filter: ProductFilterParams = {}): Promise<{
    data: ProductItem[];
    summary: ProductSummary;
  }> {
    try {
      return await apiRequest(`/products/staff${buildQueryString(filter)}`);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const all = getLocalProducts();
      const filtered = applyLocalFilters(all, filter, false);

      const summary: ProductSummary = {
        tongsophienban: all.length,
        dangkinhdoanh: all.filter((p) => p.trangthai === 'DANG_BAN').length,
        saphethang: all.filter(
          (p) => p.trangthai !== 'NGUNG_KINH_DOANH' && p.soluongton > 0 && p.soluongton <= 5,
        ).length,
        hethang: all.filter(
          (p) =>
            p.trangthai === 'HET_HANG' ||
            (p.trangthai === 'DANG_BAN' && p.soluongton === 0),
        ).length,
        ngungkinhdoanh: all.filter((p) => p.trangthai === 'NGUNG_KINH_DOANH').length,
        tongmaytonkho: all
          .filter((p) => p.trangthai !== 'NGUNG_KINH_DOANH')
          .reduce((acc, p) => acc + p.soluongton, 0),
      };

      return { data: filtered, summary };
    }
  },

  /**
   * Lấy danh sách sản phẩm cho Trang Khách hàng (Tự động ẩn sản phẩm NGUNG_KINH_DOANH)
   */
  async getForStore(filter: ProductFilterParams = {}): Promise<{
    data: ProductItem[];
  }> {
    try {
      return await apiRequest(`/products${buildQueryString(filter)}`);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const all = getLocalProducts();
      const filtered = applyLocalFilters(all, filter, true);
      return { data: filtered };
    }
  },

  /**
   * Thêm mới phiên bản sản phẩm iPhone (SAN_PHAM + TON_KHO)
   */
  async create(payload: CreateProductPayload): Promise<ProductItem> {
    try {
      return await apiRequest<ProductItem>('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const all = getLocalProducts();
      const tensanpham = payload.tensanpham.trim();
      const dungluong = payload.dungluong.trim().toUpperCase();
      const mausac = payload.mausac.trim();
      const giaban = Number(payload.giaban);
      const soluong = Number(payload.soluong ?? 0);

      if (!tensanpham || !mausac) {
        throw new Error('Tên sản phẩm và màu sắc không được để trống');
      }
      if (giaban <= 0) {
        throw new Error('Giá bán (giaban) phải lớn hơn 0 (Ràng buộc CHECK)');
      }
      if (soluong < 0) {
        throw new Error('Số lượng tồn kho (soluong) không được nhỏ hơn 0 (Ràng buộc CHECK)');
      }

      const dup = all.find(
        (p) =>
          p.tensanpham.toLowerCase() === tensanpham.toLowerCase() &&
          p.dungluong.toLowerCase() === dungluong.toLowerCase() &&
          p.mausac.toLowerCase() === mausac.toLowerCase(),
      );
      if (dup) {
        throw new Error(
          `Phiên bản "${tensanpham} - ${dungluong} - ${mausac}" đã tồn tại ở sản phẩm #${dup.masanpham} (Ràng buộc UNIQUE)`,
        );
      }

      const nextId = all.reduce((m, p) => Math.max(m, p.masanpham), 0) + 1;
      const autoSku =
        payload.sku?.trim().toUpperCase() ||
        `IP-${dungluong}-${ nextId }`;

      const trangthai =
        payload.trangthai === 'NGUNG_KINH_DOANH'
          ? 'NGUNG_KINH_DOANH'
          : soluong === 0
            ? 'HET_HANG'
            : 'DANG_BAN';

      const nowIso = new Date().toISOString();
      const cat =
        DEFAULT_CATEGORIES.find((c) => c.madanhmuc === Number(payload.madanhmuc)) ||
        { madanhmuc: Number(payload.madanhmuc), tendanhmuc: `Danh mục #${payload.madanhmuc}` };

      const created: ProductItem = {
        masanpham: nextId,
        sku: autoSku,
        tensanpham,
        dungluong,
        mausac,
        giaban,
        mota: `[SKU: ${autoSku}] ${payload.mota?.trim() || ''}`.trim(),
        hinhanh: payload.hinhanh?.trim() || null,
        trangthai,
        madanhmuc: Number(payload.madanhmuc),
        soluongton: soluong,
        ngaycapnhatkho: nowIso,
        sodonhangdaco: 0,
        cothemua: trangthai === 'DANG_BAN' && soluong > 0,
        DANH_MUC: cat,
        TON_KHO: [
          {
            matonkho: Date.now(),
            masanpham: nextId,
            soluong,
            ngaycapnhat: nowIso,
          },
        ],
      };

      saveLocalProducts([created, ...all]);
      return created;
    }
  },

  /**
   * Chỉnh sửa thông tin phiên bản sản phẩm iPhone
   */
  async update(
    masanpham: number,
    payload: Partial<CreateProductPayload>,
  ): Promise<ProductItem> {
    try {
      return await apiRequest<ProductItem>(`/products/${masanpham}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const all = getLocalProducts();
      const idx = all.findIndex((p) => p.masanpham === masanpham);
      if (idx === -1) throw new Error(`Không tìm thấy sản phẩm #${masanpham}`);

      const cur = all[idx];
      const nextName = payload.tensanpham?.trim() ?? cur.tensanpham;
      const nextStorage = payload.dungluong?.trim().toUpperCase() ?? cur.dungluong;
      const nextColor = payload.mausac?.trim() ?? cur.mausac;
      const nextPrice =
        payload.giaban !== undefined ? Number(payload.giaban) : cur.giaban;
      const nextStock =
        payload.soluong !== undefined ? Number(payload.soluong) : cur.soluongton;

      if (nextPrice <= 0) {
        throw new Error('Giá bán (giaban) phải lớn hơn 0 (Ràng buộc CHECK)');
      }
      if (nextStock < 0) {
        throw new Error('Số lượng tồn kho (soluong) không được âm (Ràng buộc CHECK)');
      }

      const dup = all.find(
        (p) =>
          p.masanpham !== masanpham &&
          p.tensanpham.toLowerCase() === nextName.toLowerCase() &&
          p.dungluong.toLowerCase() === nextStorage.toLowerCase() &&
          p.mausac.toLowerCase() === nextColor.toLowerCase(),
      );
      if (dup) {
        throw new Error(
          `Phiên bản "${nextName} - ${nextStorage} - ${nextColor}" đã tồn tại ở sản phẩm #${dup.masanpham} (Ràng buộc UNIQUE)`,
        );
      }

      let nextStatus = payload.trangthai ?? cur.trangthai;
      if (nextStatus !== 'NGUNG_KINH_DOANH') {
        nextStatus = nextStock === 0 ? 'HET_HANG' : 'DANG_BAN';
      }

      const nowIso = new Date().toISOString();
      const nextTonKho = [...(cur.TON_KHO || [])];
      if (payload.soluong !== undefined && nextStock !== cur.soluongton) {
        nextTonKho.unshift({
          matonkho: Date.now(),
          masanpham,
          soluong: nextStock,
          ngaycapnhat: nowIso,
        });
      }

      const nextSku = payload.sku?.trim().toUpperCase() || cur.sku;
      const cat =
        DEFAULT_CATEGORIES.find(
          (c) => c.madanhmuc === Number(payload.madanhmuc ?? cur.madanhmuc),
        ) || cur.DANH_MUC;

      const updated: ProductItem = {
        ...cur,
        sku: nextSku,
        tensanpham: nextName,
        dungluong: nextStorage,
        mausac: nextColor,
        giaban: nextPrice,
        soluongton: nextStock,
        trangthai: nextStatus,
        madanhmuc: Number(payload.madanhmuc ?? cur.madanhmuc),
        mota: payload.mota !== undefined ? payload.mota : cur.mota,
        hinhanh: payload.hinhanh !== undefined ? payload.hinhanh : cur.hinhanh,
        ngaycapnhatkho:
          payload.soluong !== undefined ? nowIso : cur.ngaycapnhatkho,
        cothemua: nextStatus === 'DANG_BAN' && nextStock > 0,
        DANH_MUC: cat,
        TON_KHO: nextTonKho,
      };

      all[idx] = updated;
      saveLocalProducts(all);
      return updated;
    }
  },

  /**
   * Cập nhật nhanh Giá bán, Số lượng tồn kho (TON_KHO) và Hình ảnh
   */
  async updateStockPrice(
    masanpham: number,
    payload: UpdateStockPricePayload,
  ): Promise<ProductItem> {
    try {
      return await apiRequest<ProductItem>(`/products/${masanpham}/stock-price`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      return this.update(masanpham, payload);
    }
  },

  /**
   * Ẩn sản phẩm / Ngừng kinh doanh (Soft Delete - trangthai = 'NGUNG_KINH_DOANH')
   */
  async hideProduct(
    masanpham: number,
  ): Promise<{ message: string; data: ProductItem }> {
    try {
      return await apiRequest<{ message: string; data: ProductItem }>(
        `/products/${masanpham}/hide`,
        { method: 'PATCH' },
      );
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const all = getLocalProducts();
      const idx = all.findIndex((p) => p.masanpham === masanpham);
      if (idx === -1) throw new Error(`Không tìm thấy sản phẩm #${masanpham}`);
      const cur = all[idx];
      const updated: ProductItem = {
        ...cur,
        trangthai: 'NGUNG_KINH_DOANH',
        cothemua: false,
      };
      all[idx] = updated;
      saveLocalProducts(all);

      return {
        message:
          (cur.sodonhangdaco ?? 0) > 0
            ? `Sản phẩm "${cur.tensanpham} (${cur.dungluong} - ${cur.mausac})" đã có ${cur.sodonhangdaco} đơn hàng trong CHI_TIET_DON_HANG. Hệ thống đã chuyển sang NGUNG_KINH_DOANH (Soft Delete) để ẩn khỏi trang khách hàng và bảo toàn dữ liệu.`
            : `Đã ẩn sản phẩm "${cur.tensanpham} (${cur.dungluong} - ${cur.mausac})" khỏi trang khách hàng thành công.`,
        data: updated,
      };
    }
  },

  /**
   * Khôi phục kinh doanh sản phẩm đã ẩn
   */
  async restoreProduct(
    masanpham: number,
  ): Promise<{ message: string; data: ProductItem }> {
    try {
      return await apiRequest<{ message: string; data: ProductItem }>(
        `/products/${masanpham}/restore`,
        { method: 'PATCH' },
      );
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const all = getLocalProducts();
      const idx = all.findIndex((p) => p.masanpham === masanpham);
      if (idx === -1) throw new Error(`Không tìm thấy sản phẩm #${masanpham}`);
      const cur = all[idx];
      const nextStatus = cur.soluongton > 0 ? 'DANG_BAN' : 'HET_HANG';
      const updated: ProductItem = {
        ...cur,
        trangthai: nextStatus,
        cothemua: nextStatus === 'DANG_BAN' && cur.soluongton > 0,
      };
      all[idx] = updated;
      saveLocalProducts(all);
      return {
        message: `Đã khôi phục kinh doanh sản phẩm "${cur.tensanpham}" (${nextStatus}).`,
        data: updated,
      };
    }
  },

  /**
   * Kiểm tra sản phẩm có thể được khách hàng đặt mua hay không
   */
  async checkPurchasable(masanpham: number, quantity = 1) {
    try {
      return await apiRequest(
        `/products/${masanpham}/check-purchasable?quantity=${quantity}`,
        { method: 'POST' },
      );
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const all = getLocalProducts();
      const product = all.find((p) => p.masanpham === masanpham);
      if (!product) throw new Error(`Sản phẩm #${masanpham} không tồn tại`);
      if (product.trangthai === 'NGUNG_KINH_DOANH') {
        throw new Error(
          `Sản phẩm "${product.tensanpham} (${product.dungluong} - ${product.mausac})" đã ngừng kinh doanh (Soft Delete) và không thể đặt mua!`,
        );
      }
      if (product.trangthai === 'HET_HANG' || product.soluongton < quantity) {
        throw new Error(
          `Sản phẩm "${product.tensanpham}" hiện chỉ còn ${product.soluongton} máy trong kho, không đủ số lượng yêu cầu (${quantity}).`,
        );
      }
      return {
        purchasable: true,
        masanpham: product.masanpham,
        tensanpham: product.tensanpham,
        dongia: product.giaban,
        soluongmua: quantity,
        thanhtien: product.giaban * quantity,
      };
    }
  },
};
