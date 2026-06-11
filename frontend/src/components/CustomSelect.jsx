import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ 
  options = [], 
  value, 
  onChange, 
  multiple = false, 
  placeholder = 'Select...',
  className = '',
  selectClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter(v => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const displayValue = () => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.length === 0) return placeholder;
      if (currentValues.length === 1) {
        return options.find(o => o.value === currentValues[0])?.label || placeholder;
      }
      return `${currentValues.length} selected`;
    }
    const selectedOption = options.find(o => o.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between outline-none transition-all ${selectClassName}`}
      >
        <span className="truncate">{displayValue()}</span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} text-slate-400`} />
      </button>

      {isOpen && (
        <div className="absolute z-[99] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto custom-scrollbar overflow-x-hidden">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = multiple 
                ? (Array.isArray(value) && value.includes(option.value))
                : value === option.value;
                
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 flex items-center justify-between ${isSelected ? 'text-[#003F87] bg-blue-50/50' : 'text-slate-700'}`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={16} className="shrink-0 text-[#003F87]" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
