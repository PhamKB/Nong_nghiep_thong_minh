import React, { useState, useEffect } from 'react';
import { Product, Customer, SaleDetail, Hamlet, CayTrong } from '../types';
import { 
  Plus, 
  Trash2, 
  QrCode, 
  UserPlus, 
  Search, 
  CheckCircle, 
  FileText, 
  PlusCircle, 
  RefreshCw 
} from 'lucide-react';

interface SalesInvoiceProps {
  onSuccess: () => void;
}

export default function SalesInvoice({ onSuccess }: SalesInvoiceProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<{
    xoms: Hamlet[];
    cayTrongs: CayTrong[];
  }>({ xoms: [], cayTrongs: [] });

  // Invoice State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [cart, setCart] = useState<SaleDetail[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [invoiceNote, setInvoiceNote] = useState<string>('');

  // Selected single product to add
  const [currentProductId, setCurrentProductId] = useState<string>('');
  const [currentQty, setCurrentQty] = useState<number>(1);

  // Quick QR Scan Simulation input
  const [qrSimulationInput, setQrSimulationInput] = useState<string>('');

  // Add New Customer Quick Form modal/toggle
  const [showAddCust, setShowAddCust] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustXomId, setNewCustXomId] = useState<string>('');
  const [isCustomXom, setIsCustomXom] = useState(false);
  const [customXomName, setCustomXomName] = useState('');
  const [newCustCropId, setNewCustCropId] = useState<string>('');
  const [newCustArea, setNewCustArea] = useState<string>('');
  const [newCustNote, setNewCustNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, custRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/customers'),
        fetch('/api/categories')
      ]);
      const prods = await prodRes.json();
      const custs = await custRes.json();
      const cats = await catRes.json();

      setProducts(prods);
      setCustomers(custs);
      setCategories({ xoms: cats.xoms, cayTrongs: cats.cayTrongs });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulateQRScan = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const found = products.find(p => p.qrNoiBo === trimmed || p.maHangHoa === trimmed);
    if (found) {
      addToCart(found.id, 1);
      setSuccessMsg(`Đã quét nhận diện sản phẩm: ${found.tenTrenBaoBi}`);
      setQrSimulationInput('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(`Không tìm thấy hàng hóa với mã QR/Barcode: ${trimmed}`);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const addToCart = (prodId: number, qty: number) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    const availableStock = prod.currentStock ?? 0;
    const existing = cart.find(item => item.hangHoaId === prodId);
    const neededQty = existing ? existing.soLuong + qty : qty;

    if (neededQty > availableStock) {
      alert(`Sản phẩm ${prod.tenTrenBaoBi} chỉ còn tồn kho ${availableStock} ${prod.donViTinh || 'đơn vị'}. Không thể xuất quá.`);
      return;
    }

    setCart(prev => {
      const idx = prev.findIndex(item => item.hangHoaId === prodId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].soLuong += qty;
        return updated;
      } else {
        return [
          ...prev,
          {
            hangHoaId: prodId,
            soLuong: qty,
            donGia: prod.giaBanHienTai,
            tenTrenBaoBi: prod.tenTrenBaoBi
          }
        ];
      }
    });
  };

  const handleAddSelectedToCart = () => {
    if (!currentProductId) return;
    addToCart(Number(currentProductId), Number(currentQty));
    setCurrentQty(1);
    setCurrentProductId('');
  };

  const handleRemoveFromCart = (prodId: number) => {
    setCart(prev => prev.filter(item => item.hangHoaId !== prodId));
  };

  const handleUpdateCartQty = (prodId: number, newQty: number) => {
    if (newQty <= 0) return;
    const prod = products.find(p => p.id === prodId);
    const stock = prod?.currentStock ?? 999;
    if (newQty > stock) {
      alert(`Tồn kho chỉ còn ${stock}.`);
      return;
    }
    setCart(prev => prev.map(item => item.hangHoaId === prodId ? { ...item, soLuong: newQty } : item));
  };

  // Calculations
  const subTotal = cart.reduce((sum, item) => sum + item.soLuong * item.donGia, 0);
  const finalTotal = Math.max(0, subTotal - discount);
  const calculatedDebt = Math.max(0, finalTotal - amountPaid);

  // Submit Invoice
  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert("Vui lòng chọn khách hàng.");
      return;
    }
    if (cart.length === 0) {
      alert("Giỏ hàng của hóa đơn đang trống.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          khachHangId: Number(selectedCustomerId),
          giamGia: discount,
          khachTra: amountPaid,
          ghiChu: invoiceNote,
          chiTiet: cart.map(item => ({
            hangHoaId: item.hangHoaId,
            soLuong: item.soLuong,
            donGia: item.donGia
          }))
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Giao dịch không thành công.");
      }

      setSuccessMsg("Lập hóa đơn bán hàng thành công! Đã trừ tồn kho và ghi nhận sổ nợ.");
      setCart([]);
      setDiscount(0);
      setAmountPaid(0);
      setInvoiceNote('');
      setSelectedCustomerId('');
      
      // Refresh local data
      await loadData();
      onSuccess();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 6000);
    } finally {
      setLoading(false);
    }
  };

  // Customer fast-create submit
  const handleFastCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    try {
      setLoading(true);
      const payload = {
        hoTen: newCustName.trim(),
        dienThoai: newCustPhone.trim(),
        diaChi: newCustAddress.trim(),
        xomId: isCustomXom ? '' : newCustXomId,
        isCustomXom,
        customXomName: isCustomXom ? customXomName.trim() : '',
        loaiCayTrongId: Number(newCustCropId || 1),
        dienTichCanhTac: Number(newCustArea || 0),
        ghiChu: newCustNote.trim()
      };

      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const newCust = await res.json();

      // Set newly created customer as selected
      setSelectedCustomerId(newCust.id.toString());
      
      // Close Form and refresh
      setShowAddCust(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustAddress('');
      setCustomXomName('');
      setIsCustomXom(false);
      setNewCustNote('');
      
      await loadData();
      setSuccessMsg("Đã tạo mới khách hàng thành công và tự động chọn!");
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      alert("Lỗi khi thêm nhanh khách hàng: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Look up customer info
  const activeCustomer = customers.find(c => c.id === Number(selectedCustomerId));

  return (
    <div className="space-y-6" id="sales-invoice-tab">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <FileText className="text-[#166534] h-5 w-5" /> Lập Hóa Đơn Bán Hàng (Xuất Kho)
          </h2>
          <p className="text-xs text-slate-500">Thiết kế thanh toán nhanh gối nợ cho bà con, tự động giảm tồn kho nông dược</p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-1 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" /> Làm mới kho hàng
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#166534] rounded-lg p-4 text-sm font-medium flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-[#166534]" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Selector & QR Simulator & Products Cart (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer Selection Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                1. Chọn Khách Hàng (Hộ dân)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCust(!showAddCust)}
                className="text-xs text-[#166534] hover:text-[#15803d] font-bold flex items-center gap-1 py-1 px-2.5 bg-emerald-50 border border-emerald-100 rounded-md transition"
                id="btn-fast-customer"
              >
                <UserPlus className="h-3.5 w-3.5" /> Thêm nhanh hộ dân mới
              </button>
            </div>

            {/* Fast Customer Form Drawer (inside box) */}
            {showAddCust && (
              <form onSubmit={handleFastCreateCustomer} className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200">
                  Đăng ký nhanh nông dân
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      placeholder="vd: Ông Nguyễn Văn Bính"
                      value={newCustName}
                      onChange={e => setNewCustName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-md text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      placeholder="vd: 0912..."
                      value={newCustPhone}
                      onChange={e => setNewCustPhone(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-md text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Hamlet (Xom) Dynamic Choice */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Xóm địa bàn</label>
                    {!isCustomXom ? (
                      <select
                        value={newCustXomId}
                        onChange={e => {
                          if (e.target.value === 'ADD_NEW_XOM') {
                            setIsCustomXom(true);
                          } else {
                            setNewCustXomId(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-md text-xs"
                      >
                        <option value="">-- Chọn Xóm --</option>
                        {categories.xoms.map(x => (
                          <option key={x.id} value={x.id}>{x.tenXom}</option>
                        ))}
                        <option value="ADD_NEW_XOM" className="font-bold text-[#166534]">+ Tạo xóm mới khác...</option>
                      </select>
                    ) : (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          required
                          placeholder="Nhập tên xóm mới"
                          value={customXomName}
                          onChange={e => setCustomXomName(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-md text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomXom(false);
                            setCustomXomName('');
                          }}
                          className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cây trồng chính</label>
                    <select
                      value={newCustCropId}
                      onChange={e => setNewCustCropId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-md text-xs"
                    >
                      {categories.cayTrongs.map(c => (
                        <option key={c.id} value={c.id}>{c.tenCayTrong}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diện tích canh tác (sào Bắc Bộ)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="vd: 4.5"
                      value={newCustArea}
                      onChange={e => setNewCustArea(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-md text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú bệnh sử</label>
                    <input
                      type="text"
                      placeholder="Thường mua nợ gối vụ..."
                      value={newCustNote}
                      onChange={e => setNewCustNote(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-md text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCust(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#166534] hover:bg-[#15803d] text-white rounded-md text-xs font-bold cursor-pointer transition"
                  >
                    Lưu & Chọn khách
                  </button>
                </div>
              </form>
            )}

            {/* Search/Select customer */}
            <div className="space-y-3">
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#166534] transition"
                id="select-invoice-customer"
              >
                <option value="">-- Click chọn nông dân mua hàng --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.hoTen} ({c.tenXom || 'Không rõ địa bàn'}) - Nợ gối vụ hiện tại: {(c.debt || 0).toLocaleString()}đ
                  </option>
                ))}
              </select>

              {/* Display selected Customer info card */}
              {activeCustomer && (
                <div className="bg-[#FFFDF4] border border-[#FDEFC2] rounded-xl p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Hộ dân:</span>
                    <span className="font-bold text-slate-900">{activeCustomer.hoTen}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Xóm tập trung:</span>
                    <span className="font-semibold text-[#166534]">{activeCustomer.tenXom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Nông vụ chính:</span>
                    <span className="font-medium text-slate-800">
                      {activeCustomer.cayTrongChuLuc} ({activeCustomer.dienTichCanhTac} sào)
                    </span>
                  </div>
                  {activeCustomer.ghiChu && (
                    <div className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-100">
                      📌 <strong>Đặc điểm gối vụ:</strong> {activeCustomer.ghiChu}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* QR/Barcode Scanner Simulation Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mb-3">
              <QrCode className="text-[#166534] h-5 w-5" /> 2. Giả Lập Đầu Quét Mã QR Nội Bộ
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tại Thái Bình, anh Hải Đăng có dán QR nội bộ lên chai thuốc. Bà con đưa chai thuốc qua, quét phát tự động thêm vào giỏ.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã QR của chai (vd: QR_PROD_1, QR_PROD_2) hoặc mã hàng..."
                value={qrSimulationInput}
                onChange={e => setQrSimulationInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#166534] focus:bg-white text-slate-900"
                id="input-sim-qr"
              />
              <button
                type="button"
                onClick={() => handleSimulateQRScan(qrSimulationInput)}
                className="px-4 py-2 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs transition cursor-pointer"
                id="btn-scan-qr"
              >
                Nhận QR
              </button>
            </div>
            {/* Quick Demo triggers */}
            <div className="flex gap-2 mt-3 items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Bấm thử nhanh mã QR:</span>
              <button
                type="button"
                onClick={() => handleSimulateQRScan('QR_PROD_1')}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono font-bold cursor-pointer"
              >
                Anvil (QR_PROD_1)
              </button>
              <button
                type="button"
                onClick={() => handleSimulateQRScan('QR_PROD_2')}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono font-bold cursor-pointer"
              >
                Amistar (QR_PROD_2)
              </button>
            </div>
          </div>

          {/* Add Goods Standard List Picker */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              3. Chọn từ danh mục kệ thuốc
            </h3>
            <div className="flex gap-3">
              <select
                value={currentProductId}
                onChange={e => setCurrentProductId(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#166534]"
                id="select-shelf-product"
              >
                <option value="">-- Click chọn thuốc bảo vệ / phân bón có sẵn --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.tenTrenBaoBi} (Tồn: {p.currentStock} {p.donViTinh || 'chai'}) - {(p.giaBanHienTai || 0).toLocaleString()}đ
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={currentQty}
                onChange={e => setCurrentQty(Math.max(1, Number(e.target.value)))}
                className="w-16 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#166534]"
              />

              <button
                type="button"
                onClick={handleAddSelectedToCart}
                className="px-4 py-2 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                id="btn-add-to-cart"
              >
                <Plus className="h-4 w-4" /> Thêm
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Cart & Calculation Ledger (5 Cols) */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmitInvoice} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 mb-3">
                Chi Tiết Hóa Đơn & Giỏ Hàng
              </h3>
              
              {cart.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  Chưa có sản phẩm nào được chọn. Hãy quét QR hoặc chọn từ kệ thuốc.
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.hangHoaId} className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-bold text-slate-900 truncate">{item.tenTrenBaoBi}</div>
                        <div className="text-[10px] text-slate-500">
                          Đơn giá: {item.donGia.toLocaleString()}đ
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={item.soLuong}
                          onChange={e => handleUpdateCartQty(item.hangHoaId, Number(e.target.value))}
                          className="w-12 px-1 py-0.5 border border-slate-300 rounded text-center text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#166534]"
                        />
                        <span className="font-bold text-slate-900 text-right w-16">
                          {(item.soLuong * item.donGia).toLocaleString()}đ
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.hangHoaId)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Calculations Ledger */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Tổng cộng thành tiền:</span>
                <span className="text-slate-900 font-bold">{subTotal.toLocaleString()} đ</span>
              </div>

              {/* Discount */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Giảm giá, bớt lẻ:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-24 px-2 py-1 bg-white border border-slate-300 rounded text-right font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#166534]"
                  />
                  <span>đ</span>
                </div>
              </div>

              {/* Total final */}
              <div className="flex justify-between font-bold border-t border-slate-200 pt-2 text-sm">
                <span className="text-slate-900">Khách cần thanh toán:</span>
                <span className="text-[#166534] font-black">{finalTotal.toLocaleString()} đ</span>
              </div>

              {/* Client Paid Cash */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-600 font-bold">Nông dân thanh toán ngay:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={amountPaid}
                    onChange={e => setAmountPaid(Math.max(0, Number(e.target.value)))}
                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-right font-bold text-[#166534] focus:outline-none focus:ring-2 focus:ring-[#166534]"
                    id="input-cash-paid"
                  />
                  <span>đ</span>
                </div>
              </div>

              {/* Leftover Debt (Gối vụ) */}
              <div className="flex justify-between font-bold border-t border-slate-200 pt-2 text-xs bg-amber-50 p-2 rounded border border-amber-100">
                <span className="text-amber-800">Số nợ gối vụ tiếp theo:</span>
                <span className="text-amber-950 font-black">{calculatedDebt.toLocaleString()} đ</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú gối vụ / Hẹn trả:</label>
              <textarea
                rows={2}
                placeholder="ví dụ: Ông An hẹn trả sau vụ gặt lúa mùa tháng 9..."
                value={invoiceNote}
                onChange={e => setInvoiceNote(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-[#166534] text-slate-900 focus:bg-white"
              />
            </div>

            {/* Action Submit */}
            <button
              type="submit"
              disabled={loading || cart.length === 0 || !selectedCustomerId}
              className="w-full py-3 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50 disabled:hover:bg-[#166534] cursor-pointer"
              id="btn-submit-invoice"
            >
              <CheckCircle className="h-5 w-5" /> 
              {loading ? 'Đang tạo giao dịch...' : 'Xác Nhận Xuất Kho & Lập Hóa Đơn'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
