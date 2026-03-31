interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
}: SkeletonProps) => {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const defaultHeights = {
    text: '1rem',
    circular: '3rem',
    rectangular: '8rem',
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : variant === 'circular' ? defaultHeights[variant] : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : defaultHeights[variant],
  };

  return (
    <div
      className={`bg-gray-200 ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={style}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
