'use client';
import { useState, useMemo } from 'react';
import { Package, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { thumbUrl, getImgSrcs, formatBaht } from '@/lib/utils';

export default function ProductCard({ item, inCart, onAdd }) {
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
      className={`relative bg-white rounded-lg md:rounded-2xl border transition-all cursor-pointer group flex flex-col h-full overflow-hidden ${
        inCart ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-indigo-50' : 'border-slate-100 hover:border-indigo-200'
      }`}
    >
      {/* Image Section */}
      <div className="relative aspect-square md:aspect-[4/3] bg-slate-50 overflow-hidden group/img">
        {srcs.length > 0 ? (
          <>
            <img 
              src={thumbUrl(srcs[imgIdx], 400)} 
              alt={item.item_name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {srcs.length > 1 && (
              <>
                <button 
                  onClick={prevImg}
                  className="absolute left-1 top-1/2 -translate-y-1/2 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-all"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button 
                  onClick={nextImg}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-all"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
             <Package className="w-6 h-6 md:w-10 md:h-10 opacity-20" />
          </div>
        )}
        
        {/* Badge */}
        <div className="absolute top-1 right-1">
          <span className={`text-[7px] md:text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm border ${
            item.status === 'Sold' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
            item.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
            'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
            {item.status}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-1.5 md:p-3 flex flex-col flex-1 gap-0.5">
        <div className="min-w-0">
          <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-tighter truncate leading-none mb-0.5">
            {item.brand || 'No Brand'}
          </p>
          <h3 className="text-[10px] md:text-sm font-black text-slate-800 leading-tight line-clamp-2 min-h-[2.2em]">
            {item.item_name}
          </h3>
        </div>

        <div className="mt-auto flex items-center justify-between gap-1.5 pt-1">
          <div className="min-w-0">
            <span className="text-sm md:text-xl font-black text-indigo-600 leading-none block">{formatBaht(item.selling_price || 0)}</span>
            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.barcode_id}</span>
          </div>
          
          <div className={`p-1 md:p-2 rounded-lg transition-all ${inCart ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
            {inCart ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : <Plus className="w-3 h-3 md:w-4 md:h-4" />}
          </div>
        </div>
      </div>
    </div>
  );
}
