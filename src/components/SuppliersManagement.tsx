import React, { useState, useEffect } from 'react';
import { NhaCungCap, Product, BaoGiaNCC, TaiLieuNCC } from '../types';
import { SmartComboBox } from './SmartUI';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  FileText, 
  Check, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  Star, 
  Award, 
  Download, 
  Upload, 
  User, 
  MapPin, 
  Briefcase, 
  Globe, 
  Building, 
  ShieldAlert, 
  ShieldCheck,
  DollarSign, 
  ExternalLink, 
  FileDown, 
  Eye, 
  Undo, 
  CheckCircle, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  BarChart2,
  FileSpreadsheet
} from 'lucide-react';

interface SuppliersManagementProps {
  onSuccess: () => void;
}

export default function SuppliersManagement({ onSuccess }: SuppliersManagementProps) {
  // Lists & data state
  const [suppliers, setSuppliers] = useState<NhaCungCap[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tab configuration
  const [mainTab, setMainTab] = useState<'list' | 'compare' | 'ai-report'>('list');
  const [filterStatus, setFilterStatus] = useState<'All' | 'HoatDong' | 'NgungHopTac' | 'DaXoa'>('All');
  
  // Selection & Details Drawers
  const [selectedSupplier, setSelectedSupplier] = useState<NhaCungCap | null>(null);
  const [supplierQuotes, setSupplierQuotes] = useState<any[]>([]);
  const [supplierDocs, setSupplierDocs] = useState<TaiLieuNCC[]>([]);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'info' | 'stats' | 'quotes' | 'docs'>('info');

  // Comparison State
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [selectedCompProdId, setSelectedCompProdId] = useState<string>('');

  // Form Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<NhaCungCap | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Quote Form State
  const [quoteProductId, setQuoteProductId] = useState('');
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteUnit, setQuoteUnit] = useState('');
  const [quoteValidFrom, setQuoteValidFrom] = useState('');
  const [quoteValidTo, setQuoteValidTo] = useState('');
  const [quotePerson, setQuotePerson] = useState('');
  const [quoteNote, setQuoteNote] = useState('');

  // Document Form State
  const [docCategory, setDocCategory] = useState('Hợp đồng');
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docNote, setDocNote] = useState('');

  // Soft delete confirmation modal
  const [supplierToDelete, setSupplierToDelete] = useState<NhaCungCap | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Excel Import Simulation state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResults, setImportResults] = useState<{line: number; status: 'Success' | 'Error'; message: string}[]>([]);

  // AI Deep Analysis State
  const [aiSelectedSupplierId, setAiSelectedSupplierId] = useState('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');

  // Toast Notification state (guarantees zero blocked browser alerts in iframes)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleRunAiAnalysis = async () => {
    if (!aiSelectedSupplierId) {
      setAiError('Vui lòng chọn một nhà cung cấp để phân tích.');
      return;
    }
    try {
      setAiAnalyzing(true);
      setAiError('');
      setAiAnalysisResult(null);
      const res = await fetch(`/api/suppliers/${aiSelectedSupplierId}/ai-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || 'Lỗi chạy phân tích AI.');
      } else {
        setAiAnalysisResult(data);
        // Refresh list to show newly updated AI supplierScore
        loadSuppliers();
      }
    } catch (e) {
      setAiError('Lỗi kết nối máy chủ khi gọi phân tích AI.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Main Form fields state
  const [formFields, setFormFields] = useState({
    tenNhaCungCap: '',
    dienThoai: '',
    email: '',
    diaChi: '',
    soTaiKhoanNganHang: '',
    maSoThue: '',
    zalo: '',
    facebook: '',
    website: '',
    ghiChu: '',
    
    // Address detail
    quocGia: 'Việt Nam',
    tinhThanh: '',
    quanHuyen: '',
    phuongXa: '',
    diaChiChiTiet: '',

    // Contact Person
    nguoiLienHeHoTen: '',
    nguoiLienHeChucVu: '',
    nguoiLienHeDienThoai: '',
    nguoiLienHeEmail: '',

    // Policies
    trangThaiHoatDong: 'HoatDong' as 'HoatDong' | 'NgungHopTac',
    hanMucCongNo: '100000000', // Default 100M VND limit
    chinhSachCongNo: 'Warn' as 'Strict' | 'Warn' | 'Unlimited',
    chietKhau: '0',
    khuyenMai: '',
    thuongDoanhSo: '',
    hoTroVanChuyen: '',
    hoTroDoiTra: '',
    hanThanhToanNgay: '30',
    ghiChuChinhSach: '',

    // Evaluation
    hangNCC: 'B' as 'A' | 'B' | 'C',
    soSao: 5,
    ghiChuNoiBo: ''
  });

  // Load basic data
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const includeDeleted = filterStatus === 'DaXoa';
      const sRes = await fetch(`/api/suppliers?includeDeleted=${includeDeleted}`);
      const sData = await sRes.json();
      setSuppliers(sData);

      const pRes = await fetch('/api/products');
      const pData = await pRes.json();
      setProducts(pData);
    } catch (e) {
      console.error("Lỗi nạp dữ liệu nhà cung cấp", e);
    } finally {
      setLoading(false);
    }
  };

  const loadComparisons = async () => {
    try {
      const res = await fetch('/api/suppliers/quotes/compare');
      const data = await res.json();
      setComparisons(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [filterStatus]);

  useEffect(() => {
    if (mainTab === 'compare') {
      loadComparisons();
    }
  }, [mainTab]);

  // Handle supplier details loading
  const handleSelectSupplier = async (sup: NhaCungCap) => {
    setSelectedSupplier(sup);
    setActiveDetailsTab('info');
    try {
      // Load quotes and documents in parallel
      const [qRes, dRes] = await Promise.all([
        fetch(`/api/suppliers/${sup.id}/quotes`),
        fetch(`/api/suppliers/${sup.id}/documents`)
      ]);
      const qData = await qRes.json();
      const dData = await dRes.json();
      setSupplierQuotes(qData);
      setSupplierDocs(dData);
    } catch (e) {
      console.error(e);
    }
  };

  // Create or Update Supplier
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formFields.tenNhaCungCap.trim()) {
      setFormError('Vui lòng nhập Tên nhà cung cấp.');
      return;
    }
    if (!formFields.dienThoai.trim()) {
      setFormError('Vui lòng nhập Số điện thoại.');
      return;
    }

    // Build payload
    const payload = {
      ...formFields,
      hanMucCongNo: Number(formFields.hanMucCongNo) || 0,
      chietKhau: Number(formFields.chietKhau) || 0,
      hanThanhToanNgay: Number(formFields.hanThanhToanNgay) || 0,
      soSao: Number(formFields.soSao) || 5
    };

    const isEdit = !!editingSupplier;
    const url = isEdit ? `/api/suppliers/${editingSupplier!.id}` : '/api/suppliers';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Đã có lỗi xảy ra.');
      } else {
        setFormSuccess(isEdit ? 'Cập nhật nhà cung cấp thành công!' : 'Thêm mới nhà cung cấp thành công!');
        onSuccess();
        setTimeout(() => {
          setShowFormModal(false);
          loadSuppliers();
        }, 1200);
      }
    } catch (err) {
      setFormError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // Open Form modal
  const openForm = (sup: NhaCungCap | null) => {
    setEditingSupplier(sup);
    setFormError('');
    setFormSuccess('');
    
    if (sup) {
      // Map existing values
      setFormFields({
        tenNhaCungCap: sup.tenNhaCungCap || '',
        dienThoai: sup.dienThoai || '',
        email: sup.email || '',
        diaChi: sup.diaChi || '',
        soTaiKhoanNganHang: sup.soTaiKhoanNganHang || '',
        maSoThue: sup.maSoThue || '',
        zalo: sup.zalo || '',
        facebook: sup.facebook || '',
        website: sup.website || '',
        ghiChu: sup.ghiChu || '',
        
        quocGia: sup.quocGia || 'Việt Nam',
        tinhThanh: sup.tinhThanh || '',
        quanHuyen: sup.quanHuyen || '',
        phuongXa: sup.phuongXa || '',
        diaChiChiTiet: sup.diaChiChiTiet || '',

        nguoiLienHeHoTen: sup.nguoiLienHeHoTen || '',
        nguoiLienHeChucVu: sup.nguoiLienHeChucVu || '',
        nguoiLienHeDienThoai: sup.nguoiLienHeDienThoai || '',
        nguoiLienHeEmail: sup.nguoiLienHeEmail || '',

        trangThaiHoatDong: sup.trangThaiHoatDong || 'HoatDong',
        hanMucCongNo: String(sup.hanMucCongNo || 0),
        chinhSachCongNo: sup.chinhSachCongNo || 'Warn',
        chietKhau: String(sup.chietKhau || 0),
        khuyenMai: sup.khuyenMai || '',
        thuongDoanhSo: sup.thuongDoanhSo || '',
        hoTroVanChuyen: sup.hoTroVanChuyen || '',
        hoTroDoiTra: sup.hoTroDoiTra || '',
        hanThanhToanNgay: String(sup.hanThanhToanNgay || 30),
        ghiChuChinhSach: sup.ghiChuChinhSach || '',

        hangNCC: sup.hangNCC || 'B',
        soSao: sup.soSao || 5,
        ghiChuNoiBo: sup.ghiChuNoiBo || ''
      });
    } else {
      // Reset form fields
      setFormFields({
        tenNhaCungCap: '',
        dienThoai: '',
        email: '',
        diaChi: '',
        soTaiKhoanNganHang: '',
        maSoThue: '',
        zalo: '',
        facebook: '',
        website: '',
        ghiChu: '',
        
        quocGia: 'Việt Nam',
        tinhThanh: '',
        quanHuyen: '',
        phuongXa: '',
        diaChiChiTiet: '',

        nguoiLienHeHoTen: '',
        nguoiLienHeChucVu: '',
        nguoiLienHeDienThoai: '',
        nguoiLienHeEmail: '',

        trangThaiHoatDong: 'HoatDong',
        hanMucCongNo: '100000000',
        chinhSachCongNo: 'Warn',
        chietKhau: '0',
        khuyenMai: '',
        thuongDoanhSo: '',
        hoTroVanChuyen: '',
        hoTroDoiTra: '',
        hanThanhToanNgay: '30',
        ghiChuChinhSach: '',

        hangNCC: 'B',
        soSao: 5,
        ghiChuNoiBo: ''
      });
    }
    setShowFormModal(true);
  };

  // Toggle Coop Status (BR-05-006, BR-05-016)
  const toggleStatus = async (sup: NhaCungCap) => {
    const isDeactivate = sup.trangThaiHoatDong === 'HoatDong';
    const endpoint = isDeactivate ? 'deactivate' : 'activate';
    try {
      setLoading(true);
      const res = await fetch(`/api/suppliers/${sup.id}/${endpoint}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Không thể thay đổi trạng thái.', 'error');
      } else {
        showToast(isDeactivate ? `Đã ngừng hợp tác thành công với ${sup.tenNhaCungCap}` : `Đã kích hoạt hoạt động lại cho ${sup.tenNhaCungCap}`, 'success');
        loadSuppliers();
        if (selectedSupplier && selectedSupplier.id === sup.id) {
          handleSelectSupplier({ ...selectedSupplier, trangThaiHoatDong: isDeactivate ? 'NgungHopTac' : 'HoatDong' });
        }
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Soft Delete (BR-05-014, BR-05-016)
  const confirmDelete = (sup: NhaCungCap) => {
    setSupplierToDelete(sup);
    setDeleteReason('');
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/suppliers/${supplierToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Không thể xóa nhà cung cấp.', 'error');
      } else {
        showToast(`Đã xóa mềm nhà cung cấp ${supplierToDelete.tenNhaCungCap} thành công.`, 'success');
        setSupplierToDelete(null);
        setSelectedSupplier(null);
        loadSuppliers();
        onSuccess();
      }
    } catch (e) {
      showToast('Lỗi kết nối.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Restore Soft Deleted Supplier (BR-05-015)
  const handleRestoreSupplier = async (sup: NhaCungCap) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/suppliers/${sup.id}/restore`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Lỗi khôi phục.', 'error');
      } else {
        showToast(`Đã khôi phục thành công hoạt động cho ${sup.tenNhaCungCap}.`, 'success');
        loadSuppliers();
        onSuccess();
      }
    } catch (e) {
      showToast('Lỗi kết nối.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add Quote (BR-05-021)
  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !quoteProductId || !quotePrice || !quoteUnit || !quoteValidFrom) {
      alert('Vui lòng điền đủ thông tin báo giá.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/suppliers/${selectedSupplier.id}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hangHoaId: Number(quoteProductId),
          giaBao: Number(quotePrice),
          donViTinh: quoteUnit,
          ngayHieuLuc: quoteValidFrom,
          ngayHetHieuLuc: quoteValidTo,
          nguoiBaoGia: quotePerson,
          ghiChu: quoteNote
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Lỗi thêm báo giá.', 'error');
      } else {
        // Reset quote form fields
        setQuoteProductId('');
        setQuotePrice('');
        setQuoteUnit('');
        setQuoteValidFrom('');
        setQuoteValidTo('');
        setQuotePerson('');
        setQuoteNote('');
        
        // Reload supplier quotes
        const qRes = await fetch(`/api/suppliers/${selectedSupplier.id}/quotes`);
        const qData = await qRes.json();
        setSupplierQuotes(qData);
        showToast('Đã thêm báo giá thành công!', 'success');
      }
    } catch (e) {
      showToast('Lỗi máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Quote
  const handleDeleteQuote = async (quoteId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa báo giá này?')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/suppliers/quotes/${quoteId}`, { method: 'DELETE' });
      if (res.ok) {
        setSupplierQuotes(prev => prev.filter(q => q.id !== quoteId));
        showToast('Báo giá đã được xóa thành công.', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Không thể xóa báo giá.', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add Document (BR-05-023)
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !docName || !docUrl) {
      showToast('Vui lòng nhập Tên tài liệu và đường dẫn file.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/suppliers/${selectedSupplier.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loaiTaiLieu: docCategory,
          tenFile: docName,
          duongDanFile: docUrl,
          kichThuoc: Math.floor(Math.random() * 5000) + 120, // simulate file size in KB
          ghiChu: docNote
        })
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Lỗi lưu tài liệu.', 'error');
      } else {
        setDocName('');
        setDocUrl('');
        setDocNote('');

        const dRes = await fetch(`/api/suppliers/${selectedSupplier.id}/documents`);
        const dData = await dRes.json();
        setSupplierDocs(dData);
        showToast('Tài liệu đã được tải lên và lưu trữ thành công!', 'success');
      }
    } catch (e) {
      showToast('Lỗi kết nối.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Document (BR-05-023)
  const handleDeleteDocument = async (docId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài liệu này? (Hệ thống sẽ thực hiện Xóa Mềm - Soft Delete)')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/suppliers/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        setSupplierDocs(prev => prev.filter(d => d.id !== docId));
        showToast('Tài liệu đã được xóa thành công.', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Không thể xóa tài liệu.', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Simulate Excel Import (BR-05-017)
  const handleSimulateImport = () => {
    setShowImportModal(true);
    setImportResults([
      { line: 1, status: 'Success', message: 'Hợp lệ: Công ty CP Vật tư Nông nghiệp Thái Bình - Trùng khớp dữ liệu' },
      { line: 2, status: 'Error', message: 'Lỗi dòng 2: Số điện thoại "0912345678" bị TRÙNG với NCC "Tổng kho sỉ Miền Bắc" (BR-05-017)' },
      { line: 3, status: 'Success', message: 'Hợp lệ: Đại lý Thuốc bảo vệ thực vật An Giang - Thêm mới thành công' },
      { line: 4, status: 'Error', message: 'Lỗi dòng 4: Tên nhà cung cấp trống' },
      { line: 5, status: 'Success', message: 'Hợp lệ: Nhà máy phân bón hữu cơ Bio-Sông Hồng - Thêm mới thành công' }
    ]);
  };

  // Apply simulated import success records
  const applyImportedData = async () => {
    try {
      setLoading(true);
      // Let's add the 3 success ones
      const listToImport = [
        { tenNhaCungCap: "Công ty CP Vật tư Nông nghiệp Thái Bình", dienThoai: "02273839281", diaChi: "TP. Thái Bình", email: "vattutb@gmail.com" },
        { tenNhaCungCap: "Đại lý Thuốc bảo vệ thực vật An Giang", dienThoai: "02963884422", diaChi: "TP. Long Xuyên, An Giang", email: "bvtvanjiang@gmail.com" },
        { tenNhaCungCap: "Nhà máy phân bón hữu cơ Bio-Sông Hồng", dienThoai: "02438887711", diaChi: "H. Gia Lâm, Hà Nội", email: "biosonghong@hn.vn" }
      ];

      for (const item of listToImport) {
        await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }

      showToast('Đã nhập khẩu thành công 3 bản ghi hợp lệ từ danh sách Excel!', 'success');
      setShowImportModal(false);
      loadSuppliers();
      onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Simulate Excel Export (BR-05-018)
  const handleExportData = (type: 'excel' | 'pdf' | 'csv') => {
    showToast(`Đã kết xuất báo cáo dữ liệu ${type.toUpperCase()} thành công! [BR-05-025]`, 'success');
    
    // Simulate File Download
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(suppliers, null, 2)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `DanhSach_NhaCungCap_BaoCao_${type}_${new Date().toISOString().split('T')[0]}.${type === 'excel' ? 'xlsx' : type}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Filter & Search Implementation (BR-05-010, BR-05-001)
  const removeAccentsHelper = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  const filteredSuppliers = suppliers.filter(sup => {
    // Search Filter (BR-05-010)
    const normSearch = removeAccentsHelper(searchTerm);
    const matchSearch = searchTerm === '' ||
      removeAccentsHelper(sup.tenNhaCungCap).includes(normSearch) ||
      (sup.maNhaCungCap && removeAccentsHelper(sup.maNhaCungCap).includes(normSearch)) ||
      (sup.dienThoai && removeAccentsHelper(sup.dienThoai).includes(normSearch)) ||
      (sup.email && removeAccentsHelper(sup.email).includes(normSearch)) ||
      (sup.maSoThue && removeAccentsHelper(sup.maSoThue).includes(normSearch)) ||
      (sup.nguoiLienHeHoTen && removeAccentsHelper(sup.nguoiLienHeHoTen).includes(normSearch)) ||
      (sup.nguoiLienHe && removeAccentsHelper(sup.nguoiLienHe).includes(normSearch));

    // Status Filter (BR-05-001, BR-05-006)
    let matchStatus = true;
    if (filterStatus === 'HoatDong') {
      matchStatus = sup.trangThaiHoatDong === 'HoatDong' && sup.DaXoa !== true;
    } else if (filterStatus === 'NgungHopTac') {
      matchStatus = sup.trangThaiHoatDong === 'NgungHopTac' && sup.DaXoa !== true;
    } else if (filterStatus === 'DaXoa') {
      matchStatus = sup.DaXoa === true;
    } else {
      // 'All' showing all active & inactive suppliers that are not deleted
      matchStatus = sup.DaXoa !== true;
    }

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 relative" id="suppliers-panel">
      {/* Toast Notification for Iframe Compatibility */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-800 transition-all">
          <div className={`h-2.5 w-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'}`} />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}
      {/* Header section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="text-[#166534] h-6 w-6" /> Quản Lý Đối Tác &amp; Nhà Cung Cấp
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
            Lưu trữ Single Source of Truth toàn bộ hệ thống đại lý sỉ, công ty nhập khẩu. AI phân tích báo giá, lịch sử nhập hàng sỉ, công nợ gối đầu và đưa ra đề xuất tối ưu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateImport}
            className="px-3.5 py-2 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200 hover:bg-emerald-100 transition text-xs font-bold flex items-center gap-1.5"
            id="btn-import-suppliers"
          >
            <Upload className="h-4 w-4" /> Nhập Excel
          </button>
          
          <button
            onClick={() => openForm(null)}
            className="px-4 py-2 rounded-lg bg-[#166534] hover:bg-[#15803d] text-white shadow-sm transition text-xs font-bold flex items-center gap-1.5"
            id="btn-add-supplier"
          >
            <Plus className="h-4.5 w-4.5" /> Thêm Nhà Phân Phối
          </button>
        </div>
      </div>

      {/* Main Tabs Selection */}
      <div className="flex border-b border-slate-200" id="supplier-main-tabs">
        <button
          onClick={() => setMainTab('list')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition ${mainTab === 'list' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Danh Sách Nhà Phân Phối ({filteredSuppliers.length})
        </button>
        <button
          onClick={() => setMainTab('compare')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${mainTab === 'compare' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <BarChart2 className="h-4 w-4" /> So Sánh Báo Giá Sỉ (BR-05-022)
        </button>
        <button
          onClick={() => setMainTab('ai-report')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${mainTab === 'ai-report' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" /> AI Phân Tích &amp; Đề Xuất (BR-05-020)
        </button>
      </div>

      {mainTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: List of Suppliers */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filtering Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo Mã, Tên, Số điện thoại, MST, Người liên hệ..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  id="search-suppliers-input"
                />
              </div>

              {/* Status Pills */}
              <div className="flex bg-slate-100 rounded-lg p-1 text-[11px] font-bold shrink-0 self-stretch md:self-auto">
                <button
                  onClick={() => setFilterStatus('All')}
                  className={`px-3 py-1.5 rounded-md transition ${filterStatus === 'All' ? 'bg-white text-[#166534] shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterStatus('HoatDong')}
                  className={`px-3 py-1.5 rounded-md transition ${filterStatus === 'HoatDong' ? 'bg-white text-[#166534] shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  Đang hoạt động
                </button>
                <button
                  onClick={() => setFilterStatus('NgungHopTac')}
                  className={`px-3 py-1.5 rounded-md transition ${filterStatus === 'NgungHopTac' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  Ngừng hợp tác
                </button>
                <button
                  onClick={() => setFilterStatus('DaXoa')}
                  className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${filterStatus === 'DaXoa' ? 'bg-[#991b1b] text-white shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  <Trash2 className="h-3 w-3" /> Đã xóa mềm
                </button>
              </div>
            </div>

            {/* Excel & PDF Export Tools (BR-05-018) */}
            <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
              <span className="text-slate-500 font-medium">Tìm thấy <strong className="text-slate-800">{filteredSuppliers.length}</strong> nhà cung cấp hợp lệ</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Xuất báo cáo:</span>
                <button onClick={() => handleExportData('excel')} className="text-[#166534] hover:underline font-bold flex items-center gap-0.5">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={() => handleExportData('pdf')} className="text-red-700 hover:underline font-bold flex items-center gap-0.5">
                  <FileText className="h-3.5 w-3.5" /> PDF
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={() => handleExportData('csv')} className="text-slate-700 hover:underline font-bold flex items-center gap-0.5">
                  <Download className="h-3.5 w-3.5" /> CSV
                </button>
              </div>
            </div>

            {/* List Table container */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3.5 pl-4">Mã đối tác</th>
                      <th className="p-3.5">Tên Nhà Phân Phối</th>
                      <th className="p-3.5">Liên Hệ / SĐT</th>
                      <th className="p-3.5 text-right">Công nợ gối</th>
                      <th className="p-3.5 text-center">Xếp hạng</th>
                      <th className="p-3.5 text-center">Trạng thái</th>
                      <th className="p-3.5 pr-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                          <AlertTriangle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                          Không tìm thấy nhà cung cấp nào phù hợp bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredSuppliers.map(sup => {
                        const isDeleted = sup.DaXoa === true;
                        const isInactive = sup.trangThaiHoatDong === 'NgungHopTac';
                        const isOverLimit = sup.hanMucCongNo && sup.debt > sup.hanMucCongNo;
                        
                        return (
                          <tr 
                            key={sup.id}
                            onClick={() => handleSelectSupplier(sup)}
                            className={`hover:bg-slate-50/80 cursor-pointer transition ${selectedSupplier?.id === sup.id ? 'bg-emerald-50/30 font-semibold' : ''}`}
                          >
                            <td className="p-3.5 pl-4 font-mono font-bold text-slate-600 text-[11px]">
                              {sup.maNhaCungCap || `NCC${String(sup.id).padStart(6, '0')}`}
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                                {sup.tenNhaCungCap}
                                {sup.supplierScore !== undefined && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-extrabold border border-emerald-200 shadow-sm shrink-0">
                                    <Sparkles className="h-2.5 w-2.5 text-amber-500 animate-pulse" /> AI Score: {sup.supplierScore}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" /> {sup.diaChi || sup.diaChiChiTiet || "Chưa cập nhật địa chỉ"}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="text-slate-800 font-semibold">{sup.dienThoai}</div>
                              <div className="text-[10px] text-slate-500">
                                {sup.nguoiLienHeHoTen || sup.nguoiLienHe || "N/A"} 
                                {sup.nguoiLienHeChucVu ? ` (${sup.nguoiLienHeChucVu})` : ''}
                              </div>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className={`font-bold ${sup.debt > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                                {(sup.debt || 0).toLocaleString()}đ
                              </div>
                              {sup.hanMucCongNo ? (
                                <div className={`text-[9px] font-medium ${isOverLimit ? 'text-red-500 font-extrabold' : 'text-slate-400'}`}>
                                  Hạn mức: {sup.hanMucCongNo.toLocaleString()}đ
                                </div>
                              ) : null}
                            </td>
                            <td className="p-3.5 text-center">
                              <div className="flex flex-col items-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                  sup.hangNCC === 'A' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  sup.hangNCC === 'B' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                  'bg-slate-50 text-slate-600 border border-slate-200'
                                }`}>
                                  Hạng {sup.hangNCC || 'B'}
                                </span>
                                <div className="flex items-center gap-0.5 mt-1">
                                  {Array.from({ length: Math.min(5, sup.soSao || 5) }).map((_, i) => (
                                    <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 text-center">
                              {isDeleted ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                                  Đã xóa mềm
                                </span>
                              ) : isInactive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  Ngừng hợp tác
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  Đang hợp tác
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 pr-4 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-end gap-1.5">
                                {isDeleted ? (
                                  <button
                                    onClick={() => handleRestoreSupplier(sup)}
                                    className="p-1.5 hover:bg-emerald-50 text-[#166534] rounded transition"
                                    title="Khôi phục hoạt động"
                                  >
                                    <Undo className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => openForm(sup)}
                                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition"
                                      title="Chỉnh sửa"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => toggleStatus(sup)}
                                      className={`p-1.5 rounded transition ${isInactive ? 'hover:bg-emerald-50 text-emerald-600' : 'hover:bg-amber-50 text-amber-600'}`}
                                      title={isInactive ? "Kích hoạt hợp tác" : "Ngừng hợp tác"}
                                    >
                                      {isInactive ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                    </button>
                                    <button
                                      onClick={() => confirmDelete(sup)}
                                      className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"
                                      title="Xóa mềm"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Detail Viewer and Tabs */}
          <div className="lg:col-span-1">
            {selectedSupplier ? (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden sticky top-4">
                {/* Drawer header */}
                <div className="bg-[#166534] text-white p-5">
                  <span className="text-[10px] font-bold text-emerald-200 bg-[#064e3b] px-2 py-0.5 rounded font-mono">
                    {selectedSupplier.maNhaCungCap || `NCC${String(selectedSupplier.id).padStart(6, '0')}`}
                  </span>
                  <h3 className="text-base font-extrabold mt-1.5 truncate">{selectedSupplier.tenNhaCungCap}</h3>
                  <p className="text-xs text-emerald-100/80 mt-1 truncate">
                    SĐT: {selectedSupplier.dienThoai} | MST: {selectedSupplier.maSoThue || "N/A"}
                  </p>
                </div>

                {/* Drawer navigation */}
                <div className="flex border-b border-slate-100 text-[11px] font-bold bg-slate-50">
                  <button
                    onClick={() => setActiveDetailsTab('info')}
                    className={`flex-1 py-3 text-center border-b-2 transition ${activeDetailsTab === 'info' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-slate-500'}`}
                  >
                    Thông tin
                  </button>
                  <button
                    onClick={() => setActiveDetailsTab('stats')}
                    className={`flex-1 py-3 text-center border-b-2 transition ${activeDetailsTab === 'stats' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-slate-500'}`}
                  >
                    Lịch sử ({selectedSupplier.tongSoPhieuNhap || 0})
                  </button>
                  <button
                    onClick={() => setActiveDetailsTab('quotes')}
                    className={`flex-1 py-3 text-center border-b-2 transition ${activeDetailsTab === 'quotes' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-slate-500'}`}
                  >
                    Báo giá ({supplierQuotes.length})
                  </button>
                  <button
                    onClick={() => setActiveDetailsTab('docs')}
                    className={`flex-1 py-3 text-center border-b-2 transition ${activeDetailsTab === 'docs' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-slate-500'}`}
                  >
                    Tài liệu ({supplierDocs.length})
                  </button>
                </div>

                {/* Drawer body tabs rendering */}
                <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 text-xs leading-relaxed">
                  
                  {activeDetailsTab === 'info' && (
                    <div className="space-y-4">
                      {/* Address details */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 border-b pb-1 flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-slate-400" /> Địa chỉ chi tiết (BR-05-004)
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-slate-600">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">Xã / Phường:</span>
                            <span>{selectedSupplier.phuongXa || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">Quận / Huyện:</span>
                            <span>{selectedSupplier.quanHuyen || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">Tỉnh / Thành phố:</span>
                            <span>{selectedSupplier.tinhThanh || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">Quốc gia:</span>
                            <span>{selectedSupplier.quocGia || 'Việt Nam'}</span>
                          </div>
                        </div>
                        <div className="pt-1 text-slate-700">
                          <span className="text-[10px] text-slate-400 block font-bold">Số nhà, đường, thôn xóm:</span>
                          <strong>{selectedSupplier.diaChiChiTiet || selectedSupplier.diaChi || 'Chưa khai báo'}</strong>
                        </div>
                      </div>

                      {/* Primary Contact Person details */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 border-b pb-1 flex items-center gap-1.5">
                          <User className="h-4 w-4 text-slate-400" /> Người liên hệ chính (BR-05-005)
                        </h4>
                        <div className="space-y-1.5 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div>Họ tên: <strong>{selectedSupplier.nguoiLienHeHoTen || selectedSupplier.nguoiLienHe || "Chưa cập nhật"}</strong></div>
                          {selectedSupplier.nguoiLienHeChucVu && (
                            <div>Chức vụ: <span className="text-slate-600">{selectedSupplier.nguoiLienHeChucVu}</span></div>
                          )}
                          {selectedSupplier.nguoiLienHeDienThoai && (
                            <div>Số điện thoại: <span className="text-slate-600">{selectedSupplier.nguoiLienHeDienThoai}</span></div>
                          )}
                          {selectedSupplier.nguoiLienHeEmail && (
                            <div>Email: <span className="text-slate-600 font-medium">{selectedSupplier.nguoiLienHeEmail}</span></div>
                          )}
                        </div>
                      </div>

                      {/* Purchasing Policy */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 border-b pb-1 flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-slate-400" /> Chính sách sỉ &amp; Giao dịch (BR-05-011)
                        </h4>
                        <ul className="space-y-1 text-slate-600 list-disc list-inside">
                          <li>Chiết khấu cơ bản: <strong>{selectedSupplier.chietKhau || 0}%</strong></li>
                          <li>Thời hạn nợ gối đầu: <strong>{selectedSupplier.hanThanhToanNgay || 30} ngày</strong></li>
                          {selectedSupplier.khuyenMai && <li>Khuyến mại: <span className="font-semibold text-emerald-700">{selectedSupplier.khuyenMai}</span></li>}
                          {selectedSupplier.thuongDoanhSo && <li>Thưởng doanh số: <span className="text-slate-700">{selectedSupplier.thuongDoanhSo}</span></li>}
                          {selectedSupplier.hoTroVanChuyen && <li>Vận chuyển: <span className="text-slate-700">{selectedSupplier.hoTroVanChuyen}</span></li>}
                          {selectedSupplier.hoTroDoiTra && <li>Hỗ trợ đổi trả: <span className="text-slate-700">{selectedSupplier.hoTroDoiTra}</span></li>}
                        </ul>
                        {selectedSupplier.ghiChuChinhSach && (
                          <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-[11px] font-medium border border-emerald-100">
                            📝 {selectedSupplier.ghiChuChinhSach}
                          </div>
                        )}
                      </div>

                      {/* Financial info */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 border-b pb-1 flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-slate-400" /> Tài khoản &amp; Liên lạc
                        </h4>
                        <div className="space-y-1 text-slate-600">
                          <div>Số TK Ngân hàng: <strong className="text-slate-800">{selectedSupplier.soTaiKhoanNganHang || 'Chưa cập nhật'}</strong></div>
                          {selectedSupplier.email && <div>Email đại diện: <span className="text-slate-700">{selectedSupplier.email}</span></div>}
                          {selectedSupplier.website && <div>Website: <a href={selectedSupplier.website} target="_blank" rel="noreferrer" className="text-emerald-700 underline inline-flex items-center gap-0.5">{selectedSupplier.website} <ExternalLink className="h-3 w-3" /></a></div>}
                          {selectedSupplier.zalo && <div>Zalo: <span className="text-slate-700">{selectedSupplier.zalo}</span></div>}
                          {selectedSupplier.facebook && <div>Facebook: <a href={selectedSupplier.facebook} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">Liên kết</a></div>}
                        </div>
                      </div>

                      {/* Internal Notes */}
                      {selectedSupplier.ghiChuNoiBo && (
                        <div className="bg-red-50 text-red-900 p-3 rounded-lg border border-red-100">
                          <h5 className="font-bold text-[10px] text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <ShieldAlert className="h-3.5 w-3.5" /> Ghi chú nội bộ cửa hàng (BR-05-013)
                          </h5>
                          <p className="text-[11px] text-slate-700 italic leading-relaxed">
                            "{selectedSupplier.ghiChuNoiBo}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeDetailsTab === 'stats' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 border-b pb-1">Thống kê giao dịch (BR-05-009, BR-05-024)</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Tổng số phiếu nhập:</span>
                          <strong className="text-sm text-slate-900">{selectedSupplier.tongSoPhieuNhap || 0} phiếu</strong>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Tổng giá trị nhập:</span>
                          <strong className="text-sm text-[#166534]">{(selectedSupplier.tongDoanhSoNhap || 0).toLocaleString()}đ</strong>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Đã thanh toán:</span>
                          <strong className="text-sm text-emerald-700">{(selectedSupplier.tongTienDaThanhToan || 0).toLocaleString()}đ</strong>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Còn nợ sỉ gối đầu:</span>
                          <strong className="text-sm text-red-600">{(selectedSupplier.debt || 0).toLocaleString()}đ</strong>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t text-slate-600 text-[11px]">
                        <div className="flex justify-between">
                          <span>Phiếu nhập đầu tiên:</span>
                          <strong className="text-slate-800">
                            {selectedSupplier.lanNhapDauTien ? new Date(selectedSupplier.lanNhapDauTien).toLocaleDateString('vi-VN') : "N/A"}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Phiếu nhập gần nhất:</span>
                          <strong className="text-slate-800">
                            {selectedSupplier.lanNhapGanNhat ? new Date(selectedSupplier.lanNhapGanNhat).toLocaleDateString('vi-VN') : "N/A"}
                          </strong>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-dashed">
                          <span>Giá nhập sỉ rẻ nhất:</span>
                          <strong className="text-emerald-700">{(selectedSupplier.giaThapNhat || 0).toLocaleString()}đ</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Giá nhập sỉ cao nhất:</span>
                          <strong className="text-red-700">{(selectedSupplier.giaCaoNhat || 0).toLocaleString()}đ</strong>
                        </div>
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>Giá nhập trung bình sỉ:</span>
                          <span>{(selectedSupplier.giaNhapTrungBinh || 0).toLocaleString()}đ</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 italic text-center pt-4">
                        Dữ liệu tự động đồng bộ hóa từ Sổ Quỹ và Phiếu Nhập Kho. Không thể sửa đổi thủ công (BR-05-007, BR-05-009)
                      </p>
                    </div>
                  )}

                  {activeDetailsTab === 'quotes' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 border-b pb-1 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-400" /> Báo giá &amp; Ngày hiệu lực (BR-05-021)
                      </h4>

                      {/* Add quote form */}
                      <form onSubmit={handleAddQuote} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5">
                        <h5 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Khai báo báo giá mới</h5>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Sản phẩm *</label>
                          <SmartComboBox
                            options={products}
                            value={quoteProductId ? Number(quoteProductId) : ''}
                            onChange={val => setQuoteProductId(String(val))}
                            getLabel={(p: any) => p.tenTrenBaoBi}
                            getValue={(p: any) => p.id}
                            placeholder="Chọn sản phẩm..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Giá báo sỉ (đ) *</label>
                            <input 
                              type="number" 
                              placeholder="75000"
                              value={quotePrice}
                              onChange={e => setQuotePrice(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Đơn vị sỉ *</label>
                            <input 
                              type="text" 
                              placeholder="chai / bao"
                              value={quoteUnit}
                              onChange={e => setQuoteUnit(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Ngày hiệu lực *</label>
                            <input 
                              type="date" 
                              value={quoteValidFrom}
                              onChange={e => setQuoteValidFrom(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Ngày hết hạn</label>
                            <input 
                              type="date" 
                              value={quoteValidTo}
                              onChange={e => setQuoteValidTo(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2">
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Ghi chú / Người báo giá</label>
                            <input 
                              type="text" 
                              placeholder="Mr. Nam - Kinh doanh 0905..."
                              value={quotePerson}
                              onChange={e => setQuotePerson(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#166534] hover:bg-[#15803d] text-white py-1.5 rounded text-[11px] font-bold transition"
                        >
                          Lưu Bản Báo Giá Độc Lập
                        </button>
                      </form>

                      {/* Quotes list */}
                      <div className="space-y-2">
                        <h5 className="font-bold text-slate-800 text-[11px]">Lịch sử các đợt báo giá:</h5>
                        {supplierQuotes.length === 0 ? (
                          <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-400 text-[11px]">
                            Chưa ghi nhận bản báo giá nào.
                          </div>
                        ) : (
                          supplierQuotes.map(q => (
                            <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5 relative hover:border-slate-300 transition">
                              <button 
                                onClick={() => handleDeleteQuote(q.id)}
                                className="absolute top-2.5 right-2.5 text-slate-300 hover:text-red-600 transition"
                                title="Xóa báo giá"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <div className="font-bold text-slate-900">{q.tenTrenBaoBi}</div>
                              <div className="flex justify-between items-center text-slate-700">
                                <div>Giá sỉ báo: <strong className="text-red-600 text-xs">{q.giaBao.toLocaleString()}đ</strong> / {q.donViTinh}</div>
                              </div>
                              <div className="text-[10px] text-slate-500 flex flex-col gap-0.5">
                                <div>Hiệu lực: {new Date(q.ngayHieuLuc).toLocaleDateString('vi-VN')} {q.ngayHetHieuLuc ? `đến ${new Date(q.ngayHetHieuLuc).toLocaleDateString('vi-VN')}` : '(Vô thời hạn)'}</div>
                                {q.nguoiBaoGia && <div>Người báo: <span className="font-semibold">{q.nguoiBaoGia}</span></div>}
                                {q.ghiChu && <div className="italic text-slate-600">Ghi chú: "{q.ghiChu}"</div>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeDetailsTab === 'docs' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 border-b pb-1 flex items-center gap-1">
                        <FileText className="h-4 w-4 text-slate-400" /> Quản lý tài liệu pháp lý (BR-05-023)
                      </h4>

                      {/* Add document form */}
                      <form onSubmit={handleAddDocument} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5">
                        <h5 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Lưu trữ tài liệu mới</h5>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Loại tài liệu *</label>
                          <select
                            value={docCategory}
                            onChange={e => setDocCategory(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-[11px]"
                          >
                            <option value="Hợp đồng">Hợp đồng hợp tác</option>
                            <option value="Báo giá">Báo giá ký đóng dấu</option>
                            <option value="Chính sách">Chính sách chiết khấu thưởng</option>
                            <option value="Catalogue">Catalogue / Giấy kiểm nghiệm</option>
                            <option value="Hóa đơn">Hóa đơn đỏ mua hàng sỉ</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Tên file tài liệu *</label>
                          <input 
                            type="text" 
                            placeholder="Hop_Dong_Phan_Phoi_Doc_Quyen_2026.pdf"
                            value={docName}
                            onChange={e => setDocName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Đường dẫn file lưu trữ (URL) *</label>
                          <input 
                            type="text" 
                            placeholder="/files/suppliers/contract_syngenta.pdf"
                            value={docUrl}
                            onChange={e => setDocUrl(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-[11px]"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#166534] hover:bg-[#15803d] text-white py-1.5 rounded text-[11px] font-bold transition"
                        >
                          Tải Lên Lưu Trữ (Soft Delete)
                        </button>
                      </form>

                      {/* Documents list */}
                      <div className="space-y-2">
                        <h5 className="font-bold text-slate-800 text-[11px]">Hồ sơ tài liệu đã lưu:</h5>
                        {supplierDocs.length === 0 ? (
                          <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-400 text-[11px]">
                            Chưa lưu trữ tài liệu nào cho Nhà cung cấp này.
                          </div>
                        ) : (
                          supplierDocs.map(d => (
                            <div key={d.id} className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between hover:border-slate-300 transition">
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="h-5 w-5 text-emerald-700 shrink-0" />
                                <div className="truncate">
                                  <div className="font-bold text-slate-800 text-[11px] truncate">{d.tenFile}</div>
                                  <div className="text-[9px] text-slate-400 flex items-center gap-1.5">
                                    <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{d.loaiTaiLieu}</span>
                                    <span>{(d.kichThuoc / 1024).toFixed(1)} KB</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <a 
                                  href={d.duongDanFile} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="p-1 text-slate-400 hover:text-emerald-700 transition"
                                  title="Xem &amp; tải xuống"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </a>
                                <button 
                                  onClick={() => handleDeleteDocument(d.id)}
                                  className="p-1 text-slate-300 hover:text-red-600 transition"
                                  title="Xóa mềm"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 sticky top-4">
                <Building className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                <p className="text-xs font-bold text-slate-500">Xem hồ sơ chi tiết Nhà cung cấp</p>
                <p className="text-[11px] text-slate-400 mt-1">Chọn một Nhà Phân Phối từ danh mục bên trái để xem đầy đủ địa chỉ, người liên hệ, hạn mức nợ gối đầu, lịch sử giá nhập, các bản báo giá độc lập và tài liệu đính kèm.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {mainTab === 'compare' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Bảng So Sánh Báo Giá Sỉ Giữa Các Đại Lý (BR-05-022)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tự động đối chiếu mức giá báo từ nhiều nguồn phân phối để tìm ra nguồn hàng sỉ có ưu đãi chiết khấu và giá cả tối ưu nhất.</p>
            </div>
            
            <div className="w-full sm:w-64">
              <SmartComboBox
                options={products}
                value={selectedCompProdId ? Number(selectedCompProdId) : ''}
                onChange={val => setSelectedCompProdId(String(val))}
                getLabel={(p: any) => p.tenTrenBaoBi}
                getValue={(p: any) => p.id}
                placeholder="Lọc theo sản phẩm..."
              />
            </div>
          </div>

          <div className="space-y-6">
            {comparisons
              .filter(c => selectedCompProdId === '' || c.hangHoaId === Number(selectedCompProdId))
              .map(comp => (
                <div key={comp.hangHoaId} className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition">
                  {/* Item banner */}
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-200 px-2 py-0.5 rounded font-mono">{comp.maHangHoa}</span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">{comp.tenTrenBaoBi}</h4>
                    </div>
                    
                    {/* Key stats */}
                    <div className="flex gap-4 text-xs font-semibold text-slate-600">
                      <div>Giá thấp nhất: <span className="text-emerald-700 font-extrabold">{(comp.minPrice).toLocaleString()}đ</span></div>
                      <div>Giá cao nhất: <span className="text-red-600">{(comp.maxPrice).toLocaleString()}đ</span></div>
                      <div>Giá trung bình: <span className="text-slate-800">{(comp.avgPrice).toLocaleString()}đ</span></div>
                    </div>
                  </div>

                  {/* Offers breakdown */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3 pl-4">Đại lý sỉ báo giá</th>
                          <th className="p-3 text-center">Đơn vị tính</th>
                          <th className="p-3 text-right">Mức giá báo sỉ</th>
                          <th className="p-3 text-right">Chênh lệch so với thấp nhất</th>
                          <th className="p-3">Hạn hiệu lực</th>
                          <th className="p-3">Người báo</th>
                          <th className="p-3 pr-4">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {comp.supplierOffers.map((offer: any) => {
                          const diff = offer.giaBao - comp.minPrice;
                          const isBest = offer.giaBao === comp.minPrice;
                          
                          return (
                            <tr key={offer.id} className={isBest ? 'bg-emerald-50/20 font-medium' : ''}>
                              <td className="p-3 pl-4">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {offer.tenNhaCungCap}
                                  {isBest && (
                                    <span className="text-[9px] font-bold text-[#166534] bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-0.5">
                                      ★ Tốt nhất
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{offer.maNhaCungCap}</div>
                              </td>
                              <td className="p-3 text-center text-slate-600">{offer.donViTinh}</td>
                              <td className="p-3 text-right font-bold text-slate-900">
                                {offer.giaBao.toLocaleString()}đ
                              </td>
                              <td className="p-3 text-right font-semibold">
                                {diff === 0 ? (
                                  <span className="text-emerald-700 font-bold">Tối ưu</span>
                                ) : (
                                  <span className="text-red-500">+{diff.toLocaleString()}đ</span>
                                )}
                              </td>
                              <td className="p-3 text-slate-600">
                                {new Date(offer.ngayHieuLuc).toLocaleDateString('vi-VN')} {offer.ngayHetHieuLuc ? `đến ${new Date(offer.ngayHetHieuLuc).toLocaleDateString('vi-VN')}` : '(Không hết hạn)'}
                              </td>
                              <td className="p-3 text-slate-600">{offer.nguoiBaoGia || 'N/A'}</td>
                              <td className="p-3 text-slate-500 italic pr-4">{offer.ghiChu || 'Không ghi chú'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

            {comparisons.length === 0 && (
              <div className="p-12 text-center text-slate-400 font-medium border-2 border-dashed rounded-xl">
                <AlertTriangle className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                <p>Chưa có dữ liệu báo giá so sánh. Vui lòng vào từng Nhà cung cấp để khai báo lịch sử báo giá sản phẩm độc lập (BR-05-021).</p>
              </div>
            )}
          </div>
        </div>
      )}

      {mainTab === 'ai-report' && (
        <div className="space-y-6">
          {/* AI Intelligence banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center justify-center p-8 pointer-events-none">
              <Sparkles className="h-64 w-64 text-white" />
            </div>
            
            <div className="relative space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#166534] text-[#BBF7D0] rounded-full text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" /> AI Copilot Intelligence
              </div>
              
              <h3 className="text-lg font-extrabold tracking-tight">AI Đề Xuất Thời Điểm &amp; Đại Lý Nhập Hàng Tối Ưu (BR-05-019, BR-05-020)</h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Dựa trên phân tích lịch sử biến động giá của từng mặt hàng, uy tín thời gian giao hàng và các điều khoản chính sách công nợ nợ gối đầu của đối tác, AI tự động xếp hạng ưu tú và đề xuất kế hoạch mua hàng hiệu quả nhất giúp tiết kiệm chi phí sỉ.
              </p>
            </div>
          </div>

          {/* Interactive AI deep analysis module (BR-05-020) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Sparkles className="text-emerald-700 h-5 w-5 animate-pulse" /> Phân Tích Chuyên Sâu Nhà Cung Cấp Với AI Copilot
            </h4>
            <p className="text-xs text-slate-500">
              Chọn bất kỳ đối tác nào bên dưới để kích hoạt mô hình AI phân tích lịch sử giá báo, rủi ro nợ gối đầu và đưa ra khuyến nghị mua hàng tối ưu.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Chọn đối tác phân phối:</label>
                <select
                  value={aiSelectedSupplierId}
                  onChange={e => setAiSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">-- Chọn Nhà Cung Cấp --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.tenNhaCungCap} ({s.maNhaCungCap || `NCC${String(s.id).padStart(6, '0')}`})</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleRunAiAnalysis}
                disabled={aiAnalyzing || !aiSelectedSupplierId}
                className="px-5 py-2.5 bg-[#166534] hover:bg-[#15803d] text-white rounded-lg text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
              >
                {aiAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Đang Phân Tích...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" /> Chạy AI Phân Tích
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-800 rounded-lg text-xs font-semibold">
                ⚠️ {aiError}
              </div>
            )}

            {aiAnalysisResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">KẾT QUẢ PHÂN TÍCH CHO: {suppliers.find(s => s.id === Number(aiSelectedSupplierId))?.tenNhaCungCap}</h5>
                    <div className="text-[10px] text-slate-400 mt-0.5">Thời gian chạy: {aiAnalysisResult.metadata?.timestamp} | Mô hình: {aiAnalysisResult.metadata?.model} ({aiAnalysisResult.metadata?.version})</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 font-extrabold text-[10px] uppercase">
                      Độ tin cậy: {aiAnalysisResult.metadata?.confidence}%
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-white font-extrabold text-[10px] uppercase ${
                      aiAnalysisResult.riskLevel === 'Cao' ? 'bg-red-600' :
                      aiAnalysisResult.riskLevel === 'Trung bình' ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}>
                      Rủi ro nợ: {aiAnalysisResult.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-4 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm Chất Lượng</div>
                    <div className="text-3xl font-extrabold text-[#166534] mt-1">{aiAnalysisResult.score}<span className="text-slate-300 text-sm">/100</span></div>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#166534] h-full rounded-full" style={{ width: `${aiAnalysisResult.score}%` }}></div>
                    </div>
                  </div>
                  <div className="md:col-span-3 text-xs leading-relaxed text-slate-600">
                    <div className="font-bold text-slate-800 mb-1">Đánh giá của AI:</div>
                    <p className="italic bg-white p-3 rounded-lg border border-slate-100">"{aiAnalysisResult.analysis}"</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Đề xuất &amp; Khuyến nghị mua sỉ:
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {aiAnalysisResult.recommendations?.map((rec: string, i: number) => (
                      <li key={i} className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-emerald-900 font-medium text-xs leading-relaxed">
                        <strong>Khuyến nghị {i+1}:</strong> {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {aiAnalysisResult.reasoning && aiAnalysisResult.reasoning.length > 0 && (
                  <div className="space-y-2 border-t border-slate-200 pt-3">
                    <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" /> Cơ sở kiểm chứng số liệu thực tế (BR-05-028 - AI Explainability):
                    </div>
                    <ul className="space-y-1.5 pl-5 list-disc text-xs text-slate-600 leading-relaxed">
                      {aiAnalysisResult.reasoning.map((reason: string, idx: number) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Award className="text-amber-500 h-5 w-5" /> Báo Cáo Xếp Hạng Đối Tác Phân Phối
              </h4>
              
              <div className="space-y-3">
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 flex items-start gap-3">
                  <div className="text-xl font-bold text-amber-700 bg-amber-100 h-8 w-8 rounded-full flex items-center justify-center shrink-0">1</div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-900">Tổng kho sỉ Miền Bắc (Hạng A ★★★★★)</div>
                    <div className="text-slate-600">Ưu điểm: Giá sỉ rẻ nhất thị trường cam kết. Chiết khấu sỉ 5.0%. Hỗ trợ vận chuyển tận kho.</div>
                    <div className="text-slate-500 text-[10px]">Hạn nợ tối đa: 100,000,000đ | Hạn thanh toán: 30 ngày gối đầu.</div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-start gap-3">
                  <div className="text-xl font-bold text-[#166534] bg-emerald-100 h-8 w-8 rounded-full flex items-center justify-center shrink-0">2</div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-900">Đại lý phân phối Lộc Trời chi nhánh tỉnh (Hạng B ★★★★)</div>
                    <div className="text-slate-600">Ưu điểm: Hàng chính hãng 100%, có hỗ trợ đổi trả lô hàng lỗi hư hỏng. Thời gian giao hàng cực nhanh dưới 24h.</div>
                    <div className="text-slate-500 text-[10px]">Hạn nợ tối đa: 50,000,000đ | Hạn thanh toán: 15 ngày gối đầu.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="text-[#166534] h-5 w-5" /> AI Khuyến Nghị Kế Hoạch Nhập Kho Sắp Tới
              </h4>
              
              <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1 text-[11px] mb-1">
                    <Check className="h-4 w-4 text-[#166534]" /> Nhập sỉ mặt hàng "Anvil 5SC"
                  </h5>
                  <p>AI phát hiện <strong>Tổng kho sỉ Miền Bắc</strong> vừa cập nhật báo giá sỉ ngày 27/07 giảm xuống còn <strong>75.000đ/chai</strong> (rẻ hơn đại lý khác 1.500đ). Đề xuất nhập thêm 50 chai trước khi bước vào vụ gieo cấy lúa tháng 8.</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1 text-[11px] mb-1">
                    <Check className="h-4 w-4 text-[#166534]" /> Tối ưu nợ gối đầu "Đại lý Lộc Trời"
                  </h5>
                  <p>Số dư nợ hiện tại là <strong>0đ</strong>. Cửa hàng có thể khai thác hạn mức nợ gối đầu 50.000.000đ được hoãn thanh toán 15 ngày để nhập phân bón bón thúc NPK chuẩn bị bán lẻ ra các xóm.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Excel Import simulation list (BR-05-017) */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-[#166534] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <FileSpreadsheet className="h-5 w-5" /> Kết quả kiểm tra file Excel nhập khẩu Nhà cung cấp (BR-05-017)
              </h3>
              <button onClick={() => setShowImportModal(false)} className="p-1 hover:bg-[#15803d] rounded text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Hệ thống thực hiện kiểm thử dữ liệu trùng lặp số điện thoại, định dạng mã số thuế, trùng mã nhà cung cấp trước khi nạp vào CSDL. <strong>Theo quy tắc BR-05-017:</strong> Chỉ dừng các dòng lỗi, không chặn toàn bộ quá trình nhập bản ghi hợp lệ.
              </p>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {importResults.map((r, i) => (
                  <div key={i} className={`p-3 rounded text-xs flex items-start gap-2 border ${
                    r.status === 'Success' 
                      ? 'bg-emerald-50 text-[#166534] border-emerald-100' 
                      : 'bg-red-50 text-red-800 border-red-100 font-medium'
                  }`}>
                    {r.status === 'Success' ? (
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>{r.message}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">Tìm thấy <strong>3/5 dòng hợp lệ</strong>, có thể tiếp tục.</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={applyImportedData}
                    className="px-4 py-2 bg-[#166534] hover:bg-[#15803d] text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" /> Nạp 3 Nhà Cung Cấp Hợp Lệ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Soft Delete confirmation (BR-05-014, BR-05-016) */}
      {supplierToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-red-700 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <ShieldAlert className="h-5 w-5" /> Xác nhận xóa mềm Nhà cung cấp (BR-05-014)
              </h3>
              <button onClick={() => setSupplierToDelete(null)} className="p-1 hover:bg-red-800 rounded text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs leading-relaxed text-slate-600">
              <p>Bạn đang yêu cầu xóa Nhà cung cấp: <strong className="text-slate-900">{supplierToDelete.tenNhaCungCap}</strong>.</p>
              <p className="bg-amber-50 text-amber-800 p-2.5 rounded border border-amber-200">
                ⚠️ <strong>Quy tắc BR-05-014 (Soft Delete):</strong> Dữ liệu nhà cung cấp sẽ không bị xóa vật lý khỏi cơ sở dữ liệu để bảo vệ lịch sử giao dịch liên quan. Hệ thống sẽ lưu giữ dấu vết thời gian xóa, người thực hiện và lý do xóa.
              </p>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Lý do xóa mềm đối tác *</label>
                <textarea
                  placeholder="Nhập lý do xóa (ví dụ: Đại lý dừng hoạt động, đổi sáp nhập đơn vị mới...)"
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSupplierToDelete(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={handleDeleteSupplier}
                  disabled={!deleteReason.trim()}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  Xác Nhận Xóa Mềm (Soft Delete)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add/Edit Form Supplier */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-[#166534] text-white p-4 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <Building className="h-5 w-5" /> {editingSupplier ? `Cập nhật thông tin Nhà cung cấp: ${editingSupplier.maNhaCungCap}` : 'Thêm mới Nhà cung cấp'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="p-1 hover:bg-[#15803d] rounded text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSaveSupplier} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 leading-relaxed">
              
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg font-bold flex items-center gap-1.5">
                  <ShieldAlert className="h-5 w-5 shrink-0" /> {formError}
                </div>
              )}
              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-[#166534] p-3 rounded-lg font-bold">
                  ✅ {formSuccess}
                </div>
              )}

              {/* SECTION 1: Basic Info */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#166534] text-xs uppercase tracking-wider border-b pb-1 flex items-center gap-1">
                  <span>1. Thông tin liên hệ cơ bản</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Tên Nhà cung cấp (Đơn vị phân phối) *</label>
                    <input
                      type="text"
                      placeholder="Công ty Cổ phần Vật tư Bảo vệ Thực vật Syngenta VN"
                      value={formFields.tenNhaCungCap}
                      onChange={e => setFormFields({ ...formFields, tenNhaCungCap: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
                    <input
                      type="text"
                      placeholder="0982334455"
                      value={formFields.dienThoai}
                      onChange={e => setFormFields({ ...formFields, dienThoai: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Địa chỉ hiển thị chính</label>
                    <input
                      type="text"
                      placeholder="Số 10 Đường Hùng Vương, TP. Thái Bình"
                      value={formFields.diaChi}
                      onChange={e => setFormFields({ ...formFields, diaChi: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mã số thuế</label>
                    <input
                      type="text"
                      placeholder="0109283745"
                      value={formFields.maSoThue}
                      onChange={e => setFormFields({ ...formFields, maSoThue: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số TK Ngân hàng (VCB, BIDV...)</label>
                    <input
                      type="text"
                      placeholder="VCB 1039847582"
                      value={formFields.soTaiKhoanNganHang}
                      onChange={e => setFormFields({ ...formFields, soTaiKhoanNganHang: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="lienhe@syngenta.vn"
                      value={formFields.email}
                      onChange={e => setFormFields({ ...formFields, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Website</label>
                    <input
                      type="text"
                      placeholder="https://syngenta.com.vn"
                      value={formFields.website}
                      onChange={e => setFormFields({ ...formFields, website: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Zalo</label>
                    <input
                      type="text"
                      placeholder="0982334455"
                      value={formFields.zalo}
                      onChange={e => setFormFields({ ...formFields, zalo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Facebook</label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/loctroigroup"
                      value={formFields.facebook}
                      onChange={e => setFormFields({ ...formFields, facebook: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Detailed Address (BR-05-004) */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#166534] text-xs uppercase tracking-wider border-b pb-1 flex items-center gap-1">
                  <span>2. Phân rã cấu trúc địa chỉ chuẩn (BR-05-004)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số nhà / Đường / Thôn xóm</label>
                    <input
                      type="text"
                      placeholder="Số 45 Thôn Tây"
                      value={formFields.diaChiChiTiet}
                      onChange={e => setFormFields({ ...formFields, diaChiChiTiet: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phường / Xã</label>
                    <input
                      type="text"
                      placeholder="Xã Đông Cường"
                      value={formFields.phuongXa}
                      onChange={e => setFormFields({ ...formFields, phuongXa: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quận / Huyện</label>
                    <input
                      type="text"
                      placeholder="Huyện Đông Hưng"
                      value={formFields.quanHuyen}
                      onChange={e => setFormFields({ ...formFields, quanHuyen: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tỉnh / Thành phố</label>
                    <input
                      type="text"
                      placeholder="Tỉnh Thái Bình"
                      value={formFields.tinhThanh}
                      onChange={e => setFormFields({ ...formFields, tinhThanh: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quốc gia</label>
                    <input
                      type="text"
                      value={formFields.quocGia}
                      onChange={e => setFormFields({ ...formFields, quocGia: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Primary Contact Person (BR-05-005) */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#166534] text-xs uppercase tracking-wider border-b pb-1 flex items-center gap-1">
                  <span>3. Người đại diện liên hệ giao dịch sỉ (BR-05-005)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Họ tên người liên hệ chính</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn Hùng"
                      value={formFields.nguoiLienHeHoTen}
                      onChange={e => setFormFields({ ...formFields, nguoiLienHeHoTen: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chức vụ đại diện</label>
                    <input
                      type="text"
                      placeholder="Trưởng phòng Kinh doanh khu vực"
                      value={formFields.nguoiLienHeChucVu}
                      onChange={e => setFormFields({ ...formFields, nguoiLienHeChucVu: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số điện thoại riêng</label>
                    <input
                      type="text"
                      placeholder="0912111555"
                      value={formFields.nguoiLienHeDienThoai}
                      onChange={e => setFormFields({ ...formFields, nguoiLienHeDienThoai: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email riêng</label>
                    <input
                      type="email"
                      placeholder="hung.nv@syngenta.vn"
                      value={formFields.nguoiLienHeEmail}
                      onChange={e => setFormFields({ ...formFields, nguoiLienHeEmail: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Purchasing Policies & Ratings (BR-05-011, BR-05-012, BR-05-008) */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#166534] text-xs uppercase tracking-wider border-b pb-1 flex items-center gap-1">
                  <span>4. Chính sách mua sỉ &amp; Đánh giá chất lượng (BR-05-011, BR-05-012)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chiết khấu (%)</label>
                    <input
                      type="number"
                      placeholder="5"
                      value={formFields.chietKhau}
                      onChange={e => setFormFields({ ...formFields, chietKhau: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hạn thanh toán (Số ngày)</label>
                    <input
                      type="number"
                      placeholder="30"
                      value={formFields.hanThanhToanNgay}
                      onChange={e => setFormFields({ ...formFields, hanThanhToanNgay: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                   <div>
                    <label className="block font-bold text-slate-700 mb-1">Hạn mức công nợ tối đa (đ) *</label>
                    <input
                      type="number"
                      placeholder="100000000"
                      value={formFields.hanMucCongNo}
                      onChange={e => setFormFields({ ...formFields, hanMucCongNo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-extrabold text-red-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chính sách hạn mức công nợ *</label>
                    <select
                      value={formFields.chinhSachCongNo}
                      onChange={e => setFormFields({ ...formFields, chinhSachCongNo: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    >
                      <option value="Strict">Không cho phép vượt hạn mức (Strict)</option>
                      <option value="Warn">Cho phép vượt nhưng cảnh báo (Warn)</option>
                      <option value="Unlimited">Không giới hạn công nợ (Unlimited)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Xếp hạng đối tác</label>
                    <select
                      value={formFields.hangNCC}
                      onChange={e => setFormFields({ ...formFields, hangNCC: e.target.value as 'A' | 'B' | 'C' })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    >
                      <option value="A">Hạng A (Đại lý cấp 1 ưu tú)</option>
                      <option value="B">Hạng B (Đại lý cấp 2 ổn định)</option>
                      <option value="C">Hạng C (Cần xem xét nhập kho)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Khuyến mại sỉ áp dụng</label>
                    <input
                      type="text"
                      placeholder="Mua 10 tặng 1 chai Anvil"
                      value={formFields.khuyenMai}
                      onChange={e => setFormFields({ ...formFields, khuyenMai: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chính sách thưởng doanh số</label>
                    <input
                      type="text"
                      placeholder="Cuối vụ thưởng 1.5% doanh thu"
                      value={formFields.thuongDoanhSo}
                      onChange={e => setFormFields({ ...formFields, thuongDoanhSo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hỗ trợ đổi trả lô hàng</label>
                    <input
                      type="text"
                      placeholder="Hỗ trợ đổi trả hàng cận date dưới 3 tháng"
                      value={formFields.hoTroDoiTra}
                      onChange={e => setFormFields({ ...formFields, hoTroDoiTra: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Hỗ trợ chi phí vận chuyển</label>
                    <input
                      type="text"
                      placeholder="Miễn phí ship với đơn sỉ từ 10,000,000đ"
                      value={formFields.hoTroVanChuyen}
                      onChange={e => setFormFields({ ...formFields, hoTroVanChuyen: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số sao đánh giá uy tín</label>
                    <select
                      value={formFields.soSao}
                      onChange={e => setFormFields({ ...formFields, soSao: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-amber-600 font-extrabold"
                    >
                      <option value="5">★★★★★ (Xuất sắc)</option>
                      <option value="4">★★★★ (Tốt)</option>
                      <option value="3">★★★ (Khá)</option>
                      <option value="2">★★ (Trung bình)</option>
                      <option value="1">★ (Cần theo dõi sát)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Trạng thái hoạt động</label>
                    <select
                      value={formFields.trangThaiHoatDong}
                      onChange={e => setFormFields({ ...formFields, trangThaiHoatDong: e.target.value as 'HoatDong' | 'NgungHopTac' })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    >
                      <option value="HoatDong">Đang hoạt động hợp tác</option>
                      <option value="NgungHopTac">Ngừng hoạt động / ngừng hợp tác</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#166534] mb-1">Ghi chú chính sách giao dịch chung</label>
                    <textarea
                      placeholder="Khách sỉ được gối đầu tối đa 100M VND, thanh toán trước khi lấy đợt hàng tiếp theo..."
                      value={formFields.ghiChuChinhSach}
                      onChange={e => setFormFields({ ...formFields, ghiChuChinhSach: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 h-16"
                    />
                  </div>
                  <div>
                    <label className="block text-red-700 font-bold mb-1">Ghi chú bảo mật nội bộ cửa hàng (BR-05-013)</label>
                    <textarea
                      placeholder="Đối tác này có thói quen giao hàng trễ 1 ngày. Tránh lập phiếu vội. Uy tín tài chính rất tốt..."
                      value={formFields.ghiChuNoiBo}
                      onChange={e => setFormFields({ ...formFields, ghiChuNoiBo: e.target.value })}
                      className="w-full bg-slate-50 border border-red-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 h-16"
                    />
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#166534] hover:bg-[#15803d] text-white rounded-lg font-bold shadow-sm transition disabled:opacity-50"
                  id="btn-save-supplier-submit"
                >
                  {loading ? 'Đang lưu...' : editingSupplier ? 'Cập Nhật Bản Ghi' : 'Thêm Mới Single Source'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
