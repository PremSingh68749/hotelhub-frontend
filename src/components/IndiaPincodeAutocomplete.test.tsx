import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IndiaPincodeAutocomplete } from './IndiaPincodeAutocomplete';

// Mock the postal codes package
vi.mock('postalcodes-india', () => ({
  default: {
    find: vi.fn(),
  },
}));

import postalCodesIndia from 'postalcodes-india';

describe('IndiaPincodeAutocomplete', () => {
  const mockCallbacks = {
    onPincodeChange: vi.fn(),
    onCityChange: vi.fn(),
    onStateChange: vi.fn(),
    onCountryChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should render with empty initial pincode', () => {
    render(<IndiaPincodeAutocomplete {...mockCallbacks} />);

    expect(screen.getByPlaceholderText('Enter 6-digit PIN code')).toBeInTheDocument();
  });

  it('should render with initial pincode value', () => {
    render(<IndiaPincodeAutocomplete {...mockCallbacks} initialPincode="380060" />);

    const input = screen.getByDisplayValue('380060');
    expect(input).toBeInTheDocument();
  });

  it('should validate and trigger callbacks when initial pincode is valid', async () => {
    const mockPincodeData = {
      state: 'Gujarat',
      city: 'Ahmedabad',
      district: 'Ahmedabad',
    };

    (postalCodesIndia.find as ReturnType<typeof vi.fn>).mockReturnValue(mockPincodeData);

    render(<IndiaPincodeAutocomplete {...mockCallbacks} initialPincode="380060" />);

    await waitFor(() => {
      expect(postalCodesIndia.find).toHaveBeenCalledWith('380060');
    });

    await waitFor(() => {
      expect(mockCallbacks.onPincodeChange).toHaveBeenCalled();
      expect(mockCallbacks.onCityChange).toHaveBeenCalledWith('Ahmedabad');
      expect(mockCallbacks.onStateChange).toHaveBeenCalledWith('GJ');
      expect(mockCallbacks.onCountryChange).toHaveBeenCalledWith('IN');
    });
  });

  it('should not validate if initial pincode is not 6 digits', async () => {
    render(<IndiaPincodeAutocomplete {...mockCallbacks} initialPincode="123" />);

    await waitFor(() => {
      expect(postalCodesIndia.find).not.toHaveBeenCalled();
    });
  });

  it('should validate only once on initial load', async () => {
    const mockPincodeData = {
      state: 'Gujarat',
      city: 'Ahmedabad',
      district: 'Ahmedabad',
    };

    (postalCodesIndia.find as ReturnType<typeof vi.fn>).mockReturnValue(mockPincodeData);

    const { rerender } = render(
      <IndiaPincodeAutocomplete {...mockCallbacks} initialPincode="380060" />
    );

    await waitFor(() => {
      expect(postalCodesIndia.find).toHaveBeenCalledTimes(1);
    });

    // Re-render with same initialPincode should not trigger validation again
    rerender(<IndiaPincodeAutocomplete {...mockCallbacks} initialPincode="380060" />);

    await waitFor(() => {
      expect(postalCodesIndia.find).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle user input and validate pincode', async () => {
    const user = userEvent.setup();
    const mockPincodeData = {
      state: 'Maharashtra',
      city: 'Mumbai',
      district: 'Mumbai',
    };

    (postalCodesIndia.find as ReturnType<typeof vi.fn>).mockReturnValue(mockPincodeData);

    render(<IndiaPincodeAutocomplete {...mockCallbacks} />);

    const input = screen.getByPlaceholderText('Enter 6-digit PIN code');
    await user.type(input, '400001');

    await waitFor(() => {
      expect(postalCodesIndia.find).toHaveBeenCalledWith('400001');
    }, { timeout: 600 });

    await waitFor(() => {
      expect(mockCallbacks.onCityChange).toHaveBeenCalledWith('Mumbai');
      expect(mockCallbacks.onStateChange).toHaveBeenCalledWith('MH');
    });
  });

  it('should show error for invalid pincode', async () => {
    const user = userEvent.setup();

    (postalCodesIndia.find as ReturnType<typeof vi.fn>).mockReturnValue(null);

    render(<IndiaPincodeAutocomplete {...mockCallbacks} />);

    const input = screen.getByPlaceholderText('Enter 6-digit PIN code');
    await user.type(input, '000000');

    await waitFor(() => {
      expect(screen.getByText(/invalid pin code/i)).toBeInTheDocument();
    }, { timeout: 600 });
  });

  it('should handle state name to code conversion correctly', async () => {
    const testCases = [
      { state: 'Gujarat', expectedCode: 'GJ' },
      { state: 'Maharashtra', expectedCode: 'MH' },
      { state: 'Delhi', expectedCode: 'DL' },
      { state: 'Karnataka', expectedCode: 'KA' },
    ];

    for (const testCase of testCases) {
      vi.clearAllMocks();

      (postalCodesIndia.find as ReturnType<typeof vi.fn>).mockReturnValue({
        state: testCase.state,
        city: 'Test City',
        district: 'Test District',
      });

      render(
        <IndiaPincodeAutocomplete
          {...mockCallbacks}
          initialPincode="123456"
        />
      );

      await waitFor(() => {
        expect(mockCallbacks.onStateChange).toHaveBeenCalledWith(testCase.expectedCode);
      });
    }
  });

  it('should handle disabled state', () => {
    render(<IndiaPincodeAutocomplete {...mockCallbacks} disabled={true} />);

    const input = screen.getByPlaceholderText('Enter 6-digit PIN code');
    expect(input).toBeDisabled();
  });

  it('should pass through custom placeholder and className', () => {
    render(
      <IndiaPincodeAutocomplete
        {...mockCallbacks}
        placeholder="Custom placeholder"
        className="custom-class"
      />
    );

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });
});
