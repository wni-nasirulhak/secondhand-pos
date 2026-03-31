import { api } from './api';
import type { ScrapingJob, JobConfig, ScraperStatusResponse } from '../types/scraper';

export const scraperService = {
  /**
   * Fetch all scraping jobs with status
   */
  getJobs: async (filters: any = {}): Promise<ScrapingJob[]> => {
    const response = await api.get('/scraper/jobs', { params: filters });
    return response.data;
  },

  /**
   * Get overall scraper status (running counts, etc)
   */
  getJobsStatus: async (): Promise<ScraperStatusResponse> => {
    const response = await api.get('/scraper/status');
    return response.data;
  },

  /**
   * Get individual job status
   */
  getJobStatus: async (id: string): Promise<{ job: ScrapingJob }> => {
    const response = await api.get(`/scraper/jobs/${id}`);
    return response.data;
  },

  /**
   * Start a new scraping job
   */
  startJob: async (config: JobConfig): Promise<ScrapingJob & { message?: string }> => {
    const response = await api.post('/scraper/start', config);
    return response.data;
  },

  /**
   * Stop a running job
   */
  stopJob: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post(`/scraper/stop/${id}`);
    return response.data;
  },

  /**
   * Get detailed job logs
   */
  getJobLogs: async (id: string): Promise<string[]> => {
    const response = await api.get(`/scraper/jobs/${id}/logs`);
    return response.data;
  },

  /**
   * System health check
   */
  getHealth: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default scraperService;
