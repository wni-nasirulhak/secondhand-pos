'use client';
import { X, RefreshCw, Camera, Loader2 } from 'lucide-react';
import { Select, Input, PriceInput } from './FormFields';
import { BRANDS, CONDITIONS, COLORS, PATTERNS, MATERIALS, PRODUCT_TYPES, SIZES_CLOTHING, SHOE_SIZES_EU, STATUSES } from '@/lib/constants';

export default function InventoryWizard({ 
  step, setStep, selectedType, setSelectedType, form, setF, generateId,
  uploadedImages, setUploadedImages, fileInputRef, handleFileUpload, uploadLoading,
  handleSubmit, isSubmitting, closeWizard, canSubmit 
}) {
  return (
    <div className="flex flex-col h-full bg-white">
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
              <div className="grid grid-cols-2 gap-4">
                <Input label="ชื่อสินค้า" required value={form.item_name} onChange={setF('item_name')} placeholder={`เช่น เสื้อยืดสีขาว Uniqlo`} />
                <Select label="สถานะสินค้า" required value={form.status || 'Available'} onChange={setF('status')} options={STATUSES} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select label="สี" value={form.color} onChange={setF('color')} options={COLORS} placeholder="เลือกสี" />
                <Select label="ลวดลาย" value={form.pattern} onChange={setF('pattern')} options={PATTERNS} placeholder="เลือกลาย" />
              </div>
              <Select label="วัสดุ/ผ้า" value={form.material} onChange={setF('material')} options={MATERIALS} placeholder="เลือกวัสดุ" />
              <div className="grid grid-cols-2 gap-4">
                <PriceInput label="🔻 ต้นทุน (฿)" value={form.cost_price} onChange={setF('cost_price')} />
                <PriceInput label="🔥 ราคาขาย (฿)" required value={form.selling_price} onChange={setF('selling_price')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">🔑 รหัสสินค้า (Auto)</label>
                <div className="flex gap-2">
                  <input value={form.barcode_id} onChange={e => setF('barcode_id')(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-mono outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm flex-1" placeholder="กดรีเฟรช →" />
                  <button type="button" onClick={() => generateId(form.brand, selectedType?.id)} className="px-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl transition-all active:scale-90 shadow-sm">
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

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {uploadedImages.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={url} className="w-full h-full object-cover" alt="uploaded" />
                    <button
                      type="button"
                      onClick={() => setUploadedImages(p => p.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[8px] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded-md shadow-sm">หลัก</span>}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLoading}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-400 bg-gray-50 hover:bg-indigo-50 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  {uploadLoading ? <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /> : <Camera className="w-6 h-6 text-gray-300" />}
                  <span className="text-[10px] font-bold text-gray-400">อัปโหลดรูป</span>
                </button>
                <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="shrink-0 p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1 || isSubmitting}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-0"
          >
            ย้อนกลับ
          </button>
          
          <div className="flex gap-3">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(s => Math.min(4, s + 1))}
                disabled={step === 1 && !selectedType}
                className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95 disabled:opacity-30"
              >
                ถัดไป
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className={`px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-40`}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'บันทึกข้อมูล'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
