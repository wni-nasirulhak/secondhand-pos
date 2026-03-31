'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Users, Package, Settings, Store, Database, LayoutDashboard, Printer, LogOut } from 'lucide-react';

const menuItems = [
  { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard },
  { name: 'POS ขายสินค้า', href: '/pos', icon: ShoppingCart },
  { name: 'คลังสินค้า', href: '/inventory', icon: Package },
  { name: 'เครื่องพิมพ์บาร์โค้ด', href: '/printer', icon: Printer },
  { name: 'จัดการลูกค้า', href: '/crm', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed');
    }
  };

  return (
    /* app-sidebar CSS class handles show/hide and fixed positioning via globals.css */
    <aside className="app-sidebar" style={{ background: '#0f172a', color: 'white', flexDirection: 'column' }}>
      {/* Logo */}
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '6px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center' }}>
          <Store size={16} color="white" />
        </div>
        <div>
          <div style={{ color: 'white', fontWeight: 900, fontSize: '14px', fontStyle: 'italic', textTransform: 'uppercase', lineHeight: 1 }}>Rizan&apos;s</div>
          <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '1px' }}>Thrift POS</div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'auto' }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/inventory' && pathname?.startsWith(item.href + '/'));
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '10px',
              textDecoration: 'none', fontWeight: 600, fontSize: '12px', transition: 'all 0.15s',
              background: isActive ? '#4f46e5' : 'transparent',
              color: isActive ? 'white' : '#94a3b8',
            }}>
              <Icon size={16} />
              <span>{item.name}</span>
              {isActive && <div style={{ marginLeft: 'auto', width: 6, height: 6, background: 'rgba(255,255,255,0.5)', borderRadius: '50%' }} />}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Link href="/settings" style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '10px',
          textDecoration: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '12px',
        }}>
          <Settings size={16} />
          <span>ตั้งค่าระบบ</span>
        </Link>
        
        <button 
          onClick={handleLogout}
          style={{
            width: '100%', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '10px',
            textDecoration: 'none', color: '#fca5a5', fontWeight: 600, fontSize: '12px',
            background: 'transparent',
          }}
          className="hover:bg-rose-500/10 transition-all"
        >
          <LogOut size={16} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
