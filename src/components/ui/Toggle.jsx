import React from 'react';

const Toggle = ({ enabled, onChange, size = 'md', label = '', disabled = false }) => {
  const sizes = {
    sm: 'h-4 w-8',
    md: 'h-6 w-11',
    lg: 'h-8 w-14'
  };

  const toggleSizes = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-7 w-7'
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        className={`
          ${sizes[size]}
          ${enabled ? 'bg-primary-600' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          relative inline-flex flex-shrink-0 rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none
        `}
      >
        <span
          className={`
            ${enabled ? 'translate-x-full' : 'translate-x-0'}
            ${toggleSizes[size]}
            pointer-events-none inline-block transform rounded-full bg-white shadow 
            transition duration-200 ease-in-out
          `}
        />
      </button>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-900">{label}</span>
      )}
    </div>
  );
};

export default Toggle;