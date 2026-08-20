import React, { useState, useEffect } from 'react';
import { DashboardStats } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  TrendingDown, 
  Send, 
  Sparkles, 
  Activity, 
  HelpCircle,
  Database,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string; date: Date }>>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Lỗi tải thống kê", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    
    const userQ = chatQuery.trim();
    setChatQuery('');
    setChatLoading(true);
    
    // Add question first
    const newEntry = { q: userQ, a: 'Đang suy nghĩ...', date: new Date() };
    setChatHistory(prev => [newEntry, ...prev]);
    
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQ })
      });
      const data = await res.json();
      
      setChatHistory(prev => {
        const copy = [...prev];
        if (copy.length > 0) {
          copy[0].a = data.answer;
        }
        return copy;
      });
    } catch (err) {
      console.error(err);
      setChatHistory(prev => {
        const copy = [...prev];
        if (copy.length > 0) {
          copy[0].a = 'Lỗi kết nối đến trợ lý AI. Vui lòng kiểm tra lại cấu hình hoặc kết nối mạng.';
        }
        return copy;
      });
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin text-emerald-600 h-8 w-8" />
        <span className="ml-2 text-gray-600 font-medium">Đang tải dữ liệu báo cáo...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Xin chào, Anh Hải Đăng! 👋</h2>
          <p className="text-sm text-slate-500 font-medium">Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Hệ thống đã sẵn sàng vận hành.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="mt-4 md:mt-0 flex items-center gap-1.5 px-4 py-2 bg-white text-[#166534] hover:bg-emerald-50 border-2 border-[#166534] rounded-lg text-sm font-bold transition"
          id="btn-refresh-stats"
        >
          <RefreshCw className="h-4 w-4" /> Làm mới số liệu
        </button>
      </div>

      {/* Core Financial Metrics (High Contrast, softer shadow, 12px border radius) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Sổ quỹ (Pastel Gold/Beige) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition duration-200" id="card-fund">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quỹ Tiền Mặt</span>
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#166534] mb-1">
            {(stats?.currentFund || 0).toLocaleString()} <span className="text-sm font-medium text-slate-500">đ</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Tiền mặt hiện tại trong sổ quỹ</p>
        </div>

        {/* Card 2: Dư nợ nông dân (Pastel Green) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition duration-200" id="card-client-debt">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bà Con Nợ Cửa Hàng</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mb-1">
            {(stats?.totalClientDebt || 0).toLocaleString()} <span className="text-sm font-medium text-slate-500">đ</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Tổng tiền gối vụ chưa thu hồi</p>
        </div>

        {/* Card 3: Nợ nhà cung cấp (Pastel Blue) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition duration-200" id="card-supplier-debt">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cửa Hàng Nợ Đại Lý Sỉ</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mb-1">
            {(stats?.totalSupplierDebt || 0).toLocaleString()} <span className="text-sm font-medium text-slate-500">đ</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Tổng nợ gối đầu đại lý lớn</p>
        </div>
      </div>

      {/* Today Statistics Row */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Phát sinh hôm nay</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <div className="text-xs text-slate-400 font-semibold mb-1">Doanh Thu</div>
            <div className="text-lg font-bold text-[#166534] flex items-center justify-center gap-0.5">
              {(stats?.todayDoanhThu || 0).toLocaleString()}
              <span className="text-xs font-normal">đ</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <div className="text-xs text-slate-400 font-semibold mb-1">Lợi Nhuận</div>
            <div className="text-lg font-bold text-teal-600 flex items-center justify-center gap-0.5">
              {(stats?.todayLoiNhuan || 0).toLocaleString()}
              <span className="text-xs font-normal">đ</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <div className="text-xs text-slate-400 font-semibold mb-1">Số Hóa Đơn</div>
            <div className="text-lg font-bold text-slate-800">
              {stats?.todayInvoicesCount || 0} <span className="text-xs font-normal text-slate-400">lượt</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <div className="text-xs text-slate-400 font-semibold mb-1">Khách Mới</div>
            <div className="text-lg font-bold text-blue-600">
              {stats?.newCustomersToday || 0} <span className="text-xs font-normal text-slate-400">người</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center col-span-2 md:col-span-1">
            <div className="text-xs text-slate-400 font-semibold mb-1">Thu nợ tiền mặt</div>
            <div className="text-lg font-bold text-amber-600 flex items-center justify-center gap-0.5">
              {(stats?.todayThuNo || 0).toLocaleString()}
              <span className="text-xs font-normal">đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Split: AI Agricultural Consultant & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Consultant Chat (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between" id="ai-chat-panel">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-[#166534] rounded-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm md:text-base">
                    Trợ lý Kỹ thuật AI Nông Nghiệp
                  </h3>
                  <p className="text-xs text-slate-400">Hỏi đáp sâu bệnh lúa & tư vấn thuốc có sẵn tại quầy</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-[#166534] rounded-full text-xs font-semibold">
                Mô hình 3.6-flash
              </span>
            </div>

            {/* Chat History View */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4 p-1">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400 flex flex-col items-center justify-center gap-2">
                  <HelpCircle className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium">Bà con hỏi gì Trợ lý AI sẽ trả lời tận tình.</p>
                  <p className="text-xs text-slate-400 italic">Thử gõ: "lúa đang bị đạo ôn thì phun Anvil hay Amistar tốt?"</p>
                </div>
              ) : (
                chatHistory.map((item, index) => (
                  <div key={index} className="space-y-2">
                    {/* User Question */}
                    <div className="flex justify-end">
                      <div className="bg-emerald-50 border border-emerald-100 text-slate-850 text-xs md:text-sm rounded-lg p-3 max-w-[85%] font-medium">
                        {item.q}
                      </div>
                    </div>
                    {/* AI Answer */}
                    <div className="flex justify-start">
                      <div className="bg-slate-50 border border-slate-150 text-slate-800 text-xs md:text-sm rounded-lg p-3 max-w-[85%] whitespace-pre-line leading-relaxed">
                        <div className="font-semibold text-[#166534] text-xs flex items-center gap-1 mb-1">
                          <Sparkles className="h-3.5 w-3.5 text-[#166534]" /> Trợ lý AI trả lời:
                        </div>
                        {item.a}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              value={chatQuery}
              onChange={e => setChatQuery(e.target.value)}
              placeholder="Hỏi về triệu chứng cây trồng, hoạt chất trị bệnh..."
              disabled={chatLoading}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#166534] focus:bg-white transition"
              id="input-ai-chat"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatQuery.trim()}
              className="px-4 py-2.5 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-sm flex items-center gap-1 transition disabled:opacity-50"
              id="btn-send-ai-chat"
            >
              <Send className="h-4 w-4" /> {chatLoading ? 'Đang soạn...' : 'Gửi'}
            </button>
          </form>
        </div>

        {/* Right: Quick shortcuts & Actions (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="font-bold mb-4 text-xs uppercase tracking-wider text-slate-400">
              Lối tắt Nghiệp vụ nhanh
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onNavigate('banhang')}
                className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 hover:bg-emerald-50 text-[#166534] font-bold rounded-lg text-center text-sm gap-2 transition shadow-sm"
                id="shortcut-sale"
              >
                <div className="p-2 bg-[#BBF7D0] rounded-lg text-[#166534]">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                Hóa Đơn Mới
              </button>
              <button 
                onClick={() => onNavigate('nhaphang')}
                className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 hover:bg-blue-50 text-blue-800 font-bold rounded-lg text-center text-sm gap-2 transition shadow-sm"
                id="shortcut-import"
              >
                <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                  <Database className="h-5 w-5" />
                </div>
                Nhập Thêm Kho
              </button>
              <button 
                onClick={() => onNavigate('hanghoa')}
                className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-lg text-center text-sm gap-2 transition shadow-sm"
                id="shortcut-products"
              >
                <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                  <Activity className="h-5 w-5" />
                </div>
                Danh Mục Hàng
              </button>
              <button 
                onClick={() => onNavigate('khachhang')}
                className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 hover:bg-amber-50 text-amber-800 font-bold rounded-lg text-center text-sm gap-2 transition shadow-sm"
                id="shortcut-customers"
              >
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Users className="h-5 w-5" />
                </div>
                Xem Nông Dân
              </button>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Trạng thái kho hàng
            </h4>
            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">Hàng hóa sẵn có:</span>
              <span className="font-bold text-slate-800">{stats?.productsCount} mặt hàng</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Đăng ký khách canh tác:</span>
              <span className="font-bold text-slate-800">{stats?.customersCount} hộ dân</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
