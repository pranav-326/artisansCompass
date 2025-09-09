import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  icon: JSX.Element;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white text-black flex items-center justify-between text-left"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center">
          <span className="mr-3">{selectedOption.icon}</span>
          {selectedOption.label}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className={`h-5 w-5 text-stone-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <path stroke="#68707d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4"/>
        </svg>
      </button>

      {isOpen && (
        <ul
          className="absolute z-10 w-full mt-1 bg-white border border-stone-300 rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="flex items-center p-3 cursor-pointer hover:bg-amber-50"
              role="option"
              aria-selected={value === option.value}
            >
              <span className="mr-3">{option.icon}</span>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
