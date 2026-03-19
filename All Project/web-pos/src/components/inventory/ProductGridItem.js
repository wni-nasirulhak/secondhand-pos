'use client';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Tag, Edit } from 'lucide-react';
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
      className={`group bg-white rounded-2xl md:rounded-3xl border p-1.5 md:p-3 cursor-pointer transition-all hover:shadow-xl relative flex flex-col h-full
        ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100'}`}
    >
      {/* Selector Checkbox (Small) */}
      <div 
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`absolute top-2.5 left-2.5 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
          isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white/80 border-white/20 hover:border-white/40'
        }`}
      >
        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
      </div>

      <div className="aspect-[4/5] bg-slate-100 rounded-xl md:rounded-2xl mb-2 overflow-hidden flex relative group/img">
        {srcs.length > 0 ? (
          <>
            <img 
              src={thumbUrl(srcs[imgIdx], 400)} 
              className="w-full h-full object-cover transition-transform duration-300" 
              alt={item.item_name}
            />
            {srcs.length > 1 && (
              <>
                <button 
                  onClick={prevImg}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-all z-10"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={nextImg}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-all z-10"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute inset-x-0 bottom-1.5 flex justify-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                  {srcs.map((_, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Tag className="w-8 h-8 text-slate-300" /></div>
        )}
        
        <div className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm ${statusColor}`}>
          {item.status === 'Available' ? 'พร้อมขาย' : item.status === 'Pending Print' ? 'รอพิมพ์' : 'ขายแล้ว'}
        </div>
      </div>

      <div className="px-1 flex flex-col flex-1 pb-1">
        <h3 className="text-[11px] md:text-[13px] font-bold text-slate-800 line-clamp-2 leading-tight mb-1 h-[2.4em]">{item.item_name}</h3>
        <p className="text-[9px] md:text-[10px] text-slate-400 mb-1.5 truncate uppercase tracking-tighter">{item.brand || 'No Brand'} • {item.Category_Name}</p>
        <div className="mt-auto flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-black text-indigo-600 leading-none">{formatBaht(item.selling_price || 0)}</span>
            <span className="text-[7px] text-slate-300 font-mono tracking-tighter mt-0.5">{item.barcode_id}</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            className="p-1 md:p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100"
          >
            <Edit className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
