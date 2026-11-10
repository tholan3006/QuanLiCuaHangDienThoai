-- ============================================================================
-- PRISMA MIGRATION: 20261110000000_init_database
-- HỆ THỐNG WEBSITE QUẢN LÝ VÀ BÁN IPHONE
-- Thiết kế theo đúng mục "2.1. Sơ đồ quan hệ giữa các bảng" (13 bảng dữ liệu)
-- Phụ trách: Thành viên 2 (Quản trị CSDL & Quản lý Danh mục, Sản phẩm)
-- Bao gồm: 13 Bảng, PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, INDEX
-- ============================================================================

-- 1. BẢNG VAI_TRO
CREATE TABLE "VAI_TRO" (
    "mavaitro" SERIAL NOT NULL,
    "tenvaitro" VARCHAR(100) NOT NULL,
    "mota" TEXT,

    CONSTRAINT "VAI_TRO_pkey" PRIMARY KEY ("mavaitro"),
    CONSTRAINT "VAI_TRO_tenvaitro_key" UNIQUE ("tenvaitro"),
    CONSTRAINT "chk_vai_tro_ten_not_empty" CHECK (char_length(btrim("tenvaitro")) > 0)
);

-- 2. BẢNG TAI_KHOAN
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
    CONSTRAINT "chk_tai_khoan_trang_thai" CHECK ("trangthai" IN ('HOAT_DONG', 'KHOA')),
    CONSTRAINT "chk_tai_khoan_email_format" CHECK ("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 3. BẢNG NHAN_VIEN
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
    CONSTRAINT "chk_nhan_vien_sdt" CHECK ("sdt" IS NULL OR "sdt" ~ '^[0-9+\-\s]{9,15}$')
);

-- 4. BẢNG KHACH_HANG
CREATE TABLE "KHACH_HANG" (
    "makhachhang" SERIAL NOT NULL,
    "hoten" VARCHAR(150) NOT NULL,
    "sdt" VARCHAR(20),
    "diachi" TEXT,
    "mataikhoan" INTEGER NOT NULL,

    CONSTRAINT "KHACH_HANG_pkey" PRIMARY KEY ("makhachhang"),
    CONSTRAINT "KHACH_HANG_mataikhoan_key" UNIQUE ("mataikhoan"),
    CONSTRAINT "chk_khach_hang_sdt" CHECK ("sdt" IS NULL OR "sdt" ~ '^[0-9+\-\s]{9,15}$')
);

-- 5. BẢNG DANH_MUC (Phụ trách chính TV2)
CREATE TABLE "DANH_MUC" (
    "madanhmuc" SERIAL NOT NULL,
    "tendanhmuc" VARCHAR(150) NOT NULL,
    "mota" TEXT,

    CONSTRAINT "DANH_MUC_pkey" PRIMARY KEY ("madanhmuc"),
    CONSTRAINT "DANH_MUC_tendanhmuc_key" UNIQUE ("tendanhmuc"),
    CONSTRAINT "chk_danh_muc_ten_not_empty" CHECK (char_length(btrim("tendanhmuc")) > 0)
);

-- 6. BẢNG SAN_PHAM (Phụ trách chính TV2)
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
    CONSTRAINT "chk_san_pham_trangthai" CHECK ("trangthai" IN ('DANG_BAN', 'NGUNG_KINH_DOANH', 'HET_HANG'))
);

-- 7. BẢNG TON_KHO (Phụ trách chính TV2)
CREATE TABLE "TON_KHO" (
    "matonkho" SERIAL NOT NULL,
    "masanpham" INTEGER NOT NULL,
    "soluong" INTEGER NOT NULL DEFAULT 0,
    "ngaycapnhat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TON_KHO_pkey" PRIMARY KEY ("matonkho"),
    CONSTRAINT "chk_ton_kho_soluong_non_negative" CHECK ("soluong" >= 0)
);

-- 8. BẢNG GIO_HANG
CREATE TABLE "GIO_HANG" (
    "magiohang" SERIAL NOT NULL,
    "makhachhang" INTEGER NOT NULL,

    CONSTRAINT "GIO_HANG_pkey" PRIMARY KEY ("magiohang")
);

-- 9. BẢNG CHI_TIET_GIO_HANG
CREATE TABLE "CHI_TIET_GIO_HANG" (
    "machitietgio" SERIAL NOT NULL,
    "magiohang" INTEGER NOT NULL,
    "masanpham" INTEGER NOT NULL,
    "soluong" INTEGER NOT NULL,
    "dongia" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "CHI_TIET_GIO_HANG_pkey" PRIMARY KEY ("machitietgio"),
    CONSTRAINT "uq_chitietgiohang_giohang_sanpham" UNIQUE ("magiohang", "masanpham"),
    CONSTRAINT "chk_ctgh_soluong_positive" CHECK ("soluong" > 0),
    CONSTRAINT "chk_ctgh_dongia_positive" CHECK ("dongia" > 0)
);

