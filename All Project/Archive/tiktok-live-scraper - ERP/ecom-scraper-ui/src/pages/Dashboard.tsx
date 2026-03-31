import { useNavigate } from 'react-router-dom';
import { 
  PlatformStatsCard, 
  ActivityChart, 
  ActiveJobsWidget, 
  RecentActivitiesWidget,
  QuickActionsPanel 
} from '../components/dashboard';
import { useScraperStatus, useStopScraper } from '../hooks/useScraper';
import { RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Define types for scraper jobs and status data
export type ScraperJob = {
  id: string;
  status: 'running' | 'queued' | 'completed' | 'failed' | 'stopping'; // Add other possible statuses
  platform: 'tiktok' | 'shopee' | 'lazada';
  // Add other properties as needed, e.g., startTime, progress, etc.
};

export type ScraperStatusData = {
  jobs: ScraperJob[];
  // Add other status properties if available
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { data, isRefetching, refetch } = useScraperStatus();
  const stopJob = useStopScraper();

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'tiktok-new':
        navigate('/scraper?platform=tiktok');
        break;
      case 'shopee-new':
        navigate('/scraper?platform=shopee');
        break;
      case 'lazada-new':
        navigate('/scraper?platform=lazada');
        break;
      case 'view-data':
        navigate('/data');
        break;
    }
  };

  // Mock data for the chart and activities (replace with real data in Phase 6)
  const chartData = [
    { time: '00:00', tiktok: 45, shopee: 32, lazada: 12 },
    { time: '04:00', tiktok: 52, shopee: 41, lazada: 18 },
    { time: '08:00', tiktok: 38, shopee: 55, lazada: 22 },
    { time: '12:00', tiktok: 65, shopee: 48, lazada: 35 },
    { time: '16:00', tiktok: 82, shopee: 62, lazada: 42 },
    { time: '20:00', tiktok: 74, shopee: 58, lazada: 38 },
  ];

  const recentActivities: any[] = [
    {
      id: '1',
      type: 'success',
      message: 'Job #1234 completed',
      details: 'Successfully scraped 1,245 products from TikTok Shop.',
      timestamp: new Date().toISOString(),
      platform: 'tiktok'
    },
    {
      id: '2',
      type: 'warning',
      message: 'Rate limit warning',
      details: 'Approaching rate limit on Shopee. Auto-cooldown active.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      platform: 'shopee'
    },
    {
      id: '3',
      type: 'info',
      message: 'Webhook delivered',
      details: 'Data sent successfully to Discord Channel.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    }
  ];

  // Robust data handling to prevent crashes
  const stats = Array.isArray(data?.jobs) ? data.jobs : [];
  const activeJobs = stats.filter((j: any) => j && (j.status === 'running' || j.status === 'queued'));
  
  const tiktokJobs = stats.filter((j: any) => j && j.platform === 'tiktok');
  const shopeeJobs = stats.filter((j: any) => j && j.platform === 'shopee');
  const lazadaJobs = stats.filter((j: any) => j && j.platform === 'lazada');

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Monitor your scraping activities and system performance
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="bg-white"
          icon={<RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />}
        >
          {isRefetching ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlatformStatsCard
          platform="tiktok"
          totalJobs={tiktokJobs.length || 1234} // placeholder if no real data
          activeJobs={tiktokJobs.filter((j: any) => j.status === 'running').length}
          trend={12}
          icon={<span>🎵</span>}
        />
        <PlatformStatsCard
          platform="shopee"
          totalJobs={shopeeJobs.length || 567}
          activeJobs={shopeeJobs.filter((j: any) => j.status === 'running').length}
          trend={-5}
          icon={<span>🛒</span>}
        />
        <PlatformStatsCard
          platform="lazada"
          totalJobs={lazadaJobs.length || 890}
          activeJobs={lazadaJobs.filter((j: any) => j.status === 'running').length}
          trend={8}
          icon={<span>📦</span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <ActivityChart data={chartData} />
        </div>

        {/* Active Jobs Widget */}
        <div className="lg:col-span-1">
          <ActiveJobsWidget 
            jobs={activeJobs} 
            onStop={(id: string) => stopJob.mutate(id)}
            onView={(id: string) => navigate(`/logs?jobId=${id}`)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <QuickActionsPanel onAction={handleAction} />
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-1">
          <RecentActivitiesWidget activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};
