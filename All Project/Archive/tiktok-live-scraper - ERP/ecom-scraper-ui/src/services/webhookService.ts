import { api } from './api';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  platform: 'tiktok' | 'shopee' | 'lazada' | 'all';
  events: string[];
  active: boolean;
  type: 'discord' | 'slack' | 'custom';
  createdAt: string;
  lastUsedAt?: string;
  lastStatus?: number;
}

export const webhookService = {
  // Fetch all webhooks
  getWebhooks: async () => {
    const response = await api.get('/webhooks');
    return response.data;
  },

  // Save a webhook (create or update)
  saveWebhook: async (webhook: Partial<Webhook>) => {
    if (webhook.id) {
      const response = await api.put(`/webhooks/${webhook.id}`, webhook);
      return response.data;
    } else {
      const response = await api.post('/webhooks', webhook);
      return response.data;
    }
  },

  // Delete a webhook
  deleteWebhook: async (id: string) => {
    const response = await api.delete(`/webhooks/${id}`);
    return response.data;
  },

  // Test a webhook
  testWebhook: async (id: string) => {
    const response = await api.post(`/webhooks/${id}/test`);
    return response.data;
  },

  // Toggle active status
  toggleWebhook: async (id: string, active: boolean) => {
    const response = await api.patch(`/webhooks/${id}`, { active });
    return response.data;
  }
};
