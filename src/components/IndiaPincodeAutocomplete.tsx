'use client';

import React, { useState, useCallback, useEffect } from 'react';
import postalCodesIndia from 'postalcodes-india';
import { Country, State, City } from 'country-state-city';

interface IndiaPincodeInfo {
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;
}

interface IndiaPincodeAutocompleteProps {
  onPincodeChange: (info: IndiaPincodeInfo) => void;
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
  onCountryChange: (country: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const IndiaPincodeAutocomplete: React.FC<IndiaPincodeAutocompleteProps> = ({
  onPincodeChange,
  onCityChange,
  onStateChange,
  onCountryChange,
  disabled = false,
  placeholder = "Enter 6-digit PIN code",
  className = ""
}) => {
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pincodeData, setPincodeData] = useState<IndiaPincodeInfo | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handlePincodeInput = useCallback(async (code: string) => {
    setPincode(code);
    setError(null);
    
    // Only allow 6 digits
    const cleanCode = code.replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      if (cleanCode.length > 0) {
        setError('PIN code must be exactly 6 digits');
      } else {
        setError('');
      }
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the postalcodes-india package
      const data = postalCodesIndia.find(cleanCode);
      
      if (data) {
        console.log('Postal code data structure:', data);
        console.log('All data properties:', Object.keys(data));
        
        // Indian state name to code mapping
        const stateNameToCode: { [key: string]: string } = {
          'Andhra Pradesh': 'AP',
          'Arunachal Pradesh': 'AR',
          'Assam': 'AS',
          'Bihar': 'BR',
          'Chhattisgarh': 'CT',
          'Goa': 'GA',
          'Gujarat': 'GJ',
          'Haryana': 'HR',
          'Himachal Pradesh': 'HP',
          'Jharkhand': 'JH',
          'Karnataka': 'KA',
          'Kerala': 'KL',
          'Madhya Pradesh': 'MP',
          'Maharashtra': 'MH',
          'Manipur': 'MN',
          'Meghalaya': 'ML',
          'Mizoram': 'MZ',
          'Nagaland': 'NL',
          'Odisha': 'OR',
          'Punjab': 'PB',
          'Rajasthan': 'RJ',
          'Sikkim': 'SK',
          'Tamil Nadu': 'TN',
          'Telangana': 'TG',
          'Tripura': 'TR',
          'Uttar Pradesh': 'UP',
          'Uttarakhand': 'UK',
          'West Bengal': 'WB',
          'Delhi': 'DL',
          'Jammu & Kashmir': 'JK',
          'Ladakh': 'LA',
          'Puducherry': 'PY',
          'Andaman and Nicobar Islands': 'AN',
          'Chandigarh': 'CH',
          'Dadra and Nagar Haveli': 'DN',
          'Daman and Diu': 'DD',
          'Lakshadweep': 'LD'
        };

        // Extract state and convert to code
        const stateName = (data as any).state || 
                         (data as any).stateName || 
                         (data as any).region || 
                         '';
        const state = stateNameToCode[stateName] || stateName;
        
        const city = (data as any).city || 
                    (data as any).taluk || 
                    (data as any).officeName || 
                    (data as any).district || 
                    '';
        
        const district = (data as any).district || '';
        
        const pincodeInfo: IndiaPincodeInfo = {
          pincode: cleanCode,
          city,
          district,
          state,
          country: 'IN' // Use country code for LocationSelect compatibility
        };
        
        console.log('India PIN code data:', pincodeInfo);
        setPincodeData(pincodeInfo);
        
        // Update all fields with proper dependencies
        onPincodeChange(pincodeInfo);
        onCityChange(pincodeInfo.city);
        onStateChange(pincodeInfo.state);
        onCountryChange(pincodeInfo.country);
        
        setError('');
      } else {
        setError('Invalid PIN code. Please enter a valid Indian PIN code.');
        setPincodeData(null);
      }
    } catch (err) {
      setError('Error validating PIN code. Please try again.');
      setPincodeData(null);
    } finally {
      setIsLoading(false);
    }
  }, [onPincodeChange, onCityChange, onStateChange, onCountryChange]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (pincodeData && !error) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [pincodeData, error]);

  // Get countries, states, and cities for dropdowns
  const countries = Country.getAllCountries().map((c) => ({ code: c.isoCode, name: c.name }));
  const states = pincodeData?.country 
    ? State.getStatesOfCountry(pincodeData.country).map((s) => ({ code: s.isoCode, name: s.name }))
    : [];
  const cities = pincodeData?.country && pincodeData?.state
    ? City.getCitiesOfState(pincodeData.country, pincodeData.state).map((c) => c.name)
    : [];

  return (
    <div className={`india-pincode-autocomplete ${className}`}>
      {/* PIN Code Input with Toast */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            maxLength={6}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 ${disabled ? 'bg-gray-100' : 'bg-white'}`}
            placeholder={placeholder}
            disabled={disabled}
            value={pincode}
            onChange={(e) => handlePincodeInput(e.target.value)}
          />
          
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            </div>
          )}
        </div>
        
        {pincodeData && !error && showToast && (
          <div className="flex-shrink-0">
            <div className="bg-green-50 border border-green-200 rounded-md p-3 shadow-md animate-pulse">
              <p className="text-sm text-green-700 font-medium mb-1">Location auto-filled:</p>
              <div className="text-xs text-green-600 space-y-1">
                <div><span className="font-medium">City:</span> {pincodeData.city}</div>
                <div><span className="font-medium">State:</span> {pincodeData.state}</div>
                <div><span className="font-medium">PIN:</span> {pincodeData.pincode}</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 mb-2">{error}</p>
      )}
      
      {/* Location Dropdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Country Dropdown */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            id="country"
            value={pincodeData?.country || ''}
            onChange={(e) => {
              const newCountry = e.target.value;
              if (onCountryChange) onCountryChange(newCountry);
            }}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white min-w-[200px] whitespace-nowrap"
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
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
            value={pincodeData?.state || ''}
            onChange={(e) => {
              const newState = e.target.value;
              if (onStateChange) onStateChange(newState);
            }}
            disabled={disabled || !pincodeData?.country}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white min-w-[200px] whitespace-nowrap"
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
            value={pincodeData?.city || ''}
            onChange={(e) => {
              const newCity = e.target.value;
              if (onCityChange) onCityChange(newCity);
            }}
            disabled={disabled || !pincodeData?.state}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white min-w-[200px] whitespace-nowrap"
          >
            <option value="">Select City</option>
            {cities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <p className="mt-2 text-sm text-gray-500">
        Enter 6-digit Indian PIN code (e.g., 110001 for Delhi, 400001 for Mumbai)
      </p>
    </div>
  );
};
