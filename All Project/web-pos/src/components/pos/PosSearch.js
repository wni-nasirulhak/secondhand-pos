'use client';
import { Search, ChevronDown } from 'lucide-react';

export default function PosSearch({ 
  searchQuery, setSearchQuery, 
  selectedCategory, setSelectedCategory, 
  filterBrand, setFilterBrand,
  categories, brands 
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-[24px] border border-slate-100 shadow-sm">
        <div className="relative flex-1 min-w-[200px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 transition-colors group-focus-within:text-indigo-500" />
            <input 
                type="text" 
                placeholder="ค้นหาสินค้าหรือบาร์โค้ด..." 
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border-none outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-sm text-slate-700"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
        </div>
        
        <div className="relative min-w-[120px]">
          <select 
              className="w-full appearance-none bg-slate-50 px-4 py-2.5 rounded-xl border-none outline-none font-bold text-xs text-slate-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
          >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'ทุกหมวดหมู่' : c}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative min-w-[120px]">
          <select 
              className="w-full appearance-none bg-slate-50 px-4 py-2.5 rounded-xl border-none outline-none font-bold text-xs text-slate-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
          >
              {brands.map(b => <option key={b} value={b}>{b === 'All' ? 'ทุกแบรนด์' : b}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
    </div>
  );
}
