'use client';
import { CheckCircle2, Printer } from 'lucide-react';
import { formatBaht } from '@/lib/utils';

export default function PosReceiptModal({ show, onClose, lastSaleData }) {
  if (!show) return null;

  return (
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
                <span className="text-slate-800">{formatBaht(lastSaleData?.total || 0)}</span>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <button 
                   onClick={onClose}
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
                 <button 
                    onClick={() => window.location.href = `/printer?saleId=${lastSaleData?.saleId}`}
                    className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                 >
                    <Printer className="w-5 h-5" />
                    พิมพ์ใบปะหน้า
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
                width: 80mm; 
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
              <p>Cust: {lastSaleData?.customer?.Name || lastSaleData?.customer?.name || 'N/A'}</p>
            </div>
            <div className="border-t border-dashed my-2"></div>
            <div className="space-y-1">
              {lastSaleData?.cart.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="truncate w-32">{item.item_name}</span>
                  <span>{formatBaht(item.selling_price || 0)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed my-2"></div>
            <div className="flex justify-between font-black">
              <span>TOTAL:</span>
              <span>{formatBaht(lastSaleData?.total || 0)}</span>
            </div>
            <div className="text-center mt-6">
              <p>*** ขอบคุณที่ใช้บริการ ***</p>
            </div>
          </div>
       </div>
    </div>
  );
}
