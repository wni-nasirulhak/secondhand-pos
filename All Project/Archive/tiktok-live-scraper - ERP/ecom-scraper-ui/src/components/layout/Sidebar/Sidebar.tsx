import { Home, Search, Database, Webhook, Settings, FileText, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen
          w-64 bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header (mobile only) */}
          <div className="lg:hidden p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xl">Menu</span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              <SidebarLink
                to="/"
                icon={<Home className="w-5 h-5" />}
                label="Dashboard"
                badge="3"
              />
              
              <SidebarLink
                to="/scraper"
                icon={<Search className="w-5 h-5" />}
                label="Scraper"
              />
              
              <SidebarLink
                to="/data"
                icon={<Database className="w-5 h-5" />}
                label="Data Browser"
                badge="1.2K"
              />
              
              <SidebarLink
                to="/webhooks"
                icon={<Webhook className="w-5 h-5" />}
                label="Webhooks"
              />
              
              <SidebarLink
                to="/logs"
                icon={<FileText className="w-5 h-5" />}
                label="Logs"
              />
              
              <SidebarLink
                to="/settings"
                icon={<Settings className="w-5 h-5" />}
                label="Settings"
              />
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-gray-200"></div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
                Quick Stats
              </div>
              
              <QuickStat
                label="Active Jobs"
                value="3"
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              
              <QuickStat
                label="Products"
                value="1,234"
                color="text-green-600"
                bgColor="bg-green-50"
              />
              
              <QuickStat
                label="Webhooks"
                value="5"
                color="text-purple-600"
                bgColor="bg-purple-50"
              />
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Activity className="w-4 h-4 text-success" />
              <span>System Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// Internal SidebarLink component
interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

const SidebarLink = ({ to, icon, label, badge }: SidebarLinkProps) => {
  const isActive = window.location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`
        flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium
        transition-colors
        ${isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`
          text-xs px-2 py-0.5 rounded-full font-semibold
          ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
        `}>
          {badge}
        </span>
      )}
    </Link>
  );
};

// Internal QuickStat component
interface QuickStatProps {
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

const QuickStat = ({ label, value, color, bgColor }: QuickStatProps) => {
  return (
    <div className={`px-3 py-2 rounded-md ${bgColor}`}>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
};
