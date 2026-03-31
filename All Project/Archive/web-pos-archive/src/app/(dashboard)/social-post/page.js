'use client';
import { useState, useEffect, useMemo } from 'react';
import { Search, Copy, Check, Package, FileText, Plus, Trash2, Save, ChevronDown } from 'lucide-react';
import { getImgSrcs, thumbUrl, formatBaht } from '@/lib/utils';

const DEFAULT_TEMPLATES = [
  {
    id: 'standard',
    name: '✨ Standard',
    content: `✨ {ชื่อสินค้า}
💰 ราคา {ราคา}
📏 ไซส์: {ไซส์}
⭐ สภาพ: {สภาพ}
🎨 สี: {สี}

สั่งซื้อทักแชทได้เลยครับ! 🛒✨
#เสื้อผ้ามือสอง #วินเทจ #{แบรนด์}`,
  },
  {
    id: 'short',
    name: '⚡ Short',
    content: `{ชื่อสินค้า} | {ราคา}
{ไซส์} • สภาพ {สภาพ}
ทักมาเลยครับ 📩
#{แบรนด์} #เสื้อผ้ามือสอง`,
  },
  {
    id: 'detailed',
    name: '📋 Detailed',
    content: `🔥 NEW DROP 🔥

{ชื่อสินค้า}
แบรนด์: {แบรนด์}
หมวดหมู่: {หมวดหมู่}

💰 ราคา: {ราคา}
📏 ไซส์: {ไซส์}
⭐ สภาพ: {สภาพ}
🎨 สี: {สี}
🧵 วัสดุ: {วัสดุ}

{รายละเอียด}

📦 รหัสสินค้า: {รหัส}
สนใจทักแชทได้เลยครับ!
#เสื้อผ้ามือสอง #วินเทจ #{แบรนด์} #{หมวดหมู่}`,
  },
];

const TOKEN_MAP = {
  '{ชื่อสินค้า}': (item) => item.item_name || '',
  '{ราคา}': (item) => formatBaht(item.selling_price || 0),
  '{แบรนด์}': (item) => item.brand || 'NoBrand',
  '{หมวดหมู่}': (item) => item.Category_Name || '',
  '{ไซส์}': (item) => item.clothing_size || (item.shoe_size ? `EU${item.shoe_size}` : '-'),
  '{สภาพ}': (item) => item.clothing_condition || item.shoe_condition || '-',
  '{สี}': (item) => item.clothing_color || item.shoe_color || '-',
  '{วัสดุ}': (item) => item.clothing_material || item.shoe_material || '-',
  '{รหัส}': (item) => item.barcode_id || '',
  '{รายละเอียด}': (item) => item.description || '',
};

function resolveTemplate(template, item) {
  let result = template;
  for (const [token, resolver] of Object.entries(TOKEN_MAP)) {
    result = result.replaceAll(token, resolver(item));
  }
  return result;
}

