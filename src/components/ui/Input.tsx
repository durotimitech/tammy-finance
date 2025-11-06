import React, { forwardRef, InputHTMLAttributes } from "react";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className = "", style, ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:outline-none text-black autofill:!text-black ${className}`}
    style={style}
    {...props}
  />
));

Input.displayName = "Input";

export { Input };
