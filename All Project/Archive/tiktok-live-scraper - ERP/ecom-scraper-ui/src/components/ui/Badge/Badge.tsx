import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'tiktok' | 'shopee' | 'lazada';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}

export const Badge = ({ children, variant = 'default', size = 'md', rounded = false, className = '' }: BadgeProps) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    tiktok: 'bg-pink-100 text-pink-800',
    shopee: 'bg-orange-100 text-orange-800',
    lazada: 'bg-indigo-100 text-indigo-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const roundedStyle = rounded ? 'rounded-full' : 'rounded';

  return (
    <span
      className={`inline-flex items-center font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${roundedStyle} ${className}`}
    >
      {children}
    </span>
  );
};
