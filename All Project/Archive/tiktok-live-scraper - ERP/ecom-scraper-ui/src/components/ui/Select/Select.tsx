import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options = [], className = '', children, ...props }, ref) => {
    const baseStyles = 'w-full px-3 py-2 text-sm rounded-md border bg-white transition-all focus:outline-none focus:ring-2 appearance-none bg-no-repeat bg-right';
    const stateStyles = error
      ? 'border-error focus:ring-error focus:border-error'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    
    // Add dropdown arrow background
    const arrowStyle = {
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundSize: '1.5em 1.5em',
      paddingRight: '2.5rem',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`${baseStyles} ${stateStyles} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
          style={arrowStyle}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        >
          {children ||
            options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
        </select>
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

Select.displayName = 'Select';
