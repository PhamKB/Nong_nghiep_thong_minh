import React, { useState, useEffect } from 'react';
import { Customer, Hamlet, CayTrong } from '../types';
import { SmartComboBox, SmartTable } from './SmartUI';
import { 
  Users, 
  MapPin, 
  Search, 
  Plus, 
  Phone, 
  TrendingUp, 
  CheckCircle,
  RefreshCw,
  Crop,
  Layers,
  Trash2,
  Edit2,
  X,
  Calendar,
  Activity,
  Award,
  Sparkles,
  MessageSquare,
  FileText,
  DollarSign,
  Printer
} from 'lucide-react';

interface CustomersManagementProps {
  onSuccess: () => void;
}

interface MuaVu {
  id: number;
  khachHangId: number;
  tenVu: string;
  cayTrong: string;
  dienTich: number;
  ngayBatDau: string;
  ngayThuHoach?: string;
  ghiChu?: string;
}

interface NhatKySuDuung {
  id: number;
  muaVuId: number;
  ngayPhatSinh: string;
  loaiHanhDong: 'PhunThuoc' | 'BonPhan';
  tenVatTu: string;
  lieuLuong: string;
  hieuQua: string;
  ghiChu?: string;
}

interface NhatKyTuVan {
  id: number;
  khachHangId: number;
  ngayTuVan: string;
  trieuChung: string;
  chanDoan: string;
  giaiPhapPhacDo: string;
  hieuQuaSuDung: string;
  aiHocLarned: boolean;
}

