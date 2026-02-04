
import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = "", iconOnly = false, size = 'md' }) => {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl' }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Abstract Prism Icon */}
      <div className={`${currentSize.icon} relative flex-shrink-0`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl rotate-12 group-hover:rotate-0 transition-transform duration-300"></div>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            className="w-1/2 h-1/2 text-white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      {!iconOnly && (
        <div className={`flex items-baseline font-bold tracking-tight text-gray-900 ${currentSize.text}`}>
          <span>NicheFinder</span>
          <span className="text-blue-600 font-medium ml-0.5">Engine</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
