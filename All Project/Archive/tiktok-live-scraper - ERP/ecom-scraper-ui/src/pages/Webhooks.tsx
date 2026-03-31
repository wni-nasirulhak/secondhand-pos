import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webhookService } from '../services/webhookService';
import type { Webhook } from '../services/webhookService';
import { WebhookCard } from '../components/webhooks/WebhookCard';
import { WebhookForm } from '../components/webhooks/WebhookForm';
import { Button } from '../components/ui/Button';
import { PlusCircle, Activity, Globe, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Webhooks = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);

  // Data fetching
  const { data, isLoading, refetch, isError } = useQuery({
    queryKey: ['webhooks'],
    queryFn: webhookService.getWebhooks,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (webhook: any) => webhookService.saveWebhook(webhook),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setIsFormOpen(false);
      setEditingWebhook(null);
      toast.success(editingWebhook ? 'Webhook updated' : 'Webhook created');
    },
    onError: () => {
      toast.error('Failed to save webhook');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => webhookService.deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook deleted');
    },
    onError: () => {
      toast.error('Failed to delete webhook');
    }
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => 
      webhookService.toggleWebhook(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Status updated');
    },
  });

  // Test mutation
  const testMutation = useMutation({
    mutationFn: (id: string) => webhookService.testWebhook(id),
    onSuccess: () => {
      toast.success('Test payload sent successfully!');
    },
    onError: () => {
      toast.error('Webhook test failed');
    }
  });

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingWebhook(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this integration?')) {
      deleteMutation.mutate(id);
    }
  };

  const webhooks = data || [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Globe className="w-8 h-8 text-indigo-600" />
            Integrations & Webhooks
          </h1>
          <p className="text-gray-600">
            Automate notifications and data sync to external services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => refetch()}
            loading={isLoading}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Add New Integration
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="p-12 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col items-center text-center">
          <div className="p-4 bg-indigo-100 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-indigo-900 mb-2">Error Loading Webhooks</h3>
          <p className="text-indigo-700 mb-6">Something went wrong while fetching your integrations.</p>
          <Button variant="danger" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : webhooks.length === 0 && !isLoading ? (
        <div className="p-12 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
          <div className="p-4 bg-white shadow-sm rounded-full mb-4">
            <Activity className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No active integrations</h3>
          <p className="text-gray-500 mb-6">Set up webhooks to receive data directly in Discord or Slack.</p>
          <Button variant="primary" onClick={handleAdd} icon={<PlusCircle className="w-4 h-4" />}>
            Create your first webhook
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {webhooks.map((webhook: Webhook) => (
            <WebhookCard
              key={webhook.id}
              webhook={webhook}
              onDelete={handleDelete}
              onTest={(id) => testMutation.mutate(id)}
              onToggle={(id, active) => toggleMutation.mutate({ id, active })}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm">
          <RefreshCw className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 mb-1">Webhook Usage Notes</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            Integrations allow you to receive real-time data from the scraper hub. 
            Discord and Slack webhooks are pre-formatted for optimal display. 
            Custom webhooks will receive a JSON payload with standard event types.
          </p>
        </div>
      </div>

      <WebhookForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        webhook={editingWebhook}
        loading={saveMutation.isPending}
        onSubmit={(data) => saveMutation.mutate(data)}
      />
    </div>
  );
};
