import React, { forwardRef, ButtonHTMLAttributes } from "react";
import { LoadingIcon } from "./LoadingIcon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary";
  size?: "default" | "sm" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      loading = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "font-semibold transition-colors focus:ring-2 focus:outline-none disabled:opacity-60 hover:cursor-pointer inline-flex items-center justify-center gap-2";

    const variants = {
      default:
        "bg-secondary text-white hover:bg-white hover:border hover:text-black focus:ring-gray-500 focus:border-gray-500 focus:border-2",
      secondary:
        "bg-white text-black border hover:bg-gray-100 hover:text-black focus:ring-gray-500 focus:border-gray-500 focus:border-2",
    };

    const sizes = {
      default: "px-5 py-2",
      sm: "px-3 py-1 text-sm",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} rounded-lg ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <LoadingIcon className="w-8 h-8" /> : children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
