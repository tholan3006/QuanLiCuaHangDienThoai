-- ============================================================================
-- TẬP TIN: database_script.sql
-- DỰ ÁN: WEBSITE QUẢN LÝ VÀ BÁN IPHONE
-- Thiết kế theo đúng mục "2.1. Sơ đồ quan hệ giữa các bảng" (13 bảng dữ liệu)
-- HỆ QUẢN TRỊ CSDL: PostgreSQL 15+ (Chạy trực tiếp trên DBeaver hoặc psql)
-- PHỤ TRÁCH:
--   + Thành viên 2: Thiết kế cấu trúc CSDL, PK, FK, CHECK, UNIQUE, Index
--   + Thành viên 2 & Thành viên 5: Khởi tạo dữ liệu mẫu (Seed Data)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. LÀM SẠCH CÁC BẢNG CŨ (NẾU CHẠY LẠI SCRIPT)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS "BAO_CAO_DOANH_THU" CASCADE;
DROP TABLE IF EXISTS "HOA_DON" CASCADE;
DROP TABLE IF EXISTS "CHI_TIET_DON_HANG" CASCADE;
DROP TABLE IF EXISTS "DON_HANG" CASCADE;
DROP TABLE IF EXISTS "CHI_TIET_GIO_HANG" CASCADE;
DROP TABLE IF EXISTS "GIO_HANG" CASCADE;
DROP TABLE IF EXISTS "TON_KHO" CASCADE;
DROP TABLE IF EXISTS "SAN_PHAM" CASCADE;
DROP TABLE IF EXISTS "DANH_MUC" CASCADE;
DROP TABLE IF EXISTS "KHACH_HANG" CASCADE;
DROP TABLE IF EXISTS "NHAN_VIEN" CASCADE;
DROP TABLE IF EXISTS "TAI_KHOAN" CASCADE;
DROP TABLE IF EXISTS "VAI_TRO" CASCADE;

-- ----------------------------------------------------------------------------
-- 1. BẢNG VAI_TRO
-- ----------------------------------------------------------------------------
CREATE TABLE "VAI_TRO" (
    "mavaitro" SERIAL NOT NULL,
    "tenvaitro" VARCHAR(100) NOT NULL,
    "mota" TEXT,

    CONSTRAINT "VAI_TRO_pkey" PRIMARY KEY ("mavaitro"),
    CONSTRAINT "VAI_TRO_tenvaitro_key" UNIQUE ("tenvaitro"),
    CONSTRAINT "chk_vai_tro_ten_not_empty" CHECK (char_length(btrim("tenvaitro")) > 0)
);

