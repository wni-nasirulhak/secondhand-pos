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
  RefreshCw,
  Eye
} from 'lucide-react';
import JsBarcode from 'jsbarcode';

export default function PrinterPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending Print'); // Default to new items
  
  const [selectedItems, setSelectedItems] = useState([]); // Array of { id, quantity, ...product }
  const [printMode, setPrintMode] = useState('Barcode'); // 'Barcode', 'Receipt', or 'Shipping'
  const [isPrinting, setIsPrinting] = useState(false);
  
  const [senderInfo, setSenderInfo] = useState({ name: "RIZAN THRIFT", phone: "081-XXX-XXXX", address: "123 Store St, Bangkok" });
  const [recipientInfo, setRecipientInfo] = useState({ name: "", phone: "", address: "" });
  const [previewLabel, setPreviewLabel] = useState(null); // The label currently being previewed

  useEffect(() => {
    fetchInventory();
    
    // Check for saleId in URL
    const params = new URLSearchParams(window.location.search);
    const saleId = params.get('saleId');
    if (saleId) {
      fetchSaleDetails(saleId);
      setPrintMode('Shipping');
    }
  }, []);

  async function fetchSaleDetails(saleId) {
    try {
      const res = await fetch(`/api/sales/${saleId}`);
      const data = await res.json();
      if (data.success) {
        setRecipientInfo({
          name: data.data.customer_name || "",
          phone: data.data.customer_phone || "",
          address: data.data.customer_address || ""
        });
        // Select items from this sale
        if (data.data.items) {
          const matchedItems = data.data.items.map(item => ({
            ...item,
            id: item.product_id, // Map product_id to id for consistency
            item_name: item.item_name,
            printQuantity: item.quantity
          }));
          setSelectedItems(matchedItems);
        }
      }
    } catch (err) {
      console.error('Error fetching sale:', err);
    }
  }

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
      // 1. Selective status update (ONLY for Barcodes)
      if (printMode === 'Barcode') {
        const idsToUpdate = selectedItems.filter(i => i.status !== 'Sold').map(i => i.id);
        if (idsToUpdate.length > 0) {
          await fetch('/api/inventory', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: idsToUpdate, status: 'Available' })
          });
        }
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
    <div className="space-y-4 md:space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 print:hidden px-3 md:px-0">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
             <Printer className="inline-block w-5 h-5 md:w-8 md:h-8 mr-2 text-indigo-600" />
             PRINTER <span className="text-slate-300">HUB</span>
          </h1>
          <p className="text-[10px] md:text-sm text-slate-500 font-bold uppercase tracking-tighter">Status & Labels</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex bg-white p-1 rounded-lg border border-slate-100 shadow-sm mr-2">
             <button 
               onClick={() => setPrintMode('Barcode')}
               className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${printMode === 'Barcode' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
             >
               BARCODE
             </button>
             <button 
               onClick={() => setPrintMode('Receipt')}
               className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${printMode === 'Receipt' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
             >
               RECEIPT
             </button>
             <button 
               onClick={() => setPrintMode('Shipping')}
               className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${printMode === 'Shipping' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
             >
               SHIPPING
             </button>
           </div>
           <button 
             onClick={fetchInventory}
             className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-indigo-500 transition-all shadow-sm"
           >
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button 
             onClick={handleApproveAndPrint}
             disabled={selectedItems.length === 0 || isPrinting}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-lg font-black text-[11px] md:text-sm shadow-lg shadow-indigo-100 transition-all active:scale-95 uppercase tracking-widest"
           >
             <Printer className="w-4 h-4" />
             Print ({selectedItems.reduce((acc, i) => acc + i.printQuantity, 0)})
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 print:hidden">
        {/* Selection Area */}
        <div className="lg:col-span-2 space-y-3 px-3 md:px-0">
          <div className="bg-white rounded-2xl border border-slate-100 p-2 md:p-4 shadow-sm overflow-hidden flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-indigo-500" />
                <input 
                  type="text" 
                  placeholder="ค้นหาสินค้า..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const allSelected = filteredInventory.length > 0 && filteredInventory.every(fi => selectedItems.some(si => si.id === fi.id));
                    if (allSelected) {
                      setSelectedItems(selectedItems.filter(si => !filteredInventory.some(fi => fi.id === si.id)));
                    } else {
                      const missing = filteredInventory.filter(fi => !selectedItems.some(si => si.id === fi.id)).map(i => ({...i, printQuantity: 1}));
                      setSelectedItems([...selectedItems, ...missing]);
                    }
                  }}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-xl whitespace-nowrap transition-colors"
                >
                  {filteredInventory.length > 0 && filteredInventory.every(fi => selectedItems.some(si => si.id === fi.id)) ? 'Deselect All' : 'Select All'}
                </button>
                <div className="flex items-center bg-slate-50 rounded-xl px-2 border border-slate-100">
                  <Filter className="w-3.5 h-3.5 text-slate-300" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-black text-slate-600 focus:ring-0 outline-none px-2 py-2 cursor-pointer"
                  >
                    <option value="Pending Print">รอพิมพ์</option>
                    <option value="Available">พร้อมขาย</option>
                    <option value="Sold">ขายแล้ว</option>
                    <option value="All">ทั้งหมด</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="max-h-[500px] md:max-h-[600px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1 md:gap-2 pr-1 hide-scrollbar">
              {filteredInventory.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleSelect(item)}
                  className={`group flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50/50 ${selectedItems.find(s => s.id === item.id) ? 'bg-indigo-50/50 ring-1 ring-indigo-200 shadow-sm' : 'bg-white border border-slate-100'}`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${selectedItems.find(s => s.id === item.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white group-hover:border-indigo-300'}`}>
                    {selectedItems.find(s => s.id === item.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 uppercase tracking-tighter">#{item.barcode_id}</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="text-[11px] font-black text-slate-800 truncate leading-tight">{item.item_name}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{item.brand || 'No Brand'} • ฿{item.selling_price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {filteredInventory.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-20">
                   <ShoppingBag className="w-16 h-16 mx-auto mb-2" />
                   <p className="font-bold text-xs uppercase">No Results</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Print Queue */}
        <div className="space-y-4 px-3 md:px-0">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-6 shadow-sm sticky top-4">
            <h3 className="text-xs md:text-sm font-black text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <Printer className="w-4 h-4 text-indigo-500" />
              Print Queue
            </h3>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4 pr-1 hide-scrollbar">
              {selectedItems.map(item => (
                <div key={item.id} className="p-2 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all flex flex-col gap-1.5">
                   <div className="flex items-start justify-between gap-2">
                     <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-slate-800 truncate leading-tight">{item.item_name}</div>
                        <div className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">{item.barcode_id}</div>
                     </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPreviewLabel(item); }}
                        className="p-1 text-slate-300 hover:text-indigo-500 transition-colors"
                        title="Preview"
                      >
                        <Eye size={12} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                   </div>
                   
                   <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black text-indigo-600">฿{item.selling_price.toLocaleString()}</div>
                      <div className="flex items-center gap-2 bg-white px-1.5 py-0.5 rounded-lg border border-slate-50">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 text-slate-300 hover:text-indigo-500"><Minus size={10} /></button>
                        <span className="text-[10px] font-black text-slate-700 min-w-[12px] text-center">{item.printQuantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 text-slate-300 hover:text-indigo-500"><Plus size={10} /></button>
                      </div>
                   </div>
                </div>
              ))}
              {selectedItems.length === 0 && (
                <div className="py-12 text-center text-slate-200 border-2 border-dashed border-slate-50 rounded-2xl flex flex-col items-center gap-2 opacity-50">
                   <Plus size={24} />
                   <p className="text-[9px] font-black uppercase tracking-widest">Select Items</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-50 space-y-4">
              {printMode === 'Shipping' && (
                <div className="space-y-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                    <ArrowRight size={12} /> ข้อมูลผู้รับ
                  </h4>
                  <div className="space-y-2">
                    <input 
                      type="text" placeholder="ชื่อผู้รับ" 
                      value={recipientInfo.name} onChange={e => setRecipientInfo({...recipientInfo, name: e.target.value})}
                      className="w-full px-2 py-1.5 bg-white border border-indigo-100 rounded-lg text-[10px] font-bold outline-none"
                    />
                    <input 
                      type="text" placeholder="เบอร์โทรผู้รับ" 
                      value={recipientInfo.phone} onChange={e => setRecipientInfo({...recipientInfo, phone: e.target.value})}
                      className="w-full px-2 py-1.5 bg-white border border-indigo-100 rounded-lg text-[10px] font-bold outline-none"
                    />
                    <textarea 
                      placeholder="ที่อยู่ผู้รับ" 
                      value={recipientInfo.address} onChange={e => setRecipientInfo({...recipientInfo, address: e.target.value})}
                      className="w-full px-2 py-1.5 bg-white border border-indigo-100 rounded-lg text-[10px] font-bold outline-none min-h-[60px] resize-none"
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <span>Total Items</span>
                <span className="text-xl font-black text-indigo-600">{selectedItems.reduce((acc, i) => acc + i.printQuantity, 0)}</span>
              </div>
              <button 
                onClick={handleApproveAndPrint}
                disabled={selectedItems.length === 0 || isPrinting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 text-white font-black rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 text-[12px] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {isPrinting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                {printMode === 'Barcode' ? 'PRINT BARCODES' : printMode === 'Receipt' ? 'PRINT RECEIPTS' : 'PRINT SHIPPING LABELS'}
              </button>
            </div>
          </div>
          
          {/* Real-time Preview */}
          {previewLabel && (
            <div className="bg-white rounded-2xl border border-dashed border-indigo-200 p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LIVE PREVIEW</h4>
                 <button onClick={() => setPreviewLabel(null)} className="text-slate-300 hover:text-slate-500"><X size={14} /></button>
               </div>
               
               <div className="flex justify-center">
                 {printMode === 'Barcode' ? (
                   <div className="bg-white border border-slate-100 p-6 shadow-xl rounded-2xl transform scale-75 origin-top w-full max-w-[320px]">
                      <div className="barcode-preview flex flex-col items-center">
                        <BarcodeComponent value={previewLabel.barcode_id} width={2} height={60} />
                        <div className="text-[14px] font-black text-slate-800 mt-1">{previewLabel.barcode_id}</div>
                        <div className="w-full text-left mt-4 border-t border-slate-50 pt-2">
                          <div className="text-[11px] font-bold text-slate-800 uppercase">{previewLabel.item_name}</div>
                          <div className="text-[9px] text-slate-400 font-black">NEW / AUTHENTIC</div>
                        </div>
                      </div>
                   </div>
                 ) : printMode === 'Receipt' ? (
                   <div className="bg-white border border-slate-200 p-6 shadow-lg w-full max-w-[300px] font-mono text-[9px] leading-tight flex flex-col gap-3">
                     <div className="text-center space-y-1">
                       <div className="font-black text-sm tracking-widest text-slate-900">RIZAN THRIFT</div>
                       <div className="text-[7px] text-slate-500 uppercase font-black">Tax# 0107542000011 (VAT Included)</div>
                       <div className="text-[8px] font-bold text-slate-700 bg-slate-50 py-1 rounded">ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ</div>
                     </div>
                     <div className="border-b border-dashed border-slate-200 pb-2 space-y-1">
                       {selectedItems.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-start">
                           <span className="flex-1 pr-2 truncate">{item.printQuantity} {item.item_name}</span>
                           <span className="font-bold">฿{(item.selling_price * item.printQuantity).toLocaleString()}</span>
                         </div>
                       ))}
                     </div>
                     <div className="space-y-1 pt-1">
                        <div className="flex justify-between font-black text-[10px] text-slate-900">
                          <span>ยอดสุทธิ {selectedItems.reduce((acc, i) => acc + i.printQuantity, 0)} ชิ้น</span>
                          <span>฿{selectedItems.reduce((sum, item) => sum + (item.selling_price * item.printQuantity), 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between opacity-50 text-[7px]">
                          <span>เงินสด/เงินโอน</span>
                          <span>-0.00</span>
                        </div>
                     </div>
                     <div className="mt-auto flex flex-col items-center pt-4 border-t border-dashed border-slate-200">
                        <BarcodeComponent value={previewLabel?.barcode_id || "TEMP"} width={1.2} height={30} displayValue={false} />
                        <div className="text-[7px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">*** THANK YOU ***</div>
                     </div>
                   </div>
                 ) : (
                   <div className="bg-white border border-slate-100 p-6 shadow-xl w-full max-w-[320px] aspect-square flex flex-col gap-0 overflow-hidden relative rounded-xl border-2 border-slate-900">
                      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-2">
                        <div className="flex gap-2">
                           <div className="w-8 h-8 bg-slate-900 rounded-lg" />
                           <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                        </div>
                        <div className="flex flex-col items-end">
                           <div className="bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">DROP OFF</div>
                           <BarcodeComponent value="EB799534679TH" width={1} height={20} fontSize={8} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 border-b-2 border-slate-900 mb-2 pb-2">
                        <div className="text-[10px] font-black border-b border-slate-100 pb-1 mb-1 flex justify-between">
                           <span>ผู้ส่ง (FROM)</span>
                           <span className="text-slate-400 font-normal">RIZAN THRIFT</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-600 line-clamp-2">{senderInfo.address}</div>
                      </div>

                      <div className="grid grid-cols-1 border-b-2 border-slate-900 mb-2 pb-2">
                        <div className="text-[10px] font-black border-b border-slate-100 pb-1 mb-1">ผู้รับ (TO)</div>
                        <div className="text-[14px] font-black text-slate-900">{recipientInfo.name || "________________"}</div>
                        <div className="text-[10px] font-bold text-slate-600 leading-tight min-h-[30px]">{recipientInfo.address || "________________________________"}</div>
                        <div className="flex justify-between items-end mt-1">
                           <div className="text-[14px] font-black bg-slate-100 px-2 rounded">Phone: {recipientInfo.phone || "________________"}</div>
                           <div className="text-[8px] font-black border-2 border-slate-900 p-1 uppercase">ไม่ต้องเก็บเงิน</div>
                        </div>
                      </div>

                      <div className="mt-auto border-t-2 border-slate-900 pt-2">
                        <div className="table w-full text-[8px] font-bold">
                           <div className="table-header-group">
                              <div className="table-row">
                                 <div className="table-cell border-b border-slate-200 pb-1">ชื่อสินค้า</div>
                                 <div className="table-cell border-b border-slate-200 pb-1 text-right">จำนวน</div>
                              </div>
                           </div>
                           <div className="table-row-group">
                              <div className="table-row">
                                 <div className="table-cell pt-1 truncate max-w-[150px]">{previewLabel.item_name}</div>
                                 <div className="table-cell pt-1 text-right">1</div>
                              </div>
                           </div>
                        </div>
                      </div>
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Print Content */}
      <div className="hidden print:block print-container">
        {printMode === 'Receipt' ? (
          <div className="label-item receipt-form-print">
            <div className="receipt-header">
              <div className="receipt-logo">RIZAN THRIFT</div>
              <div className="receipt-subtitle uppercase">Tax# 0107542000011 (VAT Included)</div>
              <div className="receipt-type">ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ</div>
              <div className="receipt-divider" />
            </div>
            <div className="receipt-table">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="receipt-row">
                  <span className="qty">{item.printQuantity}</span>
                  <span className="desc">{item.item_name}</span>
                  <span className="price">฿{(item.selling_price * item.printQuantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="receipt-footer">
              <div className="receipt-divider" />
              <div className="receipt-total-big">
                <span>ยอดสุทธิ ({selectedItems.reduce((acc, i) => acc + i.printQuantity, 0)} ชิ้น)</span>
                <span>฿{selectedItems.reduce((sum, item) => sum + (item.selling_price * item.printQuantity), 0).toLocaleString()}</span>
              </div>
              <div className="receipt-info-row">
                <span>เงินสด/เงินโอน</span>
                <span>฿{selectedItems.reduce((sum, item) => sum + (item.selling_price * item.printQuantity), 0).toLocaleString()}</span>
              </div>
              <div className="receipt-info-row">
                <span>R#0001 {new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="receipt-divider" />
              <div className="receipt-barcode-center">
                 <BarcodeComponent value={selectedItems[0]?.barcode_id || "SALE"} width={1.5} height={40} displayValue={false} />
              </div>
              <div className="receipt-thanks">*** THANK YOU ***</div>
            </div>
          </div>
        ) : (
          selectedItems.map(item => (
            Array.from({ length: item.printQuantity }).map((_, idx) => (
              printMode === 'Barcode' ? (
                <div key={`${item.id}-${idx}`} className="label-item barcode-label-print">
                   <div className="barcode-container">
                      <BarcodeComponent value={item.barcode_id} width={2} height={60} fontSize={14} />
                      <div className="barcode-id-text">{item.barcode_id}</div>
                   </div>
                   <div className="barcode-details">
                      <div className="barcode-name">{item.item_name}</div>
                      <div className="barcode-meta">NEW / AUTHENTIC • ฿{item.selling_price.toLocaleString()}</div>
                   </div>
                </div>
              ) : (
                <div key={`${item.id}-${idx}`} className="label-item shipping-label-print">
                   <div className="ship-outer">
                      <div className="ship-header">
                         <div className="ship-logos">
                            <span className="logo-main">RIZAN</span>
                            <span className="logo-sub">LOGISTICS</span>
                         </div>
                         <div className="ship-dropoff">
                            <div className="dropoff-badge">DROP OFF</div>
                            <BarcodeComponent value={item.barcode_id} width={1} height={25} displayValue={false} />
                            <div className="ship-id-small">{item.barcode_id}</div>
                         </div>
                      </div>

                      <div className="ship-panels">
                         <div className="ship-panel from">
                            <div className="ship-label">ผู้ส่ง (FROM)</div>
                            <div className="ship-content bold">RIZAN THRIFT</div>
                            <div className="ship-content small">{senderInfo.address}</div>
                         </div>
                         
                         <div className="ship-panel to">
                            <div className="ship-label">ผู้รับ (TO)</div>
                            <div className="ship-content recipient-name">{recipientInfo.name || "________________"}</div>
                            <div className="ship-content address">{recipientInfo.address || "________________________________________________"}</div>
                            <div className="ship-footer-row">
                               <div className="ship-phone">Phone: {recipientInfo.phone || "________________"}</div>
                               <div className="ship-cod">ไม่ต้องเก็บเงิน</div>
                            </div>
                         </div>
                      </div>

                      <div className="ship-items-table">
                         <div className="table-header">
                            <span className="th-name">ชื่อสินค้า</span>
                            <span className="th-qty">จำนวน</span>
                         </div>
                         <div className="table-row">
                            <span className="td-name">{item.item_name}</span>
                            <span className="td-qty">{item.printQuantity}</span>
                         </div>
                      </div>
                      
                      <div className="ship-tracking">
                         <div className="tracking-barcode">
                            <div className="qr-box">QR</div>
                            <div className="tracking-text">
                               <div className="t-label">TRACKING NO.</div>
                               <div className="t-val">{item.barcode_id}</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )
            ))
          ))
        )}
      </div>

      {/* Styles */}
      <style jsx global>{`
        @media print {
          @page { size: auto; margin: 0mm; }
          body { background-color: white !important; }
          .app-sidebar, .app-main > div:first-child, .print-hidden, .lucide { display: none !important; }
          .app-main { padding: 0 !important; margin: 0 !important; }
          .print-container { display: block !important; width: 100%; }
          .label-item { margin: 0; page-break-after: always; font-family: 'Prompt', sans-serif; overflow: hidden; }
          
          /* Barcode Form Image 1 Style */
          .barcode-label-print {
            width: 80mm; height: 40mm; padding: 4mm; display: flex; flex-direction: column;
            justify-content: center; align-items: start; background: white;
          }
          .barcode-container { width: 100%; display: flex; flex-direction: column; align-items: center; }
          .barcode-id-text { font-size: 16px; font-weight: 900; margin-top: -2mm; }
          .barcode-details { margin-top: 4mm; width: 100%; }
          .barcode-name { font-size: 14px; font-weight: 800; line-height: 1.1; }
          .barcode-meta { font-size: 10px; font-weight: 900; color: #666; }

          /* Receipt Form Image 2 Style */
          .receipt-form-print {
            width: 80mm; padding: 5mm; font-family: 'Courier New', Courier, monospace;
            display: flex; flex-direction: column; background: white;
          }
          .receipt-logo { font-size: 24px; font-weight: 900; text-align: center; }
          .receipt-subtitle { font-size: 8px; text-align: center; font-weight: bold; }
          .receipt-type { font-size: 10px; text-align: center; background: #eee; padding: 1mm 0; margin: 2mm 0; font-weight: 900; }
          .receipt-row { display: flex; font-size: 11px; padding: 1mm 0; }
          .receipt-row .qty { width: 10mm; }
          .receipt-row .desc { flex: 1; }
          .receipt-row .price { width: 20mm; text-align: right; }
          .receipt-total-big { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; border-top: 1px solid #000; padding: 2mm 0; }
          .receipt-info-row { display: flex; justify-content: space-between; font-size: 10px; }
          .receipt-barcode-center { display: flex; justify-content: center; padding: 4mm 0; }

          /* Shipping Form Image 3 Style */
          .shipping-label-print {
            width: 100mm; min-height: 100mm; padding: 5mm; background: white;
          }
          .ship-outer { border: 0.8mm solid #000; height: 100%; display: flex; flex-direction: column; position: relative; }
          .ship-header { display: flex; justify-content: space-between; border-bottom: 0.8mm solid #000; padding: 2mm; }
          .logo-main { font-size: 20px; font-weight: 900; }
          .logo-sub { font-size: 10px; font-weight: 900; }
          .ship-dropoff { display: flex; flex-direction: column; align-items: end; }
          .dropoff-badge { background: #000; color: #fff; font-size: 10px; font-weight: 900; px: 2mm; mb: 1mm; }
          
          .ship-panels { display: flex; flex-direction: column; border-bottom: 0.8mm solid #000; }
          .ship-panel { padding: 3mm; border-bottom: 0.2mm solid #000; }
          .ship-panel.to { border-bottom: none; }
          .ship-label { font-size: 10px; font-weight: 900; margin-bottom: 1mm; }
          .ship-content.bold { font-size: 14px; font-weight: 900; }
          .ship-content.recipient-name { font-size: 18px; font-weight: 900; }
          .ship-content.address { font-size: 12px; font-weight: 700; min-height: 15mm; }
          
          .ship-footer-row { display: flex; justify-content: space-between; align-items: end; margin-top: 2mm; }
          .ship-phone { font-size: 18px; font-weight: 900; background: #eee; px: 2mm; }
          .ship-cod { border: 0.8mm solid #000; font-size: 12px; font-weight: 900; padding: 1mm 2mm; }
          
          .ship-items-table { border-bottom: 0.8mm solid #000; min-height: 30mm; }
          .ship-items-table .table-header { display: flex; background: #eee; border-bottom: 0.2mm solid #000; font-size: 10px; font-weight: 900; }
          .th-name { flex: 1; padding: 1mm 2mm; }
          .th-qty { width: 15mm; text-align: center; padding: 1mm 2mm; border-left: 0.2mm solid #000; }
          .td-name { flex: 1; padding: 2mm; font-size: 11px; font-weight: bold; }
          .td-qty { width: 15mm; text-align: center; padding: 2mm; font-size: 11px; font-weight: bold; border-left: 0.2mm solid #000; }
          
          .ship-tracking { padding: 3mm; display: flex; align-items: center; }
          .qr-box { width: 15mm; height: 15mm; border: 0.5mm solid #000; display: flex; items-center justify-center font-black text-xs; }
          .tracking-text { margin-left: 4mm; }
          .t-label { font-size: 8px; font-weight: 900; }
          .t-val { font-size: 18px; font-weight: 900; }
          .label-name { font-size: 10px; font-weight: 700; line-height: 1.1; margin: 1mm 0; }
          .label-barcode-text { font-size: 14px; font-weight: 900; background: #000; color: #fff; padding: 1px 4px; border-radius: 2px; }
          .label-barcode-container { margin: 1mm 0; }
          .label-price { font-size: 16px; font-weight: 900; }
          .label-footer { font-size: 6px; }
          
          .shipping-section { display: flex; flex-direction: column; gap: 1mm; }
          .shipping-title { font-size: 10px; font-weight: 900; background: #f1f5f9; padding: 1mm 2mm; border-radius: 1mm; border-left: 1mm solid #4f46e5; }
          .shipping-name { font-size: 14px; font-weight: 900; color: #1e293b; }
          .shipping-address { font-size: 12px; line-height: 1.3; font-weight: 600; }
          .shipping-divider { height: 1px; background: #e2e8f0; margin: 2mm 0; }
          .shipping-phone { font-size: 14px; font-weight: 900; }
          .shipping-item-note { margin-top: auto; font-size: 8px; font-weight: 800; color: #94a3b8; border-top: 1px dashed #e2e8f0; pt: 2mm; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md border uppercase tracking-tighter ${styles[status]}`}>
      {status === 'Pending Print' ? 'รอพิมพ์' : status === 'Available' ? 'พร้อมขาย' : 'ขายแล้ว'}
    </span>
  );
}

function BarcodeComponent({ value }) {
  const svgRef = (node) => {
    if (node) {
      JsBarcode(node, value, {
        format: "CODE128",
        width: 1.5,
        height: 35,
        displayValue: true,
        fontSize: 14,
        font: "Prompt",
        margin: 0
      });
    }
  };
  return <div className="label-barcode-container"><svg ref={svgRef}></svg></div>;
}
