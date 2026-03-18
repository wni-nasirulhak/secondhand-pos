'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Package, Search, Plus, Loader2, RefreshCw, ChevronDown, Tag
} from 'lucide-react';
import Pagination from '@/components/Pagination';
import ProductGridItem from '@/components/inventory/ProductGridItem';
import InventoryWizard from '@/components/inventory/InventoryWizard';
import { PRODUCT_TYPES } from '@/lib/constants';
import { thumbUrl, getImgSrcs } from '@/lib/utils';

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
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  useEffect(() => {
    if (step === 4) setCanSubmit(true);
  }, [step]);

  const [selectedType, setSelectedType] = useState(null);
  const [form, setForm] = useState({
    barcode_id: '', item_name: '', brand: '', condition: '9/10 Good', status: 'Available',
    color: '', pattern: '', material: '', cost_price: '0', selling_price: '0', description: '',
    size: '', chest_width: '', waist_size: '', sleeve_length: '', shoulder_width: '', total_length: '',
    size_eu: '', size_us: '', size_uk: '', insole_cm: '',
  });

  useEffect(() => { 
    fetchData(); 
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) setSearchQuery(search);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCat, filterBrand, filterStatus]);

  async function fetchData() {
    setLoading(true);
    try {
      const [invRes, catRes] = await Promise.all([fetch('/api/inventory'), fetch('/api/categories')]);
      const inv = await invRes.json();
      const cat = await catRes.json();
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
      if (data.url) setUploadedImages(p => [...p, data.url]);
      else alert('อัปโหลดไม่สำเร็จ: ' + (data.error || 'Unknown error'));
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
    const cat = categories.find(c => c.name === selectedType.dbCategory);
    
    const payload = {
      id: editingItem?.id,
      barcode_id: form.barcode_id, item_name: form.item_name, brand: form.brand,
      category_id: cat?.id || null, cost_price: parseFloat(form.cost_price) || 0,
      selling_price: parseFloat(form.selling_price) || 0,
      status: form.status || editingItem?.status || 'Available', description: form.description, 
      photos: uploadedImages,
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
      status: item.status || 'Available',
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
    setUploadedImages(getImgSrcs(item));
    setStep(2);
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
    setForm({ barcode_id: '', item_name: '', brand: '', condition: '9/10 Good', status: 'Available', color: '', pattern: '', material: '', cost_price: '0', selling_price: '0', description: '', size: '', chest_width: '', waist_size: '', sleeve_length: '', shoulder_width: '', total_length: '', size_eu: '', size_us: '', size_uk: '', insole_cm: '' });
  }

  const setF = k => v => setForm(p => ({ ...p, [k]: v }));

  const brandOptions = useMemo(() => {
    let list = items;
    if (filterCat) list = items.filter(p => String(p.category_id) === String(filterCat));
    return [...new Set(list.map(i => i.brand).filter(Boolean))].sort();
  }, [items, filterCat]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const term = searchQuery.toLowerCase();
      const matchSearch = [item.item_name, item.barcode_id, item.brand, item.Category_Name].some(v => String(v || '').toLowerCase().includes(term));
      const matchCat = !filterCat || String(item.category_id) === filterCat;
      const matchBrand = !filterBrand || item.brand === filterBrand;
      const matchStatus = filterStatus === 'All' ? true : item.status === filterStatus;
      return matchSearch && matchCat && matchBrand && matchStatus;
    });
  }, [items, searchQuery, filterCat, filterBrand, filterStatus]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="min-h-screen pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">คลังสินค้า</h1>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Rizan&apos;s Thrift POS · ระบบจัดการสต็อก (Standardized)</p>
        </div>
        <button
          onClick={() => { setShowWizard(true); setStep(1); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all text-sm"
        >
          <Plus className="w-5 h-5" />
          <span>เพิ่มสินค้า</span>
        </button>
      </div>

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
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-600 text-xs outline-none focus:border-indigo-400 transition-all cursor-pointer min-w-[120px]">
            <option value="">ทุกหมวดหมู่</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-600 text-xs outline-none focus:border-indigo-400 transition-all cursor-pointer min-w-[120px]">
            <option value="">ทุกแบรนด์</option>
            {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-600 text-xs outline-none focus:border-indigo-400 transition-all cursor-pointer min-w-[120px]">
             <option value="All">ทุกสถานะ</option>
             <option value="Available">พร้อมขาย</option>
             <option value="Pending Print">รอพิมพ์บาร์โค้ด</option>
             <option value="Sold">ขายแล้ว</option>
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] bg-indigo-900/90 backdrop-blur-md text-white px-6 py-4 rounded-[32px] shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Selected Items</span>
            <span className="text-lg font-black">{selectedIds.length} รายการ</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <select 
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:bg-white/20 transition-all cursor-pointer"
              onChange={async (e) => {
                const newStatus = e.target.value;
                if (!newStatus || !confirm(`ยืนยันการเปลี่ยนสถานะ ${selectedIds.length} รายการเป็น "${newStatus}"?`)) return;
                setIsBulkUpdating(true);
                try {
                  const res = await fetch('/api/inventory/bulk-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedIds, status: newStatus })
                  });
                  if (res.ok) {
                    setSelectedIds([]);
                    fetchData();
                  } else {
                    const err = await res.json();
                    alert('Error: ' + err.error);
                  }
                } catch (err) {
                  alert('Bulk update failed: ' + err.message);
                } finally {
                  setIsBulkUpdating(false);
                }
              }}
            >
              <option value="" className="text-slate-900">เปลี่ยนสถานะเป็น...</option>
              <option value="Available" className="text-slate-900">พร้อมขาย (Available)</option>
              <option value="Pending Print" className="text-slate-900">รอพิมพ์ (Pending Print)</option>
              <option value="Sold" className="text-slate-900">ขายแล้ว (Sold)</option>
            </select>
            <button 
              onClick={() => setSelectedIds([])}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
            >
              ยกเลิก
            </button>
          </div>
          {isBulkUpdating && <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">ยังไม่มีสินค้าในคลัง</p>
        </div>
      ) : (
        <>
          <div className="product-grid mb-8">
            {paginatedItems.map(item => (
              <ProductGridItem 
                key={item.id} 
                item={item} 
                onEdit={startEdit} 
                isSelected={selectedIds.includes(item.id)}
                onToggle={() => toggleSelect(item.id)}
              />
            ))}
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
            totalItems={filteredItems.length}
          />
        </>
      )}

      {showWizard && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && closeWizard()} />
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col">
            <InventoryWizard
               step={step} setStep={setStep} selectedType={selectedType} setSelectedType={setSelectedType}
               form={form} setF={setF} generateId={generateId}
               uploadedImages={uploadedImages} setUploadedImages={setUploadedImages}
               fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} uploadLoading={uploadLoading}
               handleSubmit={handleSubmit} isSubmitting={isSubmitting} closeWizard={closeWizard}
               canSubmit={canSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}
