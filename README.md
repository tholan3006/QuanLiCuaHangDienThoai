# Quản Lý Cửa Hàng Điện Thoại

## Cấu trúc thư mục 

```text
QuanLiCuaHangDienThoai/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/                 # TV2: Lịch sử thay đổi CSDL
│   │   ├── schema.prisma               # TV2: Thiết kế cấu trúc CSDL
│   │   └── seed.ts                     # TV5: Khởi tạo dữ liệu demo
│   │
│   ├── src/
│   │   ├── common/                     # TV1: Xác thực, phân quyền dùng chung
│   │   ├── prisma/                     # TV2: Kết nối và truy vấn CSDL
│   │   ├── auth/                       # TV1: Đăng ký, đăng nhập
│   │   ├── users/                      # TV1: Quản lý tài khoản, phân quyền Admin
│   │   ├── catalog/                    # TV2: Quản lý danh mục, sản phẩm
│   │   │   ├── categories/
│   │   │   └── products/
│   │   ├── orders/                     # TV4: Quản lý đơn hàng, cập nhật tồn kho
│   │   ├── invoices/                   # TV5: Quản lý hóa đơn bán hàng
│   │   ├── reports/                    # TV5: Thống kê, báo cáo bán hàng
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── public/                         # Tài nguyên tĩnh: hình ảnh, logo
│   │
│   ├── app/
│   │   ├── (auth)/                     # TV1: Giao diện đăng nhập, đăng ký
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── (store)/                    # TV3: Giao diện mua hàng
│   │   │   ├── page.tsx                # Trang chủ
│   │   │   ├── products/
│   │   │   │   ├── page.tsx            # Danh sách, tìm kiếm, lọc sản phẩm
│   │   │   │   └── [id]/page.tsx       # Chi tiết sản phẩm
│   │   │   ├── cart/page.tsx           # Giỏ hàng
│   │   │   └── checkout/page.tsx       # Đặt hàng
│   │   │
│   │   ├── (account)/                  # TV4: Tài khoản khách hàng
│   │   │   └── my-orders/page.tsx      # Lịch sử mua hàng
│   │   │
│   │   ├── admin/                      # TV1: Giao diện quản trị Admin
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── users/page.tsx          # Quản lý tài khoản
│   │   │
│   │   ├── staff/                      # Giao diện nhân viên bán hàng
│   │   │   ├── layout.tsx
│   │   │   ├── products/page.tsx       # TV2: Quản lý sản phẩm
│   │   │   ├── orders/page.tsx         # TV4: Duyệt, hủy đơn hàng
│   │   │   ├── invoices/page.tsx       # TV5: Hóa đơn bán hàng
│   │   │   └── dashboard/page.tsx      # TV5: Thống kê bán hàng
│   │   │
│   │   ├── layout.tsx                  # Layout gốc
│   │   └── globals.css                 # CSS toàn hệ thống
│   │
│   ├── components/                     # Các thành phần giao diện
│   │   ├── shared/                     # Dùng chung toàn hệ thống (các TV phối hợp, TV3 thống nhất)
│   │   ├── store/                      # TV3: Thành phần giao diện mua hàng
│   │   ├── admin/                      # TV1: Thành phần giao diện Admin
│   │   └── staff/                      # Thành phần giao diện nhân viên
│   │       ├── products/               # TV2: Thành phần quản lý sản phẩm
│   │       ├── orders/                 # TV4: Thành phần quản lý đơn hàng
│   │       ├── invoices/               # TV5: Thành phần hóa đơn
│   │       └── dashboard/              # TV5: Thành phần thống kê
│   │
│   ├── services/                       # Các API gọi Backend
│   │   ├── auth.api.ts                 # TV1: Xác thực
│   │   ├── users.api.ts                # TV1: Quản lý tài khoản
│   │   ├── categories.api.ts           # TV2: Danh mục
│   │   ├── products.api.ts             # TV2: Sản phẩm
│   │   ├── orders.api.ts               # TV4: Đơn hàng
│   │   ├── invoices.api.ts             # TV5: Hóa đơn
│   │   └── reports.api.ts              # TV5: Thống kê
│   │
│   ├── lib/
│   │   └── api-client.ts               # HTTP Client dùng chung
│   │
│   ├── stores/
│   │   └── cart.store.ts               # TV3: Quản lý trạng thái giỏ hàng
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docs/
│   ├── diagrams/                       # ERD, BFD, DFD
│   ├── screenshots/                    # Ảnh giao diện, kiểm thử
│   └── report/                         # Báo cáo Word/PDF (cả nhóm, TV5 tổng hợp)
│
├── database_script.sql                 # TV2: Cấu trúc CSDL, TV5: Dữ liệu demo
├── readme.txt                          # TV5: Thông tin thành viên nhóm
├── README.md                           # Hướng dẫn cài đặt, sử dụng dự án
└── .gitignore                          # Cấu hình loại trừ file Git
```

