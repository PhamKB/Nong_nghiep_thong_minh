# TÀI LIỆU 02: YÊU CẦU NGHIỆP VỤ CHUYÊN SÂU
## CÁC TÍNH NĂNG VÀ NGHIỆP VỤ CỐT LÕI (PHIÊN BẢN 1.1)

---

### 1. Quản lý Khách hàng theo Địa bàn (Xóm)
Đặc thù của các cửa hàng vật tư nông nghiệp ở nông thôn là bán nợ (bán chịu) gối đầu theo vụ mùa. Do đó, việc nắm rõ khách hàng ở địa bàn (xóm) nào là sống còn đối với chủ cửa hàng để dễ dàng đi thu nợ cuối vụ.

- **Danh sách xóm mặc định:**
  - Xóm Tuy Định
  - Xóm Tây Cường
  - Xóm Thanh Giản
  - Xóm Đông Hải
  - Xóm Hoa Lộc
  - Xóm Đông Thổ
  - Xóm Văn Hải
  - Xóm Tân Vinh
  - Xóm Đông Yên
  - Xóm Kim Tân
- **Nghiệp vụ "Xóm khác":** Khi khai báo khách hàng mới, nếu họ thuộc địa bàn ngoài danh sách trên, người dùng chọn **Khác...**, hệ thống hiển thị ô nhập liệu để nhập tên xóm mới. Tên xóm mới này sẽ được tự động lưu vào bảng `Xom` và bổ sung vào danh sách chọn cho lần sau.
- **Trường dữ liệu nâng cao:** Ngoài họ tên, điện thoại, địa chỉ, mỗi khách hàng phải lưu thêm:
  - Diện tích canh tác (đơn vị: sào hoặc mẫu)
  - Loại cây trồng chủ lực (Lúa, Màu, Cây ăn quả...)
  - Ghi chú thói quen mua sắm (ví dụ: "Thường mua thuốc sâu sinh học", "Mua chịu trả cuối vụ lúa").

---

### 2. Quản lý Hàng hóa & Chuẩn bị tích hợp AI (AI-Ready Products)
Để chuẩn bị cho tính năng AI OCR tự động quét nhãn chai thuốc bảo vệ thực vật ở phiên bản 2.0, cấu trúc Hàng hóa của hệ thống phải hỗ trợ các thuộc tính kỹ thuật chuyên sâu thay vì chỉ có tên và giá:

- **Các trường hỗ trợ AI:**
  - `TenTrenBaoBi` (Tên thương mại in trên bao bì - ví dụ: "ANVIL 5SC")
  - `TenThuongGoi` (Tên nhà nông thường gọi - ví dụ: "Thuốc trừ bệnh Anvil đầu trâu")
  - `HoatChat` (Hoạt chất chính - ví dụ: "Hexaconazole")
  - `HamLuong` (Hàm lượng hoạt chất - ví dụ: "50g/L")
  - `QuyCach` (Thể tích/Trọng lượng đóng gói - ví dụ: "Chai 100ml", "Gói 100g")
  - `LieuLuong` (Liều lượng khuyến cáo - ví dụ: "20ml cho bình 16 lít")
  - `ThoiGianCachLy` (Số ngày ngưng phun thuốc trước thu hoạch - ví dụ: "7 ngày")
- **Danh mục liên kết quan hệ Nhiều - Nhiều:**
  - Một sản phẩm có thể có nhiều **Công dụng** (Trừ bệnh, trừ sâu, kích rễ...)
  - Một sản phẩm dùng cho nhiều đối tượng **Cây trồng** (Lúa, Ngô, Rau màu...)
  - Một sản phẩm đặc trị nhiều loại **Bệnh / Sâu hại** (Đạo ôn, Khô vằn, Rầy nâu...)
- **Kho ảnh phong phú:** Cho phép chụp hoặc tải lên nhiều ảnh cho mỗi sản phẩm:
  - Ảnh mặt trước bao bì
  - Ảnh mặt sau (hướng dẫn sử dụng)
  - Ảnh chi tiết tem chống giả/mã vạch
- **Mã sản phẩm tự động sinh:** Hệ thống tự động phát sinh mã hàng theo nhóm:
  - Phân bón: `PB000001`, `PB000002`...
  - Thuốc BVTV: `TB000001`, `TB000002`...
- **Mã QR nội bộ:** Khi tạo mới sản phẩm thành công, hệ thống tự động sinh một mã QR nội bộ duy nhất dựa trên ID sản phẩm. Chủ cửa hàng có thể in mã này dán lên các kệ hàng trong kho. Quét mã QR bằng camera điện thoại sẽ ngay lập tức chuyển hướng giao diện đến trang xem/sửa chi tiết của mặt hàng đó.

