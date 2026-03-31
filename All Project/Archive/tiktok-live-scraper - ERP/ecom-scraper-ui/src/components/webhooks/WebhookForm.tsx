import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import type { Webhook } from '../../services/webhookService';
import { Globe, Save } from 'lucide-react';

interface WebhookFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (webhook: any) => void;
  webhook: Webhook | null;
  loading?: boolean;
}

export const WebhookForm: React.FC<WebhookFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  webhook,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Webhook>>({
    name: '',
    url: '',
    platform: 'tiktok',
    type: 'discord',
    events: ['scraper:start', 'scraper:complete', 'scraper:error'],
    active: true,
  });

  useEffect(() => {
    if (webhook) {
      setFormData(webhook);
    } else {
      setFormData({
        name: '',
        url: '',
        platform: 'all',
        type: 'discord',
        events: ['scraper:start', 'scraper:complete', 'scraper:error'],
        active: true,
      });
    }
  }, [webhook, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const availableEvents = [
    { id: 'scraper:start', label: 'Scraper Started' },
    { id: 'scraper:complete', label: 'Scraper Completed' },
    { id: 'scraper:error', label: 'Scraper Error' },
    { id: 'product:scraped', label: 'Product Scraped' },
    { id: 'system:alert', label: 'System Alert' },
  ];

  const handleEventToggle = (eventId: string) => {
    const currentEvents = formData.events || [];
    if (currentEvents.includes(eventId)) {
      setFormData({ ...formData, events: currentEvents.filter(e => e !== eventId) });
    } else {
      setFormData({ ...formData, events: [...currentEvents, eventId] });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={webhook ? 'Edit Webhook' : 'Add New Webhook'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Integration Name"
            placeholder="e.g. My Discord Scraper Channel"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            helperText="Give this integration a descriptive name"
          />

          <Input
            label="Webhook URL"
            placeholder="https://discord.com/api/webhooks/..."
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            required
            icon={<Globe className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Integration Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              options={[
                { value: 'discord', label: 'Discord' },
                { value: 'slack', label: 'Slack' },
                { value: 'custom', label: 'Custom Webhook' },
              ]}
            />
            <Select
              label="Target Platform"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
              options={[
                { value: 'all', label: 'All Platforms' },
                { value: 'tiktok', label: 'TikTok Shop' },
                { value: 'shopee', label: 'Shopee' },
                { value: 'lazada', label: 'Lazada' },
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Trigger Events</label>
            <div className="grid grid-cols-1 gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
              {availableEvents.map((event) => (
                <Checkbox
                  key={event.id}
                  id={event.id}
                  label={event.label}
                  checked={formData.events?.includes(event.id)}
                  onChange={() => handleEventToggle(event.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1"
            icon={<Save className="w-4 h-4" />}
          >
            {webhook ? 'Update Webhook' : 'Create Webhook'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
