interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'tiktok' | 'shopee' | 'lazada';
  className?: string;
}

export const ProgressBar = ({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  color = 'primary',
  className = '',
}: ProgressBarProps) => {
  // Sanitize input values to prevent NaN issues
  const safeValue = isNaN(Number(value)) ? 0 : Number(value);
  const safeMax = isNaN(Number(max)) || Number(max) === 0 ? 100 : Number(max);
  
  const percentage = Math.min(Math.max((safeValue / safeMax) * 100, 0), 100);

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorStyles = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    tiktok: 'bg-pink-600',
    shopee: 'bg-orange-600',
    lazada: 'bg-indigo-600',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeStyles[size]}`} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`${sizeStyles[size]} ${colorStyles[color]} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
