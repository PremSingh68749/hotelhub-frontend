'use client';

import React, { useState } from 'react';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  minLength?: number;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = "Enter password",
  required = false,
  disabled = false,
  className = "",
  autoComplete,
  ariaLabel,
  ariaDescribedBy,
  minLength
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    console.log('Eye button clicked, current state:', showPassword);
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        minLength={minLength}
        className={`block w-full pr-10 ${className}`}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        disabled={disabled}
        className="absolute inset-y-0 right-0 pr-3 pl-3 flex items-center transition-all duration-200 z-20 hover:bg-gray-50 focus:outline-none focus:ring-0"
        aria-label={showPassword ? "Hide password" : "Show password"}
        style={{ 
          pointerEvents: 'auto',
          background: 'transparent'
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          console.log('Mouse down on eye button');
        }}
      >
        {showPassword ? (
          // Eye closed icon (hide password)
          <svg
            className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-all duration-200"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        ) : (
          // Eye open icon (show password)
          <svg
            className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-all duration-200"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};
