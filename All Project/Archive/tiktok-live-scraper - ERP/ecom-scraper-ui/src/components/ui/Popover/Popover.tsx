import { type ReactNode, useState, useRef, useEffect } from 'react';

interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

export const Popover = ({ trigger, content, position = 'bottom', className = '', onOpenChange }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const togglePopover = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onOpenChange]);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={togglePopover} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          className={`absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px] ${positionStyles[position]} ${className}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
