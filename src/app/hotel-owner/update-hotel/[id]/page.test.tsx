import React from 'react';
import { describe, it, expect, vi, beforeEach, Mock, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import UpdateHotelPage from './page';

// Mock the router - factory must not reference outer variables
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: '19' }),
}));

// Mock the apollo client - using spy pattern instead of factory with outer variables
vi.mock('@/lib/apollo-client', () => ({
  client: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

// Mock file upload service
vi.mock('@/services/file-upload.service', () => ({
  fileUploadService: {
    uploadHotelImages: vi.fn(),
  },
}));

// Import mocked services after mock definitions
import { fileUploadService } from '@/services/file-upload.service';
import { client } from '@/lib/apollo-client';

// Mock toast
vi.mock('@/lib/toast', () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

import { showSuccessToast, showErrorToast } from '@/lib/toast';

// Mock IndiaPincodeAutocomplete to avoid postalcodes-india issues
vi.mock('@/components/IndiaPincodeAutocomplete', () => ({
  IndiaPincodeAutocomplete: ({ initialPincode, onPincodeChange, onCityChange, onStateChange, onCountryChange }: any) => (
    <div data-testid="pincode-autocomplete">
      <input
        type="text"
        value={initialPincode || ''}
        onChange={(e) => {
          const val = e.target.value;
          if (val.length === 6) {
            onPincodeChange({ pincode: val, city: 'Test City', state: 'GJ', country: 'IN' });
            onCityChange('Test City');
            onStateChange('GJ');
            onCountryChange('IN');
          }
        }}
        placeholder="PIN code"
        data-testid="pincode-input"
      />
    </div>
  ),
}));

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
    { id: 3, name: 'Parking', isAvailable: false },
  ],
  images: [
    { id: 12, url: 'https://example.com/image1.jpg', isPrimary: true, altText: 'Hotel image 1' },
    { id: 13, url: 'https://example.com/image2.jpg', isPrimary: false, altText: 'Hotel image 2' },
  ],
};

const defaultAuthState = {
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
};

describe('UpdateHotelPage - Amenities', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (client.query as Mock).mockResolvedValue({
      data: { hotel: mockHotelData },
    });
  });

  it('should load and display existing amenities as checked', async () => {
    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getByText('Hotel Amenities')).toBeInTheDocument();
    });

    // WiFi and Pool should be checked (from API)
    const wifiCheckbox = screen.getByLabelText('WiFi') as HTMLInputElement;
    const poolCheckbox = screen.getByLabelText('Pool') as HTMLInputElement;

    expect(wifiCheckbox.checked).toBe(true);
    expect(poolCheckbox.checked).toBe(true);
  });

  it('should allow toggling amenities', async () => {
    const user = userEvent.setup();

    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getByText('Hotel Amenities')).toBeInTheDocument();
    });

    const wifiCheckbox = screen.getByLabelText('WiFi') as HTMLInputElement;

    // Uncheck WiFi
    await user.click(wifiCheckbox);
    expect(wifiCheckbox.checked).toBe(false);

    // Check again
    await user.click(wifiCheckbox);
    expect(wifiCheckbox.checked).toBe(true);
  });

  it('should include amenities in mutation on submit', async () => {
    const user = userEvent.setup();

    (client.mutate as Mock).mockResolvedValue({
      data: { updateHotelWithUrls: { id: 19, name: 'Test Hotel' } },
    });

    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /update hotel/i })).toBeInTheDocument();
    });

    // Change amenities
    const spaCheckbox = screen.getByLabelText('Spa') as HTMLInputElement;
    await user.click(spaCheckbox);

    const updateButton = screen.getByRole('button', { name: /update hotel/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(client.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            input: expect.objectContaining({
              amenities: expect.arrayContaining(['WiFi', 'Pool', 'Spa']),
            }),
          }),
        })
      );
    });
  });
});

