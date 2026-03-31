export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'stopped';

export interface ScrapingJob {
  id: string;
  platform: 'tiktok' | 'shopee' | 'lazada';
  type: 'product' | 'shop' | 'search' | 'review' | 'live';
  status: JobStatus;
  itemsScraped: number;
  createdAt: string;
  updatedAt?: string;
  error?: string;
  targetUrl?: string;
  searchQuery?: string;
  options?: Record<string, any>;
}

export interface JobConfig {
  platform: 'tiktok' | 'shopee' | 'lazada';
  type: ScrapingJob['type'];
  url?: string;
  query?: string;
  options?: Record<string, any>;
}

export interface ScraperStatusResponse {
  success: boolean;
  total: number;
  running: number;
  jobs: ScrapingJob[];
}

export interface PlatformStat {
  platform: string;
  totalJobs: number;
  activeJobs: number;
  itemsScraped: number;
  trend: number; // percentage change
}

export interface DashboardStats {
  platforms: PlatformStat[];
  totalItems: number;
  recentJobs: ScrapingJob[];
  systemHealth: {
    cpu: number;
    memory: number;
    status: 'healthy' | 'degraded' | 'down';
  };
}
