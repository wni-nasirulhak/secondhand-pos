import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import type { Webhook } from '../../services/webhookService';
import { Activity, Link as LinkIcon, Settings, Trash2, Send } from 'lucide-react';

interface WebhookCardProps {
  webhook: Webhook;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (webhook: Webhook) => void;
}

export const WebhookCard: React.FC<WebhookCardProps> = ({
  webhook,
  onDelete,
  onTest,
  onToggle,
  onEdit,
}) => {
  return (
    <Card className="hover:border-blue-200 transition-all group p-0">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              webhook.type === 'discord' ? 'bg-indigo-50 text-indigo-600' :
              webhook.type === 'slack' ? 'bg-emerald-50 text-emerald-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 line-clamp-1">{webhook.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={webhook.platform as any} size="sm">
                  {webhook.platform?.toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-400 capitalize">{webhook.type}</span>
              </div>
            </div>
          </div>
          <Switch
            checked={webhook.active}
            onChange={(e) => onToggle(webhook.id, e.target.checked)}
          />
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 italic truncate">
            <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{webhook.url}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {webhook.events.map(event => (
              <span key={event} className="text-[10px] bg-white border border-gray-200 text-gray-400 px-2 py-0.5 rounded capitalize">
                {event.replace(':', ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Status</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${webhook.lastStatus === 200 ? 'bg-success' : 'bg-gray-300'}`} />
                <span className="text-xs font-bold text-gray-700">{webhook.lastStatus || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(webhook)}
              icon={<Settings className="w-4 h-4" />}
            >
              {''}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onTest(webhook.id)}
              className="text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100"
              icon={<Send className="w-4 h-4" />}
            >
              Test
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(webhook.id)}
              className="text-danger hover:bg-red-50"
              icon={<Trash2 className="w-4 h-4" />}
            >
              {''}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
