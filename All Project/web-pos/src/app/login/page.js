"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Loader2, ShoppingBag } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'การเข้าสู่ระบบล้มเหลว');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-10 space-y-10">
          <div className="text-center space-y-3">
             <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                <ShoppingBag className="w-8 h-8" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Rizan POS</h1>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Enterprise Management</p>
             </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-3xl text-xs font-black text-center animate-in shake-1">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-indigo-600" />
                <input 
                  type="text"
                  placeholder="Username"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl pl-16 pr-6 py-5 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-indigo-600" />
                <input 
                  type="password"
                  placeholder="Password"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl pl-16 pr-6 py-5 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-700"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="text-center pt-4">
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                Protected by Senior-Grade Encryption
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
