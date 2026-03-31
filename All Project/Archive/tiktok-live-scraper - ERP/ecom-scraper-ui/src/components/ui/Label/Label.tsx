import type { LabelHTMLAttributes, ReactNode } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: ReactNode;
}

export const Label = ({ required, children, className = '', ...props }: LabelProps) => {
  return (
    <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
      {children}
      {required && <span className="text-error ml-1">*</span>}
    </label>
  );
};
