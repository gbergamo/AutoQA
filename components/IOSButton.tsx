import React from 'react';

interface IOSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

const IOSButton: React.FC<IOSButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden font-bold rounded-2xl px-6 py-4 transition-all active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed ripple-hover";
  
  const variants = {
    primary: "bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-lg shadow-teal-500/20",
    secondary: "bg-white/5 border border-white/10 text-teal-50 hover:bg-white/10 backdrop-blur-md",
    ghost: "bg-transparent text-teal-400 hover:bg-teal-400/10"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </button>
  );
};

export default IOSButton;