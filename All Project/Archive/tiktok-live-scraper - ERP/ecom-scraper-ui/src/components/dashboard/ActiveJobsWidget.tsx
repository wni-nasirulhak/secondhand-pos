import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import type { ScrapingJob } from '../../types/scraper';
import { Play, Square, Loader2 } from 'lucide-react';

interface ActiveJobsWidgetProps {
  jobs: ScrapingJob[];
  onStop?: (jobId: string) => void;
  onView?: (jobId: string) => void;
}

export const ActiveJobsWidget: React.FC<ActiveJobsWidgetProps> = ({
  jobs,
  onStop,
  onView,
}) => {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Play className="w-4 h-4 text-success" />
          Active Jobs
          <Badge variant="info" size="sm" className="ml-2">
            {jobs.length}
          </Badge>
        </h3>
        {jobs.length > 0 && (
          <Button variant="text" size="sm" onClick={() => {}} className="text-blue-600 hover:text-blue-800">
            View All
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-[300px] p-4 space-y-4">
        {jobs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 py-10">
            <div className="p-4 bg-gray-100 rounded-full mb-3">
              <Loader2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm">No active scraping jobs</p>
            <p className="text-xs mt-1">Start a new job to see progress here</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 border border-gray-100 rounded-xl bg-white hover:border-blue-100 hover:shadow-sm transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    job.platform === 'tiktok' ? 'bg-pink-50 text-pink-600' :
                    job.platform === 'shopee' ? 'bg-orange-50 text-orange-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {job.platform === 'tiktok' ? '🎵' : job.platform === 'shopee' ? '🛒' : '📦'}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                      {(job.platform || 'unknown').toUpperCase()} - {job.type || 'Job'}
                    </h4>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                      ID: {job.id || '---'}
                    </p>
                  </div>
                </div>
                <Badge variant="success" size="sm" className="animate-pulse">
                  Running
                </Badge>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    {job.itemsScraped} items found
                  </span>
                </div>
                {/* For demonstration, we use itemsScraped as progress if no progress given */}
                <ProgressBar
                  value={Math.min(100, (job.itemsScraped / 100) * 100)}
                  color={job.platform === 'tiktok' ? 'tiktok' : job.platform === 'shopee' ? 'shopee' : 'lazada'}
                  size="sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs py-1.5 h-auto text-gray-600 border-gray-200"
                  onClick={() => onView?.(job.id)}
                >
                  Details
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 text-xs py-1.5 h-auto"
                  onClick={() => onStop?.(job.id)}
                  icon={<Square className="w-3 h-3" />}
                >
                  Stop
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
