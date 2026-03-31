'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, ShoppingBag, Store, MessageCircle, X, ChevronLeft, ChevronRight,
  SlidersHorizontal, Heart, ArrowUpDown, ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import { getImgSrcs, thumbUrl, formatBaht } from '@/lib/utils';

/* ─────────────────────────────────────
   Condition badge colours
───────────────────────────────────── */
const CONDITION_STYLE = {
  'ไร้ตำหนิ': 'bg-emerald-500 text-white',
  'สภาพดี':   'bg-blue-500 text-white',
  'สภาพดีมาก':'bg-sky-500 text-white',
  'มีตำหนิ':  'bg-amber-400 text-white',
};
function conditionStyle(c) {
  return CONDITION_STYLE[c] || 'bg-gray-400 text-white';
}

/* ─────────────────────────────────────
   Announcement ticker
───────────────────────────────────── */
const TICKER_TEXT = '🛍️ ช้อปเสื้อผ้ามือสองคัดเกรด · RIZAN THRIFT · ของแท้ทุกชิ้น · จัดส่งทั่วประเทศ · ติดต่อสั่งซื้อผ่าน LINE · 🛍️ ช้อปเสื้อผ้ามือสองคัดเกรด · RIZAN THRIFT · ของแท้ทุกชิ้น · จัดส่งทั่วประเทศ · ติดต่อสั่งซื้อผ่าน LINE';

