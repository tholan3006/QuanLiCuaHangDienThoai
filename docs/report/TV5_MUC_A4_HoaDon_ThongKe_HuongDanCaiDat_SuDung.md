# BÁO CÁO ĐỒ ÁN - THÀNH VIÊN 5
## PHÂN HỆ: QUẢN LÝ HÓA ĐƠN, BÁO CÁO THỐNG KÊ & DỮ LIỆU DEMO

---

**Học phần:** Phân tích và Thiết kế Hệ thống Thông tin  
**Đề tài:** Hệ Thống Quản Lý Và Bán Hàng Cửa Hàng Điện Thoại iPhone (iPhone Store VN)  
**Sinh viên thực hiện:** Phan Việt Quang (Thành viên 5)  
**Phạm vi phụ trách:**
- **Mục A4:** Quản lý hóa đơn bán hàng, in ấn khổ A4, xem thống kê & báo cáo bán hàng (20 điểm).
- **Hỗ trợ Mục II.1:** Thiết kế CSDL, khởi tạo 15 sản phẩm iPhone & chuẩn bị dữ liệu demo cho 4 trường hợp nghiệp vụ đơn hàng.
- **Mục I.4:** Phương án cài đặt, hướng dẫn sử dụng, ưu/nhược điểm & hướng phát triển (10 điểm).

---

## 1. TỔNG QUAN PHÂN HỆ QUẢN LÝ HÓA ĐƠN VÀ THỐNG KÊ DOANH THU

### 1.1. Mục tiêu và Ý nghĩa Nghiệp vụ
Phân hệ Quản lý Hóa đơn và Báo cáo Thống kê đóng vai trò then chốt trong chu trình kinh doanh của hệ thống bán lẻ iPhone:
1. **Minh bạch tài chính:** Mỗi đơn hàng khi được nhân viên duyệt thành công (`APPROVED`) sẽ tự động phát sinh một hóa đơn hợp lệ (`ISSUED`), ghi nhận chính xác thời điểm xuất hàng, nhân viên lập phiếu, chi tiết sản phẩm và tổng giá trị thanh toán.
2. **Xử lý thu hồi / Hủy giao dịch (VOID Transaction):** Khi một đơn hàng đã duyệt nhưng phát sinh yêu cầu hủy từ khách hàng hoặc sự cố giao hàng, hệ thống tiến hành hoàn trả toàn bộ số lượng sản phẩm về kho (`TON_KHO`), đồng thời tự động cập nhật trạng thái hóa đơn sang **`VOID`** để bảo toàn tính toàn vẹn và lịch sử kiểm toán của hệ thống kế toán.
3. **Thống kê kinh doanh chuẩn xác:** Doanh thu bán ròng (*Net Revenue*) và số lượng sản phẩm bán ra được tính toán chặt chẽ bằng cách **loại bỏ hoàn toàn** các hóa đơn mang trạng thái `VOID`, bảo đảm số liệu báo cáo không bị thổi phồng.
4. **Hỗ trợ in ấn chứng từ chuyên nghiệp:** Cung cấp mẫu hóa đơn bán hàng chuẩn khổ A4 sắc nét bằng `react-to-print`, tích hợp đầy đủ thông tin nhận diện thương hiệu, thông tin khách hàng, số IMEI/SKU sản phẩm và điều khoản bảo hành chính hãng Apple 12 tháng.

---

## 2. DỮ LIỆU DEMO VÀ 4 TRƯỜNG HỢP NGHIỆP VỤ (DATABASE & SEED DATA)

