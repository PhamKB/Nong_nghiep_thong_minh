import React, { useState, useEffect } from 'react';
import { SoQuy, Customer, NhaCungCap } from '../types';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  CheckCircle,
  PlusCircle,
  Database,
  RefreshCw,
  Clock
} from 'lucide-react';

interface FundsManagementProps {
  onSuccess: () => void;
}

export default function FundsManagement({ onSuccess }: FundsManagementProps) {
  const [soQuy, setSoQuy] = useState<SoQuy[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<NhaCungCap[]>([]);
  const [loading, setLoading] = useState(false);

  // Collect Farmer Debt Form
  const [collectCustId, setCollectCustId] = useState('');
  const [collectAmount, setCollectAmount] = useState('');
  const [collectNote, setCollectNote] = useState('');
  
  // Pay Wholesaler Debt Form
  const [paySupId, setPaySupId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');

  // Manual General Voucher Form
  const [manualType, setManualType] = useState<'Thu' | 'Chi'>('Thu');
  const [manualAmount, setManualAmount] = useState('');
  const [manualTarget, setManualTarget] = useState('');
  const [manualNote, setManualNote] = useState('');

  const [activeTab, setActiveTab] = useState<'ledger' | 'collect' | 'pay' | 'manual'>('ledger');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [fundRes, custRes, supRes] = await Promise.all([
        fetch('/api/funds'),
        fetch('/api/customers'),
        fetch('/api/suppliers')
      ]);
      const fundData = await fundRes.json();
      const custData = await custRes.json();
      const supData = await supRes.json();

      setSoQuy(fundData.soQuy);
      setCustomers(custData);
      setSuppliers(supData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Collect Farmer Debt
  const handleCollectDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectCustId || !collectAmount) return;

    const amt = Number(collectAmount);
    const activeCust = customers.find(c => c.id === Number(collectCustId));
    if (!activeCust) return;

    if (amt > (activeCust.debt || 0)) {
      alert(`Khách hàng chỉ nợ ${(activeCust.debt || 0).toLocaleString()}đ. Bạn không thể thu vượt số nợ.`);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/debts/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          khachHangId: Number(collectCustId),
          soTienThu: amt,
          ghiChu: collectNote
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      setSuccessMsg(`Đã thu nợ thành công số tiền ${amt.toLocaleString()}đ từ nông dân ${activeCust.hoTen}!`);
      setCollectCustId('');
      setCollectAmount('');
      setCollectNote('');
      await loadData();
      onSuccess();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pay Supplier Debt
  const handlePaySupplierDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paySupId || !payAmount) return;

    const amt = Number(payAmount);
    const activeSup = suppliers.find(s => s.id === Number(paySupId));
    if (!activeSup) return;

    if (amt > (activeSup.debt || 0)) {
      alert(`Cửa hàng chỉ nợ đại lý ${(activeSup.debt || 0).toLocaleString()}đ. Bạn không thể chi quá.`);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/debts/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nhaCungCapId: Number(paySupId),
          soTienChi: amt,
          ghiChu: payNote
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      setSuccessMsg(`Đã chi trả tiền sỉ thành công số tiền ${amt.toLocaleString()}đ cho đại lý ${activeSup.tenNhaCungCap}!`);
      setPaySupId('');
      setPayAmount('');
      setPayNote('');
      await loadData();
      onSuccess();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create Manual Voucher
  const handleCreateManualVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAmount || !manualTarget) return;

    try {
      setLoading(true);
      const res = await fetch('/api/funds/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loaiGiaoDich: manualType,
          soTien: Number(manualAmount),
          doiTuong: manualTarget,
          ghiChu: manualNote
        })
      });

      if (!res.ok) throw new Error("Thực hiện thất bại");

      setSuccessMsg(`Đã tạo phiếu ${manualType === 'Thu' ? 'Thu' : 'Chi'} thủ công thành công!`);
      setManualAmount('');
      setManualTarget('');
      setManualNote('');
      await loadData();
      onSuccess();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get current rolling balance
  const currentFund = soQuy.length > 0 ? soQuy[0].soDuQuy : 0;

  return (
    <div className="space-y-6" id="funds-tab">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
          <DollarSign className="text-[#166534] h-5 w-5" /> Sổ Quỹ Tiền Mặt & Quản Lý Công Nợ Gối Đầu
        </h2>
        <p className="text-xs text-slate-500">
          Chứa toàn bộ phiếu thu chi tiền mặt, tự động cập nhật số dư khả dụng thực tế của cửa hàng.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#166534] rounded-lg p-4 text-sm font-semibold flex items-center gap-1">
          <CheckCircle className="h-5 w-5 text-[#166534]" /> {successMsg}
        </div>
      )}

      {/* Main Ledger Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Financial Voucher Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Action Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex gap-1">
            <button
              onClick={() => setActiveTab('collect')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition ${activeTab === 'collect' ? 'bg-emerald-50 text-[#166534] border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Thu nợ dân dã
            </button>
            <button
              onClick={() => setActiveTab('pay')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition ${activeTab === 'pay' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Trả sỉ đại lý
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition ${activeTab === 'manual' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Thu Chi Khác
            </button>
          </div>

          {/* Collect Farmer Debt Form */}
          {activeTab === 'collect' && (
            <form onSubmit={handleCollectDebt} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-1">
                <Users className="h-4 w-4 text-[#166534]" /> Lập Phiếu Thu Nợ Gối Vụ
              </h3>
              <p className="text-xs text-slate-500">Thu bớt tiền bán gối vụ khi bà con gặt lúa hoặc có kinh phí trả bớt.</p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hộ nông dân trả nợ *</label>
                <select
                  required
                  value={collectCustId}
                  onChange={e => setCollectCustId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                  id="select-collect-customer"
                >
                  <option value="">-- Chọn nông dân trả nợ --</option>
                  {customers.filter(c => c.debt > 0).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.hoTen} ({c.tenXom}) - Đang nợ gối vụ: {c.debt.toLocaleString()}đ
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền mặt thu hồi (đ) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="vd: 500000"
                  value={collectAmount}
                  onChange={e => setCollectAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs text-right font-bold text-[#166534]"
                  id="input-collect-amount"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú phiếu thu</label>
                <input
                  type="text"
                  placeholder="vd: Ông An thu hoạch lúa mùa mang tiền qua trả bớt..."
                  value={collectNote}
                  onChange={e => setCollectNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !collectCustId}
                className="w-full py-2.5 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs transition cursor-pointer"
                id="btn-submit-collect"
              >
                Xác Nhận Thu Tiền & Tăng Sổ Quỹ
              </button>
            </form>
          )}

          {/* Pay Supplier Debt Form */}
          {activeTab === 'pay' && (
            <form onSubmit={handlePaySupplierDebt} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-1">
                <Briefcase className="h-4 w-4 text-blue-600" /> Lập Phiếu Chi Trả Tiền Sỉ
              </h3>
              <p className="text-xs text-slate-500">Chi trả bớt tiền gốc nhập hàng gối đầu từ tổng đại lý sỉ phân phối.</p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đại lý sỉ / Nhà cung cấp *</label>
                <select
                  required
                  value={paySupId}
                  onChange={e => setPaySupId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-xs"
                >
                  <option value="">-- Chọn đại lý sỉ trả nợ --</option>
                  {suppliers.filter(s => s.debt > 0).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.tenNhaCungCap} - Đang nợ gối: {s.debt.toLocaleString()}đ
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền chi ra (đ) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="vd: 2000000"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-xs text-right font-bold text-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú phiếu chi</label>
                <input
                  type="text"
                  placeholder="vd: Trả nợ tiền mặt đợt phân bón NPK bón thúc..."
                  value={payNote}
                  onChange={e => setPayNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !paySupId}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Xác Nhận Chi Tiền & Giảm Sổ Quỹ
              </button>
            </form>
          )}

          {/* Manual Voucher Form */}
          {activeTab === 'manual' && (
            <form onSubmit={handleCreateManualVoucher} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Ghi Nhận Thu Chi Phát Sinh Chi Phí
              </h3>
              <p className="text-xs text-slate-500">Log nhanh chi phí sinh hoạt điện nước tại quầy, sửa cửa hàng...</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setManualType('Thu')}
                  className={`py-2 rounded-lg text-xs font-bold border text-center transition ${manualType === 'Thu' ? 'bg-emerald-50 border-emerald-300 text-[#166534]' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  Phiếu Thu (+)
                </button>
                <button
                  type="button"
                  onClick={() => setManualType('Chi')}
                  className={`py-2 rounded-lg text-xs font-bold border text-center transition ${manualType === 'Chi' ? 'bg-red-50 border-red-300 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  Phiếu Chi (-)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền mặt phát sinh (đ) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="vd: 120000"
                  value={manualAmount}
                  onChange={e => setManualAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs text-right font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đối tượng (Nguồn thu / Lý do chi) *</label>
                <input
                  type="text"
                  required
                  placeholder="vd: Chi tiền mua dây buộc lúa, Chi tiền điện tháng 7..."
                  value={manualTarget}
                  onChange={e => setManualTarget(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú chi tiết</label>
                <input
                  type="text"
                  placeholder="vd: Giao dịch phát sinh thủ công..."
                  value={manualNote}
                  onChange={e => setManualNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Ghi Nhật Ký Sổ Quỹ
              </button>
            </form>
          )}
        </div>

        {/* Right: Cash Book chronological transaction list (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Clock className="text-slate-400 h-4 w-4" /> Nhật Ký Lưu Chuyển Dòng Tiền (Sổ Quỹ)
              </h3>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Khả dụng:</div>
                <div className="text-sm font-black text-[#166534]">{currentFund.toLocaleString()}đ</div>
              </div>
            </div>

            {/* Ledger List */}
            <div className="overflow-y-auto max-h-[480px] pr-1 space-y-3">
              {soQuy.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  Sổ quỹ rỗng, chưa phát sinh giao dịch nào.
                </div>
              ) : (
                soQuy.map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${log.loaiPhieu === 'Thu' ? 'bg-emerald-50 text-[#166534]' : 'bg-red-50 text-red-800'}`}>
                          {log.loaiPhieu === 'Thu' ? 'Thu (+)' : 'Chi (-)'}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">{log.maChungTu}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800">
                        {log.maChungTu === 'KHAIVI' ? 'Số dư khởi tạo quỹ ban đầu' : log.maChungTu.startsWith('PT') ? 'Khách trả tiền mua hàng / Trả nợ' : 'Chi trả tiền hàng / Chi sinh hoạt'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.ngayGiaoDich).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xs font-bold ${log.loaiPhieu === 'Thu' ? 'text-[#166534]' : 'text-red-600'}`}>
                        {log.loaiPhieu === 'Thu' ? '+' : '-'}{Math.abs(log.soTienThayDoi).toLocaleString()} đ
                      </div>
                      <div className="text-[10px] font-bold text-slate-450">
                        Tồn quỹ: {log.soDuQuy.toLocaleString()} đ
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
