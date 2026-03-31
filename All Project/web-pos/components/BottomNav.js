'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Users, Package, LayoutDashboard, Database } from 'lucide-react';

const navItems = [
  { name: 'หน้าหลัก', href: '/dashboard', icon: LayoutDashboard },
  { name: 'ขายสินค้า', href: '/pos', icon: ShoppingCart },
  { name: 'คลังสินค้า', href: '/inventory', icon: Package },
  { name: 'ลูกค้า', href: '/crm', icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    /* bottom-nav CSS class handles show/hide via globals.css media query */
    <nav className="bottom-nav">
      {navItems.map(item => {
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
              gap: '2px',
              textDecoration: 'none',
              color: isActive ? '#4f46e5' : '#94a3b8',
              minHeight: '52px',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ padding: '2px', borderRadius: '6px', background: isActive ? '#eef2ff' : 'transparent' }}>
               <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1 }}>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
