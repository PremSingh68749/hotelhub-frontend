import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import HotelAutocomplete from '@/components/hotel/HotelAutocomplete';
import { ADVANCED_HOTEL_AUTOCOMPLETE_QUERY } from '@/graphql/hotel';
import authReducer from '@/lib/slices/authSlice';
import hotelReducer from '@/lib/slices/hotelSlice';
import { act } from '@testing-library/react';

// Mock Apollo Client
const mockQuery = vi.fn();

// Mock Apollo Context
vi.mock('@/contexts/ApolloContext', () => ({
  useApollo: () => ({
    query: mockQuery,
  }),
}));

describe('HotelAutocomplete Component', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: {
        auth: authReducer,
        hotel: hotelReducer,
      },
    });
  };

  const renderWithProviders = (component: React.ReactElement) => {
    const store = createTestStore();
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render input field with correct placeholder', () => {
    const mockOnChange = vi.fn();
    renderWithProviders(
      <HotelAutocomplete
        value=""
        onChange={mockOnChange}
        placeholder="Search hotels..."
      />
    );

    const input = screen.getByPlaceholderText('Search hotels...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('should call onChange when user types', () => {
    const mockOnChange = vi.fn();
    renderWithProviders(
      <HotelAutocomplete
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText(/search hotels/i);
    fireEvent.change(input, { target: { value: 'Marriott' } });

    expect(mockOnChange).toHaveBeenCalledWith('Marriott');
  });

  it('should not fetch suggestions for queries shorter than 2 characters', async () => {
    const mockOnChange = vi.fn();
    mockQuery.mockResolvedValue({
      data: { advancedHotelAutocomplete: ['Marriott Hotel'] },
    });

    const TestWrapper = () => {
      const [value, setValue] = React.useState('');
      return (
        <HotelAutocomplete
          value={value}
          onChange={(v) => {
            setValue(v);
            mockOnChange(v);
          }}
        />
      );
    };

    renderWithProviders(<TestWrapper />);

    const input = screen.getByPlaceholderText(/search hotels/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'M' } });
    });

    // Advance timers past debounce
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should fetch suggestions for queries 2 characters or longer', async () => {
    const mockOnChange = vi.fn();
    const mockSuggestions = ['Marriott Hotel', 'Hilton Garden Inn'];
    
    mockQuery.mockResolvedValue({
      data: { advancedHotelAutocomplete: mockSuggestions },
    });

    const TestWrapper = () => {
      const [value, setValue] = React.useState('');
      return (
        <HotelAutocomplete
          value={value}
          onChange={(v) => {
            setValue(v);
            mockOnChange(v);
          }}
        />
      );
    };

    renderWithProviders(<TestWrapper />);

    const input = screen.getByPlaceholderText(/search hotels/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Ma' } });
    });

    // Advance timers for debounce
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockQuery).toHaveBeenCalledWith({
        query: ADVANCED_HOTEL_AUTOCOMPLETE_QUERY,
        variables: { query: 'Ma' },
      });
    });
  });

  it('should display suggestions when API returns data', async () => {
    const mockOnChange = vi.fn();
    const mockSuggestions = ['Marriott Hotel', 'Hilton Garden Inn'];
    
    mockQuery.mockResolvedValue({
      data: { advancedHotelAutocomplete: mockSuggestions },
    });

    const TestWrapper = () => {
      const [value, setValue] = React.useState('');
      return (
        <HotelAutocomplete
          value={value}
          onChange={(v) => {
            setValue(v);
            mockOnChange(v);
          }}
        />
      );
    };

    renderWithProviders(<TestWrapper />);

    const input = screen.getByPlaceholderText(/search hotels/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Mar' } });
    });

    // Advance timers for debounce
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Marriott Hotel')).toBeInTheDocument();
      expect(screen.getByText('Hilton Garden Inn')).toBeInTheDocument();
    });
  });

  it('should hide suggestions when a suggestion is selected', async () => {
    const mockOnChange = vi.fn();
    const mockSuggestions = ['Marriott Hotel', 'Hilton Garden Inn'];
    
    mockQuery.mockResolvedValue({
      data: { advancedHotelAutocomplete: mockSuggestions },
    });

    const TestWrapper = () => {
      const [value, setValue] = React.useState('');
      return (
        <HotelAutocomplete
          value={value}
          onChange={(v) => {
            setValue(v);
            mockOnChange(v);
          }}
        />
      );
    };

    renderWithProviders(<TestWrapper />);

    const input = screen.getByPlaceholderText(/search hotels/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Mar' } });
    });

    // Advance timers for debounce
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText('Marriott Hotel')).toBeInTheDocument();
    });

    // Click on the first suggestion
    await act(async () => {
      fireEvent.click(screen.getByText('Marriott Hotel'));
    });

    expect(mockOnChange).toHaveBeenCalledWith('Marriott Hotel');
    
    // Suggestions should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Marriott Hotel')).not.toBeInTheDocument();
    });
  });

  it('should show loading indicator while fetching', async () => {
    const mockOnChange = vi.fn();
    
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const mockPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    mockQuery.mockReturnValue(mockPromise);

    const TestWrapper = () => {
      const [value, setValue] = React.useState('');
      return (
        <HotelAutocomplete
          value={value}
          onChange={(v) => {
            setValue(v);
            mockOnChange(v);
          }}
        />
      );
    };

    renderWithProviders(<TestWrapper />);

    const input = screen.getByPlaceholderText(/search hotels/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Mar' } });
    });

    // Advance timers for debounce
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    // Check for loading indicator - look for the div with animate-spin class
    await waitFor(() => {
      const loadingElement = document.querySelector('.animate-spin');
      expect(loadingElement).toBeInTheDocument();
    });

    // Resolve the promise
    await act(async () => {
      resolvePromise!({ data: { advancedHotelAutocomplete: [] } });
    });

    await waitFor(() => {
      const loadingElement = document.querySelector('.animate-spin');
      expect(loadingElement).not.toBeInTheDocument();
    });
  });

  it('should handle keyboard navigation', async () => {
    const mockOnChange = vi.fn();
    const mockSuggestions = ['Marriott Hotel', 'Hilton Garden Inn', 'Holiday Inn'];
    
    mockQuery.mockResolvedValue({
      data: { advancedHotelAutocomplete: mockSuggestions },
    });

    const TestWrapper = () => {
      const [value, setValue] = React.useState('');
      return (
        <HotelAutocomplete
          value={value}
          onChange={(v) => {
            setValue(v);
            mockOnChange(v);
          }}
        />
      );
    };

    renderWithProviders(<TestWrapper />);

    const input = screen.getByPlaceholderText(/search hotels/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hotel' } });
    });

    // Advance timers for debounce
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Marriott Hotel')).toBeInTheDocument();
    });

    // Get the list items for class checking
    const getSuggestionItem = (text: string) => {
      const element = screen.getByText(text);
      // The text is inside an li, use closest to find it
      return element.closest('li');
    };

    // Test arrow down navigation
    await act(async () => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });
    await waitFor(() => {
      expect(getSuggestionItem('Marriott Hotel')).toHaveClass('bg-blue-100');
    });

    // Test arrow down again
    await act(async () => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
    });
    await waitFor(() => {
      expect(getSuggestionItem('Hilton Garden Inn')).toHaveClass('bg-blue-100');
    });

    // Test enter key selection
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(mockOnChange).toHaveBeenCalledWith('Hilton Garden Inn');
  });

  it('should hide suggestions on escape key', async () => {
    const mockOnChange = vi.fn();
    const mockSuggestions = ['Marriott Hotel'];
    
    mockQuery.mockResolvedValue({
      data: { advancedHotelAutocomplete: mockSuggestions },
    });

    const TestWrapper = () => {
      const [value, setValue] = React.useState('');
      return (
        <HotelAutocomplete
          value={value}
          onChange={(v) => {
            setValue(v);
            mockOnChange(v);
          }}
        />
      );
    };

    renderWithProviders(<TestWrapper />);

    const input = screen.getByPlaceholderText(/search hotels/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Mar' } });
    });

    // Advance timers for debounce
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Marriott Hotel')).toBeInTheDocument();
    });

    // Press escape key
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Escape' });
    });

    expect(screen.queryByText('Marriott Hotel')).not.toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const mockOnChange = vi.fn();
    
    mockQuery.mockRejectedValue(new Error('Network error'));

    const TestWrapper = () => {
      const [value, setValue] = React.useState('');
      return (
        <HotelAutocomplete
          value={value}
          onChange={(v) => {
            setValue(v);
            mockOnChange(v);
          }}
        />
      );
    };

    renderWithProviders(<TestWrapper />);

    const input = screen.getByPlaceholderText(/search hotels/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Mar' } });
    });

    // Advance timers for debounce
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.queryByText('Marriott Hotel')).not.toBeInTheDocument();
    });

    // Should not crash and input should still be usable
    expect(input).toBeInTheDocument();
  });

  it('should not show suggestions when value matches last selected value', async () => {
    const mockOnChange = vi.fn();
    const mockSuggestions = ['Marriott Hotel'];
    
    mockQuery.mockResolvedValue({
      data: { advancedHotelAutocomplete: mockSuggestions },
    });

    const TestWrapper = () => {
      const [value, setValue] = React.useState('Marriott Hotel');
      return (
        <HotelAutocomplete
          value={value}
          onChange={(v) => {
            setValue(v);
            mockOnChange(v);
          }}
        />
      );
    };

    renderWithProviders(<TestWrapper />);

    const input = screen.getByPlaceholderText(/search hotels/i);
    
    // Focus the input (should not show suggestions since value matches selected value)
    await act(async () => {
      fireEvent.focus(input);
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.queryByText('Marriott Hotel')).not.toBeInTheDocument();

    // Change the value (should show suggestions)
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Marriott Hotel ' } });
    });

    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(mockQuery).toHaveBeenCalled();
    });
  });
});
