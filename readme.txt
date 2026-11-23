================================================================================
                    TRƯỜNG ĐẠI HỌC SÀI GÒN - KHOA CÔNG NGHỆ THÔNG TIN
             BÁO CÁO ĐỒ ÁN HỌC PHẦN: PHÂN TÍCH THIẾT KẾ HỆ THỐNG THÔNG TIN
================================================================================

TÊN ĐỀ TÀI:
HỆ THỐNG QUẢN LÝ VÀ BÁN HÀNG CỬA HÀNG ĐIỆN THOẠI IPHONE (IPHONE STORE VN)

1. THÔNG TIN THÀNH VIÊN VÀ PHÂN CÔNG KHỐI LƯỢNG CÔNG VIỆC:
--------------------------------------------------------------------------------
STT | Họ và Tên            | MSSV       | Vai trò & Nhiệm vụ chính phụ trách          | Tỷ lệ (%)
----+----------------------+------------+---------------------------------------------+-----------
 1  | [Thành viên 1]       | 312xxxxxxx | TV1: Quản trị tài khoản & Phân quyền        |   100%
 2  | [Thành viên 2]       | 312xxxxxxx | TV2: Quản trị CSDL & Quản lý Sản phẩm       |   100%
 3  | [Thành viên 3]       | 312xxxxxxx | TV3: Giao diện Khách hàng & Giỏ hàng        |   100%
 4  | [Thành viên 4]       | 312xxxxxxx | TV4: Quản lý Đơn hàng & Nghiệp vụ Tồn kho   |   100%
 5  | Phan Việt Quang      | 312xxxxxxx | TV5: Quản lý Hóa đơn, Thống kê & Demo Data  |   100%
--------------------------------------------------------------------------------

2. CÔNG NGHỆ ÁP DỤNG TRONG ĐỒ ÁN:
--------------------------------------------------------------------------------
- Cơ sở dữ liệu:     PostgreSQL 16 + Prisma ORM (13 bảng dữ liệu quan hệ)
- Backend API:       NestJS 10 (TypeScript) + REST API + JWT + Swagger UI
- Frontend:          Next.js 14 (App Router, TypeScript) + TailwindCSS
- Quản lý State:     Zustand (Giỏ hàng & Session)
- Giao diện Admin:   Ant Design (AntD v5)
- In ấn & Thống kê:  react-to-print (In hóa đơn khổ A4) + Chart.js (Biểu đồ)
- Quản lý phiên bản: GitHub

3. DANH SÁCH TÀI KHOẢN DÙNG ĐỂ TEST VÀ DEMO HỆ THỐNG:
(Tất cả tài khoản đều có mật khẩu mặc định: 123456)
--------------------------------------------------------------------------------
Vai trò (Role)   | Tên đăng nhập | Email                 | Quyền hạn & Chức năng kiểm thử
-----------------+---------------+-----------------------+---------------------------------------------
1. Quản trị viên | admin         | admin@iphonestore.vn  | Toàn quyền quản trị tài khoản, cấu hình
2. Nhân viên     | nhanvien1     | nhanvien1@iphonestore.vn| Duyệt/hủy đơn, quản lý SP, in HĐ, thống kê
3. Nhân viên     | nhanvien2     | nhanvien2@iphonestore.vn| Quản lý kho, xử lý đơn, tra cứu giao dịch
4. Khách hàng    | khachhang1    | khachhang1@gmail.com  | Tìm kiếm SP, giỏ hàng, đặt hàng, xem đơn mua
5. Khách hàng    | khachhang2    | khachhang2@gmail.com  | Đặt đơn chuyển khoản, xem lịch sử mua sắm
6. Khách hàng    | khachhang3    | khachhang3@gmail.com  | Đặt đơn COD, kiểm tra tình trạng đơn hàng

4. CÁC TRƯỜNG HỢP NGHIỆP VỤ MẪU ĐÃ ĐƯỢC THIẾT LẬP SẴN TRONG CSDL:
--------------------------------------------------------------------------------
- TH1: Đơn hàng PENDING (#1) - Trạng thái CHO_XAC_NHAN, kho SP #7 chưa bị trừ, chưa có hóa đơn.
- TH2: Đơn hàng APPROVED (#2, #3) - Đã duyệt thành công, kho đã trừ chính xác, phát sinh hóa đơn ISSUED #1 và #2.
- TH3: Đơn hàng CANCELLED sau APPROVED (#4) - Hủy sau khi duyệt: kho đã hoàn trả đủ 2 máy SP #4, hóa đơn #3 chuyển sang trạng thái VOID.
- TH4: Đơn hàng CANCELLED khi PENDING (#5) - Hủy lúc chờ duyệt: kho giữ nguyên, không có hóa đơn.
- Doanh thu bán ròng trên Dashboard tự động loại trừ hóa đơn VOID (chỉ tính 80.470.000 VNĐ từ các hóa đơn ISSUED).

5. HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY HỆ THỐNG:
--------------------------------------------------------------------------------
Bước 1: Thiết lập CSDL PostgreSQL
- Tạo database tên: iphonestore_db
- Chạy toàn bộ script trong file: database_script.sql

Bước 2: Cài đặt và chạy Backend (NestJS)
- cd backend
- Cấu hình file .env:
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/iphonestore_db?schema=public"
  PORT=4000
- Cài đặt thư viện: npm install
- Sinh client Prisma: npx prisma generate
- Khởi chạy server: npm run start:dev
- Truy cập Swagger API Docs: http://localhost:4000/api/docs

Bước 3: Cài đặt và chạy Frontend (Next.js)
- cd frontend
- Cấu hình file .env.local:
  NEXT_PUBLIC_API_URL="http://localhost:4000/api"
- Cài đặt thư viện: npm install
- Khởi chạy frontend: npm run dev
- Truy cập giao diện:
  + Trang bán hàng khách hàng: http://localhost:3000
  + Trang nhân viên bán hàng:  http://localhost:3000/staff/dashboard
  + Trang tra cứu & in hóa đơn: http://localhost:3000/staff/invoices
  + Trang quản trị hệ thống:   http://localhost:3000/admin

================================================================================
