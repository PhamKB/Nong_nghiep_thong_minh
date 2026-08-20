-- SQL Script Khoi tao Co So Du Lieu Quan Ly Vat Tu Nong Nghiep
-- He quan tri: MySQL 8.0+
-- Ten bang và cot: Tieng Viet khong dau (CamelCase)
-- Phien ban: 1.1

CREATE DATABASE IF NOT EXISTS QuanLyVatTuNongNghiep CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE QuanLyVatTuNongNghiep;

-- ==========================================
-- I. NHOM BANG DANH MUC (01 - 08)
-- ==========================================

-- 1. Xom
CREATE TABLE IF NOT EXISTS Xom (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TenXom VARCHAR(100) NOT NULL UNIQUE,
    MoTa VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. NhomHang
CREATE TABLE IF NOT EXISTS NhomHang (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TenNhom VARCHAR(100) NOT NULL UNIQUE,
    MaNhomVietTat VARCHAR(10) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. DonViTinh
CREATE TABLE IF NOT EXISTS DonViTinh (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TenDonVi VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CongDung
CREATE TABLE IF NOT EXISTS CongDung (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TenCongDung VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CayTrong
CREATE TABLE IF NOT EXISTS CayTrong (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TenCayTrong VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BenhSauHai
CREATE TABLE IF NOT EXISTS BenhSauHai (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TenBenhSau VARCHAR(150) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. NhaSanXuat
CREATE TABLE IF NOT EXISTS NhaSanXuat (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TenNhaSanXuat VARCHAR(150) NOT NULL UNIQUE,
    QuocGia VARCHAR(100) DEFAULT 'Viet Nam'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. NhaCungCap
CREATE TABLE IF NOT EXISTS NhaCungCap (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    TenNhaCungCap VARCHAR(150) NOT NULL,
    NguoiLienHe VARCHAR(100) NULL,
    DienThoai VARCHAR(20) NOT NULL,
    Email VARCHAR(100) NULL,
    DiaChi VARCHAR(255) NULL,
    SoTaiKhoanNganHang VARCHAR(50) NULL,
    MaSoThue VARCHAR(30) NULL,
    Zalo VARCHAR(50) NULL,
    Facebook VARCHAR(150) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- II. NHOM BANG NGHIEP VU CHINH (09 - 15)
-- ==========================================

-- 9. HangHoa
CREATE TABLE IF NOT EXISTS HangHoa (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MaHangHoa VARCHAR(20) NOT NULL UNIQUE,
    NhomHangId INT NOT NULL,
    DonViTinhId INT NOT NULL,
    NhaSanXuatId INT NOT NULL,
    TenTrenBaoBi VARCHAR(200) NOT NULL,
    TenThuongGoi VARCHAR(200) NOT NULL,
    HoatChat VARCHAR(150) NULL,
    HamLuong VARCHAR(100) NULL,
    QuyCach VARCHAR(100) NULL,
    LieuLuong VARCHAR(255) NULL,
    ThoiGianCachLy INT DEFAULT 7,
    GiaNhapHienTai DECIMAL(18, 2) DEFAULT 0,
    GiaBanHienTai DECIMAL(18, 2) DEFAULT 0,
    QrNoiBo VARCHAR(255) NULL,
    FOREIGN KEY (NhomHangId) REFERENCES NhomHang(Id),
    FOREIGN KEY (DonViTinhId) REFERENCES DonViTinh(Id),
    FOREIGN KEY (NhaSanXuatId) REFERENCES NhaSanXuat(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. HangHoaCongDung (Quan he nhieu - nhieu)
CREATE TABLE IF NOT EXISTS HangHoaCongDung (
    HangHoaId INT NOT NULL,
    CongDungId INT NOT NULL,
    PRIMARY KEY (HangHoaId, CongDungId),
    FOREIGN KEY (HangHoaId) REFERENCES HangHoa(Id) ON DELETE CASCADE,
    FOREIGN KEY (CongDungId) REFERENCES CongDung(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. HangHoaCayTrong (Quan he nhieu - nhieu)
CREATE TABLE IF NOT EXISTS HangHoaCayTrong (
    HangHoaId INT NOT NULL,
    CayTrongId INT NOT NULL,
    PRIMARY KEY (HangHoaId, CayTrongId),
    FOREIGN KEY (HangHoaId) REFERENCES HangHoa(Id) ON DELETE CASCADE,
    FOREIGN KEY (CayTrongId) REFERENCES CayTrong(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. HangHoaBenhSauHai (Quan he nhieu - nhieu)
CREATE TABLE IF NOT EXISTS HangHoaBenhSauHai (
    HangHoaId INT NOT NULL,
    BenhSauHaiId INT NOT NULL,
    PRIMARY KEY (HangHoaId, BenhSauHaiId),
    FOREIGN KEY (HangHoaId) REFERENCES HangHoa(Id) ON DELETE CASCADE,
    FOREIGN KEY (BenhSauHaiId) REFERENCES BenhSauHai(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. AnhHangHoa (Luu tru OCR)
CREATE TABLE IF NOT EXISTS AnhHangHoa (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    HangHoaId INT NOT NULL,
    LoaiAnh VARCHAR(50) NOT NULL, -- MatTruoc, MatSau, Tem, HoaDon
    DuongDanFile VARCHAR(255) NOT NULL,
    NoiDungOCR TEXT NULL,
    MoHinhAI VARCHAR(100) NULL,
    DoTinCay DECIMAL(5,2) NULL,
    DaXuLy BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (HangHoaId) REFERENCES HangHoa(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. GiaHangHoa (Nhat ky gia)
CREATE TABLE IF NOT EXISTS GiaHangHoa (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    HangHoaId INT NOT NULL,
    NgayCapNhat DATETIME NOT NULL,
    GiaNhap DECIMAL(18,2) NOT NULL,
    GiaBan DECIMAL(18,2) NOT NULL,
    NhaCungCapId INT NULL,
    FOREIGN KEY (HangHoaId) REFERENCES HangHoa(Id) ON DELETE CASCADE,
    FOREIGN KEY (NhaCungCapId) REFERENCES NhaCungCap(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. KhachHang
CREATE TABLE IF NOT EXISTS KhachHang (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    HoTen VARCHAR(150) NOT NULL,
    DienThoai VARCHAR(20) NULL,
    DiaChi VARCHAR(255) NULL,
    XomId INT NOT NULL,
    NgaySinh DATE NULL,
    NgheNghiep VARCHAR(100) DEFAULT 'Lam ruong',
    DienTichCanhTac DECIMAL(10,2) NULL,
    LoaiCayTrongId INT NULL,
    GhiChu VARCHAR(255) NULL,
    FOREIGN KEY (XomId) REFERENCES Xom(Id),
    FOREIGN KEY (LoaiCayTrongId) REFERENCES CayTrong(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- III. HOA DON & PHIEU NHAP (16 - 19)
-- ==========================================

-- 16. PhieuNhap
CREATE TABLE IF NOT EXISTS PhieuNhap (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MaPhieuNhap VARCHAR(50) NOT NULL UNIQUE,
    NhaCungCapId INT NOT NULL,
    NgayNhap DATETIME NOT NULL,
    TongTien DECIMAL(18,2) NOT NULL,
    DaThanhToan DECIMAL(18,2) DEFAULT 0,
    GhiChu VARCHAR(255) NULL,
    FOREIGN KEY (NhaCungCapId) REFERENCES NhaCungCap(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. ChiTietPhieuNhap
CREATE TABLE IF NOT EXISTS ChiTietPhieuNhap (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PhieuNhapId INT NOT NULL,
    HangHoaId INT NOT NULL,
    SoLuong DECIMAL(12,2) NOT NULL,
    DonGia DECIMAL(18,2) NOT NULL,
    ChietKhau DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (PhieuNhapId) REFERENCES PhieuNhap(Id) ON DELETE CASCADE,
    FOREIGN KEY (HangHoaId) REFERENCES HangHoa(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. HoaDonBan
CREATE TABLE IF NOT EXISTS HoaDonBan (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MaHoaDon VARCHAR(50) NOT NULL UNIQUE,
    KhachHangId INT NOT NULL,
    NgayBan DATETIME NOT NULL,
    TongTien DECIMAL(18,2) NOT NULL,
    GiamGia DECIMAL(18,2) DEFAULT 0,
    KhachTra DECIMAL(18,2) DEFAULT 0,
    GhiChu VARCHAR(255) NULL,
    FOREIGN KEY (KhachHangId) REFERENCES KhachHang(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. ChiTietHoaDonBan
CREATE TABLE IF NOT EXISTS ChiTietHoaDonBan (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    HoaDonBanId INT NOT NULL,
    HangHoaId INT NOT NULL,
    SoLuong DECIMAL(12,2) NOT NULL,
    DonGia DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (HoaDonBanId) REFERENCES HoaDonBan(Id) ON DELETE CASCADE,
    FOREIGN KEY (HangHoaId) REFERENCES HangHoa(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- IV. TON KHO & CONG NO (20 - 23)
-- ==========================================

-- 20. TonKho
CREATE TABLE IF NOT EXISTS TonKho (
    HangHoaId INT PRIMARY KEY,
    SoLuongTon DECIMAL(12,2) DEFAULT 0,
    NgayCapNhat DATETIME NOT NULL,
    FOREIGN KEY (HangHoaId) REFERENCES HangHoa(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. LichSuTonKho
CREATE TABLE IF NOT EXISTS LichSuTonKho (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    HangHoaId INT NOT NULL,
    NgayPhatSinh DATETIME NOT NULL,
    LoaiGiaoDich VARCHAR(50) NOT NULL, -- NhapHang, BanHang, KiemKho, HuyBo
    ThamChieuId VARCHAR(50) NULL,
    SoLuongThayDoi DECIMAL(12,2) NOT NULL,
    GhiChu VARCHAR(255) NULL,
    FOREIGN KEY (HangHoaId) REFERENCES HangHoa(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. CongNoKhachHang
CREATE TABLE IF NOT EXISTS CongNoKhachHang (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    KhachHangId INT NOT NULL UNIQUE,
    TongNo DECIMAL(18,2) DEFAULT 0,
    NgayCapNhatCuoi DATETIME NOT NULL,
    FOREIGN KEY (KhachHangId) REFERENCES KhachHang(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. CongNoNhaCungCap
CREATE TABLE IF NOT EXISTS CongNoNhaCungCap (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    NhaCungCapId INT NOT NULL UNIQUE,
    TongNo DECIMAL(18,2) DEFAULT 0,
    NgayCapNhatCuoi DATETIME NOT NULL,
    FOREIGN KEY (NhaCungCapId) REFERENCES NhaCungCap(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- V. QUY, THU CHI & CAI DAT (24 - 27)
-- ==========================================

-- 24. PhieuThu
CREATE TABLE IF NOT EXISTS PhieuThu (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MaPhieuThu VARCHAR(50) NOT NULL UNIQUE,
    NgayLap DATETIME NOT NULL,
    SoTien DECIMAL(18,2) NOT NULL,
    NguonNop VARCHAR(150) NOT NULL,
    KhachHangId INT NULL,
    GhiChu VARCHAR(255) NULL,
    FOREIGN KEY (KhachHangId) REFERENCES KhachHang(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. PhieuChi
CREATE TABLE IF NOT EXISTS PhieuChi (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MaPhieuChi VARCHAR(50) NOT NULL UNIQUE,
    NgayLap DATETIME NOT NULL,
    SoTien DECIMAL(18,2) NOT NULL,
    MucDichChi VARCHAR(150) NOT NULL,
    NhaCungCapId INT NULL,
    GhiChu VARCHAR(255) NULL,
    FOREIGN KEY (NhaCungCapId) REFERENCES NhaCungCap(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. SoQuy
CREATE TABLE IF NOT EXISTS SoQuy (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    NgayGiaoDich DATETIME NOT NULL,
    LoaiPhieu VARCHAR(10) NOT NULL, -- Thu, Chi
    MaChungTu VARCHAR(50) NOT NULL,
    SoTienThayDoi DECIMAL(18,2) NOT NULL,
    SoDuQuy DECIMAL(18,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. CaiDat
CREATE TABLE IF NOT EXISTS CaiDat (
    Khoa VARCHAR(100) PRIMARY KEY,
    GiaTri TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- VI. AI & HE THONG (28 - 32)
-- ==========================================

-- 28. HoiDapAI
CREATE TABLE IF NOT EXISTS HoiDapAI (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ThoiGian DATETIME NOT NULL,
    CauHoiKhach TEXT NOT NULL,
    CauTraLoiAI TEXT NOT NULL,
    NguonDuLieuBaoGom VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. ThongKeNgay
CREATE TABLE IF NOT EXISTS ThongKeNgay (
    NgayThongKe DATE PRIMARY KEY,
    DoanhThu DECIMAL(18,2) DEFAULT 0,
    LoiNhuan DECIMAL(18,2) DEFAULT 0,
    SoHoaDon INT DEFAULT 0,
    SoKhachHangMoi INT DEFAULT 0,
    TongThuNo DECIMAL(18,2) DEFAULT 0,
    TongChiNo DECIMAL(18,2) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. PhienBanDuLieu
CREATE TABLE IF NOT EXISTS PhienBanDuLieu (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    NgaySaoLuu DATETIME NOT NULL,
    TenFileBackup VARCHAR(255) NOT NULL,
    DungLuong BIGINT NOT NULL,
    NguoiTao VARCHAR(100) DEFAULT 'Chu cua hang',
    GhiChu VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. NhatKyHoatDong
CREATE TABLE IF NOT EXISTS NhatKyHoatDong (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ThoiGian DATETIME NOT NULL,
    LoaiHanhDong VARCHAR(50) NOT NULL,
    ChiTiet TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 32. TepDinhKem
CREATE TABLE IF NOT EXISTS TepDinhKem (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    NgayDinhKem DATETIME NOT NULL,
    LoaiChungTuThamChieu VARCHAR(50) NOT NULL,
    MaChungTuThamChieu VARCHAR(50) NOT NULL,
    TenFile VARCHAR(255) NOT NULL,
    DuongDanFile VARCHAR(255) NOT NULL,
    KichThuoc INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- VII. SEED INITIAL REFERENCE DATA
-- ==========================================

-- Seed Xom
INSERT INTO Xom (TenXom, MoTa) VALUES
('Xom Tuy Dinh', 'Dia ban Tuy Dinh'),
('Xom Tay Cuong', 'Dia ban Tay Cuong'),
('Xom Thanh Gian', 'Dia ban Thanh Gian'),
('Xom Dong Hai', 'Dia ban Dong Hai'),
('Xom Hoa Loc', 'Dia ban Hoa Loc'),
('Xom Dong Tho', 'Dia ban Dong Tho'),
('Xom Van Hai', 'Dia ban Van Hai'),
('Xom Tan Vinh', 'Dia ban Tan Vinh'),
('Xom Dong Yen', 'Dia ban Dong Yen'),
('Xom Kim Tan', 'Dia ban Kim Tan');

-- Seed NhomHang
INSERT INTO NhomHang (TenNhom, MaNhomVietTat) VALUES
('Phan bon', 'PB'),
('Thuoc bao ve thuc vat', 'TB'),
('Hat giong', 'HG'),
('Dung cu nong nghiep', 'DC');

-- Seed DonViTinh
INSERT INTO DonViTinh (TenDonVi) VALUES
('Chai'), ('Goi'), ('Bao'), ('Kg'), ('Can'), ('Vien');

-- Seed CongDung
INSERT INTO CongDung (TenDonVi) VALUES
('Tru sau'), ('Tru benh'), ('Tru co'), ('Kich re'), ('Duong la'), ('Ra hoa'), ('Dau qua'), ('Diet oc'), ('Vi sinh');

-- Seed CayTrong
INSERT INTO CayTrong (TenCayTrong) VALUES
('Lua'), ('Ngo'), ('Khoai'), ('Lac'), ('Rau mau'), ('Cay an qua'), ('Cay co mui'), ('Dua huyen');

-- Seed BenhSauHai
INSERT INTO BenhSauHai (TenBenhSau) VALUES
('Dao on'), ('Kho van'), ('Ray nau'), ('Sau cuon la'), ('Bac la'), ('Oc buou vang'), ('Sau to'), ('Co long vuc');
