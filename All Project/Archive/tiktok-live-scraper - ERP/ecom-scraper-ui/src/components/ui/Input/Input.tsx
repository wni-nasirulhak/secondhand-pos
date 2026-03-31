import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled';
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, variant = 'default', icon, className = '', ...props }, ref) => {
    const baseStyles = 'w-full px-3 py-2 text-sm rounded-md transition-all focus:outline-none focus:ring-2';
    const variantStyles = {
      default: 'border bg-white',
      filled: 'border-0 bg-gray-100',
    };
    const stateStyles = error
      ? 'border-error focus:ring-error focus:border-error'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              ${baseStyles} 
              ${variantStyles[variant]} 
              ${stateStyles} 
              ${icon ? 'pl-10' : ''} 
              ${className} 
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-error">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
