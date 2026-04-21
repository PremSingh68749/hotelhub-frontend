'use client';

import React, { useState } from 'react';

interface LocationSelectProps {
  countryValue?: string;
  stateValue?: string;
  cityValue?: string;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  disabled?: boolean;
}

// Common countries with their states and cities
const COUNTRIES = [
  {
    code: 'IN',
    name: 'India',
    states: [
      { code: 'MH', name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur'] },
      { code: 'KA', name: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Hubli'] },
      { code: 'DL', name: 'Delhi', cities: ['New Delhi', 'Noida', 'Gurgaon'] },
      { code: 'GJ', name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara'] },
      { code: 'RJ', name: 'Rajasthan', cities: ['Jaipur', 'Udaipur', 'Jodhpur'] }
    ]
  },
  {
    code: 'US',
    name: 'United States',
    states: [
      { code: 'CA', name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego'] },
      { code: 'NY', name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester'] },
      { code: 'TX', name: 'Texas', cities: ['Houston', 'Dallas', 'Austin'] },
      { code: 'FL', name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa'] }
    ]
  },
  {
    code: 'UK',
    name: 'United Kingdom',
    states: [
      { code: 'ENG', name: 'England', cities: ['London', 'Manchester', 'Birmingham'] },
      { code: 'SCT', name: 'Scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen'] },
      { code: 'WLS', name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport'] }
    ]
  }
];

export const LocationSelect: React.FC<LocationSelectProps> = ({
  countryValue,
  stateValue,
  cityValue,
  onCountryChange,
  onStateChange,
  onCityChange,
  disabled = false
}) => {
  const selectedCountry = COUNTRIES.find(c => c.code === countryValue);
  const selectedState = selectedCountry?.states.find(s => s.code === stateValue);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Country Dropdown */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
          Country
        </label>
        <select
          id="country"
          value={countryValue || ''}
          onChange={(e) => onCountryChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
        >
          <option value="">Select Country</option>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* State Dropdown */}
      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
          State
        </label>
        <select
          id="state"
          value={stateValue || ''}
          onChange={(e) => onStateChange(e.target.value)}
          disabled={disabled || !selectedCountry}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
        >
          <option value="">Select State</option>
          {selectedCountry?.states.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      {/* City Dropdown */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
          City
        </label>
        <select
          id="city"
          value={cityValue || ''}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={disabled || !selectedState}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
        >
          <option value="">Select City</option>
          {selectedState?.cities.map((city: string) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
