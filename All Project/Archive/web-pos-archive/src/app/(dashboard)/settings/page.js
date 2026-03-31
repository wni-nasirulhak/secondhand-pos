'use client';
import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, Save, Tags, Grid, Edit3, Store, Award, Truck, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [categories, setCategories] = useState([]);
  const [brandConfig, setBrandConfig] = useState({});
  const [newCatName, setNewCatName] = useState('');
  const [editingCategory, setEditingCategory] = useState({ id: null, name: '' });
  const [newBrandNames, setNewBrandNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Store info
  const [storeInfo, setStoreInfo] = useState({
    name: '', line_id: '', phone: '', address: '', instagram: '', facebook: '',
  });
  const [savingStore, setSavingStore] = useState(false);

  // Points config
  const [pointsConfig, setPointsConfig] = useState({
    earn_rate: 1, // % ของยอดขายที่ได้แต้ม
    redeem_rate: 100, // กี่แต้มแลก 1 บาท
    enabled: true,
  });
  const [savingPoints, setSavingPoints] = useState(false);

  // Shipping defaults
  const [shippingDefaults, setShippingDefaults] = useState({
    default_cost: 50,
    provider: 'Kerry',
  });
  const [savingShipping, setSavingShipping] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [catRes, brandRes, storeRes, pointsRes, shippingRes] = await Promise.all([
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/settings/config?key=store_info').then(r => r.json()),
        fetch('/api/settings/config?key=points_config').then(r => r.json()),
        fetch('/api/settings/config?key=shipping_defaults').then(r => r.json()),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (brandRes.data) setBrandConfig(brandRes.data);
      if (storeRes.data) setStoreInfo(prev => ({ ...prev, ...storeRes.data }));
      if (pointsRes.data) setPointsConfig(prev => ({ ...prev, ...pointsRes.data }));
      if (shippingRes.data) setShippingDefaults(prev => ({ ...prev, ...shippingRes.data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveStoreInfo() {
    setSavingStore(true);
    try {
      await fetch('/api/settings/config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'store_info', value: storeInfo })
      });
      alert('บันทึกข้อมูลร้านค้าเรียบร้อย');
    } catch { alert('เกิดข้อผิดพลาด'); }
    finally { setSavingStore(false); }
  }

  async function savePointsConfig() {
    setSavingPoints(true);
    try {
      await fetch('/api/settings/config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'points_config', value: pointsConfig })
      });
      alert('บันทึกการตั้งค่าแต้มเรียบร้อย');
    } catch { alert('เกิดข้อผิดพลาด'); }
    finally { setSavingPoints(false); }
  }

  async function saveShippingDefaults() {
    setSavingShipping(true);
    try {
      await fetch('/api/settings/config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'shipping_defaults', value: shippingDefaults })
      });
      alert('บันทึกค่าส่งเริ่มต้นเรียบร้อย');
    } catch { alert('เกิดข้อผิดพลาด'); }
    finally { setSavingShipping(false); }
  }

  async function addCategory(e) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() })
      });
      if (res.ok) { setNewCatName(''); fetchData(); }
      else alert('Failed to add category');
    } catch (err) { console.error(err); }
  }

  async function deleteCategory(id, name) {
    if (!confirm(`ยืนยันการลบหมวดหมู่ "${name}" ?\n*หมายเหตุ: จะลบได้ก็ต่อเมื่อไม่มีสินค้าในหมวดหมู่นี้แล้วเท่านั้น`)) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchData();
      else { const data = await res.json(); alert(`ลบไม่สำเร็จ: ${data.error || 'หมวดหมู่นี้มีการใช้งานอยู่'}`); }
    } catch (err) { console.error(err); }
  }

  async function updateCategory(id) {
    if (!editingCategory.name.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingCategory.name.trim() })
      });
      if (res.ok) { setEditingCategory({ id: null, name: '' }); fetchData(); }
      else { const data = await res.json(); alert(`แก้ไขไม่สำเร็จ: ${data.error}`); }
    } catch (err) { console.error(err); }
  }

  async function saveBrandConfig() {
    try {
      setSaving(true);
      const res = await fetch('/api/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandConfig)
      });
      if (res.ok) alert('บันทึกข้อมูลเรียบร้อยแล้ว');
      else alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  function addBrand(categoryId) {
    const val = newBrandNames[categoryId];
    if (!val || !val.trim()) return;
    setBrandConfig(prev => {
      const existing = prev[categoryId] || [];
      if (existing.includes(val.trim())) return prev;
      return { ...prev, [categoryId]: [...existing, val.trim()] };
    });
    setNewBrandNames(prev => ({ ...prev, [categoryId]: '' }));
  }

  function removeBrand(categoryId, brandName) {
    setBrandConfig(prev => {
      const existing = prev[categoryId] || [];
      return { ...prev, [categoryId]: existing.filter(b => b !== brandName) };
    });
  }

  if (loading) return <div className="p-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 p-4 lg:p-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">ตั้งค่าระบบ</h1>
          <p className="text-xs font-bold text-slate-400">จัดการข้อมูลร้าน หมวดหมู่ แบรนด์ แต้ม และค่าส่ง</p>
        </div>
      </div>

      {/* ── STORE INFO ─────────────────────── */}
      <Section icon={Store} iconColor="text-emerald-500" title="ข้อมูลร้านค้า" subtitle="ใช้แสดงในใบเสร็จ, หน้าร้าน, และ Social Post">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsInput label="ชื่อร้านค้า" value={storeInfo.name} onChange={v => setStoreInfo(p => ({...p, name: v}))} placeholder="Rizan's Thrift" />
          <SettingsInput label="LINE ID" value={storeInfo.line_id} onChange={v => setStoreInfo(p => ({...p, line_id: v}))} placeholder="@rizanthrift" />
          <SettingsInput label="เบอร์โทรศัพท์" value={storeInfo.phone} onChange={v => setStoreInfo(p => ({...p, phone: v}))} placeholder="0xx-xxx-xxxx" />
          <SettingsInput label="Instagram" value={storeInfo.instagram} onChange={v => setStoreInfo(p => ({...p, instagram: v}))} placeholder="@rizanthrift" />
          <div className="md:col-span-2">
            <SettingsInput label="ที่อยู่ร้าน" value={storeInfo.address} onChange={v => setStoreInfo(p => ({...p, address: v}))} placeholder="123 ถ...." />
          </div>
        </div>
        <SaveButton onClick={saveStoreInfo} saving={savingStore} label="บันทึกข้อมูลร้าน" />
      </Section>

      {/* ── POINTS CONFIG ─────────────────── */}
      <Section icon={Award} iconColor="text-amber-500" title="ระบบแต้มสะสม" subtitle="กำหนดอัตราสะสมและแลกแต้ม">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SettingsInput 
            label="อัตราสะสม (% ของยอดขาย)" 
            type="number" 
            value={pointsConfig.earn_rate} 
            onChange={v => setPointsConfig(p => ({...p, earn_rate: parseFloat(v) || 0}))} 
            placeholder="1" 
          />
          <SettingsInput 
            label="อัตราแลก (แต้ม = ฿1)" 
            type="number" 
            value={pointsConfig.redeem_rate} 
            onChange={v => setPointsConfig(p => ({...p, redeem_rate: parseInt(v) || 0}))} 
            placeholder="100" 
          />
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={pointsConfig.enabled} 
                onChange={e => setPointsConfig(p => ({...p, enabled: e.target.checked}))}
                className="w-5 h-5 rounded accent-indigo-600"
              />
              <span className="text-sm font-bold text-slate-700">เปิดใช้งานระบบแต้ม</span>
            </label>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium mt-2">
          💡 ตัวอย่าง: ลูกค้าซื้อ ฿1,000 จะได้ {pointsConfig.earn_rate * 10} แต้ม — แลกส่วนลดได้ ฿{((pointsConfig.earn_rate * 10) / pointsConfig.redeem_rate * 1).toFixed(2)}
        </div>
        <SaveButton onClick={savePointsConfig} saving={savingPoints} label="บันทึกค่าแต้ม" />
      </Section>

      {/* ── SHIPPING DEFAULTS ──────────────── */}
      <Section icon={Truck} iconColor="text-blue-500" title="ค่าส่งเริ่มต้น" subtitle="ค่าส่งที่กรอกอัตโนมัติใน POS">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsInput 
            label="ค่าส่งเริ่มต้น (฿)" 
            type="number" 
            value={shippingDefaults.default_cost} 
            onChange={v => setShippingDefaults(p => ({...p, default_cost: parseFloat(v) || 0}))} 
            placeholder="50" 
          />
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">ขนส่งเริ่มต้น</label>
            <select 
              value={shippingDefaults.provider} 
              onChange={e => setShippingDefaults(p => ({...p, provider: e.target.value}))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 appearance-none"
            >
              <option value="Kerry">Kerry Express</option>
              <option value="Flash">Flash Express</option>
              <option value="J&T">J&T Express</option>
              <option value="EMS">ไปรษณีย์ EMS</option>
              <option value="Other">อื่นๆ</option>
            </select>
          </div>
        </div>
        <SaveButton onClick={saveShippingDefaults} saving={savingShipping} label="บันทึกค่าส่ง" />
      </Section>

      {/* ── CATEGORIES + BRANDS (existing) ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Grid size={18} className="text-indigo-500"/> จัดการหมวดหมู่ (Categories)</h2>
        <form onSubmit={addCategory} className="flex gap-2 mb-6">
          <input 
            type="text" 
            value={newCatName} 
            onChange={(e) => setNewCatName(e.target.value)} 
            placeholder="ชื่อหมวดหมู่ใหม่..." 
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
          />
          <button type="submit" className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 flex items-center gap-2 active:scale-95 transition-all">
            <Plus size={16} /> เพิ่ม
          </button>
        </form>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2 pt-4 border-t border-slate-100"><Tags size={18} className="text-rose-500"/> จัดการแบรนด์ตามหมวดหมู่ (Brands per Category)</h2>
          <p className="text-xs text-slate-500 font-medium mb-4">เพิ่มรายชื่อแบรนด์ที่จะให้แสดงในตัวเลือกของแต่ละหมวดหมู่</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                   {editingCategory.id === cat.id ? (
                     <div className="flex bg-white rounded border border-indigo-500 overflow-hidden outline-none flex-1 mr-2">
                       <input 
                         className="px-2 py-1 text-sm font-bold text-slate-800 w-full outline-none"
                         autoFocus
                         value={editingCategory.name}
                         onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                         onKeyDown={e => { if (e.key === 'Enter') updateCategory(cat.id); else if (e.key === 'Escape') setEditingCategory({id: null, name: ''}); }}
                       />
                       <button onClick={() => updateCategory(cat.id)} className="px-2 bg-indigo-50 text-indigo-600 font-bold text-xs"><Save size={14} /></button>
                     </div>
                   ) : (
                     <div className="font-black text-slate-800 text-sm flex-1">{cat.name}</div>
                   )}
                   
                   <div className="flex items-center gap-1 shrink-0">
                     <button 
                       onClick={() => setEditingCategory({ id: cat.id, name: cat.name })}
                       className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
                       title="แก้ไขชื่อหมวดหมู่"
                     >
                       <Edit3 size={16} />
                     </button>
                     <button 
                       onClick={() => deleteCategory(cat.id, cat.name)}
                       className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                       title="ลบหมวดหมู่"
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
                  {(brandConfig[cat.id] || []).map(brand => (
                    <span key={brand} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600">
                      {brand}
                      <button onClick={() => removeBrand(cat.id, brand)} className="text-rose-400 hover:text-rose-600 ml-1"><XIcon/></button>
                    </span>
                  ))}
                  {(!brandConfig[cat.id] || brandConfig[cat.id].length === 0) && (
                    <span className="text-xs text-slate-400 italic">ไม่มีแบรนด์ </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newBrandNames[cat.id] || ''} 
                    onChange={(e) => setNewBrandNames(p => ({...p, [cat.id]: e.target.value}))}
                    onKeyPress={(e) => e.key === 'Enter' && addBrand(cat.id)}
                    placeholder="พิมพ์ชื่อแบรนด์..." 
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold outline-none focus:border-indigo-500"
                  />
                  <button onClick={() => addBrand(cat.id)} className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-900">เพิ่ม</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <button 
              onClick={saveBrandConfig}
              disabled={saving}
              className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
            >
              <Save size={18} /> {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าแบรนด์'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper Components ──────────────────

function Section({ icon: Icon, iconColor, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className={iconColor} />
        <div>
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function SettingsInput({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      <input 
        type={type}
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
      />
    </div>
  );
}

function SaveButton({ onClick, saving, label }) {
  return (
    <div className="pt-4 mt-4 border-t border-slate-100">
      <button 
        onClick={onClick}
        disabled={saving}
        className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 active:scale-95"
      >
        <Save size={16} /> {saving ? 'กำลังบันทึก...' : label}
      </button>
    </div>
  );
}

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
