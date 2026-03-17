'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Package, Search, Plus, X, CheckCircle2, Loader2,
  ArrowRight, ArrowLeft, RefreshCw, Trash2, Camera, Link as LinkIcon, ChevronDown,
  ChevronLeft, ChevronRight, Tag
} from 'lucide-react';

// ============================================================
// LOOKUP DATA
// ============================================================
const BRANDS = ['Uniqlo', 'Zara', 'H&M', 'Adidas', 'Nike', "Levi's", 'Gap', 'Polo Ralph Lauren', 'Muji', 'Champion', 'Carhartt', 'Dickies', 'Columbia', 'The North Face', 'Vintage', 'Thrift', 'Other'];
const CONDITIONS = [
  { label: '⭐⭐⭐⭐⭐ New w/Tag (10/10)', value: '10/10 New' },
  { label: '⭐⭐⭐⭐✨ Like New (9.5/10)', value: '9.5/10 Like New' },
  { label: '⭐⭐⭐⭐ Good (9/10)', value: '9/10 Good' },
  { label: '⭐⭐⭐ Used Good (8/10)', value: '8/10 Used Good' },
  { label: '⭐⭐ Vintage (7/10)', value: '7/10 Vintage' },
];
const SIZES_CLOTHING = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
const SHOE_SIZES_EU = Array.from({ length: 13 }, (_, i) => String(35 + i));
const PATTERNS = ['เรียบ (Solid)', 'ลายทาง (Stripe)', 'ลายตาราง (Plaid)', 'ลายดอกไม้ (Floral)', 'ลายกราฟิก (Graphic)', 'พิมพ์ลาย (Print)', 'ลายไทย', 'อื่นๆ'];
const MATERIALS = ['Cotton 100%', 'Polyester', 'Cotton/Polyester Mix', 'Denim', 'Linen', 'Wool', 'Nylon', 'Fleece', 'Velvet', 'Corduroy', 'อื่นๆ'];
const COLORS = ['ขาว', 'ดำ', 'เทา', 'น้ำเงิน', 'แดง', 'เขียว', 'เหลือง', 'ส้ม', 'ชมพู', 'ม่วง', 'น้ำตาล', 'เบจ', 'กรมท่า', 'หลายสี'];

const PRODUCT_TYPES = [
  { id: 'เสื้อ', label: 'เสื้อ', icon: '👕', code: 'SHIRT', measureType: 'top' },
  { id: 'กางเกง', label: 'กางเกง', icon: '👖', code: 'PANT', measureType: 'bottom' },
  { id: 'รองเท้า', label: 'รองเท้า', icon: '👟', code: 'SHOE', measureType: 'shoe' },
  { id: 'เสื้อกันหนาว', label: 'เสื้อกันหนาว', icon: '🧥', code: 'JACK', measureType: 'top' },
  { id: 'กระโปรง', label: 'กระโปรง', icon: '👗', code: 'SKIRT', measureType: 'bottom' },
  { id: 'อุปกรณ์เสริม', label: 'อุปกรณ์', icon: '🎒', code: 'ACC', measureType: 'none' },
];

function thumbUrl(src, w = 300) {
  if (!src || !src.includes('cloudinary.com')) return src;
  return src.replace('/upload/', `/upload/w_${w},h_${w},c_fill,q_auto/`);
}

function getImgSrcs(item) {
  if (!item) return [];
  if (item.Photos && typeof item.Photos === 'string') {
    return item.Photos.split(',').filter(Boolean);
  }
  const photoField = item.Photo || item.Image_URL;
  if (!photoField || photoField === '0' || photoField === 'None') return [];
  const s = String(photoField).trim();
  if (s.startsWith('[')) {
    try {
      const urls = JSON.parse(s);
      return urls.length > 0 ? urls : [];
    } catch { return []; }
  }
  if (s.startsWith('http')) return [s];
  if (s.length > 30) return [`data:image/jpeg;base64,${s}`];
  return [];
}

