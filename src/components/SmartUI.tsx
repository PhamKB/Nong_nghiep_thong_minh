import React, { useState, useEffect, useRef, useTransition, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Check, 
  ChevronDown, 
  X, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  Printer, 
  Eye, 
  UploadCloud, 
  Camera, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  FileSpreadsheet, 
  FileText,
  Loader2,
  Minimize2,
  Maximize2
} from 'lucide-react';

// ==========================================
// UTILITIES
// ==========================================

export function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "v")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d");
}

export function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const normText = removeAccents(text).toLowerCase();
  const normQuery = removeAccents(query).toLowerCase();
  const index = normText.indexOf(normQuery);
  if (index === -1) return text;

  const start = index;
  const end = index + query.length;
  return (
    <>
      {text.substring(0, start)}
      <mark className="bg-amber-150 text-emerald-950 font-semibold px-0.5 rounded">{text.substring(start, end)}</mark>
      {text.substring(end)}
    </>
  );
}

// ==========================================
// SMART COMBO BOX (PATCH-001-002)
// ==========================================

interface SmartComboBoxProps<T> {
  options: T[];
  value: string | number;
  onChange: (value: string | number | any) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
  placeholder?: string;
  onQuickCreate?: (query: string) => Promise<any>;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function SmartComboBox<T>({
  options,
  value,
  onChange,
  getLabel,
  getValue,
  placeholder = "Chọn một mục...",
  onQuickCreate,
  id,
  disabled = false,
  className = ""
}: SmartComboBoxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options with unaccented, case-insensitive match
  const filteredOptions = useMemo(() => {
    const normQuery = removeAccents(searchQuery).toLowerCase().trim();
    if (!normQuery) return options;
    return options.filter(opt => {
      const label = getLabel(opt);
      return removeAccents(label).toLowerCase().includes(normQuery);
    });
  }, [options, searchQuery, getLabel]);

  // Current selected option
  const selectedOption = useMemo(() => {
    return options.find(opt => getValue(opt) === value);
  }, [options, value, getValue]);

  // Handle keys
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'F4') {
      e.preventDefault();
      setIsOpen(prev => !prev);
      return;
    }

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const showQuickCreate = onQuickCreate && searchQuery.trim() && !filteredOptions.some(opt => getLabel(opt).toLowerCase() === searchQuery.trim().toLowerCase());
    const totalItems = filteredOptions.length + (showQuickCreate ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex < filteredOptions.length) {
        const selected = filteredOptions[highlightedIndex];
        onChange(getValue(selected));
        setIsOpen(false);
        setSearchQuery('');
      } else if (showQuickCreate) {
        handleQuickCreate();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleQuickCreate = async () => {
    if (!onQuickCreate || !searchQuery.trim()) return;
    try {
      const newOption = await onQuickCreate(searchQuery.trim());
      if (newOption) {
        if (typeof newOption === 'object') {
          onChange(getValue(newOption));
        } else {
          onChange(newOption);
        }
        setIsOpen(false);
        setSearchQuery('');
      }
    } catch (err: any) {
      alert(err.message || "Không thể tạo nhanh danh mục mới.");
    }
  };

  const showQuickCreate = onQuickCreate && searchQuery.trim() && !filteredOptions.some(opt => getLabel(opt).toLowerCase() === searchQuery.trim().toLowerCase());

  return (
    <div ref={containerRef} className={`relative ${className}`} id={id}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 border bg-white rounded-lg text-xs cursor-pointer select-none transition min-h-[40px] md:min-h-[44px] ${disabled ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' : isOpen ? 'border-[#166534] ring-2 ring-emerald-50' : 'border-slate-200 text-slate-950 hover:border-slate-350'}`}
      >
        <span className="truncate font-semibold text-slate-800">
          {selectedOption ? getLabel(selectedOption) : <span className="text-slate-400">{placeholder}</span>}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50">
            <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              autoFocus
              placeholder="Nhập tìm kiếm (không dấu)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none text-xs focus:outline-none focus:ring-0 text-slate-900"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-slate-200 rounded">
                <X className="h-3 w-3 text-slate-500" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
            {filteredOptions.map((opt, idx) => {
              const isSelected = getValue(opt) === value;
              const isHighlighted = idx === highlightedIndex;
              return (
                <div
                  key={getValue(opt)}
                  onClick={() => {
                    onChange(getValue(opt));
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`px-3 py-2.5 text-xs font-semibold flex items-center justify-between cursor-pointer transition select-none min-h-[40px] md:min-h-[44px] ${isSelected ? 'bg-emerald-50 text-[#166534]' : isHighlighted ? 'bg-slate-50 text-slate-900' : 'text-slate-700 hover:bg-slate-50/60'}`}
                >
                  <span className="truncate">
                    {highlightText(getLabel(opt), searchQuery)}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#166534] flex-shrink-0" />}
                </div>
              );
            })}

            {showQuickCreate && (
              <div
                onClick={handleQuickCreate}
                className={`px-3 py-2.5 text-xs font-bold text-emerald-800 flex items-center gap-1.5 cursor-pointer bg-emerald-50/60 hover:bg-emerald-50 transition min-h-[44px] ${highlightedIndex === filteredOptions.length ? 'bg-emerald-100/80 text-emerald-950' : ''}`}
              >
                <Plus className="h-4 w-4" />
                <span>Thêm nhanh "{searchQuery}"</span>
              </div>
            )}

            {filteredOptions.length === 0 && !showQuickCreate && (
              <div className="px-4 py-4 text-center text-slate-400 text-xs italic">
                Không tìm thấy kết quả phù hợp
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ==========================================
// SMART TABLE (PATCH-002-011)
// ==========================================

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortKey?: string;
  className?: string;
}

interface SmartTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: string;
  defaultSortKey?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  selectedRowId?: string | number | null;
  getRowId?: (item: T) => string | number;
  emptyMessage?: string;
  exportTitle?: string;
}

export function SmartTable<T>({
  data,
  columns,
  searchKey,
  defaultSortKey,
  className = "",
  onRowClick,
  selectedRowId,
  getRowId,
  emptyMessage = "Không có dữ liệu hiển thị",
  exportTitle = "Báo cáo dữ liệu"
}: SmartTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterText, setFilterText] = useState('');

  // Filtering
  const filteredData = useMemo(() => {
    if (!filterText.trim()) return data;
    const q = removeAccents(filterText).toLowerCase();
    return data.filter(item => {
      return Object.values(item as any).some(val => {
        if (!val) return false;
        return removeAccents(String(val)).toLowerCase().includes(q);
      });
    });
  }, [data, filterText]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const sorted = [...filteredData];
    sorted.sort((a: any, b: any) => {
      // Find sort values
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === undefined || valB === undefined) return 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc' 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
    return sorted;
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${exportTitle}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 20px; color: #1e293b; }
            h1 { font-size: 20px; text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>${exportTitle}</h1>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${sortedData.map(item => `
                <tr>
                  ${columns.map(col => `<td>${typeof col.accessor(item) === 'object' ? (item as any)[col.sortKey || ''] || '' : col.accessor(item)}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and control bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm nhanh trong bảng..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534] min-h-[40px]"
          />
          {filterText && (
            <button onClick={() => setFilterText('')} className="absolute right-2.5 top-2.5 p-0.5 hover:bg-slate-100 rounded">
              <X className="h-3.5 w-3.5 text-slate-400" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition min-h-[40px] md:min-h-[44px]"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>In / Xuất PDF</span>
          </button>

          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#166534] min-h-[40px] text-slate-700 cursor-pointer"
          >
            <option value={10}>10 dòng / trang</option>
            <option value={20}>20 dòng / trang</option>
            <option value={50}>50 dòng / trang</option>
            <option value={100}>100 dòng / trang</option>
          </select>
        </div>
      </div>

      {/* Table container */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {columns.map((col, idx) => (
                  <th 
                    key={idx}
                    onClick={() => col.sortKey && handleSort(col.sortKey)}
                    className={`px-4 py-3 text-xs font-bold text-slate-600 select-none tracking-wide ${col.sortKey ? 'cursor-pointer hover:bg-slate-100' : ''} ${col.className || ''}`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.header}</span>
                      {col.sortKey && (
                        <ArrowUpDown className={`h-3 w-3 text-slate-400 ${sortKey === col.sortKey ? 'text-[#166534]' : ''}`} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, rowIdx) => {
                  const id = getRowId ? getRowId(item) : rowIdx;
                  const isSelected = selectedRowId !== undefined && selectedRowId === id;
                  return (
                    <tr
                      key={id}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={`transition text-xs text-slate-800 ${onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : ''} ${isSelected ? 'bg-emerald-50/50 hover:bg-emerald-50 text-[#166534]' : ''}`}
                    >
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className={`px-4 py-3.5 font-medium ${col.className || ''}`}>
                          {col.accessor(item)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 italic">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-slate-300" />
                      <span>{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination control */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-500 font-medium">
            Hiển thị <span className="font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, sortedData.length)}</span> trong tổng số <span className="font-bold text-slate-800">{sortedData.length}</span> bản ghi
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current
              let pageNum = i + 1;
              if (currentPage > 3 && totalPages > 5) {
                pageNum = currentPage - 3 + i;
                if (pageNum + (4 - i) > totalPages) {
                  pageNum = totalPages - 4 + i;
                }
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${currentPage === pageNum ? 'bg-[#166534] border-[#166534] text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ==========================================
// SMART DIALOG (PATCH-002-013)
// ==========================================

interface SmartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SmartDialog({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}: SmartDialogProps) {
  // ESC to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} overflow-hidden transform transition-all flex flex-col max-h-[90vh] border border-slate-100`}>
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
          <h3 className="font-bold text-slate-950 text-sm md:text-base tracking-wide">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-850">
          {children}
        </div>
      </div>
    </div>
  );
}


// ==========================================
// SMART FORM (PATCH-001-005)
// ==========================================

interface SmartFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

export function SmartForm({
  onSubmit,
  children,
  ...props
}: SmartFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // Implement Enter key moves to next focusable element
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      
      // Do not skip if inside textarea or if clicking a button
      if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
        return;
      }

      e.preventDefault();
      
      if (!formRef.current) return;
      
      const focusableSelector = 'input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [contenteditable]';
      const elements = Array.from(formRef.current.querySelectorAll(focusableSelector)) as HTMLElement[];
      const currentIndex = elements.indexOf(target);

      if (currentIndex > -1 && currentIndex < elements.length - 1) {
        elements[currentIndex + 1].focus();
      } else {
        // Last element, submit
        onSubmit(e);
      }
    }
  };

  return (
    <form 
      ref={formRef} 
      onSubmit={onSubmit} 
      onKeyDown={handleKeyDown} 
      {...props}
    >
      {children}
    </form>
  );
}


// ==========================================
// SMART SEARCH (PATCH-002-012)
// ==========================================

interface SmartSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  id?: string;
}

export function SmartSearch({
  value,
  onChange,
  placeholder = "Tìm kiếm nhanh...",
  id
}: SmartSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl + F globally focuses this search box
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full" id={id}>
      <Search className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#166534] focus:ring-2 focus:ring-emerald-50 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none transition min-h-[44px]"
      />
      {value && (
        <button 
          onClick={() => onChange('')} 
          className="absolute right-3 top-3 p-0.5 hover:bg-slate-200 rounded"
        >
          <X className="h-4 w-4 text-slate-500" />
        </button>
      )}
    </div>
  );
}


// ==========================================
// SMART CAMERA & SCANNER (PATCH-001-001)
// ==========================================

interface SmartCameraProps {
  onScanResult: (text: string, ocrData?: any) => void;
  onClose?: () => void;
  placeholderText?: string;
}

export function SmartCamera({
  onScanResult,
  onClose,
  placeholderText = "Đang mở ống kính Camera sỉ lẻ..."
}: SmartCameraProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [loading, setLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [mockQRInput, setMockQRInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerOCR = async (fileBase64: string, rawText?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: fileBase64,
          rawTextSimulation: rawText || "Phân bón NPK Đầu Trâu 13-13-13 TE bón lúa đẻ nhánh bao 25kg"
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lỗi xử lý OCR AI");
      onScanResult(rawText || data.rawText || "Nhận diện thành công", data);
    } catch (err: any) {
      alert("Lỗi OCR AI: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      triggerOCR(reader.result as string, `MOCK-OCR: Tên: ${file.name.replace(/\.[^/.]+$/, "")} - Hoạt chất: Abamectin 3.6% - Quy cách: Chai 100ml`);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        triggerOCR(reader.result as string, `MOCK-OCR: Tên: ${file.name.replace(/\.[^/.]+$/, "")} - Quy cách: Gói 50g - Trừ bệnh đạo ôn`);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateQRScan = () => {
    if (!mockQRInput.trim()) return;
    onScanResult(mockQRInput.trim());
    setMockQRInput('');
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl overflow-hidden p-5 space-y-4 shadow-xl border border-slate-800">
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-emerald-400" />
          <span className="font-bold text-sm tracking-wide">MÁY QUÉT CAMERA AI (DR-04-003)</span>
        </div>
        <div className="flex gap-1">
          <button 
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'camera' ? 'bg-[#166534] text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            Ống kính
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'upload' ? 'bg-[#166534] text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            Tải ảnh nhãn
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {activeTab === 'camera' ? (
        <div className="space-y-3">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex flex-col items-center justify-center border border-slate-800">
            {isCameraActive ? (
              <>
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/50" />
                {/* Laser scan animation bar */}
                <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 animate-bounce top-1/4 shadow-lg shadow-emerald-500/50" />
                
                {/* Visual crop target lines */}
                <div className="absolute h-24 w-24 border-t-2 border-l-2 border-emerald-400 top-6 left-6" />
                <div className="absolute h-24 w-24 border-t-2 border-r-2 border-emerald-400 top-6 right-6" />
                <div className="absolute h-24 w-24 border-b-2 border-l-2 border-emerald-400 bottom-6 left-6" />
                <div className="absolute h-24 w-24 border-b-2 border-r-2 border-emerald-400 bottom-6 right-6" />

                <div className="text-center z-10 space-y-2">
                  <div className="animate-pulse flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mb-1" />
                    <span className="text-xs font-semibold tracking-wider text-emerald-300">{placeholderText}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Bà con hướng camera vào QR, Barcode hoặc Nhãn bao bì sản phẩm</span>
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-400">Ống kính tạm dừng hoạt động</span>
            )}
          </div>

          <div className="p-3 bg-slate-800 rounded-lg space-y-2 border border-slate-700">
            <label className="block text-[11px] font-bold text-slate-400">Giả lập quét QR / Barcode nhanh bằng tay:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã vạch EAN13 hoặc mã QR bảo bì (ví dụ: ANVIL-L01, 8936034120392)"
                value={mockQRInput}
                onChange={e => setMockQRInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && simulateQRScan()}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg text-xs focus:outline-none text-white"
              />
              <button
                type="button"
                onClick={simulateQRScan}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-650 rounded-lg text-xs font-bold transition flex-shrink-0"
              >
                Nhập
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[220px] ${dragActive ? 'border-emerald-500 bg-slate-800/40' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {loading ? (
            <div className="space-y-2">
              <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mx-auto" />
              <span className="text-xs font-bold text-emerald-300">AI đang quét & trích xuất thành phần bao bì...</span>
            </div>
          ) : (
            <div className="space-y-2 text-slate-400">
              <UploadCloud className="h-10 w-10 mx-auto text-emerald-400" />
              <div className="text-xs font-bold text-white">Kéo thả ảnh bao bì vào đây hoặc click để chọn file</div>
              <div className="text-[10px] text-slate-500">Hỗ trợ ảnh chụp nhãn chai thuốc, bao phân bón (JPG, PNG)</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ==========================================
// SMART NOTIFICATION (PATCH-002-014)
// ==========================================

export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface SmartNotificationProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function SmartNotification({
  toasts,
  onRemove
}: SmartNotificationProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const bgClasses = {
          success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          warning: 'bg-amber-50 border-amber-200 text-amber-950',
          error: 'bg-red-50 border-red-200 text-red-950',
          info: 'bg-blue-50 border-blue-200 text-blue-950'
        };

        const icons = {
          success: <Check className="h-4 w-4 text-emerald-700 flex-shrink-0" />,
          warning: <AlertTriangle className="h-4 w-4 text-amber-700 flex-shrink-0" />,
          error: <AlertCircle className="h-4 w-4 text-red-700 flex-shrink-0" />,
          info: <Info className="h-4 w-4 text-blue-700 flex-shrink-0" />
        };

        return (
          <div
            key={toast.id}
            className={`p-3.5 border rounded-xl shadow-lg flex items-start gap-2.5 transition transform translate-y-0 duration-300 pointer-events-auto ${bgClasses[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 text-xs font-semibold tracking-wide">
              {toast.message}
            </div>
            <button 
              onClick={() => onRemove(toast.id)}
              className="p-0.5 hover:bg-black/5 rounded text-slate-500 hover:text-slate-800 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}


// ==========================================
// SMART LOADING (PATCH-002-015)
// ==========================================

export function SmartLoading({ message = "Đang tải dữ liệu sỉ lẻ..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className="h-8 w-8 text-[#166534] animate-spin" />
      <span className="text-xs text-slate-500 font-bold tracking-wider animate-pulse">{message}</span>
    </div>
  );
}


// ==========================================
// SMART CARD & EMPTY STATES (PATCH-002-016)
// ==========================================

interface SmartCardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  id?: string;
}

export function SmartCard({
  title,
  children,
  actions,
  className = "",
  id
}: SmartCardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden ${className}`} id={id}>
      {(title || actions) && (
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          {title && (
            <div className="font-bold text-slate-900 text-xs md:text-sm tracking-wide">
              {title}
            </div>
          )}
          {actions && (
            <div className="flex items-center gap-1.5">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="p-5 text-xs">
        {children}
      </div>
    </div>
  );
}