### 2.1. Chuẩn bị 15 Sản phẩm iPhone Thực tế
Cơ sở dữ liệu được khởi tạo với 15 phiên bản iPhone đại diện cho toàn bộ các thế hệ phổ biến hiện nay:
- **iPhone 16 Series (Mã DM: 1):**
  1. *iPhone 16 Pro Max 256GB - Titan Sa Mạc* (34.990.000 ₫)
  2. *iPhone 16 Pro Max 512GB - Titan Tự Nhiên* (40.990.000 ₫)
  3. *iPhone 16 Pro Max 1TB - Titan Đen* (46.990.000 ₫)
  4. *iPhone 16 Pro 128GB - Titan Trắng* (28.990.000 ₫)
  5. *iPhone 16 Pro 256GB - Titan Tự Nhiên* (31.990.000 ₫)
  6. *iPhone 16 Plus 128GB - Xanh Lưu Ly* (25.990.000 ₫)
  7. *iPhone 16 128GB - Hồng* (22.990.000 ₫)
  8. *iPhone 16 256GB - Đen* (25.490.000 ₫)
- **iPhone 15 Series (Mã DM: 2):**
  9. *iPhone 15 Pro Max 256GB - Titan Tự Nhiên* (29.490.000 ₫)
  10. *iPhone 15 Pro Max 512GB - Titan Xanh* (34.990.000 ₫)
  11. *iPhone 15 Pro 128GB - Titan Đen* (24.990.000 ₫)
  12. *iPhone 15 128GB - Xanh Lá* (19.490.000 ₫)
- **iPhone 14 Series (Mã DM: 3):**
  13. *iPhone 14 128GB - Tím* (15.990.000 ₫)
- **iPhone 13 Series (Mã DM: 4):**
  14. *iPhone 13 128GB - Trắng Starlight* (13.490.000 ₫)
  15. *iPhone 13 Pro Max 128GB - Xanh Alpine* (21.990.000 ₫ - Trạng thái `NGUNG_KINH_DOANH` minh chứng quy tắc Soft Delete của TV2).

---

### 2.2. Minh chứng 4 Trường Hợp Nghiệp Vụ Đơn Hàng & Hóa Đơn

| Trường hợp | Mã Đơn | Trạng thái Đơn | Tác động Tồn Kho (`TON_KHO`) | Tác động Hóa Đơn (`HOA_DON`) | Giải thích nghiệp vụ |
|:---:|:---:|:---:|:---|:---|:---|
| **TH1: PENDING** *(Chờ duyệt)* | **#1** | `CHO_XAC_NHAN` | **Chưa trừ kho.** SP #7 giữ nguyên 30 máy. | **Chưa có hóa đơn.** | Khách hàng mới gửi đơn, hàng chưa xuất khỏi kho nên chưa phát sinh chứng từ thanh toán. |
| **TH2: APPROVED** *(Duyệt thành công)* | **#2, #3** | `HOAN_THANH` | **Đã trừ kho.** SP #1 trừ 1 máy (25 $\rightarrow$ 24). SP #9 trừ 1 (12 $\rightarrow$ 11), SP #13 trừ 1 (16 $\rightarrow$ 15). | **Phát sinh hóa đơn `ISSUED`.** HĐ #1: 34.990.000 ₫. HĐ #2: 45.480.000 ₫. | Nhân viên duyệt đơn, kho ghi nhận giảm, hóa đơn hợp lệ được xuất và ghi nhận vào doanh thu ròng. |
| **TH3: CANCELLED sau APPROVED** *(Hủy sau duyệt)* | **#4** | `DA_HUY` | **Đã hoàn trả đủ số lượng vào kho.** SP #4 hoàn 2 máy ($20 - 2 + 2 = 20$). | **Chuyển hóa đơn sang `VOID`.** HĐ #3: 57.980.000 ₫ (VOID). | Đơn đã duyệt nhưng bị hủy sau đó: kho phải hoàn lại hàng, hóa đơn bị thu hồi (VOID) và **không tính** vào doanh thu. |
| **TH4: CANCELLED khi PENDING** *(Hủy lúc chờ)* | **#5** | `DA_HUY` | **Kho giữ nguyên.** SP #6 giữ nguyên 18 máy. | **Hoàn toàn không có hóa đơn.** | Khách đổi ý hủy ngay khi đơn còn chờ duyệt: không trừ kho và không tạo hóa đơn. |

