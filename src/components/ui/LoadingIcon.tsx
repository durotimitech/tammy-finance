import React from 'react';

interface LoadingIconProps {
  className?: string;
}

export const LoadingIcon = ({ className = '' }: LoadingIconProps) => {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-spin ${className}`}
    >
      <g transform="translate(50, 50)">
        <circle cx="50" cy="50" r="45" fill="#FF8C42" stroke="#E67E22" strokeWidth="3" />
        {/* Ears */}
        <circle cx="30" cy="25" r="15" fill="#FF8C42" stroke="#E67E22" strokeWidth="2" />
        <circle cx="70" cy="25" r="15" fill="#FF8C42" stroke="#E67E22" strokeWidth="2" />
        <circle cx="30" cy="25" r="8" fill="#FFB366" />
        <circle cx="70" cy="25" r="8" fill="#FFB366" />
        {/* Face */}
        <circle cx="40" cy="45" r="4" fill="#2C3E50" />
        <circle cx="60" cy="45" r="4" fill="#2C3E50" />
        <ellipse cx="50" cy="58" rx="5" ry="4" fill="#2C3E50" />
        <path d="M 44 62 Q 50 68 56 62" stroke="#2C3E50" strokeWidth="3" fill="none" />
        {/* Cheeks */}
        <circle cx="25" cy="55" r="6" fill="#FFB366" opacity="0.7" />
        <circle cx="75" cy="55" r="6" fill="#FFB366" opacity="0.7" />
      </g>
    </svg>
  );
};
