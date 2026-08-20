export interface Hamlet {
  id: number;
  tenXom: string;
  moTa?: string;
  ngungHoatDong?: boolean;
}

export interface NhomHang {
  id: number;
  tenNhom: string;
  maNhomVietTat: string;
}

export interface DonViTinh {
  id: number;
  tenDonVi: string;
}

export interface CongDung {
  id: number;
  tenCongDung: string;
}

export interface CayTrong {
  id: number;
  tenCayTrong: string;
}

export interface BenhSauHai {
  id: number;
  tenBenhSau: string;
}

export interface NhaSanXuat {
  id: number;
  tenNhaSanXuat: string;
  quocGia: string;
}

export interface NhaCungCap {
  id: number;
  maNhaCungCap?: string; // NCC000001, etc.
  tenNhaCungCap: string;
  nguoiLienHe?: string; // old reference
  dienThoai: string;
  email?: string;
  diaChi?: string;
  soTaiKhoanNganHang?: string;
  maSoThue?: string;
  zalo?: string;
  facebook?: string;
  debt: number;
  
  // Address details
  quocGia?: string;
  tinhThanh?: string;
  quanHuyen?: string;
  phuongXa?: string;
  diaChiChiTiet?: string;

  // Contact person details
  nguoiLienHeHoTen?: string;
  nguoiLienHeChucVu?: string;
  nguoiLienHeDienThoai?: string;
  nguoiLienHeEmail?: string;

  website?: string;
  ghiChu?: string;
  trangThaiHoatDong?: 'HoatDong' | 'NgungHopTac';
  hanMucCongNo?: number;
  chinhSachCongNo?: 'Strict' | 'Warn' | 'Unlimited';

  // Policy purchase options
  chietKhau?: number;
  khuyenMai?: string;
  thuongDoanhSo?: string;
  hoTroVanChuyen?: string;
  hoTroDoiTra?: string;
  hanThanhToanNgay?: number;
  ghiChuChinhSach?: string;

  // Evaluative options
  hangNCC?: 'A' | 'B' | 'C';
  soSao?: number;
  ghiChuNoiBo?: string;

  // Soft delete audit
  DaXoa?: boolean;
  xoaThoiGian?: string;
  xoaNguoiThucHien?: string;
  xoaLyDo?: string;
}

export interface BaoGiaNCC {
  id: number;
  nhaCungCapId: number;
  hangHoaId: number;
  giaBao: number;
  donViTinh: string;
  ngayHieuLuc: string;
  ngayHetHieuLuc?: string;
  nguoiBaoGia?: string;
  ghiChu?: string;
  DaXoa?: boolean;
}

export interface TaiLieuNCC {
  id: number;
  nhaCungCapId: number;
  loaiTaiLieu: string; // 'Hợp đồng' | 'Báo giá' | 'Chính sách' | 'Catalogue' | 'Hóa đơn' | etc.
  tenFile: string;
  duongDanFile: string;
  kichThuoc: number; // in KB or bytes
  ngayUpload: string;
  ghiChu?: string;
  DaXoa?: boolean;
}

export interface Product {
  id: number;
  maHangHoa: string;
  nhomHangId: number;
  donViTinhId: number;
  nhaSanXuatId: number;
  tenTrenBaoBi: string;
  tenThuongGoi: string;
  hoatChat: string;
  hamLuong: string;
  quyCach: string;
  lieuLuong: string;
  thoiGianCachLy: number;
  giaNhapHienTai: number;
  giaBanHienTai: number;
  qrNoiBo: string;
  congDungIds: number[];
  cayTrongIds: number[];
  benhSauIds: number[];
  
  // Enriched fields from joins
  nhomHang?: string;
  donViTinh?: string;
  nhaSanXuat?: string;
  uses?: CongDung[];
  crops?: CayTrong[];
  pests?: BenhSauHai[];
  currentStock?: number;
  DaXoa?: boolean;
  nhaCungCapUuTienId?: number | null;
  nhaCungCapIds?: number[];
  nhaCungCapUuTienTen?: string;
}

export interface Customer {
  id: number;
  hoTen: string;
  dienThoai: string;
  diaChi: string;
  xomId: number;
  ngaySinh?: string;
  ngheNghiep: string;
  dienTichCanhTac: number;
  loaiCayTrongId: number;
  ghiChu: string;
  
  // Enriched fields
  tenXom?: string;
  cayTrongChuLuc?: string;
  debt: number;
  DaXoa?: boolean;
}

export interface SaleDetail {
  hangHoaId: number;
  soLuong: number;
  donGia: number;
  tenTrenBaoBi?: string;
}

export interface ImportDetail {
  hangHoaId: number;
  soLuong: number;
  donGia: number;
  tenTrenBaoBi?: string;
}

export interface DashboardStats {
  currentFund: number;
  totalClientDebt: number;
  totalSupplierDebt: number;
  todayDoanhThu: number;
  todayLoiNhuan: number;
  todayInvoicesCount: number;
  newCustomersToday: number;
  todayThuNo: number;
  productsCount: number;
  customersCount: number;
}

export interface SoQuy {
  id: number;
  ngayGiaoDich: string;
  loaiPhieu: 'Thu' | 'Chi';
  maChungTu: string;
  soTienThayDoi: number;
  soDuQuy: number;
}

export interface PhieuThu {
  id: number;
  maPhieuThu: string;
  ngayLap: string;
  soTien: number;
  nguonNop: string;
  khachHangId?: number;
  ghiChu?: string;
}

export interface PhieuChi {
  id: number;
  maPhieuChi: string;
  ngayLap: string;
  soTien: number;
  mucDichChi: string;
  nhaCungCapId?: number;
  ghiChu?: string;
}

export interface ActivityLog {
  id: number;
  thoiGian: string;
  loaiHanhDong: string;
  chiTiet: string;
}

export interface Backup {
  id: number;
  ngaySaoLuu: string;
  tenFileBackup: string;
  dungLuong: number;
  nguoiTao: string;
  ghiChu?: string;
}

export interface Attachment {
  id: number;
  ngayDinhKem: string;
  loaiChungTuThamChieu: string;
  maChungTuThamChieu: string;
  tenFile: string;
  duongDanFile: string;
  kichThuoc: number;
}
