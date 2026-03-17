'use client';
import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Printer, 
  CheckCircle2, 
  X, 
  Filter, 
  Tag, 
  ShoppingBag, 
  Package,
  ArrowRight,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';

export default function PrinterPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending Print'); // Default to new items
  
  const [selectedItems, setSelectedItems] = useState([]); // Array of { id, quantity, ...product }
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = String(item.item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(item.barcode_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(item.brand || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'All' ? true : item.status === statusFilter;
      
      // Never show 'Sold' by default in the search list unless explicitly filtered
      if (statusFilter !== 'Sold' && item.status === 'Sold') return false;

      return matchSearch && matchStatus;
    });
  }, [inventory, searchQuery, statusFilter]);

  const toggleSelect = (item) => {
    const exists = selectedItems.find(s => s.id === item.id);
    if (exists) {
      setSelectedItems(selectedItems.filter(s => s.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, { ...item, printQuantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        return { ...item, printQuantity: Math.max(1, item.printQuantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(s => s.id !== id));
  };

  const handleApproveAndPrint = async () => {
    if (selectedItems.length === 0) return;

    try {
      setIsPrinting(true);
      // 1. Approve (Update status to 'Available')
      const pendingIds = selectedItems.filter(i => i.status === 'Pending Print').map(i => i.id);
      
      if (pendingIds.length > 0) {
        await fetch('/api/printer/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: pendingIds, status: 'Available' })
        });
      }

      // 2. Trigger Print Dialog
      window.print();

      // 3. Refresh list
      await fetchInventory();
      setSelectedItems([]);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsPrinting(false);
    }
  };

  if (loading && inventory.length === 0) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">เครื่องพิมพ์บาร์โค้ด & จัดการสถานะ</h1>
          <p className="text-slate-500 font-medium">จัดการคิวปริ้นสินค้าและอนุมัติลงหน้าร้าน</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={fetchInventory}
             className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-200 transition-all shadow-sm"
           >
             <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button 
             onClick={handleApproveAndPrint}
             disabled={selectedItems.length === 0 || isPrinting}
             className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
           >
             <Printer className="w-5 h-5" />
             อนุมัติและพิมพ์ ({selectedItems.reduce((acc, i) => acc + i.printQuantity, 0)} ดวง)
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* Selection Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                <input 
                  type="text" 
                  placeholder="ค้นหาสินค้าจากชื่อ แบรนด์ หรือรหัส ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-semibold text-slate-700 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                />
              </div>
              <div className="flex items-center gap-2 px-2 bg-slate-50 rounded-2xl border border-slate-100">
                <Filter className="w-4 h-4 text-slate-400 ml-2" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none text-[13px] font-bold text-slate-600 focus:ring-0 outline-none pr-8 py-2.5"
                >
                  <option value="Pending Print">รอพิมพ์ (New)</option>
                  <option value="Available">พร้อมขาย (Active)</option>
                  <option value="Sold">ขายแล้ว (Sold)</option>
                  <option value="All">ทั้งหมด (All)</option>
                </select>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
              {filteredInventory.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleSelect(item)}
                  className={`group flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-slate-50/50 ${selectedItems.find(s => s.id === item.id) ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedItems.find(s => s.id === item.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-200 group-hover:border-indigo-300'}`}>
                    {selectedItems.find(s => s.id === item.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-tighter">#{item.barcode_id}</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="text-sm font-bold text-slate-800 truncate">{item.item_name}</div>
                    <div className="text-[11px] text-slate-400 font-semibold">{item.brand || 'No Brand'} / ฿{item.selling_price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {filteredInventory.length === 0 && (
                <div className="py-20 text-center opacity-20">
                   <ShoppingBag className="w-16 h-16 mx-auto mb-2" />
                   <p className="font-bold">ไม่พบสินค้าที่คุณค้นหา</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Print Queue */}
        <div className="space-y-4">
          <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-500" />
              รายการที่จะพิมพ์
            </h3>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto mb-6 pr-2">
              {selectedItems.map(item => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all flex flex-col gap-3 group">
                   <div className="flex items-start justify-between gap-3">
                     <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate mb-0.5">{item.item_name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.barcode_id}</div>
                     </div>
                     <button 
                       onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                       className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                   
                   <div className="flex items-center justify-between">
                      <div className="text-xs font-black text-indigo-600">฿{item.selling_price.toLocaleString()}</div>
                      <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl border border-slate-100">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-slate-50 rounded-lg transition-all"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[13px] font-black text-slate-700 min-w-[20px] text-center">{item.printQuantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-slate-50 rounded-lg transition-all"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                   </div>
                </div>
              ))}
              {selectedItems.length === 0 && (
                <div className="py-12 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center gap-3">
                   <div className="p-4 bg-slate-50 rounded-full">
                     <Plus className="w-6 h-6" />
                   </div>
                   <p className="text-xs font-bold uppercase tracking-widest">ติ๊กเลือกสินค้าที่ต้องการ</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 font-bold">Total Labels</span>
                <span className="text-2xl font-black text-indigo-600">
                  {selectedItems.reduce((acc, i) => acc + i.printQuantity, 0)}
                </span>
              </div>
              <button 
                onClick={handleApproveAndPrint}
                disabled={selectedItems.length === 0 || isPrinting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                อนุมัติและสั่งปริ้น
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actual Hidden Print View */}
      <div className="hidden print:block print-container">
        {selectedItems.map(item => (
          Array.from({ length: item.printQuantity }).map((_, idx) => (
            <div key={`${item.id}-${idx}`} className="label-item">
              <div className="label-brand">{item.brand || "RIZAN THRIFT"}</div>
              <div className="label-name">{item.item_name}</div>
              <div className="label-barcode-text">{item.barcode_id}</div>
              <div className="label-price">฿{item.selling_price.toLocaleString()}</div>
              {/* Note: This is a placeholder for real barcode images. 
                  In a real scenario, we'd use a barcode generator library here. */}
              <div className="label-footer">AUTHENTIC THRIFT</div>
            </div>
          ))
        ))}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm;
          }
          body {
            background-color: white !important;
          }
          .app-sidebar, .app-main > div:first-child, .print-hidden, .lucide {
             display: none !important;
          }
          .app-main {
             padding: 0 !important;
             margin: 0 !important;
          }
          .print-container {
             display: block !important;
             width: 100%;
          }
          .label-item {
            width: 40mm;
            height: 30mm;
            padding: 2mm;
            border: 0.1mm solid #eee;
            margin: 0;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            font-family: 'Prompt', sans-serif;
            overflow: hidden;
          }
          .label-brand {
            font-size: 8px;
            font-weight: 800;
            color: #333;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }
          .label-name {
            font-size: 10px;
            font-weight: 700;
            line-height: 1.1;
            margin: 1mm 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .label-barcode-text {
            font-size: 14px;
            font-weight: 900;
            letter-spacing: 0.05em;
            background: #000;
            color: #fff;
            padding: 1px 4px;
            border-radius: 2px;
          }
          .label-price {
            font-size: 16px;
            font-weight: 900;
            color: #000;
          }
          .label-footer {
            font-size: 6px;
            font-weight: 600;
            color: #999;
          }
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'Pending Print': 'bg-amber-50 text-amber-600 border-amber-100',
    'Available': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Sold': 'bg-slate-50 text-slate-400 border-slate-100'
  };
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {status === 'Pending Print' ? 'รอพิมพ์' : status === 'Available' ? 'ขายอยู่' : 'ขายแล้ว'}
    </span>
  );
}
