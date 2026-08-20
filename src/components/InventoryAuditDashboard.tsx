import React, { useState, useEffect } from "react";
import { 
  Search, AlertTriangle, RotateCcw, History, Calendar, ShieldCheck, 
  CheckCircle2, ClipboardList, FileSearch, Layers, Activity, UserCheck, Check
} from "lucide-react";

interface Product {
  id: number;
  maHangHoa: string;
  tenTrenBaoBi: string;
  donViTinh?: string;
  currentStock: number;
  tonToiThieu: number;
  nguongCanhBaoHSD: number;
}

interface Lot {
  id: number;
  hangHoaId: number;
  maHangHoa: string;
  tenHangHoa: string;
  maLo: string;
  ngaySanXuat: string;
  hanSuDung: string;
  nhaSanXuat?: string;
  tenNhaCungCap?: string;
  giaNhap: number;
  soLuongNhap: number;
  soLuongTon: number;
}

interface AuditDetail {
  hangHoaId: number;
  tenHangHoa?: string;
  maHangHoa?: string;
  tonHeThong: number;
  tonThucTe: number;
  chenhLech: number;
}

interface AuditSession {
  id: number;
  maPhieuKiemKe: string;
  ngayLap: string;
  nguoiKiemKe: string;
  trangThai: "Draft" | "DaXacNhan";
  ghiChu: string;
  chiTiet: AuditDetail[];
  nguoiThucHien?: string;
  thoiGianXacNhan?: string;
}

interface StockAlert {
  hangHoaId: number;
  maHangHoa: string;
  tenHangHoa: string;
  loaiCanhBao: string;
  thongTinCanhBao: string;
  badge: string;
  mucDo: "NghiemTrong" | "Cao" | "TrungBinh";
  maLo?: string;
  hanSuDung?: string;
  lotId?: number;
}

interface TraceLineage {
  batchId: number;
  backward: {
    maLo: string;
    sanPham: { id: number; ma: string; ten: string } | null;
    giaNhap: number;
    originalQuantity: number;
    remainingQuantity: number;
    phieuNhap: { id: number; ma: string; ngay: string; kho: string; nguoiLap: string } | null;
    nhaCungCap: { id: number; ma: string; ten: string; sdt: string } | null;
    baoGia: any;
  };
  forward: {
    sales: Array<{ thoiGian: string; soLuongGiam: number; version: number; chungTu: string; loaiGiaoDich: string; nguoiThucHien: string }>;
    adjustments: Array<{ thoiGian: string; delta: number; chungTu: string; nguoiThucHien: string; ghiChu: string }>;
  };
  traceTime: string;
  traceLogId: number;
}

interface StockHistoryLog {
  id: number;
  hangHoaId: number;
  tenHangHoa?: string;
  maHangHoa?: string;
  ngayPhatSinh: string;
  loaiGiaoDich: string;
  thamChieuId: string;
  khoTruoc?: number;
  khoSau?: number;
  soLuongThayDoi: number;
  nguoiThucHien: string;
  ip: string;
  userAgent: string;
  ghiChu: string;
}

