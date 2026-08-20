# TÀI LIỆU 03: THIẾT KẾ CƠ SỞ DỮ LIỆU
## DANH SÁCH 32 BẢNG QUAN HỆ CHUYÊN SÂU (TIẾNG VIỆT KHÔNG DẤU)

Hệ thống sử dụng hệ quản trị cơ sở dữ liệu **MySQL 8.0+**. Tên bảng và tên cột viết bằng Tiếng Việt không dấu (CamelCase), đảm bảo tính trực quan trong vận hành nội địa nhưng vẫn tương thích hoàn hảo với các ORM như Entity Framework Core.

---

### PHẦN I: CÁC BẢNG DANH MỤC (01 - 08)

#### 1. Bảng `Xom` (Danh mục địa bàn cư trú của nông dân)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `TenXom` (VARCHAR(100), Unique, Not Null) - Ví dụ: 'Xom Tuy Dinh'
  - `MoTa` (VARCHAR(255), Null)

#### 2. Bảng `NhomHang` (Phân loại vật tư)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `TenNhom` (VARCHAR(100), Unique, Not Null) - Ví dụ: 'Phan bon', 'Thuoc tru sau'
  - `MaNhomVietTat` (VARCHAR(10), Not Null) - Ví dụ: 'PB', 'TB'

#### 3. Bảng `DonViTinh` (Đơn vị đo lường)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `TenDonVi` (VARCHAR(50), Unique, Not Null) - Ví dụ: 'Chai', 'Goi', 'Bao', 'Kg'

#### 4. Bảng `CongDung` (Danh mục công dụng sản phẩm - Chuẩn bị AI)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `TenCongDung` (VARCHAR(100), Unique, Not Null) - Ví dụ: 'Tru sau', 'Dien oc', 'Kich re'

#### 5. Bảng `CayTrong` (Đối tượng cây trồng được sử dụng thuốc/phân bón)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `TenCayTrong` (VARCHAR(100), Unique, Not Null) - Ví dụ: 'Lua', 'Ngo', 'Buoi', 'Rau mau'

#### 6. Bảng `BenhSauHai` (Đối tượng sâu bệnh cần phòng trừ)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `TenBenhSau` (VARCHAR(150), Unique, Not Null) - Ví dụ: 'Dao on', 'Ray nau', 'Oc buou vang'

#### 7. Bảng `NhaSanXuat` (Đơn vị sản xuất)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `TenNhaSanXuat` (VARCHAR(150), Unique, Not Null)
  - `QuocGia` (VARCHAR(100), Default 'Viet Nam')

#### 8. Bảng `NhaCungCap` (Nhà phân phối sỉ)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `TenNhaCungCap` (VARCHAR(150), Not Null)
  - `NguoiLienHe` (VARCHAR(100), Null)
  - `DienThoai` (VARCHAR(20), Not Null)
  - `Email` (VARCHAR(100), Null)
  - `DiaChi` (VARCHAR(255), Null)
  - `SoTaiKhoanNganHang` (VARCHAR(50), Null)
  - `MaSoThue` (VARCHAR(30), Null)
  - `Zalo` (VARCHAR(50), Null)
  - `Facebook` (VARCHAR(150), Null)

---

### PHẦN II: NGHIỆP VỤ HÀNG HÓA VÀ KHÁCH HÀNG (09 - 15)

#### 9. Bảng `HangHoa` (Thông tin cốt lõi của vật tư)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `MaHangHoa` (VARCHAR(20), Unique, Not Null) - Ví dụ: 'TB000001' (Thuốc BVTV 1)
  - `NhomHangId` (INT, Foreign Key -> `NhomHang(Id)`)
  - `DonViTinhId` (INT, Foreign Key -> `DonViTinh(Id)`)
  - `NhaSanXuatId` (INT, Foreign Key -> `NhaSanXuat(Id)`)
  - `TenTrenBaoBi` (VARCHAR(200), Not Null) - Ví dụ: 'Anvil 5SC'
  - `TenThuongGoi` (VARCHAR(200), Not Null) - Ví dụ: 'Anvil tru benh'
  - `HoatChat` (VARCHAR(150), Null) - Ví dụ: 'Hexaconazole'
  - `HamLuong` (VARCHAR(100), Null) - Ví dụ: '50g/L'
  - `QuyCach` (VARCHAR(100), Null) - Ví dụ: 'Chai 100ml'
  - `LieuLuong` (VARCHAR(255), Null)
  - `ThoiGianCachLy` (INT, Default 7) - Số ngày cách ly an toàn
  - `GiaNhapHienTai` (DECIMAL(18, 2), Default 0)
  - `GiaBanHienTai` (DECIMAL(18, 2), Default 0)
  - `QrNoiBo` (VARCHAR(255), Null) - Nội dung chuỗi mã QR

