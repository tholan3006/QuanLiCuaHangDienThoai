import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Prisma Seed Script - Khởi tạo dữ liệu mẫu cho 13 bảng hệ thống
 * Phụ trách: Thành viên 5 (Quản lý Hóa đơn, Thống kê và Dữ liệu demo)
 * Phối hợp: Thành viên 2 (Cơ sở dữ liệu & Quản lý Sản phẩm)
 * 
 * Đáp ứng đầy đủ các yêu cầu chấm đồ án:
 * 1. 15 sản phẩm iPhone đầy đủ thông tin, cấu hình, hình ảnh thực tế, mã SKU
 * 2. 3 tài khoản mẫu chuẩn: ADMIN (admin), STAFF (nhanvien1), CUSTOMER (khachhang1) + tài khoản phụ
 * 3. Đơn hàng đại diện đầy đủ 4 trường hợp nghiệp vụ:
 *    - PENDING (chưa duyệt, chưa có hóa đơn, kho chưa trừ)
 *    - APPROVED (đã duyệt, có hóa đơn ISSUED, kho đã trừ chính xác)
 *    - CANCELLED sau khi APPROVED (có hóa đơn VOID, kho được hoàn trả đúng số lượng)
 *    - CANCELLED khi còn PENDING (không có hóa đơn, kho giữ nguyên)
 * 4. Mật khẩu mặc định của mọi tài khoản: 123456
 */
