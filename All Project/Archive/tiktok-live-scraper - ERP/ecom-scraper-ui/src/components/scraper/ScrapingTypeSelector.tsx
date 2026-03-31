import React from 'react';
import { Card } from '../ui/Card';
import { ShoppingCart, ShoppingBag, Search, Radio } from 'lucide-react';

export type ScraperType = 'product' | 'shop' | 'search' | 'live';

interface ScrapingTypeSelectorProps {
  platform: 'tiktok' | 'shopee' | 'lazada';
  selectedType: ScraperType | null;
  onSelect: (type: ScraperType) => void;
}

export const ScrapingTypeSelector: React.FC<ScrapingTypeSelectorProps> = ({
  platform,
  selectedType,
  onSelect,
}) => {
  const types = [
    {
      id: 'product' as ScraperType,
      title: 'Individual Product',
      description: 'Scrape detailed info from a specific product URL',
      icon: <ShoppingCart className="w-6 h-6" />,
      platforms: ['tiktok', 'shopee', 'lazada'],
    },
    {
      id: 'shop' as ScraperType,
      title: 'Whole Shop',
      description: 'Scrape all products from a merchant/shop',
      icon: <ShoppingBag className="w-6 h-6" />,
      platforms: ['tiktok', 'shopee', 'lazada'],
    },
    {
      id: 'search' as ScraperType,
      title: 'Search/Keywords',
      description: 'Scrape products matching a specific keyword',
      icon: <Search className="w-6 h-6" />,
      platforms: ['tiktok', 'shopee', 'lazada'],
    },
    {
      id: 'live' as ScraperType,
      title: 'Live Stream Scraper',
      description: 'Collect live chat and comments from TikTok Live',
      icon: <Radio className="w-6 h-6" />,
      platforms: ['tiktok'],
    },
  ];

  const filteredTypes = types.filter((t) => t.platforms.includes(platform));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredTypes.map((type) => (
        <Card
          key={type.id}
          className={`p-6 cursor-pointer border-2 transition-all group flex items-start gap-4 ${
            selectedType === type.id
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-transparent hover:border-gray-200'
          }`}
          onClick={() => onSelect(type.id)}
        >
          <div className={`p-4 rounded-xl ${
            selectedType === type.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
          } transition-colors`}>
            {type.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{type.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{type.description}</p>
          </div>
          {/* Radio indicator */}
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            selectedType === type.id ? 'border-blue-600' : 'border-gray-300'
          }`}>
            {selectedType === type.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
          </div>
        </Card>
      ))}
    </div>
  );
};