export default function SocialPostPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('standard');
  const [customTemplates, setCustomTemplates] = useState([]);
  const [editableCaption, setEditableCaption] = useState('');
  const [copied, setCopied] = useState(false);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  useEffect(() => {
    fetchProducts();
    // Load custom templates from localStorage
    const saved = localStorage.getItem('social_templates');
    if (saved) {
      try { setCustomTemplates(JSON.parse(saved)); } catch {}
    }
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates];
  const currentTemplate = allTemplates.find(t => t.id === selectedTemplateId) || allTemplates[0];

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.filter(p => p.status === 'Available').slice(0, 30);
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.status === 'Available' &&
      [p.item_name, p.brand, p.barcode_id].some(v => String(v || '').toLowerCase().includes(q))
    ).slice(0, 30);
  }, [products, searchQuery]);

  // When product or template changes, regenerate caption
  useEffect(() => {
    if (selectedProduct && currentTemplate) {
      setEditableCaption(resolveTemplate(currentTemplate.content, selectedProduct));
    }
  }, [selectedProduct, selectedTemplateId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const saveAsTemplate = () => {
    if (!newTemplateName.trim()) return;
    const newT = {
      id: `custom_${Date.now()}`,
      name: `📌 ${newTemplateName.trim()}`,
      content: editableCaption,
    };
    const updated = [...customTemplates, newT];
    setCustomTemplates(updated);
    localStorage.setItem('social_templates', JSON.stringify(updated));
    setSelectedTemplateId(newT.id);
    setShowNewTemplate(false);
    setNewTemplateName('');
  };

  const deleteCustomTemplate = (id) => {
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem('social_templates', JSON.stringify(updated));
    if (selectedTemplateId === id) setSelectedTemplateId('standard');
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 px-3 md:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-400 rounded-xl flex items-center justify-center text-white shadow-lg">
          <FileText size={20} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">Social Post Builder</h1>
          <p className="text-xs font-bold text-slate-400">สร้าง Caption สำหรับโพสต์ขายสินค้า</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Product Selection + Template */}
        <div className="space-y-4">
          {/* Search */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">1. เลือกสินค้า</label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, แบรนด์, รหัส..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 transition-all"
              />
            </div>

            <div className="max-h-[240px] overflow-y-auto space-y-1.5 pr-1">
              {loading ? (
                <div className="py-8 text-center text-slate-300 text-sm font-bold">กำลังโหลด...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-slate-300 flex flex-col items-center gap-2">
                  <Package className="w-8 h-8 opacity-30" />
                  <span className="text-xs font-bold">ไม่พบสินค้า</span>
                </div>
              ) : (
                filteredProducts.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedProduct(item)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all active:scale-[0.98] ${
                      selectedProduct?.id === item.id ? 'bg-indigo-50 border-2 border-indigo-300 shadow-sm' : 'bg-slate-50/50 border-2 border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-100 overflow-hidden shrink-0">
                      {getImgSrcs(item).length > 0 ? (
                        <img src={thumbUrl(getImgSrcs(item)[0], 96)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200"><Package size={16} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-800 line-clamp-1">{item.item_name}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{item.brand || '-'} • {formatBaht(item.selling_price)}</div>
                    </div>
                    {selectedProduct?.id === item.id && (
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Template Selection */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">2. เลือก Template</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {allTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`relative px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    selectedTemplateId === t.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                  }`}
                >
                  {t.name}
                  {t.id.startsWith('custom_') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCustomTemplate(t.id); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </button>
              ))}
            </div>

            {/* Token reference */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">ตัวแปรที่ใช้ได้</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(TOKEN_MAP).map(token => (
                  <span
                    key={token}
                    onClick={() => setEditableCaption(prev => prev + ' ' + token)}
                    className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-indigo-600 cursor-pointer hover:bg-indigo-50 transition-colors"
                  >
                    {token}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Preview + Edit */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">3. แก้ไข Caption</label>
            
            {!selectedProduct ? (
              <div className="py-16 text-center text-slate-300 flex flex-col items-center gap-3">
                <Package className="w-12 h-12 opacity-20" />
                <p className="text-sm font-bold">เลือกสินค้าก่อนเพื่อสร้าง Caption</p>
              </div>
            ) : (
              <>
                {/* Product Preview */}
                <div className="flex items-center gap-3 mb-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-indigo-100 shrink-0">
                    {getImgSrcs(selectedProduct).length > 0 ? (
                      <img src={thumbUrl(getImgSrcs(selectedProduct)[0], 112)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><Package size={20} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-slate-800 line-clamp-1">{selectedProduct.item_name}</div>
                    <div className="text-xs text-indigo-600 font-bold">{selectedProduct.brand} • {formatBaht(selectedProduct.selling_price)}</div>
                  </div>
                </div>

                {/* Editable Caption */}
                <textarea
                  value={editableCaption}
                  onChange={e => setEditableCaption(e.target.value)}
                  className="w-full min-h-[280px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-all resize-y leading-relaxed"
                  placeholder="กด Template แล้วเลือกสินค้าเพื่อสร้าง caption..."
                />

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleCopy}
                    className={`flex-1 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                      copied
                        ? 'bg-emerald-500 text-white shadow-emerald-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                    }`}
                  >
                    {copied ? <><Check size={18} /> คัดลอกแล้ว!</> : <><Copy size={18} /> คัดลอก Caption</>}
                  </button>
                  <button
                    onClick={() => setShowNewTemplate(!showNewTemplate)}
                    className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all active:scale-95"
                    title="บันทึกเป็น Template"
                  >
                    <Save size={18} />
                  </button>
                </div>

                {/* Save as new template */}
                {showNewTemplate && (
                  <div className="mt-3 flex gap-2 animate-in slide-in-from-top-2">
                    <input
                      type="text"
                      value={newTemplateName}
                      onChange={e => setNewTemplateName(e.target.value)}
                      placeholder="ชื่อ Template ใหม่..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-400"
                      onKeyDown={e => e.key === 'Enter' && saveAsTemplate()}
                    />
                    <button
                      onClick={saveAsTemplate}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      บันทึก
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
