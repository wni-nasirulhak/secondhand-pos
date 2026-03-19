'use client';
import { ShoppingBag, Trash2, User, Phone, X, ChevronRight } from 'lucide-react';
import { thumbUrl, getImgSrcs, formatBaht } from '@/lib/utils';

export default function PosCart({ 
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
    <div className="w-full lg:w-[400px] bg-white border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col h-auto lg:h-full min-h-[400px] lg:min-h-0 relative overflow-hidden rounded-t-[32px] lg:rounded-none shadow-2xl lg:shadow-none">
      {/* Search Customer */}
      <div className="p-3 border-b border-slate-50 bg-slate-50/30">
        <div className="relative group mb-2">
          <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-indigo-500" />
          <input 
            type="text"
            placeholder="เบอร์โทรลูกค้า..."
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && findCustomer()}
            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-100 rounded-lg text-xs font-bold outline-none focus:border-indigo-400 transition-all font-['Prompt']"
          />
        </div>

        {selectedCustomer ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
              <div className="min-w-0">
                <div className="text-xs font-bold text-emerald-800 truncate leading-none mb-0.5">{selectedCustomer.Customer_Name || selectedCustomer.Name}</div>
                <div className="text-[10px] text-emerald-600 font-bold leading-none">{selectedCustomer.Phone_Number}</div>
              </div>
              <button onClick={() => findCustomer('')} className="text-emerald-400 hover:text-emerald-600 px-1"><X size={12} /></button>
            </div>
            <textarea 
              placeholder="ที่อยู่ลูกค้า..."
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-slate-100 rounded-lg text-[10px] font-bold outline-none focus:border-indigo-400 min-h-[45px] resize-none"
            />
          </div>
        ) : phoneSearch.length >= 10 && (
          <div className="space-y-1.5 p-1.5 bg-indigo-50/50 rounded-lg border border-indigo-100">
             <input 
               type="text"
               placeholder="ชื่อลูกค้าใหม่..."
               value={newCustomerName}
               onChange={(e) => setNewCustomerName(e.target.value)}
                className="w-full px-2 py-1.5 text-[10px] font-bold rounded bg-white border border-indigo-100 outline-none"
             />
             <textarea 
               placeholder="ที่อยู่ (ถ้ามี)..."
               value={customerAddress}
               onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-2 py-1.5 text-[10px] font-bold rounded bg-white border border-indigo-100 outline-none min-h-[45px] resize-none"
             />
             <button onClick={findCustomer} className="w-full py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded hover:bg-indigo-700 transition-all uppercase">เพิ่มลูกค้า</button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 bg-slate-50/20">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20 scale-75">
            <ShoppingBag className="w-10 h-10 mb-2" />
            <p className="text-xs font-black uppercase tracking-tighter">ตะกร้าว่าง</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.barcode_id} className="flex gap-2 p-1.5 bg-white rounded-lg border border-slate-50 hover:border-indigo-100 transition-all relative group">
               <div className="w-10 h-10 rounded-md bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                  {getImgSrcs(item).length > 0 ? (
                    <img src={thumbUrl(getImgSrcs(item)[0], 80)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200"><ShoppingBag size={14} /></div>
                  )}
               </div>
               <div className="flex-1 min-w-0 pr-5">
                  <div className="text-xs font-black text-slate-800 line-clamp-1 leading-tight mb-0.5">{item.item_name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{item.barcode_id}</div>
                  <div className="text-xs font-black text-indigo-600">{formatBaht(item.selling_price || 0)}</div>
               </div>
               <button 
                  onClick={() => removeFromCart(item.barcode_id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-200 hover:text-rose-500 transition-colors"
                >
                 <Trash2 size={12} />
               </button>
            </div>
          ))
        )}
      </div>

      {/* Summary Section */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Subtotal</span>
            <span>{formatBaht(subtotal)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 py-1 border-t border-slate-50">
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] font-black text-slate-400 uppercase">Discount</label>
              <input type="number" value={discountAmount} onChange={e => setDiscountAmount(Number(e.target.value))} className="w-full px-1.5 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold outline-none"/>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] font-black text-slate-400 uppercase">Points Used</label>
              <input type="number" value={pointsUsed} onChange={e => setPointsUsed(Number(e.target.value))} className="w-full px-1.5 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold outline-none"/>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] font-black text-slate-400 uppercase">Shipping</label>
              <input type="number" value={shippingCost} onChange={e => setShippingCost(Number(e.target.value))} className="w-full px-1.5 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold outline-none"/>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] font-black text-slate-400 uppercase">Packing/Other</label>
              <input type="number" value={packingCost + otherCost} onChange={e => setPackingCost(Number(e.target.value))} className="w-full px-1.5 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold outline-none"/>
            </div>
          </div>

          <div className="flex justify-between text-[16px] font-black text-slate-800 border-t border-slate-100 pt-1.5">
            <span>Total</span>
            <span className="text-indigo-600">{formatBaht(total)}</span>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={cart.length === 0 || checkoutLoading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 text-white font-black rounded-lg shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs"
        >
          {checkoutLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronRight size={16} />}
          {checkoutLoading ? 'Processing...' : 'ชำระเงิน'}
        </button>
      </div>
    </div>
  );
}
