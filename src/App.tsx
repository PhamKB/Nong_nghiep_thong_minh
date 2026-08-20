import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  ShoppingCart, 
  Archive, 
  Users, 
  DollarSign, 
  Activity, 
  Menu, 
  X,
  UserCheck,
  Calendar,
  Layers,
  Award,
  Building
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import SalesInvoice from './components/SalesInvoice';
import GoodsManagement from './components/GoodsManagement';
import CustomersManagement from './components/CustomersManagement';
import FundsManagement from './components/FundsManagement';
import ActivityLogs from './components/ActivityLogs';
import SuppliersManagement from './components/SuppliersManagement';

export default function App() {
  const [activeTab, setActiveTab] = useState('tongquan');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Refresh trigger to sync stats across child views when an invoice is submitted or stock corrected
  const [refreshKey, setRefreshKey] = useState(0);
  const handleDataRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const navItems = [
    { id: 'tongquan', label: 'Bàn Làm Việc', icon: Sprout },
    { id: 'banhang', label: 'Xuất Hóa Đơn', icon: ShoppingCart },
    { id: 'hanghoa', label: 'Danh Mục Hàng', icon: Archive },
    { id: 'nhacungcap', label: 'Nhà Phân Phối', icon: Building },
    { id: 'khachhang', label: 'Hộ Dân Theo Xóm', icon: Users },
    { id: 'soquy', label: 'Sổ Quỹ & Công Nợ', icon: DollarSign },
    { id: 'nhatky', label: 'Sao Lưu & Nhật Ký', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] flex flex-col md:flex-row font-sans" id="app-root">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#166534] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Sprout className="h-6 w-6 text-[#BBF7D0]" />
          <span className="font-extrabold tracking-tight text-sm uppercase">Nông Nghiệp Thông Minh</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 hover:bg-[#15803d] rounded transition"
          id="btn-toggle-mobile-menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#166534] text-white p-5 flex flex-col justify-between shadow-xl transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `} id="app-sidebar">
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center gap-2.5 pb-5 border-b border-emerald-800">
            <div className="w-10 h-10 bg-[#BBF7D0] rounded-lg flex items-center justify-center text-[#166534] font-bold text-xl">
              AS
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-none">AgriSmart 1.1</h1>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mt-0.5 block">HẢI ĐĂNG AGRI</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1" id="sidebar-nav">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium transition duration-150
                    ${isActive 
                      ? 'bg-[#15803d] text-white shadow-sm' 
                      : 'text-emerald-50 hover:bg-[#15803d]/50'}
                  `}
                  id={`nav-item-${item.id}`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-emerald-300'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info (Store Info) */}
        <div className="p-4 bg-[#064e3b] rounded-lg text-[11px] text-emerald-300 space-y-1 -mx-2">
          <div className="font-bold text-white flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-[#BBF7D0]" /> Đại lý Hải Đăng
          </div>
          <div className="truncate text-emerald-100">Ngã tư chợ Tuy Định, Thái Bình</div>
          <div className="text-[9px] text-emerald-400/80 flex items-center gap-1.5 uppercase tracking-wider mt-1 pt-1 border-t border-emerald-900">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BBF7D0] animate-pulse"></span>
            Hệ thống trực tuyến
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 space-y-6" key={refreshKey} id="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'tongquan' && (
              <Dashboard onNavigate={setActiveTab} />
            )}
            
            {activeTab === 'banhang' && (
              <SalesInvoice onSuccess={handleDataRefresh} />
            )}
            
            {(activeTab === 'hanghoa' || activeTab === 'nhaphang') && (
              <GoodsManagement 
                onSuccess={handleDataRefresh} 
                initialLeftTab={activeTab === 'nhaphang' ? 'wholesale-import' : 'ai-declare'} 
              />
            )}

            {activeTab === 'nhacungcap' && (
              <SuppliersManagement onSuccess={handleDataRefresh} />
            )}
            
            {activeTab === 'khachhang' && (
              <CustomersManagement onSuccess={handleDataRefresh} />
            )}
            
            {activeTab === 'soquy' && (
              <FundsManagement onSuccess={handleDataRefresh} />
            )}
            
            {activeTab === 'nhatky' && (
              <ActivityLogs onSuccess={handleDataRefresh} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
