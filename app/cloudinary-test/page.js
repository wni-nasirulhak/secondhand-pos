'use client';
import { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, XCircle, Loader2, Play, Info, ExternalLink } from 'lucide-react';

export default function CloudinaryTestPage() {
  const [status, setStatus] = useState('idle');
  const [config, setConfig] = useState({ cloudName: '', uploadPreset: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch current config from a temporary endpoint or just use process.env if available (it won't be on client easily)
    // For now, we'll try to trigger a test via the already existing /api/upload with a dummy file
  }, []);

  const addLog = (msg, type = 'info') => {
    setResults(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
  };

  const runTest = async () => {
    setLoading(true);
    setResults([]);
    addLog('Starting Cloudinary Diagnostic Test...');

    try {
      // 1. Check Cloud Name
      const cloudName = 'domga8omv'; // We know this from .env.local
      const uploadPreset = 'rizan_pos_unsigned'; 
      addLog(`Configured Cloud Name: ${cloudName}`);
      addLog(`Configured Upload Preset: ${uploadPreset}`);

      addLog(`Verifying Cloud Name "${cloudName}" exists...`);
      const sampleRes = await fetch(`https://res.cloudinary.com/${cloudName}/image/upload/v1/sample.jpg`);
      if (sampleRes.ok) {
        addLog(`✅ Cloud Name "${cloudName}" is VALID.`, 'success');
      } else {
        addLog(`❌ Cloud Name "${cloudName}" NOT FOUND (404). Check your .env.local`, 'error');
        setLoading(false);
        return;
      }

      // 2. Try Upload
      addLog(`Testing Unsigned Upload with preset "${uploadPreset}"...`);
      const dummyBlob = new Blob(['test-image-data'], { type: 'text/plain' });
      const fd = new FormData();
      fd.append('file', dummyBlob, 'test.txt');
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd
      });

      const data = await res.json();
      if (res.ok) {
        addLog('✅ UPLOAD SUCCESSFUL!', 'success');
        addLog(`Public ID: ${data.public_id}`);
        addLog(`URL: ${data.url}`);
      } else {
        addLog(`❌ UPLOAD FAILED: ${data.error}`, 'error');
        if (data.suggestion) addLog(`💡 Suggestion: ${data.suggestion}`, 'info');
        
        if (data.error.includes('preset not found')) {
            addLog('HOW TO FIX (วิธีแก้ไข):', 'info');
            addLog(`1. Log in to Cloudinary Dashboard`);
            addLog(`2. Go to Settings (Gear icon) > Upload`);
            addLog(`3. Scroll to "Upload presets" > click "Add upload preset"`);
            addLog(`4. Name: ${uploadPreset}`);
            addLog(`5. Signing Mode: **Unsigned**`);
            addLog(`6. Click Save`);
        }
      }
    } catch (err) {
      addLog(`❌ System Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-8 text-white relative">
          <Cloud className="w-12 h-12 mb-4 opacity-50" />
          <h1 className="text-3xl font-black">Cloudinary Troubleshooter</h1>
          <p className="opacity-80 font-medium">ระบบทดสอบการอัปโหลดรูปภาพ</p>
          <div className="absolute top-8 right-8">
            <button 
                onClick={runTest} 
                disabled={loading}
                className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                เริ่มการทดสอบ
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Diagnostic Logs</h2>
            <div className="bg-slate-900 rounded-2xl p-6 font-mono text-sm min-h-[300px] overflow-y-auto space-y-2">
              {results.length === 0 && <div className="text-slate-500 italic">กด "เริ่มการทดสอบ" เพื่อเริ่มงาน...</div>}
              {results.map((log, i) => (
                <div key={i} className={`flex gap-3 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-emerald-400' : 
                  'text-indigo-400'
                }`}>
                  <span className="text-slate-600 shrink-0">[{log.time}]</span>
                  <span className="whitespace-pre-wrap">{log.msg}</span>
                </div>
              ))}
              {results.some(r => r.msg.includes('preset not found')) && (
                <div className="mt-6 border-t border-slate-700 pt-6">
                  <div className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    วิธีแก้ปัญหา (Follow these 3 steps):
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-800 p-4 rounded-xl text-slate-200 border border-slate-700">
                       <p className="mb-2 font-bold text-indigo-300">1. เข้าไปที่ Cloudinary Dashbaord &gt; Settings &gt; Upload</p>
                       <p className="mb-2 font-bold text-indigo-300">2. เลื่อนลงมาที่ "Upload presets" คลิก "Add upload preset"</p>
                       <p className="font-bold text-indigo-300">3. ตั้งชื่อว่า <span className="bg-indigo-900 border border-indigo-500 px-2 py-0.5 rounded text-white">rizan_pos_unsigned</span> แล้วเปลี่ยนเป็น **Unsigned**</p>
                    </div>
                    <img src="/cloudinary-guide.png" alt="Cloudinary Guide" className="w-full rounded-xl border border-slate-700 shadow-2xl" />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-black text-slate-400 uppercase">Configuration</span>
                    </div>
                    <div className="text-sm font-bold text-slate-700">Cloud: <span className="text-indigo-600 font-mono">domga8omv</span></div>
                    <div className="text-sm font-bold text-slate-700">Preset: <span className="text-indigo-600 font-mono">rizan_pos_unsigned</span></div>
                </div>
                <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-black text-indigo-400 uppercase">External Links</span>
                    </div>
                    <a href="https://cloudinary.com/console/settings/upload" target="_blank" className="text-sm font-black text-indigo-600 hover:underline block">Cloudinary Settings →</a>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs font-medium">Rizan's Thrift POS · Cloudinary Debugging Utility</p>
    </div>
  );
}
