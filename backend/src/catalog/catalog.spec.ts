import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from './categories/categories.service';
import { ProductsService } from './products/products.service';

/**
 * Bộ Kiểm thử Tự động (Unit & Integration Tests) cho Thành viên 2:
 * - Kiểm tra quản lý Danh mục (DANH_MUC) & Quy tắc bảo toàn dữ liệu (ON DELETE RESTRICT)
 * - Kiểm tra thêm, sửa, cập nhật Giá & Tồn kho (SAN_PHAM & TON_KHO)
 * - Kiểm tra tìm kiếm, lọc sản phẩm theo tên, dòng iPhone, khoảng giá và các ràng buộc dữ liệu
 * - Kiểm tra sản phẩm đã ẩn (Soft Delete - NGUNG_KINH_DOANH) không hiển thị ra ngoài và không thể đặt mua
 */
describe('TV2 - Kiểm thử Quản lý Danh mục (DANH_MUC), Sản phẩm (SAN_PHAM) & Tồn kho (TON_KHO)', () => {
  let categoriesService: CategoriesService;
  let productsService: ProductsService;
  let mockCategories: any[];
  let mockProducts: any[];
  let mockTonKho: any[];

  beforeEach(() => {
    mockCategories = [
      { madanhmuc: 1, tendanhmuc: 'iPhone 16 Series', mota: 'Thế hệ iPhone 16' },
      { madanhmuc: 2, tendanhmuc: 'iPhone 15 Series', mota: 'Thế hệ iPhone 15' },
      { madanhmuc: 3, tendanhmuc: 'iPhone SE Series', mota: 'Danh mục trống chưa có SP' },
    ];

    mockTonKho = [
      { matonkho: 1, masanpham: 1, soluong: 25, ngaycapnhat: new Date() },
      { matonkho: 2, masanpham: 2, soluong: 12, ngaycapnhat: new Date() },
      { matonkho: 3, masanpham: 3, soluong: 0, ngaycapnhat: new Date() },
    ];

    mockProducts = [
      {
        masanpham: 1,
        tensanpham: 'iPhone 16 Pro Max',
        dungluong: '256GB',
        mausac: 'Titan Sa Mạc',
        giaban: 34990000,
        mota: '[SKU: IP16PM-256-DES] Flagship 2026',
        hinhanh: '/images/ip16pm.png',
        trangthai: 'DANG_BAN',
        madanhmuc: 1,
        sodonhang: 2,
      },
      {
        masanpham: 2,
        tensanpham: 'iPhone 15',
        dungluong: '128GB',
        mausac: 'Hồng',
        giaban: 19490000,
        mota: '[SKU: IP15-128-PNK] Nhỏ gọn',
        hinhanh: '/images/ip15.png',
        trangthai: 'DANG_BAN',
        madanhmuc: 2,
        sodonhang: 0,
      },
      {
        masanpham: 3,
        tensanpham: 'iPhone 13 Pro Max',
        dungluong: '128GB',
        mausac: 'Xanh Alpine',
        giaban: 21990000,
        mota: '[SKU: IP13PM-128-ALP] Đã ngừng kinh doanh',
        hinhanh: '/images/ip13pm.png',
        trangthai: 'NGUNG_KINH_DOANH',
        madanhmuc: 2,
        sodonhang: 1,
      },
    ];

    const attachRelations = (p: any) => ({
      ...p,
      DANH_MUC: mockCategories.find((c) => c.madanhmuc === p.madanhmuc),
      TON_KHO: mockTonKho
        .filter((tk) => tk.masanpham === p.masanpham)
        .sort((a, b) => b.matonkho - a.matonkho),
      _count: { CHI_TIET_DON_HANG: p.sodonhang || 0, CHI_TIET_GIO_HANG: 0 },
    });

    const mockPrisma: any = {
      $transaction: async (cb: any) => cb(mockPrisma),
      dANH_MUC: {
        findMany: jest.fn(async () =>
          mockCategories.map((c) => ({
            ...c,
            _count: {
              SAN_PHAM: mockProducts.filter((p) => p.madanhmuc === c.madanhmuc).length,
            },
          })),
        ),
        findUnique: jest.fn(async ({ where }: any) => {
          const found = mockCategories.find((c) => c.madanhmuc === where.madanhmuc);
          if (!found) return null;
          return {
            ...found,
            SAN_PHAM: mockProducts.filter((p) => p.madanhmuc === found.madanhmuc),
            _count: {
              SAN_PHAM: mockProducts.filter((p) => p.madanhmuc === found.madanhmuc).length,
            },
          };
        }),
        findFirst: jest.fn(async ({ where }: any) => {
          return (
            mockCategories.find((c) => {
              if (where.madanhmuc?.not && c.madanhmuc === where.madanhmuc.not) {
                return false;
              }
              return (
                c.tendanhmuc.toLowerCase() ===
                where.tendanhmuc?.equals?.toLowerCase()
              );
            }) || null
          );
        }),
        create: jest.fn(async ({ data }: any) => {
          const created = {
            madanhmuc: mockCategories.length + 1,
            ...data,
          };
          mockCategories.push(created);
          return created;
        }),
        delete: jest.fn(async ({ where }: any) => {
          mockCategories = mockCategories.filter(
            (c) => c.madanhmuc !== where.madanhmuc,
          );
          return { madanhmuc: where.madanhmuc };
        }),
      },
      tON_KHO: {
        create: jest.fn(async ({ data }: any) => {
          const rec = {
            matonkho: mockTonKho.length + 1,
            masanpham: data.masanpham,
            soluong: data.soluong,
            ngaycapnhat: new Date(),
          };
          mockTonKho.push(rec);
          return rec;
        }),
      },
      sAN_PHAM: {
        findMany: jest.fn(async ({ where }: any = {}) => {
          return mockProducts
            .filter((p) => {
              if (where?.trangthai?.not && p.trangthai === where.trangthai.not) {
                return false;
              }
              if (typeof where?.trangthai === 'string' && p.trangthai !== where.trangthai) {
                return false;
              }
              if (where?.madanhmuc !== undefined && p.madanhmuc !== where.madanhmuc) {
                return false;
              }
              if (where?.giaban?.gte !== undefined && p.giaban < where.giaban.gte) {
                return false;
              }
              if (where?.giaban?.lte !== undefined && p.giaban > where.giaban.lte) {
                return false;
              }
              if (where?.OR) {
                const kw = where.OR[0]?.tensanpham?.contains?.toLowerCase() || '';
                return (
                  p.tensanpham.toLowerCase().includes(kw) ||
                  p.mausac.toLowerCase().includes(kw) ||
                  (p.mota || '').toLowerCase().includes(kw)
                );
              }
              return true;
            })
            .map(attachRelations);
        }),
        count: jest.fn(async () => mockProducts.length),
        findUnique: jest.fn(async ({ where }: any) => {
          const p = mockProducts.find((item) => item.masanpham === where.masanpham);
          return p ? attachRelations(p) : null;
        }),
        findFirst: jest.fn(async ({ where }: any) => {
          return (
            mockProducts.find((p) => {
              if (where.masanpham?.not && p.masanpham === where.masanpham.not) {
                return false;
              }
              return (
                p.tensanpham.toLowerCase() ===
                  where.tensanpham?.equals?.toLowerCase() &&
                p.dungluong.toLowerCase() ===
                  where.dungluong?.equals?.toLowerCase() &&
                p.mausac.toLowerCase() === where.mausac?.equals?.toLowerCase()
              );
            }) || null
          );
        }),
        create: jest.fn(async ({ data }: any) => {
          const newId = mockProducts.length + 1;
          const created = {
            masanpham: newId,
            tensanpham: data.tensanpham,
            dungluong: data.dungluong,
            mausac: data.mausac,
            giaban: data.giaban,
            mota: data.mota,
            hinhanh: data.hinhanh,
            trangthai: data.trangthai,
            madanhmuc: data.madanhmuc,
            sodonhang: 0,
          };
          mockProducts.push(created);
          if (data.TON_KHO?.create) {
            mockTonKho.push({
              matonkho: mockTonKho.length + 1,
              masanpham: newId,
              soluong: data.TON_KHO.create.soluong,
              ngaycapnhat: new Date(),
            });
          }
          return attachRelations(created);
        }),
        update: jest.fn(async ({ where, data }: any) => {
          const idx = mockProducts.findIndex((p) => p.masanpham === where.masanpham);
          mockProducts[idx] = { ...mockProducts[idx], ...data };
          return attachRelations(mockProducts[idx]);
        }),
      },
    };

    categoriesService = new CategoriesService(mockPrisma);
    productsService = new ProductsService(mockPrisma);
  });

  // 1. KIỂM THỬ DANH MỤC & BẢO TOÀN DỮ LIỆU
  it('TC01 & TC02: Chặn xóa danh mục đang có sản phẩm (Bảo toàn dữ liệu) và cho phép xóa danh mục trống', async () => {
    await expect(categoriesService.remove(1)).rejects.toThrow(
      BadRequestException,
    );

    const res = await categoriesService.remove(3);
    expect(res.madanhmuc).toBe(3);
  });

  // 2. KIỂM THỬ THÊM, SỬA, CẬP NHẬT GIÁ & TỒN KHO VÀ RÀNG BUỘC UNIQUE
  it('TC03 & TC04: Thêm sản phẩm mới tự động tạo bản ghi TON_KHO và chặn trùng phiên bản (Tên + Dung lượng + Màu sắc)', async () => {
    const created = await productsService.create({
      tensanpham: 'iPhone 16 Pro',
      madanhmuc: 1,
      dungluong: '128GB',
      mausac: 'Titan Trắng',
      sku: 'IP16P-128-WHT',
      giaban: 28990000,
      soluong: 20,
    });

    expect(created.masanpham).toBe(4);
    expect(created.soluongton).toBe(20);
    expect(created.sku).toBe('IP16P-128-WHT');

    // Thử tạo trùng phiên bản
    await expect(
      productsService.create({
        tensanpham: 'iPhone 16 Pro',
        madanhmuc: 1,
        dungluong: '128GB',
        mausac: 'Titan Trắng',
        giaban: 28990000,
        soluong: 5,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('TC06: Cập nhật giá bán và số lượng tồn kho ghi lịch sử vào bảng TON_KHO', async () => {
    const updated = await productsService.updatePriceStockImage(1, {
      giaban: 33500000,
      soluong: 40,
    });

    expect(updated.giaban).toBe(33500000);
    expect(updated.soluongton).toBe(40);
  });

  // 3. KIỂM THỬ TÌM KIẾM & LỌC SẢN PHẨM
  it('TC07: Tìm kiếm và lọc sản phẩm theo dòng iPhone (madanhmuc) và khoảng giá', async () => {
    const res = await productsService.findAllForStore({
      madanhmuc: 1,
      minPrice: 30000000,
      maxPrice: 40000000,
    });

    expect(res.data.length).toBe(1);
    expect(res.data[0].tensanpham).toBe('iPhone 16 Pro Max');

    await expect(
      productsService.findAllForStore({
        minPrice: 40000000,
        maxPrice: 20000000,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // 4. KIỂM THỬ SOFT DELETE: ẨN SẢN PHẨM NGỪNG KINH DOANH & CHẶN KHÁCH ĐẶT MUA
  it('TC08: Sản phẩm ngừng kinh doanh (Soft Delete) bị ẩn khỏi trang khách hàng và không thể đặt mua', async () => {
    // Ẩn sản phẩm #1 (đã có đơn hàng)
    const hideRes = await productsService.softDelete(1);
    expect(hideRes.data.trangthai).toBe('NGUNG_KINH_DOANH');

    // Kiểm tra danh sách khách hàng không còn hiển thị sản phẩm #1 và #3
    const storeList = await productsService.findAllForStore({});
    const storeIds = storeList.data.map((p) => p.masanpham);
    expect(storeIds).not.toContain(1);
    expect(storeIds).not.toContain(3);
    expect(storeIds).toContain(2);

    // Khách hàng truy cập chi tiết sản phẩm đã ẩn -> Báo lỗi 404 NotFoundException
    await expect(productsService.findOneForStore(1)).rejects.toThrow(
      NotFoundException,
    );

    // Khách hàng cố tình đặt mua sản phẩm đã ẩn -> Báo lỗi 400 BadRequestException
    await expect(productsService.verifyPurchasable(1, 1)).rejects.toThrow(
      BadRequestException,
    );
  });
});