## Công nghệ sử dụng

- **CSDL:** PostgreSQL + Prisma ORM + DBeaver
- **Backend:** NestJS (TypeScript) + REST API + JWT + Swagger
- **Frontend:** Next.js (TS) + TailwindCSS + Zustand (Giỏ hàng)
- **Giao diện Admin/Staff:** Ant Design (AntD)
- **In ấn & Chart:** react-to-print (In hóa đơn) + Chart.js (Biểu đồ)
- **Vẽ sơ đồ báo cáo:** Draw.io + dbdiagram.io
- **Quản lý code:** GitHub


---

## Hướng dẫn cài đặt và chạy dự án (Thành viên 2: CSDL & Quản lý Danh mục, Sản phẩm)

### 1. Khởi tạo Cơ sở dữ liệu PostgreSQL
- **Cách 1 (Chạy trực tiếp trên DBeaver / pgAdmin):**
  Mở file `database_script.sql` và thực thi toàn bộ script để tạo 13 bảng dữ liệu, ràng buộc `PK`, `FK`, `UNIQUE`, `CHECK` và dữ liệu mẫu.
- **Cách 2 (Chạy qua Prisma ORM tại thư mục `backend/`):**
  ```bash
  cd backend
  cp .env.example .env
  npm install
  npm run prisma:generate
  npm run prisma:migrate
  npm run prisma:seed
  ```

### 2. Chạy Backend (NestJS + Swagger API)
```bash
cd backend
npm run start:dev
```
- REST API: `http://localhost:4000/api`
- Swagger Docs: `http://localhost:4000/api/docs`

### 3. Chạy Frontend (Next.js)
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
- Giao diện Trang chủ Mua sắm (Khách hàng - TV3): `http://localhost:3000`
- Giao diện Danh sách & Lọc Sản phẩm (Khách hàng - TV3): `http://localhost:3000/products`
- Giao diện Chi tiết Sản phẩm & Biến thể (Khách hàng - TV3): `http://localhost:3000/products/1`
- Giao diện Giỏ hàng (Khách hàng - TV3): `http://localhost:3000/cart`
- Giao diện Đặt hàng & Thanh toán (Khách hàng - TV3): `http://localhost:3000/checkout`
- Giao diện Quản lý Sản phẩm (Nhân viên - TV2): `http://localhost:3000/staff/products`
- Giao diện Quản lý Đơn hàng (Nhân viên - TV4): `http://localhost:3000/staff/orders`
- Giao diện Hóa đơn Bán hàng (Nhân viên - TV5): `http://localhost:3000/staff/invoices`
- Giao diện Dashboard Thống kê (Nhân viên - TV5): `http://localhost:3000/staff/dashboard`

---

## Hướng dẫn Kiểm thử Phân hệ Khách hàng & Quy trình Mua sắm (Thành viên 3 - Mục A3: 20 Điểm)

Phân hệ **Storefront & Quy trình Mua sắm** phụ trách toàn bộ luồng trải nghiệm khách hàng từ khi xem sản phẩm đến khi đặt hàng thành công:

### 1. Duyệt sản phẩm & Tìm kiếm Autocomplete tức thời
- Truy cập `http://localhost:3000` (Trang chủ iStore) hoặc `http://localhost:3000/products`.
- **Hero Banner:** Trình chiếu iPhone 16 Pro Max Titan Sa Mạc hòa nền xanh navy sang trọng, không có viền hộp hay nền trắng.
- **Tìm kiếm tức thì (Live Autocomplete):** Gõ từng ký tự vào thanh tìm kiếm trên Navbar (VD: `Pro Max`, `Sa Mạc`, `Hồng`...), danh sách gợi ý xổ xuống tức thì kèm hình ảnh thu nhỏ, phiên bản, giá bán và tình trạng kho.
- **Bộ lọc sản phẩm:** Lọc theo Dòng máy (iPhone 16, 15, 14, 13), theo Dung lượng (128GB, 256GB, 512GB, 1TB) và theo Khoảng giá bán.
- **Quy tắc an toàn:** Tự động ẩn các sản phẩm ngừng kinh doanh (`trangthai = 'NGUNG_KINH_DOANH'`).

