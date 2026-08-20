# TÀI LIỆU 01: TỔNG QUAN DỰ ÁN
## PHẦN MỀM QUẢN LÝ CỬA HÀNG PHÂN BÓN & THUỐC BVTV

- **Tên dự án:** Phần mềm Quản lý cửa hàng Phân bón & Thuốc BVTV
- **Mã dự án:** `QuanLyVatTuNongNghiep`
- **Phiên bản:** 1.1 (Cải tiến Enterprise)
- **Ngày tạo:** 28/07/2026

---

### 1. Giới thiệu & Mục tiêu
Dự án được xây dựng nhằm cung cấp giải pháp quản lý chuyên sâu và toàn diện cho các cửa hàng kinh doanh vật tư nông nghiệp (phân bón, hạt giống, thuốc bảo vệ thực vật) tại khu vực nông thôn Việt Nam. 
Mục tiêu là đơn giản hóa tối đa quy trình nghiệp vụ hằng ngày của một chủ cửa hàng duy nhất, giảm thiểu tối đa các thao tác nhập liệu thủ công lặp đi lặp lại, đồng thời chuẩn bị sẵn cấu trúc dữ liệu tối ưu cho việc tích hợp trí tuệ nhân tạo (AI) và mở rộng chuỗi cửa hàng trong tương lai.

### 2. Đối tượng & Phạm vi
- **Đối tượng sử dụng (v1.1):** 01 Chủ cửa hàng (vừa là thủ kho, người bán hàng, kế toán thu chi và người đưa ra quyết định nhập hàng). Không yêu cầu phân quyền đăng nhập phức tạp, tối giản hóa giao diện để thao tác cực nhanh (bán một hóa đơn < 20 giây).
- **Phạm vi nghiệp vụ:**
  - **Quản lý danh mục chuyên sâu:** Tách riêng nhóm hàng, đơn vị tính, nhà sản xuất, công dụng, cây trồng, bệnh/sâu hại, xóm canh tác.
  - **Hàng hóa & AI Readiness:** Quản lý thông tin chi tiết bao gồm thông số kỹ thuật, hoạt chất, cách dùng, thời gian cách ly và nhật ký giá.
  - **Bán hàng & Nhập hàng:** Quản lý luồng xuất nhập kho chặt chẽ, tự động hóa tính toán công nợ và ghi nhận lịch sử tồn kho chi tiết từng lượt phát sinh.
  - **Quản lý công nợ khách hàng (theo Xóm) & Nhà cung cấp:** Theo dõi nợ gối đầu, lịch sử thu chi trả nợ.
  - **Sổ quỹ & Thu chi:** Ghi nhận mọi giao dịch tiền mặt tại cửa hàng thông qua Phiếu Thu, Phiếu Chi, kết xuất Sổ Quỹ tự động.
  - **Báo cáo & Thống kê:** Thống kê doanh thu, chi phí, lợi nhuận thực tế hằng ngày, hỗ trợ đưa ra các quyết định kinh doanh.

---

### 3. Công nghệ & Kiến trúc Hệ thống
Hệ thống được thiết kế theo cấu trúc chuẩn doanh nghiệp nhằm đảm bảo khả năng nâng cấp mượt mà lên phiên bản 2.0 (AI thông minh) và 3.0 (Cloud & Multi-store).

- **Kiến trúc:** Clean Architecture (N-Tier) kết hợp Repository & Service Pattern.
  ```
  [Frontend: React + Tailwind CSS]
              ↓ (REST API / JSON / JWT)
  [Backend: ASP.NET Core 8 Web API]
        - Domain: Các thực thể thực tế (Entities), quy tắc cốt lõi.
        - Application: Services xử lý logic nghiệp vụ, DTOs, Interfaces.
        - Infrastructure: DbContext, Repository Implementation, File Storage.
              ↓ (Entity Framework Core / Pomelo MySQL Provider)
  [Database: MySQL 8.0+]
  ```
- **Xác thực:** JWT (đã thiết kế sẵn kiến trúc, kích hoạt ở v2.0).

---

### 4. Quy ước Đặt tên (Naming Conventions)
Đảm bảo tính thống nhất từ cơ sở dữ liệu lên giao diện người dùng và mã nguồn hệ thống:

| Tầng / Thành phần | Quy ước đặt tên | Ngôn ngữ | Ví dụ thực tế |
| :--- | :--- | :--- | :--- |
| **Giao diện (UI)** | 100% Tiếng Việt có dấu, rõ nghĩa | Tiếng Việt | "Hàng hóa", "Hóa đơn bán", "Xóm Tuy Định" |
| **Cơ sở dữ liệu** | Chữ hoa đầu từ, không dấu, không dấu gạch dưới | Tiếng Việt không dấu | `HangHoa`, `KhachHang`, `HoaDonBan` |
| **Mã nguồn (Code)** | PascalCase/camelCase chuẩn Microsoft | Tiếng Anh | `Product`, `ProductService`, `CustomerRepository` |

---

### 5. Định hướng Tích hợp Trí tuệ Nhân tạo (AI Strategy)
Hệ thống được thiết kế dữ liệu đặc thù để hỗ trợ AI ở các phiên bản tiếp theo:
- **AI OCR Bao bì:** Đọc ảnh mặt trước/sau của sản phẩm, nhận diện thương hiệu, hoạt chất, hàm lượng, đối tượng cây trồng và phòng trị sâu bệnh tự động điền vào danh mục.
- **AI Chatbot Tư vấn:** Tự động tra cứu sự tương thích giữa hoạt chất thuốc, sâu bệnh hại và loại cây trồng để tư vấn liều lượng phun và sản phẩm phù hợp cho chủ cửa hàng tư vấn lại cho nông dân.
- **AI Phân tích giá & Dự báo tồn kho:** Phân tích biến động giá nhập từ bảng giá lịch sử (`GiaHangHoa`), kết hợp dữ liệu thống kê ngày (`ThongKeNgay`) để dự báo lượng hàng cần nhập trước mùa vụ kế tiếp.
