import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Prisma Seed Script - Khởi tạo dữ liệu mẫu theo đúng mục "2.1. Sơ đồ quan hệ giữa các bảng" (13 Bảng)
 * Phối hợp thực hiện: Thành viên 2 (CSDL & Sản phẩm) & Thành viên 5 (Dữ liệu demo)
 * Mật khẩu mặc định của mọi tài khoản demo: 123456
 */
async function main() {
  console.log('Bắt đầu khởi tạo dữ liệu mẫu (Seed Data) cho 13 bảng...');

  const defaultPasswordHash = '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm'; // '123456'

  // 1. Làm sạch dữ liệu theo thứ tự khóa ngoại
  await prisma.bAO_CAO_DOANH_THU.deleteMany();
  await prisma.hOA_DON.deleteMany();
  await prisma.cHI_TIET_DON_HANG.deleteMany();
  await prisma.dON_HANG.deleteMany();
  await prisma.cHI_TIET_GIO_HANG.deleteMany();
  await prisma.gIO_HANG.deleteMany();
  await prisma.tON_KHO.deleteMany();
  await prisma.sAN_PHAM.deleteMany();
  await prisma.dANH_MUC.deleteMany();
  await prisma.kHACH_HANG.deleteMany();
  await prisma.nHAN_VIEN.deleteMany();
  await prisma.tAI_KHOAN.deleteMany();
  await prisma.vAI_TRO.deleteMany();

  // 2. Tạo VAI_TRO
  const vtAdmin = await prisma.vAI_TRO.create({
    data: {
      tenvaitro: 'ADMIN',
      mota: 'Quản trị viên hệ thống: quản lý tài khoản, phân quyền, toàn quyền cấu hình',
    },
  });

  const vtNhanVien = await prisma.vAI_TRO.create({
    data: {
      tenvaitro: 'NHAN_VIEN',
      mota: 'Nhân viên bán hàng: quản lý danh mục, sản phẩm, tồn kho, duyệt đơn hàng, xuất hóa đơn',
    },
  });

  const vtKhachHang = await prisma.vAI_TRO.create({
    data: {
      tenvaitro: 'KHACH_HANG',
      mota: 'Khách hàng: xem sản phẩm, tìm kiếm, giỏ hàng, đặt hàng và xem lịch sử mua hàng',
    },
  });

  // 3. Tạo TAI_KHOAN
  await prisma.tAI_KHOAN.create({
    data: {
      tendangnhap: 'admin',
      matkhau: defaultPasswordHash,
      email: 'admin@iphonestore.vn',
      trangthai: 'HOAT_DONG',
      mavaitro: vtAdmin.mavaitro,
    },
  });

  const tkStaff1 = await prisma.tAI_KHOAN.create({
    data: {
      tendangnhap: 'nhanvien1',
      matkhau: defaultPasswordHash,
      email: 'staff1@iphonestore.vn',
      trangthai: 'HOAT_DONG',
      mavaitro: vtNhanVien.mavaitro,
    },
  });

  const tkStaff2 = await prisma.tAI_KHOAN.create({
    data: {
      tendangnhap: 'nhanvien2',
      matkhau: defaultPasswordHash,
      email: 'staff2@iphonestore.vn',
      trangthai: 'HOAT_DONG',
      mavaitro: vtNhanVien.mavaitro,
    },
  });

  const tkCustomer1 = await prisma.tAI_KHOAN.create({
    data: {
      tendangnhap: 'khachhang1',
      matkhau: defaultPasswordHash,
      email: 'khachhang1@gmail.com',
      trangthai: 'HOAT_DONG',
      mavaitro: vtKhachHang.mavaitro,
    },
  });

  const tkCustomer2 = await prisma.tAI_KHOAN.create({
    data: {
      tendangnhap: 'khachhang2',
      matkhau: defaultPasswordHash,
      email: 'khachhang2@gmail.com',
      trangthai: 'HOAT_DONG',
      mavaitro: vtKhachHang.mavaitro,
    },
  });

  // 4. Tạo NHAN_VIEN & KHACH_HANG
  const nv1 = await prisma.nHAN_VIEN.create({
    data: {
      hoten: 'Trần Minh Tuấn',
      sdt: '0901000002',
      diachi: '45 Lê Lợi, Quận 1, TP.HCM',
      chucvu: 'Chuyên viên bán hàng',
      mataikhoan: tkStaff1.mataikhoan,
    },
  });

  await prisma.nHAN_VIEN.create({
    data: {
      hoten: 'Lê Thị Thu Hà',
      sdt: '0901000003',
      diachi: '88 Võ Văn Tần, Quận 3, TP.HCM',
      chucvu: 'Chuyên viên bán hàng & Kho',
      mataikhoan: tkStaff2.mataikhoan,
    },
  });

  const kh1 = await prisma.kHACH_HANG.create({
    data: {
      hoten: 'Phạm Hoàng Nam',
      sdt: '0912345671',
      diachi: '12 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
      mataikhoan: tkCustomer1.mataikhoan,
    },
  });

  const kh2 = await prisma.kHACH_HANG.create({
    data: {
      hoten: 'Vũ Ngọc Ánh',
      sdt: '0912345672',
      diachi: '56 Nguyễn Văn Cừ, Quận 5, TP.HCM',
      mataikhoan: tkCustomer2.mataikhoan,
    },
  });

  // 5. Tạo DANH_MUC iPhone
  const dm16 = await prisma.dANH_MUC.create({
    data: {
      tendanhmuc: 'iPhone 16 Series',
      mota: 'Thế hệ iPhone 16 Series mới nhất với chip A18 / A18 Pro, nút Camera Control và Apple Intelligence.',
    },
  });

  const dm15 = await prisma.dANH_MUC.create({
    data: {
      tendanhmuc: 'iPhone 15 Series',
      mota: 'Dòng iPhone 15 Series với cổng USB-C, Dynamic Island và khung viền Titan trên dòng Pro.',
    },
  });

  const dm14 = await prisma.dANH_MUC.create({
    data: {
      tendanhmuc: 'iPhone 14 Series',
      mota: 'Dòng iPhone 14 Series hiệu năng ổn định, camera sắc nét và thời lượng pin ấn tượng.',
    },
  });

  const dm13 = await prisma.dANH_MUC.create({
    data: {
      tendanhmuc: 'iPhone 13 Series',
      mota: 'Dòng iPhone 13 Series quốc dân với mức giá dễ tiếp cận, chip A15 Bionic bền bỉ.',
    },
  });

  // 6. Tạo SAN_PHAM & TON_KHO
  const sp1 = await prisma.sAN_PHAM.create({
    data: {
      tensanpham: 'iPhone 16 Pro Max',
      dungluong: '256GB',
      mausac: 'Titan Sa Mạc',
      giaban: 34990000,
      mota: '[SKU: IP16PM-256-DES] Màn hình Super Retina XDR 6.9 inch, Chip A18 Pro, Camera 48MP Fusion, Zoom quang 5x.',
      hinhanh: '/images/products/iphone-16-pro-max-desert.png',
      trangthai: 'DANG_BAN',
      madanhmuc: dm16.madanhmuc,
      TON_KHO: {
        create: { soluong: 25 },
      },
    },
  });

  await prisma.sAN_PHAM.create({
    data: {
      tensanpham: 'iPhone 16 Pro Max',
      dungluong: '512GB',
      mausac: 'Titan Tự Nhiên',
      giaban: 40990000,
      mota: '[SKU: IP16PM-512-NAT] Màn hình Super Retina XDR 6.9 inch, Chip A18 Pro, bộ nhớ 512GB quay ProRes 4K 120fps.',
      hinhanh: '/images/products/iphone-16-pro-max-natural.png',
      trangthai: 'DANG_BAN',
      madanhmuc: dm16.madanhmuc,
      TON_KHO: {
        create: { soluong: 15 },
      },
    },
  });

  await prisma.sAN_PHAM.create({
    data: {
      tensanpham: 'iPhone 15 Pro Max',
      dungluong: '256GB',
      mausac: 'Titan Tự Nhiên',
      giaban: 29490000,
      mota: '[SKU: IP15PM-256-NAT] Khung viền Titan, chip A17 Pro 3nm, camera tiềm vọng 5x, cổng USB-C 3.',
      hinhanh: '/images/products/iphone-15-pro-max-natural.png',
      trangthai: 'DANG_BAN',
      madanhmuc: dm15.madanhmuc,
      TON_KHO: {
        create: { soluong: 12 },
      },
    },
  });

  await prisma.sAN_PHAM.create({
    data: {
      tensanpham: 'iPhone 14',
      dungluong: '128GB',
      mausac: 'Tím',
      giaban: 15990000,
      mota: '[SKU: IP14-128-PUR] Thiết kế nhỏ gọn 6.1 inch, camera chụp đêm ấn tượng.',
      hinhanh: '/images/products/iphone-14-purple.png',
      trangthai: 'DANG_BAN',
      madanhmuc: dm14.madanhmuc,
      TON_KHO: {
        create: { soluong: 16 },
      },
    },
  });

  const spDiscontinued = await prisma.sAN_PHAM.create({
    data: {
      tensanpham: 'iPhone 13 Pro Max',
      dungluong: '128GB',
      mausac: 'Xanh Alpine',
      giaban: 21990000,
      mota: '[SKU: IP13PM-128-ALP] Sản phẩm đã ngừng kinh doanh (Soft Delete) - ẩn khỏi trang khách hàng nhưng bảo toàn lịch sử đơn hàng.',
      hinhanh: '/images/products/iphone-13-pro-max-alpine.png',
      trangthai: 'NGUNG_KINH_DOANH',
      madanhmuc: dm13.madanhmuc,
      TON_KHO: {
        create: { soluong: 0 },
      },
    },
  });

  // 7. Tạo GIO_HANG & CHI_TIET_GIO_HANG
  await prisma.gIO_HANG.create({
    data: {
      makhachhang: kh2.makhachhang,
      CHI_TIET_GIO_HANG: {
        create: {
          masanpham: sp1.masanpham,
          soluong: 1,
          dongia: 34990000,
        },
      },
    },
  });

  // 8. Tạo DON_HANG, CHI_TIET_DON_HANG, HOA_DON, BAO_CAO_DOANH_THU
  const dh1 = await prisma.dON_HANG.create({
    data: {
      makhachhang: kh1.makhachhang,
      manhanvien: nv1.manhanvien,
      ngayxacnhan: new Date(),
      tongtien: 56980000,
      phuongthucthanhtoan: 'CHUYEN_KHOAN',
      trangthai: 'HOAN_THANH',
      CHI_TIET_DON_HANG: {
        create: [
          {
            masanpham: sp1.masanpham,
            soluong: 1,
            dongia: 34990000,
            thanhtien: 34990000,
          },
          {
            masanpham: spDiscontinued.masanpham,
            soluong: 1,
            dongia: 21990000,
            thanhtien: 21990000,
          },
        ],
      },
    },
  });

  await prisma.hOA_DON.create({
    data: {
      madonhang: dh1.madonhang,
      tongtien: 56980000,
      hinhthuctt: 'CHUYEN_KHOAN',
    },
  });

  await prisma.bAO_CAO_DOANH_THU.create({
    data: {
      ngaybatdau: new Date('2026-11-01T00:00:00Z'),
      ngayketthuc: new Date('2026-11-10T23:59:59Z'),
      tongdoanhthu: 56980000,
      tongsodonhang: 1,
      soluongsanphamdaban: 2,
    },
  });

  console.log('Đã khởi tạo thành công dữ liệu mẫu cho 13 bảng!');
}

main()
  .catch((e) => {
    console.error('Lỗi khi chạy seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
