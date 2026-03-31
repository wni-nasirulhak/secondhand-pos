import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CheckCircle2, AlertCircle, Info, Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: string;
  timestamp: string;
  platform?: 'tiktok' | 'shopee' | 'lazada';
}

interface RecentActivitiesWidgetProps {
  activities: Activity[];
  onViewAll?: () => void;
}

export const RecentActivitiesWidget: React.FC<RecentActivitiesWidgetProps> = ({
  activities,
  onViewAll,
}) => {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default: return <Info className="w-4 h-4 text-sky-500" />;
    }
  };

  const getBgColor = (type: Activity['type']) => {
    switch (type) {
      case 'success': return 'bg-emerald-50';
      case 'warning': return 'bg-amber-50';
      case 'error': return 'bg-rose-50';
      default: return 'bg-sky-50';
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          Recent Activities
        </h3>
        <Button variant="text" size="sm" onClick={onViewAll} className="text-gray-500 hover:text-gray-700">
          View All
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[300px] p-2">
        {activities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20 px-4 text-center">
            <Clock className="w-10 h-10 mb-4 opacity-20" />
            <p className="text-sm font-medium">No recent activities</p>
            <p className="text-xs mt-1">Activities will appear here as soon as you start scraping</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className={`flex-shrink-0 w-10 h-10 ${getBgColor(activity.type)} rounded-xl flex items-center justify-center`}>
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm font-semibold text-gray-900 truncate pr-2 group-hover:text-blue-600 transition-colors">
                      {activity.message}
                    </p>
                    {activity.platform && (
                      <Badge variant={activity.platform as any} size="sm">
                        {activity.platform}
                      </Badge>
                    )}
                  </div>
                  {activity.details && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-1">
                      {activity.details}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(activity.timestamp))} ago
                    </span>
                    <span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-semibold uppercase tracking-wider">
                      Details <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
