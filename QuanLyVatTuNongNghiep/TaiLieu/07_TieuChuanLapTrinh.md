# TÀI LIỆU 07: TIÊU CHUẨN LẬP TRÌNH (CODING STANDARDS)
## QUY ƯỚC PHÁT TRIỂN PHẦN MỀM CHO ĐỘI NGŨ KỸ THUẬT

Để đảm bảo dự án có tính bảo trì cao, dễ dàng mở rộng và bàn giao, toàn bộ mã nguồn phải tuân thủ nghiêm ngặt các tiêu chuẩn dưới đây.

---

### 1. Chuẩn đặt tên trong mã nguồn (Coding Conventions)
Như quy ước tổng quan, toàn bộ giao diện hướng người dùng là 100% Tiếng Việt, tên bảng/cột là Tiếng Việt không dấu, nhưng **tên lớp, biến, phương thức và tệp tin mã nguồn bắt buộc phải bằng Tiếng Anh 100%** theo chuẩn lập trình quốc tế.

#### 1.1 Chuẩn Backend (.NET C#)
- **PascalCase:** Dùng cho Class, Interface, Enum, Method, Property công khai.
  - Ví dụ: `ProductService`, `ICustomerRepository`, `GetInventoryHistory()`, `CurrentCost`.
- **camelCase:** Dùng cho biến cục bộ, tham số truyền vào hàm.
  - Ví dụ: `productId`, `totalQuantity`, `customerDebt`.
- **Interface:** Bắt buộc bắt đầu bằng chữ `I`.
  - Ví dụ: `IProductService`, `IRepository<T>`.
- **Mẫu hậu tố (Suffix Patterns):**
  - Controllers: `ProductController`, `InvoiceController`.
  - Services: `ProductService`, `InventoryService`.
  - Repositories: `CustomerRepository`, `FundRepository`.

#### 1.2 Chuẩn Frontend (React & TypeScript)
- **PascalCase:** Dùng cho tên Components, Interfaces, Types.
  - Ví dụ: `ProductCard`, `InvoiceList`, `CustomerType`.
- **camelCase:** Dùng cho tên thuộc tính, hàm, state, hook.
  - Ví dụ: `const [products, setProducts] = useState()`, `handlePaymentSubmit()`.
- **Tệp component:** Đặt tên dạng `PascalCase.tsx`.
  - Ví dụ: `ProductForm.tsx`, `DebtDashboard.tsx`.

---

### 2. Kiến trúc Backend (Clean Architecture)
Mã nguồn C# trong thư mục `Backend/` được tổ chức thành 4 phân tầng độc lập:

1. **Domain (Core Layer):** Chứa các thực thể chính, quy tắc nghiệp vụ bất biến. Không phụ thuộc bất kỳ thư viện ngoài nào.
   - Thư mục: `Entities/`, `Enums/`, `Exceptions/`.
2. **Application (Business Logic Layer):** Chứa Interfaces cho Repositories, DTOs (Data Transfer Objects), Services xử lý nghiệp vụ chính, Validators.
   - Thư mục: `Interfaces/`, `DTOs/`, `Services/`.
3. **Infrastructure (Data & External Layer):** Chứa DbContext, triển khai cụ thể của Repositories, kết nối MySQL, gọi dịch vụ lưu trữ file, kết nối API AI bên thứ ba.
   - Thư mục: `Persistence/`, `Repositories/`, `Services/`.
4. **WebAPI (Presentation Layer):** Chứa Controllers, Middlewares xử lý lỗi toàn cục, cấu hình Swagger/OpenAPI, và Dependency Injection registration.
   - Thư mục: `Controllers/`, `Middlewares/`, `Configurations/`.

---

### 3. Tiêu chuẩn Cơ sở dữ liệu và Entity Framework Core
- **Kiểu dữ liệu tiền tệ:** 100% dùng kiểu `decimal(18, 2)` (hoặc `decimal` trong C#) để lưu trữ giá cả, số tiền, công nợ. Nghiêm cấm dùng `double` hoặc `float` để tránh sai số dấu phẩy động làm lệch tiền quỹ.
- **Migration:** Không sửa trực tiếp database trong phpMyAdmin hoặc MySQL Workbench. Mọi thay đổi cấu trúc bảng phải được cập nhật qua Entity Framework Core Migrations.
- **Quan hệ Nhiều - Nhiều:** Sử dụng cơ chế cấu hình Fluent API trong `DbContext` để sinh các bảng trung gian như `HangHoaCongDung`, `HangHoaCayTrong` và tự động hóa tải dữ liệu liên quan qua `.Include()`.
- **Soft Delete (Xóa mềm):** Bảng `HangHoa`, `KhachHang`, `NhaCungCap` không xóa vật lý (Hard Delete). Sử dụng cột `IsDeleted` (hoặc `DaXoa` trong DB) để đánh dấu xóa, giúp bảo toàn tính toàn vẹn của các hóa đơn cũ.