### 2. Chi tiết sản phẩm & Biến thể (Màu sắc, Dung lượng, Tồn kho)
- Truy cập `http://localhost:3000/products/1`:
- Xem thư viện hình ảnh studio chính hãng chuẩn Apple đã được xử lý nền trong suốt.
- Bấm chọn các nút **Dung lượng** và **Màu sắc**: Trang tự động chuyển sang biến thể tương ứng, cập nhật giá và tồn kho tức thời.
- **Chặn vượt tồn kho:** Bộ đếm số lượng (+ / -) tự động khóa khi đạt số lượng tồn kho tối đa (`soluongton`).
- **Hỗ trợ song ngữ VI / EN:** Bấm nút chuyển ngôn ngữ trên Navbar để đổi giao diện và bảng dịch màu chuẩn Apple (Titan Sa Mạc / Desert Titanium, Xanh Lưu Ly / Ultramarine...).

### 3. Giỏ hàng & Kiểm soát tồn kho (Zustand + LocalStorage)
- Truy cập `http://localhost:3000/cart`:
- Giỏ hàng lưu trữ bền vững tại LocalStorage (`iphone_cart_v1`), không bị mất khi F5 hoặc tắt trình duyệt.
- Tăng / giảm số lượng có kiểm tra tồn kho realtime. Nếu vượt quá tồn kho sẽ có thông báo Toast cảnh báo.
- Cho phép xóa từng món hoặc làm rỗng toàn bộ giỏ hàng.

### 4. Quy trình Đặt hàng (Checkout) & Đối chiếu API
- Truy cập `http://localhost:3000/checkout`:
- **Bắt buộc Đăng nhập Khách hàng:** Nếu chưa đăng nhập, hệ thống sẽ chặn và bật Modal Đăng nhập. Có sẵn tính năng **1-Click Đăng nhập nhanh tài khoản mẫu** (`khachhang1`, `khachhang2`, `khachhang3` - Mật khẩu: `123456`).
- **Đối chiếu Giá bán & Tồn kho từ API:** Ngay tại thời điểm mở trang Checkout, hệ thống tự động kiểm tra lại dữ liệu mới nhất từ CSDL. Nếu có sản phẩm đổi giá, hết hàng hoặc ngừng bán, hệ thống phát cảnh báo và khóa nút gửi đơn.
- **Phương thức thanh toán:** Hỗ trợ thanh toán tiền mặt (COD) hoặc Chuyển khoản ngân hàng VietQR.
- **Tạo đơn hàng:** Gửi yêu cầu tới Backend `POST /orders`, đơn hàng được tạo ở trạng thái `CHO_XAC_NHAN` (chưa trừ kho), giỏ hàng tự động được làm rỗng.

### 5. Phân quyền nghiệp vụ RBAC Storefront
- **Khách hàng (`KHACH_HANG`):** Sử dụng đầy đủ tính năng Giỏ hàng và Đặt hàng.
- **Nhân viên (`NHAN_VIEN`) / Quản trị viên (`ADMIN`):** Không mua hàng trên Storefront. Navbar tự động ẩn Giỏ hàng và thay bằng nút truy cập nhanh **Staff Portal** / **Admin Portal**; các trang `/cart` và `/checkout` có màn hình bảo vệ hướng dẫn nhân viên về đúng cổng quản trị.

---

## Hướng dẫn Kiểm thử Phân hệ Hóa đơn & Thống kê 

1. **Quản lý Hóa đơn Bán hàng (`/staff/invoices`):**
   - Đăng nhập tài khoản nhân viên: `nhanvien1` / `123456`.
   - Tìm kiếm, lọc theo ngày, theo trạng thái `ISSUED` (Hợp lệ) và `VOID` (Đã hủy).
   - Bấm nút **In A4** để xem chi tiết và in hóa đơn khổ chuẩn A4 qua `react-to-print`.

2. **Dashboard Báo cáo & Thống kê (`/staff/dashboard`):**
   - Xem tổng doanh thu bán ròng (tự động loại bỏ hoàn toàn các hóa đơn `VOID`).
   - Xem biểu đồ đường biến động doanh thu theo thời gian (`Chart.js`).
   - Xem danh sách Top 5 sản phẩm iPhone bán chạy nhất và tỷ lệ đơn hàng bị hủy.
