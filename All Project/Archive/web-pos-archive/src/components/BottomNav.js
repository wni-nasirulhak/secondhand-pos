'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShoppingCart, Users, Package, LayoutDashboard, MoreHorizontal, Store, Printer, Settings, LogOut, X, FileText } from 'lucide-react';

const mainItems = [
  { name: 'หน้าหลัก', href: '/dashboard', icon: LayoutDashboard },
  { name: 'ขายสินค้า', href: '/pos', icon: ShoppingCart },
  { name: 'คลังสินค้า', href: '/inventory', icon: Package },
  { name: 'ลูกค้า', href: '/crm', icon: Users },
];

const moreItems = [
  { name: 'โพสต์ขายสินค้า', href: '/social-post', icon: FileText },
  { name: 'หน้าร้าน (Shop)', href: '/shop', icon: Store },
  { name: 'เครื่องพิมพ์', href: '/printer', icon: Printer },
  { name: 'ตั้งค่าระบบ', href: '/settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreItems.some(item => pathname === item.href || pathname?.startsWith(item.href + '/'));

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed');
    }
  };

  return (
    <>
      {/* More Drawer Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-[199]" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </div>
      )}

      {/* More Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[200] transition-transform duration-300 ease-out"
        style={{ transform: showMore ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 mx-auto max-w-lg">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100">
            <span className="text-sm font-black text-slate-800">เมนูเพิ่มเติม</span>
            <button onClick={() => setShowMore(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
              <X size={18} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-1">
            {moreItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98]"
                  style={{
                    background: isActive ? '#eef2ff' : 'transparent',
                    color: isActive ? '#4f46e5' : '#475569',
                    textDecoration: 'none',
                  }}
                >
                  <div className="p-2 rounded-xl" style={{ background: isActive ? '#4f46e5' : '#f1f5f9' }}>
                    <Icon size={18} style={{ color: isActive ? 'white' : '#64748b' }} />
                  </div>
                  <span className="text-sm font-bold">{item.name}</span>
                </Link>
              );
            })}
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] w-full"
              style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}
            >
              <div className="p-2 rounded-xl" style={{ background: '#fef2f2' }}>
                <LogOut size={18} style={{ color: '#ef4444' }} />
              </div>
              <span className="text-sm font-bold">ออกจากระบบ</span>
            </button>
          </div>

          {/* Safe area padding */}
          <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }} />
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <nav className="bottom-nav">
        {mainItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 2px',
                gap: '3px',
                textDecoration: 'none',
                color: isActive ? '#4f46e5' : '#94a3b8',
                minHeight: '52px',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ 
                padding: '4px 12px', 
                borderRadius: '12px', 
                background: isActive ? '#eef2ff' : 'transparent',
                transition: 'all 0.2s',
              }}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1 }}>{item.name}</span>
            </Link>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMore(!showMore)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 2px',
            gap: '3px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: isMoreActive || showMore ? '#4f46e5' : '#94a3b8',
            minHeight: '52px',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ 
            padding: '4px 12px', 
            borderRadius: '12px', 
            background: (isMoreActive || showMore) ? '#eef2ff' : 'transparent',
            transition: 'all 0.2s',
          }}>
            <MoreHorizontal size={20} strokeWidth={(isMoreActive || showMore) ? 2.5 : 1.8} />
          </div>
          <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1 }}>เพิ่มเติม</span>
        </button>
      </nav>
    </>
  );
}
