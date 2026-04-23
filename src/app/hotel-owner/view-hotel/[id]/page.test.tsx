import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import ViewHotelPage from './page';
import { client } from '@/lib/apollo-client';

// Mock the router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: '19' }),
}));

// Mock the apollo client
vi.mock('@/lib/apollo-client', () => ({
  client: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

// Mock toast
vi.mock('@/lib/toast', () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

import { showSuccessToast, showErrorToast } from '@/lib/toast';

const mockHotelData = {
  id: '19',
  name: 'Test Hotel',
  address: '123 Test Street',
  city: 'Ahmedabad',
  state: 'GJ',
  country: 'IN',
  postalCode: '380060',
  phone: '918932845781',
  email: 'test@example.com',
  website: 'https://www.test.com',
  description: 'A test hotel',
  rating: 4.5,
  isActive: true,
  isVerified: false,
  ownerId: 3,
  createdAt: '2026-04-22T11:08:40.522Z',
  updatedAt: '2026-04-22T11:08:40.523Z',
  amenities: [
    { id: 1, name: 'WiFi', isAvailable: true },
    { id: 2, name: 'Pool', isAvailable: true },
  ],
  images: [
    { id: 12, url: 'https://example.com/image.jpg', isPrimary: true, altText: 'Hotel image' },
  ],
};

describe('ViewHotelPage - Delete Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful hotel fetch
    (client.query as Mock).mockResolvedValue({
      data: { hotel: mockHotelData },
    });
  });

  it('should render delete button', async () => {
    renderWithProviders(<ViewHotelPage />, {
      preloadedState: {
        auth: {
          user: { id: '3', userType: 'HOTEL_OWNER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          requiresOTP: false,
          otpEmail: null,
          resetToken: null,
          accountDeleted: false,
          requiresEmailVerification: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Delete Hotel')).toBeInTheDocument();
    });
  });

  it('should show confirmation dialog on delete click', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));

    renderWithProviders(<ViewHotelPage />, {
      preloadedState: {
        auth: {
          user: { id: '3', userType: 'HOTEL_OWNER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          requiresOTP: false,
          otpEmail: null,
          resetToken: null,
          accountDeleted: false,
          requiresEmailVerification: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Delete Hotel')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete Hotel');
    await user.click(deleteButton);

    expect(confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this hotel? This action cannot be undone.'
    );
  });

  it('should call delete mutation when confirmed', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));

    (client.mutate as Mock).mockResolvedValue({
      data: {
        deleteHotel: {
          success: true,
          message: 'Hotel deleted successfully',
        },
      },
    });

    renderWithProviders(<ViewHotelPage />, {
      preloadedState: {
        auth: {
          user: { id: '3', userType: 'HOTEL_OWNER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          requiresOTP: false,
          otpEmail: null,
          resetToken: null,
          accountDeleted: false,
          requiresEmailVerification: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Delete Hotel')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete Hotel');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(client.mutate).toHaveBeenCalledWith({
        mutation: expect.anything(),
        variables: {
          id: 19,
        },
      });
    });
  });

  it('should show success toast and redirect on successful delete', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));

    (client.mutate as Mock).mockResolvedValue({
      data: {
        deleteHotel: {
          success: true,
          message: 'Hotel deleted successfully',
        },
      },
    });

    renderWithProviders(<ViewHotelPage />, {
      preloadedState: {
        auth: {
          user: { id: '3', userType: 'HOTEL_OWNER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          requiresOTP: false,
          otpEmail: null,
          resetToken: null,
          accountDeleted: false,
          requiresEmailVerification: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Delete Hotel')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete Hotel');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(showSuccessToast).toHaveBeenCalledWith('Hotel deleted successfully');
      expect(mockPush).toHaveBeenCalledWith('/hotel-owner');
    });
  });

  it('should show error toast on delete failure', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));

    (client.mutate as Mock).mockRejectedValue(new Error('Delete failed'));

    renderWithProviders(<ViewHotelPage />, {
      preloadedState: {
        auth: {
          user: { id: '3', userType: 'HOTEL_OWNER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          requiresOTP: false,
          otpEmail: null,
          resetToken: null,
          accountDeleted: false,
          requiresEmailVerification: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Delete Hotel')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete Hotel');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith('Delete failed');
    });
  });

  it('should show error toast when delete returns success false', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));

    (client.mutate as Mock).mockResolvedValue({
      data: {
        deleteHotel: {
          success: false,
          message: 'Cannot delete hotel with active bookings',
        },
      },
    });

    renderWithProviders(<ViewHotelPage />, {
      preloadedState: {
        auth: {
          user: { id: '3', userType: 'HOTEL_OWNER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          requiresOTP: false,
          otpEmail: null,
          resetToken: null,
          accountDeleted: false,
          requiresEmailVerification: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Delete Hotel')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete Hotel');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith('Failed to delete hotel');
    });
  });

  it('should not call delete if user cancels confirmation', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));

    renderWithProviders(<ViewHotelPage />, {
      preloadedState: {
        auth: {
          user: { id: '3', userType: 'HOTEL_OWNER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          requiresOTP: false,
          otpEmail: null,
          resetToken: null,
          accountDeleted: false,
          requiresEmailVerification: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Delete Hotel')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete Hotel');
    await user.click(deleteButton);

    expect(client.mutate).not.toHaveBeenCalled();
  });

  it('should parse hotelId as integer', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));

    (client.mutate as Mock).mockResolvedValue({
      data: {
        deleteHotel: {
          success: true,
          message: 'Hotel deleted',
        },
      },
    });

    renderWithProviders(<ViewHotelPage />, {
      preloadedState: {
        auth: {
          user: { id: '3', userType: 'HOTEL_OWNER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          requiresOTP: false,
          otpEmail: null,
          resetToken: null,
          accountDeleted: false,
          requiresEmailVerification: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Delete Hotel')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete Hotel');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(client.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            id: 19, // Should be integer, not string "19"
          }),
        })
      );
    });
  });
});

describe('ViewHotelPage - Amenities Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (client.query as Mock).mockResolvedValue({
      data: { hotel: mockHotelData },
    });
  });

  it('should display amenities from API', async () => {
    renderWithProviders(<ViewHotelPage />, {
      preloadedState: {
        auth: {
          user: { id: '3', userType: 'HOTEL_OWNER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          requiresOTP: false,
          otpEmail: null,
          resetToken: null,
          accountDeleted: false,
          requiresEmailVerification: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('WiFi')).toBeInTheDocument();
      expect(screen.getByText('Pool')).toBeInTheDocument();
    });
  });

  it('should not show amenities section if no amenities', async () => {
    const hotelWithoutAmenities = {
      ...mockHotelData,
      amenities: [],
    };

    (client.query as Mock).mockResolvedValue({
      data: { hotel: hotelWithoutAmenities },
    });

    renderWithProviders(<ViewHotelPage />, {
      preloadedState: {
        auth: {
          user: { id: '3', userType: 'HOTEL_OWNER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          requiresOTP: false,
          otpEmail: null,
          resetToken: null,
          accountDeleted: false,
          requiresEmailVerification: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.queryByText('Amenities')).not.toBeInTheDocument();
    });
  });
});
