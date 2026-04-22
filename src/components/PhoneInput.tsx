'use client';

import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface CustomPhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomPhoneInput: React.FC<CustomPhoneInputProps> = ({
  value,
  onChange,
  placeholder = "+91 (987) 654-3210",
  className = ""
}) => {
  return (
    <PhoneInput
      country={'in'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      inputClass={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 ${className}`}
      buttonClass="bg-white border-gray-300"
      dropdownClass="bg-white border-gray-300"
      containerClass="w-full"
      enableSearch={false}
      disableSearchIcon={true}
      countryCodeEditable={false}
      onlyCountries={['in']}
      disableDropdown={true}
      autoFormat={true}
      inputStyle={{
        height: '42px'
      }}
      buttonStyle={{
        border: '1px solid #d1d5db',
        borderRadius: '6px 0 0 6px',
        backgroundColor: '#ffffff'
      }}
    />
  );
};
