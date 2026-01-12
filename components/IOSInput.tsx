import React from 'react';

interface IOSInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const IOSInput: React.FC<IOSInputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 mb-5">
      <label className="text-[11px] font-bold text-teal-400/80 uppercase tracking-widest ml-2">{label}</label>
      <input
        className={`bg-slate-900/40 backdrop-blur-xl border border-white/5 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400/50 transition-all placeholder:text-slate-600 ${className}`}
        {...props}
      />
    </div>
  );
};

export default IOSInput;