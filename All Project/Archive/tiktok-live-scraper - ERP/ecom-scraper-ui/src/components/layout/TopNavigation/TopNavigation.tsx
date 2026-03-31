import { Bell, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopNavigationProps {
  onMenuToggle?: () => void;
}

export const TopNavigation = ({ onMenuToggle }: TopNavigationProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left: Logo + Menu Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">
              EcomScraper Hub
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links (desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavLink to="/" icon="📊">Dashboard</NavLink>
          <NavLink to="/scraper" icon="🔍">Scraper</NavLink>
          <NavLink to="/data" icon="💾">Data</NavLink>
          <NavLink to="/webhooks" icon="🔗">Webhooks</NavLink>
          <NavLink to="/settings" icon="⚙️">Settings</NavLink>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          
          <Link
            to="/settings"
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </Link>
          
          <button
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="User menu"
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// Internal NavLink component
interface NavLinkProps {
  to: string;
  icon: string;
  children: React.ReactNode;
}

const NavLink = ({ to, icon, children }: NavLinkProps) => {
  // In a real app, use useLocation() to detect active route
  const isActive = window.location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span>{icon}</span>
      {children}
    </Link>
  );
};
