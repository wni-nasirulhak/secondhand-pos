import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface Platform {
  id: 'tiktok' | 'shopee' | 'lazada';
  name: string;
  icon: string;
  color: string;
  active: boolean;
}

interface PlatformSelectorProps {
  selectedPlatform: string | null;
  onSelect: (platformId: 'tiktok' | 'shopee' | 'lazada') => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  onSelect,
}) => {
  const platforms: Platform[] = [
    { id: 'tiktok', name: 'TikTok Shop', icon: '🎵', color: 'tiktok', active: true },
    { id: 'shopee', name: 'Shopee', icon: '🛒', color: 'shopee', active: false },
    { id: 'lazada', name: 'Lazada', icon: '📦', color: 'lazada', active: false },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {platforms.map((platform) => (
        <Card
          key={platform.id}
          className={`p-6 cursor-pointer border-2 transition-all relative overflow-hidden group ${
            selectedPlatform === platform.id
              ? 'border-blue-500 bg-blue-50/30'
              : 'border-transparent hover:border-gray-200'
          } ${!platform.active ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
          onClick={() => platform.active && onSelect(platform.id)}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
              {platform.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{platform.name}</h3>
            {platform.active ? (
              <Badge variant="success" size="sm">Available</Badge>
            ) : (
              <Badge variant="default" size="sm">Coming Soon</Badge>
            )}
          </div>
          {/* Active indicator */}
          {selectedPlatform === platform.id && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
