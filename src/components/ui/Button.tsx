import React, { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'font-semibold transition-colors focus:ring-2 focus:outline-none disabled:opacity-60 hover:cursor-pointer';

    const variants = {
      default:
        'bg-black text-white border border-black hover:bg-white hover:text-black focus:ring-gray-500',
      secondary:
        'bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black focus:ring-gray-500',
    };

    const sizes = {
      default: 'px-5 py-2',
      sm: 'px-3 py-1 text-sm',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} rounded-lg ${className}`}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };
