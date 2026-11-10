import { ApiError, apiRequest } from '../lib/api-client';

export interface CategoryItem {
  madanhmuc: number;
  tendanhmuc: string;
  mota?: string | null;
  soluongsanpham?: number;
}

export interface CreateCategoryPayload {
  tendanhmuc: string;
  mota?: string;
}

const STORAGE_CATEGORIES_KEY = 'iphone_store_categories_v1';
const STORAGE_PRODUCTS_KEY = 'iphone_store_products_v1';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    madanhmuc: 1,
    tendanhmuc: 'iPhone 16 Series',
    mota: 'Thế hệ iPhone 16 Series mới nhất với chip A18 / A18 Pro, nút Camera Control và Apple Intelligence.',
    soluongsanpham: 6,
  },
  {
    madanhmuc: 2,
    tendanhmuc: 'iPhone 15 Series',
    mota: 'Dòng iPhone 15 Series với cổng USB-C, Dynamic Island và khung viền Titan trên dòng Pro.',
    soluongsanpham: 3,
  },
  {
    madanhmuc: 3,
    tendanhmuc: 'iPhone 14 Series',
    mota: 'Dòng iPhone 14 Series hiệu năng ổn định, camera sắc nét và thời lượng pin ấn tượng.',
    soluongsanpham: 1,
  },
  {
    madanhmuc: 4,
    tendanhmuc: 'iPhone 13 Series',
    mota: 'Dòng iPhone 13 Series quốc dân với mức giá dễ tiếp cận, chip A15 Bionic bền bỉ.',
    soluongsanpham: 2,
  },
  {
    madanhmuc: 5,
    tendanhmuc: 'iPhone SE Series',
    mota: 'Dòng iPhone nhỏ gọn, cấu hình mạnh mẽ trong tầm giá tiết kiệm.',
    soluongsanpham: 0,
  },
];

function getLocalCategories(): CategoryItem[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  const raw = localStorage.getItem(STORAGE_CATEGORIES_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function saveLocalCategories(categories: CategoryItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
  }
}

export const categoriesApi = {
  async getAll(includeDiscontinued = true): Promise<CategoryItem[]> {
    try {
      return await apiRequest<CategoryItem[]>(
        `/categories?includeInactive=${includeDiscontinued}`,
      );
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const cats = getLocalCategories();
      const rawProducts =
        typeof window !== 'undefined' ? localStorage.getItem(STORAGE_PRODUCTS_KEY) : null;
      const products = rawProducts ? JSON.parse(rawProducts) : [];
      return cats.map((c) => ({
        ...c,
        soluongsanpham:
          products.length > 0
            ? products.filter(
                (p: any) =>
                  p.madanhmuc === c.madanhmuc &&
                  (includeDiscontinued || p.trangthai !== 'NGUNG_KINH_DOANH'),
              ).length
            : c.soluongsanpham ?? 0,
      }));
    }
  },

  async create(payload: CreateCategoryPayload): Promise<CategoryItem> {
    try {
      return await apiRequest<CategoryItem>('/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const cats = getLocalCategories();
      const cleanName = payload.tendanhmuc.trim();
      if (!cleanName) throw new Error('Tên danh mục không được để trống');
      if (cats.some((c) => c.tendanhmuc.toLowerCase() === cleanName.toLowerCase())) {
        throw new Error(`Danh mục "${cleanName}" đã tồn tại trong hệ thống`);
      }
      const nextId = cats.reduce((max, c) => Math.max(max, c.madanhmuc), 0) + 1;
      const created: CategoryItem = {
        madanhmuc: nextId,
        tendanhmuc: cleanName,
        mota: payload.mota?.trim() || null,
        soluongsanpham: 0,
      };
      saveLocalCategories([...cats, created]);
      return created;
    }
  },

  async update(
    madanhmuc: number,
    payload: Partial<CreateCategoryPayload>,
  ): Promise<CategoryItem> {
    try {
      return await apiRequest<CategoryItem>(`/categories/${madanhmuc}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const cats = getLocalCategories();
      const idx = cats.findIndex((c) => c.madanhmuc === madanhmuc);
      if (idx === -1) throw new Error(`Không tìm thấy danh mục #${madanhmuc}`);
      const nextName = payload.tendanhmuc?.trim() ?? cats[idx].tendanhmuc;
      if (
        cats.some(
          (c) =>
            c.madanhmuc !== madanhmuc &&
            c.tendanhmuc.toLowerCase() === nextName.toLowerCase(),
        )
      ) {
        throw new Error(`Tên danh mục "${nextName}" đã tồn tại`);
      }
      const updated = {
        ...cats[idx],
        tendanhmuc: nextName,
        mota: payload.mota !== undefined ? payload.mota?.trim() || null : cats[idx].mota,
      };
      cats[idx] = updated;
      saveLocalCategories(cats);
      return updated;
    }
  },

  async remove(madanhmuc: number): Promise<{ message: string; madanhmuc: number }> {
    try {
      return await apiRequest<{ message: string; madanhmuc: number }>(
        `/categories/${madanhmuc}`,
        { method: 'DELETE' },
      );
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const cats = getLocalCategories();
      const cat = cats.find((c) => c.madanhmuc === madanhmuc);
      if (!cat) throw new Error(`Không tìm thấy danh mục #${madanhmuc}`);

      const rawProducts =
        typeof window !== 'undefined' ? localStorage.getItem(STORAGE_PRODUCTS_KEY) : null;
      const products = rawProducts ? JSON.parse(rawProducts) : [];
      const count = products.filter((p: any) => p.madanhmuc === madanhmuc).length;

      if (count > 0) {
        throw new Error(
          `Không thể xóa danh mục "${cat.tendanhmuc}" vì đang chứa ${count} sản phẩm trong bảng SAN_PHAM (Quy tắc bảo toàn dữ liệu ON DELETE RESTRICT).`,
        );
      }

      saveLocalCategories(cats.filter((c) => c.madanhmuc !== madanhmuc));
      return {
        message: `Đã xóa danh mục "${cat.tendanhmuc}" thành công`,
        madanhmuc,
      };
    }
  },
};
