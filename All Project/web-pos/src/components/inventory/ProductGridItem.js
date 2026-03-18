'use client';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { thumbUrl, getImgSrcs, formatBaht } from '@/lib/utils';

export default function ProductGridItem({ item, onEdit, isSelected, onToggle }) {
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

  const statusColor = {
    'Available': 'bg-emerald-100 text-emerald-700',
    'Pending Print': 'bg-amber-100 text-amber-700',
    'Sold': 'bg-slate-100 text-slate-500'
  }[item.status] || 'bg-slate-100 text-slate-500';

  return (
    <div 
      onClick={() => onEdit(item)}
      className={`group bg-white rounded-3xl border p-3 cursor-pointer transition-all hover:shadow-xl relative flex flex-col h-full
        ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100'}`}
    >
      {/* Selector Checkbox (Small) */}
      <div 
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`absolute top-5 left-5 z-10 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white/80 border-white/20 hover:border-white/40'
        }`}
      >
        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>

      <div className="aspect-square bg-slate-100 rounded-2xl mb-3 overflow-hidden flex relative group/img">
        {srcs.length > 0 ? (
          <>
            <img 
              src={thumbUrl(srcs[imgIdx], 400)} 
              className="w-full h-full object-cover transition-transform duration-300" 
              alt={item.item_name}
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-all border border-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-all border border-white/20"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Tag className="w-12 h-12 text-slate-300" /></div>
        )}
        
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm ${statusColor}`}>
          {item.status}
        </div>
      </div>

      <div className="px-1 flex flex-col flex-1">
        <h3 className="text-[13px] font-bold text-slate-800 line-clamp-1 leading-snug mb-0.5">{item.item_name}</h3>
        <p className="text-[10px] text-slate-400 mb-2 truncate">{item.brand || 'No Brand'} • {item.Category_Name}</p>
        <div className="mt-auto flex justify-between items-center">
          <span className="text-base font-black text-slate-900">{formatBaht(item.selling_price || 0)}</span>
          <span className="text-[9px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded-md font-mono border border-slate-100">{item.barcode_id}</span>
        </div>
      </div>
    </div>
  );
}
