'use client';
import { Search, ChevronDown } from 'lucide-react';

export default function PosSearch({ 
  searchQuery, setSearchQuery, 
  selectedCategory, setSelectedCategory, 
  filterBrand, setFilterBrand,
  categories, brands 
}) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-1.5 md:p-3 rounded-xl md:rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-1.5">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-2.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-300 w-3 h-3 md:w-4 md:h-4" />
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 md:pl-10 pr-3 py-1 md:py-3 rounded-lg md:rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-[10px] md:text-sm text-slate-700"
          />
        </div>

        {/* Categories (Scrollable) */}
        <div className="category-scroll hide-scrollbar">
          <button
            onClick={() => setSelectedCategory('')}
            className={`category-chip !py-0.5 !px-2 !text-[9px] ${selectedCategory === '' ? 'active' : ''}`}
          >
            ทั้งหมด
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || (typeof cat === 'string' ? cat : cat.name)}
              onClick={() => setSelectedCategory(cat.id ? String(cat.id) : cat)}
              className={`category-chip !py-0.5 !px-2 !text-[9px] ${String(selectedCategory) === String(cat.id || cat) ? 'active' : ''}`}
            >
              {cat.name || cat}
            </button>
          ))}
        </div>

        {/* Brands (Compact Grid on Mobile) */}
        <div className="relative">
          <select 
            value={filterBrand} 
            onChange={(e) => setFilterBrand(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 md:px-4 md:py-2.5 font-bold text-slate-600 text-[9px] md:text-xs outline-none focus:border-indigo-400 transition-all cursor-pointer"
          >
            <option value="">ทุกแบรนด์</option>
            {brands.map(b => <option key={b} value={b}>{b === 'All' ? 'แบรนด์ทั้งหมด' : b}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