-- 10. BẢNG DON_HANG
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
    CONSTRAINT "chk_don_hang_trangthai" CHECK ("trangthai" IN ('CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_GIAO', 'HOAN_THANH', 'DA_HUY'))
);

-- 11. BẢNG CHI_TIET_DON_HANG
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
    CONSTRAINT "chk_ctdh_thanhtien_valid" CHECK ("thanhtien" >= 0 AND "thanhtien" = "soluong" * "dongia")
);

-- 12. BẢNG HOA_DON
CREATE TABLE "HOA_DON" (
    "mahoadon" SERIAL NOT NULL,
    "madonhang" INTEGER NOT NULL,
    "ngaylap" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tongtien" DECIMAL(15,2) NOT NULL,
    "hinhthuctt" VARCHAR(50) NOT NULL,

    CONSTRAINT "HOA_DON_pkey" PRIMARY KEY ("mahoadon"),
    CONSTRAINT "HOA_DON_madonhang_key" UNIQUE ("madonhang"),
    CONSTRAINT "chk_hoa_don_tongtien_non_negative" CHECK ("tongtien" >= 0)
);

-- 13. BẢNG BAO_CAO_DOANH_THU
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
-- RÀNG BUỘC KHÓA NGOẠI (FOREIGN KEYS) & QUY TẮC BẢO TOÀN DỮ LIỆU
-- ============================================================================
ALTER TABLE "TAI_KHOAN"
    ADD CONSTRAINT "TAI_KHOAN_mavaitro_fkey"
    FOREIGN KEY ("mavaitro") REFERENCES "VAI_TRO"("mavaitro")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "NHAN_VIEN"
    ADD CONSTRAINT "NHAN_VIEN_mataikhoan_fkey"
    FOREIGN KEY ("mataikhoan") REFERENCES "TAI_KHOAN"("mataikhoan")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "KHACH_HANG"
    ADD CONSTRAINT "KHACH_HANG_mataikhoan_fkey"
    FOREIGN KEY ("mataikhoan") REFERENCES "TAI_KHOAN"("mataikhoan")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ON DELETE RESTRICT: Không cho xóa danh mục đang có sản phẩm
ALTER TABLE "SAN_PHAM"
    ADD CONSTRAINT "SAN_PHAM_madanhmuc_fkey"
    FOREIGN KEY ("madanhmuc") REFERENCES "DANH_MUC"("madanhmuc")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TON_KHO"
    ADD CONSTRAINT "TON_KHO_masanpham_fkey"
    FOREIGN KEY ("masanpham") REFERENCES "SAN_PHAM"("masanpham")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GIO_HANG"
    ADD CONSTRAINT "GIO_HANG_makhachhang_fkey"
    FOREIGN KEY ("makhachhang") REFERENCES "KHACH_HANG"("makhachhang")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CHI_TIET_GIO_HANG"
    ADD CONSTRAINT "CHI_TIET_GIO_HANG_magiohang_fkey"
    FOREIGN KEY ("magiohang") REFERENCES "GIO_HANG"("magiohang")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CHI_TIET_GIO_HANG"
    ADD CONSTRAINT "CHI_TIET_GIO_HANG_masanpham_fkey"
    FOREIGN KEY ("masanpham") REFERENCES "SAN_PHAM"("masanpham")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DON_HANG"
    ADD CONSTRAINT "DON_HANG_makhachhang_fkey"
    FOREIGN KEY ("makhachhang") REFERENCES "KHACH_HANG"("makhachhang")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DON_HANG"
    ADD CONSTRAINT "DON_HANG_manhanvien_fkey"
    FOREIGN KEY ("manhanvien") REFERENCES "NHAN_VIEN"("manhanvien")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CHI_TIET_DON_HANG"
    ADD CONSTRAINT "CHI_TIET_DON_HANG_madonhang_fkey"
    FOREIGN KEY ("madonhang") REFERENCES "DON_HANG"("madonhang")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ON DELETE RESTRICT: Tuyệt đối không xóa vật lý sản phẩm đã có đơn hàng
ALTER TABLE "CHI_TIET_DON_HANG"
    ADD CONSTRAINT "CHI_TIET_DON_HANG_masanpham_fkey"
    FOREIGN KEY ("masanpham") REFERENCES "SAN_PHAM"("masanpham")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HOA_DON"
    ADD CONSTRAINT "HOA_DON_madonhang_fkey"
    FOREIGN KEY ("madonhang") REFERENCES "DON_HANG"("madonhang")
    ON DELETE RESTRICT ON UPDATE CASCADE;
