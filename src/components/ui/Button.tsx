import React, { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ 
    className = "", 
    variant = "default", 
    size = "default",
    ...props 
}, ref) => {
    const baseStyles = "font-semibold transition-colors focus:ring-2 focus:outline-none disabled:opacity-60 hover:cursor-pointer";
    
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    };
    
    const sizes = {
        default: "px-5 py-2",
        sm: "px-3 py-1 text-sm",
        lg: "px-6 py-3 text-lg"
    };
    
    return (
        <button
            ref={ref}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} rounded-lg ${className}`}
            {...props}
        />
    );
});

Button.displayName = "Button";

export { Button }; 