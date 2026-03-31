import type { ReactNode } from 'react';

interface ChipProps {
  label: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'tiktok' | 'shopee' | 'lazada';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export const Chip = ({
  label,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  onClick,
  className = '',
}: ChipProps) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    error: 'bg-red-100 text-red-800 hover:bg-red-200',
    info: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    tiktok: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
    shopee: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    lazada: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 font-medium rounded-full transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span>{label}</span>
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 p-0.5 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};
