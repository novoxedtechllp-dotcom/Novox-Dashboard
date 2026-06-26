import React from 'react';

const variants = {
  primary: 'bg-[#003F87] text-white hover:bg-[#002B5E] shadow-md shadow-blue-900/10',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-900/10',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100'
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  icon,
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed';
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
