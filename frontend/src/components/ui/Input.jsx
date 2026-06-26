import React from 'react';

export default function Input({
  label,
  icon,
  error,
  className = '',
  wrapperClassName = '',
  ...props
}) {
  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-[#003F87] focus:ring-4 focus:ring-blue-500/10 text-sm font-bold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400 disabled:opacity-60 ${
            icon ? 'pl-11 pr-4' : 'px-4'
          } ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 ml-1 text-xs font-bold text-rose-500">{error}</p>
      )}
    </div>
  );
}
