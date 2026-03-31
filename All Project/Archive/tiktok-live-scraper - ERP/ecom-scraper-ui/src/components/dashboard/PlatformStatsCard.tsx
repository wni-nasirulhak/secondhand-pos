import React from 'react';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';

interface PlatformStatsCardProps {
  platform: 'tiktok' | 'shopee' | 'lazada';
  totalJobs: number;
  activeJobs: number;
  trend: number;
  icon: React.ReactNode;
}

export const PlatformStatsCard: React.FC<PlatformStatsCardProps> = ({
  platform,
  totalJobs,
  activeJobs,
  trend,
  icon,
}) => {
  const getPlatformLabel = () => {
    switch (platform) {
      case 'tiktok': return 'TikTok';
      case 'shopee': return 'Shopee';
      case 'lazada': return 'Lazada';
      default: return platform;
    }
  };

  return (
    <StatCard
      title={getPlatformLabel()}
      value={totalJobs}
      icon={icon}
      trend={{ value: trend, label: 'vs yesterday' }}
      description={`${activeJobs} active jobs running`}
      className="relative overflow-hidden"
    >
      <div className="absolute top-2 right-2">
        <Badge variant={platform as any}>{platform}</Badge>
      </div>
    </StatCard>
  );
};
