'use client';
import { ChevronDown } from 'lucide-react';

export function Field({ label, required, children }) {
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

const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 md:py-3 text-gray-800 font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-gray-300 text-sm";
const selectCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 md:py-3 text-gray-800 font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm appearance-none";

export function Select({ label, value, onChange, options, placeholder, required }) {
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

export function Input({ label, value, onChange, type = 'text', placeholder, required, step, className = "" }) {
  return (
    <Field label={label} required={required}>
      <input 
        required={required} 
        type={type} 
        step={step} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className={`${inputCls} ${className}`} 
        placeholder={placeholder} 
      />
    </Field>
  );
}

export function PriceInput({ label, value, onChange, required }) {
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
          className="flex-1 bg-transparent py-2 md:py-3 text-gray-800 font-bold outline-none text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <div className="flex border-l border-gray-200 shrink-0">
          <button type="button" onClick={() => onChange(String(num + 10))} className="px-3 py-2 md:py-3 hover:bg-indigo-50 text-gray-500 font-black text-sm transition-colors border-r border-gray-200">+</button>
          <button type="button" onClick={() => onChange(String(Math.max(0, num - 10)))} className="px-3 py-2 md:py-3 hover:bg-red-50 text-gray-500 font-black text-sm transition-colors">−</button>
        </div>
      </div>
    </Field>
  );
}
