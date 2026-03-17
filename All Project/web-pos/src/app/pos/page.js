'use client';
import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Trash2, 
  Tag, 
  CheckCircle2, 
  X,
  CreditCard,
  Banknote,
  Minus,
  Plus,
  Printer,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Filter,
  Tag as TagIcon,
  Package
} from 'lucide-react';
import Pagination from '@/components/Pagination';

// Helper for image URLs
function thumbUrl(src, w = 300) {
  if (!src || !src.includes('cloudinary.com')) return src;
  return src.replace('/upload/', `/upload/w_${w},h_${w},c_fill,q_auto/`);
}

function getImgSrcs(item) {
  if (!item) return [];
  // Prefer the new multiple photos field
  if (item.Photos && typeof item.Photos === 'string') {
    return item.Photos.split(',').filter(Boolean);
  }
  const photoField = item.Photo || item.Image_URL;
  if (!photoField || photoField === '0' || photoField === 'None') return [];
  const s = String(photoField).trim();
  if (s.startsWith('[')) {
    try {
      const urls = JSON.parse(s);
      return urls.length > 0 ? urls : [];
    } catch { return []; }
  }
  if (s.startsWith('http')) return [s];
  if (s.length > 30) return [`data:image/jpeg;base64,${s}`];
  return [];
}

