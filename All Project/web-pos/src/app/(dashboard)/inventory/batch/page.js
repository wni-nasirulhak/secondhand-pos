'use client';
import { useState } from 'react';
import { 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Trash2, 
  Upload,
  Database
} from 'lucide-react';

export default function BatchToolsPage() {
  const [inputText, setInputText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const processData = () => {
    if (!inputText.trim()) return;
    
    // Split by lines and then by tabs or commas
    const lines = inputText.trim().split('\n');
    const parsed = lines.map(line => {
      const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
      return {
        Barcode_ID: parts[0]?.trim() || '',
        Item_Name: parts[1]?.trim() || '',
        Category_Name: parts[2]?.trim() || '',
        Brand: parts[3]?.trim() || '',
        Size_Label: parts[4]?.trim() || '',
        Price: parts[5]?.trim() || '0',
        Status: 'Available',
        Image_URL: parts[6]?.trim() || ''
      };
    }).filter(item => item.Barcode_ID && item.Item_Name);

    setData(parsed);
    setStatus({ type: 'info', message: `พบข้อทูล ${parsed.length} รายการ กรุณาตรวจสอบก่อนบันทึก` });
  };

  const clearData = () => {
    setData([]);
    setInputText('');
    setStatus({ type: '', message: '' });
  };

  const handleSave = async () => {
    if (data.length === 0) return;
    setLoading(true);
    setStatus({ type: 'info', message: 'กำลังบันทึกข้อมูล...' });

    try {
      // In a real scenario, we'd need a bulk append API or call append multiple times
      // For now, we'll implement a simple loop or a dedicated batch append API
      const res = await fetch('/api/inventory/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: data })
      });

      const result = await res.json();
      if (result.success) {
        setStatus({ type: 'success', message: `บันทึกสำเร็จ ${data.length} รายการ!` });
        setData([]);
        setInputText('');
      } else {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'เกิดข้อผิดพลาดในการบันทึก: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">เครื่องมือจัดการสต็อกแบบกลุ่ม</h1>
        <p className="text-slate-500 mt-1">เพิ่มสินค้าทีละหลายรายการด้วยการก๊อปปี้วางจาก Excel/Sheets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Area */}
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <FileUp className="w-6 h-6" />
            <h2 className="font-bold text-lg text-slate-800">วางข้อมูลที่นี่</h2>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-4 text-[10px] text-slate-400 font-medium mb-4">
            รูปแบบ: บาร์โค้ด, ชื่อสินค้า, หมวดหมู่, แบรนด์, ไซส์, ราคา, URL รูปภาพ (แยกด้วย Tab จาก Excel หรือ Comma)
          </div>

          <textarea 
            className="w-full h-80 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-mono resize-none"
            placeholder="เช่น: 1001, เสื้อยืดลายกราฟิก, เสื้อผ้า, Nike, L, 250, https://..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex gap-4">
            <button 
              onClick={processData}
              className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              ประมวลผลข้อมูล
            </button>
            <button 
              onClick={clearData}
              className="px-6 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[600px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              สรุปรายการเตรียมบันทึก ({data.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {data.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50 p-12 text-center">
                <AlertCircle className="w-16 h-16 mb-4" />
                <p className="text-sm font-medium">ยังไม่มีข้อมูลที่จะแสดงผล<br/>ก๊อปปี้ข้อมูลวางในช่องซ้ายมือแล้วกดประมวลผล</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-100 z-10 text-[10px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">บาร์โค้ด</th>
                    <th className="px-4 py-3">ชื่อสินค้า</th>
                    <th className="px-4 py-3">หมวดหมู่</th>
                    <th className="px-4 py-3 text-right">ราคา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{item.Barcode_ID}</td>
                      <td className="px-4 py-3 text-slate-600">{item.Item_Name}</td>
                      <td className="px-4 py-3 text-slate-400">{item.Category_Name}</td>
                      <td className="px-4 py-3 text-right font-black text-indigo-600">฿{item.Price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
            {status.message && (
              <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
                status.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 
                status.type === 'error' ? 'bg-rose-100 text-rose-700' : 
                'bg-indigo-100 text-indigo-700'
              }`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {status.message}
              </div>
            )}
            <button 
              disabled={data.length === 0 || loading}
              onClick={handleSave}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              <Save className="w-5 h-5" />
              {loading ? 'กำลังบันทึก...' : 'ยืนยันและนำเข้าข้อมูลเข้าระบบ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
