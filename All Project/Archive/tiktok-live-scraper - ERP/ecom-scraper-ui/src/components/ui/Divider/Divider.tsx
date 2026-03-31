interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  text?: string;
  className?: string;
}

export const Divider = ({ orientation = 'horizontal', text, className = '' }: DividerProps) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={`w-px bg-gray-200 mx-4 ${className}`}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (text) {
    return (
      <div className={`flex items-center w-full ${className}`} role="separator" aria-orientation="horizontal">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-4 text-sm text-gray-500">{text}</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>
    );
  }

  return <div className={`w-full border-t border-gray-200 ${className}`} role="separator" aria-orientation="horizontal" />;
};
