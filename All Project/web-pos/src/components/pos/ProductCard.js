'use client';
import { useState, useMemo } from 'react';
import { Tag, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
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
      className={`group bg-white rounded-3xl border p-3 cursor-pointer transition-all hover:shadow-xl relative flex flex-col h-full
        ${inCart ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100'}`}
    >
      <div className="aspect-square bg-slate-100 rounded-2xl mb-3 overflow-hidden flex relative group/img">
        {srcs.length > 0 ? (
          <>
            <img 
              src={thumbUrl(srcs[imgIdx], 400)} 
              className="w-full h-full object-cover transition-transform duration-300" 
              alt={item.item_name} 
              loading="lazy"
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
          <div className="w-full h-full flex items-center justify-center">
            <Tag className="w-12 h-12 text-slate-300" />
          </div>
        )}
        {inCart && (
          <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center backdrop-blur-[1px]">
            <CheckCircle2 className="w-10 h-10 text-indigo-600" />
          </div>
        )}
      </div>
      <h3 className="text-[13px] font-bold text-slate-800 line-clamp-1 leading-snug mb-0.5">{item.item_name}</h3>
      <p className="text-[10px] text-slate-400 mb-2">{item.brand || 'No Brand'} • {item.size || 'F'}</p>
      <div className="mt-auto flex justify-between items-center">
        <span className="text-base font-black text-indigo-600">{formatBaht(item.selling_price || 0)}</span>
        <span className="text-[9px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded-md font-mono">{item.barcode_id}</span>
      </div>
    </div>
  );
}
