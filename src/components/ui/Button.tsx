import React, { forwardRef, ButtonHTMLAttributes } from "react";

const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(({ className = "", ...props }, ref) => (
    <button
        ref={ref}
        className={`px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 ${className} hover:cursor-pointer`}
        {...props}
    />
));

Button.displayName = "Button";

export { Button }; 