---

### 3. Nghiệp vụ Nhật ký Giá (Price Tracking Logs)
Giá vật tư nông nghiệp biến động mạnh theo mùa vụ và nhà sản xuất. Bảng giá không được lưu đè trực tiếp mà phải ghi nhận nhật ký chi tiết:
- Ghi nhận: Ngày thay đổi, Giá nhập cũ, Giá nhập mới, Giá bán cũ, Giá bán mới, Nhà cung cấp tương ứng.
- Phục vụ AI: Dữ liệu lịch sử này giúp AI phân tích xu hướng tăng/giảm giá của từng mặt hàng qua các năm và dự báo thời điểm nhập hàng giá rẻ nhất.

---

### 4. Nghiệp vụ Tồn kho & Lịch sử tồn kho chặt chẽ
Không sử dụng cơ chế cộng/trừ trực tiếp trên cột số lượng của bảng sản phẩm. Tất cả các biến động liên quan đến kho hàng phải được chứng minh bằng lịch sử:
- Mỗi khi có phát sinh: Nhập hàng (`+`), Bán hàng (`-`), Hết hạn/Hủy hàng (`-`), Kiểm kê điều chỉnh (`+/-`), hệ thống sẽ tạo một dòng ghi chép trong bảng `LichSuTonKho`.
- Số lượng tồn kho thực tế của sản phẩm tại bất kỳ thời điểm nào luôn bằng tổng các lượng thay đổi trong lịch sử. Cách thiết kế này đảm bảo kho hàng không bao giờ bị lệch dữ liệu không rõ nguyên nhân.

---

### 5. Nghiệp vụ Bán hàng & Nhập hàng (Luồng tài chính & Hàng hóa)
- **Phiếu Nhập Hàng (PhieuNhap):**
  - Ghi nhận chi tiết mặt hàng, số lượng, đơn giá nhập thực tế, chiết khấu.
  - Tự động cộng số lượng tồn kho sản phẩm (ghi nhận vào lịch sử tồn kho).
  - Ghi nhận công nợ của Nhà cung cấp (nếu thanh toán chưa đủ hoặc ghi nợ gối đầu).
  - Tạo phiếu chi tự động nếu chủ cửa hàng trả tiền mặt ngay lúc nhập hàng.
- **Hóa Đơn Bán Hàng (HoaDonBan):**
  - Hỗ trợ thao tác cực nhanh: Chọn nhanh khách hàng theo xóm, thêm sản phẩm bằng quét mã QR nội bộ hoặc tìm kiếm nhanh hoạt chất/tên thường gọi.
  - Tự động trừ tồn kho (ghi lịch sử tồn kho).
  - Tự động tính nợ mới của khách hàng: `Tổng tiền thanh toán` = `Tổng tiền hàng` - `Giảm giá` - `Khách trả tiền mặt`. Khoản thiếu hụt sẽ tự động cộng dồn vào tổng nợ gối đầu của khách hàng đó (`CongNoKhachHang`).

---

### 6. Sổ Quỹ & Phiếu Thu - Phiếu Chi tiền mặt
Sổ quỹ (`SoQuy`) đóng vai trò cân đối dòng tiền tại cửa hàng:
- **Phiếu Thu (`PhieuThu`):** Phát sinh khi bán hàng lấy tiền mặt, hoặc khi đi thu hồi công nợ của khách hàng cuối vụ.
- **Phiếu Chi (`PhieuChi`):** Phát sinh khi trả tiền nhà cung cấp, mua sắm thiết bị, hoặc hủy bỏ đơn hàng nhập.
- Sổ Quỹ tự động tính toán số dư tiền mặt: `Số dư` = `Tổng thu` - `Tổng chi`.

---

### 7. Nhật ký hoạt động & Tệp đính kèm
- **Nhật ký hoạt động (`NhatKyHoatDong`):** Ghi lại chi tiết mọi hành vi của chủ cửa hàng (ví dụ: "Chủ cửa hàng sửa giá bán Anvil 5SC từ 85,000đ thành 88,000đ lúc 10:15", "Xóa phiếu nhập hàng PN000192",...). Hỗ trợ tra cứu khi có thất thoát, nhầm lẫn dòng tiền hoặc kho hàng.
- **Tệp đính kèm (`TepDinhKem`):** Hỗ trợ lưu trữ ảnh chụp hóa đơn viết tay của nhà sản xuất, giấy chứng nhận đăng ký kinh doanh, giấy phép kiểm định chất lượng phân bón hóa học hoặc tài liệu hướng dẫn kỹ thuật phòng trừ sâu bệnh dạng PDF.
