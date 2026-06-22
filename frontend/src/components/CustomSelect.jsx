import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ 
  options = [], 
  value, 
  onChange, 
  multiple = false, 
  placeholder = 'Select...',
  className = '',
  selectClassName = '',
  openUpwards = false
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
      const labels = currentValues.map(v => options.find(o => o.value === v)?.label).filter(Boolean);
      return labels.length > 0 ? labels.join(', ') : placeholder;
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
        <div className={`absolute z-[99] w-full ${openUpwards ? 'bottom-full mb-2' : 'mt-2'} bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto custom-scrollbar overflow-x-hidden`}>
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
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 flex items-center ${multiple ? 'justify-start gap-3' : 'justify-between'} ${isSelected ? 'text-[#003F87] bg-blue-50/50' : 'text-slate-700'}`}
                >
                  {multiple ? (
                    <>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#003F87] border-[#003F87]' : 'border-slate-300'}`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <span className="truncate">{option.label}</span>
                    </>
                  ) : (
                    <>
                      <span className="truncate flex-1">{option.label}</span>
                      {isSelected && <Check size={16} className="shrink-0 text-[#003F87]" />}
                    </>
                  )}
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
