import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  description?: string;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
}

export const StatCard = ({ title, value, icon, trend, description, className = '', onClick }: StatCardProps) => {
  const trendValue = trend?.value ?? 0;
  const isPositive = trendValue >= 0;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {trend && (
            <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="font-medium">{isPositive ? '↑' : '↓'} {Math.abs(trendValue)}%</span>
              {trend.label && <span className="text-gray-500 ml-1">{trend.label}</span>}
            </div>
          )}
          {description && <p className="text-xs text-gray-400 mt-2">{description}</p>}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