#### 10. Bảng `HangHoaCongDung` (Quan hệ nhiều-nhiều Hàng hóa - Công dụng)
- **Cột:**
  - `HangHoaId` (INT, Foreign Key -> `HangHoa(Id)`)
  - `CongDungId` (INT, Foreign Key -> `CongDung(Id)`)
  - *Primary Key (HangHoaId, CongDungId)*

#### 11. Bảng `HangHoaCayTrong` (Quan hệ nhiều-nhiều Hàng hóa - Cây trồng)
- **Cột:**
  - `HangHoaId` (INT, Foreign Key -> `HangHoa(Id)`)
  - `CayTrongId` (INT, Foreign Key -> `CayTrong(Id)`)
  - *Primary Key (HangHoaId, CayTrongId)*

#### 12. Bảng `HangHoaBenhSauHai` (Quan hệ nhiều-nhiều Hàng hóa - Sâu bệnh hại)
- **Cột:**
  - `HangHoaId` (INT, Foreign Key -> `HangHoa(Id)`)
  - `BenhSauHaiId` (INT, Foreign Key -> `BenhSauHai(Id)`)
  - *Primary Key (HangHoaId, BenhSauHaiId)*

#### 13. Bảng `AnhHangHoa` (Hình ảnh sản phẩm & OCR lưu trữ)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `HangHoaId` (INT, Foreign Key -> `HangHoa(Id)`)
  - `LoaiAnh` (VARCHAR(50), Not Null) - 'MatTruoc', 'MatSau', 'TemGia', 'HoaDon'
  - `DuongDanFile` (VARCHAR(255), Not Null)
  - `NoiDungOCR` (TEXT, Null) - Toàn bộ chữ thô AI đọc được
  - `MoHinhAI` (VARCHAR(100), Null) - Ví dụ: 'Gemini-3.6-flash'
  - `DoTinCay` (DECIMAL(5,2), Null) - Xác suất chính xác (%)
  - `DaXuLy` (BOOLEAN, Default False)

#### 14. Bảng `GiaHangHoa` (Nhật ký biến động giá hàng hóa)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `HangHoaId` (INT, Foreign Key -> `HangHoa(Id)`)
  - `NgayCapNhat` (DATETIME, Not Null)
  - `GiaNhap` (DECIMAL(18,2), Not Null)
  - `GiaBan` (DECIMAL(18,2), Not Null)
  - `NhaCungCapId` (INT, Null, Foreign Key -> `NhaCungCap(Id)`)

#### 15. Bảng `KhachHang` (Thông tin nông dân & Năng lực canh tác)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `HoTen` (VARCHAR(150), Not Null)
  - `DienThoai` (VARCHAR(20), Null)
  - `DiaChi` (VARCHAR(255), Null)
  - `XomId` (INT, Foreign Key -> `Xom(Id)`)
  - `NgaySinh` (DATE, Null)
  - `NgheNghiep` (VARCHAR(100), Default 'Lam ruong')
  - `DienTichCanhTac` (DECIMAL(10,2), Null) - Diện tích sào đất
  - `LoaiCayTrongId` (INT, Null, Foreign Key -> `CayTrong(Id)`)
  - `GhiChu` (VARCHAR(255), Null)

---

### PHẦN III: PHIẾU NHẬP & HÓA ĐƠN BÁN (16 - 19)

#### 16. Bảng `PhieuNhap` (Quản lý nhập hàng sỉ)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `MaPhieuNhap` (VARCHAR(50), Unique, Not Null)
  - `NhaCungCapId` (INT, Foreign Key -> `NhaCungCap(Id)`)
  - `NgayNhap` (DATETIME, Not Null)
  - `TongTien` (DECIMAL(18,2), Not Null)
  - `DaThanhToan` (DECIMAL(18,2), Default 0) - Tiền trả ngay
  - `GhiChu` (VARCHAR(255), Null)

