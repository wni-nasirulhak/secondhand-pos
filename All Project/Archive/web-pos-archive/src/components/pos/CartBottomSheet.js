'use client';
import { ShoppingBag, Trash2, Phone, X, ChevronRight } from 'lucide-react';
import { thumbUrl, getImgSrcs, formatBaht } from '@/lib/utils';

export default function CartBottomSheet({ 
  isOpen, onClose,
  cart, removeFromCart, 
  phoneSearch, setPhoneSearch, findCustomer,
  selectedCustomer, newCustomerName, setNewCustomerName,
  customerAddress, setCustomerAddress,
  subtotal, total, checkoutLoading, handleCheckout,
  discountAmount, setDiscountAmount,
  shippingCost, setShippingCost,
  packingCost, setPackingCost,
  otherCost, setOtherCost,
  pointsUsed, setPointsUsed
}) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[160] lg:hidden transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '92vh' }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl flex flex-col" style={{ maxHeight: '92vh' }}>
          {/* Handle + Header */}
          <div className="shrink-0">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-indigo-600" />
                <span className="text-base font-black text-slate-800">ตะกร้าสินค้า</span>
                <span className="bg-indigo-100 text-indigo-600 text-xs font-black px-2 py-0.5 rounded-full">{cart.length}</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 active:scale-90 transition-all">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Customer Section */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block">ข้อมูลลูกค้า</label>
              <div className="relative group mb-2">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500" />
                <input 
                  type="tel"
                  inputMode="numeric"
                  placeholder="เบอร์โทรลูกค้า..."
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && findCustomer()}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 transition-all"
                />
              </div>

              {selectedCustomer ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-emerald-800 truncate leading-none mb-0.5">{selectedCustomer.Customer_Name || selectedCustomer.Name}</div>
                      <div className="text-xs text-emerald-600 font-bold leading-none">{selectedCustomer.Phone_Number || selectedCustomer.Phone}</div>
                    </div>
                    <button onClick={() => findCustomer('')} className="text-emerald-400 hover:text-emerald-600 p-1"><X size={16} /></button>
                  </div>
                  <textarea 
                    placeholder="ที่อยู่ลูกค้า..."
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 min-h-[60px] resize-none"
                  />
                </div>
              ) : phoneSearch.length >= 10 && (
                <div className="space-y-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <input 
                    type="text"
                    placeholder="ชื่อลูกค้าใหม่..."
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm font-bold rounded-lg bg-white border border-indigo-100 outline-none"
                  />
                  <textarea 
                    placeholder="ที่อยู่ (ถ้ามี)..."
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm font-bold rounded-lg bg-white border border-indigo-100 outline-none min-h-[60px] resize-none"
                  />
                  <button onClick={findCustomer} className="w-full py-2.5 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all uppercase">เพิ่มลูกค้า</button>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="p-4 space-y-2">
              {cart.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-slate-300">
                  <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-bold">ตะกร้าว่าง</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.barcode_id} className="flex gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm relative">
                    <div className="w-14 h-14 rounded-lg bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                      {getImgSrcs(item).length > 0 ? (
                        <img src={thumbUrl(getImgSrcs(item)[0], 120)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200"><ShoppingBag size={18} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="text-sm font-black text-slate-800 line-clamp-1 leading-tight mb-0.5">{item.item_name}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">{item.barcode_id}</div>
                      <div className="text-sm font-black text-indigo-600">{formatBaht(item.selling_price || 0)}</div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.barcode_id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 active:scale-90 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Summary + Pay Button (sticky bottom) */}
          <div className="shrink-0 p-4 border-t border-slate-100 bg-white" style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm font-bold text-slate-400">
                <span>Subtotal</span>
                <span>{formatBaht(subtotal)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 py-2 border-t border-slate-50">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">ส่วนลด</label>
                  <input type="number" inputMode="numeric" value={discountAmount} onChange={e => setDiscountAmount(Number(e.target.value))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold outline-none focus:border-indigo-400"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">แต้มใช้</label>
                  <input type="number" inputMode="numeric" value={pointsUsed} onChange={e => setPointsUsed(Number(e.target.value))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold outline-none focus:border-indigo-400"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">ค่าส่ง</label>
                  <input type="number" inputMode="numeric" value={shippingCost} onChange={e => setShippingCost(Number(e.target.value))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold outline-none focus:border-indigo-400"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">แพ็คกิ้ง/อื่นๆ</label>
                  <input type="number" inputMode="numeric" value={packingCost + otherCost} onChange={e => setPackingCost(Number(e.target.value))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold outline-none focus:border-indigo-400"/>
                </div>
              </div>

              <div className="flex justify-between text-lg font-black text-slate-800 border-t border-slate-100 pt-2">
                <span>รวมทั้งหมด</span>
                <span className="text-indigo-600">{formatBaht(total)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || checkoutLoading || (!selectedCustomer && phoneSearch.length < 10)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
            >
              {checkoutLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronRight size={20} />}
              {checkoutLoading ? 'กำลังดำเนินการ...' : 'ชำระเงิน'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
