import React from 'react';
import { IOSCardProps } from '../types';

const IOSCard: React.FC<IOSCardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`glass-card rounded-[32px] p-6 transition-all duration-500 hover:border-teal-500/30 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          {title && (
            <h3 className="text-lg font-bold text-teal-50 tracking-tight flex items-center gap-2">
              <span className="w-1 h-6 bg-teal-400 rounded-full"></span>
              {title}
            </h3>
          )}
          {action && (
            <div>{action}</div>
          )}
        </div>
      )}
      <div className="text-slate-300">
        {children}
      </div>
    </div>
  );
};

export default IOSCard;