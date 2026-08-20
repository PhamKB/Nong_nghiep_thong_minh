import React, { useState, useEffect } from 'react';
import { ActivityLog, Backup, Attachment } from '../types';
import { 
  Activity, 
  Database, 
  FileCheck, 
  Upload, 
  Download, 
  Paperclip, 
  HardDrive, 
  CheckCircle, 
  RefreshCw,
  PlusCircle,
  ShieldAlert
} from 'lucide-react';

interface ActivityLogsProps {
  onSuccess: () => void;
}

export default function ActivityLogs({ onSuccess }: ActivityLogsProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Backup Form note
  const [backupNote, setBackupNote] = useState('');

  // Attachment Form
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentRefType, setAttachmentRefType] = useState('Khác');
  const [attachmentRefCode, setAttachmentRefCode] = useState('MANUAL');

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsRes, backupRes, attachRes] = await Promise.all([
        fetch('/api/logs'),
        fetch('/api/backups'),
        fetch('/api/attachments')
      ]);
      const logsData = await logsRes.json();
      const backupData = await backupRes.json();
      const attachData = await attachRes.json();

      setLogs(logsData);
      setBackups(backupData);
      setAttachments(attachData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Trigger Backup creation
  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ghiChu: backupNote })
      });
      const data = await res.json();
      setBackupNote('');
      setSuccessMsg(`Đã kết xuất SQL Dump lưu trữ thành công file: ${data.tenFileBackup}`);
      await loadData();
      onSuccess();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      console.error(e);
      alert("Lỗi sao lưu cơ sở dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  // Upload custom Attachment
  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentName || !attachmentUrl) return;

    try {
      setLoading(true);
      const res = await fetch('/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loaiChungTuThamChieu: attachmentRefType,
          maChungTuThamChieu: attachmentRefCode,
          tenFile: attachmentName,
          duongDanFile: attachmentUrl,
          kichThuoc: Math.floor(Math.random() * 300000) + 50000
        })
      });

      if (!res.ok) throw new Error("Giao dịch đính kèm thất bại");

      setAttachmentName('');
      setAttachmentUrl('');
      setAttachmentRefCode('MANUAL');
      setAttachmentRefType('Khác');
      setSuccessMsg("Đã liên kết đính kèm tệp hóa đơn sỉ thành công!");
      await loadData();
      onSuccess();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="logs-backup-tab">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
          <Activity className="text-[#166534] h-5 w-5" /> Sao Lưu Hệ Thống & Nhật Ký Vận Hành
        </h2>
        <p className="text-xs text-slate-500">
          Phần dành riêng cho chủ đại lý quản trị cơ sở dữ liệu MySQL Docker và xem tệp đính kèm hóa đơn đỏ đầu vào.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#166534] rounded-lg p-4 text-sm font-semibold flex items-center gap-1">
          <CheckCircle className="h-5 w-5 text-[#166534]" /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Database Backups & File Attachments (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Backup trigger card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Database className="h-4.5 w-4.5 text-[#166534]" /> Tạo bản sao lưu MySQL dự phòng
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Theo quy trình nghiệp vụ trong <strong>06_QuyTrinhNghiepVu.md</strong>, hệ thống tự động lưu trữ định kỳ. Bà con cũng có thể kích hoạt sao lưu MySQL thủ công thành file nén SQL dump bất cứ lúc nào trước khi đồng bộ dữ liệu.
            </p>

            <form onSubmit={handleCreateBackup} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú đợt sao lưu</label>
                <input
                  type="text"
                  placeholder="vd: Sao lưu trước khi kiểm kê kho cuối tháng..."
                  value={backupNote}
                  onChange={e => setBackupNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                id="btn-create-backup"
              >
                <Download className="h-4 w-4" /> Kích Hoạt Sao Lưu MySQL Dump
              </button>
            </form>

            {/* Backups List */}
            <div className="space-y-2.5 pt-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Các bản phục hồi đã lưu:
              </label>
              {backups.map(b => (
                <div key={b.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <div className="font-mono font-bold text-slate-700">{b.tenFileBackup}</div>
                    <div className="text-[10px] text-slate-400">
                      Tạo bởi: {b.nguoiTao} • {new Date(b.ngaySaoLuu).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-emerald-50 text-[#166534] text-[10px] font-bold rounded">
                      {(b.dungLuong / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Paperclip className="h-4.5 w-4.5 text-[#166534]" /> Tệp đính kèm hóa đơn chứng từ
            </h3>

            <form onSubmit={handleAddAttachment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên file chứng từ</label>
                  <input
                    type="text"
                    required
                    placeholder="vd: Hóa đơn sỉ Lộc Trời"
                    value={attachmentName}
                    onChange={e => setAttachmentName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đường dẫn file tệp</label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash..."
                    value={attachmentUrl}
                    onChange={e => setAttachmentUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                    id="input-attach-url"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loại tham chiếu</label>
                  <select
                    value={attachmentRefType}
                    onChange={e => setAttachmentRefType(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                  >
                    <option value="PhieuNhap">Phiếu Nhập Hàng</option>
                    <option value="HoaDon">Hóa Đơn Bán</option>
                    <option value="Khac">Khác (Bao bì mẫu)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã chứng từ liên kết</label>
                  <input
                    type="text"
                    placeholder="vd: PN000001"
                    value={attachmentRefCode}
                    onChange={e => setAttachmentRefCode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#166534] rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#166534] hover:bg-[#15803d] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Upload className="h-4 w-4" /> Liên kết Đính Kèm Tệp Chứng Từ
              </button>
            </form>

            {/* List */}
            <div className="space-y-2 pt-2">
              {attachments.map(a => (
                <div key={a.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex gap-3 text-xs">
                  <img
                    src={a.duongDanFile}
                    alt={a.tenFile}
                    className="w-12 h-12 rounded object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">{a.tenFile}</div>
                    <div className="text-[10px] text-slate-500">
                      Chứng từ: {a.loaiChungTuThamChieu} ({a.maChungTuThamChieu})
                    </div>
                    <div className="text-[9px] text-slate-400">
                      Đã đính kèm: {new Date(a.ngayDinhKem).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active System Action Log list (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-slate-400" /> Sổ Nhật Ký Kiểm Toán Hoạt Động (Audit Trail)
            </h3>

            <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
              {logs.map(log => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#166534]">
                      🛠️ {log.loaiHanhDong === 'BanHang' ? 'Hóa đơn bán hàng' : log.loaiHanhDong === 'NhapHang' ? 'Nhập sỉ kho' : log.loaiHanhDong === 'ThemHang' ? 'Khai báo hàng mới' : log.loaiHanhDong === 'ThemKhach' ? 'Đăng ký nông dân' : 'Cập nhật hệ thống'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.thoiGian).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {log.chiTiet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