async function main() {
  console.log('--- [TV5] Bắt đầu khởi tạo dữ liệu mẫu (Seed Data) cho 13 bảng ---');

  const defaultPasswordHash = '$2b$10$kg37ufgLwgJ.3RDgfOG5yO2jVvyNqLy4bGwCA/xoZv9xANnLsXV3W'; // '123456'

  // 1. Dọn dẹp dữ liệu cũ theo thứ tự ràng buộc khóa ngoại
  console.log('1. Làm sạch dữ liệu theo thứ tự khóa ngoại...');
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

  // 2. BẢNG VAI_TRO
  console.log('2. Tạo dữ liệu VAI_TRO...');
  const vtAdmin = await prisma.vAI_TRO.create({
    data: {
      mavaitro: 1,
      tenvaitro: 'ADMIN',
      mota: 'Quản trị viên hệ thống: quản lý tài khoản, phân quyền, cấu hình toàn bộ hệ thống',
    },
  });

  const vtNhanVien = await prisma.vAI_TRO.create({
    data: {
      mavaitro: 2,
      tenvaitro: 'NHAN_VIEN',
      mota: 'Nhân viên bán hàng: quản lý sản phẩm, duyệt/hủy đơn hàng, in hóa đơn và xem thống kê',
    },
  });

  const vtKhachHang = await prisma.vAI_TRO.create({
    data: {
      mavaitro: 3,
      tenvaitro: 'KHACH_HANG',
      mota: 'Khách hàng: tìm kiếm sản phẩm, quản lý giỏ hàng, đặt hàng và theo dõi đơn mua',
    },
  });

  // 3. BẢNG TAI_KHOAN (Admin, Staff, Customer chuẩn mực)
  console.log('3. Tạo dữ liệu TAI_KHOAN...');
  const tkAdmin = await prisma.tAI_KHOAN.create({
    data: {
      mataikhoan: 1,
      tendangnhap: 'admin',
      matkhau: defaultPasswordHash,
      email: 'admin@iphonestore.vn',
      trangthai: 'HOAT_DONG',
      mavaitro: vtAdmin.mavaitro,
    },
  });

  const tkStaff1 = await prisma.tAI_KHOAN.create({
    data: {
      mataikhoan: 2,
      tendangnhap: 'nhanvien1',
      matkhau: defaultPasswordHash,
      email: 'nhanvien1@iphonestore.vn',
      trangthai: 'HOAT_DONG',
      mavaitro: vtNhanVien.mavaitro,
    },
  });

  const tkStaff2 = await prisma.tAI_KHOAN.create({
    data: {
      mataikhoan: 3,
      tendangnhap: 'nhanvien2',
      matkhau: defaultPasswordHash,
      email: 'nhanvien2@iphonestore.vn',
      trangthai: 'HOAT_DONG',
      mavaitro: vtNhanVien.mavaitro,
    },
  });

  const tkCustomer1 = await prisma.tAI_KHOAN.create({
    data: {
      mataikhoan: 4,
      tendangnhap: 'khachhang1',
      matkhau: defaultPasswordHash,
      email: 'khachhang1@gmail.com',
      trangthai: 'HOAT_DONG',
      mavaitro: vtKhachHang.mavaitro,
    },
  });

  const tkCustomer2 = await prisma.tAI_KHOAN.create({
    data: {
      mataikhoan: 5,
      tendangnhap: 'khachhang2',
      matkhau: defaultPasswordHash,
      email: 'khachhang2@gmail.com',
      trangthai: 'HOAT_DONG',
      mavaitro: vtKhachHang.mavaitro,
    },
  });

  const tkCustomer3 = await prisma.tAI_KHOAN.create({
    data: {
      mataikhoan: 6,
      tendangnhap: 'khachhang3',
      matkhau: defaultPasswordHash,
      email: 'khachhang3@gmail.com',
      trangthai: 'HOAT_DONG',
      mavaitro: vtKhachHang.mavaitro,
    },
  });

  // 4. BẢNG NHAN_VIEN & KHACH_HANG
  console.log('4. Tạo dữ liệu hồ sơ NHAN_VIEN & KHACH_HANG...');
  const nv1 = await prisma.nHAN_VIEN.create({
    data: {
      manhanvien: 1,
      hoten: 'Trần Minh Tuấn',
      sdt: '0901000002',
      diachi: '45 Lê Lợi, Quận 1, TP.HCM',
      chucvu: 'Chuyên viên bán hàng',
      mataikhoan: tkStaff1.mataikhoan,
    },
  });

  const nv2 = await prisma.nHAN_VIEN.create({
    data: {
      manhanvien: 2,
      hoten: 'Lê Thị Thu Hà',
      sdt: '0901000003',
      diachi: '88 Võ Văn Tần, Quận 3, TP.HCM',
      chucvu: 'Trưởng ca bán hàng',
      mataikhoan: tkStaff2.mataikhoan,
    },
  });

  const kh1 = await prisma.kHACH_HANG.create({
    data: {
      makhachhang: 1,
      hoten: 'Phạm Hoàng Nam',
      sdt: '0912345671',
      diachi: '12 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
      mataikhoan: tkCustomer1.mataikhoan,
    },
  });

  const kh2 = await prisma.kHACH_HANG.create({
    data: {
      makhachhang: 2,
      hoten: 'Vũ Ngọc Ánh',
      sdt: '0912345672',
      diachi: '56 Nguyễn Văn Cừ, Quận 5, TP.HCM',
      mataikhoan: tkCustomer2.mataikhoan,
    },
  });

  const kh3 = await prisma.kHACH_HANG.create({
    data: {
      makhachhang: 3,
      hoten: 'Đặng Quốc Bảo',
      sdt: '0912345673',
      diachi: '102 Hoàng Diệu, Quận 4, TP.HCM',
      mataikhoan: tkCustomer3.mataikhoan,
    },
  });

  // 5. BẢNG DANH_MUC
  console.log('5. Tạo dữ liệu DANH_MUC các dòng iPhone...');
  const dm16 = await prisma.dANH_MUC.create({
    data: {
      madanhmuc: 1,
      tendanhmuc: 'iPhone 16 Series',
      mota: 'Thế hệ iPhone 16 Series mới nhất với chip A18 / A18 Pro, nút Camera Control và Apple Intelligence.',
    },
  });

  const dm15 = await prisma.dANH_MUC.create({
    data: {
      madanhmuc: 2,
      tendanhmuc: 'iPhone 15 Series',
      mota: 'Dòng iPhone 15 Series với cổng USB-C, Dynamic Island và khung viền Titan trên dòng Pro.',
    },
  });

  const dm14 = await prisma.dANH_MUC.create({
    data: {
      madanhmuc: 3,
      tendanhmuc: 'iPhone 14 Series',
      mota: 'Dòng iPhone 14 Series hiệu năng ổn định, camera sắc nét và thời lượng pin ấn tượng.',
    },
  });

  const dm13 = await prisma.dANH_MUC.create({
    data: {
      madanhmuc: 4,
      tendanhmuc: 'iPhone 13 Series',
      mota: 'Dòng iPhone 13 Series quốc dân với mức giá dễ tiếp cận, chip A15 Bionic bền bỉ.',
    },
  });

  const dmSE = await prisma.dANH_MUC.create({
    data: {
      madanhmuc: 5,
      tendanhmuc: 'iPhone SE Series',
      mota: 'Dòng iPhone nhỏ gọn, cấu hình mạnh mẽ trong tầm giá tiết kiệm.',
    },
  });

  // 6. BẢNG SAN_PHAM & TON_KHO (Đúng 15 sản phẩm iPhone thực tế)
  console.log('6. Khởi tạo 15 sản phẩm iPhone và tồn kho tương ứng...');

  const productsData = [
    {
      masanpham: 1,
      tensanpham: 'iPhone 16 Pro Max',
      dungluong: '256GB',
      mausac: 'Titan Sa Mạc',
      giaban: 34990000,
      mota: '[SKU: IP16PM-256-DES] Màn hình Super Retina XDR 6.9 inch, Chip A18 Pro, Camera 48MP Fusion, Zoom quang 5x.',
      hinhanh: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm16.madanhmuc,
      soluongTon: 24, // Ban đầu 25, trừ 1 do đơn hàng #2 đã duyệt
    },
    {
      masanpham: 2,
      tensanpham: 'iPhone 16 Pro Max',
      dungluong: '512GB',
      mausac: 'Titan Tự Nhiên',
      giaban: 40990000,
      mota: '[SKU: IP16PM-512-NAT] Màn hình Super Retina XDR 6.9 inch, Chip A18 Pro, bộ nhớ 512GB quay ProRes 4K 120fps.',
      hinhanh: 'https://images.unsplash.com/photo-1695048132832-b41495f12eb4?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm16.madanhmuc,
      soluongTon: 15,
    },
    {
      masanpham: 3,
      tensanpham: 'iPhone 16 Pro Max',
      dungluong: '1TB',
      mausac: 'Titan Đen',
      giaban: 46990000,
      mota: '[SKU: IP16PM-1TB-BLK] Phiên bản cao cấp nhất 1TB, khung Titan cấp 5 siêu bền nhẹ.',
      hinhanh: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm16.madanhmuc,
      soluongTon: 8,
    },
    {
      masanpham: 4,
      tensanpham: 'iPhone 16 Pro',
      dungluong: '128GB',
      mausac: 'Titan Trắng',
      giaban: 28990000,
      mota: '[SKU: IP16P-128-WHT] Màn hình 6.3 inch ProMotion 120Hz, Chip A18 Pro, nút điều khiển Camera Control.',
      hinhanh: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm16.madanhmuc,
      soluongTon: 20, // Đơn #4 hủy sau khi duyệt nên 2 máy đã được hoàn trả lại kho đầy đủ (20 - 2 + 2 = 20)
    },
    {
      masanpham: 5,
      tensanpham: 'iPhone 16 Pro',
      dungluong: '256GB',
      mausac: 'Titan Tự Nhiên',
      giaban: 31990000,
      mota: '[SKU: IP16P-256-NAT] Hiệu năng đỉnh cao Chip A18 Pro với bộ nhớ tiêu chuẩn 256GB cho đồ họa ray tracing.',
      hinhanh: 'https://images.unsplash.com/photo-1695048132832-b41495f12eb4?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm16.madanhmuc,
      soluongTon: 18,
    },
    {
      masanpham: 6,
      tensanpham: 'iPhone 16 Plus',
      dungluong: '128GB',
      mausac: 'Xanh Lưu Ly',
      giaban: 25990000,
      mota: '[SKU: IP16PL-128-ULT] Màn hình lớn 6.7 inch, pin siêu trâu, Chip A18 hỗ trợ Apple Intelligence.',
      hinhanh: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm16.madanhmuc,
      soluongTon: 18, // Đơn #5 bị hủy lúc PENDING, kho giữ nguyên không đổi
    },
    {
      masanpham: 7,
      tensanpham: 'iPhone 16',
      dungluong: '128GB',
      mausac: 'Hồng',
      giaban: 22990000,
      mota: '[SKU: IP16-128-PNK] Thiết kế camera dọc mới, nút Action Button và Camera Control hiện đại.',
      hinhanh: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm16.madanhmuc,
      soluongTon: 30, // Đơn #1 đang PENDING, kho chưa trừ nên vẫn giữ nguyên 30
    },
    {
      masanpham: 8,
      tensanpham: 'iPhone 16',
      dungluong: '256GB',
      mausac: 'Đen',
      giaban: 25490000,
      mota: '[SKU: IP16-256-BLK] Tông đen cá tính, màn hình Ceramic Shield thế hệ mới nhất cứng hơn 50%.',
      hinhanh: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm16.madanhmuc,
      soluongTon: 22,
    },
    {
      masanpham: 9,
      tensanpham: 'iPhone 15 Pro Max',
      dungluong: '256GB',
      mausac: 'Titan Tự Nhiên',
      giaban: 29490000,
      mota: '[SKU: IP15PM-256-NAT] Khung viền Titan, chip A17 Pro 3nm, camera tiềm vọng 5x, cổng USB-C 3.',
      hinhanh: 'https://images.unsplash.com/photo-1695048132832-b41495f12eb4?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm15.madanhmuc,
      soluongTon: 11, // Ban đầu 12, trừ 1 do đơn hàng #3 đã duyệt
    },
    {
      masanpham: 10,
      tensanpham: 'iPhone 15 Pro Max',
      dungluong: '512GB',
      mausac: 'Titan Xanh',
      giaban: 34990000,
      mota: '[SKU: IP15PM-512-BLU] Phiên bản 512GB màu Titan Xanh sang trọng, hiệu năng đỉnh cao.',
      hinhanh: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm15.madanhmuc,
      soluongTon: 6,
    },
    {
      masanpham: 11,
      tensanpham: 'iPhone 15 Pro',
      dungluong: '128GB',
      mausac: 'Titan Đen',
      giaban: 24990000,
      mota: '[SKU: IP15P-128-BLK] Màn hình 6.1 inch 120Hz mượt mà, khung viền Titan siêu nhẹ.',
      hinhanh: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm15.madanhmuc,
      soluongTon: 14,
    },
    {
      masanpham: 12,
      tensanpham: 'iPhone 15',
      dungluong: '128GB',
      mausac: 'Xanh Lá',
      giaban: 19490000,
      mota: '[SKU: IP15-128-GRN] Camera chính 48MP sắc nét, Dynamic Island, cổng sạc USB-C tiện lợi.',
      hinhanh: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm15.madanhmuc,
      soluongTon: 25,
    },
    {
      masanpham: 13,
      tensanpham: 'iPhone 14',
      dungluong: '128GB',
      mausac: 'Tím',
      giaban: 15990000,
      mota: '[SKU: IP14-128-PUR] Thiết kế nhỏ gọn 6.1 inch, camera chụp đêm ấn tượng.',
      hinhanh: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm14.madanhmuc,
      soluongTon: 15, // Ban đầu 16, trừ 1 do đơn hàng #3 đã duyệt
    },
    {
      masanpham: 14,
      tensanpham: 'iPhone 13',
      dungluong: '128GB',
      mausac: 'Trắng Starlight',
      giaban: 13490000,
      mota: '[SKU: IP13-128-STA] Mẫu iPhone bán chạy nhất phân khúc tầm trung, hiệu năng mượt mà.',
      hinhanh: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
      trangthai: 'DANG_BAN',
      madanhmuc: dm13.madanhmuc,
      soluongTon: 25,
    },
    {
      masanpham: 15,
      tensanpham: 'iPhone 13 Pro Max',
      dungluong: '128GB',
      mausac: 'Xanh Alpine',
      giaban: 21990000,
      mota: '[SKU: IP13PM-128-ALP] Sản phẩm đã ngừng kinh doanh (Soft Delete) - ẩn khỏi trang khách hàng nhưng bảo toàn lịch sử đơn hàng.',
      hinhanh: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
      trangthai: 'NGUNG_KINH_DOANH', // Minh chứng quy tắc Soft Delete của TV2
      madanhmuc: dm13.madanhmuc,
      soluongTon: 0,
    },
  ];

  for (const item of productsData) {
    const { soluongTon, ...pData } = item;
    await prisma.sAN_PHAM.create({
      data: {
        ...pData,
        TON_KHO: {
          create: {
            soluong: soluongTon,
            ngaycapnhat: new Date('2026-11-10T08:00:00Z'),
          },
        },
      },
    });
  }

  // 7. BẢNG GIO_HANG & CHI_TIET_GIO_HANG
  console.log('7. Tạo dữ liệu mẫu GIO_HANG...');
  await prisma.gIO_HANG.create({
    data: {
      magiohang: 1,
      makhachhang: kh1.makhachhang,
      CHI_TIET_GIO_HANG: {
        create: {
          masanpham: 4, // iPhone 16 Pro 128GB
          soluong: 1,
          dongia: 28990000,
        },
      },
    },
  });

  await prisma.gIO_HANG.create({
    data: {
      magiohang: 2,
      makhachhang: kh2.makhachhang,
      CHI_TIET_GIO_HANG: {
        create: {
          masanpham: 12, // iPhone 15 128GB
          soluong: 1,
          dongia: 19490000,
        },
      },
    },
  });

  // 8. ĐƠN HÀNG ĐẠI DIỆN 4 TRƯỜNG HỢP NGHIỆP VỤ & HÓA ĐƠN TƯƠNG ỨNG
  console.log('8. Khởi tạo 4 trường hợp nghiệp vụ đơn hàng & hóa đơn...');

  // --------------------------------------------------------------------------
  // TRƯỜNG HỢP 1: ĐƠN HÀNG PENDING (Chờ duyệt)
  // - Trạng thái: CHO_XAC_NHAN
  // - Chưa có nhân viên duyệt (manhanvien: null)
  // - Tồn kho CHƯA bị trừ (kho SP #7 giữ nguyên 30 máy)
  // - CHƯA phát sinh hóa đơn
  // --------------------------------------------------------------------------
  console.log('  -> Case 1: Đơn hàng PENDING (#1) - Chưa duyệt, không có hóa đơn');
  await prisma.dON_HANG.create({
    data: {
      madonhang: 1,
      makhachhang: kh1.makhachhang,
      manhanvien: null,
      ngaydat: new Date('2026-11-20T09:15:00Z'),
      ngayxacnhan: null,
      tongtien: 22990000,
      phuongthucthanhtoan: 'COD',
      trangthai: 'CHO_XAC_NHAN',
      CHI_TIET_DON_HANG: {
        create: {
          masanpham: 7, // iPhone 16 128GB Hồng
          soluong: 1,
          dongia: 22990000,
          thanhtien: 22990000,
        },
      },
    },
  });

  // --------------------------------------------------------------------------
  // TRƯỜNG HỢP 2: ĐƠN HÀNG APPROVED (Đã duyệt thành công)
  // - Trạng thái: HOAN_THANH
  // - Nhân viên NV1 duyệt (manhanvien: 1)
  // - Tồn kho ĐÃ BỊ TRỪ (SP #1 trừ 1 máy từ 25 -> 24)
  // - TỰ ĐỘNG SINH HÓA ĐƠN với trạng thái ISSUED
  // --------------------------------------------------------------------------
  console.log('  -> Case 2: Đơn hàng APPROVED (#2, #3) - Đã duyệt, hóa đơn ISSUED');
  const dh2 = await prisma.dON_HANG.create({
    data: {
      madonhang: 2,
      makhachhang: kh2.makhachhang,
      manhanvien: nv1.manhanvien,
      ngaydat: new Date('2026-11-12T10:00:00Z'),
      ngayxacnhan: new Date('2026-11-12T10:15:00Z'),
      tongtien: 34990000,
      phuongthucthanhtoan: 'CHUYEN_KHOAN',
      trangthai: 'HOAN_THANH',
      CHI_TIET_DON_HANG: {
        create: {
          masanpham: 1, // iPhone 16 Pro Max 256GB
          soluong: 1,
          dongia: 34990000,
          thanhtien: 34990000,
        },
      },
    },
  });

  await prisma.hOA_DON.create({
    data: {
      mahoadon: 1,
      madonhang: dh2.madonhang,
      ngaylap: new Date('2026-11-12T10:20:00Z'),
      tongtien: 34990000,
      hinhthuctt: 'CHUYEN_KHOAN',
      trangthai: 'ISSUED',
      manhanvien: nv1.manhanvien,
    },
  });

  const dh3 = await prisma.dON_HANG.create({
    data: {
      madonhang: 3,
      makhachhang: kh3.makhachhang,
      manhanvien: nv2.manhanvien,
      ngaydat: new Date('2026-11-14T14:30:00Z'),
      ngayxacnhan: new Date('2026-11-14T14:45:00Z'),
      tongtien: 45480000,
      phuongthucthanhtoan: 'COD',
      trangthai: 'HOAN_THANH',
      CHI_TIET_DON_HANG: {
        create: [
          {
            masanpham: 9, // iPhone 15 Pro Max 256GB
            soluong: 1,
            dongia: 29490000,
            thanhtien: 29490000,
          },
          {
            masanpham: 13, // iPhone 14 128GB
            soluong: 1,
            dongia: 15990000,
            thanhtien: 15990000,
          },
        ],
      },
    },
  });

  await prisma.hOA_DON.create({
    data: {
      mahoadon: 2,
      madonhang: dh3.madonhang,
      ngaylap: new Date('2026-11-14T14:50:00Z'),
      tongtien: 45480000,
      hinhthuctt: 'COD',
      trangthai: 'ISSUED',
      manhanvien: nv2.manhanvien,
    },
  });

  // --------------------------------------------------------------------------
  // TRƯỜNG HỢP 3: ĐƠN HÀNG CANCELLED SAU KHI APPROVED (Đã duyệt rồi bị hủy)
  // - Trạng thái: DA_HUY
  // - Từng được NV1 duyệt, sau đó đơn hàng bị hủy
  // - Tồn kho: 2 máy SP #4 ĐÃ ĐƯỢC HOÀN TRẢ LẠI KHO (tồn kho vẫn bảo toàn 20 máy)
  // - HÓA ĐƠN TƯƠNG ỨNG ĐƯỢC CHUYỂN SANG TRẠNG THÁI VOID
  // --------------------------------------------------------------------------
  console.log('  -> Case 3: Đơn hàng CANCELLED sau APPROVED (#4) - Hóa đơn bị VOID, kho hoàn trả');
  const dh4 = await prisma.dON_HANG.create({
    data: {
      madonhang: 4,
      makhachhang: kh1.makhachhang,
      manhanvien: nv1.manhanvien,
      ngaydat: new Date('2026-11-05T08:00:00Z'),
      ngayxacnhan: new Date('2026-11-05T08:30:00Z'),
      tongtien: 57980000,
      phuongthucthanhtoan: 'CHUYEN_KHOAN',
      trangthai: 'DA_HUY', // Đã duyệt rồi bị hủy
      CHI_TIET_DON_HANG: {
        create: {
          masanpham: 4, // iPhone 16 Pro 128GB (2 máy)
          soluong: 2,
          dongia: 28990000,
          thanhtien: 57980000,
        },
      },
    },
  });

  await prisma.hOA_DON.create({
    data: {
      mahoadon: 3,
      madonhang: dh4.madonhang,
      ngaylap: new Date('2026-11-05T08:35:00Z'),
      tongtien: 57980000,
      hinhthuctt: 'CHUYEN_KHOAN',
      trangthai: 'VOID', // Đã bị hủy hóa đơn do đơn hàng bị hủy
      manhanvien: nv1.manhanvien,
    },
  });

  // --------------------------------------------------------------------------
  // TRƯỜNG HỢP 4: ĐƠN HÀNG CANCELLED KHI CÒN PENDING (Khách hủy lúc chờ duyệt)
  // - Trạng thái: DA_HUY
  // - Chưa có nhân viên duyệt (manhanvien: null)
  // - Tồn kho KHÔNG BỊ ẢNH HƯỞNG (SP #6 giữ nguyên 18 máy)
  // - HOÀN TOÀN KHÔNG PHÁT SINH HÓA ĐƠN
  // --------------------------------------------------------------------------
  console.log('  -> Case 4: Đơn hàng CANCELLED khi PENDING (#5) - Không có hóa đơn, kho giữ nguyên');
  await prisma.dON_HANG.create({
    data: {
      madonhang: 5,
      makhachhang: kh2.makhachhang,
      manhanvien: null,
      ngaydat: new Date('2026-11-18T16:00:00Z'),
      ngayxacnhan: null,
      tongtien: 25990000,
      phuongthucthanhtoan: 'COD',
      trangthai: 'DA_HUY',
      CHI_TIET_DON_HANG: {
        create: {
          masanpham: 6, // iPhone 16 Plus 128GB
          soluong: 1,
          dongia: 25990000,
          thanhtien: 25990000,
        },
      },
    },
  });

  // 9. BẢNG BAO_CAO_DOANH_THU
  // Doanh thu ròng chỉ tính từ hóa đơn ISSUED (HĐ #1: 34.990.000 + HĐ #2: 45.480.000 = 80.470.000)
  // LOẠI TRỪ HÓA ĐƠN VOID #3 (57.980.000)
  console.log('9. Khởi tạo BAO_CAO_DOANH_THU chuẩn xác (loại trừ VOID)...');
  await prisma.bAO_CAO_DOANH_THU.create({
    data: {
      mabaocao: 1,
      ngaybatdau: new Date('2026-11-01T00:00:00Z'),
      ngayketthuc: new Date('2026-11-15T23:59:59Z'),
      tongdoanhthu: 80470000, // 34.990.000 + 45.480.000 (đúng hóa đơn ISSUED)
      tongsodonhang: 2,       // Chỉ tính 2 đơn thành công
      soluongsanphamdaban: 3, // 1 máy SP #1 + 1 máy SP #9 + 1 máy SP #13
    },
  });

  const serialColumns = [
    ['VAI_TRO', 'mavaitro'],
    ['TAI_KHOAN', 'mataikhoan'],
    ['NHAN_VIEN', 'manhanvien'],
    ['KHACH_HANG', 'makhachhang'],
    ['DANH_MUC', 'madanhmuc'],
    ['SAN_PHAM', 'masanpham'],
    ['TON_KHO', 'matonkho'],
    ['GIO_HANG', 'magiohang'],
    ['CHI_TIET_GIO_HANG', 'machitietgio'],
    ['DON_HANG', 'madonhang'],
    ['CHI_TIET_DON_HANG', 'machitiet'],
    ['HOA_DON', 'mahoadon'],
    ['BAO_CAO_DOANH_THU', 'mabaocao'],
  ] as const;

  for (const [table, column] of serialColumns) {
    await prisma.$queryRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', '${column}'), COALESCE((SELECT MAX("${column}") FROM "${table}"), 1), true)`,
    );
  }

  console.log('--- [TV5] Hoàn tất khởi tạo dữ liệu mẫu thành công cho 13 bảng! ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi chạy seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