export default function InventoryAuditDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<"audit" | "lots" | "alerts" | "trace" | "history">("audit");
  const [products, setProducts] = useState<Product[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [audits, setAudits] = useState<AuditSession[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [historyLogs, setHistoryLogs] = useState<StockHistoryLog[]>([]);
  
  // Create audit session states
  const [isCreatingAudit, setIsCreatingAudit] = useState(false);
  const [auditNguoiKiemKe, setAuditNguoiKiemKe] = useState("");
  const [auditGhiChu, setAuditGhiChu] = useState("");
  const [auditDetails, setAuditDetails] = useState<AuditDetail[]>([]);
  
  const [auditAddProdId, setAuditAddProdId] = useState<string>("");
  const [auditAddQty, setAuditAddQty] = useState<string>("");

  // Confirmation states
  const [confirmingAuditId, setConfirmingAuditId] = useState<number | null>(null);
  const [secondConfirmRequired, setSecondConfirmRequired] = useState(false);
  const [secondConfirmMsg, setSecondConfirmMsg] = useState("");
  const [operatorName, setOperatorName] = useState("Chủ cửa hàng (Hải Đăng)");

  // Trace state
  const [traceQuery, setTraceQuery] = useState("");
  const [traceResult, setTraceResult] = useState<TraceLineage | null>(null);
  const [traceError, setTraceError] = useState("");

  // Status message
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadLots();
    loadAudits();
    loadAlerts();
    loadHistory();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        // Map to simpler format
        const mapped = data.map((item: any) => ({
          id: item.id,
          maHangHoa: item.maHangHoa,
          tenTrenBaoBi: item.tenTrenBaoBi,
          donViTinh: item.donViTinh,
          currentStock: item.currentStock,
          tonToiThieu: item.tonToiThieu || 10,
          nguongCanhBaoHSD: item.nguongCanhBaoHSD || 30
        }));
        setProducts(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadLots = async () => {
    try {
      const res = await fetch("/api/inventory/lots");
      if (res.ok) {
        const data = await res.json();
        setLots(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAudits = async () => {
    try {
      const res = await fetch("/api/inventory/audit");
      if (res.ok) {
        const data = await res.json();
        setAudits(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAlerts = async () => {
    try {
      const res = await fetch("/api/inventory/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/inventory/history");
      if (res.ok) {
        const data = await res.json();
        setHistoryLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 8000);
  };

  // Add item to active audit draft
  const handleAddAuditItem = () => {
    if (!auditAddProdId) return;
    const prod = products.find(p => p.id === Number(auditAddProdId));
    if (!prod) return;

    // Check if already in list
    if (auditDetails.some(d => d.hangHoaId === prod.id)) {
      showFeedback("error", "Sản phẩm này đã có trong danh sách kiểm kê!");
      return;
    }

    const actual = auditAddQty ? Number(auditAddQty) : prod.currentStock;
    if (actual < 0) {
      showFeedback("error", "Số lượng thực tế không được phép âm!");
      return;
    }

    setAuditDetails([...auditDetails, {
      hangHoaId: prod.id,
      tenHangHoa: prod.tenTrenBaoBi,
      maHangHoa: prod.maHangHoa,
      tonHeThong: prod.currentStock,
      tonThucTe: actual,
      chenhLech: actual - prod.currentStock
    }]);

    setAuditAddProdId("");
    setAuditAddQty("");
  };

  const handleRemoveAuditItem = (index: number) => {
    const updated = [...auditDetails];
    updated.splice(index, 1);
    setAuditDetails(updated);
  };

  const handleDraftAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditNguoiKiemKe.trim()) {
      showFeedback("error", "Vui lòng nhập tên người thực hiện kiểm kê!");
      return;
    }
    if (auditDetails.length === 0) {
      showFeedback("error", "Danh sách kiểm kê trống! Hãy thêm ít nhất 1 sản phẩm.");
      return;
    }

    try {
      const res = await fetch("/api/inventory/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nguoiKiemKe: auditNguoiKiemKe,
          ghiChu: auditGhiChu,
          chiTiet: auditDetails
        })
      });

      if (res.ok) {
        showFeedback("success", "Đã tạo phiếu kiểm kê ở dạng nháp thành công!");
        setIsCreatingAudit(false);
        setAuditNguoiKiemKe("");
        setAuditGhiChu("");
        setAuditDetails([]);
        loadAudits();
      } else {
        const errData = await res.json();
        showFeedback("error", errData.error || "Tạo phiếu kiểm kê thất bại.");
      }
    } catch (err) {
      showFeedback("error", "Lỗi kết nối máy chủ.");
    }
  };

  // Confirm and apply adjustment
  const handleConfirmAudit = async (auditId: number, forceConfirm = false) => {
    try {
      const res = await fetch(`/api/inventory/audit/${auditId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nguoiThucHien: operatorName,
          xacNhanLanHai: forceConfirm
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.needsSecondConfirmation) {
          setConfirmingAuditId(auditId);
          setSecondConfirmRequired(true);
          setSecondConfirmMsg(data.message);
        } else {
          showFeedback("success", `Đã xác nhận và điều chỉnh số lượng tồn kho thành công cho phiếu ${data.audit?.maPhieuKiemKe}!`);
          setSecondConfirmRequired(false);
          setConfirmingAuditId(null);
          loadAudits();
          loadProducts();
          loadLots();
          loadHistory();
          loadAlerts();
        }
      } else {
        showFeedback("error", data.error || "Xác nhận phiếu kiểm kê thất bại.");
      }
    } catch (err) {
      showFeedback("error", "Lỗi kết nối máy chủ.");
    }
  };

  const handleAcknowledgeAlert = async (alert: StockAlert, notes: string) => {
    try {
      const res = await fetch("/api/inventory/alerts/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hangHoaId: alert.hangHoaId,
          loaiCanhBao: alert.loaiCanhBao,
          maLo: alert.maLo,
          nguoiXacNhan: operatorName,
          ghiChu: notes || "Đã kiểm tra xử lý xong"
        })
      });

      if (res.ok) {
        showFeedback("success", `Đã ghi nhận cam kết xử lý cảnh báo thành công!`);
        loadAlerts();
      }
    } catch (e) {
      showFeedback("error", "Lỗi kết nối máy chủ.");
    }
  };

  const handleTraceBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!traceQuery.trim()) return;
    setTraceError("");
    setTraceResult(null);

    try {
      const res = await fetch(`/api/inventory/trace/${encodeURIComponent(traceQuery.trim())}?nguoiTruyVan=${encodeURIComponent(operatorName)}`);
      const data = await res.json();
      if (res.ok) {
        setTraceResult(data);
      } else {
        setTraceError(data.error || "Không tìm thấy thông tin lô hàng này.");
      }
    } catch (err) {
      setTraceError("Lỗi kết nối máy chủ.");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-6" id="inventory-audit-dashboard-container">
      {/* Tab Header with Badge counters */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
            <Layers className="text-[#166534] h-5 w-5 animate-pulse" /> Giám Sát Tồn Kho Theo Lô & Kiểm Lệch
          </h3>
          <p className="text-xs text-slate-500">
            Truy xuất nguồn gốc FEFO, quản lý kiểm kê độc lập, đối chiếu thông minh chống thất thoát.
          </p>
        </div>

        {/* Global Settings */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase">Người thao tác:</label>
          <input
            type="text"
            value={operatorName}
            onChange={e => setOperatorName(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white font-medium text-slate-900"
          />
        </div>
      </div>

      {/* Sub Tabs Toggle */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg max-w-2xl">
        <button
          onClick={() => { setActiveSubTab("audit"); setTraceResult(null); }}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === "audit" ? "bg-white text-[#166534] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          <ClipboardList className="h-3.5 w-3.5" /> Kiểm Kê Định Kỳ
        </button>
        <button
          onClick={() => { setActiveSubTab("lots"); setTraceResult(null); }}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === "lots" ? "bg-white text-[#166534] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          <Layers className="h-3.5 w-3.5" /> Quản Lý Lô (FEFO)
        </button>
        <button
          onClick={() => { setActiveSubTab("alerts"); setTraceResult(null); }}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === "alerts" ? "bg-white text-[#166534] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Cảnh Báo Tồn HSD {alerts.length > 0 && <span className="px-1.5 py-0.2 bg-red-500 text-white font-black text-[9px] rounded-full animate-bounce">{alerts.length}</span>}
        </button>
        <button
          onClick={() => { setActiveSubTab("trace"); }}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === "trace" ? "bg-white text-[#166534] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          <FileSearch className="h-3.5 w-3.5" /> Truy Xuất Trace
        </button>
        <button
          onClick={() => { setActiveSubTab("history"); setTraceResult(null); }}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeSubTab === "history" ? "bg-white text-[#166534] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
        >
          <History className="h-3.5 w-3.5" /> Nhật Ký Biến Động
        </button>
      </div>

      {/* Global Toast Feedback */}
      {feedback && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in ${feedback.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Second Confirmation Dialog (Manager Signed Override EX-06-042-001) */}
      {secondConfirmRequired && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">Ký xác nhận lần hai (Quản lý trưởng/Chủ đại lý)</h4>
              <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-line">{secondConfirmMsg}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-amber-200/50 flex items-center justify-end gap-3">
            <button
              onClick={() => { setSecondConfirmRequired(false); setConfirmingAuditId(null); }}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition cursor-pointer"
            >
              Hủy bỏ điều chỉnh
            </button>
            <button
              onClick={() => handleConfirmAudit(confirmingAuditId!, true)}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="h-3.5 w-3.5" /> Phê Duyệt & Cập Nhật Kho
            </button>
          </div>
        </div>
      )}

      {/* ======================= TAB 1: AUDIT SESSION (BR-06-042) ======================= */}
      {activeSubTab === "audit" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phiếu Kiểm Kê Tồn Kho Vật Tư</h4>
            {!isCreatingAudit ? (
              <button
                onClick={() => setIsCreatingAudit(true)}
                className="px-3.5 py-1.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded text-xs transition cursor-pointer"
              >
                + Bắt đầu phiên kiểm kê mới
              </button>
            ) : (
              <button
                onClick={() => { setIsCreatingAudit(false); setAuditDetails([]); }}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition cursor-pointer"
              >
                Hủy tạo phiếu
              </button>
            )}
          </div>

          {/* New count sheet form */}
          {isCreatingAudit && (
            <form onSubmit={handleDraftAuditSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                  📝 MỞ PHIẾU KIỂM KHO (DRAFT)
                </span>
                <span className="text-[10px] text-slate-400">Trạng thái: Nháp - Chưa điều chỉnh tồn kho</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Người kiểm đếm thực tế *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên người kiểm..."
                    value={auditNguoiKiemKe}
                    onChange={e => setAuditNguoiKiemKe(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#166534] text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Ghi chú kiểm kho</label>
                  <input
                    type="text"
                    placeholder="Kiểm kê đột xuất chống thất thoát..."
                    value={auditGhiChu}
                    onChange={e => setAuditGhiChu(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#166534] text-slate-900"
                  />
                </div>
              </div>

              {/* Add row controller */}
              <div className="bg-white border border-slate-200 rounded p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-6">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Chọn sản phẩm cần đếm</label>
                  <select
                    value={auditAddProdId}
                    onChange={e => setAuditAddProdId(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-[#166534]"
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.tenTrenBaoBi} (Hiện tại: {p.currentStock} {p.donViTinh})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Số đếm thực tế *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Đếm được..."
                    value={auditAddQty}
                    onChange={e => setAuditAddQty(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-[#166534]"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={handleAddAuditItem}
                    className="w-full py-1.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded text-xs transition cursor-pointer"
                  >
                    + Thêm vào phiếu
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded bg-white overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="p-2.5">Sản phẩm</th>
                      <th className="p-2.5 text-center">Tồn hệ thống</th>
                      <th className="p-2.5 text-center">Tồn thực tế</th>
                      <th className="p-2.5 text-center">Chênh lệch</th>
                      <th className="p-2.5 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditDetails.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 font-semibold italic">
                          Chưa có sản phẩm nào được thêm vào phiếu kiểm kê.
                        </td>
                      </tr>
                    ) : (
                      auditDetails.map((det, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 text-slate-700">
                          <td className="p-2.5">
                            <span className="font-bold text-slate-950 block">{det.tenHangHoa}</span>
                            <span className="text-[10px] text-slate-400">{det.maHangHoa}</span>
                          </td>
                          <td className="p-2.5 text-center font-medium">{det.tonHeThong}</td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min="0"
                              value={det.tonThucTe}
                              onChange={e => {
                                const newQty = Number(e.target.value);
                                const updated = [...auditDetails];
                                updated[idx].tonThucTe = newQty;
                                updated[idx].chenhLech = newQty - det.tonHeThong;
                                setAuditDetails(updated);
                              }}
                              className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs"
                            />
                          </td>
                          <td className={`p-2.5 text-center font-bold ${det.chenhLech === 0 ? 'text-slate-500' : det.chenhLech > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {det.chenhLech > 0 ? `+${det.chenhLech}` : det.chenhLech}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveAuditItem(idx)}
                              className="text-rose-500 hover:text-rose-700 font-black cursor-pointer"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-black rounded text-xs transition cursor-pointer"
                >
                  💾 Lưu Nháp Phiếu Kiểm Kho
                </button>
              </div>
            </form>
          )}

          {/* List of existing counts */}
          <div className="space-y-4">
            <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              📋 Danh sách lịch sử các đợt kiểm kê kho
            </h5>

            {audits.length === 0 ? (
              <div className="p-8 border border-slate-200 rounded-xl text-center text-slate-400 italic">
                Chưa có dữ liệu phiên kiểm kê kho nào được thực hiện.
              </div>
            ) : (
              audits.map(aud => (
                <div key={aud.id} className={`border rounded-xl p-4 space-y-3 ${aud.trangThai === 'DaXacNhan' ? 'bg-white border-slate-200' : 'bg-amber-50/40 border-amber-200'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-950 text-xs">{aud.maPhieuKiemKe}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${aud.trangThai === 'DaXacNhan' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {aud.trangThai === 'DaXacNhan' ? '✅ Đã hoàn tất điều chỉnh' : '⏳ Nháp - Chờ duyệt'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Ngày lập: {new Date(aud.ngayLap).toLocaleString('vi-VN')} | Người đếm: <span className="font-bold text-slate-700">{aud.nguoiKiemKe}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {aud.trangThai === "Draft" && (
                        <button
                          onClick={() => handleConfirmAudit(aud.id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs transition shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Duyệt & Khớp Tồn Kho
                        </button>
                      )}
                    </div>
                  </div>

                  {aud.ghiChu && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded italic">
                      💡 {aud.ghiChu}
                    </p>
                  )}

                  {/* Audit details sub-table */}
                  <div className="border border-slate-100 rounded overflow-hidden bg-white">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                          <th className="p-2">Sản phẩm</th>
                          <th className="p-2 text-center">Tồn hệ thống</th>
                          <th className="p-2 text-center">Tồn thực tế</th>
                          <th className="p-2 text-center">Chênh lệch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aud.chiTiet.map((det, idx) => (
                          <tr key={idx} className="border-b border-slate-100 text-slate-700">
                            <td className="p-2 font-bold">{det.tenHangHoa || `Sản phẩm ID ${det.hangHoaId}`}</td>
                            <td className="p-2 text-center">{det.tonHeThong}</td>
                            <td className="p-2 text-center font-medium">{det.tonThucTe}</td>
                            <td className={`p-2 text-center font-bold ${det.chenhLech === 0 ? 'text-slate-500' : det.chenhLech > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {det.chenhLech > 0 ? `+${det.chenhLech}` : det.chenhLech}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {aud.trangThai === "DaXacNhan" && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-end italic">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Xác nhận bởi {aud.nguoiThucHien} lúc {new Date(aud.thoiGianXacNhan || aud.ngayLap).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: MANAGING BATCHES (LOTS & FEFO - BR-06-040, BR-06-041) ======================= */}
      {activeSubTab === "lots" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh Sách Lô Hàng Thuốc & Phân Bón Trong Kho</h4>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-bold">
              🛡️ FEFO được tự động áp dụng khi lập hóa đơn bán lẻ
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-3">Thông tin Lô Hàng</th>
                  <th className="p-3">Sản phẩm</th>
                  <th className="p-3 text-center">Hạn Sử Dụng</th>
                  <th className="p-3 text-center">Tồn kho Lô</th>
                  <th className="p-3 text-center">Trạng thái HSD</th>
                  <th className="p-3 text-center">Trace</th>
                </tr>
              </thead>
              <tbody>
                {lots.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 italic font-semibold">
                      Chưa có lô hàng nào được lưu vết trong hệ thống.
                    </td>
                  </tr>
                ) : (
                  lots.map(lot => {
                    const todayMs = Date.now();
                    const expMs = new Date(lot.hanSuDung).getTime();
                    const daysLeft = Math.ceil((expMs - todayMs) / (24 * 60 * 60 * 1000));
                    
                    let hsdStatus = "🟢 Còn hạn";
                    let hsdClass = "bg-emerald-100 text-emerald-800";
                    if (daysLeft < 0) {
                      hsdStatus = "⚫ Đã hết hạn";
                      hsdClass = "bg-rose-100 text-rose-800 animate-pulse";
                    } else if (daysLeft <= 30) {
                      hsdStatus = `🟠 Sắp hết hạn (${daysLeft} ngày)`;
                      hsdClass = "bg-amber-100 text-amber-800";
                    }

                    return (
                      <tr key={lot.id} className="border-b border-slate-100 hover:bg-slate-50 text-slate-700">
                        <td className="p-3">
                          <span className="font-extrabold text-slate-950 block">{lot.maLo}</span>
                          <span className="text-[10px] text-slate-400 block">NSX: {lot.ngaySanXuat}</span>
                          <span className="text-[10px] text-slate-400 block">NCC: {lot.tenNhaCungCap || 'Không có'}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{lot.tenHangHoa}</span>
                          <span className="text-[10px] text-slate-400 block">{lot.maHangHoa} | Giá: {lot.giaNhap.toLocaleString()}đ</span>
                        </td>
                        <td className="p-3 text-center font-medium text-slate-600">{lot.hanSuDung}</td>
                        <td className="p-3 text-center">
                          <span className="font-bold text-slate-950 block">{lot.soLuongTon}</span>
                          <span className="text-[10px] text-slate-400 block">/ Nhập {lot.soLuongNhap}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${hsdClass}`}>
                            {hsdStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setTraceQuery(lot.maLo);
                              setActiveSubTab("trace");
                            }}
                            className="text-[#166534] hover:text-[#14532d] hover:underline font-extrabold cursor-pointer"
                          >
                            🔎 Truy xuất
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
      )}

      {/* ======================= TAB 3: ALERTS FOR HSD & QUANTITY (BR-06-044) ======================= */}
      {activeSubTab === "alerts" && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cảnh Báo Tự Động Từ Hệ Thống Kho</h4>

          {alerts.length === 0 ? (
            <div className="p-8 border border-emerald-200 bg-emerald-50/40 rounded-xl text-center text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Tuyệt vời! Không có cảnh báo tồn kho hoặc hết hạn sử dụng nào được ghi nhận.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert, idx) => {
                let cardClass = "border-slate-200 bg-white";
                let badgeClass = "bg-slate-100 text-slate-800";
                
                if (alert.mucDo === "NghiemTrong") {
                  cardClass = "border-rose-200 bg-rose-50/30";
                  badgeClass = "bg-rose-100 text-rose-800 font-extrabold";
                } else if (alert.mucDo === "Cao") {
                  cardClass = "border-amber-200 bg-amber-50/20";
                  badgeClass = "bg-amber-100 text-amber-800 font-bold";
                }

                return (
                  <div key={idx} className={`border rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm ${cardClass}`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {alert.loaiCanhBao === 'HetHang' || alert.loaiCanhBao === 'SapHetHang' ? '📦 TỒN KHO' : '📅 HẠN SỬ DỤNG'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${badgeClass}`}>
                          {alert.badge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-bold text-slate-900 text-xs">{alert.tenHangHoa}</h5>
                        <p className="text-xs text-slate-600">{alert.thongTinCanhBao}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          const note = prompt("Nhập cam kết / ghi chú xử lý cảnh báo này:");
                          if (note !== null) {
                            handleAcknowledgeAlert(alert, note);
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] transition cursor-pointer"
                      >
                        🔏 Xác nhận đã biết & Ghi log
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 4: TRACEABILITY GENEALOGY (BR-06-045) ======================= */}
      {activeSubTab === "trace" && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Truy Xuất Nguồn Gốc Lô Hàng Chống Thuốc Giả / Lỗi Nhà Sản Xuất</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nhập mã Lô (Lot code) để hệ thống bóc tách vòng đời ngược chiều (Nhà cung cấp, ngày nhập, hóa đơn sỉ) và xuôi chiều (Hóa đơn bán lẻ cho từng nông dân, đợt hiệu chỉnh tồn).
            </p>
          </div>

          <form onSubmit={handleTraceBatch} className="bg-slate-50 p-4 border border-slate-200 rounded-xl flex flex-wrap gap-2.5 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mã Lô hàng cần truy vết</label>
              <input
                type="text"
                placeholder="vd: ANVIL-L01"
                value={traceQuery}
                onChange={e => setTraceQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#166534] text-slate-900 font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#166534] hover:bg-[#14532d] text-white font-bold rounded text-xs transition shadow-sm cursor-pointer"
            >
              🚀 Bắt đầu truy xuất
            </button>
          </form>

          {traceError && (
            <div className="p-4 border border-rose-200 bg-rose-50 text-rose-800 rounded-lg text-xs font-semibold">
              ⚠️ {traceError}
            </div>
          )}

          {traceResult && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block">Mã truy xuất kết quả</span>
                  <span className="text-sm font-black text-slate-950">{traceResult.backward.maLo}</span>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-medium">
                  Log ID: #{traceResult.traceLogId} | Thời gian: {new Date(traceResult.traceTime).toLocaleString('vi-VN')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* BACKWARD (Nguồn gốc nhập sỉ) */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-sm">
                  <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[9px] uppercase rounded">Nguồn gốc</span>
                    <h5 className="font-bold text-slate-900 text-xs">TRUY NGƯỢC NGUỒN GỐC (BACKWARD)</h5>
                  </div>

                  <div className="space-y-3.5 text-xs text-slate-700">
                    <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium">Sản phẩm:</span>
                      <span className="col-span-2 font-bold text-slate-900">{traceResult.backward.sanPham?.ten}</span>
                    </div>

                    <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium">Nhà cung cấp sỉ:</span>
                      <span className="col-span-2 font-bold text-slate-900">
                        {traceResult.backward.nhaCungCap?.ten} ({traceResult.backward.nhaCungCap?.sdt})
                      </span>
                    </div>

                    <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium">Phiếu nhập sỉ:</span>
                      <span className="col-span-2 text-slate-900">
                        {traceResult.backward.phieuNhap ? (
                          <>
                            Mã <span className="font-extrabold text-blue-700">{traceResult.backward.phieuNhap.ma}</span> ngày {new Date(traceResult.backward.phieuNhap.ngay).toLocaleDateString('vi-VN')} tại <span className="font-semibold">{traceResult.backward.phieuNhap.kho}</span> (Lập bởi {traceResult.backward.phieuNhap.nguoiLap})
                          </>
                        ) : 'Lô tồn ban đầu chưa khai chứng từ hoặc kiểm định'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium">Số lượng ban đầu:</span>
                      <span className="col-span-2 font-bold text-slate-900">{traceResult.backward.originalQuantity} đơn vị</span>
                    </div>

                    <div className="grid grid-cols-3 pb-1">
                      <span className="text-slate-400 font-medium">Tồn khả dụng Lô:</span>
                      <span className="col-span-2 font-black text-emerald-700 text-sm">{traceResult.backward.remainingQuantity} đơn vị</span>
                    </div>
                  </div>
                </div>

                {/* FORWARD (Nhật ký bán và hao hụt) */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-sm">
                  <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-extrabold text-[9px] uppercase rounded">Vòng đời</span>
                    <h5 className="font-bold text-slate-900 text-xs">TRUY XUÔI TIÊU THỤ & BIẾN ĐỘNG (FORWARD)</h5>
                  </div>

                  <div className="space-y-4">
                    {/* Sales consumption */}
                    <div className="space-y-2">
                      <h6 className="text-[10px] font-black text-purple-800 uppercase tracking-wider">🛒 Nông dân mua sắm lẻ:</h6>
                      {traceResult.forward.sales.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Chưa phát sinh giao dịch bán lẻ nào cho lô hàng này.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {traceResult.forward.sales.map((sale, i) => (
                            <div key={i} className="bg-slate-50 p-2 border border-slate-100 rounded text-[11px] text-slate-700 flex justify-between gap-2 items-center">
                              <div>
                                Giao dịch <span className="font-bold text-slate-950">{sale.chungTu}</span> lúc {new Date(sale.thoiGian).toLocaleString('vi-VN')}
                              </div>
                              <span className="font-black text-rose-600 shrink-0">-{sale.soLuongGiam}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Adjustments */}
                    <div className="space-y-2">
                      <h6 className="text-[10px] font-black text-amber-800 uppercase tracking-wider">⚖️ Điều chỉnh chênh lệch kiểm kê:</h6>
                      {traceResult.forward.adjustments.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Chưa có điều chỉnh chênh lệch kiểm kê nào.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {traceResult.forward.adjustments.map((adj, i) => (
                            <div key={i} className="bg-amber-50/30 p-2 border border-amber-100 rounded text-[11px] text-slate-700 flex justify-between gap-2 items-center">
                              <div className="space-y-0.5">
                                <div>Phiếu <span className="font-bold">{adj.chungTu}</span> ({adj.nguoiThucHien})</div>
                                <div className="text-[10px] text-slate-400 italic">{adj.ghiChu}</div>
                              </div>
                              <span className={`font-black shrink-0 ${adj.delta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {adj.delta > 0 ? `+${adj.delta}` : adj.delta}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 5: APPEND-ONLY STOCK TRANSACTION LOGS (BR-06-043) ======================= */}
      {activeSubTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sổ Nhật Ký Append-Only Biến Động Tồn Kho</h4>
            <span className="text-[11px] text-slate-400 font-medium">Bảo chứng kiểm toán - Không cho phép sửa đổi trực tiếp</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold sticky top-0 z-10">
                    <th className="p-3">Thời gian phát sinh</th>
                    <th className="p-3">Mặt hàng vật tư</th>
                    <th className="p-3 text-center">Giao dịch</th>
                    <th className="p-3 text-center">Tồn trước</th>
                    <th className="p-3 text-center">Số thay đổi</th>
                    <th className="p-3 text-center">Tồn sau</th>
                    <th className="p-3">Ghi chú kiểm toán</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic font-semibold">
                        Sổ nhật ký biến động tồn kho chưa ghi nhận giao dịch nào.
                      </td>
                    </tr>
                  ) : (
                    historyLogs.map(log => {
                      let typeBadge = "Nhập sỉ";
                      let badgeClass = "bg-blue-50 text-blue-800 border border-blue-200";

                      if (log.loaiGiaoDich === "BanHang") {
                        typeBadge = "Bán lẻ";
                        badgeClass = "bg-rose-50 text-rose-800 border border-rose-200";
                      } else if (log.loaiGiaoDich === "KiemKe" || log.loaiGiaoDich === "KiemKho") {
                        typeBadge = "Kiểm lệch";
                        badgeClass = "bg-amber-50 text-amber-900 border border-amber-200";
                      }

                      return (
                        <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 text-slate-700">
                          <td className="p-3 text-slate-500 font-medium">
                            {new Date(log.ngayPhatSinh).toLocaleString('vi-VN')}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{log.tenHangHoa}</span>
                            <span className="text-[10px] text-slate-400 block">{log.maHangHoa}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                              {typeBadge}
                            </span>
                          </td>
                          <td className="p-3 text-center text-slate-500 font-medium">
                            {log.khoTruoc !== undefined ? log.khoTruoc : 'N/A'}
                          </td>
                          <td className={`p-3 text-center font-black ${log.soLuongThayDoi > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {log.soLuongThayDoi > 0 ? `+${log.soLuongThayDoi}` : log.soLuongThayDoi}
                          </td>
                          <td className="p-3 text-center text-slate-900 font-bold">
                            {log.khoSau !== undefined ? log.khoSau : 'N/A'}
                          </td>
                          <td className="p-3 text-slate-600">
                            <p className="font-medium text-[11px]">{log.ghiChu}</p>
                            <p className="text-[9px] text-slate-400 block italic">
                              Chứng từ: {log.thamChieuId} | IP: {log.ip} | Operator: {log.nguoiThucHien}
                            </p>
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
  );
}
