# TÀI LIỆU 04: THIẾT KẾ GIAO DIỆN NGƯỜI DÙNG (UI/UX)
## QUY CHUẨN THẨM MỸ VÀ TRẢI NGHIỆM VẬN HÀNH

Giao diện hệ thống tuân thủ triết lý tối giản, trực quan, dễ thao tác đối với chủ cửa hàng nông thôn (vừa đi ruộng về, tay dính bùn đất hoặc dùng điện thoại cảm ứng nhỏ).

---

### 1. Quy chuẩn Thẩm mỹ & Thiết kế
- **Hệ màu sắc (Improved Contrast Pastels):** Tránh sử dụng nền xám xịt hoặc gam màu chói lọi gây mỏi mắt. Sử dụng các gam màu pastel (màu nhạt tinh tế) nhưng được hiệu chỉnh độ tương phản cao (Improved Contrast) để đảm bảo chữ cực kỳ rõ ràng đạt chuẩn tiếp cận WCAG AA (tương phản tối thiểu 4.5:1).
  - **Nền ứng dụng (App Background):** Warm Neutral Off-white (`#F9F8F6` - màu kem cát nhẹ, tăng sự dễ chịu cho mắt).
  - **Xanh lục mầm (Pastel Teal/Green):** Dùng cho nhóm Phân bón & Khách hàng (`#E3F4EC` làm nền, chữ chính đậm `#1B5E3A`).
  - **Xanh lam mây (Pastel Blue):** Dùng cho nhóm Thuốc trừ bệnh & Nhà cung cấp (`#E6F0FA` làm nền, chữ chính `#1D4ED8`).
  - **Vàng cam phấn (Pastel Amber):** Dùng cho Thuốc diệt cỏ & Thu chi quỹ (`#FEF3C7` làm nền, chữ chính `#B45309`).
  - **Hồng tro (Pastel Rose):** Dùng cho Cảnh báo hết hàng / Nợ xấu vượt mức (`#FFE4E6` làm nền, chữ chính `#9F1239`).

- **Độ bo góc (Border Radius):** Nhất quán từ `8px` đến `12px`.
  - Các Thẻ thông tin (Cards), Bảng dữ liệu (Tables), Hộp thoại (Modals) sử dụng góc bo mềm mại `12px` (`rounded-xl` trong Tailwind).
  - Các Nút bấm (Buttons), Thẻ nhãn (Tags), Ô nhập liệu (Inputs) sử dụng góc bo `8px` (`rounded-lg` trong Tailwind).

- **Đổ bóng mịn nhiều lớp (Softer Multi-layer Box Shadow):** Loại bỏ đổ bóng thô đen 1 lớp. Sử dụng kỹ thuật đổ bóng chồng 2-3 lớp mờ mịn, tạo cảm giác thẻ nổi nhẹ nhàng trên bề mặt kem:
  - *Lớp bóng mỏng mịn:* `box-shadow: 0 1px 2px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03), 0 12px 24px rgba(0,0,0,0.04);`

---

### 2. Sắp xếp Layout Trực quan
Giao diện được tổ chức theo mô hình **Single-page Dashboard** linh hoạt, các module mở rộng có thể chuyển đổi mượt mà mà không tạo cảm giác rối rắm:

1. **Header (Thanh đầu trang):**
   - Tên cửa hàng ("VẬT TƯ NÔNG NGHIỆP") nổi bật trên nền pastel lục nhẹ.
   - Hiển thị nhanh số dư Sổ Quỹ hiện tại (Ví dụ: "Tiền mặt: 125,500,000đ") và nút **Quét Mã QR/Bao Bì** mở camera.

2. **Sidebar điều hướng dạng phẳng (Flat Sidebar):**
   - Sử dụng các tab phẳng, độ cao nút 48px phù hợp cho ngón tay cảm ứng.
   - Thứ tự tab: `Bán Hàng`, `Nhập Hàng`, `Hàng Hóa`, `Khách Hàng & Nợ`, `Thu Chi Quỹ`, `Nhật Ký & Báo Cáo`.

3. **Workspace (Vùng làm việc chính):**
   - Áp dụng triết lý "Flatten Depth" (Làm phẳng độ sâu): Không lồng thẻ bên trong thẻ khác (No nested cards). Dùng khoảng trắng rộng rãi (Padding tối thiểu 16px) và các đường phân cách mảnh 1px nhạt để phân chia khu vực.

---

### 3. Thiết kế Responsive cho Điện thoại & Máy tính
- **Giao diện Desktop (Máy tính bán hàng tại quầy):**
  - Trình bày dạng 2 cột: Cột trái là Danh sách sản phẩm / Giỏ hàng đang mua, Cột phải là thông tin Khách hàng, Thanh toán và Công nợ gối đầu. Thao tác kích chuột nhanh, phím tắt linh hoạt.
- **Giao diện Mobile (Xem báo cáo khi đi vườn / Quét kho bằng camera điện thoại):**
  - Tự động thu gọn Sidebar thành Menu kéo gọn gàng.
  - Các nút hành động chính (Thanh toán, Tạo hóa đơn, Quét QR) được đưa xuống cạnh dưới màn hình làm nút nổi cố định (sticky bottom action bar) để dễ dàng thao tác bằng một tay cái.
  - Mục tiêu: Chiều rộng thẻ tối thiểu 44px làm touch target để giảm sai sót khi ấn bấm.
