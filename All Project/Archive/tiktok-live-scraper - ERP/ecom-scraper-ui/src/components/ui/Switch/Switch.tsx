import { type InputHTMLAttributes, forwardRef } from 'react';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, helperText, error, className = '', checked, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only peer"
            checked={checked}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
        </label>
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

Switch.displayName = 'Switch';
