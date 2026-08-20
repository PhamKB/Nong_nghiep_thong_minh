import React, { useState, useEffect } from 'react';
import { Product, NhomHang, DonViTinh, CongDung, CayTrong, BenhSauHai, NhaSanXuat, NhaCungCap } from '../types';
import { SmartComboBox, SmartTable } from './SmartUI';
import InventoryAuditDashboard from './InventoryAuditDashboard';
import { 
  Plus, 
  Search, 
  Camera, 
  Sparkles, 
  Archive, 
  Eye, 
  AlertCircle, 
  Database, 
  FileImage, 
  Check, 
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Edit3,
  RotateCcw
} from 'lucide-react';

interface GoodsManagementProps {
  onSuccess: () => void;
  initialLeftTab?: 'ai-declare' | 'wholesale-import' | 'stock-audit';
}

export default function GoodsManagement({ onSuccess, initialLeftTab = 'ai-declare' }: GoodsManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedProdId, setSelectedProdId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{
    nhomHangs: NhomHang[];
    donViTinhs: DonViTinh[];
    congDungs: CongDung[];
    cayTrongs: CayTrong[];
    benhSauHais: BenhSauHai[];
    nhaSanXuats: NhaSanXuat[];
  }>({ nhomHangs: [], donViTinhs: [], congDungs: [], cayTrongs: [], benhSauHais: [], nhaSanXuats: [] });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  
  // Product Add/Edit Form Fields
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const [tenTrenBaoBi, setTenTrenBaoBi] = useState('');
  const [tenThuongGoi, setTenThuongGoi] = useState('');
  const [nhomHangId, setNhomHangId] = useState('');
  const [donViTinhId, setDonViTinhId] = useState('1');
  const [nhaSanXuatId, setNhaSanXuatId] = useState('');
  const [hoatChat, setHoatChat] = useState('');
  const [hamLuong, setHamLuong] = useState('');
  const [quyCach, setQuyCach] = useState('');
  const [lieuLuong, setLieuLuong] = useState('');
  const [thoiGianCachLy, setThoiGianCachLy] = useState(7);
  const [giaNhapHienTai, setGiaNhapHienTai] = useState<number>(0);
  const [giaBanHienTai, setGiaBanHienTai] = useState<number>(0);
  const [selectedUses, setSelectedUses] = useState<number[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<number[]>([]);
  const [selectedPests, setSelectedPests] = useState<number[]>([]);

  // AI OCR States
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedMockPhoto, setSelectedMockPhoto] = useState<string>('anvil');
  const [customFileBase64, setCustomFileBase64] = useState<string>('');
  const [customFileName, setCustomFileName] = useState<string>('');
  const [ocrSuccess, setOcrSuccess] = useState('');

  // Stock Audit Form state
  const [auditProductId, setAuditProductId] = useState('');
  const [auditActualQty, setAuditActualQty] = useState('');
  const [auditReason, setAuditReason] = useState('');
  const [auditSuccess, setAuditSuccess] = useState('');

  // Left Column tab toggling
  const [leftTab, setLeftTab] = useState<'ai-declare' | 'wholesale-import' | 'stock-audit'>(initialLeftTab);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Wholesale Import fields
  const [importSupId, setImportSupId] = useState('');
  const [importProductId, setImportProductId] = useState('');
  const [importQty, setImportQty] = useState('');
  const [importCost, setImportCost] = useState('');
  const [importBatchCode, setImportBatchCode] = useState('');
  const [importMfgDate, setImportMfgDate] = useState(new Date().toISOString().split('T')[0]);
  const [importExpDate, setImportExpDate] = useState(new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [importPaid, setImportPaid] = useState('');
  const [importNote, setImportNote] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  // Extended states for multi-state wholesale inward vouchers (BR-06)
  const [importSubTab, setImportSubTab] = useState<'create' | 'list' | 'debt-history'>('create');
  const [importVouchers, setImportVouchers] = useState<any[]>([]);
  const [supplierDebtHistory, setSupplierDebtHistory] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [khoNhap, setKhoNhap] = useState('Kho chính Hải Đăng');
  const [trangThaiImport, setTrangThaiImport] = useState<'Nhap' | 'ChoXacNhan' | 'HoanThanh'>('HoanThanh');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelVoucherId, setCancelVoucherId] = useState<number | null>(null);
  const [editingVoucherId, setEditingVoucherId] = useState<number | null>(null);
  const [payMoreAmount, setPayMoreAmount] = useState('');
  const [payMoreMethod, setPayMoreMethod] = useState('Tiền mặt');

  const fetchSupplierDebtHistory = () => {
    setLoading(true);
    fetch('/api/debts/supplier-history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSupplierDebtHistory(data);
        }
      })
      .catch(err => console.error("Error loading debt history:", err))
      .finally(() => setLoading(false));
  };

  // States for BR-06-014 -> BR-06-020 (Supplier & AI Recommendations)
  const [selectedSupInfo, setSelectedSupInfo] = useState<any | null>(null);
  const [supplierQuotes, setSupplierQuotes] = useState<any[]>([]);
  const [selectedProductPriceHistory, setSelectedProductPriceHistory] = useState<any | null>(null);
  const [priceChangeReason, setPriceChangeReason] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState<any | null>(null);
  const [loadingAIRecommend, setLoadingAIRecommend] = useState(false);

  // States for BR-06-021 -> BR-06-030
  const [chietKhauLoai, setChietKhauLoai] = useState<'None' | 'PhanTram' | 'Tien'>('None');
  const [chietKhauGiaTri, setChietKhauGiaTri] = useState<number>(0);
  const [thueSuatVAT, setThueSuatVAT] = useState<number>(0);
  const [nhaCungCapUuTienId, setNhaCungCapUuTienId] = useState('');
  const [nhaCungCapIds, setNhaCungCapIds] = useState<number[]>([]);

  // Trigger when supplier changes
  useEffect(() => {
    if (!importSupId) {
      setSelectedSupInfo(null);
      setSupplierQuotes([]);
      setSelectedProductPriceHistory(null);
      setPriceChangeReason('');
      return;
    }

    const sup = suppliers.find(s => s.id === Number(importSupId));
    setSelectedSupInfo(sup || null);

    // Fetch quotes
    fetch(`/api/suppliers/${importSupId}/quotes`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSupplierQuotes(data);
        }
      })
      .catch(err => console.error("Error loading quotes:", err));

    // Clear price history as product might not be chosen yet
    setSelectedProductPriceHistory(null);
    setPriceChangeReason('');
  }, [importSupId, suppliers]);

  // Trigger when product changes
  useEffect(() => {
    if (!importSupId || !importProductId) {
      setSelectedProductPriceHistory(null);
      setPriceChangeReason('');
      return;
    }

    fetch(`/api/suppliers/${importSupId}/price-history/${importProductId}`)
      .then(res => res.json())
      .then(data => {
        setSelectedProductPriceHistory(data);
      })
      .catch(err => console.error("Error loading price history:", err));

    setPriceChangeReason('');
  }, [importSupId, importProductId]);

  const getSuggestedQuote = () => {
    if (!importProductId || supplierQuotes.length === 0) return null;
    const today = new Date().toISOString().split('T')[0];
    const activeQuotes = supplierQuotes.filter(q => {
      if (q.hangHoaId !== Number(importProductId)) return false;
      if (today < q.ngayHieuLuc) return false;
      if (q.ngayHetHieuLuc && today > q.ngayHetHieuLuc) return false;
      return true;
    });

    if (activeQuotes.length === 0) return null;

    // Sort by ngayHieuLuc desc, then id desc
    activeQuotes.sort((a, b) => {
      if (a.ngayHieuLuc !== b.ngayHieuLuc) {
        return b.ngayHieuLuc.localeCompare(a.ngayHieuLuc);
      }
      return b.id - a.id;
    });

    return activeQuotes[0];
  };

  const getExpiredQuote = () => {
    if (!importProductId || supplierQuotes.length === 0) return null;
    const today = new Date().toISOString().split('T')[0];
    const expiredQuotes = supplierQuotes.filter(q => {
      if (q.hangHoaId !== Number(importProductId)) return false;
      return q.ngayHetHieuLuc && today > q.ngayHetHieuLuc;
    });

    if (expiredQuotes.length === 0) return null;

    // Sort by latest expired
    expiredQuotes.sort((a, b) => b.ngayHetHieuLuc.localeCompare(a.ngayHetHieuLuc));
    return expiredQuotes[0];
  };

  const handleFetchAIRecommend = async () => {
    // Collect items for recommendation
    let itemsToAnalyze = [];
    if (cartItems.length > 0) {
      itemsToAnalyze = cartItems.map(item => ({
        hangHoaId: item.hangHoaId,
        soLuong: item.soLuong
      }));
    } else if (importProductId) {
      itemsToAnalyze = [{
        hangHoaId: Number(importProductId),
        soLuong: Number(importQty) || 50
      }];
    } else {
      alert("Vui lòng chọn sản phẩm cần nhập hoặc thêm sản phẩm vào danh sách trước khi dùng Trợ lý AI (BR-06-019).");
      return;
    }

    setLoadingAIRecommend(true);
    setAiRecommendation(null);
    try {
      const res = await fetch('/api/suppliers/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToAnalyze })
      });
      if (res.ok) {
        const data = await res.json();
        setAiRecommendation(data);
      } else {
        const err = await res.json();
        alert(err.error || "Không thể gọi Trợ lý AI.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối khi gọi Trợ lý AI.");
    } finally {
      setLoadingAIRecommend(false);
    }
  };

  const fetchImportVouchers = async () => {
    try {
      const res = await fetch('/api/imports');
      if (res.ok) {
        const data = await res.json();
        setImportVouchers(data);
      }
    } catch (err) {
      console.error("Error loading import vouchers:", err);
    }
  };

  const handleQuickCreateNhomHang = async (query: string) => {
    const response = await fetch('/api/categories/nhomhang', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenNhom: query })
    });
    if (!response.ok) throw new Error("Không thể thêm nhóm hàng mới.");
    const data = await response.json();
    await loadData();
    onSuccess();
    return data.id;
  };

  const handleQuickCreateDonViTinh = async (query: string) => {
    const response = await fetch('/api/categories/donvitinh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenDonVi: query })
    });
    if (!response.ok) throw new Error("Không thể thêm đơn vị tính mới.");
    const data = await response.json();
    await loadData();
    onSuccess();
    return data.id;
  };

  const handleQuickCreateNhaSanXuat = async (query: string) => {
    const response = await fetch('/api/categories/nhasanxuat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenNhaSanXuat: query })
    });
    if (!response.ok) throw new Error("Không thể thêm nhà sản xuất mới.");
    const data = await response.json();
    await loadData();
    onSuccess();
    return data.id;
  };

  const loadData = async (includeDeleted = showDeleted) => {
    try {
      setLoading(true);
      const [prodRes, catRes, batchRes, supRes] = await Promise.all([
        fetch(`/api/products?showDeleted=${includeDeleted}`),
        fetch('/api/categories'),
        fetch('/api/batches'),
        fetch('/api/suppliers')
      ]);
      const prods = await prodRes.json();
      const cats = await catRes.json();
      const batchData = await batchRes.json();
      const supData = await supRes.json();

      setProducts(prods);
      setBatches(batchData);
      setSuppliers(supData);
      setCategories({
        nhomHangs: cats.nhomHangs,
        donViTinhs: cats.donViTinhs,
        congDungs: cats.congDungs,
        cayTrongs: cats.cayTrongs,
        benhSauHais: cats.benhSauHais,
        nhaSanXuats: cats.nhaSanXuats
      });
      // Fetch import records as well
      await fetchImportVouchers();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialLeftTab) {
      setLeftTab(initialLeftTab);
    }
  }, [initialLeftTab]);

  // Multi-select helpers
  const toggleUse = (id: number) => {
    setSelectedUses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleCrop = (id: number) => {
    setSelectedCrops(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const togglePest = (id: number) => {
    setSelectedPests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Trigger Gemini Packaging Scanning simulation / Real upload
  const handleTriggerAIOCR = async () => {
    try {
      setAiLoading(true);
      setOcrSuccess('');
      
      let payload: any = {};
      if (customFileBase64) {
        payload.imageBase64 = customFileBase64;
      } else {
        payload.rawTextSimulation = selectedMockPhoto; // Will match 'anvil', 'comanche' or 'regent'
      }

      const res = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data && data.tenTrenBaoBi) {
        // Pre-fill form fields instantly!
        setTenTrenBaoBi(data.tenTrenBaoBi);
        setTenThuongGoi(data.tenThuongGoi || data.tenTrenBaoBi);
        setHoatChat(data.hoatChat || '');
        setHamLuong(data.hamLuong || '');
        setQuyCach(data.quyCach || '');
        setLieuLuong(data.lieuLuong || '');
        setThoiGianCachLy(Number(data.thoiGianCachLy || 7));
        
        // Auto select Category if tags matched
        if (data.congDung && data.congDung.includes("Trừ cỏ")) {
          setNhomHangId('2'); // Thuốc BVTV
        } else if (data.congDung && data.congDung.includes("Phân bón")) {
          setNhomHangId('1'); // Phân bón
        } else {
          setNhomHangId('2'); // Default Thuốc BVTV
        }
        setDonViTinhId('1'); // Chai

        // Pre-fill many-to-many tags based on matches
        if (data.congDung) {
          const matchedUses = categories.congDungs
            .filter(u => data.congDung.some((x: string) => x.toLowerCase().includes(u.tenCongDung.toLowerCase())))
            .map(u => u.id);
          setSelectedUses(matchedUses);
        }
        
        if (data.cayTrong) {
          const matchedCrops = categories.cayTrongs
            .filter(c => data.cayTrong.some((x: string) => x.toLowerCase().includes(c.tenCayTrong.toLowerCase())))
            .map(c => c.id);
          setSelectedCrops(matchedCrops);
        }

        if (data.benhSauHai) {
          const matchedPests = categories.benhSauHais
            .filter(p => data.benhSauHai.some((x: string) => x.toLowerCase().includes(p.tenBenhSau.toLowerCase())))
            .map(p => p.id);
          setSelectedPests(matchedPests);
        }

        setOcrSuccess(`Đã hoàn tất trích xuất thông tin nhãn bằng Gemini AI! Vui lòng kiểm tra và điền giá bán lẻ.`);
      } else {
        alert("Gemini không trích xuất được thông tin nhãn chai phù hợp.");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối AI!");
    } finally {
      setAiLoading(false);
    }
  };

  // Handle standard custom photo upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearCustomFile = () => {
    setCustomFileBase64('');
    setCustomFileName('');
  };

  // Submit new or edited Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenTrenBaoBi || !nhomHangId) {
      alert("Vui lòng điền tên trên bao bì và chọn nhóm hàng hóa.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        tenTrenBaoBi: tenTrenBaoBi.trim(),
        tenThuongGoi: tenThuongGoi.trim() || tenTrenBaoBi.trim(),
        nhomHangId: Number(nhomHangId),
        donViTinhId: Number(donViTinhId || 1),
        nhaSanXuatId: Number(nhaSanXuatId || 1),
        hoatChat: hoatChat.trim(),
        hamLuong: hamLuong.trim(),
        quyCach: quyCach.trim(),
        lieuLuong: lieuLuong.trim(),
        thoiGianCachLy: Number(thoiGianCachLy || 7),
        giaNhapHienTai: Number(giaNhapHienTai || 0),
        giaBanHienTai: Number(giaBanHienTai || 0),
        congDungIds: selectedUses,
        cayTrongIds: selectedCrops,
        benhSauIds: selectedPests,
        nhaCungCapUuTienId: nhaCungCapUuTienId ? Number(nhaCungCapUuTienId) : null,
        nhaCungCapIds: nhaCungCapIds
      };

      const isEditing = !!editingProduct;
      const url = isEditing ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Lỗi lưu sản phẩm");
      }

      // Reset form
      setEditingProduct(null);
      setTenTrenBaoBi('');
      setTenThuongGoi('');
      setHoatChat('');
      setHamLuong('');
      setQuyCach('');
      setLieuLuong('');
      setThoiGianCachLy(7);
      setGiaNhapHienTai(0);
      setGiaBanHienTai(0);
      setSelectedUses([]);
      setSelectedCrops([]);
      setSelectedPests([]);
      setNhaCungCapUuTienId('');
      setNhaCungCapIds([]);
      setOcrSuccess('');
      handleClearCustomFile();

      await loadData();
      onSuccess();
      alert(isEditing ? "Cập nhật thông tin hàng hóa thành công!" : "Đăng ký sản phẩm mới thành công!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditProduct = (p: Product) => {
    setEditingProduct(p);
    setTenTrenBaoBi(p.tenTrenBaoBi);
    setTenThuongGoi(p.tenThuongGoi || '');
    setNhomHangId(p.nhomHangId.toString());
    setDonViTinhId(p.donViTinhId ? p.donViTinhId.toString() : '1');
    setNhaSanXuatId(p.nhaSanXuatId ? p.nhaSanXuatId.toString() : '1');
    setHoatChat(p.hoatChat || '');
    setHamLuong(p.hamLuong || '');
    setQuyCach(p.quyCach || '');
    setLieuLuong(p.lieuLuong || '');
    setThoiGianCachLy(p.thoiGianCachLy || 7);
    setGiaNhapHienTai(p.giaNhapHienTai || 0);
    setGiaBanHienTai(p.giaBanHienTai || 0);
    setSelectedUses(p.congDungIds || []);
    setSelectedCrops(p.cayTrongIds || []);
    setSelectedPests(p.benhSauIds || []);
    setNhaCungCapUuTienId(p.nhaCungCapUuTienId ? p.nhaCungCapUuTienId.toString() : '');
    setNhaCungCapIds(p.nhaCungCapIds || []);
    setLeftTab('ai-declare'); // Switch to form tab to edit
  };

  const handleCancelEditProduct = () => {
    setEditingProduct(null);
    setTenTrenBaoBi('');
    setTenThuongGoi('');
    setHoatChat('');
    setHamLuong('');
    setQuyCach('');
    setLieuLuong('');
    setThoiGianCachLy(7);
    setGiaNhapHienTai(0);
    setGiaBanHienTai(0);
    setSelectedUses([]);
    setSelectedCrops([]);
    setSelectedPests([]);
    setNhaCungCapUuTienId('');
    setNhaCungCapIds([]);
  };

  const handleDeleteProduct = async (p: Product) => {
    if (!window.confirm(`Bà con có chắc chắn muốn ngừng kinh doanh (xóa mềm) sản phẩm: ${p.tenTrenBaoBi} không?`)) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể ngừng kinh doanh sản phẩm");
      }
      alert(`Đã ngừng kinh doanh sản phẩm ${p.tenTrenBaoBi} thành công (BR-04-017)!`);
      await loadData();
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreProduct = async (p: Product) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${p.id}/restore`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể khôi phục sản phẩm");
      }
      alert(`Đã khôi phục hoạt động kinh doanh sản phẩm ${p.tenTrenBaoBi} thành công!`);
      await loadData();
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Stock Audit Correcting
  const handleAuditInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditProductId || !auditActualQty) return;

    try {
      setLoading(true);
      const res = await fetch('/api/inventory/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hangHoaId: Number(auditProductId),
          soLuongThucTe: Number(auditActualQty),
          ghiChu: auditReason
        })
      });

      if (!res.ok) throw new Error("Kiểm kho thất bại");

      setAuditSuccess("Điều chỉnh tồn kho thực tế thành công! Đã cập nhật vào nhật ký kho.");
      setAuditProductId('');
      setAuditActualQty('');
      setAuditReason('');
      await loadData();
      onSuccess();
      setTimeout(() => setAuditSuccess(''), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add item to draft import cart
  const handleAddItemToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importProductId || !importQty || !importCost) {
      alert("Vui lòng chọn sản phẩm, số lượng và đơn giá nhập.");
      return;
    }
    
    if (importMfgDate) {
      const nsxDate = new Date(importMfgDate);
      const todayDate = new Date();
      if (nsxDate > todayDate) {
        alert("Ngày sản xuất không được lớn hơn ngày hiện tại (VR-04-005).");
        return;
      }
      if (importExpDate) {
        const hsdDate = new Date(importExpDate);
        if (hsdDate <= nsxDate) {
          alert("Hạn sử dụng phải lớn hơn ngày sản xuất (VR-04-006).");
          return;
        }
      }
    }
    
    const matchedProduct = products.find(p => p.id === Number(importProductId));
    if (!matchedProduct) return;

    // BR-06-018: Compare with active quote
    const activeQuote = getSuggestedQuote();
    let changeReasonStr = "";
    if (activeQuote && Number(importCost) !== activeQuote.giaBao) {
      if (!priceChangeReason.trim()) {
        alert("Đơn giá nhập sỉ khác với đơn giá trong Báo giá đang hiệu lực. Vui lòng nhập lý do thay đổi đơn giá (BR-06-018).");
        return;
      }
      changeReasonStr = priceChangeReason.trim();
    }
    
    const mLo = importBatchCode.trim() || `LO-NH-${Math.floor(Math.random() * 900000 + 100000)}`;
    
    const qty = Number(importQty);
    const cost = Number(importCost);
    const subTotal = qty * cost;
    
    let discountAmount = 0;
    if (chietKhauLoai === 'PhanTram') {
      discountAmount = Math.round(subTotal * Number(chietKhauGiaTri || 0) / 100);
    } else if (chietKhauLoai === 'Tien') {
      discountAmount = Number(chietKhauGiaTri || 0);
    }
    if (discountAmount > subTotal) discountAmount = subTotal;

    const vatRate = Number(thueSuatVAT || 0);
    const vatAmount = Math.round((subTotal - discountAmount) * vatRate / 100);
    const lineTotal = subTotal - discountAmount + vatAmount;

    const newItem = {
      hangHoaId: Number(importProductId),
      tenTrenBaoBi: matchedProduct.tenTrenBaoBi,
      soLuong: qty,
      donGia: cost,
      maLo: mLo,
      ngaySanXuat: importMfgDate,
      hanSuDung: importExpDate,
      lyDoThayDoiGia: changeReasonStr,
      chietKhauLoai: chietKhauLoai,
      chietKhauGiaTri: Number(chietKhauGiaTri || 0),
      chietKhau: discountAmount,
      thueSuatVAT: vatRate,
      tienThueVAT: vatAmount,
      thanhTien: lineTotal
    };
    
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.hangHoaId === newItem.hangHoaId && item.maLo === newItem.maLo);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].soLuong + newItem.soLuong;
        const newCost = newItem.donGia;
        const newSubTotal = newQty * newCost;
        
        let newDiscount = 0;
        if (newItem.chietKhauLoai === 'PhanTram') {
          newDiscount = Math.round(newSubTotal * newItem.chietKhauGiaTri / 100);
        } else if (newItem.chietKhauLoai === 'Tien') {
          newDiscount = newItem.chietKhauGiaTri;
        }
        if (newDiscount > newSubTotal) newDiscount = newSubTotal;
        
        const newVat = Math.round((newSubTotal - newDiscount) * newItem.thueSuatVAT / 100);
        const newLineTotal = newSubTotal - newDiscount + newVat;

        updated[existingIdx] = {
          ...updated[existingIdx],
          soLuong: newQty,
          donGia: newCost,
          lyDoThayDoiGia: newItem.lyDoThayDoiGia,
          chietKhauLoai: newItem.chietKhauLoai,
          chietKhauGiaTri: newItem.chietKhauGiaTri,
          chietKhau: newDiscount,
          thueSuatVAT: newItem.thueSuatVAT,
          tienThueVAT: newVat,
          thanhTien: newLineTotal
        };
        return updated;
      }
      return [...prev, newItem];
    });
    
    // Clear product fields but keep supplier selected
    setImportProductId('');
    setImportQty('');
    setImportCost('');
    setImportBatchCode('');
    setPriceChangeReason('');
    setChietKhauLoai('None');
    setChietKhauGiaTri(0);
    setThueSuatVAT(0);
  };

  const handleRemoveItemFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // Wholesale Import Submit Handler - BR-06-001, BR-06-003, BR-06-004
  const handleWholesaleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importSupId) {
      alert("Vui lòng chọn Đại lý phân phối sỉ (BR-06-001).");
      return;
    }
    if (cartItems.length === 0) {
      alert("Phiếu nhập phải có ít nhất một dòng hàng (BR-06-001).");
      return;
    }
    if (!khoNhap) {
      alert("Vui lòng chọn kho nhập (BR-06-001).");
      return;
    }

    // BR-06-021: Credit Limit Policy checks
    const creditLimit = selectedSupInfo ? (selectedSupInfo.hanMucCongNo || 0) : 0;
    const currentDebt = selectedSupInfo ? (selectedSupInfo.debt || 0) : 0;
    const currentVoucherTotal = cartItems.reduce((acc, item) => acc + (item.thanhTien || (item.soLuong * item.donGia)), 0);
    const newPotentialDebt = currentDebt + currentVoucherTotal - Number(importPaid || 0);
    const creditPolicy = selectedSupInfo ? (selectedSupInfo.chinhSachCongNo || 'Warn') : 'Warn';

    let isExceedApproved = false;

    if (trangThaiImport === 'HoanThanh' && creditPolicy !== 'Unlimited' && newPotentialDebt > creditLimit) {
      if (creditPolicy === 'Strict') {
        alert(`⚠️ KHÔNG CHO PHÉP VƯỢT HẠN MỨC CÔNG NỢ!\n\nNhà cung cấp này áp dụng chính sách nghiêm ngặt.\nCông nợ hiện tại: ${currentDebt.toLocaleString()}đ\nHạn mức công nợ: ${creditLimit.toLocaleString()}đ\nCông nợ dự kiến sau phiếu nhập này: ${newPotentialDebt.toLocaleString()}đ\n\nVui lòng thanh toán thêm (trả tiền ngay) hoặc liên hệ quản trị viên để nâng hạn mức (BR-06-021).`);
        return;
      } else if (creditPolicy === 'Warn') {
        const ok = window.confirm(`⚠️ CẢNH BÁO VƯỢT HẠN MỨC CÔNG NỢ!\n\nNhà cung cấp này đã thiết lập chính sách Cảnh báo vượt hạn mức.\nCông nợ dự kiến sau khi nhập: ${newPotentialDebt.toLocaleString()}đ\nHạn mức công nợ: ${creditLimit.toLocaleString()}đ\n\nBà con có chắc chắn muốn duyệt hoàn thành phiếu nhập này không?`);
        if (!ok) return;
        isExceedApproved = true;
      }
    }

    try {
      setLoading(true);
      const originalVoucher = editingVoucherId ? importVouchers.find(v => v.id === editingVoucherId) : null;
      const currentVersion = originalVoucher ? originalVoucher.version : 1;
      const idempotencyKey = trangThaiImport === 'HoanThanh' ? ("IK-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now()) : undefined;

      const payload: any = {
        nhaCungCapId: Number(importSupId),
        daThanhToan: Number(importPaid || 0),
        ghiChu: importNote.trim(),
        trangThai: trangThaiImport,
        khoNhap: khoNhap,
        isExceedApproved,
        chiTiet: cartItems.map(item => ({
          hangHoaId: item.hangHoaId,
          soLuong: item.soLuong,
          donGia: item.donGia,
          maLo: item.maLo,
          ngaySanXuat: item.ngaySanXuat,
          hanSuDung: item.hanSuDung,
          lyDoThayDoiGia: item.lyDoThayDoiGia || "",
          chietKhauLoai: item.chietKhauLoai || "None",
          chietKhauGiaTri: item.chietKhauGiaTri || 0,
          chietKhau: item.chietKhau || 0,
          thueSuatVAT: item.thueSuatVAT || 0,
          tienThueVAT: item.tienThueVAT || 0,
          thanhTien: item.thanhTien || (item.soLuong * item.donGia)
        }))
      };

      if (editingVoucherId) {
        payload.version = currentVersion;
      }
      if (idempotencyKey) {
        payload.idempotencyKey = idempotencyKey;
      }

      const customHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (idempotencyKey) {
        customHeaders['X-Idempotency-Key'] = idempotencyKey;
      }

      let res;
      if (editingVoucherId) {
        res = await fetch(`/api/imports/${editingVoucherId}`, {
          method: 'PUT',
          headers: customHeaders,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/imports', {
          method: 'POST',
          headers: customHeaders,
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Nhập sỉ thất bại");
      }

      setImportSuccess(`Đã lưu phiếu nhập ${data.maPhieuNhap} thành công với trạng thái: ${data.trangThai === 'HoanThanh' ? 'Hoàn thành' : data.trangThai === 'ChoXacNhan' ? 'Chờ xác nhận' : 'Nháp'}`);
      
      // Reset form states
      setCartItems([]);
      setImportSupId('');
      setImportPaid('');
      setImportNote('');
      setEditingVoucherId(null);
      setKhoNhap('Kho chính Hải Đăng');
      setTrangThaiImport('HoanThanh');
      
      await loadData();
      await fetchImportVouchers();
      onSuccess();
      setTimeout(() => setImportSuccess(''), 6000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel Voucher Handler - BR-06-005
  const handleCancelVoucher = async (id: number) => {
    if (!cancelReason) {
      alert("Vui lòng nhập lý do hủy phiếu (BR-06-005).");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/imports/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lyDoHuy: cancelReason,
          nguoiHuy: 'Admin'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Hủy phiếu nhập thất bại");
      }
      alert(`Đã hủy phiếu nhập ${data.maPhieuNhap} thành công!`);
      setCancelVoucherId(null);
      setCancelReason('');
      setSelectedVoucher(null);
      await loadData();
      await fetchImportVouchers();
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Confirm pending voucher to completed
  const handleDirectConfirmVoucher = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xác nhận HOÀN THÀNH phiếu nhập này? Hành động này sẽ cộng dồn kho sỉ, lưu lô FEFO và ghi nợ NCC.")) return;
    try {
      setLoading(true);
      const originalVoucher = importVouchers.find(v => v.id === id);
      const currentVersion = originalVoucher ? originalVoucher.version : 1;
      const idempotencyKey = "IK-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now();

      const res = await fetch(`/api/imports/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          trangThai: 'HoanThanh',
          version: currentVersion,
          idempotencyKey: idempotencyKey
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Xác nhận phiếu nhập thất bại");
      }
      alert("Xác nhận hoàn thành phiếu nhập thành công!");
      setSelectedVoucher(null);
      await loadData();
      await fetchImportVouchers();
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pay more for a completed voucher (BR-06-033)
  const handlePayMoreVoucher = async (id: number) => {
    if (!payMoreAmount) return;
    const amt = Number(payMoreAmount);
    if (amt <= 0) {
      alert("Số tiền thanh toán phải lớn hơn 0đ (VR-06-032-001).");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/imports/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soTienThanhToan: amt,
          phuongThucThanhToan: payMoreMethod,
          ghiChu: `Thanh toán thêm bằng ${payMoreMethod}`
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Thanh toán thêm thất bại");
      }
      alert("Đã ghi nhận thanh toán thành công!");
      setPayMoreAmount('');
      // Update selectedVoucher reference
      setSelectedVoucher(data.phieu);
      await loadData();
      await fetchImportVouchers();
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.tenTrenBaoBi.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.hoatChat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.maHangHoa.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup ? p.nhomHangId === Number(selectedGroup) : true;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6" id="goods-tab">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
          <Archive className="text-[#166534] h-5 w-5" /> Quản Lý Danh Mục Vật Tư & Thuốc Bảo Vệ
        </h2>
        <p className="text-xs text-slate-500">
          Chứa danh sách 32 bảng thông tin thuốc nông dược, phân bón. Có trợ lý quét nhãn bao bì chụp ảnh AI thông minh.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Switchable Sub-tabs (5 Cols) */}
        <div className={`${leftTab === 'stock-audit' ? 'lg:col-span-12' : 'lg:col-span-5'} space-y-6`}>
          
          {/* Sub-tabs toggler (Geometric Balance Theme style) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex gap-1">
            <button
              type="button"
              onClick={() => setLeftTab('ai-declare')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition cursor-pointer ${leftTab === 'ai-declare' ? 'bg-emerald-50 text-[#166534] border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              🏷️ Khai báo & AI
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('wholesale-import')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition cursor-pointer ${leftTab === 'wholesale-import' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              📦 Nhập Sỉ Đại Lý
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('stock-audit')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition cursor-pointer ${leftTab === 'stock-audit' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              ⚖️ Kiểm Lệch Kho
            </button>
          </div>

          {leftTab === 'ai-declare' && (
            <>
              {/* AI OCR Packaging scanner */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Camera className="text-[#166534] h-5 w-5" /> Trợ Lý Quét Nhãn Chai AI
                  </h3>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black rounded-full uppercase flex items-center gap-0.5">
                    <Sparkles className="h-3 w-3" /> Gemini
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Bà con mang bao bì thuốc lạ tới? Bạn chỉ cần bấm chọn nhãn chai mẫu bên dưới (hoặc tải ảnh chụp mặt nhãn) để AI tự động bóc tách hoạt chất, liều lượng, số ngày cách ly và đề xuất công dụng!
                </p>

                {/* Custom File Upload Input */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">Tải ảnh chụp từ Camera di động:</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 border border-dashed border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer transition">
                      <FileImage className="h-4 w-4 text-slate-500" />
                      <span className="text-xs text-slate-600 font-semibold truncate">
                        {customFileName ? customFileName : 'Chọn ảnh bao bì thuốc...'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {customFileBase64 && (
                      <button
                        type="button"
                        onClick={handleClearCustomFile}
                        className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-xs"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>

                {/* Mock Image Selection if no custom file */}
                {!customFileBase64 && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Hoặc bấm chọn chai mẫu mô phỏng:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMockPhoto('anvil')}
                        className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${selectedMockPhoto === 'anvil' ? 'bg-emerald-50 border-emerald-200 text-[#166534]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        Anvil 5SC (Thụy Sỹ)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMockPhoto('comanche')}
                        className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${selectedMockPhoto === 'comanche' ? 'bg-emerald-50 border-emerald-200 text-[#166534]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        Comanche Trừ Cỏ
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMockPhoto('regent')}
                        className={`p-2 rounded-lg text-xs font-bold border text-center transition cursor-pointer ${selectedMockPhoto === 'regent' ? 'bg-emerald-50 border-emerald-200 text-[#166534]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        Regent 800WG
                      </button>
                    </div>
                  </div>
                )}

                {/* Action OCR trigger */}
                <button
                  type="button"
                  onClick={handleTriggerAIOCR}
                  disabled={aiLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-[#166534] to-[#15803d] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  id="btn-trigger-ai-ocr"
                >
                  <Sparkles className="h-4 w-4 animate-spin-slow" />
                  {aiLoading ? 'Trí tuệ nhân tạo Gemini đang quét nhãn...' : 'Khởi Chạy Quét Nhãn AI'}
                </button>

                {ocrSuccess && (
                  <div className="bg-purple-50 border border-purple-200 text-purple-950 p-3 rounded-lg text-xs font-medium flex items-start gap-1.5 leading-relaxed">
                    <Check className="h-4 w-4 text-purple-700 shrink-0 mt-0.5" />
                    <span>{ocrSuccess}</span>
                  </div>
                )}
              </div>

              {/* Standard Form */}
              <form onSubmit={handleAddProduct} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingProduct ? `Cập Nhật Mặt Hàng: ${editingProduct.maHangHoa}` : 'Khai Báo Mặt Hàng'}
                  </h3>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={handleCancelEditProduct}
                      className="text-xs text-red-650 hover:underline font-bold"
                    >
                      Hủy bỏ sửa
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên trên bao bì *</label>
                    <input
                      type="text"
                      required
                      placeholder="vd: Anvil 5SC"
                      value={tenTrenBaoBi}
                      onChange={e => setTenTrenBaoBi(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#166534] focus:bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên thường gọi</label>
                    <input
                      type="text"
                      placeholder="vd: Trừ bệnh Anvil"
                      value={tenThuongGoi}
                      onChange={e => setTenThuongGoi(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#166534] focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nhóm hàng *</label>
                    <SmartComboBox
                      options={categories.nhomHangs}
                      value={nhomHangId ? Number(nhomHangId) : ''}
                      onChange={val => setNhomHangId(String(val))}
                      getLabel={(n: NhomHang) => n.tenNhom}
                      getValue={(n: NhomHang) => n.id}
                      placeholder="Chọn nhóm hàng..."
                      onQuickCreate={handleQuickCreateNhomHang}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Đơn vị tính</label>
                    <SmartComboBox
                      options={categories.donViTinhs}
                      value={donViTinhId ? Number(donViTinhId) : ''}
                      onChange={val => setDonViTinhId(String(val))}
                      getLabel={(d: DonViTinh) => d.tenDonVi}
                      getValue={(d: DonViTinh) => d.id}
                      placeholder="Chọn đơn vị tính..."
                      onQuickCreate={handleQuickCreateDonViTinh}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nhà sản xuất</label>
                    <SmartComboBox
                      options={categories.nhaSanXuats}
                      value={nhaSanXuatId ? Number(nhaSanXuatId) : ''}
                      onChange={val => setNhaSanXuatId(String(val))}
                      getLabel={(m: NhaSanXuat) => m.tenNhaSanXuat}
                      getValue={(m: NhaSanXuat) => m.id}
                      placeholder="Chọn nhà sản xuất..."
                      onQuickCreate={handleQuickCreateNhaSanXuat}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hoạt chất trị bệnh</label>
                    <input
                      type="text"
                      placeholder="Hexaconazole"
                      value={hoatChat}
                      onChange={e => setHoatChat(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#166534] focus:bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hàm lượng</label>
                    <input
                      type="text"
                      placeholder="50g/L"
                      value={hamLuong}
                      onChange={e => setHamLuong(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#166534] focus:bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quy cách đóng chai</label>
                    <input
                      type="text"
                      placeholder="Chai 100ml"
                      value={quyCach}
                      onChange={e => setQuyCach(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#166534] focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Liều lượng khuyến cáo</label>
                    <input
                      type="text"
                      placeholder="20ml cho bình 16L"
                      value={lieuLuong}
                      onChange={e => setLieuLuong(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#166534] focus:bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian cách ly (ngày)</label>
                    <input
                      type="number"
                      min="0"
                      value={thoiGianCachLy}
                      onChange={e => setThoiGianCachLy(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#166534] focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Price configs */}
                <div className="grid grid-cols-2 gap-3 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <div>
                    <label className="block text-xs font-bold text-[#166534] mb-1">Giá sỉ nhập kho (đ)</label>
                    <input
                      type="number"
                      placeholder="75000"
                      value={giaNhapHienTai}
                      onChange={e => setGiaNhapHienTai(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs text-right font-bold text-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#166534] mb-1">Giá bán lẻ (đ)</label>
                    <input
                      type="number"
                      placeholder="85000"
                      value={giaBanHienTai}
                      onChange={e => setGiaBanHienTai(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs text-right font-bold text-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                      id="input-prod-sellprice"
                    />
                  </div>
                </div>

                {/* Supplier Relationship (BR-06-022, BR-06-023) */}
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-3">
                  <div className="text-[10px] font-black text-blue-900 uppercase tracking-wider">🤝 QUAN HỆ NHÀ CUNG CẤP (SUPPLIER RELATIONSHIP)</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nhà cung cấp ưu tiên (Preferred Supplier)</label>
                      <select
                        value={nhaCungCapUuTienId}
                        onChange={e => setNhaCungCapUuTienId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                      >
                        <option value="">-- Chưa chọn / Không có ưu tiên --</option>
                        {suppliers.map(sup => (
                          <option key={sup.id} value={sup.id}>{sup.tenCongTy} ({sup.maNhaCungCap})</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">Sản phẩm này sẽ ưu tiên đặt từ nhà cung cấp đã chọn (BR-06-022).</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Danh sách nhà cung cấp hỗ trợ</label>
                      <div className="grid grid-cols-1 gap-1 bg-white p-2 border border-slate-200 rounded-lg max-h-24 overflow-y-auto">
                        {suppliers.map(sup => {
                          const checked = nhaCungCapIds.includes(sup.id);
                          return (
                            <label key={sup.id} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer hover:bg-slate-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setNhaCungCapIds(prev => [...prev, sup.id]);
                                  } else {
                                    setNhaCungCapIds(prev => prev.filter(id => id !== sup.id));
                                  }
                                }}
                                className="rounded text-[#166534] focus:ring-[#166534]"
                              />
                              <span className="truncate">{sup.tenCongTy}</span>
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Các nhà cung cấp có khả năng cung ứng mặt hàng này (BR-06-023).</p>
                    </div>
                  </div>
                </div>

                {/* Many-to-Many Attributes */}
                <div className="space-y-3">
                  {/* Uses */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nhóm Công Dụng Sinh Học:</label>
                    <div className="flex flex-wrap gap-1">
                      {categories.congDungs.map(u => (
                        <button
                          type="button"
                          key={u.id}
                          onClick={() => toggleUse(u.id)}
                          className={`px-2 py-1 text-[10px] font-semibold border rounded-md transition cursor-pointer ${selectedUses.includes(u.id) ? 'bg-[#166534] border-[#166534] text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                        >
                          {u.tenCongDung}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Crops */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phù hợp cây trồng:</label>
                    <div className="flex flex-wrap gap-1">
                      {categories.cayTrongs.map(c => (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => toggleCrop(c.id)}
                          className={`px-2 py-1 text-[10px] font-semibold border rounded-md transition cursor-pointer ${selectedCrops.includes(c.id) ? 'bg-[#166534] border-[#166534] text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                        >
                          {c.tenCayTrong}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pests */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Đặc trị sâu bệnh:</label>
                    <div className="flex flex-wrap gap-1">
                      {categories.benhSauHais.map(p => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => togglePest(p.id)}
                          className={`px-2 py-1 text-[10px] font-semibold border rounded-md transition cursor-pointer ${selectedPests.includes(p.id) ? 'bg-[#166534] border-[#166534] text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                        >
                          {p.tenBenhSau}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={handleCancelEditProduct}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
                    >
                      Hủy bỏ sửa
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs transition cursor-pointer"
                    id="btn-submit-prod"
                  >
                    {editingProduct ? 'Cập Nhật Thông Tin' : 'Lưu & Đồng bộ kho hàng sỉ'}
                  </button>
                </div>
              </form>
            </>
          )}

          {leftTab === 'wholesale-import' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm pb-1 flex items-center gap-1.5">
                <Database className="text-[#166534] h-5 w-5" /> Quản Lý Nhập Hàng Đại Lý (BR-06)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed pb-2 border-b border-slate-100">
                Lập phiếu nhập kho sỉ, theo dõi trạng thái Nháp, Chờ duyệt, hoặc Hoàn thành. Tự động ghi nhận Nhật ký kho (FEFO), Công nợ và Sổ Quỹ.
              </p>

              {/* Sub tab toggler */}
              <div className="flex border border-slate-200 bg-slate-50 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setImportSubTab('create');
                    setEditingVoucherId(null);
                    setCartItems([]);
                    setImportSupId('');
                    setImportPaid('');
                    setImportNote('');
                  }}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-md transition ${importSubTab === 'create' && !editingVoucherId ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-750'}`}
                >
                  Tạo Phiếu Nhập Mới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportSubTab('list');
                    fetchImportVouchers();
                  }}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-md transition ${importSubTab === 'list' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-750'}`}
                >
                  Danh Sách Phiếu Nhập ({importVouchers.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportSubTab('debt-history');
                    fetchSupplierDebtHistory();
                  }}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-md transition ${importSubTab === 'debt-history' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-750'}`}
                >
                  Lịch Sử Công Nợ NCC
                </button>
              </div>

              {importSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-[#166534] p-2.5 rounded text-xs font-semibold">
                  ✅ {importSuccess}
                </div>
              )}

              {/* VIEW 1: CREATE / EDIT VOUCHER */}
              {importSubTab === 'create' && (
                <div className="space-y-4">
                  {editingVoucherId && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-900">
                        正在 chỉnh sửa Phiếu Nhập: <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">ID #{editingVoucherId}</code>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVoucherId(null);
                          setCartItems([]);
                          setImportSupId('');
                        }}
                        className="text-xs text-red-600 font-bold hover:underline"
                      >
                        Hủy Chỉnh Sửa
                      </button>
                    </div>
                  )}

                  {/* Trợ lý AI Đề xuất Nhà cung cấp (BR-06-019) */}
                  <div className="bg-gradient-to-r from-teal-800 to-teal-950 p-4 border border-teal-700 rounded-xl text-white space-y-3 shadow-md">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-[10px] font-bold tracking-wider uppercase bg-teal-900/80 text-teal-100 px-2 py-0.5 rounded-full inline-block">Trợ lý AI Độc Quyền</div>
                        <h4 className="text-sm font-black mt-1 flex items-center gap-1.5">
                          <span>🤖 Trợ lý AI Phân tích & Đề xuất sỉ</span>
                        </h4>
                        <p className="text-[11px] text-teal-100/90 mt-1 max-w-md leading-relaxed">
                          AI phân tích đồng thời: Đơn giá sỉ, Lịch sử giao dịch, Công nợ hiện tại, Hạn mức, Uy tín, Thời gian giao hàng & Tỷ lệ hoàn thành để đề xuất Đại lý tối ưu nhất.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleFetchAIRecommend}
                        disabled={loadingAIRecommend}
                        className="px-3 py-2 bg-white text-teal-900 hover:bg-teal-50 active:scale-95 disabled:opacity-50 text-xs font-black rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
                      >
                        {loadingAIRecommend ? (
                          <>
                            <span className="w-3 h-3 border-2 border-teal-900 border-t-transparent rounded-full animate-spin" />
                            Đang quét...
                          </>
                        ) : (
                          <>
                            <span>⚡ AI Đề Xuất</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* AI Recommendation Panel */}
                    {aiRecommendation && (
                      <div className="bg-white rounded-lg p-3 text-slate-800 space-y-3 shadow-sm border border-teal-600/20">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 flex justify-between items-center">
                          <span>📋 ĐỀ XUẤT TỐI ƯU TỪ GEMINI AI</span>
                          <span className="font-mono text-teal-700">{aiRecommendation.metadata?.model || 'Gemini 3.6'}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {/* 1. Best Match */}
                          <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-lg flex flex-col justify-between space-y-1">
                            <div>
                              <div className="text-[10px] font-bold uppercase text-emerald-800">🌟 Phù hợp nhất (Best Match)</div>
                              <div className="text-xs font-black text-emerald-950 mt-0.5">{aiRecommendation.bestMatch?.supplierName}</div>
                              <p className="text-[10px] text-emerald-800/90 mt-1 line-clamp-3 leading-relaxed">{aiRecommendation.bestMatch?.reason}</p>
                            </div>
                            <div className="pt-2 border-t border-emerald-100/60 mt-2 flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-emerald-700">Độ tin cậy: {aiRecommendation.bestMatch?.confidenceScore}%</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setImportSupId(String(aiRecommendation.bestMatch?.supplierId));
                                  alert(`Đã chọn đại lý: ${aiRecommendation.bestMatch?.supplierName} theo đề xuất của AI (BR-06-019).`);
                                }}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer transition active:scale-95"
                              >
                                Áp dụng
                              </button>
                            </div>
                          </div>

                          {/* 2. Lowest Price */}
                          <div className="p-2.5 bg-sky-50/60 border border-sky-100 rounded-lg flex flex-col justify-between space-y-1">
                            <div>
                              <div className="text-[10px] font-bold uppercase text-sky-800">💰 Giá thấp nhất (Lowest Cost)</div>
                              <div className="text-xs font-black text-sky-950 mt-0.5">{aiRecommendation.lowestPrice?.supplierName}</div>
                              <p className="text-[10px] text-sky-800/90 mt-1 line-clamp-3 leading-relaxed">{aiRecommendation.lowestPrice?.reason}</p>
                            </div>
                            <div className="pt-2 border-t border-sky-100/60 mt-2 flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-sky-700">Độ tin cậy: {aiRecommendation.lowestPrice?.confidenceScore}%</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setImportSupId(String(aiRecommendation.lowestPrice?.supplierId));
                                  alert(`Đã chọn đại lý: ${aiRecommendation.lowestPrice?.supplierName} theo đề xuất của AI (BR-06-019).`);
                                }}
                                className="px-2 py-0.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-[10px] font-bold cursor-pointer transition active:scale-95"
                              >
                                Áp dụng
                              </button>
                            </div>
                          </div>

                          {/* 3. Fastest Delivery */}
                          <div className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-lg flex flex-col justify-between space-y-1">
                            <div>
                              <div className="text-[10px] font-bold uppercase text-amber-800">⚡ Giao hàng nhanh nhất (Fastest)</div>
                              <div className="text-xs font-black text-amber-950 mt-0.5">{aiRecommendation.fastestDelivery?.supplierName}</div>
                              <p className="text-[10px] text-amber-800/90 mt-1 line-clamp-3 leading-relaxed">{aiRecommendation.fastestDelivery?.reason}</p>
                            </div>
                            <div className="pt-2 border-t border-amber-100/60 mt-2 flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-amber-700">Độ tin cậy: {aiRecommendation.fastestDelivery?.confidenceScore}%</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setImportSupId(String(aiRecommendation.fastestDelivery?.supplierId));
                                  alert(`Đã chọn đại lý: ${aiRecommendation.fastestDelivery?.supplierName} theo đề xuất của AI (BR-06-019).`);
                                }}
                                className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold cursor-pointer transition active:scale-95"
                              >
                                Áp dụng
                              </button>
                            </div>
                          </div>

                          {/* 4. Most Consistent */}
                          <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-lg flex flex-col justify-between space-y-1">
                            <div>
                              <div className="text-[10px] font-bold uppercase text-purple-800">🛡️ Ổn định & Uy tín (Consistent)</div>
                              <div className="text-xs font-black text-purple-950 mt-0.5">{aiRecommendation.mostConsistent?.supplierName}</div>
                              <p className="text-[10px] text-purple-800/90 mt-1 line-clamp-3 leading-relaxed">{aiRecommendation.mostConsistent?.reason}</p>
                            </div>
                            <div className="pt-2 border-t border-purple-100/60 mt-2 flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-purple-700">Độ tin cậy: {aiRecommendation.mostConsistent?.confidenceScore}%</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setImportSupId(String(aiRecommendation.mostConsistent?.supplierId));
                                  alert(`Đã chọn đại lý: ${aiRecommendation.mostConsistent?.supplierName} theo đề xuất của AI (BR-06-019).`);
                                }}
                                className="px-2 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold cursor-pointer transition active:scale-95"
                              >
                                Áp dụng
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-[9.5px] text-slate-400 italic text-right pt-1.5 border-t border-slate-100">
                          * Lưu ý: AI chỉ hỗ trợ phân tích và tư vấn. Quyết định lựa chọn cuối cùng luôn thuộc về bạn.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form 1: General Information */}
                  <div className="space-y-3 bg-slate-50/70 p-3.5 border border-slate-200/70 rounded-xl">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">📋 THÔNG TIN CHUNG PHIẾU NHẬP</div>

                    {/* Supplier Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Đại lý phân phối sỉ *</label>
                      <SmartComboBox
                        options={suppliers}
                        value={importSupId ? Number(importSupId) : ''}
                        onChange={val => setImportSupId(String(val))}
                        getLabel={(s: NhaCungCap) => `${s.tenNhaCungCap} (Hiện nợ sỉ: ${(s.debt || 0).toLocaleString()}đ)`}
                        getValue={(s: NhaCungCap) => s.id}
                        placeholder="Chọn đại lý sỉ cung cấp..."
                        disabled={!!(editingVoucherId && importVouchers.find(v => v.id === editingVoucherId)?.trangThai === 'HoanThanh')}
                      />
                    </div>

                    {/* Visual Supplier Debt, Limit and Verification alert blocks - BR-06-015, BR-06-016 */}
                    {selectedSupInfo && (
                      <div className="mt-2.5 p-3 bg-white border border-slate-200 rounded-lg space-y-2 text-xs shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-700 flex items-center gap-1">📊 Tình trạng Công nợ & Hạn mức sỉ</span>
                          {(() => {
                            const debt = selectedSupInfo.debt || 0;
                            const limit = selectedSupInfo.hanMucCongNo || 0;
                            const ratio = limit > 0 ? (debt / limit) * 100 : 0;
                            if (limit === 0) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Không giới hạn</span>;
                            if (ratio <= 70) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">🟢 An toàn</span>;
                            if (ratio <= 100) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">🟡 Cảnh báo hạn mức</span>;
                            return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">🔴 Nghiêm cấm nợ</span>;
                          })()}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-2 rounded text-center">
                          <div>
                            <div className="text-slate-500">Đang nợ sỉ:</div>
                            <div className="font-bold text-slate-800">{(selectedSupInfo.debt || 0).toLocaleString()}đ</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Hạn mức tối đa:</div>
                            <div className="font-bold text-slate-800">{(selectedSupInfo.hanMucCongNo || 0).toLocaleString()}đ</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Hạn mức khả dụng:</div>
                            <div className={`font-bold ${Math.max(0, (selectedSupInfo.hanMucCongNo || 0) - (selectedSupInfo.debt || 0)) <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                              {Math.max(0, (selectedSupInfo.hanMucCongNo || 0) - (selectedSupInfo.debt || 0)).toLocaleString()}đ
                            </div>
                          </div>
                        </div>
                        {selectedSupInfo.hanMucCongNo > 0 && (
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                ((selectedSupInfo.debt || 0) / selectedSupInfo.hanMucCongNo) * 100 <= 70 ? 'bg-emerald-500' :
                                ((selectedSupInfo.debt || 0) / selectedSupInfo.hanMucCongNo) * 100 <= 100 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, ((selectedSupInfo.debt || 0) / selectedSupInfo.hanMucCongNo) * 100)}%` }}
                            />
                          </div>
                        )}
                        {/* Status Check (BR-06-015) */}
                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-slate-600">
                            <span>Trạng thái hợp tác:</span>
                            <span className={`font-bold ${selectedSupInfo.trangThaiHoatDong === 'NgungHopTac' ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {selectedSupInfo.trangThaiHoatDong === 'NgungHopTac' ? '🔴 Ngừng hợp tác' : '🟢 Đang hợp tác'}
                            </span>
                          </div>
                          <div className="text-slate-400 font-mono text-[9px]">ID: {selectedSupInfo.maNhaCungCap || selectedSupInfo.id}</div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {/* Warehouse Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Kho nhập hàng *</label>
                        <select
                          value={khoNhap}
                          onChange={e => setKhoNhap(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        >
                          <option value="Kho chính Hải Đăng">Kho chính Hải Đăng</option>
                          <option value="Kho phụ Tuy Định">Kho phụ Tuy Định</option>
                        </select>
                      </div>

                      {/* Status Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái phiếu nhập *</label>
                        <select
                          value={trangThaiImport}
                          onChange={e => setTrangThaiImport(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-[#166534]"
                        >
                          <option value="HoanThanh">Hoàn thành (Cộng kho & nợ sỉ ngay)</option>
                          <option value="ChoXacNhan">Chờ xác nhận (Lưu tạm duyệt sau)</option>
                          <option value="Nhap">Nháp (Lưu bản thảo nháp)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form 2: Add Item to Cart */}
                  <form onSubmit={handleAddItemToCart} className="bg-emerald-50/40 p-3.5 border border-emerald-100 rounded-xl space-y-3">
                    <div className="text-[10px] font-black text-[#166534] uppercase tracking-wider mb-1">➕ THÊM DÒNG HÀNG SẢN PHẨM NHẬP KHO</div>

                    {/* Product Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Sản phẩm nhập *</label>
                      <SmartComboBox
                        options={products}
                        value={importProductId ? Number(importProductId) : ''}
                        onChange={val => {
                          const prodId = String(val);
                          setImportProductId(prodId);
                          const matched = products.find(p => p.id === Number(prodId));
                          
                          // Auto apply active quote if exists (BR-06-018)
                          const today = new Date().toISOString().split('T')[0];
                          const activeQuotes = supplierQuotes.filter(q => {
                            if (q.hangHoaId !== Number(prodId)) return false;
                            if (today < q.ngayHieuLuc) return false;
                            if (q.ngayHetHieuLuc && today > q.ngayHetHieuLuc) return false;
                            return true;
                          });

                          if (activeQuotes.length > 0) {
                            activeQuotes.sort((a, b) => {
                              if (a.ngayHieuLuc !== b.ngayHieuLuc) {
                                return b.ngayHieuLuc.localeCompare(a.ngayHieuLuc);
                              }
                              return b.id - a.id;
                            });
                            setImportCost(activeQuotes[0].giaBao.toString());
                          } else if (matched) {
                            setImportCost(matched.giaNhapHienTai.toString());
                          }
                        }}
                        getLabel={(p: Product) => `${p.tenTrenBaoBi} (Hiện tại trong kho: ${p.currentStock})`}
                        getValue={(p: Product) => p.id}
                        placeholder="Chọn sản phẩm thuốc sỉ..."
                      />
                    </div>

                    {/* Active Quote and Price History display card (BR-06-017, BR-06-018) */}
                    {importSupId && importProductId && (
                      <div className="p-3 bg-white border border-slate-200/80 rounded-lg space-y-2 text-xs shadow-sm">
                        {/* 1. Báo giá NCC */}
                        {(() => {
                          const suggested = getSuggestedQuote();
                          const expired = getExpiredQuote();
                          if (suggested) {
                            return (
                              <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded">
                                <div className="font-bold flex items-center justify-between">
                                  <span>✅ Báo giá đang hiệu lực:</span>
                                  <span className="text-emerald-900 font-extrabold underline">{suggested.giaBao.toLocaleString()}đ</span>
                                </div>
                                <div className="text-[10px] text-emerald-700 mt-0.5 leading-relaxed">
                                  Áp dụng từ {suggested.ngayHieuLuc} đến {suggested.ngayHetHieuLuc || 'vô thời hạn'}. Hệ thống tự động điền giá.
                                </div>
                              </div>
                            );
                          } else if (expired) {
                            return (
                              <div className="p-2 bg-amber-50 border border-amber-100 text-amber-800 rounded">
                                <div className="font-bold">⚠️ Báo giá quá hạn:</div>
                                <div className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                                  Báo giá gần nhất đã hết hiệu lực vào <span className="font-mono">{expired.ngayHetHieuLuc}</span> (Giá báo: <span className="font-bold">{expired.giaBao.toLocaleString()}đ</span>).
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="p-2 bg-slate-50 border border-slate-200 text-slate-600 rounded">
                                <div className="text-[11px] font-semibold">ℹ️ Chưa có báo giá chính thức cho sản phẩm này.</div>
                              </div>
                            );
                          }
                        })()}

                        {/* 2. Lịch sử giá nhập sỉ */}
                        {selectedProductPriceHistory && (
                          <div className="p-2.5 bg-sky-50/70 border border-sky-100 rounded text-slate-700">
                            <div className="font-bold text-sky-950 mb-1 flex items-center gap-1">
                              <span>📈 Lịch sử nhập hàng từ đại lý này:</span>
                            </div>
                            {selectedProductPriceHistory.hasHistory ? (
                              <div className="space-y-1 text-[11px] text-slate-600">
                                <div className="flex justify-between">
                                  <span>Lần nhập gần nhất:</span>
                                  <span className="font-bold text-sky-900">{selectedProductPriceHistory.giaNhapGanNhat.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Ngày nhập gần nhất:</span>
                                  <span className="font-mono">{new Date(selectedProductPriceHistory.ngayNhapGanNhat).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-sky-100/60 mt-1">
                                  <span>Giá nhập cao nhất:</span>
                                  <span className="font-bold text-rose-700">{selectedProductPriceHistory.giaNhapCaoNhat.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Giá nhập thấp nhất:</span>
                                  <span className="font-bold text-emerald-700">{selectedProductPriceHistory.giaNhapThapNhat.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tổng số lần nhập:</span>
                                  <span className="font-bold">{selectedProductPriceHistory.soLanNhap} lần</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-500 italic">Chưa phát sinh giao dịch nhập sỉ sản phẩm này trước đây.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng nhập *</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="vd: 100"
                          value={importQty}
                          onChange={e => setImportQty(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none text-right font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Đơn giá nhập sỉ *</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="vd: 55000"
                          value={importCost}
                          onChange={e => setImportCost(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none text-right font-bold"
                        />
                      </div>
                    </div>

                    {/* Price Alteration Reason Area (BR-06-018) */}
                    {(() => {
                      const activeQuote = getSuggestedQuote();
                      if (activeQuote && Number(importCost) !== activeQuote.giaBao) {
                        return (
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                            <div className="font-bold text-amber-800 flex items-center gap-1">
                              <span>⚠️ Đơn giá sai lệch so với Báo giá hiệu lực ({activeQuote.giaBao.toLocaleString()}đ)</span>
                            </div>
                            <p className="text-[11px] text-amber-700">Vui lòng nhập lý do điều chỉnh đơn giá sỉ để lưu Audit Trail (bắt buộc):</p>
                            <textarea
                              value={priceChangeReason}
                              onChange={e => setPriceChangeReason(e.target.value)}
                              placeholder="vd: Được đại lý giảm giá thêm do nhập khối lượng lớn..."
                              className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none text-slate-800 text-xs"
                              rows={2}
                              required
                            />
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Line Item Discount & VAT (BR-06-028, BR-06-029) */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Loại chiết khấu dòng</label>
                        <select
                          value={chietKhauLoai}
                          onChange={e => {
                            setChietKhauLoai(e.target.value as any);
                            setChietKhauGiaTri(0);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="None">Không chiết khấu</option>
                          <option value="PhanTram">Theo phần trăm (%)</option>
                          <option value="Tien">Theo số tiền trực tiếp (đ)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {chietKhauLoai === 'PhanTram' ? 'Phần trăm chiết khấu *' : chietKhauLoai === 'Tien' ? 'Số tiền chiết khấu (đ) *' : 'Giá trị chiết khấu'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          disabled={chietKhauLoai === 'None'}
                          placeholder={chietKhauLoai === 'PhanTram' ? 'vd: 5' : chietKhauLoai === 'Tien' ? 'vd: 50000' : '0'}
                          value={chietKhauLoai === 'None' ? '' : chietKhauGiaTri || ''}
                          onChange={e => setChietKhauGiaTri(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none text-right font-bold disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Thuế suất VAT (%) *</label>
                        <select
                          value={thueSuatVAT}
                          onChange={e => setThueSuatVAT(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                        >
                          <option value={0}>0% (Không chịu thuế / miễn thuế)</option>
                          <option value={5}>5%</option>
                          <option value={8}>8%</option>
                          <option value={10}>10%</option>
                        </select>
                      </div>
                    </div>

                    {/* Real-time Calculation Summary Card (BR-06-030) */}
                    {Number(importQty) > 0 && Number(importCost) > 0 && (
                      <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-1 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Thành tiền tạm tính:</span>
                          <span className="font-mono">{(Number(importQty) * Number(importCost)).toLocaleString()}đ</span>
                        </div>
                        {chietKhauLoai !== 'None' && (
                          <div className="flex justify-between text-rose-650 font-medium">
                            <span>Chiết khấu giảm trừ ({chietKhauLoai === 'PhanTram' ? `${chietKhauGiaTri}%` : 'tiền mặt'}):</span>
                            <span className="font-mono">
                              -{(() => {
                                const subTotal = Number(importQty) * Number(importCost);
                                let disc = chietKhauLoai === 'PhanTram' ? (subTotal * chietKhauGiaTri / 100) : chietKhauGiaTri;
                                if (disc > subTotal) disc = subTotal;
                                return Math.round(disc).toLocaleString();
                              })()}đ
                            </span>
                          </div>
                        )}
                        {thueSuatVAT > 0 && (
                          <div className="flex justify-between text-sky-700 font-medium">
                            <span>Thuế VAT ({thueSuatVAT}%):</span>
                            <span className="font-mono">
                              +{(() => {
                                const subTotal = Number(importQty) * Number(importCost);
                                let disc = chietKhauLoai === 'PhanTram' ? (subTotal * chietKhauGiaTri / 100) : chietKhauGiaTri;
                                if (disc > subTotal) disc = subTotal;
                                return Math.round((subTotal - disc) * thueSuatVAT / 100).toLocaleString();
                              })()}đ
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between pt-1 border-t border-emerald-200/60 font-black text-[#166534] text-sm">
                          <span>Thành tiền dòng nhập:</span>
                          <span className="font-mono">
                            {(() => {
                              const subTotal = Number(importQty) * Number(importCost);
                              let disc = chietKhauLoai === 'PhanTram' ? (subTotal * chietKhauGiaTri / 100) : chietKhauGiaTri;
                              if (disc > subTotal) disc = subTotal;
                              const vat = (subTotal - disc) * thueSuatVAT / 100;
                              return Math.round(subTotal - disc + vat).toLocaleString();
                            })()}đ
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Expiration Batch Info (FEFO) */}
                    <div className="p-3 bg-[#EEF2F6]/60 rounded-lg space-y-2.5 border border-slate-200/60">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Mã Lô hàng sỉ (tùy chọn)</label>
                        <input
                          type="text"
                          placeholder="Bỏ trống hệ thống tự sinh"
                          value={importBatchCode}
                          onChange={e => setImportBatchCode(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs uppercase font-mono text-slate-800 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Ngày sản xuất *</label>
                          <input
                            type="date"
                            value={importMfgDate}
                            onChange={e => setImportMfgDate(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Hạn sử dụng (FEFO) *</label>
                          <input
                            type="date"
                            value={importExpDate}
                            onChange={e => setImportExpDate(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-red-600"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Thêm Vào Danh Sách Nhập
                    </button>
                  </form>

                  {/* Form 3: Cart / Item list */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="p-3 bg-slate-55 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 uppercase">Danh Sách Mặt Hàng Nhập ({cartItems.length})</span>
                      <span className="text-xs font-bold text-[#166534]">
                        Tổng trị giá: <strong className="font-black text-sm">{cartItems.reduce((acc, item) => acc + (item.thanhTien || (item.soLuong * item.donGia)), 0).toLocaleString()}đ</strong>
                      </span>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 font-medium">
                        ⚠️ Chưa có sản phẩm nào được chọn. Hãy thêm sản phẩm ở mẫu phía trên (BR-06-001).
                      </div>
                    ) : (
                      <div className="overflow-x-auto max-h-60">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                              <th className="p-2">Tên sản phẩm</th>
                              <th className="p-2 text-center">Lô / HSD</th>
                              <th className="p-2 text-right">SL</th>
                              <th className="p-2 text-right">Đơn giá</th>
                              <th className="p-2 text-right">Chiết khấu</th>
                              <th className="p-2 text-right">Thuế VAT</th>
                              <th className="p-2 text-right">Thành tiền</th>
                              <th className="p-2 text-center">Xóa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cartItems.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="p-2 font-bold text-slate-800">
                                  <div>{item.tenTrenBaoBi}</div>
                                  {item.lyDoThayDoiGia && (
                                    <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 mt-1 font-normal inline-block">
                                      📝 Lý do đổi giá: {item.lyDoThayDoiGia}
                                    </div>
                                  )}
                                </td>
                                <td className="p-2 text-center text-[10px] font-medium text-slate-500">
                                  <span className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono uppercase block">{item.maLo}</span>
                                  <span className="text-red-500 block mt-0.5 font-semibold">HSD: {item.hanSuDung}</span>
                                </td>
                                <td className="p-2 text-right font-bold text-slate-800">{item.soLuong}</td>
                                <td className="p-2 text-right text-slate-600 font-mono">{item.donGia.toLocaleString()}đ</td>
                                <td className="p-2 text-right text-rose-600 font-semibold font-mono">
                                  {item.chietKhauLoai === 'PhanTram' ? (
                                    <span>{item.chietKhauGiaTri}%<br/><span className="text-[10px] text-slate-400">(-{(item.chietKhau || 0).toLocaleString()}đ)</span></span>
                                  ) : item.chietKhauLoai === 'Tien' ? (
                                    <span>-{(item.chietKhau || 0).toLocaleString()}đ</span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                                <td className="p-2 text-right text-sky-700 font-semibold font-mono">
                                  {item.thueSuatVAT > 0 ? (
                                    <span>{item.thueSuatVAT}%<br/><span className="text-[10px] text-slate-400">(+{(item.tienThueVAT || 0).toLocaleString()}đ)</span></span>
                                  ) : (
                                    <span className="text-slate-400">0%</span>
                                  )}
                                </td>
                                <td className="p-2 text-right font-black text-[#166534] font-mono">{(item.thanhTien || (item.soLuong * item.donGia)).toLocaleString()}đ</td>
                                <td className="p-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItemFromCart(idx)}
                                    className="text-red-600 hover:text-red-800 font-bold text-xs"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Form 4: Submit section */}
                  {cartItems.length > 0 && (
                    <div className="space-y-3 bg-slate-50 p-3.5 border border-slate-200 rounded-xl">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền thanh toán trước cho NCC (đ)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0 nếu mua nợ đại lý / gối đầu"
                          value={importPaid}
                          onChange={e => setImportPaid(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:border-[#166534] rounded-lg text-xs font-bold text-right focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block leading-snug">
                          Còn lại <strong className="text-red-600 font-bold">{(cartItems.reduce((acc, item) => acc + (item.thanhTien || (item.soLuong * item.donGia)), 0) - Number(importPaid || 0)).toLocaleString()}đ</strong> ghi nhận vào công nợ NCC gối đầu.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú phiếu nhập</label>
                        <input
                          type="text"
                          placeholder="Chuyến xe Thái Bình giao sỉ..."
                          value={importNote}
                          onChange={e => setImportNote(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleWholesaleImport}
                        disabled={loading}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:opacity-90 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                      >
                        {editingVoucherId ? 'Cập Nhật Phiếu Nhập Hàng Sỉ' : 'Xác Nhận & Lưu Phiếu Nhập'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: HISTORICAL VOUCHERS LIST */}
              {importSubTab === 'list' && (
                <div className="space-y-4">
                  {/* Voucher Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <th className="p-3">Mã phiếu</th>
                            <th className="p-3">Đại lý</th>
                            <th className="p-3 text-right">Tổng tiền</th>
                            <th className="p-3 text-center">Trạng thái</th>
                            <th className="p-3 text-center">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importVouchers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                                Chưa có phiếu nhập nào trong hệ thống.
                              </td>
                            </tr>
                          ) : (
                            importVouchers.map((v) => {
                              const badgeStyle = 
                                v.trangThai === 'HoanThanh' ? 'bg-emerald-100 text-emerald-800' :
                                v.trangThai === 'ChoXacNhan' ? 'bg-amber-100 text-amber-800' :
                                v.trangThai === 'Nhap' ? 'bg-slate-100 text-slate-700' :
                                'bg-red-100 text-red-850';
                              const badgeLabel = 
                                v.trangThai === 'HoanThanh' ? 'Hoàn thành' :
                                v.trangThai === 'ChoXacNhan' ? 'Chờ duyệt' :
                                v.trangThai === 'Nhap' ? 'Nháp' :
                                'Đã hủy';
                              return (
                                <tr key={v.id} className={`border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer ${selectedVoucher?.id === v.id ? 'bg-blue-50/40' : ''}`} onClick={() => setSelectedVoucher(v)}>
                                  <td className="p-3 font-mono font-bold text-blue-700">
                                    <div className="flex items-center gap-1.5">
                                      <span>{v.maPhieuNhap}</span>
                                      {v.nghiNgoChinhSua && (
                                        <span className="bg-red-100 text-red-750 text-[8px] font-black px-1.5 py-0.5 rounded" title="Cảnh báo kiểm toán: Băm chứng từ không trùng khớp! (BR-06-013)">
                                          ⚠️ SAI HASH
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3 font-medium text-slate-800">{v.supplierName}</td>
                                  <td className="p-3 text-right font-black">{(v.tongTien || 0).toLocaleString()}đ</td>
                                  <td className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle}`}>
                                        {badgeLabel}
                                      </span>
                                      {v.trangThai === 'HoanThanh' && ((v.tongTien || 0) - (v.daThanhToan || 0) <= 0) && (
                                        <span className="text-emerald-700 text-xs" title="Đã thanh toán đủ, khóa dữ liệu thanh toán (BR-06-035)">🔒</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      type="button"
                                      className="text-blue-600 hover:underline font-bold text-[11px]"
                                    >
                                      Chi tiết
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Selected Voucher Details View */}
                  {selectedVoucher && (
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-4">
                      <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                        <div>
                          <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                            Chi Tiết Phiếu Nhập: <span className="font-mono text-blue-750 font-black">{selectedVoucher.maPhieuNhap}</span>
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full ml-1.5">v{selectedVoucher.version || 1}</span>
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">
                            Lập ngày: {selectedVoucher.ngayNhap} | Kho: {selectedVoucher.khoNhap}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedVoucher(null)}
                          className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          ✕ Đóng
                        </button>
                      </div>

                      {/* Warning if hash verification failed (BR-06-013) */}
                      {selectedVoucher.nghiNgoChinhSua && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs font-semibold flex items-start gap-2 shadow-xs">
                          <span className="text-sm">⚠️</span>
                          <div className="space-y-0.5">
                            <p className="font-bold text-red-900">CẢNH BÁO TOÀN VẸN DỮ LIỆU (BR-06-013)</p>
                            <p className="text-[11px] text-red-700 leading-relaxed">Phát hiện mã băm (SHA-256) của chứng từ không khớp với dữ liệu gốc! Chứng từ này đã bị chỉnh sửa bất hợp pháp ngoài quy trình phần mềm hoặc cơ sở dữ liệu đã bị can thiệp trái phép. Sự kiện này đã được ghi lại trong nhật ký kiểm toán hệ thống (Audit Log).</p>
                          </div>
                        </div>
                      )}

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                        <div>
                          <span className="text-slate-400 font-semibold block">Đại lý cung cấp:</span>
                          <span className="text-slate-800 font-bold">{selectedVoucher.supplierName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block">Ghi chú:</span>
                          <span className="text-slate-800 font-medium">{selectedVoucher.ghiChu || 'Không có'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block">Thanh toán ngay:</span>
                          <span className="text-emerald-700 font-black">{(selectedVoucher.daThanhToan || 0).toLocaleString()}đ</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block">Dư nợ sỉ gối đầu:</span>
                          <span className="text-red-600 font-black">{((selectedVoucher.tongTien || 0) - (selectedVoucher.daThanhToan || 0)).toLocaleString()}đ</span>
                        </div>
                      </div>

                      {/* Cancelled Details Auditing (BR-06-005) */}
                      {selectedVoucher.trangThai === 'DaHuy' && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-xs text-red-800 space-y-1">
                          <div className="font-bold flex items-center gap-1">⚠️ PHIẾU ĐÃ HỦY (BR-06-005):</div>
                          <div><strong>Lý do hủy:</strong> {selectedVoucher.HuyLyDo}</div>
                          <div><strong>Thời gian hủy:</strong> {selectedVoucher.HuyThoiGian}</div>
                          <div><strong>Người hủy:</strong> {selectedVoucher.HuyNguoiThucHien}</div>
                        </div>
                      )}

                      {/* Detail list items */}
                      <div className="bg-white border border-slate-150 rounded-lg overflow-hidden shadow-2xs">
                        <div className="p-2 bg-slate-50 text-[10px] text-slate-500 font-bold border-b border-slate-150 uppercase tracking-wider">Danh Sách Mặt Hàng Chi Tiết</div>
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100 font-bold">
                              <th className="p-2">Tên sản phẩm</th>
                              <th className="p-2 text-center">Lô / HSD</th>
                              <th className="p-2 text-right">SL</th>
                              <th className="p-2 text-right">Giá</th>
                              <th className="p-2 text-right">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedVoucher.chiTiet && selectedVoucher.chiTiet.map((det: any, di: number) => (
                              <tr key={di} className="border-b border-slate-100">
                                <td className="p-2">
                                  <div className="font-bold text-slate-800">{det.tenTrenBaoBi}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium flex gap-1.5 flex-wrap">
                                    <span className="bg-slate-50 text-slate-600 px-1 py-0.2 rounded">Snapshot: {det.snapshot?.giaNhap ? `${det.snapshot.giaNhap.toLocaleString()}đ` : `${(det.donGia || 0).toLocaleString()}đ`}</span>
                                    <span>•</span>
                                    <span>ĐVT: {det.snapshot?.donViTinh || 'Đơn vị'}</span>
                                  </div>
                                  {det.lyDoThayDoiGia && (
                                    <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-150 rounded px-1.5 py-0.5 mt-1 font-normal inline-block">
                                      📝 Lý do đổi giá: {det.lyDoThayDoiGia}
                                    </div>
                                  )}
                                </td>
                                <td className="p-2 text-center text-[10px]">
                                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">{det.maLo || 'N/A'}</span>
                                  {det.hanSuDung && <span className="text-red-500 block mt-0.5">HSD: {det.hanSuDung}</span>}
                                </td>
                                <td className="p-2 text-right font-bold text-slate-800">{det.soLuong}</td>
                                <td className="p-2 text-right text-slate-600">{(det.donGia || 0).toLocaleString()}đ</td>
                                <td className="p-2 text-right font-black text-[#166534]">{((det.soLuong || 0) * (det.donGia || 0)).toLocaleString()}đ</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Status history tracking (BR-06-010) */}
                      {selectedVoucher.statusHistory && selectedVoucher.statusHistory.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5 shadow-2xs">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                            <span>📜 Nhật ký thay đổi trạng thái (BR-06-010)</span>
                            <span className="text-[9px] bg-blue-50 text-blue-750 px-1.5 py-0.5 rounded-full font-bold">Phiên bản v{selectedVoucher.version || 1}</span>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {selectedVoucher.statusHistory.map((sh: any, idx: number) => {
                              const getBadgeColor = (status: string) => {
                                if (status === "HoanThanh") return "bg-emerald-100 text-emerald-800";
                                if (status === "ChoXacNhan") return "bg-amber-100 text-amber-800";
                                if (status === "Nhap") return "bg-slate-100 text-slate-700";
                                if (status === "DaHuy") return "bg-red-100 text-red-800";
                                return "bg-slate-100 text-slate-600";
                              };
                              return (
                                <div key={idx} className="text-[11px] text-slate-600 border-b border-dashed border-slate-100 last:border-none pb-2 last:pb-0 space-y-1">
                                  <div className="flex justify-between items-start flex-wrap gap-1">
                                    <div className="flex items-center gap-1">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${getBadgeColor(sh.trangThaiCu)}`}>
                                        {sh.trangThaiCu === "None" ? "Khởi tạo" : sh.trangThaiCu}
                                      </span>
                                      <span className="text-slate-400">➔</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${getBadgeColor(sh.trangThaiMoi)}`}>
                                        {sh.trangThaiMoi}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">{sh.nguoiThucHien}</span>
                                    </div>
                                  </div>
                                  {sh.lyDo && (
                                    <p className="text-[10px] text-slate-500 italic font-medium">Lý do: {sh.lyDo}</p>
                                  )}
                                  <div className="text-[9px] text-slate-400 flex justify-between items-center flex-wrap gap-1">
                                    <span>🕒 {sh.thoiGian}</span>
                                    <span className="font-mono text-right text-[8px] max-w-xs truncate" title={sh.thietBi}>IP: {sh.diaChiIP} | Thiết bị: {sh.thietBi}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Payment History and Payments (BR-06-033 / BR-06-035) */}
                      {selectedVoucher.trangThai === 'HoanThanh' && (
                        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 shadow-2xs">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                            <span>💳 Lịch sử thanh toán chứng từ (BR-06-033)</span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-850 px-1.5 py-0.5 rounded font-bold">
                              Đã trả: {selectedVoucher.daThanhToan?.toLocaleString() || 0}đ
                            </span>
                          </div>

                          {/* Historical payments list */}
                          {(!selectedVoucher.lichSuThanhToan || selectedVoucher.lichSuThanhToan.length === 0) ? (
                            <p className="text-[11px] text-slate-400 italic">Lần thanh toán đầu tiên: {selectedVoucher.daThanhToan?.toLocaleString() || 0}đ ghi nhận lúc hoàn thành phiếu.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                              <div className="text-[11px] text-slate-600 flex justify-between items-center border-b border-dashed border-slate-100 pb-1">
                                <span>Thanh toán ban đầu</span>
                                <span className="font-bold text-slate-700">{(selectedVoucher.daThanhToan - selectedVoucher.lichSuThanhToan.reduce((a: number, b: any) => a + Number(b.soTien || 0), 0)).toLocaleString()}đ</span>
                              </div>
                              {selectedVoucher.lichSuThanhToan.map((pm: any, pmIdx: number) => (
                                <div key={pmIdx} className="text-[11px] text-slate-600 flex justify-between items-center border-b border-dashed border-slate-100 pb-1 last:border-none">
                                  <div>
                                    <span className="font-bold text-slate-800">{pm.maPhieuChi}</span>
                                    <span className="text-slate-400 ml-1.5 font-mono text-[9px]">({pm.phuongThucThanhToan})</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-black text-emerald-750">+{pm.soTien?.toLocaleString()}đ</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Pay More Form or Lock Notice */}
                          {((selectedVoucher.tongTien || 0) - (selectedVoucher.daThanhToan || 0) > 0) ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
                              <p className="text-[10px] font-bold text-slate-700">Thanh toán thêm tiền sỉ cho phiếu này:</p>
                              <div className="flex gap-1.5 items-end">
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    placeholder="vd: 1000000"
                                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-emerald-800"
                                    max={(selectedVoucher.tongTien || 0) - (selectedVoucher.daThanhToan || 0)}
                                    min={1}
                                    value={payMoreAmount}
                                    onChange={(e) => setPayMoreAmount(e.target.value)}
                                  />
                                </div>
                                <div className="w-24">
                                  <select
                                    className="w-full px-1.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium"
                                    value={payMoreMethod}
                                    onChange={(e) => setPayMoreMethod(e.target.value)}
                                  >
                                    <option value="Tiền mặt">Tiền mặt</option>
                                    <option value="Chuyển khoản">Chuyển khoản</option>
                                  </select>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handlePayMoreVoucher(selectedVoucher.id)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs transition cursor-pointer"
                                >
                                  Trả
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-emerald-50 border border-emerald-150 rounded-lg p-2 flex items-center justify-between">
                              <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">🔒 ĐÃ KHÓA CHỨNG TỪ (BR-06-035)</span>
                              <span className="text-[9px] text-emerald-600 font-medium">Đã thanh toán đủ</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action workflow triggers (BR-06-004 / BR-06-005) */}
                      {(selectedVoucher.trangThai === 'Nhap' || selectedVoucher.trangThai === 'ChoXacNhan') && (
                        <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-200">
                          <div className="text-xs font-bold text-slate-700">⚙️ THAO TÁC QUẢN LÝ QUY TRÌNH (BR-06-003):</div>
                          
                          <div className="flex gap-2 flex-wrap">
                            {/* Edit Action - BR-06-004 */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingVoucherId(selectedVoucher.id);
                                setImportSupId(String(selectedVoucher.nhaCungCapId));
                                setKhoNhap(selectedVoucher.khoNhap || 'Kho chính Hải Đăng');
                                setTrangThaiImport(selectedVoucher.trangThai);
                                setImportPaid(String(selectedVoucher.daThanhToan || 0));
                                setImportNote(selectedVoucher.ghiChu || '');
                                
                                const formattedItems = selectedVoucher.chiTiet.map((d: any) => ({
                                  hangHoaId: d.hangHoaId,
                                  tenTrenBaoBi: d.tenTrenBaoBi,
                                  soLuong: d.soLuong,
                                  donGia: d.donGia,
                                  maLo: d.maLo || '',
                                  ngaySanXuat: d.ngaySanXuat || '',
                                  hanSuDung: d.hanSuDung || ''
                                }));
                                setCartItems(formattedItems);
                                setImportSubTab('create');
                                setSelectedVoucher(null);
                              }}
                              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              Sửa Phiếu (Draft)
                            </button>

                            {/* Direct Confirm to Complete */}
                            <button
                              type="button"
                              onClick={() => handleDirectConfirmVoucher(selectedVoucher.id)}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              Duyệt Hoàn Thành
                            </button>

                            {/* Show Cancel Inline trigger */}
                            {cancelVoucherId !== selectedVoucher.id ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelVoucherId(selectedVoucher.id);
                                  setCancelReason('');
                                }}
                                className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                Hủy Phiếu
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCancelVoucherId(null)}
                                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                Thôi Hủy
                              </button>
                            )}
                          </div>

                          {/* Cancellation Reason input form - BR-06-005 */}
                          {cancelVoucherId === selectedVoucher.id && (
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                              <label className="block text-[11px] font-bold text-red-700">Lý do hủy bỏ phiếu nhập *</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Nhập lý do hủy phiếu bắt buộc..."
                                  value={cancelReason}
                                  onChange={e => setCancelReason(e.target.value)}
                                  className="flex-1 px-2.5 py-1.5 bg-red-50/30 border border-red-200 focus:outline-none rounded-lg text-xs text-red-900"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleCancelVoucher(selectedVoucher.id)}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                                >
                                  Xác Nhận Hủy (Audit)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {importSubTab === 'debt-history' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Lịch sử Biến động Công nợ Nhà cung cấp (BR-06-038)</span>
                      <button 
                        type="button" 
                        onClick={fetchSupplierDebtHistory}
                        className="p-1 px-2.5 bg-white border border-slate-300 rounded hover:bg-slate-50 text-[10px] font-black flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Làm mới
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <th className="p-3">Thời gian</th>
                            <th className="p-3">Nhà cung cấp</th>
                            <th className="p-3">Nguồn gốc biến động</th>
                            <th className="p-3 text-right">Dư nợ trước</th>
                            <th className="p-3 text-right">Biến động</th>
                            <th className="p-3 text-right">Dư nợ sau</th>
                            <th className="p-3">Người thực hiện</th>
                          </tr>
                        </thead>
                        <tbody>
                          {supplierDebtHistory.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                                Chưa có biến động công nợ nào được ghi nhận.
                              </td>
                            </tr>
                          ) : (
                            [...supplierDebtHistory].reverse().map((h) => {
                              const isIncrease = h.loaiBienDong === "TangNo";
                              return (
                                <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                  <td className="p-3 whitespace-nowrap text-slate-600">{h.thoiGian}</td>
                                  <td className="p-3 font-semibold text-slate-800">{h.tenNhaCungCap}</td>
                                  <td className="p-3 font-medium text-slate-700">
                                    <div className="space-y-1">
                                      {h.maPhieuNhap && (
                                        <div className="flex items-center gap-1 text-[11px]">
                                          <span className="text-slate-500">Phiếu nhập:</span>
                                          <span className="font-mono text-blue-750 font-bold bg-blue-50 px-1 rounded">
                                            {h.maPhieuNhap}
                                          </span>
                                        </div>
                                      )}
                                      {h.maPhieuChi && (
                                        <div className="flex items-center gap-1 text-[11px]">
                                          <span className="text-slate-500">Phiếu chi:</span>
                                          <span className="font-mono text-emerald-750 font-bold bg-emerald-50 px-1 rounded">
                                            {h.maPhieuChi}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3 text-right font-medium text-slate-600">
                                    {Number(h.duNoTruoc || 0).toLocaleString()}đ
                                  </td>
                                  <td className="p-3 text-right font-bold whitespace-nowrap">
                                    <span className={isIncrease ? "text-red-600" : "text-emerald-600"}>
                                      {isIncrease ? "+" : ""}{Number(h.giaTriBienDong || 0).toLocaleString()}đ
                                    </span>
                                  </td>
                                  <td className="p-3 text-right font-bold text-slate-800">
                                    {Number(h.duNoSau || 0).toLocaleString()}đ
                                  </td>
                                  <td className="p-3 text-slate-600 whitespace-nowrap">
                                    <div>{h.nguoiThucHien}</div>
                                    <div className="text-[9px] text-slate-400 font-mono">IP: {h.ip}</div>
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
              )}
            </div>
          )}

          {leftTab === 'stock-audit' && (
            <InventoryAuditDashboard />
          )}
        </div>

        {/* Right Column: Interactive Goods Table with Search (7 Cols) */}
        {leftTab !== 'stock-audit' && (
          <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            
            {/* Filter controls */}
            <div className="space-y-3 pb-3 border-b border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên thuốc, hoạt chất..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  />
                </div>

                <SmartComboBox
                  options={categories.nhomHangs}
                  value={selectedGroup ? Number(selectedGroup) : ''}
                  onChange={val => setSelectedGroup(val ? String(val) : '')}
                  getLabel={(n: NhomHang) => n.tenNhom}
                  getValue={(n: NhomHang) => n.id}
                  placeholder="Tất cả nhóm vật tư"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-650 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDeleted}
                    onChange={async (e) => {
                      const checked = e.target.checked;
                      setShowDeleted(checked);
                      await loadData(checked);
                    }}
                    className="rounded text-[#166534] focus:ring-[#166534] h-3.5 w-3.5 cursor-pointer"
                  />
                  <span>Hiển thị hàng hóa đã ngừng kinh doanh/lưu trữ (BR-04-017)</span>
                </label>
              </div>
            </div>

            {/* List Table */}
            {(() => {
              const productColumns = [
                {
                  header: "Mã thuốc",
                  sortKey: "maHangHoa",
                  accessor: (p: Product) => (
                    <span className="font-mono font-bold text-slate-450">{p.maHangHoa}</span>
                  )
                },
                {
                  header: "Tên sản phẩm",
                  sortKey: "tenTrenBaoBi",
                  accessor: (p: Product) => {
                    const productBatches = (batches || []).filter((b: any) => b.hangHoaId === p.id);
                    return (
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span className={p.DaXoa ? 'line-through text-slate-400' : ''}>{p.tenTrenBaoBi}</span>
                          <span className="text-[9px] bg-slate-200 text-slate-750 px-1.5 py-0.5 rounded font-black uppercase">
                            Lô ({productBatches.length})
                          </span>
                          {p.DaXoa && (
                            <span className="text-[8px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-black uppercase">
                              Ngừng kinh doanh
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">{p.tenThuongGoi}</div>
                        <div className="flex gap-1.5 items-center mt-1 flex-wrap">
                          <div className="text-[9px] bg-emerald-50 text-[#166534] rounded px-1.5 py-0.5 font-bold">
                            {p.nhomHang}
                          </div>
                          {p.nhaCungCapUuTienTen && (
                            <div className="text-[9px] bg-blue-50 text-blue-700 rounded px-1.5 py-0.5 font-bold border border-blue-150">
                              ⭐ NCC ưu tiên: {p.nhaCungCapUuTienTen}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                },
                {
                  header: "Hoạt chất trị bệnh",
                  sortKey: "hoatChat",
                  accessor: (p: Product) => (
                    <div>
                      <div className="font-semibold text-slate-800">{p.hoatChat || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500">{p.quyCach} - {p.lieuLuong}</div>
                    </div>
                  )
                },
                {
                  header: "Giá bán lẻ",
                  sortKey: "giaBanHienTai",
                  className: "text-right",
                  accessor: (p: Product) => (
                    <span className="font-bold text-slate-900">{(p.giaBanHienTai || 0).toLocaleString()}đ</span>
                  )
                },
                {
                  header: "Cách ly",
                  sortKey: "thoiGianCachLy",
                  className: "text-center",
                  accessor: (p: Product) => (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.thoiGianCachLy === 0 ? 'bg-slate-100 text-slate-600' : p.thoiGianCachLy <= 7 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                      {p.thoiGianCachLy} ngày
                    </span>
                  )
                },
                {
                  header: "Tồn kho",
                  sortKey: "currentStock",
                  className: "text-right",
                  accessor: (p: Product) => (
                    <span className={`px-2 py-1 rounded text-xs ${p.currentStock && p.currentStock <= 10 ? 'bg-red-50 text-red-600 font-black' : 'bg-emerald-50 text-[#166534] font-bold'}`}>
                      {p.currentStock} {p.donViTinh || 'vỉ'}
                    </span>
                  )
                },
                {
                  header: "Thao tác",
                  className: "text-center",
                  accessor: (p: Product) => (
                    <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {p.DaXoa ? (
                        <button
                          type="button"
                          onClick={() => handleRestoreProduct(p)}
                          className="p-1 bg-slate-100 hover:bg-emerald-50 text-emerald-700 rounded transition"
                          title="Khôi phục hoạt động kinh doanh"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEditProduct(p)}
                            className="p-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded transition"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1 bg-slate-100 hover:bg-red-50 text-red-700 rounded transition"
                            title="Ngừng kinh doanh (Xóa mềm)"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )
                }
              ];

              return (
                <div className="space-y-4">
                  <SmartTable
                    data={filteredProducts}
                    columns={productColumns}
                    onRowClick={(p) => setSelectedProdId(selectedProdId === p.id ? null : p.id)}
                    selectedRowId={selectedProdId}
                    getRowId={p => p.id}
                    emptyMessage="Không tìm thấy thuốc/phân bón phù hợp"
                    exportTitle="Báo cáo danh mục hàng hóa (Phân bón & Thuốc BVTV)"
                  />

                  {selectedProdId && (() => {
                    const p = products.find(prod => prod.id === selectedProdId);
                    if (!p) return null;
                    const productBatches = (batches || [])
                      .filter((b: any) => b.hangHoaId === p.id)
                      .sort((a: any, b: any) => new Date(a.hanSuDung).getTime() - new Date(b.hanSuDung).getTime());
                    return (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="text-xs font-bold text-[#166534] uppercase tracking-wider">
                            📦 Danh sách Lô hàng hiện hữu cho [{p.tenTrenBaoBi}] (Duyệt xuất kho FEFO):
                          </div>
                          <button 
                            onClick={() => setSelectedProdId(null)} 
                            className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                          >
                            Đóng chi tiết lô
                          </button>
                        </div>
                        {productBatches.length === 0 ? (
                          <div className="text-[10px] text-slate-400 italic">Chưa khai báo lô hàng sỉ lẻ nào cho sản phẩm này. Toàn bộ tồn kho thuộc lô mặc định dự phòng.</div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {productBatches.map((b: any, bIdx: number) => {
                              const isExpired = new Date(b.hanSuDung).getTime() < Date.now();
                              const isNearExpiry = !isExpired && (new Date(b.hanSuDung).getTime() - Date.now() < 60 * 24 * 60 * 60 * 1000);
                              
                              return (
                                <div key={b.id || bIdx} className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs flex justify-between items-center text-xs">
                                  <div>
                                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                      🏷️ Lô sỉ: {b.maLo}
                                      <span className={`px-1 rounded text-[8px] font-black ${isExpired ? 'bg-red-100 text-red-800' : isNearExpiry ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                        {isExpired ? 'HẾT HẠN' : isNearExpiry ? 'CẬN HẠN' : 'TỐT'}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-450 mt-0.5">HSD: <span className="font-mono font-bold text-slate-700">{b.hanSuDung}</span></div>
                                    <div className="text-[10px] text-slate-450">NSX: <span className="font-mono">{b.ngaySanXuat}</span></div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[#166534] font-black">{b.soLuongTon} {p.donViTinh || 'vỉ'}</div>
                                    <div className="text-[9px] text-slate-400">Giá gốc sỉ: {b.giaNhap ? b.giaNhap.toLocaleString() + 'đ' : 'N/A'}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
