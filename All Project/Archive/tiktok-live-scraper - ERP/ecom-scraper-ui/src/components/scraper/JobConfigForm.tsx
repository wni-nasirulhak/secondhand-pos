import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Settings, AlertCircle, Link, Search, Sliders, ArrowRight, Database } from 'lucide-react';

interface JobConfigFormProps {
  platform: 'tiktok' | 'shopee' | 'lazada';
  type: 'product' | 'shop' | 'search' | 'live';
  onSubmit: (config: any) => void;
  onBack: () => void;
  loading?: boolean;
}

export const JobConfigForm: React.FC<JobConfigFormProps> = ({
  platform,
  type,
  onSubmit,
  onBack,
  loading = false,
}) => {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [maxItems, setMaxItems] = useState('50');
  const [delay, setDelay] = useState('2000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      platform,
      type,
      url: type === 'product' || type === 'shop' || type === 'live' ? url : undefined,
      query: type === 'search' ? query : undefined,
      options: {
        maxItems: parseInt(maxItems),
        delay: parseInt(delay),
      },
    });
  };

  const isUrlType = type === 'product' || type === 'shop' || type === 'live';
  const isSearchType = type === 'search';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Badge variant={platform as any} size="lg" rounded>
            {platform.toUpperCase()}
          </Badge>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="text-gray-600 font-medium">
            {type.charAt(0).toUpperCase() + type.slice(1)} Scraper
          </span>
        </div>

        <div className="space-y-4">
          {isUrlType && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Link className="w-4 h-4" />
                Target URL
              </label>
              <Input
                placeholder={`Enter ${platform} ${type} URL...`}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="bg-gray-50/50"
              />
              <p className="text-xs text-gray-400">
                Example: {platform === 'tiktok' ? 'https://shop.tiktok.com/view/product/...' : 'https://shopee.co.th/product/...'}
              </p>
            </div>
          )}

          {isSearchType && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Keyword
              </label>
              <Input
                placeholder="Enter search keywords or product name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
                className="bg-gray-50/50"
              />
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Advanced Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Maximum Items to Scrape
            </label>
            <Input
              type="number"
              value={maxItems}
              onChange={(e) => setMaxItems(e.target.value)}
              className="bg-gray-50/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Request Delay (ms)
            </label>
            <Input
              type="number"
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              step="500"
              className="bg-gray-50/50"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Scraper performance notice</p>
            <p className="leading-relaxed opacity-80">
              Higher item counts and shorter delays may increase the chance of rate limiting. 
              We recommend using the default values for better stability.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={onBack}
        >
          Go Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="flex-1"
          loading={loading}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Start Scraping Job
        </Button>
      </div>
    </form>
  );
};