-- ----------------------------------------------------------------------------
-- 2. BẢNG TAI_KHOAN
-- ----------------------------------------------------------------------------
CREATE TABLE "TAI_KHOAN" (
    "mataikhoan" SERIAL NOT NULL,
    "tendangnhap" VARCHAR(100) NOT NULL,
    "matkhau" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "trangthai" VARCHAR(30) NOT NULL DEFAULT 'HOAT_DONG',
    "mavaitro" INTEGER NOT NULL,

    CONSTRAINT "TAI_KHOAN_pkey" PRIMARY KEY ("mataikhoan"),
    CONSTRAINT "TAI_KHOAN_tendangnhap_key" UNIQUE ("tendangnhap"),
    CONSTRAINT "TAI_KHOAN_email_key" UNIQUE ("email"),
    CONSTRAINT "chk_tai_khoan_trangthai" CHECK ("trangthai" IN ('HOAT_DONG', 'KHOA')),
    CONSTRAINT "chk_tai_khoan_email_format" CHECK ("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT "TAI_KHOAN_mavaitro_fkey"
        FOREIGN KEY ("mavaitro") REFERENCES "VAI_TRO"("mavaitro")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 3. BẢNG NHAN_VIEN
-- ----------------------------------------------------------------------------
CREATE TABLE "NHAN_VIEN" (
    "manhanvien" SERIAL NOT NULL,
    "hoten" VARCHAR(150) NOT NULL,
    "sdt" VARCHAR(20),
    "diachi" TEXT,
    "chucvu" VARCHAR(100),
    "ngayvaolam" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "mataikhoan" INTEGER NOT NULL,

    CONSTRAINT "NHAN_VIEN_pkey" PRIMARY KEY ("manhanvien"),
    CONSTRAINT "NHAN_VIEN_sdt_key" UNIQUE ("sdt"),
    CONSTRAINT "NHAN_VIEN_mataikhoan_key" UNIQUE ("mataikhoan"),
    CONSTRAINT "chk_nhan_vien_sdt" CHECK ("sdt" IS NULL OR "sdt" ~ '^[0-9+\-\s]{9,15}$'),
    CONSTRAINT "NHAN_VIEN_mataikhoan_fkey"
        FOREIGN KEY ("mataikhoan") REFERENCES "TAI_KHOAN"("mataikhoan")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 4. BẢNG KHACH_HANG
-- ----------------------------------------------------------------------------
CREATE TABLE "KHACH_HANG" (
    "makhachhang" SERIAL NOT NULL,
    "hoten" VARCHAR(150) NOT NULL,
    "sdt" VARCHAR(20),
    "diachi" TEXT,
    "mataikhoan" INTEGER NOT NULL,

    CONSTRAINT "KHACH_HANG_pkey" PRIMARY KEY ("makhachhang"),
    CONSTRAINT "KHACH_HANG_mataikhoan_key" UNIQUE ("mataikhoan"),
    CONSTRAINT "chk_khach_hang_sdt" CHECK ("sdt" IS NULL OR "sdt" ~ '^[0-9+\-\s]{9,15}$'),
    CONSTRAINT "KHACH_HANG_mataikhoan_fkey"
        FOREIGN KEY ("mataikhoan") REFERENCES "TAI_KHOAN"("mataikhoan")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 5. BẢNG DANH_MUC (Phụ trách chính TV2)
-- ----------------------------------------------------------------------------
CREATE TABLE "DANH_MUC" (
    "madanhmuc" SERIAL NOT NULL,
    "tendanhmuc" VARCHAR(150) NOT NULL,
    "mota" TEXT,

    CONSTRAINT "DANH_MUC_pkey" PRIMARY KEY ("madanhmuc"),
    CONSTRAINT "DANH_MUC_tendanhmuc_key" UNIQUE ("tendanhmuc"),
    CONSTRAINT "chk_danh_muc_ten_not_empty" CHECK (char_length(btrim("tendanhmuc")) > 0)
);

-- ----------------------------------------------------------------------------
-- 6. BẢNG SAN_PHAM (Phụ trách chính TV2)
-- Hỗ trợ Soft Delete qua cột trangthai ('DANG_BAN' | 'NGUNG_KINH_DOANH' | 'HET_HANG')
-- ----------------------------------------------------------------------------
CREATE TABLE "SAN_PHAM" (
    "masanpham" SERIAL NOT NULL,
    "tensanpham" VARCHAR(200) NOT NULL,
    "dungluong" VARCHAR(30) NOT NULL,
    "mausac" VARCHAR(50) NOT NULL,
    "giaban" DECIMAL(15,2) NOT NULL,
    "mota" TEXT,
    "hinhanh" VARCHAR(500),
    "trangthai" VARCHAR(30) NOT NULL DEFAULT 'DANG_BAN',
    "madanhmuc" INTEGER NOT NULL,

    CONSTRAINT "SAN_PHAM_pkey" PRIMARY KEY ("masanpham"),
    CONSTRAINT "uq_san_pham_ten_dungluong_mausac" UNIQUE ("tensanpham", "dungluong", "mausac"),
    CONSTRAINT "chk_san_pham_giaban_positive" CHECK ("giaban" > 0),
    CONSTRAINT "chk_san_pham_dungluong" CHECK ("dungluong" IN ('64GB', '128GB', '256GB', '512GB', '1TB', '2TB')),
    CONSTRAINT "chk_san_pham_trangthai" CHECK ("trangthai" IN ('DANG_BAN', 'NGUNG_KINH_DOANH', 'HET_HANG')),
    CONSTRAINT "SAN_PHAM_madanhmuc_fkey"
        FOREIGN KEY ("madanhmuc") REFERENCES "DANH_MUC"("madanhmuc")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 7. BẢNG TON_KHO (Phụ trách chính TV2)
-- ----------------------------------------------------------------------------
CREATE TABLE "TON_KHO" (
    "matonkho" SERIAL NOT NULL,
    "masanpham" INTEGER NOT NULL,
    "soluong" INTEGER NOT NULL DEFAULT 0,
    "ngaycapnhat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TON_KHO_pkey" PRIMARY KEY ("matonkho"),
    CONSTRAINT "chk_ton_kho_soluong_non_negative" CHECK ("soluong" >= 0),
    CONSTRAINT "TON_KHO_masanpham_fkey"
        FOREIGN KEY ("masanpham") REFERENCES "SAN_PHAM"("masanpham")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 8. BẢNG GIO_HANG
-- ----------------------------------------------------------------------------
CREATE TABLE "GIO_HANG" (
    "magiohang" SERIAL NOT NULL,
    "makhachhang" INTEGER NOT NULL,

    CONSTRAINT "GIO_HANG_pkey" PRIMARY KEY ("magiohang"),
    CONSTRAINT "GIO_HANG_makhachhang_fkey"
        FOREIGN KEY ("makhachhang") REFERENCES "KHACH_HANG"("makhachhang")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 9. BẢNG CHI_TIET_GIO_HANG
-- ----------------------------------------------------------------------------
CREATE TABLE "CHI_TIET_GIO_HANG" (
    "machitietgio" SERIAL NOT NULL,
    "magiohang" INTEGER NOT NULL,
    "masanpham" INTEGER NOT NULL,
    "soluong" INTEGER NOT NULL,
    "dongia" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "CHI_TIET_GIO_HANG_pkey" PRIMARY KEY ("machitietgio"),
    CONSTRAINT "uq_chitietgiohang_giohang_sanpham" UNIQUE ("magiohang", "masanpham"),
    CONSTRAINT "chk_ctgh_soluong_positive" CHECK ("soluong" > 0),
    CONSTRAINT "chk_ctgh_dongia_positive" CHECK ("dongia" > 0),
    CONSTRAINT "CHI_TIET_GIO_HANG_magiohang_fkey"
        FOREIGN KEY ("magiohang") REFERENCES "GIO_HANG"("magiohang")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CHI_TIET_GIO_HANG_masanpham_fkey"
        FOREIGN KEY ("masanpham") REFERENCES "SAN_PHAM"("masanpham")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 10. BẢNG DON_HANG
-- ----------------------------------------------------------------------------
CREATE TABLE "DON_HANG" (
    "madonhang" SERIAL NOT NULL,
    "makhachhang" INTEGER NOT NULL,
    "manhanvien" INTEGER,
    "ngaydat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayxacnhan" TIMESTAMP(3),
    "tongtien" DECIMAL(15,2) NOT NULL,
    "phuongthucthanhtoan" VARCHAR(50) NOT NULL DEFAULT 'COD',
    "trangthai" VARCHAR(30) NOT NULL DEFAULT 'CHO_XAC_NHAN',

    CONSTRAINT "DON_HANG_pkey" PRIMARY KEY ("madonhang"),
    CONSTRAINT "chk_don_hang_tongtien_non_negative" CHECK ("tongtien" >= 0),
    CONSTRAINT "chk_don_hang_trangthai" CHECK ("trangthai" IN ('CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_GIAO', 'HOAN_THANH', 'DA_HUY')),
    CONSTRAINT "DON_HANG_makhachhang_fkey"
        FOREIGN KEY ("makhachhang") REFERENCES "KHACH_HANG"("makhachhang")
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DON_HANG_manhanvien_fkey"
        FOREIGN KEY ("manhanvien") REFERENCES "NHAN_VIEN"("manhanvien")
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 11. BẢNG CHI_TIET_DON_HANG
-- ----------------------------------------------------------------------------
CREATE TABLE "CHI_TIET_DON_HANG" (
    "machitiet" SERIAL NOT NULL,
    "madonhang" INTEGER NOT NULL,
    "masanpham" INTEGER NOT NULL,
    "soluong" INTEGER NOT NULL,
    "dongia" DECIMAL(15,2) NOT NULL,
    "thanhtien" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "CHI_TIET_DON_HANG_pkey" PRIMARY KEY ("machitiet"),
    CONSTRAINT "uq_chitietdonhang_donhang_sanpham" UNIQUE ("madonhang", "masanpham"),
    CONSTRAINT "chk_ctdh_soluong_positive" CHECK ("soluong" > 0),
    CONSTRAINT "chk_ctdh_dongia_positive" CHECK ("dongia" > 0),
    CONSTRAINT "chk_ctdh_thanhtien_valid" CHECK ("thanhtien" >= 0 AND "thanhtien" = "soluong" * "dongia"),
    CONSTRAINT "CHI_TIET_DON_HANG_madonhang_fkey"
        FOREIGN KEY ("madonhang") REFERENCES "DON_HANG"("madonhang")
        ON DELETE CASCADE ON UPDATE CASCADE,
    -- ON DELETE RESTRICT: Tuyệt đối không xóa vật lý sản phẩm đã có đơn hàng
    CONSTRAINT "CHI_TIET_DON_HANG_masanpham_fkey"
        FOREIGN KEY ("masanpham") REFERENCES "SAN_PHAM"("masanpham")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 12. BẢNG HOA_DON
-- ----------------------------------------------------------------------------
CREATE TABLE "HOA_DON" (
    "mahoadon" SERIAL NOT NULL,
    "madonhang" INTEGER NOT NULL,
    "ngaylap" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tongtien" DECIMAL(15,2) NOT NULL,
    "hinhthuctt" VARCHAR(50) NOT NULL,

    CONSTRAINT "HOA_DON_pkey" PRIMARY KEY ("mahoadon"),
    CONSTRAINT "HOA_DON_madonhang_key" UNIQUE ("madonhang"),
    CONSTRAINT "chk_hoa_don_tongtien_non_negative" CHECK ("tongtien" >= 0),
    CONSTRAINT "HOA_DON_madonhang_fkey"
        FOREIGN KEY ("madonhang") REFERENCES "DON_HANG"("madonhang")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- 13. BẢNG BAO_CAO_DOANH_THU
-- ----------------------------------------------------------------------------
CREATE TABLE "BAO_CAO_DOANH_THU" (
    "mabaocao" SERIAL NOT NULL,
    "ngaybatdau" TIMESTAMP(3) NOT NULL,
    "ngayketthuc" TIMESTAMP(3) NOT NULL,
    "tongdoanhthu" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tongsodonhang" INTEGER NOT NULL DEFAULT 0,
    "soluongsanphamdaban" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BAO_CAO_DOANH_THU_pkey" PRIMARY KEY ("mabaocao"),
    CONSTRAINT "chk_bcdt_ngay_hop_le" CHECK ("ngayketthuc" >= "ngaybatdau"),
    CONSTRAINT "chk_bcdt_doanhthu_non_negative" CHECK ("tongdoanhthu" >= 0),
    CONSTRAINT "chk_bcdt_sodon_non_negative" CHECK ("tongsodonhang" >= 0),
    CONSTRAINT "chk_bcdt_sosp_non_negative" CHECK ("soluongsanphamdaban" >= 0)
);

-- ============================================================================
-- TẠO CHỈ MỤC (INDEXES)
-- ============================================================================
CREATE INDEX "TAI_KHOAN_mavaitro_idx" ON "TAI_KHOAN"("mavaitro");
CREATE INDEX "SAN_PHAM_madanhmuc_idx" ON "SAN_PHAM"("madanhmuc");
CREATE INDEX "SAN_PHAM_tensanpham_idx" ON "SAN_PHAM"("tensanpham");
CREATE INDEX "SAN_PHAM_giaban_idx" ON "SAN_PHAM"("giaban");
CREATE INDEX "SAN_PHAM_trangthai_idx" ON "SAN_PHAM"("trangthai");
CREATE INDEX "TON_KHO_masanpham_idx" ON "TON_KHO"("masanpham");
CREATE INDEX "GIO_HANG_makhachhang_idx" ON "GIO_HANG"("makhachhang");
CREATE INDEX "CHI_TIET_GIO_HANG_magiohang_idx" ON "CHI_TIET_GIO_HANG"("magiohang");
CREATE INDEX "CHI_TIET_GIO_HANG_masanpham_idx" ON "CHI_TIET_GIO_HANG"("masanpham");
CREATE INDEX "DON_HANG_makhachhang_idx" ON "DON_HANG"("makhachhang");
CREATE INDEX "DON_HANG_manhanvien_idx" ON "DON_HANG"("manhanvien");
CREATE INDEX "DON_HANG_trangthai_idx" ON "DON_HANG"("trangthai");
CREATE INDEX "DON_HANG_ngaydat_idx" ON "DON_HANG"("ngaydat");
CREATE INDEX "CHI_TIET_DON_HANG_madonhang_idx" ON "CHI_TIET_DON_HANG"("madonhang");
CREATE INDEX "CHI_TIET_DON_HANG_masanpham_idx" ON "CHI_TIET_DON_HANG"("masanpham");
CREATE INDEX "HOA_DON_ngaylap_idx" ON "HOA_DON"("ngaylap");
CREATE INDEX "BAO_CAO_DOANH_THU_ngaybatdau_ngayketthuc_idx" ON "BAO_CAO_DOANH_THU"("ngaybatdau", "ngayketthuc");

-- ============================================================================
-- DỮ LIỆU MẪU (SEED DATA CHO 13 BẢNG - PHỐI HỢP TV2 & TV5)
-- Mật khẩu mặc định của tất cả tài khoản demo: 123456
-- ============================================================================

-- 1. VAI_TRO
INSERT INTO "VAI_TRO" ("mavaitro", "tenvaitro", "mota") VALUES
(1, 'ADMIN', 'Quản trị viên hệ thống: quản lý tài khoản, phân quyền, toàn quyền cấu hình'),
(2, 'NHAN_VIEN', 'Nhân viên bán hàng: quản lý danh mục, sản phẩm, tồn kho, duyệt đơn hàng, xuất hóa đơn'),
(3, 'KHACH_HANG', 'Khách hàng: xem sản phẩm, tìm kiếm, giỏ hàng, đặt hàng và xem lịch sử mua hàng');

-- 2. TAI_KHOAN (Mật khẩu '123456' mã hóa Bcrypt)
INSERT INTO "TAI_KHOAN" ("mataikhoan", "tendangnhap", "matkhau", "email", "trangthai", "mavaitro") VALUES
(1, 'admin', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'admin@iphonestore.vn', 'HOAT_DONG', 1),
(2, 'nhanvien1', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'staff1@iphonestore.vn', 'HOAT_DONG', 2),
(3, 'nhanvien2', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'staff2@iphonestore.vn', 'HOAT_DONG', 2),
(4, 'khachhang1', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'khachhang1@gmail.com', 'HOAT_DONG', 3),
(5, 'khachhang2', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'khachhang2@gmail.com', 'HOAT_DONG', 3),
(6, 'khachhang3', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'khachhang3@gmail.com', 'HOAT_DONG', 3);

-- 3. NHAN_VIEN
INSERT INTO "NHAN_VIEN" ("manhanvien", "hoten", "sdt", "diachi", "chucvu", "ngayvaolam", "mataikhoan") VALUES
(1, 'Trần Minh Tuấn', '0901000002', '45 Lê Lợi, Quận 1, TP.HCM', 'Chuyên viên bán hàng', '2024-03-15 08:00:00', 2),
(2, 'Lê Thị Thu Hà', '0901000003', '88 Võ Văn Tần, Quận 3, TP.HCM', 'Chuyên viên bán hàng & Kho', '2024-06-01 08:00:00', 3);

-- 4. KHACH_HANG
INSERT INTO "KHACH_HANG" ("makhachhang", "hoten", "sdt", "diachi", "mataikhoan") VALUES
(1, 'Phạm Hoàng Nam', '0912345671', '12 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', 4),
(2, 'Vũ Ngọc Ánh', '0912345672', '56 Nguyễn Văn Cừ, Quận 5, TP.HCM', 5),
(3, 'Đặng Quốc Bảo', '0912345673', '102 Hoàng Diệu, Quận 4, TP.HCM', 6);

-- 5. DANH_MUC (Các dòng iPhone chính hãng)
INSERT INTO "DANH_MUC" ("madanhmuc", "tendanhmuc", "mota") VALUES
(1, 'iPhone 16 Series', 'Thế hệ iPhone 16 Series mới nhất với chip A18 / A18 Pro, nút Camera Control và Apple Intelligence.'),
(2, 'iPhone 15 Series', 'Dòng iPhone 15 Series với cổng USB-C, Dynamic Island và khung viền Titan trên dòng Pro.'),
(3, 'iPhone 14 Series', 'Dòng iPhone 14 Series hiệu năng ổn định, camera sắc nét và thời lượng pin ấn tượng.'),
(4, 'iPhone 13 Series', 'Dòng iPhone 13 Series quốc dân với mức giá dễ tiếp cận, chip A15 Bionic bền bỉ.'),
(5, 'iPhone SE Series', 'Dòng iPhone nhỏ gọn, cấu hình mạnh mẽ trong tầm giá tiết kiệm.');

-- 6. SAN_PHAM (Các phiên bản màu sắc, dung lượng + 1 sản phẩm NGUNG_KINH_DOANH)
INSERT INTO "SAN_PHAM" (
    "masanpham", "tensanpham", "dungluong", "mausac",
    "giaban", "mota", "hinhanh", "trangthai", "madanhmuc"
) VALUES
(1, 'iPhone 16 Pro Max', '256GB', 'Titan Sa Mạc', 34990000.00, '[SKU: IP16PM-256-DES] Màn hình Super Retina XDR 6.9 inch, Chip A18 Pro, Camera 48MP Fusion, Zoom quang 5x.', '/images/products/iphone-16-pro-max-desert.png', 'DANG_BAN', 1),
(2, 'iPhone 16 Pro Max', '512GB', 'Titan Tự Nhiên', 40990000.00, '[SKU: IP16PM-512-NAT] Màn hình Super Retina XDR 6.9 inch, Chip A18 Pro, bộ nhớ 512GB quay ProRes 4K 120fps.', '/images/products/iphone-16-pro-max-natural.png', 'DANG_BAN', 1),
(3, 'iPhone 16 Pro Max', '1TB', 'Titan Đen', 46990000.00, '[SKU: IP16PM-1TB-BLK] Phiên bản cao cấp nhất 1TB, khung Titan cấp 5 siêu bền nhẹ.', '/images/products/iphone-16-pro-max-black.png', 'DANG_BAN', 1),
(4, 'iPhone 16 Pro', '128GB', 'Titan Trắng', 28990000.00, '[SKU: IP16P-128-WHT] Màn hình 6.3 inch ProMotion 120Hz, Chip A18 Pro, nút điều khiển Camera Control.', '/images/products/iphone-16-pro-white.png', 'DANG_BAN', 1),
(5, 'iPhone 16 Plus', '256GB', 'Xanh Lưu Ly', 25990000.00, '[SKU: IP16PL-256-ULT] Màn hình lớn 6.7 inch, pin siêu trâu, Chip A18 hỗ trợ Apple Intelligence.', '/images/products/iphone-16-plus-ultramarine.png', 'DANG_BAN', 1),
(6, 'iPhone 16', '128GB', 'Hồng', 22990000.00, '[SKU: IP16-128-PNK] Thiết kế camera dọc mới, nút Action Button và Camera Control hiện đại.', '/images/products/iphone-16-pink.png', 'DANG_BAN', 1),
(7, 'iPhone 15 Pro Max', '256GB', 'Titan Tự Nhiên', 29490000.00, '[SKU: IP15PM-256-NAT] Khung viền Titan, chip A17 Pro 3nm, camera tiềm vọng 5x, cổng USB-C 3.', '/images/products/iphone-15-pro-max-natural.png', 'DANG_BAN', 2),
(8, 'iPhone 15 Pro Max', '512GB', 'Titan Xanh', 34990000.00, '[SKU: IP15PM-512-BLU] Phiên bản 512GB màu Titan Xanh sang trọng, hiệu năng đỉnh cao.', '/images/products/iphone-15-pro-max-blue.png', 'DANG_BAN', 2),
(9, 'iPhone 15', '128GB', 'Hồng', 19490000.00, '[SKU: IP15-128-PNK] Camera chính 48MP sắc nét, Dynamic Island, cổng sạc USB-C tiện lợi.', '/images/products/iphone-15-pink.png', 'DANG_BAN', 2),
(10, 'iPhone 14', '128GB', 'Tím', 15990000.00, '[SKU: IP14-128-PUR] Thiết kế nhỏ gọn 6.1 inch, camera chụp đêm ấn tượng.', '/images/products/iphone-14-purple.png', 'DANG_BAN', 3),
(11, 'iPhone 13', '128GB', 'Trắng Starlight', 13490000.00, '[SKU: IP13-128-STA] Mẫu iPhone bán chạy nhất phân khúc tầm trung, hiệu năng mượt mà.', '/images/products/iphone-13-starlight.png', 'DANG_BAN', 4),
(12, 'iPhone 13 Pro Max', '128GB', 'Xanh Alpine', 21990000.00, '[SKU: IP13PM-128-ALP] Sản phẩm đã ngừng kinh doanh (Soft Delete) - ẩn khỏi trang khách hàng nhưng bảo toàn lịch sử đơn hàng.', '/images/products/iphone-13-pro-max-alpine.png', 'NGUNG_KINH_DOANH', 4);

-- 7. TON_KHO
INSERT INTO "TON_KHO" ("matonkho", "masanpham", "soluong", "ngaycapnhat") VALUES
(1, 1, 25, '2026-11-10 08:00:00'),
(2, 2, 15, '2026-11-10 08:00:00'),
(3, 3, 8, '2026-11-10 08:00:00'),
(4, 4, 20, '2026-11-10 08:00:00'),
(5, 5, 18, '2026-11-10 08:00:00'),
(6, 6, 30, '2026-11-10 08:00:00'),
(7, 7, 12, '2026-11-10 08:00:00'),
(8, 8, 6, '2026-11-10 08:00:00'),
(9, 9, 22, '2026-11-10 08:00:00'),
(10, 10, 16, '2026-11-10 08:00:00'),
(11, 11, 25, '2026-11-10 08:00:00'),
(12, 12, 0, '2026-10-15 09:30:00');

-- 8. GIO_HANG
INSERT INTO "GIO_HANG" ("magiohang", "makhachhang") VALUES
(1, 1),
(2, 2);

-- 9. CHI_TIET_GIO_HANG
INSERT INTO "CHI_TIET_GIO_HANG" ("machitietgio", "magiohang", "masanpham", "soluong", "dongia") VALUES
(1, 1, 4, 1, 28990000.00),
(2, 2, 9, 1, 19490000.00);

-- 10. DON_HANG
INSERT INTO "DON_HANG" (
    "madonhang", "makhachhang", "manhanvien", "ngaydat", "ngayxacnhan",
    "tongtien", "phuongthucthanhtoan", "trangthai"
) VALUES
(1, 1, 1, '2026-11-01 10:15:00', '2026-11-01 10:30:00', 56980000.00, 'CHUYEN_KHOAN', 'HOAN_THANH'),
(2, 2, 1, '2026-11-03 14:20:00', '2026-11-03 15:00:00', 29490000.00, 'COD', 'HOAN_THANH'),
(3, 3, 2, '2026-11-08 16:45:00', '2026-11-08 17:00:00', 40990000.00, 'CHUYEN_KHOAN', 'DANG_GIAO'),
(4, 1, NULL, '2026-11-10 08:30:00', NULL, 22990000.00, 'COD', 'CHO_XAC_NHAN');

-- 11. CHI_TIET_DON_HANG (Có sản phẩm #12 đã ngừng kinh doanh trong đơn hàng #1 để kiểm chứng Soft Delete)
INSERT INTO "CHI_TIET_DON_HANG" ("machitiet", "madonhang", "masanpham", "soluong", "dongia", "thanhtien") VALUES
(1, 1, 1, 1, 34990000.00, 34990000.00),
(2, 1, 12, 1, 21990000.00, 21990000.00),
(3, 2, 7, 1, 29490000.00, 29490000.00),
(4, 3, 2, 1, 40990000.00, 40990000.00),
(5, 4, 6, 1, 22990000.00, 22990000.00);

-- 12. HOA_DON
INSERT INTO "HOA_DON" ("mahoadon", "madonhang", "ngaylap", "tongtien", "hinhthuctt") VALUES
(1, 1, '2026-11-01 10:35:00', 56980000.00, 'CHUYEN_KHOAN'),
(2, 2, '2026-11-04 11:30:00', 29490000.00, 'COD'),
(3, 3, '2026-11-08 17:05:00', 40990000.00, 'CHUYEN_KHOAN');

-- 13. BAO_CAO_DOANH_THU
INSERT INTO "BAO_CAO_DOANH_THU" (
    "mabaocao", "ngaybatdau", "ngayketthuc",
    "tongdoanhthu", "tongsodonhang", "soluongsanphamdaban"
) VALUES
(1, '2026-11-01 00:00:00', '2026-11-05 23:59:59', 86470000.00, 2, 3),
(2, '2026-11-06 00:00:00', '2026-11-10 23:59:59', 40990000.00, 1, 1);

-- ----------------------------------------------------------------------------
-- ĐỒNG BỘ LẠI SEQUENCE CHO TẤT CẢ 13 BẢNG
-- ----------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('"VAI_TRO"', 'mavaitro'), COALESCE((SELECT MAX("mavaitro") FROM "VAI_TRO"), 1), true);
SELECT setval(pg_get_serial_sequence('"TAI_KHOAN"', 'mataikhoan'), COALESCE((SELECT MAX("mataikhoan") FROM "TAI_KHOAN"), 1), true);
SELECT setval(pg_get_serial_sequence('"NHAN_VIEN"', 'manhanvien'), COALESCE((SELECT MAX("manhanvien") FROM "NHAN_VIEN"), 1), true);
SELECT setval(pg_get_serial_sequence('"KHACH_HANG"', 'makhachhang'), COALESCE((SELECT MAX("makhachhang") FROM "KHACH_HANG"), 1), true);
SELECT setval(pg_get_serial_sequence('"DANH_MUC"', 'madanhmuc'), COALESCE((SELECT MAX("madanhmuc") FROM "DANH_MUC"), 1), true);
SELECT setval(pg_get_serial_sequence('"SAN_PHAM"', 'masanpham'), COALESCE((SELECT MAX("masanpham") FROM "SAN_PHAM"), 1), true);
SELECT setval(pg_get_serial_sequence('"TON_KHO"', 'matonkho'), COALESCE((SELECT MAX("matonkho") FROM "TON_KHO"), 1), true);
SELECT setval(pg_get_serial_sequence('"GIO_HANG"', 'magiohang'), COALESCE((SELECT MAX("magiohang") FROM "GIO_HANG"), 1), true);
SELECT setval(pg_get_serial_sequence('"CHI_TIET_GIO_HANG"', 'machitietgio'), COALESCE((SELECT MAX("machitietgio") FROM "CHI_TIET_GIO_HANG"), 1), true);
SELECT setval(pg_get_serial_sequence('"DON_HANG"', 'madonhang'), COALESCE((SELECT MAX("madonhang") FROM "DON_HANG"), 1), true);
SELECT setval(pg_get_serial_sequence('"CHI_TIET_DON_HANG"', 'machitiet'), COALESCE((SELECT MAX("machitiet") FROM "CHI_TIET_DON_HANG"), 1), true);
SELECT setval(pg_get_serial_sequence('"HOA_DON"', 'mahoadon'), COALESCE((SELECT MAX("mahoadon") FROM "HOA_DON"), 1), true);
SELECT setval(pg_get_serial_sequence('"BAO_CAO_DOANH_THU"', 'mabaocao'), COALESCE((SELECT MAX("mabaocao") FROM "BAO_CAO_DOANH_THU"), 1), true);

COMMIT;
