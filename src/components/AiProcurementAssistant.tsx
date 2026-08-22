import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Calendar, 
  History, 
  CheckCircle2, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info, 
  Search, 
  RefreshCw, 
  PlusCircle, 
  HelpCircle, 
  Send, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Boxes, 
  Package, 
  AlertCircle,
  Eye,
  Check
} from "lucide-react";

interface AiProcurementAssistantProps {
  onApplyToImport?: (data: { hangHoaId?: number; nhaCungCapId?: number; soLuong?: number; donGia?: number }) => void;
}

export default function AiProcurementAssistant({ onApplyToImport }: AiProcurementAssistantProps) {
  // Main sub-tabs
  const [activeSection, setActiveSection] = useState<
    "stock-status" | "alerts" | "quantity-suggest" | "price-check" | "suppliers" | "seasonal" | "qa-expert" | "audit-logs"
  >("stock-status");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // BR-06-046: Stock Status
  const [stockStatusData, setStockStatusData] = useState<any>(null);
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [stockSearch, setStockSearch] = useState<string>("");

  // BR-06-047: Alerts
  const [alertsData, setAlertsData] = useState<any>(null);
  const [alertFilter, setAlertFilter] = useState<string>("all");
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  // BR-06-048: Quantity Suggestion
  const [selectedProductForQuantity, setSelectedProductForQuantity] = useState<string>("");
  const [targetDays, setTargetDays] = useState<number>(21);
  const [quantityResult, setQuantityResult] = useState<any>(null);
  const [loadingQuantity, setLoadingQuantity] = useState(false);

  // BR-06-049: Price Analysis
  const [priceCheckProduct, setPriceCheckProduct] = useState<string>("");
  const [priceCheckValue, setPriceCheckValue] = useState<string>("");
  const [priceAnalysisResult, setPriceAnalysisResult] = useState<any>(null);
  const [loadingPriceCheck, setLoadingPriceCheck] = useState(false);

  // BR-06-050: Supplier Recommendation
  const [supplierRecommendResult, setSupplierRecommendResult] = useState<any>(null);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // BR-06-051: Seasonal Trends
  const [seasonalData, setSeasonalData] = useState<any>(null);

  // BR-06-052: Q&A Expert & Audit Logs
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [aiAnswers, setAiAnswers] = useState<any[]>([]);
  const [askingExpert, setAskingExpert] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Stock status
      const resStock = await fetch("/api/ai/procurement/stock-status");
      if (resStock.ok) {
        const data = await resStock.json();
        setStockStatusData(data);
        if (data.danhSach && data.danhSach.length > 0 && !selectedProductForQuantity) {
          setSelectedProductForQuantity(data.danhSach[0].hangHoaId.toString());
          setPriceCheckProduct(data.danhSach[0].hangHoaId.toString());
        }
      }

      // 2. Alerts
      const resAlerts = await fetch("/api/ai/procurement/alerts");
      if (resAlerts.ok) {
        const data = await resAlerts.json();
        setAlertsData(data);
      }

      // 3. Seasonal trends
      const resSeasonal = await fetch("/api/ai/procurement/seasonal-trends");
      if (resSeasonal.ok) {
        const data = await resSeasonal.json();
        setSeasonalData(data);
      }

      // 4. Initial supplier recommendation for top low stock items
      fetchSupplierRecommendations();
    } catch (err) {
      console.error("Lỗi tải dữ liệu AI:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Supplier Recommendations (BR-06-050)
  const fetchSupplierRecommendations = async (customItems?: any[]) => {
    setLoadingSuppliers(true);
    try {
      let itemsToEvaluate = customItems;
      if (!itemsToEvaluate && stockStatusData?.danhSach) {
        const lowItems = stockStatusData.danhSach.filter(
          (item: any) => item.trangThaiTonKho === "HetHang" || item.trangThaiTonKho === "ConIt"
        );
        itemsToEvaluate = (lowItems.length > 0 ? lowItems : stockStatusData.danhSach.slice(0, 3)).map((item: any) => ({
          hangHoaId: item.hangHoaId,
          soLuong: item.soLuongGoiY > 0 ? item.soLuongGoiY : 20
        }));
      }

      if (!itemsToEvaluate || itemsToEvaluate.length === 0) {
        itemsToEvaluate = [{ hangHoaId: 1, soLuong: 20 }];
      }

      const res = await fetch("/api/ai/procurement/recommend-suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToEvaluate })
      });
      if (res.ok) {
        const data = await res.json();
        setSupplierRecommendResult(data);
      }
    } catch (err) {
      console.error("Lỗi gợi ý nhà cung cấp:", err);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Run Quantity Suggestion (BR-06-048)
  const handleCalculateQuantity = async (productId?: string, days?: number) => {
    const id = productId || selectedProductForQuantity;
    if (!id) return;
    setLoadingQuantity(true);
    try {
      const res = await fetch("/api/ai/procurement/recommend-quantity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hangHoaId: Number(id), targetDays: days || targetDays })
      });
      if (res.ok) {
        const data = await res.json();
        setQuantityResult(data);
      }
    } catch (err) {
      console.error("Lỗi gợi ý số lượng:", err);
    } finally {
      setLoadingQuantity(false);
    }
  };

  // Run Price Check (BR-06-049)
  const handleAnalyzePrice = async () => {
    if (!priceCheckProduct || !priceCheckValue) {
      showToast("Vui lòng nhập giá nhập mới để AI phân tích.");
      return;
    }
    setLoadingPriceCheck(true);
    try {
      const res = await fetch("/api/ai/procurement/analyze-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hangHoaId: Number(priceCheckProduct),
          giaNhapMoi: Number(priceCheckValue)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPriceAnalysisResult(data);
      }
    } catch (err) {
      console.error("Lỗi phân tích giá:", err);
    } finally {
      setLoadingPriceCheck(false);
    }
  };

  // Acknowledge Alert (BR-06-047)
  const handleAcknowledgeAlert = async (alertId: string) => {
    setAcknowledgingId(alertId);
    try {
      const res = await fetch("/api/ai/procurement/alerts/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, nguoiXacNhan: "Chủ cửa hàng Hải Đăng" })
      });
      if (res.ok) {
        showToast("Đã xác nhận cảnh báo.");
        // Update local alerts
        setAlertsData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            chuaXacNhan: Math.max(0, prev.chuaXacNhan - 1),
            danhSach: prev.danhSach.map((a: any) =>
              a.id === alertId ? { ...a, daXacNhan: true, nguoiXacNhan: "Chủ cửa hàng Hải Đăng", thoiGianXacNhan: new Date().toISOString() } : a
            )
          };
        });
      }
    } catch (err) {
      console.error("Lỗi xác nhận cảnh báo:", err);
    } finally {
      setAcknowledgingId(null);
    }
  };

  // Ask AI Expert (BR-06-052)
  const handleAskExpert = async (customQuery?: string) => {
    const q = customQuery || userQuestion;
    if (!q.trim()) return;
    setAskingExpert(true);
    const newMsg = { query: q, time: new Date().toLocaleTimeString("vi-VN"), loading: true };
    setAiAnswers(prev => [newMsg, ...prev]);
    setUserQuestion("");

    try {
      const res = await fetch("/api/ai/procurement/ask-expert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnswers(prev =>
          prev.map((item, idx) =>
            idx === 0 ? { ...item, answer: data.cauTraLoi, loading: false, doTinCay: data.doTinCay } : item
          )
        );
      }
    } catch (err) {
      console.error("Lỗi hỏi AI:", err);
      setAiAnswers(prev =>
        prev.map((item, idx) =>
          idx === 0 ? { ...item, answer: "Xin lỗi, không thể kết nối tới trợ lý AI lúc này.", loading: false } : item
        )
      );
    } finally {
      setAskingExpert(false);
    }
  };

  // Fetch Audit Logs (BR-06-052)
  const fetchAuditLogs = async () => {
    setLoadingAuditLogs(true);
    try {
      const res = await fetch("/api/ai/procurement/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error("Lỗi tải nhật ký AI:", err);
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  // Apply AI Suggestion to Import Voucher
  const handleApplyToImport = (params: { hangHoaId?: number; nhaCungCapId?: number; soLuong?: number; donGia?: number; moTa?: string }) => {
    // Log user action (BR-06-052)
    fetch("/api/ai/procurement/log-user-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loaiHanhDong: "TaoPhieuNhapTuGoiY",
        chiTiet: params.moTa || `Người dùng áp dụng gợi ý: Sản phẩm #${params.hangHoaId}, Số lượng: ${params.soLuong}`,
        hangHoaId: params.hangHoaId,
        nhaCungCapId: params.nhaCungCapId,
        nguoiThucHien: "Chủ cửa hàng Hải Đăng"
      })
    }).catch(e => console.error("Lỗi log user action:", e));

    if (onApplyToImport) {
      onApplyToImport(params);
      showToast("Đã chuyển thông tin vào biểu mẫu Nhập sỉ đại lý!");
    } else {
      showToast("Vui lòng chuyển qua tab 'Nhập Sỉ Đại Lý' để tạo đơn nhập hàng.");
    }
  };

  // Filtered Stock Status List
  const filteredStockList = (stockStatusData?.danhSach || []).filter((item: any) => {
    const matchSearch =
      item.tenHangHoa.toLowerCase().includes(stockSearch.toLowerCase()) ||
      item.maHangHoa.toLowerCase().includes(stockSearch.toLowerCase());
    if (!matchSearch) return false;
    if (stockFilter === "all") return true;
    if (stockFilter === "low") return item.trangThaiTonKho === "ConIt" || item.trangThaiTonKho === "HetHang";
    if (stockFilter === "expiring") return item.trangThaiTonKho === "SapHetHan" || item.trangThaiTonKho === "DaHetHan";
    if (stockFilter === "slow") return item.trangThaiTonKho === "BanChamTonNhieu";
    return true;
  });

  // Filtered Alerts List
  const filteredAlertsList = (alertsData?.danhSach || []).filter((item: any) => {
    if (alertFilter === "all") return true;
    if (alertFilter === "unacknowledged") return !item.daXacNhan;
    if (alertFilter === "high") return item.mucDo === "CanhBaoCao";
    if (alertFilter === "stock") return item.loaiCanhBao === "SapHetHang" || item.loaiCanhBao === "HetHang";
    if (alertFilter === "expiry") return item.loaiCanhBao === "SapHetHan" || item.loaiCanhBao === "DaHetHan";
    if (alertFilter === "price") return item.loaiCanhBao === "GiaNhapBatThuong";
    return true;
  });

  return (
    <div className="space-y-6" id="ai-procurement-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner - Sophisticated Neutral & Emerald */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#166534] flex items-center justify-center font-bold">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Trợ Lý AI & Cảnh Báo Quyết Định Nhập Hàng
              </h2>
              <span className="px-2 py-0.5 bg-emerald-50 text-[#166534] border border-emerald-200 text-[11px] font-bold rounded-full">
                Hỗ trợ ra quyết định
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              AI đóng vai trò trợ lý tham khảo giúp phân tích tồn kho thực tế, cảnh báo hàng sắp hết hoặc sắp hết hạn, gợi ý số lượng nhập và nhà cung cấp phù hợp. Quyết định cuối cùng luôn thuộc về bạn.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchData();
              }}
              disabled={refreshing}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              id="btn-refresh-ai-procurement"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Cập nhật số liệu</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
            <span className="text-[11px] font-bold text-slate-500 block">Sắp hết hàng / Hết hàng</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-red-600">
                {(stockStatusData?.danhSach || []).filter((i: any) => i.trangThaiTonKho === 'HetHang' || i.trangThaiTonKho === 'ConIt').length}
              </span>
              <span className="text-[11px] text-slate-400">mặt hàng</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
            <span className="text-[11px] font-bold text-slate-500 block">Sắp hết hạn sử dụng</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-amber-600">
                {(stockStatusData?.danhSach || []).filter((i: any) => i.trangThaiTonKho === 'SapHetHan' || i.trangThaiTonKho === 'DaHetHan').length}
              </span>
              <span className="text-[11px] text-slate-400">lô hàng</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
            <span className="text-[11px] font-bold text-slate-500 block">Cảnh báo chưa xử lý</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-purple-600">
                {alertsData?.chuaXacNhan || 0}
              </span>
              <span className="text-[11px] text-slate-400">cần chú ý</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
            <span className="text-[11px] font-bold text-slate-500 block">Dự đoán mùa vụ sắp tới</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-[#166534]">
                {seasonalData?.duDoanMuaVu?.length || 0}
              </span>
              <span className="text-[11px] text-slate-400">gợi ý xu hướng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs - Strict PATCH-003 Everyday Language */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm flex flex-wrap gap-1" id="ai-subtabs">
        <button
          onClick={() => setActiveSection("stock-status")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeSection === "stock-status"
              ? "bg-[#166534] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Boxes className="h-3.5 w-3.5" />
          <span>Tình hình hàng trong kho</span>
        </button>

        <button
          onClick={() => setActiveSection("alerts")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeSection === "alerts"
              ? "bg-[#166534] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Cảnh báo cần chú ý</span>
          {alertsData?.chuaXacNhan > 0 && (
            <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-extrabold rounded-full">
              {alertsData.chuaXacNhan}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveSection("quantity-suggest");
            if (!quantityResult && selectedProductForQuantity) {
              handleCalculateQuantity(selectedProductForQuantity);
            }
          }}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeSection === "quantity-suggest"
              ? "bg-[#166534] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Nên nhập thêm</span>
        </button>

        <button
          onClick={() => setActiveSection("price-check")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeSection === "price-check"
              ? "bg-[#166534] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>Giá nhập cần kiểm tra</span>
        </button>

        <button
          onClick={() => {
            setActiveSection("suppliers");
            if (!supplierRecommendResult) fetchSupplierRecommendations();
          }}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeSection === "suppliers"
              ? "bg-[#166534] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Đại lý phù hợp</span>
        </button>

        <button
          onClick={() => setActiveSection("seasonal")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeSection === "seasonal"
              ? "bg-[#166534] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Dự đoán nhu cầu</span>
        </button>

        <button
          onClick={() => setActiveSection("qa-expert")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeSection === "qa-expert"
              ? "bg-[#166534] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Hỏi đáp AI</span>
        </button>

        <button
          onClick={() => {
            setActiveSection("audit-logs");
            fetchAuditLogs();
          }}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeSection === "audit-logs"
              ? "bg-[#166534] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Lịch sử AI</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 1: TÌNH HÌNH HÀNG TRONG KHO (BR-06-046) */}
      {/* ---------------------------------------------------- */}
      {activeSection === "stock-status" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Boxes className="h-4 w-4 text-[#166534]" /> Tình Hình Hàng Trong Kho
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AI tổng hợp tồn kho thực tế, tốc độ bán ra và số ngày dự kiến bán hết dựa trên các hóa đơn đã xuất.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên vật tư..."
                  value={stockSearch}
                  onChange={e => setStockSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-44 focus:outline-none focus:border-[#166534]"
                />
              </div>

              <select
                value={stockFilter}
                onChange={e => setStockFilter(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="low">Sắp hết / Hết hàng</option>
                <option value="expiring">Sắp hết hạn sử dụng</option>
                <option value="slow">Bán chậm tồn nhiều</option>
              </select>
            </div>
          </div>

          {/* Table of Product Status */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                  <th className="py-3 px-3">Mã & Tên Sản Phẩm</th>
                  <th className="py-3 px-3 text-center">Tồn Kho</th>
                  <th className="py-3 px-3 text-center">Tốc Độ Bán</th>
                  <th className="py-3 px-3 text-center">Số Ngày Bán Còn Lại</th>
                  <th className="py-3 px-3">Hạn Dùng Lô Gần Nhất</th>
                  <th className="py-3 px-3">AI Đánh Giá</th>
                  <th className="py-3 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStockList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Chưa đủ dữ liệu hoặc không có sản phẩm nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredStockList.map((item: any) => {
                    const isLow = item.trangThaiTonKho === "ConIt" || item.trangThaiTonKho === "HetHang";
                    const isExp = item.trangThaiTonKho === "SapHetHan" || item.trangThaiTonKho === "DaHetHan";

                    return (
                      <tr key={item.hangHoaId} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{item.tenHangHoa}</div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>{item.maHangHoa}</span>
                            <span>•</span>
                            <span>{item.quyCach || item.donViTinh}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold ${
                            item.tonKho <= 0
                              ? 'bg-red-100 text-red-700'
                              : item.tonKho <= item.tonToiThieu
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}>
                            {item.tonKho}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Min: {item.tonToiThieu}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center font-medium text-slate-700">
                          <div>{item.tocDoBanNgay} / ngày</div>
                          <div className="text-[10px] text-slate-400">({item.tongBan30Ngay} đã bán 30n)</div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {item.soNgayBanUocTinh === 999 ? (
                            <span className="text-slate-400">Không có lượt bán</span>
                          ) : (
                            <span className={`font-bold ${item.soNgayBanUocTinh <= 7 ? 'text-red-600' : 'text-slate-700'}`}>
                              ~{item.soNgayBanUocTinh} ngày
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {item.loGanNhat ? (
                            <div>
                              <div className="font-mono text-[11px] font-bold text-slate-700">
                                Lô {item.loGanNhat.maLo}
                              </div>
                              <div className={`text-[10px] ${
                                item.loGanNhat.soNgayConHan <= 0
                                  ? 'text-red-600 font-bold'
                                  : item.loGanNhat.soNgayConHan <= item.nguongCanhBaoHSD
                                  ? 'text-amber-600 font-semibold'
                                  : 'text-slate-400'
                              }`}>
                                {item.loGanNhat.soNgayConHan <= 0
                                  ? 'Đã hết hạn'
                                  : `Còn ${item.loGanNhat.soNgayConHan} ngày (${item.loGanNhat.hanSuDung})`}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Chưa gắn lô</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className={`text-[11px] font-semibold block ${
                            isLow ? 'text-red-700' : isExp ? 'text-amber-800' : 'text-slate-700'
                          }`}>
                            {item.moTaDanDan}
                          </span>
                          {item.canhBaoBatThuong && (
                            <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                              ⚠️ {item.canhBaoBatThuong}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedProductForQuantity(item.hangHoaId.toString());
                              handleCalculateQuantity(item.hangHoaId.toString());
                              setActiveSection("quantity-suggest");
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#166534] border border-emerald-200 text-[11px] font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>AI gợi ý nhập</span>
                            <ChevronRight className="h-3 w-3" />
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

      {/* ---------------------------------------------------- */}
      {/* SECTION 2: CẢNH BÁO CẦN CHÚ Ý (BR-06-047) */}
      {/* ---------------------------------------------------- */}
      {activeSection === "alerts" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Cảnh Báo Hàng Cần Chú Ý
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các cảnh báo tự động phát hiện hàng sắp hết, hết hạn, hoặc giá nhập có chênh lệch bất thường.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={alertFilter}
                onChange={e => setAlertFilter(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">Tất cả cảnh báo ({alertsData?.tongSoCanhBao || 0})</option>
                <option value="unacknowledged">Chưa xác nhận ({alertsData?.chuaXacNhan || 0})</option>
                <option value="high">Mức độ cao</option>
                <option value="stock">Sắp hết / Hết hàng</option>
                <option value="expiry">Hạn dùng</option>
                <option value="price">Giá nhập bất thường</option>
              </select>
            </div>
          </div>

          {/* Alert Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlertsList.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Hiện không có cảnh báo nào cần xử lý</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tất cả hàng hóa và giá nhập đều trong ngưỡng an toàn.</p>
              </div>
            ) : (
              filteredAlertsList.map((alert: any) => {
                const isHigh = alert.mucDo === "CanhBaoCao";

                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl p-4 border transition ${
                      alert.daXacNhan
                        ? "bg-slate-50/70 border-slate-200 opacity-75"
                        : isHigh
                        ? "bg-red-50/40 border-red-200 shadow-sm"
                        : "bg-amber-50/40 border-amber-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${
                            isHigh ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {alert.tieuDeDanDan}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {alert.tenHangHoa}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                          {alert.lyDo}
                        </p>
                        <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-2">
                          <span>{alert.duLieuThamKhao}</span>
                          <span>•</span>
                          <span>{alert.thoiGianPhatHien ? new Date(alert.thoiGianPhatHien).toLocaleDateString('vi-VN') : ''}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {alert.daXacNhan ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            <Check className="h-3 w-3 text-emerald-600" /> Đã xem
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            disabled={acknowledgingId === alert.id}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-bold rounded-lg transition shadow-xs cursor-pointer"
                          >
                            {acknowledgingId === alert.id ? "Đang lưu..." : "Xác nhận đã xem"}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            handleApplyToImport({
                              hangHoaId: alert.hangHoaId,
                              soLuong: 20,
                              moTa: `Nhập bổ sung theo cảnh báo: ${alert.tieuDeDanDan} (${alert.tenHangHoa})`
                            });
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition shadow-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="h-3 w-3" />
                          <span>Lập phiếu nhập</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SECTION 3: GỢI Ý SỐ LƯỢNG NÊN NHẬP (BR-06-048) */}
      {/* ---------------------------------------------------- */}
      {activeSection === "quantity-suggest" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#166534]" /> AI Gợi Ý Số Lượng Nhập Thêm
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tính toán số lượng tối ưu dựa trên tốc độ tiêu thụ hàng ngày và thời gian giao hàng của nhà cung cấp.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Chọn sản phẩm cần tính toán:
                </label>
                <select
                  value={selectedProductForQuantity}
                  onChange={e => {
                    setSelectedProductForQuantity(e.target.value);
                    handleCalculateQuantity(e.target.value);
                  }}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#166534]"
                >
                  {(stockStatusData?.danhSach || []).map((prod: any) => (
                    <option key={prod.hangHoaId} value={prod.hangHoaId}>
                      {prod.tenHangHoa} ({prod.quyCach || prod.donViTinh}) - Tồn: {prod.tonKho}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Thời gian dự kiến bán hết (ngày):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[14, 21, 30].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        setTargetDays(days);
                        handleCalculateQuantity(selectedProductForQuantity, days);
                      }}
                      className={`py-2 text-center text-xs font-bold rounded-xl border transition cursor-pointer ${
                        targetDays === days
                          ? "bg-emerald-50 text-[#166534] border-emerald-300 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {days} ngày ({days === 14 ? '2 tuần' : days === 21 ? '3 tuần' : '1 tháng'})
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCalculateQuantity()}
                disabled={loadingQuantity}
                className="w-full py-2.5 bg-[#166534] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{loadingQuantity ? "AI đang tính toán..." : "Tính toán số lượng nhập"}</span>
              </button>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            {quantityResult ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                  <div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-[#166534] border border-emerald-200 text-[10px] font-extrabold rounded-full uppercase">
                      Kết quả AI gợi ý
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">
                      {quantityResult.tenHangHoa}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Mức độ tin cậy</span>
                    <span className="text-xs font-bold text-emerald-700">{quantityResult.doTinCay}</span>
                  </div>
                </div>

                {/* Primary Recommendation Headline */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                  <span className="text-[11px] font-bold text-[#166534] uppercase block">
                    Khuyến nghị số lượng:
                  </span>
                  <div className="text-lg font-black text-[#166534] mt-0.5">
                    {quantityResult.thongDiepDanDan}
                  </div>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    👉 <strong>Vì sao AI gợi ý?</strong> {quantityResult.lyDoGiaiThich}
                  </p>
                </div>

                {/* Supporting Facts */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block font-bold">Tồn hiện tại</span>
                    <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
                      {quantityResult.tonKhoHienTai}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block font-bold">Đã bán 30 ngày qua</span>
                    <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
                      {quantityResult.daBan30NgayQua}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block font-bold">Tốc độ tiêu thụ</span>
                    <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
                      {quantityResult.tocDoBanNgay}/ngày
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      handleApplyToImport({
                        hangHoaId: quantityResult.hangHoaId,
                        soLuong: quantityResult.soLuongDeXuat,
                        moTa: `Nhập hàng theo AI gợi ý: ${quantityResult.tenHangHoa} (${quantityResult.soLuongDeXuat} ${quantityResult.quyCach || quantityResult.donViTinh})`
                      });
                    }}
                    className="w-full py-3 bg-[#166534] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Tạo phiếu nhập từ gợi ý này ({quantityResult.soLuongDeXuat} {quantityResult.quyCach || quantityResult.donViTinh})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 my-auto">
                <TrendingUp className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Chọn sản phẩm bên trái và bấm tính toán</p>
                <p className="text-[11px] text-slate-400 mt-0.5">AI sẽ đối chiếu tốc độ bán và đưa ra số lượng nhập phù hợp.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SECTION 4: GIÁ NHẬP CẦN KIỂM TRA (BR-06-049) */}
      {/* ---------------------------------------------------- */}
      {activeSection === "price-check" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#166534]" /> Kiểm Tra & So Sánh Giá Nhập
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhập mức giá bạn dự định mua để AI so sánh với lịch sử nhập trước đây và báo giá từ các nhà phân phối khác.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Chọn mặt hàng:
                </label>
                <select
                  value={priceCheckProduct}
                  onChange={e => setPriceCheckProduct(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#166534]"
                >
                  {(stockStatusData?.danhSach || []).map((prod: any) => (
                    <option key={prod.hangHoaId} value={prod.hangHoaId}>
                      {prod.tenHangHoa} ({prod.quyCach || prod.donViTinh})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Đơn giá nhập mới dự kiến (VNĐ):
                </label>
                <input
                  type="number"
                  placeholder="Ví dụ: 85000"
                  value={priceCheckValue}
                  onChange={e => setPriceCheckValue(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#166534]"
                />
              </div>

              <button
                type="button"
                onClick={handleAnalyzePrice}
                disabled={loadingPriceCheck}
                className="w-full py-2.5 bg-[#166534] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>{loadingPriceCheck ? "Đang phân tích giá..." : "So sánh giá nhập"}</span>
              </button>
            </div>
          </div>

          {/* Price Analysis Result */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            {priceAnalysisResult ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-extrabold rounded-full uppercase">
                      Kết quả đối chiếu giá
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">
                      {priceAnalysisResult.tenHangHoa}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Giá đang kiểm tra</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {Number(priceAnalysisResult.giaNhapKiemTra).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {/* Plain-Language Evaluation Card */}
                <div className={`rounded-xl p-4 border ${
                  priceAnalysisResult.danhGia === "CaoHonBatThuong"
                    ? "bg-red-50/70 border-red-200"
                    : priceAnalysisResult.danhGia === "ThapHonUuDai"
                    ? "bg-emerald-50/70 border-emerald-200"
                    : "bg-slate-50 border-slate-200"
                }`}>
                  <span className={`text-[11px] font-extrabold uppercase block ${
                    priceAnalysisResult.danhGia === "CaoHonBatThuong" ? "text-red-700" : "text-[#166534]"
                  }`}>
                    {priceAnalysisResult.thongDiepDanDan}
                  </span>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                    {priceAnalysisResult.lyDo}
                  </p>
                </div>

                {/* Benchmark Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block font-bold">Giá chuẩn trước đây</span>
                    <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
                      {priceAnalysisResult.giaThamKhao ? `${priceAnalysisResult.giaThamKhao.toLocaleString('vi-VN')} đ` : 'Chưa có'}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block font-bold">Giá trung bình lịch sử</span>
                    <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
                      {priceAnalysisResult.giaTrungBinhLichSu ? `${priceAnalysisResult.giaTrungBinhLichSu.toLocaleString('vi-VN')} đ` : 'Chưa có'}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block font-bold">Chênh lệch</span>
                    <span className={`font-extrabold text-sm mt-0.5 block ${
                      priceAnalysisResult.chenhLechPhanTram > 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {priceAnalysisResult.chenhLechPhanTram > 0 ? `+${priceAnalysisResult.chenhLechPhanTram}%` : `${priceAnalysisResult.chenhLechPhanTram}%`}
                    </span>
                  </div>
                </div>

                {/* Quotes from other suppliers */}
                {priceAnalysisResult.baoGiaThamKhaoKhac && priceAnalysisResult.baoGiaThamKhaoKhac.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block">
                      Báo giá từ các bên khác:
                    </span>
                    <div className="space-y-1">
                      {priceAnalysisResult.baoGiaThamKhaoKhac.map((q: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-700">{q.tenNhaCungCap}</span>
                          <span className="font-bold text-[#166534]">{Number(q.giaBao).toLocaleString('vi-VN')} đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 my-auto">
                <DollarSign className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Nhập mức giá dự kiến để kiểm tra</p>
                <p className="text-[11px] text-slate-400 mt-0.5">AI sẽ so sánh và cảnh báo nếu giá cao bất thường.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SECTION 5: ĐẠI LÝ PHÙ HỢP (BR-06-050) */}
      {/* ---------------------------------------------------- */}
      {activeSection === "suppliers" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#166534]" /> AI Gợi Ý Nơi Nhập Hàng
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                AI phân nhóm nhà cung cấp theo 4 tiêu chí rõ ràng (Phù hợp nhất, Giá tốt, Giao hàng ổn định, Đáng tin cậy).
              </p>
            </div>

            <button
              onClick={() => fetchSupplierRecommendations()}
              disabled={loadingSuppliers}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${loadingSuppliers ? 'animate-spin' : ''}`} />
              <span>Phân tích lại</span>
            </button>
          </div>

          {/* 4 Standard Supplier Groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(supplierRecommendResult?.nhomGoiY || []).map((group: any, idx: number) => {
              const sup = group.nhaCungCap;
              if (!sup) return null;

              return (
                <div
                  key={idx}
                  className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${
                        group.maNhom === "PhuHopNhat"
                          ? "bg-emerald-100 text-[#166534]"
                          : group.maNhom === "GiaTot"
                          ? "bg-blue-100 text-blue-800"
                          : group.maNhom === "GiaoHangOnDinh"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {group.tenNhomDanDan}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">
                        {sup.maNhaCungCap}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {sup.tenNhaCungCap}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      👉 {group.lyDoGiaiThich}
                    </p>

                    {/* Facts row */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-center">
                      <div className="bg-white border border-slate-200 rounded-lg p-2">
                        <span className="text-[10px] text-slate-400 block">Tổng tiền ước tính</span>
                        <span className="font-bold text-[#166534]">{sup.tongTienUocTinh.toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-2">
                        <span className="text-[10px] text-slate-400 block">Giao hàng</span>
                        <span className="font-bold text-slate-800">~{sup.soNgayGiaoHang} ngày</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-2">
                        <span className="text-[10px] text-slate-400 block">Điểm đánh giá</span>
                        <span className="font-bold text-emerald-700">{sup.diemDanhGia}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        handleApplyToImport({
                          nhaCungCapId: sup.nhaCungCapId,
                          moTa: `Áp dụng nhà cung cấp theo gợi ý AI: ${sup.tenNhaCungCap} (${group.tenNhomDanDan})`
                        });
                      }}
                      className="w-full py-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-[#166534] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Chọn nhà cung cấp này</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SECTION 6: DỰ ĐOÁN NHU CẦU THEO MÙA VỤ (BR-06-051) */}
      {/* ---------------------------------------------------- */}
      {activeSection === "seasonal" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#166534]" /> Dự Đoán Nhu Cầu Sắp Tới
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích theo chu kỳ mùa vụ, thời điểm gieo trồng và thời tiết để chuẩn bị nguồn hàng kịp thời cho bà con.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(seasonalData?.duDoanMuaVu || []).map((season: any) => (
              <div
                key={season.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-[#166534] text-[10px] font-extrabold rounded-full">
                      {season.khoangThoiGian}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{season.mucDoTinCay}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {season.cayTrong}
                  </h4>
                  <div className="text-xs font-semibold text-[#166534]">
                    {season.giaiDoan}
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      {season.thongDiepDanDan}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {season.lyDoGiaiThich}
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Mặt hàng nên chuẩn bị:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {season.matHangNenNhap.map((prod: string, pIdx: number) => (
                        <span key={pIdx} className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-md">
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      handleApplyToImport({
                        moTa: `Lập đơn nhập hàng đón đầu mùa vụ: ${season.cayTrong} (${season.giaiDoan})`
                      });
                    }}
                    className="w-full py-2 bg-[#166534] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Lập kế hoạch nhập hàng</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SECTION 7: HỎI ĐÁP AI QUYẾT ĐỊNH (BR-06-052) */}
      {/* ---------------------------------------------------- */}
      {activeSection === "qa-expert" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#166534]" /> Trợ Lý AI Hỗ Trợ Quyết Định Nhập Hàng
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỏi trực tiếp AI về bất kỳ vấn đề nhập hàng, đối chiếu tồn kho hoặc nhà phân phối. Dữ liệu luôn bám sát kho hàng thực tế của Hải Đăng.
            </p>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2">
            {[
              "Hàng nào đang sắp hết cần nhập ngay?",
              "Có báo giá nào cao bất thường không?",
              "Nên nhập NPK từ nhà cung cấp nào?",
              "Mùa vụ 2-3 tuần tới cần chuẩn bị thuốc gì?"
            ].map((prompt, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => handleAskExpert(prompt)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                💬 {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập câu hỏi của bạn (ví dụ: 'Nên nhập bao nhiêu chai Anvil cho tuần tới?')..."
              value={userQuestion}
              onChange={e => setUserQuestion(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleAskExpert();
              }}
              className="flex-1 py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#166534]"
            />
            <button
              type="button"
              onClick={() => handleAskExpert()}
              disabled={askingExpert || !userQuestion.trim()}
              className="px-5 py-2.5 bg-[#166534] hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Gửi</span>
            </button>
          </div>

          {/* Answers Feed */}
          <div className="space-y-4 pt-2">
            {aiAnswers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <HelpCircle className="h-7 w-7 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Chưa có câu hỏi nào trong phiên làm việc này</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Bấm vào một trong các câu hỏi mẫu bên trên để bắt đầu.</p>
              </div>
            ) : (
              aiAnswers.map((msg, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">🧑‍🌾 Bạn hỏi: "{msg.query}"</span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-xl p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {msg.loading ? (
                      <div className="flex items-center gap-2 text-slate-400 font-semibold py-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-[#166534]" />
                        <span>AI đang phân tích dữ liệu kho hàng...</span>
                      </div>
                    ) : (
                      msg.answer
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SECTION 8: LỊCH SỬ AUDIT LOG AI (BR-06-052) */}
      {/* ---------------------------------------------------- */}
      {activeSection === "audit-logs" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <History className="h-4 w-4 text-[#166534]" /> Lịch Sử Hoạt Động & Gợi Ý Của AI
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhật ký lưu trữ bất biến mọi phân tích, phiên bản mô hình AI, dữ liệu tham khảo và hành động của người dùng.
              </p>
            </div>

            <button
              onClick={fetchAuditLogs}
              disabled={loadingAuditLogs}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${loadingAuditLogs ? 'animate-spin' : ''}`} />
              <span>Tải lại</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                  <th className="py-3 px-3">Thời Gian</th>
                  <th className="py-3 px-3">Loại Chức Năng</th>
                  <th className="py-3 px-3">Mô Hình AI</th>
                  <th className="py-3 px-3">Độ Tin Cậy</th>
                  <th className="py-3 px-3">Hành Động Người Dùng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Chưa có bản ghi nhật ký AI nào.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {log.thoiGian ? new Date(log.thoiGian).toLocaleString('vi-VN') : ''}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {log.loaiChucNang === "PhanTichTonKho" ? "Phân tích tồn kho"
                          : log.loaiChucNang === "CanhBao" ? "Cảnh báo"
                          : log.loaiChucNang === "GoiYSoLuong" ? "Gợi ý số lượng"
                          : log.loaiChucNang === "PhanTichGia" ? "Phân tích giá"
                          : log.loaiChucNang === "GoiYNhaCungCap" ? "Gợi ý nhà cung cấp"
                          : log.loaiChucNang === "MuaVuXuHuong" ? "Mùa vụ & xu hướng"
                          : log.loaiChucNang === "TuVanChuyenGia" ? "Tư vấn chuyên gia"
                          : log.loaiChucNang}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {log.model}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-emerald-50 text-[#166534] border border-emerald-200 text-[10px] font-bold rounded-md">
                          {log.doTinCay}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {log.ghiChu || log.hanhDongNguoiDung}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