// ============================================================
// REUSABLE FORM FIELDS
// ============================================================
function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}

const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-gray-300 text-sm";
const selectCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm appearance-none";

function Select({ label, value, onChange, options, placeholder, required }) {
  return (
    <Field label={label} required={required}>
      <div className="relative">
        <select required={required} value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
          <option value="">{placeholder || 'เลือก...'}</option>
          {options.map(o => typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </Field>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder, required, step }) {
  return (
    <Field label={label} required={required}>
      <input required={required} type={type} step={step} value={value} onChange={e => onChange(e.target.value)} className={inputCls} placeholder={placeholder} />
    </Field>
  );
}

function PriceInput({ label, value, onChange, required }) {
  const num = parseFloat(value) || 0;
  return (
    <Field label={label} required={required}>
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-indigo-400 focus-within:bg-white transition-all">
        <span className="px-3 text-gray-400 font-bold text-sm shrink-0">฿</span>
        <input
          type="number"
          value={value}
          step="10"
          min="0"
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent py-3 text-gray-800 font-bold outline-none text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <div className="flex border-l border-gray-200 shrink-0">
          <button type="button" onClick={() => onChange(String(num + 10))} className="px-3 py-3 hover:bg-indigo-50 text-gray-500 font-black text-sm transition-colors border-r border-gray-200">+</button>
          <button type="button" onClick={() => onChange(String(Math.max(0, num - 10)))} className="px-3 py-3 hover:bg-red-50 text-gray-500 font-black text-sm transition-colors">−</button>
        </div>
      </div>
    </Field>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  
  useEffect(() => {
    if (step === 4) {
      setCanSubmit(true); // No more delay
    }
  }, [step]);

  const [selectedType, setSelectedType] = useState(null);
  const [form, setForm] = useState({
    barcode_id: '', item_name: '', brand: '', condition: '9/10 Good',
    color: '', pattern: '', material: '', cost_price: '0', selling_price: '0', description: '',
    size: '', chest_width: '', waist_size: '', sleeve_length: '', shoulder_width: '', total_length: '',
    size_eu: '', size_us: '', size_uk: '', insole_cm: '',
  });

  useEffect(() => { 
    fetchData(); 
    
    // Check for search query in URL
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [invRes, catRes] = await Promise.all([fetch('/api/inventory'), fetch('/api/categories')]);
      const [inv, cat] = await Promise.all([invRes.json(), catRes.json()]);
      setItems(Array.isArray(inv) ? inv : []);
      setCategories(Array.isArray(cat) ? cat : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function generateId(brand, typeName) {
    if (!brand || !typeName) return;
    try {
      const res = await fetch(`/api/inventory/generate-id?brand=${encodeURIComponent(brand)}&category_name=${encodeURIComponent(typeName)}`);
      const data = await res.json();
      if (data.id) setForm(p => ({ ...p, barcode_id: data.id }));
    } catch (e) { console.error(e); }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setUploadedImages(p => [...p, data.url]);
      } else {
        alert('อัปโหลดไม่สำเร็จ: ' + (data.error || 'Unknown error'));
      }
    } catch (e) { alert('เกิดข้อผิดพลาด: ' + e.message); }
    finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedType) return;
    setIsSubmitting(true);
    const cat = categories.find(c => c.name.toLowerCase().includes(selectedType.id.toLowerCase()));
    
    const payload = {
      id: editingItem?.id,
      barcode_id: form.barcode_id, item_name: form.item_name, brand: form.brand,
      category_id: cat?.id || null, cost_price: parseFloat(form.cost_price) || 0,
      selling_price: parseFloat(form.selling_price) || 0,
      status: editingItem?.status || 'Available', description: form.description, 
      photos: uploadedImages, // Send the full array
      category_name: selectedType.id,
    };
    if (selectedType.measureType === 'top' || selectedType.measureType === 'bottom') {
      payload.clothing = { size: form.size, chest_width: form.chest_width, waist_size: form.waist_size, sleeve_length: form.sleeve_length, shoulder_width: form.shoulder_width, total_length: form.total_length, condition: form.condition, material: form.material, color: form.color };
    } else if (selectedType.measureType === 'shoe') {
      payload.shoes = { size_eu: form.size_eu, size_us: form.size_us, size_uk: form.size_uk, insole_cm: form.insole_cm, condition: form.condition, material: form.material, color: form.color };
    }
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch('/api/inventory', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { closeWizard(); fetchData(); }
      else { const err = await res.json(); alert('Error: ' + err.error); }
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setIsSubmitting(false); }
  }

  function startEdit(item) {
    setEditingItem(item);
    const type = PRODUCT_TYPES.find(t => item.Category_Name?.toLowerCase().includes(t.id.toLowerCase())) || PRODUCT_TYPES[0];
    setSelectedType(type);
    setForm({
      barcode_id: item.barcode_id || '',
      item_name: item.item_name || '',
      brand: item.brand || '',
      condition: item.clothing_condition || item.shoe_condition || '9/10 Good',
      color: item.clothing_color || item.shoe_color || '',
      pattern: '', 
      material: item.clothing_material || item.shoe_material || '',
      cost_price: String(item.cost_price || 0),
      selling_price: String(item.selling_price || 0),
      description: item.description || '',
      size: item.size || '',
      chest_width: String(item.chest_width || ''),
      waist_size: String(item.waist_size || ''),
      sleeve_length: String(item.sleeve_length || ''),
      shoulder_width: String(item.shoulder_width || ''),
      total_length: String(item.total_length || ''),
      size_eu: String(item.size_eu || ''),
      size_us: String(item.size_us || ''),
      size_uk: String(item.size_uk || ''),
      insole_cm: String(item.insole_cm || ''),
    });
    
    // Handle multiple images from SQL GROUP_CONCAT
    if (typeof item.Photos === 'string') {
      setUploadedImages(item.Photos.split(',').filter(Boolean));
    } else if (item.Photo) {
      setUploadedImages([item.Photo]);
    } else {
      setUploadedImages([]);
    }
    
    setStep(2); // Go straight to details
    setShowWizard(true);
  }

  function closeWizard() {
    setShowWizard(false); 
    setStep(1); 
    setSelectedType(null); 
    setUploadedImages([]); 
    setEditingItem(null);
    setIsSubmitting(false);
    setUploadLoading(false);
    setCanSubmit(false);
    setForm({ barcode_id: '', item_name: '', brand: '', condition: '9/10 Good', color: '', pattern: '', material: '', cost_price: '0', selling_price: '0', description: '', size: '', chest_width: '', waist_size: '', sleeve_length: '', shoulder_width: '', total_length: '', size_eu: '', size_us: '', size_uk: '', insole_cm: '' });
  }

  const setF = k => v => setForm(p => ({ ...p, [k]: v }));

  const brandOptions = useMemo(() => {
    let list = items;
    if (filterCat) {
      list = items.filter(p => String(p.category_id) === String(filterCat));
    }
    return [...new Set(list.map(i => i.brand).filter(Boolean))].sort();
  }, [items, filterCat]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const term = searchQuery.toLowerCase();
      const matchSearch = [item.item_name, item.barcode_id, item.brand, item.Category_Name]
        .some(v => String(v || '').toLowerCase().includes(term));
      
      const matchCat = !filterCat || String(item.category_id) === filterCat;
      const matchBrand = !filterBrand || item.brand === filterBrand;
      const matchStatus = filterStatus === 'All' ? true : item.status === filterStatus;

      return matchSearch && matchCat && matchBrand && matchStatus;
    });
  }, [items, searchQuery, filterCat, filterBrand, filterStatus]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === filteredItems.length) setSelectedIds([]);
    else setSelectedIds(filteredItems.map(i => i.id));
  };

  const handleBulkUpdateStatus = async (newStatus) => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      const res = await fetch('/api/printer/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status: newStatus })
      });
      if (res.ok) {
        fetchData();
        setSelectedIds([]);
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`ยืนยันการลบสินค้าที่เลือกจำนวน ${selectedIds.length} รายการ? ข้อมูลจะไม่สามารถกู้คืนได้`)) return;
    
    setIsBulkUpdating(true); // Reuse loading state
    try {
      const res = await fetch('/api/inventory/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        fetchData();
        setSelectedIds([]);
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const totalValue = items.reduce((s, i) => s + parseFloat(i.selling_price || 0), 0);
  const availableCount = items.filter(i => i.status === 'Available').length;
  const pendingCount = items.filter(i => i.status === 'Pending Print').length;

  // =====================
  // RENDER
  // =====================
  return (
    <div className="min-h-screen pb-20">
      {/* ── TOP HEADER ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">คลังสินค้า</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Rizan&apos;s Thrift POS · ระบบจัดการสต็อก</p>
        </div>
        <button
          onClick={() => { setShowWizard(true); setStep(1); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all text-sm"
        >
          <Plus className="w-5 h-5" />
          <span>เพิ่มสินค้า</span>
        </button>
      </div>

      <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '📦', label: 'สินค้าทั้งหมด', value: items.length, color: 'text-slate-600' },
          { icon: '⏳', label: 'รอพิมพ์บาร์โค้ด', value: pendingCount, color: 'text-amber-500' },
          { icon: '✅', label: 'พร้อมขาย', value: availableCount, color: 'text-emerald-500' },
          { icon: '💰', label: 'มูลค่ารวมขาย', value: `฿${totalValue.toLocaleString()}`, color: 'text-indigo-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner italic">
              {s.icon}
            </div>
            <div>
              <div className={`text-xl font-black ${s.color} leading-none mb-1`}>{s.value}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SEARCH + ADVANCED FILTER ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 transition-colors group-focus-within:text-indigo-500" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้า, รหัสบาร์โค้ด..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-50 bg-slate-50 outline-none focus:border-indigo-400 focus:bg-white font-bold text-sm text-slate-700 placeholder:text-slate-300 transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-50 rounded-2xl px-4 py-3 pr-9 font-bold text-slate-600 text-xs outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Brand Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-50 rounded-2xl px-4 py-3 pr-9 font-bold text-slate-600 text-xs outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">ทุกแบรนด์</option>
              {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-50 rounded-2xl px-4 py-3 pr-9 font-bold text-slate-600 text-xs outline-none focus:border-indigo-400 focus:bg-white transition-all cursor-pointer"
            >
              <option value="All">ทุกสถานะ</option>
              <option value="Available">พร้อมขาย</option>
              <option value="Pending Print">รอพิมพ์บาร์โค้ด</option>
              <option value="Sold">ขายแล้ว</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <button 
            onClick={selectAll}
            className={`px-4 py-3 rounded-2xl font-black text-xs transition-all border ${
              selectedIds.length > 0 && selectedIds.length === filteredItems.length 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'
            }`}
          >
            {selectedIds.length === filteredItems.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
          </button>
        </div>
      </div>

      {/* ── PRODUCT GRID ────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">ยังไม่มีสินค้าในคลัง</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredItems.map(item => (
            <ProductGridItem 
              key={item.id} 
              item={item} 
              onEdit={startEdit} 
              isSelected={selectedIds.includes(item.id)}
              onToggle={() => toggleSelect(item.id)}
            />
          ))}
        </div>
      )}

      {/* ── FLOATING ACTION BAR ─────────────────────────── */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in zoom-in-95 slide-in-from-bottom-5">
           <div className="bg-indigo-600 text-white rounded-[40px] p-3 pl-8 pr-6 flex items-center gap-8 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] border border-indigo-500 ring-4 ring-white/20 backdrop-blur-md">
             <div className="flex flex-col">
                <div className="text-white/60 font-black text-[10px] uppercase tracking-[0.2em] mb-0.5">Selected Items</div>
                <div className="text-2xl font-black leading-none flex items-baseline gap-1">
                  {selectedIds.length} <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">pcs</span>
                </div>
             </div>
             
             <div className="h-12 w-px bg-white/10 mx-1" />
             
             <div className="flex items-center gap-3">
               {/* Bulk Status Update */}
               <div className="relative group/select">
                 <select 
                   onChange={(e) => handleBulkUpdateStatus(e.target.value)}
                   disabled={isBulkUpdating}
                   className="appearance-none bg-white text-indigo-600 px-6 py-4 pr-12 rounded-[24px] font-black text-xs outline-none transition-all cursor-pointer shadow-lg hover:bg-slate-50 disabled:opacity-50"
                   defaultValue=""
                 >
                   <option value="" disabled>อัปเดตสถานะ...</option>
                   <option value="Pending Print">รอพิมพ์บาร์โค้ด</option>
                   <option value="Available">พร้อมขาย</option>
                   <option value="Sold">ขายแล้ว</option>
                 </select>
                 <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none transition-transform group-hover/select:translate-y-[-40%]" />
               </div>

               {/* Bulk Delete */}
               <button 
                 onClick={handleBulkDelete}
                 disabled={isBulkUpdating}
                 className="flex items-center gap-2 px-6 py-4 bg-rose-500 hover:bg-rose-700 text-white rounded-[24px] font-black text-xs transition-all outline-none shadow-lg shadow-rose-500/30 active:scale-95 disabled:opacity-50"
               >
                 <Trash2 className="w-5 h-5" />
                 ลบข้อมูล
               </button>

               <button 
                 onClick={() => setSelectedIds([])}
                 className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-[24px] transition-all border border-white/10"
                 title="Clear selection"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             {isBulkUpdating && (
               <div className="absolute inset-0 bg-indigo-600/80 rounded-[40px] flex items-center justify-center backdrop-blur-sm">
                 <Loader2 className="w-8 h-8 animate-spin text-white" />
               </div>
             )}
           </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          WIZARD MODAL
          ══════════════════════════════════════════════════════ */}
      {showWizard && (
        <div className="fixed inset-0 z-[9999]" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          {/* SM+ center modal */}
          <div className="hidden sm:flex absolute inset-0 items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSubmitting && closeWizard()} />
            <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
              <WizardContent
                step={step} setStep={setStep} selectedType={selectedType} setSelectedType={setSelectedType}
                form={form} setF={setF} generateId={generateId} categories={categories}
                uploadedImages={uploadedImages} setUploadedImages={setUploadedImages}
                fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} uploadLoading={uploadLoading}
                handleSubmit={handleSubmit} isSubmitting={isSubmitting} closeWizard={closeWizard}
                canSubmit={canSubmit}
              />
            </div>
          </div>

          {/* Mobile bottom sheet */}
          <div className="sm:hidden absolute inset-0 flex items-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSubmitting && closeWizard()} />
            <div className="relative bg-white w-full max-h-[92svh] rounded-t-3xl flex flex-col overflow-hidden shadow-2xl">
              <WizardContent
                step={step} setStep={setStep} selectedType={selectedType} setSelectedType={setSelectedType}
                form={form} setF={setF} generateId={generateId} categories={categories}
                uploadedImages={uploadedImages} setUploadedImages={setUploadedImages}
                fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} uploadLoading={uploadLoading}
                handleSubmit={handleSubmit} isSubmitting={isSubmitting} closeWizard={closeWizard}
                canSubmit={canSubmit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// WIZARD CONTENT COMPONENT (shared between modal variants)
// ============================================================
function WizardContent({ step, setStep, selectedType, setSelectedType, form, setF, generateId, categories, uploadedImages, setUploadedImages, fileInputRef, handleFileUpload, uploadLoading, handleSubmit, isSubmitting, closeWizard, canSubmit }) {
  return (
    <>
      {/* Drag handle mobile */}
      <div className="sm:hidden flex justify-center pt-2.5 pb-0.5 shrink-0">
        <div className="w-8 h-1 bg-gray-200 rounded-full" />
      </div>

      {/* Header */}
      <div className="shrink-0 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">ขั้นตอน {step}/4</div>
          <h2 className="text-base font-black text-gray-900">
            {step === 1 && '🗂️ เลือกหมวดหมู่สินค้า'}
            {step === 2 && '📋 ข้อมูลสินค้า'}
            {step === 3 && '📐 มาตรวัดและรายละเอียด'}
            {step === 4 && '📸 รูปภาพสินค้า'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress pills */}
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className={`h-1.5 w-6 rounded-full transition-all ${step >= n ? 'bg-indigo-500' : 'bg-gray-100'}`} />
            ))}
          </div>
          <button onClick={closeWizard} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <form id="wizardForm" onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="grid grid-cols-3 gap-3">
              {PRODUCT_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => { setSelectedType(type); if (form.brand) generateId(form.brand, type.id); }}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                    selectedType?.id === type.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="text-3xl">{type.icon}</span>
                  <span className="text-xs font-bold text-gray-700 text-center leading-tight">{type.label}</span>
                  {selectedType?.id === type.id && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                </button>
              ))}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="แบรนด์" required value={form.brand}
                  onChange={v => { setF('brand')(v); if (selectedType) generateId(v, selectedType.id); }}
                  options={BRANDS} placeholder="เลือกแบรนด์"
                />
                <Select label="สภาพสินค้า" required value={form.condition} onChange={setF('condition')} options={CONDITIONS} />
              </div>
              <Input label="ชื่อสินค้า" required value={form.item_name} onChange={setF('item_name')} placeholder={`เช่น เสื้อยืดสีขาว Uniqlo`} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="สี" value={form.color} onChange={setF('color')} options={COLORS} placeholder="เลือกสี" />
                <Select label="ลวดลาย" value={form.pattern} onChange={setF('pattern')} options={PATTERNS} placeholder="เลือกลาย" />
              </div>
              <Select label="วัสดุ/ผ้า" value={form.material} onChange={setF('material')} options={MATERIALS} placeholder="เลือกวัสดุ" />
              <div className="grid grid-cols-2 gap-4">
                <PriceInput label="🔻 ต้นทุน (฿)" value={form.cost_price} onChange={setF('cost_price')} />
                <PriceInput label="🔥 ราคาขาย (฿)" required value={form.selling_price} onChange={setF('selling_price')} />
              </div>
              {/* Auto ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">🔑 รหัสสินค้า (Auto)</label>
                <div className="flex gap-2">
                  <input value={form.barcode_id} onChange={e => setF('barcode_id')(e.target.value)} className={`${inputCls} font-mono flex-1`} placeholder="กดรีเฟรช →" />
                  <button type="button" onClick={() => generateId(form.brand, selectedType?.id)} className="px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl transition-all active:scale-90">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <Input label="หมายเหตุ" value={form.description} onChange={setF('description')} placeholder="รายละเอียดเพิ่มเติม..." />
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              {selectedType?.measureType === 'top' && (
                <>
                  <div className="text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">👕 วัดขนาดเสื้อ (หน่วย: นิ้ว)</div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="ไซส์ผ้าย" value={form.size} onChange={setF('size')} options={SIZES_CLOTHING} />
                    <Input label="อก (นิ้ว)" value={form.chest_width} onChange={setF('chest_width')} type="number" step="0.5" placeholder="21" />
                    <Input label="ความยาวเสื้อ" value={form.total_length} onChange={setF('total_length')} type="number" step="0.5" placeholder="28" />
                    <Input label="ความยาวแขน" value={form.sleeve_length} onChange={setF('sleeve_length')} type="number" step="0.5" placeholder="24" />
                    <Input label="ไหล่กว้าง" value={form.shoulder_width} onChange={setF('shoulder_width')} type="number" step="0.5" placeholder="16" />
                    <Input label="เอว (ถ้ามี)" value={form.waist_size} onChange={setF('waist_size')} type="number" step="0.5" placeholder="-" />
                  </div>
                </>
              )}
              {selectedType?.measureType === 'bottom' && (
                <>
                  <div className="text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">👖 วัดขนาดกางเกง/กระโปรง (หน่วย: นิ้ว)</div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="ไซส์" value={form.size} onChange={setF('size')} options={SIZES_CLOTHING} />
                    <Input label="รอบเอว" value={form.waist_size} onChange={setF('waist_size')} type="number" step="0.5" placeholder="30" />
                    <Input label="ความยาวขา" value={form.total_length} onChange={setF('total_length')} type="number" step="0.5" placeholder="42" />
                    <Input label="ต้นขา" value={form.chest_width} onChange={setF('chest_width')} type="number" step="0.5" placeholder="22" />
                  </div>
                </>
              )}
              {selectedType?.measureType === 'shoe' && (
                <>
                  <div className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">👟 ขนาดรองเท้า — ใส่อย่างน้อย 1 ระบบ</div>
                  <div className="grid grid-cols-3 gap-4">
                    <Select label="EU" value={form.size_eu} onChange={setF('size_eu')} options={SHOE_SIZES_EU} placeholder="EU" />
                    <Input label="US" value={form.size_us} onChange={setF('size_us')} type="number" placeholder="9" />
                    <Input label="UK" value={form.size_uk} onChange={setF('size_uk')} type="number" placeholder="8" />
                  </div>
                  <Input label="ความยาวพื้นใน (CM)" value={form.insole_cm} onChange={setF('insole_cm')} type="number" step="0.5" placeholder="เช่น 27.5" />
                </>
              )}
              {selectedType?.measureType === 'none' && (
                <div className="py-10 text-center text-gray-400 font-semibold text-sm">ไม่มีมาตรวัดสำหรับประเภทนี้</div>
              )}
            </div>
          )}

          {/* STEP 4 - IMAGE UPLOAD */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Image grid */}
              <div className="grid grid-cols-3 gap-2">
                {uploadedImages.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={url} className="w-full h-full object-cover" alt="uploaded" />
                    <button
                      type="button"
                      onClick={() => setUploadedImages(p => p.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[8px] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded-md">หลัก</span>}
                  </div>
                ))}

                {/* Upload button (always visible) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLoading}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-400 bg-gray-50 hover:bg-indigo-50 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  {uploadLoading ? <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /> : <Camera className="w-6 h-6 text-gray-300" />}
                  <span className="text-[9px] font-bold text-gray-400">เพิ่มรูป</span>
                </button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />

              {/* URL fallback */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">หรือวาง URL รูปภาพ</label>
                <div className="flex gap-2 items-center">
                  <LinkIcon className="shrink-0 w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    id="manualImageUrl"
                    className={inputCls}
                    placeholder="https://..."
                    onKeyDown={e => {
                      if (e.key === 'Enter') { 
                        e.preventDefault(); 
                        const v = e.target.value.trim(); 
                        if (v) { setUploadedImages(p => [...p, v]); e.target.value = ''; } 
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('manualImageUrl');
                      const v = input?.value.trim();
                      if (v) { setUploadedImages(p => [...p, v]); input.value = ''; }
                    }}
                    className="px-3 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-all shrink-0"
                  >
                    เพิ่ม
                  </button>
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setUploadedImages(p => [...p, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'])}
                    className="text-[10px] text-indigo-500 hover:underline"
                  >
                    + ใช้รูปเสื้อตัวอย่าง
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadedImages(p => [...p, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'])}
                    className="text-[10px] text-indigo-500 hover:underline"
                  >
                    + ใช้รูปรองเท้าตัวอย่าง
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-1 border border-gray-100">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">สรุปข้อมูลก่อนบันทึก</div>
                <div className="font-black text-gray-800 text-sm">{form.item_name || '(ยังไม่ได้กรอกชื่อ)'}</div>
                <div className="text-xs text-gray-500">{selectedType?.label} · {form.brand} · {form.condition}</div>
                <div className="flex gap-4 pt-2">
                  <div><div className="text-[9px] text-gray-300 font-semibold uppercase">ต้นทุน</div><div className="font-black text-gray-700 text-sm">฿{parseFloat(form.cost_price || 0).toLocaleString()}</div></div>
                  <div><div className="text-[9px] text-gray-300 font-semibold uppercase">ขาย</div><div className="font-black text-indigo-600 text-base">฿{parseFloat(form.selling_price || 0).toLocaleString()}</div></div>
                  {form.barcode_id && <div className="ml-auto"><div className="text-[9px] text-gray-300 font-semibold uppercase">รหัส</div><div className="font-mono text-xs text-gray-500">{form.barcode_id}</div></div>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav buttons */}
        <div className="shrink-0 px-5 py-4 border-t border-gray-100 flex gap-2">
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all active:scale-95">
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 transition-all active:scale-95"
            >
              ถัดไป <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 transition-all active:scale-95"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              บันทึกข้อมูลสินค้า
            </button>
          )}
        </div>
      </form>
    </>
  );
}

function ProductGridItem({ item, onEdit, isSelected, onToggle }) {
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
      onClick={onToggle}
      className={`group bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative cursor-pointer ${
        isSelected ? 'border-indigo-500 ring-4 ring-indigo-50 bg-indigo-50/10' : 'border-slate-100'
      }`}
    >
      {/* Checkbox badge */}
      <div className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
        isSelected ? 'bg-indigo-600 border-indigo-600 shadow-lg' : 'bg-white/80 border-slate-200 opacity-0 group-hover:opacity-100'
      }`}>
        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
      </div>

      <div className="aspect-square bg-slate-50 relative overflow-hidden group/img">
        {srcs.length > 0 ? (
          <>
            <img 
              src={thumbUrl(srcs[imgIdx], 400)} 
              alt={item.item_name} 
              className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-105' : 'group-hover:scale-110'}`} 
            />
            {srcs.length > 1 && (
              <>
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                  {srcs.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/40'}`} />
                  ))}
                </div>
                <button 
                  onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-xl opacity-0 group-hover/img:opacity-100 transition-all border border-white/10 backdrop-blur-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-xl opacity-0 group-hover/img:opacity-100 transition-all border border-white/10 backdrop-blur-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Package className="w-16 h-16 text-slate-100" /></div>
        )}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
           <StatusBadge status={item.status} />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 uppercase tracking-tighter">#{item.barcode_id}</span>
          <div className="h-1 w-1 bg-slate-200 rounded-full" />
          <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest truncate">{item.brand || 'NO BRAND'}</div>
        </div>

        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-sm font-black text-slate-800 line-clamp-2 leading-snug h-[2.8em]">{item.item_name}</h3>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            className="shrink-0 p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 mb-4 overflow-hidden">
          {item.size && <span className="text-[10px] font-bold bg-indigo-50/50 text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100/50">S:{item.size}</span>}
          {item.chest_width && <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-lg border border-slate-100">อก:{item.chest_width}"</span>}
          {item.size_eu && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg border border-slate-200">EU {item.size_eu}</span>}
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-slate-50">
          <div>
            <div className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mb-0.5">Selling Price</div>
            <div className="text-xl font-black text-slate-900 leading-none">
              <span className="text-sm mr-0.5">฿</span>{parseFloat(item.selling_price || 0).toLocaleString()}
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">{item.Category_Name}</div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'Pending Print': 'bg-amber-500 text-white shadow-amber-200',
    'Available': 'bg-emerald-500 text-white shadow-emerald-200',
    'Sold': 'bg-slate-400 text-white shadow-slate-100'
  };
  const labels = {
    'Pending Print': 'รอพิมพ์',
    'Available': 'พร้อมขาย',
    'Sold': 'ขายแล้ว'
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase shadow-lg ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
