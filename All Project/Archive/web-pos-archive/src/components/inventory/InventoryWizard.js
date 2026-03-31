'use client';
import { useState, useEffect } from 'react';
import { X, RefreshCw, Camera, Loader2, UploadCloud } from 'lucide-react';
import { Select, Input, PriceInput } from './FormFields';
import { BRANDS, CONDITIONS, COLORS, PATTERNS, MATERIALS, PRODUCT_TYPES, SIZES_CLOTHING, SHOE_SIZES_EU, STATUSES } from '@/lib/constants';

export default function InventoryWizard({ 
  step, setStep, selectedType, setSelectedType, form, setF, generateId,
  uploadedImages, setUploadedImages, fileInputRef, handleFileUpload, uploadLoading,
  handleSubmit, isSubmitting, closeWizard, canSubmit 
}) {
  const [dbCategories, setDbCategories] = useState([]);
  const [brandConfig, setBrandConfig] = useState({});

  useEffect(() => {
    if (step === 2) {
      Promise.all([
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
      ]).then(([catRes, brandRes]) => {
        if (catRes.data) setDbCategories(catRes.data);
        if (brandRes.data) setBrandConfig(brandRes.data);
      }).catch(console.error);
    }
  }, [step]);

  const activeBrands = (() => {
    if (!selectedType) return BRANDS;
    const cat = dbCategories.find(c => c.name === selectedType.dbCategory);
    if (!cat || !brandConfig[cat.id] || brandConfig[cat.id].length === 0) return BRANDS;
    return brandConfig[cat.id];
  })();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Drag handle mobile */}
      <div className="sm:hidden flex justify-center pt-2.5 pb-0.5 shrink-0">
        <div className="w-8 h-1 bg-gray-200 rounded-full" />
      </div>

      {/* Header */}
      <div className="shrink-0 px-4 py-2.5 md:px-5 md:py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-[8px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">ขั้นตอน {step}/4</div>
          <h2 className="text-sm md:text-base font-black text-gray-900 leading-tight">
            {step === 1 && '🗂️ หมวดหมู่'}
            {step === 2 && '📋 ข้อมูลสินค้า'}
            {step === 3 && '📐 รายละเอียด'}
            {step === 4 && '📸 รูปภาพ'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5 md:gap-1">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className={`h-1 w-4 md:h-1.5 md:w-6 rounded-full transition-all ${step >= n ? 'bg-indigo-500' : 'bg-gray-100'}`} />
            ))}
          </div>
          <button onClick={closeWizard} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <form id="wizardForm" onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => { setSelectedType(type); if (form.brand) generateId(form.brand, type.id); }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all active:scale-95 min-h-[80px] ${
                    selectedType?.id === type.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-50 bg-white hover:border-gray-100'
                  }`}
                >
                  <span className="text-2xl mb-1">{type.icon}</span>
                  <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">{type.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Select
                  label="แบรนด์" required value={form.brand}
                  onChange={v => { setF('brand')(v); if (selectedType) generateId(v, selectedType.id); }}
                  options={activeBrands} placeholder="เลือกแบรนด์"
                />
                <Select label="สภาพ" required value={form.condition} onChange={setF('condition')} options={CONDITIONS} />
              </div>
              <Input label="ชื่อสินค้า" required value={form.item_name} onChange={setF('item_name')} placeholder={`เช่น เสื้อยืดสีขาว Uniqlo`} />
              <div className="grid grid-cols-2 gap-2">
                <Select label="สถานะ" required value={form.status || 'Available'} onChange={setF('status')} options={STATUSES} />
                <Select label="สี" value={form.color} onChange={setF('color')} options={COLORS} placeholder="เลือกสี" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select label="วัสดุ/ผ้า" value={form.material} onChange={setF('material')} options={MATERIALS} placeholder="เลือกวัสดุ" />
                <Select label="ลวดลาย" value={form.pattern} onChange={setF('pattern')} options={PATTERNS} placeholder="เลือกลาย" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <PriceInput label="ต้นทุน (฿)" value={form.cost_price} onChange={setF('cost_price')} />
                <PriceInput label="ราคาขาย (฿)" required value={form.selling_price} onChange={setF('selling_price')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">🔑 รหัสบาร์โค้ด</label>
                <div className="flex gap-2">
                  <input value={form.barcode_id} onChange={e => setF('barcode_id')(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-gray-800 font-mono outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm flex-1" placeholder="Auto..." />
                  <button type="button" onClick={() => generateId(form.brand, selectedType?.id)} className="px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all active:scale-90">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-3">
              {selectedType?.measureType === 'top' && (
                <>
                  <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest pl-1">👕 ขนาดเสื้อ (นิ้ว)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select label="ไซส์" value={form.size} onChange={setF('size')} options={SIZES_CLOTHING} />
                    <Input label="อก" value={form.chest_width} onChange={setF('chest_width')} type="number" step="0.5" placeholder="0.0" />
                    <Input label="ยาวเสื้อ" value={form.total_length} onChange={setF('total_length')} type="number" step="0.5" placeholder="0.0" />
                    <Input label="ยาวแขน" value={form.sleeve_length} onChange={setF('sleeve_length')} type="number" step="0.5" placeholder="0.0" />
                    <Input label="ไหล่" value={form.shoulder_width} onChange={setF('shoulder_width')} type="number" step="0.5" placeholder="0.0" />
                    <Input label="เอว" value={form.waist_size} onChange={setF('waist_size')} type="number" step="0.5" placeholder="-" />
                  </div>
                </>
              )}
              {selectedType?.measureType === 'bottom' && (
                <>
                  <div className="text-[10px] font-bold text-violet-500 uppercase tracking-widest pl-1">👖 ขนาดกางเกง (นิ้ว)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select label="ไซส์" value={form.size} onChange={setF('size')} options={SIZES_CLOTHING} />
                    <Input label="เอว" value={form.waist_size} onChange={setF('waist_size')} type="number" step="0.5" placeholder="0.0" />
                    <Input label="ยาวขา" value={form.total_length} onChange={setF('total_length')} type="number" step="0.5" placeholder="0.0" />
                    <Input label="สะโพก/ต้นขา" value={form.chest_width} onChange={setF('chest_width')} type="number" step="0.5" placeholder="0.0" />
                  </div>
                </>
              )}
              {selectedType?.measureType === 'shoe' && (
                <>
                  <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest pl-1">👟 ขนาดรองเท้า</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Select label="EU" value={form.size_eu} onChange={setF('size_eu')} options={SHOE_SIZES_EU} placeholder="EU" />
                    <Input label="US" value={form.size_us} onChange={setF('size_us')} type="number" placeholder="US" />
                    <Input label="UK" value={form.size_uk} onChange={setF('size_uk')} type="number" placeholder="UK" />
                  </div>
                  <Input label="พื้นใน (CM)" value={form.insole_cm} onChange={setF('insole_cm')} type="number" step="0.5" placeholder="0.0" />
                </>
              )}
              <Input label="หมายเหตุ/ตำหนิ" value={form.description} onChange={setF('description')} placeholder="รายละเอียดเพิ่มเติม..." />
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 md:grid-cols-3 gap-1.5">
                {uploadedImages.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group">
                    <img src={url} className="w-full h-full object-cover" alt="uploaded" />
                    <button
                      type="button"
                      onClick={() => setUploadedImages(p => p.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 p-1 bg-red-500 text-white rounded-md opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                    {i === 0 && <span className="absolute bottom-0.5 left-0.5 text-[7px] font-black bg-indigo-500 text-white px-1 py-0.5 rounded-sm shadow-sm">หลัก</span>}
                  </div>
                ))}
                <div className="flex flex-col gap-1.5 h-full">
                  <button
                    type="button"
                    onClick={() => document.getElementById('camera-upload-input').click()}
                    disabled={uploadLoading}
                    className="flex-1 rounded-lg border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50 text-indigo-500"
                  >
                    {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <span className="text-[7px] font-black uppercase">ถ่ายรูป</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload-input').click()}
                    disabled={uploadLoading}
                    className="flex-1 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50 text-gray-400"
                  >
                    {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    <span className="text-[7px] font-bold uppercase">อัปโหลด</span>
                  </button>
                </div>
                <input type="file" hidden id="file-upload-input" onChange={handleFileUpload} accept="image/*" />
                <input type="file" hidden id="camera-upload-input" onChange={handleFileUpload} accept="image/*" capture="environment" />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="shrink-0 p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1 || isSubmitting}
            className="flex items-center gap-2 px-5 py-4 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-0 rounded-xl hover:bg-gray-100 active:scale-95"
          >
            ← ย้อนกลับ
          </button>
          
          <div className="flex gap-3 flex-1 justify-end">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(s => Math.min(4, s + 1))}
                disabled={step === 1 && !selectedType}
                className="flex-1 sm:flex-none px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95 disabled:opacity-30"
              >
                ถัดไป →
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="flex-1 sm:flex-none px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'บันทึกข้อมูล ✓'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
