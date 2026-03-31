import { api } from './api';

export interface ScrapedData {
  id: string;
  sourceId: string;
  platform: 'tiktok' | 'shopee' | 'lazada';
  type: string;
  data: any;
  createdAt: string;
}

export interface DataFilter {
  platform?: string;
  type?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const dataService = {
  // Fetch all scraped data
  getResults: async (filters: DataFilter = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    
    // Using the combined results endpoint if available, or individual routes
    // For now, mapping to /api/data/results (placeholder in backend based on brief)
    const response = await api.get(`/data/results?${params.toString()}`);
    return response.data;
  },

  // Get specific result detail
  getResultById: async (id: string) => {
    const response = await api.get(`/data/results/${id}`);
    return response.data;
  },

  // Export results
  exportResults: async (format: 'csv' | 'json', filters: DataFilter = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    
    // Request as a blob for download
    const response = await api.get(`/data/export/${format}?${params.toString()}`, {
      responseType: 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `scraper_export_${new Date().toISOString()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Delete result
  deleteResult: async (id: string) => {
    const response = await api.delete(`/data/results/${id}`);
    return response.data;
  }
};