describe('UpdateHotelPage - Image Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (client.query as Mock).mockResolvedValue({
      data: { hotel: mockHotelData },
    });
  });

  it('should display existing images', async () => {
    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getByText('Hotel Images')).toBeInTheDocument();
      expect(screen.getByText('Image 1')).toBeInTheDocument();
      expect(screen.getByText('Image 2')).toBeInTheDocument();
    });
  });

  it('should mark image for deletion when remove button clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getAllByText('Remove').length).toBe(2);
    });

    // Click remove on first image
    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[0]);

    // After removing first image, only 1 image remains (which is now Image 1)
    await waitFor(() => {
      expect(screen.getAllByText('Remove').length).toBe(1);
      expect(screen.getByText('Image 1')).toBeInTheDocument();
      expect(screen.queryByText('(Primary)')).not.toBeInTheDocument(); // The removed image was primary
    });
  });

  it('should convert image ID to number for deleteImageIds', async () => {
    const user = userEvent.setup();

    (client.mutate as Mock).mockResolvedValue({
      data: { updateHotelWithUrls: { id: 19, name: 'Test Hotel' } },
    });

    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getAllByText('Remove').length).toBe(2);
    });

    // Remove first image
    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[0]);

    // Submit form
    const updateButton = screen.getByRole('button', { name: /update hotel/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(client.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            input: expect.objectContaining({
              deleteImageIds: expect.arrayContaining([12]), // Should be number, not string
            }),
          }),
        })
      );
    });
  });

  it('should handle new image upload', async () => {
    const user = userEvent.setup();
    const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });

    (fileUploadService.uploadHotelImages as Mock).mockResolvedValue([
      'https://example.com/new-image.jpg',
    ]);

    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getByText('Hotel Images')).toBeInTheDocument();
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(fileUploadService.uploadHotelImages).toHaveBeenCalledWith([file]);
      expect(showSuccessToast).toHaveBeenCalledWith('Files uploaded successfully');
    });
  });

  it('should display newly uploaded images with pending badge', async () => {
    const user = userEvent.setup();
    const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });

    (fileUploadService.uploadHotelImages as Mock).mockResolvedValue([
      'https://example.com/new-image.jpg',
    ]);

    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getByText('Hotel Images')).toBeInTheDocument();
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    await waitFor(() => {
      // Look for the specific "New Image" heading (starts with N and has number)
      expect(screen.getByText(/^New Image \d/i)).toBeInTheDocument();
      expect(screen.getByText(/pending upload/i)).toBeInTheDocument();
    });
  });

  it('should allow removing newly uploaded images', async () => {
    const user = userEvent.setup();
    const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });

    (fileUploadService.uploadHotelImages as Mock).mockResolvedValue([
      'https://example.com/new-image.jpg',
    ]);

    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getByText('Hotel Images')).toBeInTheDocument();
    });

    // Upload image
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/^New Image \d/i)).toBeInTheDocument();
    });

    // Find and click remove on new image - the newly uploaded image has a "Pending Upload" badge
    const pendingBadge = screen.getByText(/pending upload/i);
    const newImageCard = pendingBadge.closest('.border-indigo-200');
    const removeButton = newImageCard?.querySelector('button');
    if (removeButton) {
      await user.click(removeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText(/pending upload/i)).not.toBeInTheDocument();
    });
  });

  it('should include newImages in mutation on submit', async () => {
    const user = userEvent.setup();
    const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });

    (fileUploadService.uploadHotelImages as Mock).mockResolvedValue([
      'https://example.com/new-image.jpg',
    ]);

    (client.mutate as Mock).mockResolvedValue({
      data: { updateHotelWithUrls: { id: 19, name: 'Test Hotel' } },
    });

    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getByText('Hotel Images')).toBeInTheDocument();
    });

    // Upload new image - find input by type since label is not associated
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/^New Image \d/i)).toBeInTheDocument();
    });

    // Submit form
    const updateButton = screen.getByRole('button', { name: /update hotel/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(client.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            input: expect.objectContaining({
              newImages: expect.objectContaining({
                images: expect.arrayContaining([
                  expect.objectContaining({
                    url: 'https://example.com/new-image.jpg',
                  }),
                ]),
              }),
            }),
          }),
        })
      );
    });
  });

  it('should validate at least one image exists before submit', async () => {
    const user = userEvent.setup();

    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getAllByText('Remove').length).toBe(2);
    });

    // Remove both images
    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[0]);
    await user.click(removeButtons[1]);

    // Try to submit
    const updateButton = screen.getByRole('button', { name: /update hotel/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText(/at least 1 hotel image is required/i)).toBeInTheDocument();
    });

    expect(client.mutate).not.toHaveBeenCalled();
  });
});

describe('UpdateHotelPage - Form Submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (client.query as Mock).mockResolvedValue({
      data: { hotel: mockHotelData },
    });
  });

  it('should send rating as number in mutation', async () => {
    const user = userEvent.setup();

    (client.mutate as Mock).mockResolvedValue({
      data: { updateHotelWithUrls: { id: 19, name: 'Test Hotel' } },
    });

    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /update hotel/i })).toBeInTheDocument();
    });

    const updateButton = screen.getByRole('button', { name: /update hotel/i });
    await user.click(updateButton);

    await waitFor(() => {
      const mutateCall = (client.mutate as Mock).mock.calls[0][0];
      const rating = mutateCall.variables.input.rating;

      // Rating should be a number, not string
      expect(typeof rating).toBe('number');
      expect(rating).toBe(4.5);
    });
  });

  it('should redirect to view hotel on success', async () => {
    const user = userEvent.setup();

    (client.mutate as Mock).mockResolvedValue({
      data: { updateHotelWithUrls: { id: 19, name: 'Test Hotel' } },
    });

    renderWithProviders(<UpdateHotelPage />, {
      preloadedState: { auth: defaultAuthState },
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /update hotel/i })).toBeInTheDocument();
    });

    const updateButton = screen.getByRole('button', { name: /update hotel/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(showSuccessToast).toHaveBeenCalledWith('Hotel updated successfully!');
      expect(mockPush).toHaveBeenCalledWith('/hotel-owner/view-hotel/19');
    });
  });
});
