import { Loader2 } from 'lucide-react';
import React, { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      loading = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'font-semibold transition-colors focus:ring-2 focus:outline-none disabled:opacity-60 hover:cursor-pointer inline-flex items-center justify-center gap-2';

    const variants = {
      default:
        'bg-secondary text-white border border-black hover:bg-white hover:text-black focus:ring-gray-500',
      secondary:
        'bg-white text-black border border-gray-300 hover:bg-gray-100 hover:text-black focus:ring-gray-500',
    };

    const sizes = {
      default: 'px-5 py-2',
      sm: 'px-3 py-1 text-sm',
      lg: 'px-6 py-3 text-lg',
    };

    const spinnerSizes = {
      default: 'w-4 h-4',
      sm: 'w-3 h-3',
      lg: 'w-5 h-5',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} rounded-lg ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className={`animate-spin ${spinnerSizes[size]}`} />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