---

## 3. KIẾN TRÚC VÀ GIẢI PHÁP TRIỂN KHAI BACKEND

### 3.1. Cấu trúc Module Backend
```text
backend/src/
├── invoices/
│   ├── dto/
│   │   ├── create-invoice.dto.ts    # DTO tiếp nhận yêu cầu lập hóa đơn
│   │   └── filter-invoice.dto.ts    # DTO lọc hóa đơn theo ngày, trạng thái, nhân viên
│   ├── invoices.controller.ts       # Định nghĩa các REST API hóa đơn & Swagger
│   ├── invoices.service.ts          # Xử lý nghiệp vụ lập HĐ, hủy HĐ (VOID), tra cứu
│   └── invoices.module.ts           # Đóng gói InvoicesModule
└── reports/
    ├── dto/
    │   └── filter-report.dto.ts     # DTO lọc thống kê theo ngày/tháng/năm
    ├── reports.controller.ts        # REST API Dashboard, biểu đồ, top sản phẩm
    ├── reports.service.ts           # Thuật toán tổng hợp doanh thu ròng & phân tích
    └── reports.module.ts            # Đóng gói ReportsModule
```

### 3.2. Thuật toán Bảo toàn Doanh thu Ròng (Net Revenue Formula)
Doanh thu báo cáo trên hệ thống được tính theo công thức:
$$\text{Doanh thu bán ròng} = \sum_{\text{HĐ} \in \text{ISSUED}} \text{Tổng tiền(HĐ)} - 0 \quad (\text{Tuyệt đối loại bỏ } \text{HĐ} \in \text{VOID})$$

Tại CSDL demo:
- Hóa đơn #1 (ISSUED): 34.990.000 ₫
- Hóa đơn #2 (ISSUED): 45.480.000 ₫
- Hóa đơn #3 (VOID): 57.980.000 ₫ *(Bị loại bỏ hoàn toàn)*
- **Tổng doanh thu bán ròng:** $34.990.000 + 45.480.000 = \mathbf{80.470.000\text{ \VNĐ}}$.

---

## 4. GIAO DIỆN VÀ TRẢI NGHIỆM NGƯỜI DÙNG FRONTEND

### 4.1. Màn hình Quản lý Hóa đơn Bán hàng (`/staff/invoices`)
- **4 Thẻ tóm tắt:** Tổng số hóa đơn, Hóa đơn hợp lệ (`ISSUED`), Hóa đơn đã hủy (`VOID`), Tổng doanh thu ghi nhận.
- **Bộ lọc đa năng:**
  + Tìm kiếm theo Mã HĐ, Mã Đơn, Tên khách hàng, Số điện thoại.
  + Lọc theo trạng thái hóa đơn (`ISSUED`, `VOID`).
  + Lọc theo phương thức thanh toán (`COD`, `Chuyển khoản`).
  + Lọc theo khoảng ngày phát hành.
- **Bảng dữ liệu chuẩn Ant Design:** Hỗ trợ phân trang, sắp xếp và xem nhanh.
- **Nút "In A4":** Mở hộp thoại chi tiết và kích hoạt in hóa đơn khổ chuẩn A4.

### 4.2. Mẫu Hóa đơn Khổ A4 Chuyên nghiệp (`PrintableInvoice.tsx`)
- Tích hợp thư viện `react-to-print`.
- Tiêu đề thương hiệu: Logo Apple , tên cửa hàng iPhone Store VN, địa chỉ, hotline, email.
- Số hóa đơn dạng mã định dạng 6 chữ số: `#000001`, `#000002`.
- Bảng kê chi tiết sản phẩm: Tên máy, dung lượng, màu sắc, đơn giá niêm yết, số lượng, thành tiền.
- Bảng tóm tắt thuế VAT (0%), tổng tiền bằng số.
- Vùng chữ ký xác nhận của Khách hàng và Người lập phiếu.
- Điều khoản bảo hành chính hãng Apple 12 tháng.

