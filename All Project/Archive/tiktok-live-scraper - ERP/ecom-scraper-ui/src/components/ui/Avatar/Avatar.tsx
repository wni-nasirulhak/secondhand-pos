interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  className?: string;
}

export const Avatar = ({ src, alt, name, size = 'md', shape = 'circle', className = '' }: AvatarProps) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const shapeStyles = {
    circle: 'rounded-full',
    square: 'rounded-md',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`inline-flex items-center justify-center ${sizeStyles[size]} ${shapeStyles[shape]} bg-blue-600 text-white font-medium overflow-hidden ${className}`}
    >
      {src ? (
        <img src={src} alt={alt || name || 'Avatar'} className="w-full h-full object-cover" />
      ) : name ? (
        getInitials(name)
      ) : (
        <svg className="w-full h-full p-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  );
};
