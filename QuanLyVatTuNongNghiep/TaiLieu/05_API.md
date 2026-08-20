# TÀI LIỆU 05: ĐẶC TẢ GIAO DIỆN LẬP TRÌNH ỨNG DỤNG (API SPECIFICATION)
## THIẾT KẾ HỆ THỐNG REST API TRÊN ASP.NET CORE 8

---

### 1. Chuẩn hóa Thiết kế API
- **Prefix:** `/api/v1`
- **Mã phản hồi tiêu chuẩn:**
  - `200 OK`: Truy vấn, cập nhật thành công.
  - `201 Created`: Tạo mới thành công (trả về đối tượng vừa tạo kèm ID).
  - `400 BadRequest`: Lỗi nghiệp vụ (hết hàng, sai kiểu dữ liệu, vượt hạn mức nợ).
  - `404 NotFound`: Không tìm thấy tài nguyên.
  - `500 InternalServerError`: Lỗi hệ thống hoặc database.

---

### 2. Danh sách Endpoint API cốt lõi

#### 2.1 Quản lý Hàng hóa (`/api/v1/products`)
- **`GET /api/v1/products`**
  - *Mục đích:* Lấy danh sách hàng hóa kèm tồn kho hiện tại, lọc theo nhóm hàng hoặc tìm kiếm theo hoạt chất/tên thường gọi.
  - *Tham số:* `search`, `groupId`, `page`, `pageSize`
- **`POST /api/v1/products`**
  - *Mục đích:* Thêm mới hàng hóa (Tự sinh mã hàng theo nhóm, lưu các trường AI, tạo liên kết nhiều-nhiều).
  - *Payload mẫu:*
    ```json
    {
      "nhomHangId": 2,
      "donViTinhId": 1,
      "tenTrenBaoBi": "Anvil 5SC",
      "tenThuongGoi": "Thuoc Anvil",
      "hoatChat": "Hexaconazole",
      "hamLuong": "50g/L",
      "quyCach": "Chai 100ml",
      "lieuLuong": "20ml/binh 16L",
      "thoiGianCachLy": 7,
      "giaNhapHienTai": 75000,
      "giaBanHienTai": 85000,
      "congDungIds": [1, 2],
      "cayTrongIds": [1, 3],
      "benhSauIds": [1, 4]
    }
    ```
- **`GET /api/v1/products/{id}`**
  - *Mục đích:* Xem chi tiết hàng hóa (bao gồm thông tin OCR, ảnh đính kèm và lịch sử giá).
- **`PUT /api/v1/products/{id}`**
  - *Mục đích:* Cập nhật thông tin hàng hóa. Nếu thay đổi giá nhập/bán, hệ thống tự động ghi nhật ký vào `GiaHangHoa` và lưu log thao tác.

#### 2.2 Quản lý Khách hàng (`/api/v1/customers`)
- **`GET /api/v1/customers`**
  - *Mục đích:* Lấy danh sách nông dân kèm tổng dư nợ hiện tại, nhóm theo xóm.
- **`POST /api/v1/customers`**
  - *Mục đích:* Đăng ký khách hàng mới. Nếu chọn xóm mới (chế độ "Khác..."), API tự động tạo mới bản ghi trong bảng `Xom` và gắn liên kết.
  - *Payload mẫu:*
    ```json
    {
      "hoTen": "Nguyen Van B",
      "dienThoai": "0987654321",
      "diaChi": "Xom Dong Hai",
      "tenXomMoi": "Xom Cua Dong", // Nếu xóm chưa có sẵn trong danh sách
      "ngheNghiep": "Gia dinh lam vuon",
      "dienTichCanhTac": 2.5,
      "loaiCayTrongId": 1
    }
    ```

#### 2.3 Bán hàng & Trừ kho (`/api/v1/sales`)
- **`POST /api/v1/sales`**
  - *Mục đích:* Lập hóa đơn bán hàng lẻ, trừ tồn kho trực tiếp, tích lũy công nợ khách hàng và ghi nhận dòng tiền mặt.
  - *Hành động ngầm:*
    1. Tạo bản ghi `HoaDonBan` và `ChiTietHoaDonBan`.
    2. Cập nhật `TonKho`.
    3. Thêm bản ghi `LichSuTonKho` với lượng âm `-` tương ứng từng sản phẩm.
    4. Nếu khách hàng trả thiếu, cập nhật `CongNoKhachHang` cộng thêm khoản nợ mới.
    5. Nếu khách trả ngay tiền mặt (`KhachTra > 0`), tự động tạo `PhieuThu` và ghi nhận tăng số dư trong `SoQuy`.
  - *Payload mẫu:*
    ```json
    {
      "khachHangId": 5,
      "ngayBan": "2026-07-28T10:15:00",
      "giamGia": 10000,
      "khachTra": 150000, // Số tiền khách trả ngay
      "chiTiet": [
        { "hangHoaId": 1, "soLuong": 2, "donGia": 85000 },
        { "hangHoaId": 3, "soLuong": 1, "donGia": 120000 }
      ]
    }
    ```

#### 2.4 Nhập hàng sỉ (`/api/v1/imports`)
- **`POST /api/v1/imports`**
  - *Mục đích:* Tạo phiếu nhập kho vật tư sỉ từ nhà phân phối.
  - *Hành động ngầm:* Tương tự hóa đơn bán nhưng ghi nhận lượng dương `+` cho kho, tăng công nợ nhà cung cấp và tạo `PhieuChi` nếu có thanh toán tiền mặt ngay.

#### 2.5 Công nợ & Thu nợ (`/api/v1/debts`)
- **`POST /api/v1/debts/collect`**
  - *Mục đích:* Thu nợ gối đầu của nông dân (Phiếu Thu).
  - *Payload:* `{ "khachHangId": 3, "soTienThu": 500000, "ghiChu": "Thu no cuoi vu lua" }`
- **`POST /api/v1/debts/pay`**
  - *Mục đích:* Trả bớt nợ cho nhà cung cấp sỉ (Phiếu Chi).

#### 2.6 Trí tuệ Nhân tạo - AI OCR & Q&A (`/api/v1/ai`)
- **`POST /api/v1/ai/ocr`**
  - *Mục đích:* Nhận ảnh base64 mặt trước/sau của sản phẩm, gọi Gemini AI đọc chữ và trả về các thuộc tính sản phẩm dạng cấu trúc JSON sạch sẽ.
- **`POST /api/v1/ai/ask`**
  - *Mục đích:* Trả lời nhanh câu hỏi của nông dân dựa trên cơ sở kiến thức sâu rộng của Gemini và cơ sở dữ liệu hàng hóa hiện tại trong kho (ví dụ: "Sâu cuốn lá phun gì mát lúa?").