### 4.3. Dashboard Báo cáo & Thống kê Doanh thu (`/staff/dashboard`)
- **Summary Cards:** Doanh thu ròng, tổng số máy iPhone bán được, tổng số đơn hàng, tỷ lệ hủy đơn (%).
- **Biểu đồ Đường (Line Chart - Chart.js):** Biến động doanh thu và số lượng đơn hàng theo từng ngày.
- **Top 5 Sản phẩm Bán chạy (Top Products):** Thống kê số lượng máy bán ra, thanh tiến độ so sánh và doanh thu tương ứng.
- **Cơ cấu Đơn hàng (Doughnut Chart - Chart.js):** Tỷ lệ đơn Hoàn thành / Chờ duyệt / Đã hủy và Doanh thu Chuyển khoản vs COD.

---

## 5. HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY PHẦN MỀM (MỤC I.4)

### 5.1. Yêu cầu môi trường tiên quyết
- **Node.js:** Phiên bản 18.x trở lên (khuyến nghị 20.x hoặc 24.x LTS).
- **PostgreSQL:** Phiên bản 14 trở lên (khuyến nghị 16.x).
- **Git Client.**

### 5.2. Các bước cài đặt chi tiết

#### Bước 1: Khởi tạo Cơ sở Dữ liệu
1. Mở phần mềm quản trị CSDL (pgAdmin hoặc DBeaver).
2. Tạo một database mới tên: `iphonestore_db`.
3. Mở file `database_script.sql` ở thư mục gốc của dự án và chạy toàn bộ mã SQL để tạo 13 bảng cùng dữ liệu mẫu.

#### Bước 2: Thiết lập và Chạy Backend (NestJS)
```bash
# Di chuyển vào thư mục backend
cd backend

# Cấu hình biến môi trường trong file .env (nếu chưa có hãy tạo từ .env.example)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/iphonestore_db?schema=public"
# PORT=4000

# Cài đặt các thư viện phụ thuộc
npm install

# Sinh mã Prisma Client
npx prisma generate

# Khởi chạy máy chủ Backend ở chế độ phát triển
npm run start:dev
```
- Khi chạy thành công, console sẽ hiển thị:
  + Backend API: `http://localhost:4000/api`
  + Swagger UI: `http://localhost:4000/api/docs`

#### Bước 3: Thiết lập và Chạy Frontend (Next.js)
```bash
# Mở một cửa sổ terminal mới và di chuyển vào frontend
cd frontend

# Cài đặt các thư viện phụ thuộc
npm install

# Khởi chạy máy chủ Frontend
npm run dev
```
- Truy cập trình duyệt tại:
  + Cổng nhân viên: `http://localhost:3000/staff/dashboard` (Xem thống kê)
  + Quản lý hóa đơn: `http://localhost:3000/staff/invoices` (Tra cứu và in HĐ)
  + Cửa hàng mua sắm: `http://localhost:3000` (Giao diện khách hàng)

---

## 6. HƯỚNG DẪN SỬ DỤNG PHẦN MỀM TỪNG BƯỚC (USER MANUAL)

### Quy trình 1: Tra cứu và Lọc Hóa đơn Bán hàng
1. Đăng nhập với tài khoản Nhân viên (`nhanvien1` / mật khẩu: `123456`).
2. Nhấp vào mục **"Hóa đơn bán hàng"** trên thanh menu bên trái (`/staff/invoices`).
3. Sử dụng ô tìm kiếm để nhập họ tên khách hàng (ví dụ: "Ánh", "Bảo") hoặc mã hóa đơn (`#000001`).
4. Sử dụng bộ lọc ngày để xem các hóa đơn được xuất trong khoảng thời gian mong muốn.
5. Danh sách hóa đơn sẽ hiển thị kèm huy hiệu trạng thái:
   - Xanh lá: **HỢP LỆ (ISSUED)**
   - Đỏ: **ĐÃ HỦY (VOID)**