export default function PosPage() {
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerAddress, setCustomerAddress] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [pointsUsed, setPointsUsed] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discountAmount, setDiscountAmount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filterBrand, setFilterBrand] = useState('All');

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastSaleData, setLastSaleData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [invRes, custRes] = await Promise.all([
          fetch('/api/inventory'),
          fetch('/api/customers')
        ]);
        const invData = await invRes.json();
        const custData = await custRes.json();
        setInventory(Array.isArray(invData) ? invData : []);
        setCustomers(Array.isArray(custData) ? custData : []);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const availableItems = useMemo(() => inventory.filter(i => i.status === 'Available'), [inventory]);
  const categories = ['All', ...new Set(availableItems.map(i => i.Category_Name).filter(Boolean))];
  const brands = ['All', ...new Set(availableItems.map(i => i.brand).filter(Boolean))];
  
  const filteredItems = useMemo(() => availableItems.filter(i => {
    const matchSearch = String(i.item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        String(i.barcode_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'All' || i.Category_Name === selectedCategory;
    const matchBrand = filterBrand === 'All' || i.brand === filterBrand;
    return matchSearch && matchCategory && matchBrand;
  }), [availableItems, searchQuery, selectedCategory, filterBrand]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, filterBrand]);

  const addToCart = (item) => {
    if (cart.find(c => c.barcode_id === item.barcode_id)) {
      setCart(cart.filter(c => c.barcode_id !== item.barcode_id));
      return;
    }
    setCart([...cart, item]);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.barcode_id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.selling_price || 0), 0);
  const total = Math.max(0, subtotal - discountAmount - pointsUsed);

  const findCustomer = () => {
    const searchNorm = phoneSearch; // Changed from phoneSearch.replace(/\D/g, '')
    const found = customers.find(c => {
      const cPhone = String(c.Phone_Number || c.Phone || ''); // Changed from .replace(/\D/g, '')
      return cPhone === searchNorm && searchNorm !== '';
    });
    if (found) {
      setSelectedCustomer(found);
      setCustomerAddress(found.Address || found.address || '');
      setNewCustomerName('');
    } else {
      setSelectedCustomer(null);
      setCustomerAddress('');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          customerPhone: phoneSearch,
          customerAddress,
          paymentMethod,
          discountAmount: discountAmount,
          pointsUsed,
          newCustomerName
        })
      });
      const data = await res.json();
      if (data.success) {
        setLastSaleData({
          saleId: data.saleId,
          cart: [...cart],
          total: total,
          customer: selectedCustomer || { name: newCustomerName || 'ลูกค้าทั่วไป', phone: phoneSearch },
          timestamp: new Date().toLocaleString('th-TH')
        });
        setShowResultModal(true);
        setCart([]);
        setPhoneSearch('');
        setSelectedCustomer(null);
        setCustomerAddress('');
        // Refresh inventory and customers
        const [invRes, custRes] = await Promise.all([fetch('/api/inventory'), fetch('/api/customers')]);
        setInventory(await invRes.json());
        setCustomers(await custRes.json());
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.error);
      }
    } catch (err) {
      alert('Error during checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] lg:h-[calc(100vh-120px)] overflow-hidden items-stretch">
      {/* Product Grid Section */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-hidden">
        <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-[24px] border border-slate-100 shadow-sm">
            <div className="relative flex-1 min-w-[200px] group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 transition-colors group-focus-within:text-indigo-500" />
                <input 
                    type="text" 
                    placeholder="ค้นหาสินค้าหรือบาร์โค้ด..." 
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border-none outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-sm text-slate-700"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            
            <div className="relative min-w-[120px]">
              <select 
                  className="w-full appearance-none bg-slate-50 px-4 py-2.5 rounded-xl border-none outline-none font-bold text-xs text-slate-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
              >
                  {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'ทุกหมวดหมู่' : c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative min-w-[120px]">
              <select 
                  className="w-full appearance-none bg-slate-50 px-4 py-2.5 rounded-xl border-none outline-none font-bold text-xs text-slate-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  value={filterBrand}
                  onChange={e => setFilterBrand(e.target.value)}
              >
                  {brands.map(b => <option key={b} value={b}>{b === 'All' ? 'ทุกแบรนด์' : b}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
            {paginatedItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-4">
                <Package className="w-16 h-16 opacity-20" />
                <p className="font-bold text-sm">ไม่พบสินค้าที่คุณต้องการ</p>
              </div>
            ) : (
              <>
                <div className="product-grid mb-6">
                    {paginatedItems.map(item => (
                      <ProductCard 
                        key={item.barcode_id} 
                        item={item} 
                        inCart={cart.some(c => c.barcode_id === item.barcode_id)}
                        onAdd={() => addToCart(item)}
                      />
                    ))}
                </div>
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                  totalItems={filteredItems.length}
                />
              </>
            )}
        </div>
      </div>

      {/* Cart & Checkout Section */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4 h-full">
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-bold text-lg">ตะกร้าสินค้า</span>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{cart.length} ชิ้น</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                        <ShoppingCart className="w-16 h-16 mb-4" />
                        <p className="text-sm font-medium">ยังไม่มีสินค้าในตะกร้า</p>
                    </div>
                ) : cart.map(item => (
                    <div key={item.barcode_id} className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 group">
                        <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                           <img src={thumbUrl(getImgSrcs(item)[0], 80)} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-700 truncate">{item.item_name}</h4>
                            <p className="text-[10px] text-slate-400">{item.barcode_id}</p>
                            <div className="text-sm font-black text-indigo-600 mt-0.5">฿{parseFloat(item.selling_price || 0).toLocaleString()}</div>
                        </div>
                        <button 
                            onClick={() => removeFromCart(item.barcode_id)}
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors self-center"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                {/* Customer Section */}
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input 
                            type="tel" 
                            placeholder="เบอร์โทรลูกค้า..." 
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                            value={phoneSearch}
                            onChange={e => setPhoneSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && findCustomer()}
                        />
                        <button 
                            onClick={findCustomer}
                            className="px-4 py-2.5 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-200"
                        >
                            ค้นหา
                        </button>
                    </div>
                    {selectedCustomer ? (
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-bold text-emerald-800">{selectedCustomer.Customer_Name || selectedCustomer.Name}</span>
                            </div>
                            <span className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">{selectedCustomer.Points} PTS</span>
                        </div>
                    ) : phoneSearch && (
                        <input 
                             type="text" 
                             placeholder="ชื่อลูกค้า (สำหรับลงทะเบียนใหม่)" 
                             className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                             value={newCustomerName}
                             onChange={e => setNewCustomerName(e.target.value)}
                        />
                    )}
                    {(selectedCustomer || phoneSearch) && (
                        <textarea 
                            placeholder="ที่อยู่จัดส่ง..." 
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none h-16"
                            value={customerAddress}
                            onChange={e => setCustomerAddress(e.target.value)}
                        />
                    )}
                </div>

                {/* Totals */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-500 font-medium">
                        <span>รวมยอดสินค้า</span>
                        <span>฿{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                        <span>ยอดสุทธิ</span>
                        <span className="text-2xl text-indigo-600">฿{total.toLocaleString()}</span>
                    </div>
                </div>

                {/* Checkout Button */}
                <button 
                    disabled={cart.length === 0 || checkoutLoading}
                    onClick={handleCheckout}
                    className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all text-lg disabled:opacity-50 disabled:scale-100"
                >
                    {checkoutLoading ? 'กำลังบันทึก...' : 'ยืนยันรายการขาย'}
                </button>
            </div>
        </div>
      </div>

      {/* Result & Receipt Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 text-center bg-emerald-50 relative overflow-hidden">
                 <div className="mb-4 inline-flex items-center justify-center w-20 h-20 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-200">
                    <CheckCircle2 className="w-10 h-10" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-800">บันทึกการขายสำเร็จ!</h2>
                 <p className="text-emerald-700 font-bold text-sm mt-1">เลขที่อ้างอิง: {lastSaleData?.saleId}</p>
                 
                 {/* Decorative circles */}
                 <div className="absolute -top-10 -left-10 w-24 h-24 bg-emerald-100 rounded-full opacity-50"></div>
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-200 rounded-full opacity-30"></div>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="flex justify-between items-center text-sm font-bold border-b border-slate-100 pb-4 text-slate-400">
                    <span>รายการสินค้า x{lastSaleData?.cart.length}</span>
                    <span className="text-slate-800">฿{lastSaleData?.total.toLocaleString()}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                       onClick={() => setShowResultModal(false)}
                       className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                       ทำรายการใหม่
                    </button>
                    <button 
                       onClick={() => window.print()}
                       className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                       <Printer className="w-5 h-5" />
                       พิมพ์ใบเสร็จ
                    </button>
                 </div>
              </div>
              
              {/* Receipt Template (Hidden normally, used for printing) */}
              <style jsx global>{`
                @media print {
                  body * { visibility: hidden; }
                  #receipt-print, #receipt-print * { visibility: visible; }
                  #receipt-print { 
                    position: absolute; 
                    left: 0; 
                    top: 0; 
                    width: 80mm; /* Standard Thermal Paper Width */
                  }
                }
              `}</style>
              <div id="receipt-print" className="hidden print:block p-4 font-mono text-[11px] leading-tight">
                <div className="text-center mb-4">
                  <h1 className="font-bold text-lg">THRIFT POS</h1>
                  <p>ระบบจัดการหลังบ้านครบวงจร</p>
                  <p>โทร. 0XX-XXX-XXXX</p>
                </div>
                <div className="border-t border-dashed my-2"></div>
                <div className="mb-2">
                  <p>ID: {lastSaleData?.saleId}</p>
                  <p>Date: {lastSaleData?.timestamp}</p>
                  <p>Cust: {lastSaleData?.customer?.Name || 'N/A'}</p>
                </div>
                <div className="border-t border-dashed my-2"></div>
                <div className="space-y-1">
                  {lastSaleData?.cart.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate w-32">{item.Item_Name}</span>
                      <span>{parseFloat(item.Price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed my-2"></div>
                <div className="flex justify-between font-black">
                  <span>TOTAL:</span>
                  <span>฿{lastSaleData?.total.toLocaleString()}</span>
                </div>
                <div className="text-center mt-6">
                  <p>*** ขอบคุณที่ใช้บริการ ***</p>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ item, inCart, onAdd }) {
  const [imgIdx, setImgIdx] = useState(0);
  const srcs = useMemo(() => getImgSrcs(item), [item]);

  const nextImg = (e) => {
    e.stopPropagation();
    setImgIdx((imgIdx + 1) % srcs.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setImgIdx((imgIdx - 1 + srcs.length) % srcs.length);
  };

  return (
    <div 
      onClick={onAdd}
      className={`group bg-white rounded-3xl border p-3 cursor-pointer transition-all hover:shadow-xl relative flex flex-col
        ${inCart ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100'}`}
    >
      <div className="aspect-square bg-slate-100 rounded-2xl mb-3 overflow-hidden flex relative group/img">
        {srcs.length > 0 ? (
          <>
            <img 
              src={thumbUrl(srcs[imgIdx], 400)} 
              className="w-full h-full object-cover transition-transform duration-300" 
              alt="" 
            />
            {srcs.length > 1 && (
              <>
                <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                  {srcs.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                  ))}
                </div>
                <button 
                  onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-all border border-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-all border border-white/20"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Tag className="w-12 h-12 text-slate-300" /></div>
        )}
        {inCart && (
          <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center backdrop-blur-[1px]">
            <CheckCircle2 className="w-10 h-10 text-indigo-600" />
          </div>
        )}
      </div>
      <h3 className="text-[13px] font-bold text-slate-800 line-clamp-1 leading-snug mb-0.5">{item.item_name}</h3>
      <p className="text-[10px] text-slate-400 mb-2">{item.brand} • {item.size || 'F'}</p>
      <div className="mt-auto flex justify-between items-center">
        <span className="text-base font-black text-indigo-600">฿{parseFloat(item.selling_price || 0).toLocaleString()}</span>
        <span className="text-[9px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded-md font-mono">{item.barcode_id}</span>
      </div>
    </div>
  );
}