#### 17. Bảng `ChiTietPhieuNhap` (Chi tiết các mặt hàng trong phiếu nhập)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `PhieuNhapId` (INT, Foreign Key -> `PhieuNhap(Id)`)
  - `HangHoaId` (INT, Foreign Key -> `HangHoa(Id)`)
  - `SoLuong` (DECIMAL(12,2), Not Null)
  - `DonGia` (DECIMAL(18,2), Not Null)
  - `ChietKhau` (DECIMAL(5,2), Default 0)

#### 18. Bảng `HoaDonBan` (Quản lý hóa đơn bán lẻ cho nông dân)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `MaHoaDon` (VARCHAR(50), Unique, Not Null)
  - `KhachHangId` (INT, Foreign Key -> `KhachHang(Id)`)
  - `NgayBan` (DATETIME, Not Null)
  - `TongTien` (DECIMAL(18,2), Not Null)
  - `GiamGia` (DECIMAL(18,2), Default 0)
  - `KhachTra` (DECIMAL(18,2), Default 0) - Tiền mặt trả ngay
  - `GhiChu` (VARCHAR(255), Null)

#### 19. Bảng `ChiTietHoaDonBan` (Mặt hàng chi tiết nông dân mua)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `HoaDonBanId` (INT, Foreign Key -> `HoaDonBan(Id)`)
  - `HangHoaId` (INT, Foreign Key -> `HangHoa(Id)`)
  - `SoLuong` (DECIMAL(12,2), Not Null)
  - `DonGia` (DECIMAL(18,2), Not Null)

---

### PHẦN IV: TỒN KHO VÀ CÔNG NỢ (20 - 23)

#### 20. Bảng `TonKho` (Trạng thái tồn kho hiện hành)
- **Cột:**
  - `HangHoaId` (INT, Primary Key, Foreign Key -> `HangHoa(Id)`)
  - `SoLuongTon` (DECIMAL(12,2), Default 0)
  - `NgayCapNhat` (DATETIME, Not Null)

#### 21. Bảng `LichSuTonKho` (Nhật ký phát sinh chi tiết biến động kho)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `HangHoaId` (INT, Foreign Key -> `HangHoa(Id)`)
  - `NgayPhatSinh` (DATETIME, Not Null)
  - `LoaiGiaoDich` (VARCHAR(50), Not Null) - 'NhapHang', 'BanHang', 'KiemKho', 'HuyBo'
  - `ThamChieuId` (VARCHAR(50), Null) - Lưu mã hóa đơn hoặc mã phiếu nhập tương ứng
  - `SoLuongThayDoi` (DECIMAL(12,2), Not Null) - Ví dụ: +50 hoặc -10
  - `GhiChu` (VARCHAR(255), Null)

#### 22. Bảng `CongNoKhachHang` (Theo dõi nợ mua chịu gối đầu của nông dân)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `KhachHangId` (INT, Foreign Key -> `KhachHang(Id)`)
  - `TongNo` (DECIMAL(18,2), Default 0) - Nợ tích lũy hiện hành
  - `NgayCapNhatCuoi` (DATETIME, Not Null)

#### 23. Bảng `CongNoNhaCungCap` (Theo dõi tiền còn thiếu của nhà cung cấp sỉ)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `NhaCungCapId` (INT, Foreign Key -> `NhaCungCap(Id)`)
  - `TongNo` (DECIMAL(18,2), Default 0)
  - `NgayCapNhatCuoi` (DATETIME, Not Null)

---

### PHẦN V: QUỸ, THU CHI VÀ CÀI ĐẶT (24 - 27)

#### 24. Bảng `PhieuThu` (Chứng từ thu tiền mặt)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `MaPhieuThu` (VARCHAR(50), Unique, Not Null)
  - `NgayLap` (DATETIME, Not Null)
  - `SoTien` (DECIMAL(18,2), Not Null)
  - `NguonNop` (VARCHAR(150), Not Null) - Ví dụ: 'Nong dan Nguyen Van A tra no', 'Ban hang le'
  - `KhachHangId` (INT, Null, Foreign Key -> `KhachHang(Id)`)
  - `GhiChu` (VARCHAR(255), Null)