### Quy trình 2: Xem Chi tiết và In Hóa đơn Khổ A4
1. Tại danh sách hóa đơn, nhấn nút **"In A4"** ở cột Hành động tương ứng với hóa đơn cần in.
2. Hộp thoại chi tiết sẽ hiện lên hiển thị toàn bộ thông tin đơn hàng, khách hàng và các sản phẩm đã mua.
3. Nhấn nút màu xanh **"In hóa đơn A4"** ở góc dưới modal.
4. Trình duyệt sẽ mở hộp thoại in chuẩn của hệ điều hành với định dạng khổ A4 sẵn sàng in ra máy in nhiệt/laser hoặc xuất file PDF.

### Quy trình 3: Theo dõi Báo cáo Thống kê Doanh thu
1. Truy cập vào mục **"Thống kê bán hàng"** trên menu (`/staff/dashboard`).
2. Quan sát 4 thẻ tóm tắt:
   - Thẻ Doanh thu ròng hiển thị số tiền thực tế thu được (đã trừ hóa đơn VOID).
   - Thẻ Tỷ lệ hủy hiển thị tỷ lệ phần trăm đơn hàng bị hủy để quản lý đánh giá hiệu quả kinh doanh.
3. Kéo xuống phần biểu đồ đường để theo dõi xu hướng tăng trưởng doanh thu theo từng ngày.
4. Xem danh sách Top 5 sản phẩm bán chạy nhất để có kế hoạch nhập thêm hàng vào kho.

---

## 7. ĐÁNH GIÁ ƯU ĐIỂM, NHƯỢC ĐIỂM VÀ HƯỚNG PHÁT TRIỂN (MỤC I.4)

### 7.1. Ưu điểm của Hệ thống
1. **Kiến trúc phân tầng hiện đại & chuẩn mực:** Phân chia rõ ràng giữa Backend (NestJS + TypeScript) và Frontend (Next.js 14 App Router + Ant Design), dễ bảo trì và mở rộng.
2. **Quy trình nghiệp vụ chặt chẽ:** Cơ chế đồng bộ giữa duyệt đơn hàng, trừ kho, lập hóa đơn và cơ chế hoàn kho, chuyển hóa đơn sang VOID khi hủy đơn bảo đảm số liệu không bị sai lệch.
3. **Hiệu năng & Trực quan hóa cao:** Sử dụng Chart.js và TailwindCSS cho giao diện quản trị phản hồi nhanh, mượt mà và trực quan trên mọi kích thước màn hình.
4. **Hỗ trợ in ấn thực tế:** Hóa đơn bán hàng thiết kế đúng quy chuẩn khổ A4, thuận tiện cho việc bàn giao máy cho khách tại quầy hoặc gửi kèm đơn hàng COD.

### 7.2. Hạn chế hiện tại
- Chưa tích hợp chữ ký số điện tử (Digital Signature / E-Invoice API theo chuẩn Tổng cục Thuế).
- Biểu đồ thống kê hiện mới hỗ trợ chu kỳ theo ngày và tháng, chưa có so sánh cùng kỳ năm trước (*Year-over-Year comparison*).

### 7.3. Hướng phát triển mở rộng
1. **Tích hợp Hóa đơn điện tử:** Kết nối trực tiếp với các nhà cung cấp giải pháp hóa đơn điện tử tại Việt Nam (Viettel Sinvoice, VNPT-Invoice, MISA meInvoice).
2. **Dự báo nhu cầu tồn kho bằng AI:** Phân tích tốc độ bán ra của từng phiên bản iPhone để tự động cảnh báo nhân viên thủ kho lập phiếu nhập hàng kịp thời.
3. **Xuất báo cáo đa định dạng:** Hỗ trợ xuất dữ liệu thống kê ra file Excel (.xlsx) và PDF chuyên sâu phục vụ phòng kế toán.

