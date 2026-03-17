'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  onItemsPerPageChange,
  totalItems 
}) {
  if (totalItems <= 10 && currentPage === 1 && totalPages <= 1) return null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-6 border-t border-slate-100 mt-auto">
      <div className="flex items-center gap-2 order-2 md:order-1">
        <button 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2.5 bg-white border border-slate-100 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        
        <div className="bg-white border border-slate-100 px-6 py-2.5 rounded-xl font-black text-sm text-slate-600 shadow-sm flex items-center">
          {currentPage} <span className="text-slate-300 mx-2">/</span> {totalPages || 1}
        </div>

        <button 
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2.5 bg-white border border-slate-100 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="flex items-center gap-3 order-1 md:order-2">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Rows per page</span>
        <select 
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="bg-white border border-slate-100 px-4 py-2 rounded-xl text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer shadow-sm"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}
