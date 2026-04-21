'use client';

import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomPhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  className = ""
}) => {
  return (
    <div className={`phone-input-container ${className}`}>
      <PhoneInput
        country={'in'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        inputStyle={{
          width: '100%',
          height: '42px',
          fontSize: '16px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          paddingLeft: '48px',
          backgroundColor: '#ffffff',
          color: '#111827'
        }}
        buttonStyle={{
          border: '1px solid #d1d5db',
          borderRadius: '6px 0 0 6px 0',
          backgroundColor: '#f9fafb',
          height: '42px'
        }}
        dropdownStyle={{
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          backgroundColor: '#ffffff'
        }}
        searchStyle={{
          width: '100%',
          marginBottom: '8px'
        }}
      />
    </div>
  );
};
