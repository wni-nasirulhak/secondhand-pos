import { Card } from '../ui/Card';
import { PlusCircle, ShoppingBag, Radio, Database, Zap } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface QuickActionsPanelProps {
  onAction: (actionId: string) => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ onAction }) => {
  const actions: QuickAction[] = [
    {
      id: 'tiktok-new',
      title: 'New TikTok Scrape',
      icon: <Radio className="w-5 h-5" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      onClick: () => onAction('tiktok-new'),
    },
    {
      id: 'shopee-new',
      title: 'New Shopee Scrape',
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      onClick: () => onAction('shopee-new'),
    },
    {
      id: 'lazada-new',
      title: 'New Lazada Scrape',
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      onClick: () => onAction('lazada-new'),
    },
    {
      id: 'view-data',
      title: 'View All Data',
      icon: <Database className="w-5 h-5" />,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      onClick: () => onAction('view-data'),
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-sm transition-all group relative overflow-hidden`}
          >
            <div className={`p-4 rounded-xl ${action.bgColor} ${action.color} mb-4 group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className="font-semibold text-gray-800 text-sm">{action.title}</span>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <PlusCircle className="w-4 h-4 text-blue-500" />
            </div>
            {/* Hover decoration */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500/10 rounded-full blur-xl group-hover:w-16 group-hover:h-16 transition-all"></div>
          </button>
        ))}
      </div>
    </Card>
  );
};
