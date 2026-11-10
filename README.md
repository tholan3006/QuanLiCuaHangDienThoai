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
- Giao diện Quản lý Sản phẩm (Nhân viên - TV2): `http://localhost:3000/staff/products`
- Giao diện Danh sách Sản phẩm (Khách hàng): `http://localhost:3000/products`