function AnnouncementBar() {
  return (
    <div className="shop-ticker bg-gray-900 text-white text-[11px] font-bold py-2 overflow-hidden whitespace-nowrap">
      <div className="shop-ticker-inner inline-block">
        <span>{TICKER_TEXT} &nbsp;&nbsp;&nbsp;&nbsp;{TICKER_TEXT}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Main page
───────────────────────────────────── */
export default function PublicShopPage() {
  const shopRef = useRef(null);

  // Data
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  // Filters (applied state)
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery]        = useState('');
  const [sort, setSort]                      = useState('');

  // Drawer filters (draft, committed on apply)
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [draftBrand, setDraftBrand]     = useState('');
  const [draftCondition, setDraftCondition] = useState('');
  const [draftMinPrice, setDraftMinPrice]   = useState('');
  const [draftMaxPrice, setDraftMaxPrice]   = useState('');
  // Applied filters
  const [appliedBrand, setAppliedBrand]       = useState('');
  const [appliedCondition, setAppliedCondition] = useState('');
  const [appliedMin, setAppliedMin]           = useState('');
  const [appliedMax, setAppliedMax]           = useState('');

  // Detail
  const [selectedItem, setSelectedItem] = useState(null);
  const [imgIdx, setImgIdx]             = useState(0);
  const [wishlist, setWishlist]         = useState(new Set());
  const [copied, setCopied]             = useState(false);

  // Search
  const [searchBarOpen, setSearchBarOpen] = useState(false);

  /* ── fetch products ── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set('category', activeCategory);
      if (appliedBrand)   params.set('brand', appliedBrand);
      if (appliedCondition) params.set('condition', appliedCondition);
      if (appliedMin)     params.set('minPrice', appliedMin);
      if (appliedMax)     params.set('maxPrice', appliedMax);
      if (sort)           params.set('sort', sort);
      const res  = await fetch(`/api/shop?${params.toString()}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, appliedBrand, appliedCondition, appliedMin, appliedMax, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ── fetch categories ── */
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d.data) ? d.data : (Array.isArray(d) ? d : [])))
      .catch(() => {});
  }, []);

  /* ── client-side search filter ── */
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p =>
      String(p.item_name || '').toLowerCase().includes(q) ||
      String(p.brand || '').toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  /* ── active filter count badge ── */
  const filterCount = [appliedBrand, appliedCondition, appliedMin, appliedMax].filter(Boolean).length;

  /* ── Apply drawer ── */
  function applyDrawer() {
    setAppliedBrand(draftBrand);
    setAppliedCondition(draftCondition);
    setAppliedMin(draftMinPrice);
    setAppliedMax(draftMaxPrice);
    setDrawerOpen(false);
  }
  function clearDrawer() {
    setDraftBrand(''); setDraftCondition(''); setDraftMinPrice(''); setDraftMaxPrice('');
    setAppliedBrand(''); setAppliedCondition(''); setAppliedMin(''); setAppliedMax('');
    setDrawerOpen(false);
  }
  function openDrawer() {
    setDraftBrand(appliedBrand); setDraftCondition(appliedCondition);
    setDraftMinPrice(appliedMin); setDraftMaxPrice(appliedMax);
    setDrawerOpen(true);
  }

  /* ── Unique brands from loaded products ── */
  const brands = useMemo(() => {
    const set = new Set(products.map(p => p.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  /* ── Wishlist toggle ── */
  function toggleWishlist(e, id) {
    e.stopPropagation();
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* ── Open product ── */
  function openProduct(item) {
    setSelectedItem(item);
    setImgIdx(0);
    setCopied(false);
    document.body.style.overflow = 'hidden';
  }
  function closeProduct() {
    setSelectedItem(null);
    document.body.style.overflow = '';
  }

  /* ── Scroll to shop ── */
  function scrollToShop() {
    shopRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  /* ── LINE url ── */
  function lineUrl(item) {
    const text = `สวัสดีครับ สนใจสินค้าชิ้นนี้ครับ\n\n- ${item.item_name}\n- รหัส: ${item.barcode_id}\n- ราคา: ${formatBaht(item.selling_price)}\n- ลิงค์: ${typeof window !== 'undefined' ? window.location.href : ''}`;
    return `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
  }

  /* ── Copy product info ── */
  function copyInfo(item) {
    const text = `${item.item_name}\nราคา: ${formatBaht(item.selling_price)}\nรหัส: ${item.barcode_id}`;
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  }

  return (
    <>
      {/* ── Ticker ── */}
      <AnnouncementBar />

      <div className="min-h-screen bg-[#f7f7f7] pb-20 font-sans">

        {/* ── HEADER ── */}
        <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                <Store className="w-4 h-4" />
              </div>
              <div className="leading-none">
                <div className="text-sm font-black text-gray-900 tracking-tight">RIZAN THRIFT</div>
                <div className="text-[9px] text-gray-400 font-medium">คัดเกรดของแท้</div>
              </div>
            </div>

            {/* Desktop search */}
            <div className="hidden md:flex flex-1 max-w-sm mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า แบรนด์..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 rounded-full py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-black outline-none border-none"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchBarOpen(v => !v)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>
              <a
                href="https://line.me/ti/p/~@rizanthrift"
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06C755] text-white rounded-full font-bold text-xs hover:bg-[#05b34c] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LINE</span>
              </a>
            </div>
          </div>

          {/* Mobile search bar (drawer) */}
          {searchBarOpen && (
            <div className="md:hidden px-4 pb-3">
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="ค้นหาสินค้า แบรนด์..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 rounded-full py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-black outline-none border-none"
                />
                <button onClick={() => { setSearchQuery(''); setSearchBarOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ── HERO BANNER ── */}
        <div className="relative bg-gray-900 overflow-hidden" style={{ minHeight: 220 }}>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558171813-0c4e50c6c854?w=1200&q=80')" }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-14 px-6">
            <div className="inline-block bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1 text-white text-[11px] font-bold uppercase tracking-widest mb-4">
              ✨ Sustainable Fashion
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3">
              เสื้อผ้ามือสอง<br />
              <span className="text-yellow-400">คัดเกรด · ของแท้</span>
            </h1>
            <p className="text-white/70 text-sm mb-6 max-w-xs">รองเท้า เสื้อผ้า แบรนด์แท้ ราคาสบายกระเป๋า</p>
            <button
              onClick={scrollToShop}
              className="px-7 py-3 bg-white text-black font-black rounded-full text-sm hover:bg-yellow-400 transition-colors shadow-xl"
            >
              ช้อปเลย →
            </button>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-0 md:px-4">
          {/* ── CATEGORY PILLS ── */}
          <div className="bg-white border-b border-gray-100 sticky top-14 z-30">
            <div className="flex items-center overflow-x-auto px-4 py-3 gap-2 no-scrollbar">
              <CategoryPill label="ทั้งหมด" active={activeCategory === ''} onClick={() => setActiveCategory('')} />
              {categories.map(cat => (
                <CategoryPill key={cat.id} label={cat.name} active={activeCategory === cat.name} onClick={() => setActiveCategory(activeCategory === cat.name ? '' : cat.name)} />
              ))}
            </div>
          </div>

          {/* ── FILTER + SORT BAR ── */}
          <div ref={shopRef} className="bg-white border-b border-gray-100 flex items-center justify-between px-4 py-2.5 gap-2">
            <button
              onClick={openDrawer}
              className="flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-black"
            >
              <SlidersHorizontal className="w-4 h-4" />
              ตัวกรอง
              {filterCount > 0 && (
                <span className="ml-0.5 bg-black text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">{filterCount}</span>
              )}
            </button>

            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              {filteredProducts.length} รายการ
            </div>

            <div className="flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-xs font-bold text-gray-700 bg-transparent border-none outline-none cursor-pointer"
              >
                <option value="">ใหม่ล่าสุด</option>
                <option value="price_asc">ราคา ↑</option>
                <option value="price_desc">ราคา ↓</option>
              </select>
            </div>
          </div>

          {/* ── PRODUCT GRID ── */}
          <div className="px-3 md:px-0 py-4">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-2 animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-14 text-center mt-4 shadow-sm">
                <ShoppingBag className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                <h3 className="text-gray-500 font-bold">ไม่พบสินค้า</h3>
                <p className="text-xs text-gray-400 mt-1">ลองเปลี่ยนตัวกรองหรือคำค้นหา</p>
                <button onClick={clearDrawer} className="mt-4 px-5 py-2 bg-black text-white rounded-full text-xs font-bold">ล้างตัวกรอง</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filteredProducts.map(item => (
                  <ShopCard
                    key={item.id}
                    item={item}
                    wishlisted={wishlist.has(item.id)}
                    onWishlist={e => toggleWishlist(e, item.id)}
                    onClick={() => openProduct(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer className="mt-12 bg-black text-white py-10 px-6 text-center">
          <div className="text-xl font-black tracking-widest mb-1">RIZAN THRIFT</div>
          <div className="text-gray-500 text-xs mb-4">เสื้อผ้ามือสองคัดเกรด ของแท้ทุกชิ้น</div>
          <div className="flex justify-center gap-4 mb-6">
            <a href="https://line.me/ti/p/~@rizanthrift" target="_blank" rel="noreferrer" className="w-9 h-9 bg-[#06C755] rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity">
              <MessageCircle className="w-5 h-5 text-white" />
            </a>
          </div>
          <p className="text-gray-600 text-[10px]">© 2026 Rizan Thrift. All rights reserved.</p>
        </footer>
      </div>

      {/* ── FILTER DRAWER ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full bg-white rounded-t-2xl shadow-2xl max-h-[85dvh] flex flex-col overflow-hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-black text-gray-900">ตัวกรอง</h3>
              <button onClick={() => setDrawerOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-5 flex-1">
              {/* Brand */}
              <div>
                <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">แบรนด์</div>
                <div className="flex flex-wrap gap-2">
                  {brands.slice(0, 20).map(b => (
                    <FilterChip key={b} label={b} active={draftBrand === b} onClick={() => setDraftBrand(draftBrand === b ? '' : b)} />
                  ))}
                </div>
                {draftBrand && <button onClick={() => setDraftBrand('')} className="mt-1 text-[10px] text-gray-400 underline">ล้าง</button>}
              </div>

              {/* Condition */}
              <div>
                <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">สภาพสินค้า</div>
                <div className="flex flex-wrap gap-2">
                  {['ไร้ตำหนิ','สภาพดีมาก','สภาพดี','มีตำหนิ'].map(c => (
                    <FilterChip key={c} label={c} active={draftCondition === c} onClick={() => setDraftCondition(draftCondition === c ? '' : c)} />
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">ช่วงราคา (บาท)</div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={draftMinPrice}
                    onChange={e => setDraftMinPrice(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                  <span className="text-gray-400 text-sm">—</span>
                  <input
                    type="number"
                    placeholder="สูงสุด"
                    value={draftMaxPrice}
                    onChange={e => setDraftMaxPrice(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            {/* Drawer footer */}
            <div className="shrink-0 px-5 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={clearDrawer} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-200 transition-colors">
                ล้างทั้งหมด
              </button>
              <button onClick={applyDrawer} className="flex-1 py-3 bg-black text-white rounded-xl font-black text-sm hover:bg-gray-800 transition-colors">
                ดูสินค้า {filterCount > 0 ? `(${filterCount})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCT DETAIL OVERLAY ── */}
      {selectedItem && (
        <ProductDetail
          item={selectedItem}
          imgIdx={imgIdx}
          setImgIdx={setImgIdx}
          onClose={closeProduct}
          lineUrl={lineUrl(selectedItem)}
          onCopy={() => copyInfo(selectedItem)}
          copied={copied}
          wishlisted={wishlist.has(selectedItem.id)}
          onWishlist={e => toggleWishlist(e, selectedItem.id)}
        />
      )}

      {/* ── Ticker animation CSS ── */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .shop-ticker-inner {
          animation: ticker 20s linear infinite;
        }
        .shop-ticker:hover .shop-ticker-inner { animation-play-state: paused; }
      `}</style>
    </>
  );
}

/* ─────────────────────────────────────
   Category Pill
───────────────────────────────────── */
function CategoryPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
        active
          ? 'bg-black text-white border-black shadow-md'
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────
   Filter Chip
───────────────────────────────────── */
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
        active
          ? 'bg-black text-white border-black'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────
   Shop Card
───────────────────────────────────── */
function ShopCard({ item, wishlisted, onWishlist, onClick }) {
  const srcs = useMemo(() => getImgSrcs(item), [item]);
  const condition = item.clothing_condition || item.shoe_condition;
  const size      = item.clothing_size ? item.clothing_size : (item.shoe_size ? `EU ${item.shoe_size}` : null);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col group"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        {srcs.length > 0 ? (
          <img
            src={thumbUrl(srcs[0], 400)}
            alt={item.item_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
            <ShoppingBag className="w-8 h-8 mb-1" />
          </div>
        )}

        {/* Condition badge */}
        {condition && (
          <div className={`absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow ${conditionStyle(condition)}`}>
            {condition}
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={onWishlist}
          className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col flex-1">
        {item.brand && (
          <div className="text-[10px] font-black text-gray-900 uppercase tracking-tight mb-0.5">{item.brand}</div>
        )}
        <h3 className="text-[11px] text-gray-600 leading-tight line-clamp-2 flex-1 mb-1.5">{item.item_name}</h3>
        {size && (
          <div className="mb-1">
            <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold">{size}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-sm font-black text-gray-900">{formatBaht(item.selling_price)}</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Product Detail Overlay
───────────────────────────────────── */
function ProductDetail({ item, imgIdx, setImgIdx, onClose, lineUrl, onCopy, copied, wishlisted, onWishlist }) {
  const srcs      = useMemo(() => getImgSrcs(item), [item]);
  const condition = item.clothing_condition || item.shoe_condition;
  const totalImgs = srcs.length;

  const prevImg = () => setImgIdx(i => (i - 1 + totalImgs) % totalImgs);
  const nextImg = () => setImgIdx(i => (i + 1) % totalImgs);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white w-full h-[100dvh] md:h-auto md:max-w-lg md:rounded-2xl md:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">

        {/* ── Image carousel ── */}
        <div className="relative bg-gray-100 shrink-0" style={{ aspectRatio: '1/1' }}>
          {srcs.length > 0 ? (
            <img
              src={thumbUrl(srcs[imgIdx], 800)}
              alt={item.item_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingBag className="w-16 h-16" />
            </div>
          )}

          {/* Prev / Next */}
          {totalImgs > 1 && (
            <>
              <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white">
                <ChevronRight className="w-5 h-5" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                {srcs.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white w-4' : 'bg-white/50'}`} />
                ))}
              </div>
              <div className="absolute top-3 right-12 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {imgIdx + 1}/{totalImgs}
              </div>
            </>
          )}

          {/* Close */}
          <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow text-gray-800">
            <X className="w-5 h-5" />
          </button>

          {/* Wishlist */}
          <button onClick={onWishlist} className="absolute top-3 left-3 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow">
            <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* ── Details ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Brand + tags */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {item.brand && (
              <span className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">{item.brand}</span>
            )}
            {item.Category_Name && (
              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-lg">{item.Category_Name}</span>
            )}
            {condition && (
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${conditionStyle(condition)}`}>{condition}</span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg font-black text-gray-900 leading-tight mb-1">{item.item_name}</h2>

          {/* Price */}
          <div className="text-2xl font-black text-gray-900 mb-4">{formatBaht(item.selling_price)}</div>

          {/* ─ Clothing Measurements ─ */}
          {item.clothing_size && (
            <div className="mb-4">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">ขนาด</div>
              <div className="grid grid-cols-3 gap-2">
                <MeasBox label="ไซส์" value={item.clothing_size} />
                {item.chest_width    && <MeasBox label="อก"   value={`${item.chest_width}"`} />}
                {item.total_length   && <MeasBox label="ยาว"  value={`${item.total_length}"`} />}
                {item.shoulder_width && <MeasBox label="ไหล่" value={`${item.shoulder_width}"`} />}
                {item.sleeve_length  && <MeasBox label="แขน"  value={`${item.sleeve_length}"`} />}
                {item.waist_size     && <MeasBox label="เอว"  value={`${item.waist_size}"`} />}
              </div>
            </div>
          )}

          {/* ─ Shoe Measurements ─ */}
          {item.shoe_size && (
            <div className="mb-4">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">ขนาดรองเท้า</div>
              <div className="grid grid-cols-3 gap-2">
                <MeasBox label="EU" value={item.shoe_size} />
                {item.size_us    && <MeasBox label="US"    value={item.size_us} />}
                {item.size_uk    && <MeasBox label="UK"    value={item.size_uk} />}
                {item.insole_cm  && <MeasBox label="พื้นใน" value={`${item.insole_cm} cm`} />}
              </div>
            </div>
          )}

          {/* ─ Material specs (WearSwap style) ─ */}
          {(item.clothing_material || item.shoe_material || item.clothing_color || item.shoe_color) && (
            <div className="mb-4 border border-gray-100 rounded-xl overflow-hidden">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0 px-4 pt-3 pb-1">ขนาดสินค้า</div>
              {(item.clothing_color || item.shoe_color) && (
                <SpecRow label="สี" value={item.clothing_color || item.shoe_color} />
              )}
              {(item.clothing_material || item.shoe_material) && (
                <SpecRow label="วัสดุ" value={item.clothing_material || item.shoe_material} />
              )}
            </div>
          )}

          {/* ─ Defects ─ */}
          {item.description && (
            <div className="mb-4">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">ตำหนิ / รายละเอียดเพิ่มเติม</div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-800 font-medium">
                ⚠️ {item.description}
              </div>
            </div>
          )}
          {!item.description && (
            <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-700 font-bold">
              ✅ ไม่มีตำหนิ
            </div>
          )}

          {/* Barcode */}
          <div className="text-[10px] text-gray-300 font-medium text-right mb-2">รหัส {item.barcode_id}</div>
        </div>

        {/* ── CTA Footer ── */}
        <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-white space-y-2">
          <a
            href={lineUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl font-black text-sm shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            สั่งซื้อผ่าน LINE
          </a>
          <button
            onClick={onCopy}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {copied ? <><Check className="w-4 h-4 text-emerald-500" /> คัดลอกแล้ว!</> : <><Copy className="w-4 h-4" /> คัดลอกข้อมูลสินค้า</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   Measure Box
───────────────────────────────────── */
function MeasBox({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center">
      <div className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">{label}</div>
      <div className="text-sm font-black text-gray-800">{value}</div>
    </div>
  );
}

/* ─────────────────────────────────────
   Spec Row (material, lining, etc.)
───────────────────────────────────── */
function SpecRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 text-sm">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}
