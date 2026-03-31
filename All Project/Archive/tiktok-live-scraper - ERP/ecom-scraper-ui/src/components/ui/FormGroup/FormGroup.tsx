import type { ReactNode } from 'react';

interface FormGroupProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
}

export const FormGroup = ({
  label,
  required,
  error,
  helperText,
  children,
  className = '',
}: FormGroupProps) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};
