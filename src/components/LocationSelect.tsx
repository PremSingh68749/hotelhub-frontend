'use client';

import React from 'react';
import { Country, State, City } from 'country-state-city';

interface LocationSelectProps {
  countryValue?: string;
  stateValue?: string;
  cityValue?: string;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  disabled?: boolean;
}

// All countries from the country-state-city package
const COUNTRIES = Country.getAllCountries().map((c) => ({ code: c.isoCode, name: c.name }));

export const LocationSelect: React.FC<LocationSelectProps> = ({
  countryValue,
  stateValue,
  cityValue,
  onCountryChange,
  onStateChange,
  onCityChange,
  disabled = false
}) => {
  const states = countryValue
    ? State.getStatesOfCountry(countryValue).map((s) => ({ code: s.isoCode, name: s.name }))
    : [];
  const cities = countryValue && stateValue
    ? City.getCitiesOfState(countryValue, stateValue).map((c) => c.name)
    : [];
  const selectedCountry = COUNTRIES.find((c) => c.code === countryValue);

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
          disabled={disabled || !selectedCountry || states.length === 0}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
        >
          <option value="">Select State</option>
          {states.map((state) => (
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
          disabled={disabled || !stateValue}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
