'use client';
import { ShoppingCart, Trash2, User } from 'lucide-react';
import { thumbUrl, getImgSrcs, formatBaht } from '@/lib/utils';

export default function PosCart({ 
  cart, removeFromCart, 
  phoneSearch, setPhoneSearch, findCustomer,
  selectedCustomer, newCustomerName, setNewCustomerName,
  customerAddress, setCustomerAddress,
  subtotal, total, checkoutLoading, handleCheckout 
}) {
  return (
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
                          <div className="text-sm font-black text-indigo-600 mt-0.5">{formatBaht(item.selling_price || 0)}</div>
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
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 font-bold"
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
                          <span className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">{selectedCustomer.Points || 0} PTS</span>
                      </div>
                  ) : phoneSearch && (
                      <input 
                           type="text" 
                           placeholder="ชื่อลูกค้า (สำหรับลงทะเบียนใหม่)" 
                           className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 font-bold"
                           value={newCustomerName}
                           onChange={e => setNewCustomerName(e.target.value)}
                      />
                  )}
                  {(selectedCustomer || phoneSearch) && (
                      <textarea 
                          placeholder="ที่อยู่จัดส่ง..." 
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none h-16 font-medium"
                          value={customerAddress}
                          onChange={e => setCustomerAddress(e.target.value)}
                      />
                  )}
              </div>

              {/* Totals */}
              <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-500 font-medium">
                      <span>รวมยอดสินค้า</span>
                      <span>{formatBaht(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>ยอดสุทธิ</span>
                      <span className="text-2xl text-indigo-600">{formatBaht(total)}</span>
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
  );
}