export default function CustomersManagement({ onSuccess }: CustomersManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [hamlets, setHamlets] = useState<Hamlet[]>([]);
  const [crops, setCrops] = useState<CayTrong[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHamletFilter, setSelectedHamletFilter] = useState<number | null>(null);
  const [selectedDebtFilter, setSelectedDebtFilter] = useState<'All' | 'Debt' | 'NoDebt'>('All');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Hamlet Edit Form
  const [showHamletManager, setShowHamletManager] = useState(false);
  const [newXomName, setNewXomName] = useState('');
  const [editingHamletId, setEditingHamletId] = useState<number | null>(null);
  const [editingHamletName, setEditingHamletName] = useState('');

  // Selected Customer Detail Modal
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'seasons' | 'consult' | 'purchases'>('info');

  // Modal: Quick Collect Debt Form
  const [modalCollectAmount, setModalCollectAmount] = useState('');
  const [modalCollectNote, setModalCollectNote] = useState('');

  // Modal: Crop Seasons State
  const [seasons, setSeasons] = useState<MuaVu[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<MuaVu | null>(null);
  const [seasonLogs, setSeasonLogs] = useState<NhatKySuDuung[]>([]);
  
  // Modal: Add Season Form
  const [newSeasonName, setNewSeasonName] = useState('');
  const [newSeasonCrop, setNewSeasonCrop] = useState('');
  const [newSeasonArea, setNewSeasonArea] = useState('');
  const [newSeasonNote, setNewSeasonNote] = useState('');

  // Modal: Add Season Log Form
  const [newLogType, setNewLogType] = useState<'PhunThuoc' | 'BonPhan'>('PhunThuoc');
  const [newLogMaterial, setNewLogMaterial] = useState('');
  const [newLogDosage, setNewLogDosage] = useState('');
  const [newLogEffect, setNewLogEffect] = useState('Hiệu quả cao - Sạch sâu bệnh');
  const [newLogNote, setNewLogNote] = useState('');

  // Modal: Consultations State
  const [consultations, setConsultations] = useState<NhatKyTuVan[]>([]);
  const [newTrieuChung, setNewTrieuChung] = useState('');
  const [newChanDoan, setNewChanDoan] = useState('');
  const [newGiaiPhap, setNewGiaiPhap] = useState('');
  const [newHieuQuaTuVan, setNewHieuQuaTuVan] = useState('Đạt hiệu quả cao, khống chế hoàn toàn vết bệnh');

  // Modal: Purchases State
  const [purchaseInvoices, setPurchaseInvoices] = useState<any[]>([]);

  // Main Form fields
  const [hoTen, setHoTen] = useState('');
  const [dienThoai, setDienThoai] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [xomId, setXomId] = useState('');
  const [isCustomXom, setIsCustomXom] = useState(false);
  const [customXomName, setCustomXomName] = useState('');
  const [loaiCayTrongId, setLoaiCayTrongId] = useState('');
  const [dienTichCanhTac, setDienTichCanhTac] = useState('');
  const [ngheNghiep, setNgheNghiep] = useState('Làm ruộng');
  const [ghiChu, setGhiChu] = useState('');

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const handleQuickCreateXom = async (query: string) => {
    const response = await fetch('/api/categories/xom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenXom: query })
    });
    if (!response.ok) throw new Error("Không thể thêm xóm.");
    const data = await response.json();
    const catRes = await fetch('/api/categories');
    const cats = await catRes.json();
    setHamlets(cats.xoms);
    onSuccess();
    return data.id;
  };

  const handleQuickCreateCrop = async (query: string) => {
    const response = await fetch('/api/categories/caytrong', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenCayTrong: query })
    });
    if (!response.ok) throw new Error("Không thể thêm cây trồng mới.");
    const data = await response.json();
    const catRes = await fetch('/api/categories');
    const cats = await catRes.json();
    setCrops(cats.cayTrongs);
    onSuccess();
    return data.id;
  };

  const loadData = async (includeDeleted = showDeleted) => {
    try {
      setLoading(true);
      const [custRes, catRes] = await Promise.all([
        fetch(`/api/customers?showDeleted=${includeDeleted}`),
        fetch('/api/categories')
      ]);
      const custs = await custRes.json();
      const cats = await catRes.json();

      setCustomers(custs);
      setHamlets(cats.xoms);
      setCrops(cats.cayTrongs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartEditCustomer = (cust: Customer) => {
    setEditingCustomer(cust);
    setHoTen(cust.hoTen);
    setDienThoai(cust.dienThoai || '');
    setDiaChi(cust.diaChi || '');
    setXomId(cust.xomId.toString());
    setIsCustomXom(false);
    setCustomXomName('');
    setLoaiCayTrongId(cust.loaiCayTrongId ? cust.loaiCayTrongId.toString() : '');
    setDienTichCanhTac(cust.dienTichCanhTac ? cust.dienTichCanhTac.toString() : '');
    setNgheNghiep(cust.ngheNghiep || 'Làm ruộng');
    setGhiChu(cust.ghiChu || '');
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setHoTen('');
    setDienThoai('');
    setDiaChi('');
    setXomId('');
    setIsCustomXom(false);
    setCustomXomName('');
    setLoaiCayTrongId('');
    setDienTichCanhTac('');
    setNgheNghiep('Làm ruộng');
    setGhiChu('');
  };

  const handleDeleteCustomer = async (cust: Customer) => {
    if (!window.confirm(`Bà con có chắc chắn muốn xóa mềm (ngừng hoạt động) nông hộ: ${cust.hoTen} không?`)) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/customers/${cust.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể xóa mềm nông hộ");
      }
      alert(`Đã xóa mềm nông hộ ${cust.hoTen} thành công!`);
      await loadData();
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreCustomer = async (cust: Customer) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers/${cust.id}/restore`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể khôi phục nông hộ");
      }
      alert(`Đã khôi phục nông hộ ${cust.hoTen} thành công!`);
      await loadData();
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Customer fast-create/edit form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen.trim()) {
      alert("Họ tên hộ dân bắt buộc phải nhập.");
      return;
    }
    if (hoTen.trim().length > 150) {
      alert("Tên khách hàng tối đa 150 ký tự.");
      return;
    }

    if (dienThoai.trim()) {
      const phoneRegex = /^(0|\+84|84)?([3|5|7|8|9])([0-9]{8})$/;
      if (!phoneRegex.test(dienThoai.trim())) {
        alert("Số điện thoại không đúng định dạng. Cần nhập dạng 10 chữ số (ví dụ: 0399888777).");
        return;
      }
    }

    try {
      setLoading(true);

      const isEditing = !!editingCustomer;
      
      // Perform duplicate check (BR-03-004)
      const dupRes = await fetch('/api/customers/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hoTen: hoTen.trim(),
          dienThoai: dienThoai.trim(),
          xomId: isCustomXom ? '' : xomId,
          excludeId: isEditing ? editingCustomer.id : undefined
        })
      });
      
      if (dupRes.ok) {
        const dupData = await dupRes.json();
        if (dupData.duplicate) {
          const dupNames = dupData.matches.map((m: any) => `${m.hoTen} (${m.tenXom}) - ĐT: ${m.dienThoai || 'N/A'}`).join("\n");
          const confirmSave = window.confirm(
            `CẢNH BÁO TRÙNG THÔNG TIN (BR-03-004):\n` +
            `Hệ thống phát hiện các hộ nông dân sau có thể trùng với thông tin đang nhập:\n\n` +
            `${dupNames}\n\n` +
            `Bà con có chắc chắn đây là hộ nông dân KHÁC và vẫn muốn tiếp tục lưu không?`
          );
          if (!confirmSave) {
            setLoading(false);
            return;
          }
        }
      }

      const payload = {
        hoTen: hoTen.trim(),
        dienThoai: dienThoai.trim(),
        diaChi: diaChi.trim(),
        xomId: isCustomXom ? '' : xomId,
        isCustomXom,
        customXomName: isCustomXom ? customXomName.trim() : '',
        loaiCayTrongId: Number(loaiCayTrongId || 1),
        dienTichCanhTac: Number(dienTichCanhTac || 0),
        ngheNghiep: ngheNghiep.trim(),
        ghiChu: ghiChu.trim()
      };

      const url = isEditing ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Thất bại khi lưu thông tin khách hàng.");
      }

      setHoTen('');
      setDienThoai('');
      setDiaChi('');
      setXomId('');
      setCustomXomName('');
      setIsCustomXom(false);
      setLoaiCayTrongId('');
      setDienTichCanhTac('');
      setNgheNghiep('Làm ruộng');
      setGhiChu('');
      setEditingCustomer(null);

      await loadData();
      onSuccess();
      alert(isEditing ? "Đã cập nhật thông tin hộ nông dân thành công!" : "Đã thêm thông tin hộ nông dân thành công!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create Hamlet
  const handleAddHamlet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newXomName.trim()) return;
    try {
      setLoading(true);
      const res = await fetch('/api/categories/xom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenXom: newXomName.trim(), moTa: `Khu vực ${newXomName}` })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Không thể tạo xóm");
      }
      setNewXomName('');
      await loadData();
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rename Hamlet
  const handleRenameHamlet = async (id: number) => {
    if (!editingHamletName.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/categories/xom/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenXom: editingHamletName.trim() })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Không thể đổi tên xóm");
      }
      setEditingHamletId(null);
      setEditingHamletName('');
      await loadData();
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete (Deactivate) Hamlet
  const handleDeleteHamlet = async (id: number) => {
    if (!window.confirm("Bà con có chắc chắn muốn NGỪNG HOẠT ĐỘNG xóm địa bàn này không? Hệ thống sẽ bảo lưu toàn bộ dữ liệu lịch sử của xóm này.")) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/categories/xom/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể ngừng hoạt động xóm");
      }
      alert("Đã ngừng hoạt động xóm địa bàn thành công!");
      await loadData();
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Restore Hamlet
  const handleRestoreHamlet = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/categories/xom/${id}/restore`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể khôi phục hoạt động xóm");
      }
      alert("Đã khôi phục hoạt động xóm địa bàn thành công!");
      await loadData();
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open Customer Detail Modal & Fetch associated sub-data
  const handleOpenCustomerDetail = async (cust: Customer) => {
    setSelectedCust(cust);
    setActiveModalTab('info');
    setModalCollectAmount('');
    setModalCollectNote('');
    setSelectedSeason(null);
    setSeasonLogs([]);
    
    // Reset forms
    setNewSeasonName('');
    setNewSeasonCrop(cust.cayTrongChuLuc || '');
    setNewSeasonArea(cust.dienTichCanhTac.toString() || '');
    setNewSeasonNote('');
    
    setNewTrieuChung('');
    setNewChanDoan('');
    setNewGiaiPhap('');

    try {
      setLoading(true);
      // Parallel fetches for seasons, consultations, and previous bills
      const [seasonsRes, consultRes, fundsRes] = await Promise.all([
        fetch(`/api/customers/${cust.id}/seasons`),
        fetch(`/api/customers/${cust.id}/consultations`),
        fetch('/api/funds')
      ]);
      
      const seasonsData = await seasonsRes.json();
      const consultData = await consultRes.json();
      const fundsData = await fundsRes.json();

      setSeasons(seasonsData);
      setConsultations(consultData);
      
      // Filter transactions from SoQuy associated with this customer's invoices or payments
      const custReceipts = fundsData.phieuThus.filter((p: any) => p.khachHangId === cust.id);
      setPurchaseInvoices(custReceipts);
    } catch (err) {
      console.error("Lỗi tải chi tiết hộ dân:", err);
    } finally {
      setLoading(false);
    }
  };

  // Quick Collect Debt in Modal
  const handleModalCollectDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust || !modalCollectAmount) return;
    const amt = Number(modalCollectAmount);
    
    if (amt > selectedCust.debt) {
      alert("Số tiền thu nợ vượt quá dư nợ gối đầu của bà con!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/debts/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          khachHangId: selectedCust.id,
          soTienThu: amt,
          ghiChu: modalCollectNote || "Bà con trả bớt nợ sỉ tại quầy xem chi tiết"
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      alert("Đã thu nợ bớt thành công!");
      
      // Reload current customer stats
      const refreshedCustomersRes = await fetch('/api/customers');
      const refreshedCustomers = await refreshedCustomersRes.json();
      setCustomers(refreshedCustomers);
      
      const updatedCust = refreshedCustomers.find((c: any) => c.id === selectedCust.id);
      if (updatedCust) {
        setSelectedCust(updatedCust);
      }
      
      setModalCollectAmount('');
      setModalCollectNote('');
      
      // Update history
      const fundsRes = await fetch('/api/funds');
      const fundsData = await fundsRes.json();
      setPurchaseInvoices(fundsData.phieuThus.filter((p: any) => p.khachHangId === selectedCust.id));
      
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Season
  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust || !newSeasonName) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/customers/${selectedCust.id}/seasons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenVu: newSeasonName,
          cayTrong: newSeasonCrop,
          dienTich: Number(newSeasonArea),
          ghiChu: newSeasonNote
        })
      });

      if (!res.ok) throw new Error("Lỗi lưu vụ mùa");
      
      setNewSeasonName('');
      setNewSeasonNote('');
      
      // Reload seasons list
      const sRes = await fetch(`/api/customers/${selectedCust.id}/seasons`);
      const sData = await sRes.json();
      setSeasons(sData);
      alert("Đã ghi sổ mùa vụ mới thành công!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Click Season to Load Logs
  const handleSelectSeason = async (season: MuaVu) => {
    setSelectedSeason(season);
    try {
      setLoading(true);
      const res = await fetch(`/api/seasons/${season.id}/logs`);
      const data = await res.json();
      setSeasonLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add Season Log (Phun thuốc / bón phân)
  const handleAddSeasonLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeason || !newLogMaterial) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/seasons/${selectedSeason.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loaiHanhDong: newLogType,
          tenVatTu: newLogMaterial,
          lieuLuong: newLogDosage,
          hieuQua: newLogEffect,
          ghiChu: newLogNote
        })
      });

      if (!res.ok) throw new Error("Lỗi lưu nhật ký sử dụng");

      setNewLogMaterial('');
      setNewLogDosage('');
      setNewLogNote('');

      // Reload logs
      const logRes = await fetch(`/api/seasons/${selectedSeason.id}/logs`);
      const logData = await logRes.json();
      setSeasonLogs(logData);
      alert("Đã thêm ghi nhật ký sử dụng thành công!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Technical Consultation
  const handleAddConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust || !newTrieuChung) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/customers/${selectedCust.id}/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trieuChung: newTrieuChung,
          chanDoan: newChanDoan,
          giaiPhapPhacDo: newGiaiPhap,
          hieuQuaSuDung: newHieuQuaTuVan
        })
      });

      if (!res.ok) throw new Error("Lỗi lưu phiếu tư vấn kỹ thuật");

      setNewTrieuChung('');
      setNewChanDoan('');
      setNewGiaiPhap('');

      // Reload consult logs
      const cRes = await fetch(`/api/customers/${selectedCust.id}/consultations`);
      const cData = await cRes.json();
      setConsultations(cData);
      alert("Lập bệnh án điều trị và giải pháp thành công!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger AI Learn
  const handleAILearn = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/consultations/${id}/learn`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error("AI không phản hồi");
      
      alert("Mô hình AI đã hấp thụ phản hồi điều trị thực tế để làm giàu kiến thức dược học!");
      
      // Reload
      if (selectedCust) {
        const cRes = await fetch(`/api/customers/${selectedCust.id}/consultations`);
        const cData = await cRes.json();
        setConsultations(cData);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter customers logic
  const filteredCustomers = customers.filter(c => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      c.hoTen.toLowerCase().includes(searchLower) || 
      c.dienThoai.includes(searchQuery) ||
      (c.tenXom || '').toLowerCase().includes(searchLower) ||
      (c.ghiChu || '').toLowerCase().includes(searchLower);

    const matchesHamlet = selectedHamletFilter !== null ? c.xomId === selectedHamletFilter : true;
    
    let matchesDebt = true;
    if (selectedDebtFilter === 'Debt') {
      matchesDebt = c.debt > 0;
    } else if (selectedDebtFilter === 'NoDebt') {
      matchesDebt = c.debt === 0;
    }

    return matchesSearch && matchesHamlet && matchesDebt;
  });

  return (
    <div className="space-y-6" id="customers-tab">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <Users className="text-[#166534] h-5 w-5" /> Quản Lý Nông Hộ Canh Tác Kỹ Thuật Cao
          </h2>
          <p className="text-xs text-slate-500">
            Duy trì lịch trình mùa vụ, sổ tay bón phân, xịt thuốc trị dịch tễ, nhật ký tư vấn, cùng chức năng gom nợ gối đầu theo thôn xóm.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHamletManager(true)}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <MapPin className="h-4 w-4 text-[#166534]" /> Quản lý các Xóm địa bàn
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#166534]" /> Thống kê & Lọc Nợ Thôn Xóm:
            </label>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setSelectedHamletFilter(null)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${selectedHamletFilter === null ? 'bg-[#166534] text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                Tất cả xóm ({customers.length})
              </button>
              {hamlets.filter(x => x.ngungHoatDong !== true).map(x => {
                const countInHamlet = customers.filter(c => c.xomId === x.id).length;
                const totalHamletDebt = customers.filter(c => c.xomId === x.id).reduce((sum, c) => sum + (c.debt || 0), 0);
                
                return (
                  <button
                    type="button"
                    key={x.id}
                    onClick={() => setSelectedHamletFilter(x.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${selectedHamletFilter === x.id ? 'bg-[#166534] text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                  >
                    {x.tenXom} ({countInHamlet}) 
                    {totalHamletDebt > 0 && <span className="ml-1 px-1 py-0.2 bg-amber-100 text-amber-800 text-[9px] rounded font-mono font-black">{totalHamletDebt.toLocaleString()}đ</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Trạng thái nợ gối đầu:
            </label>
            <div className="flex gap-1">
              {(['All', 'Debt', 'NoDebt'] as const).map(f => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setSelectedDebtFilter(f)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${selectedDebtFilter === f ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                >
                  {f === 'All' ? 'Tất cả nợ' : f === 'Debt' ? 'Đang nợ gối vụ' : 'Đã thanh sạch'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Rapid Register Farmer (4 Cols) */}
        <div className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>{editingCustomer ? "📝 Cập nhật Nông Hộ" : "Khai Báo Nông Hộ Mới"}</span>
              {editingCustomer && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-red-600 hover:underline font-bold"
                >
                  Hủy sửa
                </button>
              )}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ tên chủ hộ *</label>
              <input
                type="text"
                required
                placeholder="vd: Ông Nguyễn Văn An"
                value={hoTen}
                onChange={e => setHoTen(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Điện thoại</label>
                <input
                  type="text"
                  placeholder="097..."
                  value={dienThoai}
                  onChange={e => setDienThoai(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cây trồng chính</label>
                <SmartComboBox
                  options={crops}
                  value={loaiCayTrongId}
                  onChange={(val) => setLoaiCayTrongId(val)}
                  getLabel={(c: CayTrong) => c.tenCayTrong}
                  getValue={(c: CayTrong) => c.id}
                  placeholder="Chọn cây trồng chính..."
                  onQuickCreate={handleQuickCreateCrop}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diện tích (sào)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="vd: 6.5 sào"
                  value={dienTichCanhTac}
                  onChange={e => setDienTichCanhTac(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nghề nghiệp</label>
                <input
                  type="text"
                  placeholder="Làm ruộng / Cây ăn quả"
                  value={ngheNghiep}
                  onChange={e => setNgheNghiep(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thôn xóm địa bàn *</label>
              <SmartComboBox
                options={hamlets.filter(x => x.ngungHoatDong !== true)}
                value={xomId ? Number(xomId) : ''}
                onChange={(val) => setXomId(String(val))}
                getLabel={(x: Hamlet) => x.tenXom}
                getValue={(x: Hamlet) => x.id}
                placeholder="Chọn thôn xóm..."
                onQuickCreate={handleQuickCreateXom}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ chi tiết</label>
              <input
                type="text"
                placeholder="vd: Đối diện trạm bơm xóm"
                value={diaChi}
                onChange={e => setDiaChi(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú đặc điểm hộ dân</label>
              <textarea
                rows={3}
                placeholder="vd: Thường lấy phân bón đầu vụ lúa, thanh toán dứt điểm khi bán thóc..."
                value={ghiChu}
                onChange={e => setGhiChu(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs transition cursor-pointer"
              >
                {editingCustomer ? "Cập nhật nông hộ" : "Lưu thông tin nông dân"}
              </button>
              {editingCustomer && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Farmers Grid/Table list (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Tìm bà con theo tên, SĐT, thôn xóm, đặc điểm ghi chú..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs text-slate-900"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPrintPreview(true)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shrink-0"
                title="In danh sách thu nợ và chi tiết công nợ theo xóm địa bàn"
              >
                <Printer className="h-4 w-4 text-[#166534]" /> In Sổ Thu Nợ Xóm
              </button>
            </div>

            <div className="flex items-center justify-between pb-1">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 select-none cursor-pointer">
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
                <span>Hiển thị nông hộ đã xóa mềm/lưu trữ (EX-03-004)</span>
              </label>
            </div>

            {(() => {
              const customerColumns = [
                {
                  header: "Hộ nông dân",
                  sortKey: "hoTen",
                  accessor: (c: Customer) => (
                    <div>
                      <div className="font-bold text-slate-900 hover:text-[#166534] transition flex items-center gap-1 flex-wrap">
                        {c.hoTen}
                        {c.DaXoa ? (
                          <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded font-semibold">Đã xóa mềm/Lưu trữ</span>
                        ) : (
                          <span className="text-[9px] bg-[#BBF7D0] text-[#166534] px-1 rounded font-normal">Chi tiết</span>
                        )}
                      </div>
                      {c.dienThoai && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                          <Phone className="h-3 w-3 text-[#166534]" /> {c.dienThoai}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  header: "Xóm địa bàn",
                  sortKey: "tenXom",
                  accessor: (c: Customer) => (
                    <span className="px-2 py-0.5 bg-emerald-50 text-[#166534] rounded font-bold">
                      {c.tenXom || 'N/A'}
                    </span>
                  )
                },
                {
                  header: "Diện tích & Cây",
                  sortKey: "cayTrongChuLuc",
                  accessor: (c: Customer) => (
                    <div>
                      <div className="font-semibold text-slate-700 flex items-center gap-1">
                        <Crop className="h-3.5 w-3.5 text-[#166534]" /> {c.cayTrongChuLuc || 'Chưa rõ'}
                      </div>
                      <div className="text-[10px] text-slate-400">{c.dienTichCanhTac} sào</div>
                    </div>
                  )
                },
                {
                  header: "Đặc điểm / Ghi chú",
                  accessor: (c: Customer) => (
                    <div>
                      <div className="text-[10px] text-slate-600 line-clamp-1">{c.diaChi || 'Trống'}</div>
                      {c.ghiChu && <div className="text-[9px] text-amber-800 bg-amber-50 rounded px-1 py-0.5 inline-block mt-0.5 max-w-[150px] truncate">📌 {c.ghiChu}</div>}
                    </div>
                  )
                },
                {
                  header: "Dư nợ gối vụ",
                  sortKey: "debt",
                  className: "text-right",
                  accessor: (c: Customer) => (
                    <span className={`px-2.5 py-1 rounded text-xs font-black ${c.debt && c.debt > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-[#166534]'}`}>
                      {(c.debt || 0).toLocaleString()} đ
                    </span>
                  )
                },
                {
                  header: "Hành động",
                  className: "text-center print:hidden",
                  accessor: (c: Customer) => (
                    <div className="flex justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {c.DaXoa ? (
                        <button
                          onClick={() => handleRestoreCustomer(c)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold cursor-pointer transition"
                          title="Khôi phục hoạt động nông hộ"
                        >
                          Khôi phục
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEditCustomer(c)}
                            className="p-1 hover:bg-slate-200 text-slate-600 hover:text-[#166534] rounded cursor-pointer transition"
                            title="Sửa thông tin nông hộ"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(c)}
                            className="p-1 hover:bg-red-50 text-red-600 rounded cursor-pointer transition"
                            title="Xóa mềm nông hộ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )
                }
              ];

              return (
                <SmartTable
                  data={filteredCustomers}
                  columns={customerColumns}
                  onRowClick={handleOpenCustomerDetail}
                  getRowId={c => c.id}
                  emptyMessage="Không tìm thấy nông dân nào tương ứng với bộ lọc."
                  exportTitle="Báo cáo danh sách nông hộ gối đầu vật tư nông nghiệp"
                />
              );
            })()}
          </div>
        </div>
      </div>

      {/* Hamlet Manager Panel overlay modal */}
      {showHamletManager && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                <MapPin className="h-4.5 w-4.5 text-[#166534]" /> Quản lý các Xóm Địa Bàn (Nhóm dân cư)
              </h3>
              <button onClick={() => setShowHamletManager(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 max-h-[400px]">
              {/* Form Add */}
              <form onSubmit={handleAddHamlet} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nhập tên thôn xóm mới để gối vụ..."
                  value={newXomName}
                  onChange={e => setNewXomName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Thêm mới
                </button>
              </form>

              {/* List */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Danh sách xóm nông hộ hiện tại:</label>
                {hamlets.map(x => (
                  <div key={x.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs font-semibold text-slate-800">
                    {editingHamletId === x.id ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editingHamletName}
                          onChange={e => setEditingHamletName(e.target.value)}
                          className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#166534] text-xs"
                        />
                        <button
                          onClick={() => handleRenameHamlet(x.id)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px]"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingHamletId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-[10px]"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className={x.ngungHoatDong ? "opacity-50 line-through" : ""}>
                          <span>🏡 {x.tenXom}</span>
                          <span className="ml-2 font-normal text-[10px] text-slate-400">
                            ({customers.filter(c => c.xomId === x.id).length} hộ khẩu)
                          </span>
                          {x.ngungHoatDong && (
                            <span className="ml-2 px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] font-bold">
                              Ngừng hoạt động
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {x.ngungHoatDong ? (
                            <button
                              onClick={() => handleRestoreHamlet(x.id)}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                              title="Khôi phục hoạt động"
                            >
                              <RefreshCw className="h-3 w-3" /> Khôi phục
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingHamletId(x.id);
                                  setEditingHamletName(x.tenXom);
                                }}
                                className="p-1 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
                                title="Sửa tên xóm"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              {x.id > 11 && (
                                <button
                                  onClick={() => handleDeleteHamlet(x.id)}
                                  className="p-1 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                                  title="Ngừng hoạt động"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT DEBT COLLECTION LIST PREVIEW MODAL */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto no-print-backdrop">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8 print:border-0 print:shadow-none print:max-h-full print:m-0 print:p-0">
            {/* Inline CSS override for clean printing */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #debt-print-area, #debt-print-area * {
                  visibility: visible !important;
                }
                #debt-print-area {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 20px !important;
                  box-sizing: border-box !important;
                }
                .no-print-backdrop {
                  background-color: transparent !important;
                }
              }
            ` }} />
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-[#166534]" />
                <h3 className="font-bold text-slate-800 text-base">In Sổ Thu Nợ Địa Bàn (Xóm)</h3>
              </div>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body / Printable Content */}
            <div className="p-8 overflow-y-auto flex-1 print:p-0" id="debt-print-area">
              <div className="space-y-6">
                {/* Header for print */}
                <div className="text-center space-y-2 border-b-2 border-slate-950 pb-4">
                  <h2 className="text-xl font-black uppercase text-slate-900 tracking-wide">Sổ Theo Dõi Thu Nợ Khách Hàng Gối Vụ</h2>
                  <p className="text-xs text-slate-700 font-bold">
                    CỬA HÀNG VẬT TƯ NÔNG NGHIỆP HẢI ĐĂNG • ĐT: 0399.888.777
                  </p>
                  <p className="text-sm text-slate-800 font-semibold">
                    Địa bàn: <span className="text-sm font-black text-slate-900 underline">{selectedHamletFilter ? hamlets.find(x => x.id === selectedHamletFilter)?.tenXom : "Tất cả địa bàn thôn xóm"}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    Ngày in sổ: {new Date().toLocaleDateString('vi-VN')} • Trạng thái lọc: {selectedDebtFilter === 'Debt' ? 'Chỉ hộ đang nợ gối vụ' : 'Tất cả nông hộ'}
                  </p>
                </div>

                {/* Table */}
                <table className="w-full text-xs text-left border-collapse border border-slate-400">
                  <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="border border-slate-400 px-3 py-2.5 text-center w-8">STT</th>
                      <th className="border border-slate-400 px-3 py-2.5">Hộ nông dân</th>
                      <th className="border border-slate-400 px-3 py-2.5">Địa bàn (Xóm)</th>
                      <th className="border border-slate-400 px-3 py-2.5">Số điện thoại</th>
                      <th className="border border-slate-400 px-3 py-2.5">Địa chỉ chi tiết</th>
                      <th className="border border-slate-400 px-3 py-2.5 text-right">Dư nợ gối vụ</th>
                      <th className="border border-slate-400 px-3 py-2.5 text-center">Phát sinh gần nhất</th>
                      <th className="border border-slate-400 px-3 py-2.5 text-center">Hạn thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.filter(c => c.debt > 0).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="border border-slate-400 px-3 py-8 text-center italic text-slate-500">
                          Không có hộ nông dân nào phát sinh nợ gối vụ trong bộ lọc hiện tại.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.filter(c => c.debt > 0).map((c, idx) => (
                        <tr key={c.id} className="hover:bg-slate-50 font-semibold">
                          <td className="border border-slate-400 px-3 py-2.5 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-400 px-3 py-2.5 font-bold text-slate-900">{c.hoTen}</td>
                          <td className="border border-slate-400 px-3 py-2.5">{c.tenXom || "Khác"}</td>
                          <td className="border border-slate-400 px-3 py-2.5 font-mono">{c.dienThoai || "---"}</td>
                          <td className="border border-slate-400 px-3 py-2.5 max-w-[150px] truncate">{c.diaChi || "---"}</td>
                          <td className="border border-slate-400 px-3 py-2.5 text-right font-mono font-black text-red-700 text-xs">
                            {(c.debt || 0).toLocaleString('vi-VN')}đ
                          </td>
                          <td className="border border-slate-400 px-3 py-2.5 text-center font-mono text-[11px]">
                            {c.ngayPhatSinhNoGanNhat ? new Date(c.ngayPhatSinhNoGanNhat).toLocaleDateString('vi-VN') : "Chưa ghi nhận"}
                          </td>
                          <td className="border border-slate-400 px-3 py-2.5 text-center">
                            <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[9px] print:border-0 print:bg-transparent print:p-0">
                              {c.hanThanhToan ? (c.hanThanhToan.includes('T') ? new Date(c.hanThanhToan).toLocaleDateString('vi-VN') : c.hanThanhToan) : "Cuối vụ"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                    {filteredCustomers.filter(c => c.debt > 0).length > 0 && (
                      <tr className="bg-slate-50 font-bold text-slate-900 text-xs">
                        <td colSpan={5} className="border border-slate-400 px-3 py-3 text-right uppercase tracking-wider font-extrabold">Cộng tổng nợ địa bàn:</td>
                        <td className="border border-slate-400 px-3 py-3 text-right font-mono font-black text-red-700 text-sm">
                          {filteredCustomers.filter(c => c.debt > 0).reduce((sum, c) => sum + (c.debt || 0), 0).toLocaleString('vi-VN')}đ
                        </td>
                        <td colSpan={2} className="border border-slate-400 px-3 py-3 bg-slate-100"></td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Print Footer */}
                <div className="grid grid-cols-2 pt-12 text-center text-xs font-semibold">
                  <div className="space-y-16">
                    <p>Người lập sổ nợ</p>
                    <p className="font-bold text-slate-800">................................................</p>
                  </div>
                  <div className="space-y-16">
                    <p>Chủ cửa hàng (Ký, ghi rõ họ tên)</p>
                    <p className="font-bold text-[#166534] text-sm underline">Vũ Hải Đăng</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 print:hidden">
              <button
                type="button"
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Tiến hành in ngay (Ctrl+P)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED CUSTOMER PROFILE MODAL */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8">
            
            {/* Modal Header */}
            <div className="p-5 bg-[#166534] text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-1.5 leading-none">
                  <Users className="h-5 w-5 text-emerald-200" /> Sổ Tay Canh Tác Kỹ Thuật: {selectedCust.hoTen}
                </h3>
                <p className="text-xs text-emerald-100 mt-1 leading-none">
                  Xóm địa bàn: {selectedCust.tenXom || 'Chưa phân thôn'} • SĐT: {selectedCust.dienThoai || 'N/A'} • Canh tác: {selectedCust.dienTichCanhTac} sào {selectedCust.cayTrongChuLuc}
                </p>
              </div>
              <button 
                onClick={() => setSelectedCust(null)}
                className="p-1 text-emerald-100 hover:text-white hover:bg-[#15803d]/50 rounded-lg transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 flex gap-1">
              <button
                onClick={() => setActiveModalTab('info')}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition ${activeModalTab === 'info' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
              >
                Thông tin & Sổ nợ
              </button>
              <button
                onClick={() => setActiveModalTab('seasons')}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition ${activeModalTab === 'seasons' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
              >
                🌾 Sổ Mùa Vụ & Phun Thuốc
              </button>
              <button
                onClick={() => setActiveModalTab('consult')}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition ${activeModalTab === 'consult' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
              >
                🩺 Tư Vấn Dịch Tễ (AI Learned)
              </button>
              <button
                onClick={() => setActiveModalTab('purchases')}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition ${activeModalTab === 'purchases' ? 'border-[#166534] text-[#166534]' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
              >
                🧾 Hóa Đơn Mua Hàng ({purchaseInvoices.length})
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              
              {/* Tab 1: Info and Debt Collection */}
              {activeModalTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: General Details */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                      <Award className="h-4.5 w-4.5 text-[#166534]" /> Hồ sơ chủ hộ canh tác
                    </h4>
                    <div className="space-y-3.5 text-xs text-slate-700 font-medium">
                      <div className="flex justify-between py-1.5 border-b border-slate-200/50">
                        <span className="text-slate-400">Họ tên:</span>
                        <span className="font-bold text-slate-900">{selectedCust.hoTen}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200/50">
                        <span className="text-slate-400">Điện thoại:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedCust.dienThoai || 'Chưa cung cấp'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200/50">
                        <span className="text-slate-400">Địa bàn thôn:</span>
                        <span className="font-bold text-[#166534]">{selectedCust.tenXom || 'Chưa phân'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200/50">
                        <span className="text-slate-400">Diện tích sào gieo:</span>
                        <span className="font-bold text-slate-900">{selectedCust.dienTichCanhTac} sào Bắc Bộ</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200/50">
                        <span className="text-slate-400">Nghề chính:</span>
                        <span className="font-bold text-slate-900">{selectedCust.ngheNghiep || 'Làm ruộng'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200/50">
                        <span className="text-slate-400">Đặc điểm gieo cấy:</span>
                        <span className="font-bold text-slate-900">{selectedCust.cayTrongChuLuc || 'Lúa nước'}</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-slate-400 block mb-1">Ghi chú lưu ý:</span>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-600 text-xs italic">
                          {selectedCust.ghiChu || 'Chưa có ghi chú lưu ý nào đặc biệt.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Debt status & Quick collect */}
                  <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 space-y-4">
                    <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1">
                      <DollarSign className="h-4.5 w-4.5 text-amber-800" /> Quản lý công nợ gối vụ của hộ
                    </h4>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 uppercase block">Số dư nợ gối vụ gộp:</span>
                        <span className="text-xl font-black text-amber-950 font-mono">
                          {selectedCust.debt.toLocaleString()} đ
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedCust.debt > 0 ? 'bg-amber-100 text-amber-900 animate-pulse' : 'bg-emerald-100 text-[#166534]'}`}>
                        {selectedCust.debt > 0 ? 'Chờ thanh quyết toán' : 'Sạch nợ'}
                      </span>
                    </div>

                    {selectedCust.debt > 0 && (
                      <form onSubmit={handleModalCollectDebt} className="space-y-3 pt-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">Ghi nhận bà con trả bớt nợ sỉ mặt:</span>
                        <div>
                          <input
                            type="number"
                            required
                            min="1"
                            max={selectedCust.debt}
                            placeholder="Nhập số tiền trả nợ bằng VND... (vd: 500000)"
                            value={modalCollectAmount}
                            onChange={e => setModalCollectAmount(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs font-bold text-[#166534] text-right"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Ghi chú đợt trả (vd: Trả bớt tiền phân bón lúa mùa)"
                            value={modalCollectNote}
                            onChange={e => setModalCollectNote(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition"
                        >
                          Xác nhận Thu hồi bớt nợ gối
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Sổ mùa vụ & Timeline phun thuốc */}
              {activeModalTab === 'seasons' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left panel: list of seasons and add season form (5 Cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
                        Danh sách các vụ mùa gieo cấy:
                      </h4>

                      <div className="space-y-2 max-h-[220px] overflow-y-auto">
                        {seasons.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 italic text-xs">Chưa có vụ gieo nào được khai báo.</div>
                        ) : (
                          seasons.map(s => (
                            <div 
                              key={s.id}
                              onClick={() => handleSelectSeason(s)}
                              className={`p-3 border rounded-lg cursor-pointer transition text-xs font-semibold ${selectedSeason?.id === s.id ? 'bg-[#BBF7D0]/60 border-[#166534] text-slate-900' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900">🌾 {s.tenVu}</span>
                                <span className="px-1.5 py-0.2 bg-emerald-50 text-[#166534] text-[9px] rounded">{s.dienTich} sào</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                                <span>Cây trồng: {s.cayTrong}</span>
                                <span>Bắt đầu: {new Date(s.ngayBatDau).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Add season form */}
                    <form onSubmit={handleAddSeason} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                      <h4 className="font-bold text-slate-800 text-xs">Mở Sổ Mùa Vụ Mới</h4>
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Tên vụ mùa (vd: Vụ Đông Xuân 2026)"
                          value={newSeasonName}
                          onChange={e => setNewSeasonName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Cây trồng (vd: Lúa lốc, Cam)"
                          value={newSeasonCrop}
                          onChange={e => setNewSeasonCrop(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                        <input
                          type="number"
                          step="0.1"
                          required
                          placeholder="Diện tích (sào)"
                          value={newSeasonArea}
                          onChange={e => setNewSeasonArea(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold rounded-lg transition"
                      >
                        + Khai báo gieo cấy mới
                      </button>
                    </form>
                  </div>

                  {/* Right panel: Timeline & usage logs of selected season (7 Cols) */}
                  <div className="lg:col-span-7">
                    {selectedSeason ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                        <div className="pb-2 border-b border-slate-100 flex justify-between items-center">
                          <h4 className="font-bold text-[#166534] text-xs uppercase tracking-wide">
                            Nhật Ký Sử Dụng & Đánh Giá Hiệu Quả: {selectedSeason.tenVu}
                          </h4>
                          <span className="text-[10px] text-slate-400">HSD / FEFO Traceability</span>
                        </div>

                        {/* Interactive Add Log form */}
                        <form onSubmit={handleAddSeasonLog} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => setNewLogType('PhunThuoc')}
                              className={`py-1.5 rounded-lg border text-center font-bold ${newLogType === 'PhunThuoc' ? 'bg-emerald-50 border-emerald-300 text-[#166534]' : 'bg-white border-slate-200 text-slate-600'}`}
                            >
                              Phun xịt thuốc BVTV
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewLogType('BonPhan')}
                              className={`py-1.5 rounded-lg border text-center font-bold ${newLogType === 'BonPhan' ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-white border-slate-200 text-slate-600'}`}
                            >
                              Bón thúc phân bón
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Tên loại vật tư (vd: Anvil, NPK)"
                              value={newLogMaterial}
                              onChange={e => setNewLogMaterial(e.target.value)}
                              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Liều lượng (vd: 20ml/bình, 25kg/sào)"
                              value={newLogDosage}
                              onChange={e => setNewLogDosage(e.target.value)}
                              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">Hiệu quả thực tế của thuốc/phân:</label>
                              <select
                                value={newLogEffect}
                                onChange={e => setNewLogEffect(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                              >
                                <option value="Hiệu quả cao - Sạch sâu bệnh hại">Hiệu quả cao - Sạch sạch nấm/sâu</option>
                                <option value="Hiệu quả trung bình - Sâu bệnh giảm chậm">Hiệu quả trung bình</option>
                                <option value="Chưa hiệu quả - Có hiện tượng kháng thuốc">Chưa hiệu quả / Cần xịt lại</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <input
                              type="text"
                              placeholder="Ghi chú đợt sử dụng..."
                              value={newLogNote}
                              onChange={e => setNewLogNote(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-1.5 bg-[#166534] hover:bg-[#15803d] text-white text-xs font-bold rounded-lg transition"
                          >
                            Ghi nhận nhật ký & Đánh giá hiệu quả
                          </button>
                        </form>

                        {/* Logs Timeline list */}
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {seasonLogs.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 italic text-xs">Chưa có nhật ký bón thuốc/bón phân nào trong vụ này.</div>
                          ) : (
                            seasonLogs.map(l => (
                              <div key={l.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold mt-0.5 ${l.loaiHanhDong === 'PhunThuoc' ? 'bg-emerald-100 text-[#166534]' : 'bg-blue-100 text-blue-800'}`}>
                                  {l.loaiHanhDong === 'PhunThuoc' ? 'Xịt BVTV' : 'Bón Phân'}
                                </span>
                                <div className="flex-1 text-xs">
                                  <div className="font-bold text-slate-900">{l.tenVatTu} <span className="font-normal text-slate-450">({l.lieuLuong || 'Chưa rõ liều'})</span></div>
                                  <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 rounded px-1 py-0.2 mt-1 inline-block">🎯 Hiệu quả: {l.hieuQua}</div>
                                  {l.ghiChu && <p className="text-[10px] text-slate-500 mt-1 italic">"{l.ghiChu}"</p>}
                                  <div className="text-[8.5px] text-slate-400 mt-1">{new Date(l.ngayPhatSinh).toLocaleString('vi-VN')}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-400 italic text-xs h-full flex flex-col justify-center">
                        <Activity className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        Click chọn một Vụ Mùa gieo cấy bên trái để ghi chép bón phân, phun thuốc và đánh giá lâm sàng hiệu quả thực tế!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Technical Consultations with AI Learned */}
              {activeModalTab === 'consult' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Diagnose logs list */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Lịch sử tư vấn kỹ thuật & Dịch tễ:</h4>
                    <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                      {consultations.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 italic text-xs">Chưa có phiếu tư vấn lâm sàng nông nghiệp nào.</div>
                      ) : (
                        consultations.map(c => (
                          <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                              <span>📅 Ngày khám: {new Date(c.ngayTuVan).toLocaleDateString('vi-VN')}</span>
                              <span className={`px-2 py-0.5 rounded font-bold ${c.aiHocLarned ? 'bg-emerald-100 text-[#166534]' : 'bg-amber-100 text-amber-800'}`}>
                                {c.aiHocLarned ? '🤖 AI đã học hỏi dịch tễ' : 'Chờ phản hồi dịch tễ'}
                              </span>
                            </div>
                            <div className="text-xs space-y-1 text-slate-700">
                              <p><strong className="text-red-700">Triệu chứng:</strong> {c.trieuChung}</p>
                              <p><strong className="text-slate-900">Bệnh học:</strong> {c.chanDoan}</p>
                              <p><strong className="text-emerald-800">Phác đồ (Thuốc kệ đại lý):</strong> {c.giaiPhapPhacDo}</p>
                              <p className="bg-emerald-50 text-[#166534] p-1.5 rounded text-[10px] font-semibold mt-1">
                                📣 Kết quả lâm sàng: {c.hieuQuaSuDung}
                              </p>
                            </div>

                            {!c.aiHocLarned && (
                              <button
                                onClick={() => handleAILearn(c.id)}
                                className="w-full mt-2 py-1 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded text-[10px] flex items-center justify-center gap-1 transition"
                              >
                                <Sparkles className="h-3 w-3 text-emerald-200" /> Xác nhận phác đồ này hiệu quả để nạp cho AI
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right: Write diagnostic report */}
                  <form onSubmit={handleAddConsultation} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide pb-1 border-b border-slate-100 flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-[#166534]" /> Lập Bệnh Án & Tư Vấn Cắt Thuốc
                    </h4>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Triệu chứng lâm sàng bà con mô tả *</label>
                      <input
                        type="text"
                        required
                        placeholder="vd: Lá lúa khô đầu, xuất hiện chấm vàng nhạt sọc rỉ sắt..."
                        value={newTrieuChung}
                        onChange={e => setNewTrieuChung(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Kết luận chẩn đoán sâu bệnh hại *</label>
                      <input
                        type="text"
                        required
                        placeholder="vd: Nhiễm đạo ôn lá kết hợp bạc lá vi khuẩn"
                        value={newChanDoan}
                        onChange={e => setNewChanDoan(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Phác đồ bốc thuốc & Liệu lượng kê đơn *</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="vd: Cắt 10 chai Anvil xịt đều chiều mát, giãn cách 7 ngày, kèm 3 gói gói sát khuẩn vi khuẩn"
                        value={newGiaiPhap}
                        onChange={e => setNewGiaiPhap(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Đánh giá kết quả ban đầu sau 3-5 ngày gối đầu:</label>
                      <select
                        value={newHieuQuaTuVan}
                        onChange={e => setNewHieuQuaTuVan(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none"
                      >
                        <option value="Đạt hiệu quả cao, khống chế hoàn toàn vết bệnh">Hiệu quả cao - sạch nấm/khô vằn</option>
                        <option value="Hiệu quả khá, cây lúa đang phục hồi màu lá">Trung bình - cây đang dần sậm lá</option>
                        <option value="Cây bị sượng bông nhẹ, cần theo dõi kiểm tra lại">Không rõ nét / Cần đổi thuốc đợt tới</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs transition"
                    >
                      Xác Nhận Đăng Ký Nhật Ký Tư Vấn
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 4: Purchase History List */}
              {activeModalTab === 'purchases' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Nhật ký lịch sử thanh quyết toán của nông hộ:</h4>
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {purchaseInvoices.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 italic text-xs">
                        Chưa ghi nhận giao dịch thanh toán hoặc hóa đơn gối nợ trực tiếp nào cho hộ này.
                      </div>
                    ) : (
                      purchaseInvoices.map((log: any) => (
                        <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-semibold">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-[#166534]">Phiếu thu nợ / Thu trực tiếp</span>
                              <span className="text-slate-400 font-mono font-bold">{log.maPhieuThu}</span>
                            </div>
                            <div className="text-slate-800 font-bold mt-1">{log.nguonNop}</div>
                            {log.ghiChu && <div className="text-[10px] text-slate-500 italic mt-0.5">"{log.ghiChu}"</div>}
                            <div className="text-[9px] text-slate-450 mt-1">{new Date(log.ngayLap).toLocaleString('vi-VN')}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#166534] font-black">+{log.soTien.toLocaleString()} đ</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedCust(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Đóng Sổ Canh Tác
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
