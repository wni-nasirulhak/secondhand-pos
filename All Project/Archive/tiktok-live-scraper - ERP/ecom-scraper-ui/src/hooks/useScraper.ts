import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import scraperService from '../services/scraperService';
import type { JobConfig } from '../types/scraper';
import { toast } from 'react-hot-toast';

export const useScraperStatus = () => {
  return useQuery({
    queryKey: ['scraper', 'status'],
    queryFn: () => scraperService.getJobsStatus(),
    refetchInterval: 5000, // Poll every 5 seconds
  });
};

export const useJobStatus = (jobId: string | null) => {
  return useQuery({
    queryKey: ['scraper', 'job', jobId],
    queryFn: () => (jobId ? scraperService.getJobStatus(jobId) : null),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.job?.status;
      return status === 'running' || status === 'queued' ? 2000 : false;
    },
  });
};

export const useStartScraper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: JobConfig) => scraperService.startJob(config),
    onSuccess: (data: any) => {
      toast.success(data.message || 'Scraping job started');
      queryClient.invalidateQueries({ queryKey: ['scraper', 'status'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start scraping job');
    },
  });
};

export const useStopScraper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => scraperService.stopJob(jobId),
    onSuccess: (data: any) => {
      toast.success(data.message || 'Job stopped');
      queryClient.invalidateQueries({ queryKey: ['scraper'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to stop job');
    },
  });
};

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => scraperService.getHealth(),
    refetchInterval: 30000, // Every 30 seconds
  });
};
