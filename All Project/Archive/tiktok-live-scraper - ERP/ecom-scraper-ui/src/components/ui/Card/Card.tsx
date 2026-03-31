import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
}

export const Card = ({ children, className = '', header, footer, onClick }: CardProps) => {
  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {header && (
        <div className="px-4 py-3 border-b border-gray-200 font-semibold">
          {header}
        </div>
      )}
      <div className={className.includes('p-') ? '' : 'p-4'}>
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};