#### 25. Bảng `PhieuChi` (Chứng từ chi tiền mặt)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `MaPhieuChi` (VARCHAR(50), Unique, Not Null)
  - `NgayLap` (DATETIME, Not Null)
  - `SoTien` (DECIMAL(18,2), Not Null)
  - `MucDichChi` (VARCHAR(150), Not Null) - Ví dụ: 'Tra no nha cung cap B', 'Chi tien dien nuoc'
  - `NhaCungCapId` (INT, Null, Foreign Key -> `NhaCungCap(Id)`)
  - `GhiChu` (VARCHAR(255), Null)

#### 26. Bảng `SoQuy` (Nhật ký dòng tiền mặt cửa hàng)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `NgayGiaoDich` (DATETIME, Not Null)
  - `LoaiPhieu` (VARCHAR(10), Not Null) - 'Thu' hoặc 'Chi'
  - `MaChungTu` (VARCHAR(50), Not Null) - Mã Phiếu Thu/Phiếu Chi
  - `SoTienThayDoi` (DECIMAL(18,2), Not Null)
  - `SoDuQuy` (DECIMAL(18,2), Not Null) - Số dư tại thời điểm giao dịch kết thúc

#### 27. Bảng `CaiDat` (Cấu hình hệ thống chung)
- **Cột:**
  - `Khoa` (VARCHAR(100), Primary Key) - Ví dụ: 'TenCuaHang', 'DiaChi', 'DienThoai'
  - `GiaTri` (TEXT, Null)

---

### PHẦN VI: AI VÀ CÁC BẢNG HỆ THỐNG (28 - 32)

#### 28. Bảng `HoiDapAI` (Nhật ký hỏi đáp trợ lý nông nghiệp)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `ThoiGian` (DATETIME, Not Null)
  - `CauHoiKhach` (TEXT, Not Null) - Ví dụ: 'Benh vang la lua phun thuoc gi'
  - `CauTraLoiAI` (TEXT, Not Null)
  - `NguonDuLieuBaoGom` (VARCHAR(255), Null) - Tên các hoạt chất hoặc hàng hóa hệ thống trích xuất làm căn cứ trả lời

#### 29. Bảng `ThongKeNgay` (Thống kê nhanh phục vụ kết xuất Dashboard siêu tốc)
- **Cột:**
  - `NgayThongKe` (DATE, Primary Key)
  - `DoanhThu` (DECIMAL(18,2), Default 0)
  - `LoiNhuan` (DECIMAL(18,2), Default 0)
  - `SoHoaDon` (INT, Default 0)
  - `SoKhachHangMoi` (INT, Default 0)
  - `TongThuNo` (DECIMAL(18,2), Default 0)
  - `TongChiNo` (DECIMAL(18,2), Default 0)

#### 30. Bảng `PhienBanDuLieu` (Lịch sử sao lưu và nâng cấp CSDL)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `NgaySaoLuu` (DATETIME, Not Null)
  - `TenFileBackup` (VARCHAR(255), Not Null)
  - `DungLuong` (BIGINT, Not Null) - Đơn vị Bytes
  - `NguoiTao` (VARCHAR(100), Default 'Chu cua hang')
  - `GhiChu` (VARCHAR(255), Null)

#### 31. Bảng `NhatKyHoatDong` (Lưu vết thao tác thủ công bảo vệ dòng tiền)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `ThoiGian` (DATETIME, Not Null)
  - `LoaiHanhDong` (VARCHAR(50), Not Null) - 'ThemHang', 'SuaGia', 'XoaPhieu', 'ThuNo', 'SuaKho'
  - `ChiTiet` (TEXT, Not Null) - Ví dụ: 'Chu cua hang sua gia ban le PB00001 tu 12,000d len 12,500d'

#### 32. Bảng `TepDinhKem` (Lưu hóa đơn VAT, chứng nhận và tài liệu đính kèm)
- **Cột:**
  - `Id` (INT, Primary Key, Auto Increment)
  - `NgayDinhKem` (DATETIME, Not Null)
  - `LoaiChungTuThamChieu` (VARCHAR(50), Not Null) - 'PhieuNhap', 'HangHoa', 'HoaDonBan'
  - `MaChungTuThamChieu` (VARCHAR(50), Not Null)
  - `TenFile` (VARCHAR(255), Not Null)
  - `DuongDanFile` (VARCHAR(255), Not Null)
  - `KichThuoc` (INT, Not Null) - Đơn vị Bytes
