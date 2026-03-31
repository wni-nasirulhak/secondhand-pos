import { type InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, error, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          />
        </div>
        {(label || helperText || error) && (
          <div className="ml-3 text-sm">
            {label && (
              <label htmlFor={props.id} className="font-medium text-gray-700 cursor-pointer">
                {label}
                {props.required && <span className="text-error ml-1">*</span>}
              </label>
            )}
            {helperText && !error && (
              <p id={`${props.id}-helper`} className="text-gray-500">
                {helperText}
              </p>
            )}
            {error && (
              <p id={`${props.id}-error`} className="text-error">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