---

## 8. KỊCH BẢN KIỂM THỬ HỆ THỐNG (TEST CASES CHI TIẾT)

| Mã TC | Tên ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Kết quả mong đợi | Kết quả thực tế |
|:---:|:---|:---|:---|:---|:---:|
| **TC-01** | Lập hóa đơn tự động khi duyệt đơn hàng | Đơn hàng #2 ở trạng thái `CHO_XAC_NHAN` | 1. Nhân viên duyệt đơn #2.<br>2. Kiểm tra bảng `HOA_DON`. | Hóa đơn mới được tạo với `trangthai = 'ISSUED'`, `madonhang = 2`, tổng tiền khớp với đơn hàng. Tồn kho SP #1 bị trừ 1 máy. | **ĐẠT (PASS)** |
| **TC-02** | Chuyển hóa đơn sang VOID khi hủy đơn đã duyệt | Đơn hàng #4 trước đó đã duyệt và có hóa đơn | 1. Thực hiện hủy đơn hàng #4.<br>2. Kiểm tra hóa đơn #3 trong CSDL. | Hóa đơn #3 chuyển sang `trangthai = 'VOID'`. Số lượng 2 máy của SP #4 được hoàn trả lại bảng `TON_KHO`. | **ĐẠT (PASS)** |
| **TC-03** | Khách hủy đơn chờ duyệt không tạo hóa đơn | Đơn hàng #5 ở trạng thái `CHO_XAC_NHAN` | 1. Khách hủy đơn #5.<br>2. Kiểm tra bảng `HOA_DON`. | Không có hóa đơn nào được tạo. Tồn kho giữ nguyên. | **ĐẠT (PASS)** |
| **TC-04** | Doanh thu ròng trên Dashboard loại trừ hóa đơn VOID | CSDL có 2 HĐ ISSUED (tổng 80.470.000 ₫) và 1 HĐ VOID (57.980.000 ₫) | 1. Truy cập `/staff/dashboard`.<br>2. Quan sát thẻ "Doanh thu bán ròng". | Doanh thu hiển thị chính xác là **80.470.000 ₫**, không bị cộng dồn số tiền 57.980.000 ₫ của HĐ VOID. | **ĐẠT (PASS)** |
| **TC-05** | Tra cứu và lọc hóa đơn theo khoảng thời gian | Đã có các hóa đơn trong tháng 11/2026 | 1. Vào `/staff/invoices`.<br>2. Chọn ngày từ 2026-11-01 đến 2026-11-13. | Chỉ hiển thị HĐ #1 (ngày 12/11) và HĐ #3 (ngày 05/11). HĐ #2 (ngày 14/11) tự động được lọc bỏ. | **ĐẠT (PASS)** |
| **TC-06** | In hóa đơn bán hàng chuẩn khổ A4 | Đang ở màn hình chi tiết HĐ #1 | 1. Nhấn nút "In A4".<br>2. Kiểm tra giao diện xem trước bản in. | Mẫu hóa đơn hiển thị đầy đủ logo, mã HĐ, tên KH, sản phẩm iPhone 16 Pro Max, tổng tiền và chỗ ký tên. | **ĐẠT (PASS)** |
| **TC-07** | Thống kê Top 5 sản phẩm bán chạy nhất | Đã có các giao dịch thành công | 1. Vào Dashboard thống kê.<br>2. Kiểm tra bảng Top sản phẩm. | Hiển thị iPhone 16 Pro Max, iPhone 15 Pro Max, iPhone 14 theo thứ tự số lượng bán và doanh thu giảm dần. | **ĐẠT (PASS)** |
