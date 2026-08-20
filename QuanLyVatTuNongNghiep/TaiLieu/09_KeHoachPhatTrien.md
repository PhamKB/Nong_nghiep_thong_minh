# TÀI LIỆU 09: KẾ HOẠCH PHÁT TRIỂN DỰ ÁN (PROJECT TIMELINE)
## PHÂN KỲ PHÁT TRIỂN & CÁC CỘT MỐC ĐẠT ĐƯỢC

Lộ trình phát triển hệ thống quản lý cửa hàng Vật tư nông nghiệp tích hợp AI được phân tách thành 3 giai đoạn rõ ràng nhằm đảm bảo hiệu quả chi phí và thời gian triển khai nhanh chóng.

---

### GIAI ĐOẠN 1: QUẢN LÝ CƠ BẢN VÀ ĐẶC THÙ ĐỊA PHƯƠNG (PHIÊN BẢN 1.1)
*Trọng tâm: Vận hành ổn định tại một cửa hàng, tối ưu hóa các nghiệp vụ cơ bản, chuẩn hóa cấu trúc 32 bảng.*

- **Mục tiêu tính năng:**
  - [x] Thiết kế cấu trúc CSDL 32 bảng Tiếng Việt không dấu hoàn chỉnh.
  - [x] Quản lý hàng hóa chuẩn AI-ready (Hoạt chất, thời gian cách ly, nhiều-nhiều cây trồng, sâu bệnh).
  - [x] Quản lý khách hàng gán địa bàn (Xóm) có cơ chế linh động tự nạp xóm khác.
  - [x] Luồng nghiệp vụ Xuất - Nhập kho ghi nhận biến động tồn kho chi tiết (`LichSuTonKho`).
  - [x] Quản lý công nợ gối vụ của khách hàng và công nợ gối đầu nhà cung cấp sỉ.
  - [x] Sổ quỹ tiền mặt và thu chi quỹ thông qua phiếu thu/chi.
  - [x] Nhật ký thao tác bảo mật dòng tiền (`NhatKyHoatDong`).
  - [x] Tích hợp AI OCR đọc bao bì trực quan thông qua camera/upload file ảnh nhãn thuốc.
- **Tiêu chuẩn kỹ thuật:**
  - Chạy local mượt mà trên nền tảng Full-stack Node + React phục vụ kiểm thử nhanh.
  - Chạy môi trường ASP.NET Core 8 Web API kết nối MySQL.

---

### GIAI ĐOẠN 2: TÍCH HỢP AI CHUYÊN SÂU & THIẾT BỊ DI ĐỘNG (PHIÊN BẢN 2.0)
*Trọng tâm: Đưa trí tuệ nhân tạo vào hỗ trợ bán hàng, nhận diện nhanh bằng camera, tối ưu hóa di động.*

- **Mục tiêu tính năng:**
  - [ ] **AI OCR Nâng cao:** Tích hợp trực tiếp trên điện thoại di động thông qua ứng dụng lai (Hybrid App). Quét trực tiếp nhãn chai thuốc bảo vệ thực vật bị rách, xước chữ vẫn bóc tách được hoạt chất nhờ khả năng suy luận của Gemini.
  - [ ] **AI Chatbot trợ lý bán hàng:** Khách đến hỏi mua thuốc, chủ cửa hàng chỉ cần nói hoặc gõ triệu chứng cây trồng (Ví dụ: "Lá cam bị vàng lá gân xanh phun gì?"), AI tự động tra cứu dữ liệu bệnh, đề xuất các loại thuốc đang có sẵn tại kệ hàng của cửa hàng kèm liều lượng pha.
  - [ ] **Quét mã QR nội bộ siêu tốc:** Chủ cửa hàng dán QR nội bộ lên kệ hàng. Bán hàng chỉ cần dùng camera điện thoại quét QR dán trên kệ là tự động nạp mặt hàng vào hóa đơn trong 1 giây, bỏ qua bước gõ tìm kiếm.
  - [ ] **Đồng bộ ảnh & hóa đơn đám mây (Cloud Storage):** Lưu trữ các tệp đính kèm (`TepDinhKem`), hóa đơn VAT sỉ trực tiếp lên Google Cloud Storage hoặc AWS S3.

---

### GIAI ĐOẠN 3: MULTI-STORE VÀ CLOUD SAAS (PHIÊN BẢN 3.0)
*Trọng tâm: Thương mại hóa phần mềm, hỗ trợ chuỗi cửa hàng vật tư, đồng bộ thời gian thực.*

- **Mục tiêu tính năng:**
  - [ ] **Hệ thống Đa cửa hàng (Multi-store):** Quản lý luân chuyển hàng hóa giữa các kho của các chi nhánh khác nhau.
  - [ ] **Phân quyền người dùng (RBAC):** Đăng nhập nhiều nhân viên bán hàng, phân quyền xem doanh thu/lợi nhuận (chỉ chủ cửa hàng được xem, nhân viên bán hàng chỉ được lập hóa đơn).
  - [ ] **Báo cáo phân tích AI nâng cao:** AI phân tích doanh thu cả năm, dự đoán mặt hàng nào sẽ bán chạy vào vụ chiêm xuân sắp tới để chủ cửa hàng chủ động thương lượng nhập sỉ số lượng lớn từ nhà cung cấp với giá tốt nhất.
  - [ ] **Ứng dụng di động Native (Android/iOS):** Viết app chuyên biệt cho di động chạy mượt mà không phụ thuộc trình duyệt web.
