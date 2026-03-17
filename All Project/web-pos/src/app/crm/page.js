'use client';
import { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Edit3, MapPin, Phone, Star, X, 
  Trash2, History, ChevronRight, TrendingUp, ShoppingBag, 
  Calendar, CreditCard, Loader2, UserPlus, Filter
} from 'lucide-react';

export default function CrmPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory(phone) {
    setHistoryLoading(true);
    setPurchaseHistory([]); // Reset to empty array before fetch
    try {
      const res = await fetch(`/api/customers/history?phone=${phone}`);
      const data = await res.json();
      setPurchaseHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPurchaseHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  const handleDeleteCustomer = async (phone) => {
    if (!confirm('ยืนยันการลบลูกค้ารายนี้? ข้อมูลการซื้อขายจะยังคงอยู่แต่ข้อมูลส่วนตัวจะถูกลบออก')) return;
    try {
      const res = await fetch('/api/customers/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (res.ok) {
        fetchCustomers();
        if (selectedCustomer?.Phone === phone) setSelectedCustomer(null);
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const term = searchQuery.toLowerCase();
      const phone = c.Phone || c.Phone_Number || '';
      const name = c.Name || c.Customer_Name || '';
      return phone.includes(term) || name.toLowerCase().includes(term);
    });
  }, [customers, searchQuery]);

  const stats = useMemo(() => {
    const totalSpent = customers.reduce((sum, c) => sum + (parseFloat(c.Total_Spent || c.Total_Purchase || 0)), 0);
    const avgSpent = totalSpent / (customers.length || 1);
    const vipCount = customers.filter(c => parseFloat(c.Total_Spent || 0) > 5000).length;
    return { totalSpent, avgSpent, vipCount, totalCustomers: customers.length };
  }, [customers]);

  const handleEdit = (c) => {
    setEditingCustomer(c);
    setEditName(c.Name || c.Customer_Name || '');
    setEditAddress(c.Address || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await fetch('/api/customers/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: editingCustomer.Phone || editingCustomer.Phone_Number,
          name: editName,
          address: editAddress ?? ''
        })
      });
      if (res.ok) {
        setEditingCustomer(null);
        fetchCustomers();
      }
    } catch (err) {
      alert('Update failed');
    } finally {
      setSaveLoading(false);
    }
  };

  const selectCustomer = (c) => {
    setSelectedCustomer(c);
    fetchHistory(c.Phone || c.Phone_Number);
  };

  if (loading && customers.length === 0) return (
    <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      <div className="text-slate-400 font-bold">กำลังโหลดข้อมูลลูกค้า...</div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
      {/* ── HEADER & QUICK STATS ────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Users className="w-10 h-10 text-indigo-600" />
            CRM <span className="text-slate-300">Analytics</span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 ml-1">ระบบวิเคราะห์และพฤติกรรมลูกค้าอัจฉริยะ</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Revenue (LTV)', value: `฿${stats.totalSpent.toLocaleString()}`, icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'VIP Members', value: stats.vipCount, icon: Star, color: 'bg-amber-50 text-amber-600' },
            { label: 'Avg Sale', value: `฿${stats.avgSpent.toFixed(0)}`, icon: CreditCard, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Total Base', value: stats.totalCustomers, icon: Users, color: 'bg-slate-50 text-slate-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4 min-w-[180px]">
              <div className={`p-3 rounded-2xl ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{s.label}</div>
                <div className="text-lg font-black text-slate-800">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* ── CUSTOMER LIST ─────────────────────────────────── */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 transition-colors group-focus-within:text-indigo-500" />
              <input 
                type="text"
                placeholder="ค้นหาชื่อ หรือ เบอร์โทรศัพท์..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-700"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Info</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">LTV (ยอดรวม)</th>
                  <th className="px-8 py-6 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCustomers.map(cust => (
                  <tr 
                    key={cust.Phone || cust.Phone_Number} 
                    onClick={() => selectCustomer(cust)}
                    className={`group cursor-pointer transition-all ${selectedCustomer?.Phone === cust.Phone ? 'bg-indigo-50/50' : 'hover:bg-slate-50/30'}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl border border-slate-200 uppercase">
                          {(cust.Name || 'C')[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 text-lg leading-tight">{cust.Name || cust.Customer_Name}</span>
                          <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 mt-1">
                            <Phone className="w-3 h-3 text-indigo-400" /> {cust.Phone || cust.Phone_Number}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {parseFloat(cust.Total_Spent || 0) > 5000 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-wider">
                          <Star className="w-3 h-3 fill-amber-500" /> VIP
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="text-lg font-black text-slate-800">฿{parseFloat(cust.Total_Spent || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-500 font-black uppercase">{parseInt(cust.Points || 0)} pts earned</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(cust); }}
                          className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm border border-slate-100 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(cust.Phone || cust.Phone_Number); }}
                          className="p-2.5 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-sm border border-slate-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-slate-200" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CUSTOMER DETAIL PANEL ───────────────────────── */}
        <div className="xl:col-span-4 sticky top-8">
          {selectedCustomer ? (
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-right-4">
              <div className="p-8 bg-indigo-600 text-white relative">
                 <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-black border border-white/30 uppercase">
                      {(selectedCustomer.Name || 'C')[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black leading-tight">{selectedCustomer.Name || selectedCustomer.Customer_Name}</h2>
                      <div className="text-indigo-200 font-bold mt-1 flex items-center justify-center gap-1.5">
                        <Phone className="w-4 h-4" /> {selectedCustomer.Phone || selectedCustomer.Phone_Number}
                      </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedCustomer(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
                   <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-3xl">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Value</div>
                    <div className="text-xl font-black text-indigo-600">฿{parseFloat(selectedCustomer.Total_Spent || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Points Balance</div>
                    <div className="text-xl font-black text-emerald-600">{parseInt(selectedCustomer.Points || 0).toLocaleString()}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wider">
                    <History className="w-4 h-4 text-indigo-500" />
                    Purchase History
                  </div>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {historyLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-200 w-8 h-8"/></div>
                    ) : (!Array.isArray(purchaseHistory) || purchaseHistory.length === 0) ? (
                      <div className="text-center py-10 text-slate-300 text-xs font-bold">ไม่พบประวัติการสั่งซื้อ</div>
                    ) : (
                      purchaseHistory.map(sale => {
                        const items = (sale.items_detail || '').split(';;').filter(Boolean).map(it => {
                          const [name, barcode] = it.split('||');
                          return { name, barcode };
                        });

                        return (
                          <div key={sale.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl group hover:bg-white hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">SALE-{sale.id}</span>
                              <span className="text-lg font-black text-slate-800">฿{parseFloat(sale.total_amount).toLocaleString()}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 mb-3">
                               <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(sale.created_at).toLocaleDateString()}</span>
                               <span className="w-1 h-1 bg-slate-200 rounded-full" />
                               <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3"/> {sale.total_items} items</span>
                            </div>

                            {/* Item List */}
                            <div className="space-y-2 border-t border-slate-100 pt-3">
                              {items.map((it, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white/50 p-2 rounded-xl border border-dotted border-slate-200">
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-slate-700">{it.name}</span>
                                    <span className="text-[9px] font-bold text-slate-400 font-mono">{it.barcode}</span>
                                  </div>
                                  <a 
                                    href={`/inventory?search=${it.barcode}`}
                                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
                                  >
                                    View Product
                                  </a>
                                </div>
                              ))}
                            </div>

                            {sale.discount > 0 && (
                              <div className="mt-3 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg inline-block">Discount: -฿{sale.discount.toLocaleString()}</div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <MapPin className="w-4 h-4" /> Shipping Address
                  </div>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                    {selectedCustomer.Address || 'ยังไม่ระบุที่อยู่'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[600px] bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-4 p-8 text-center animate-in fade-in">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                <Users className="w-10 h-10" />
              </div>
              <div>
                <div className="text-lg font-black uppercase tracking-widest text-slate-400">Select a Customer</div>
                <div className="text-xs font-bold mt-1">คลิกที่รายชื่อเพื่อเรียกดูประวัติและข้อมูลเชิงลึก</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── EDIT MODAL ────────────────────────────────────── */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
                <div className="p-10 space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">
                             <Edit3 className="w-6 h-6" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">แก้ไขข้อมูลส่วนตัว</h2>
                            <p className="text-slate-400 text-xs font-bold mt-0.5">เบอร์โทรศัพท์: {editingCustomer.Phone || editingCustomer.Phone_Number}</p>
                          </div>
                        </div>
                        <button onClick={() => setEditingCustomer(null)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 transition-all"><X/></button>
                    </div>
                    
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Identifier (ชื่อเรียก)</label>
                            <input 
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-5 outline-none focus:border-indigo-500 focus:bg-white transition-all font-black text-slate-800 text-lg"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder="เช่น คุณล้อหล่อ, คุณลูกค้า VIP"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shipping Logistics (ที่อยู่จัดส่ง)</label>
                            <textarea 
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-5 outline-none focus:border-indigo-500 focus:bg-white transition-all min-h-[160px] font-bold text-slate-600 leading-relaxed"
                                value={editAddress}
                                onChange={e => setEditAddress(e.target.value)}
                                placeholder="ระบุบ้านเลขที่, ถนน, แขวง/เขต..."
                            />
                        </div>
                        
                        <div className="pt-6 flex gap-4">
                            <button 
                                type="button"
                                onClick={() => setEditingCustomer(null)}
                                className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-3xl hover:bg-slate-200 transition-all"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                type="submit"
                                disabled={saveLoading}
                                className="flex-[2] bg-indigo-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saveLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {saveLoading ? 'กำลังบันทึก...' : 'อัปเดตข้อมูล'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
