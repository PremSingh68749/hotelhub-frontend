import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent } from '@/test/utils';
import LoginForm from '@/components/auth/LoginForm';
import * as toastModule from '@/lib/toast';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('LoginForm Component', () => {

  const initialAuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    requiresOTP: false,
    otpEmail: null,
    resetToken: null,
    accountDeleted: false,
    requiresEmailVerification: false,
  };

  const initialHotelState = {
    hotels: [],
    currentHotel: null,
    totalCount: 0,
    isLoading: false,
    error: null,
    hasMore: true,
    currentPage: 1,
    searchFilters: {
      limit: 10,
      offset: 0,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(toastModule, 'showErrorToast');
    vi.spyOn(toastModule, 'showSuccessToast');
  });

  it('should render login form with email and password fields', () => {
    renderWithProviders(<LoginForm />, {
      preloadedState: {
        auth: initialAuthState,
        hotel: initialHotelState,
      },
    });

    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render signup link', () => {
    renderWithProviders(<LoginForm />, {
      preloadedState: {
        auth: initialAuthState,
        hotel: initialHotelState,
      },
    });

    const signupLink = screen.getByRole('link', { name: /create a new account/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/auth/signup');
  });

  it('should render forgot password link', () => {
    renderWithProviders(<LoginForm />, {
      preloadedState: {
        auth: initialAuthState,
        hotel: initialHotelState,
      },
    });

    const forgotPasswordLink = screen.getByRole('link', { name: /reset your password/i });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password');
  });

  it('should update email input field when user types', () => {
    renderWithProviders(<LoginForm />, {
      preloadedState: {
        auth: initialAuthState,
        hotel: initialHotelState,
      },
    });

    const emailInput = screen.getByPlaceholderText(/email address/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });

  it('should update password input field when user types', () => {
    renderWithProviders(<LoginForm />, {
      preloadedState: {
        auth: initialAuthState,
        hotel: initialHotelState,
      },
    });

    const passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  it('should show error toast when email is empty on submit', () => {
    const { container } = renderWithProviders(<LoginForm />, {
      preloadedState: {
        auth: initialAuthState,
        hotel: initialHotelState,
      },
    });

    const passwordInput = screen.getByPlaceholderText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const form = container.querySelector('form');
    fireEvent.submit(form!);

    expect(vi.mocked(toastModule).showErrorToast).toHaveBeenCalledWith('Please enter your email address');
  });

  it('should show error toast for invalid email format', () => {
    const { container } = renderWithProviders(<LoginForm />, {
      preloadedState: {
        auth: initialAuthState,
        hotel: initialHotelState,
      },
    });

    const emailInput = screen.getByPlaceholderText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const passwordInput = screen.getByPlaceholderText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const form = container.querySelector('form');
    fireEvent.submit(form!);

    expect(vi.mocked(toastModule).showErrorToast).toHaveBeenCalledWith('Please enter a valid email address');
  });

  it('should show error toast when password is empty on submit', () => {
    const { container } = renderWithProviders(<LoginForm />, {
      preloadedState: {
        auth: initialAuthState,
        hotel: initialHotelState,
      },
    });

    const emailInput = screen.getByPlaceholderText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = container.querySelector('form');
    fireEvent.submit(form!);

    expect(vi.mocked(toastModule).showErrorToast).toHaveBeenCalledWith('Please enter your password');
  });

  it('should disable submit button while loading', () => {
    renderWithProviders(<LoginForm />, {
      preloadedState: {
        auth: {
          ...initialAuthState,
          isLoading: true,
        },
        hotel: initialHotelState,
      },
    });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/signing in/i);
  });

  it('should disable submit button when form fields are empty', () => {
    renderWithProviders(<LoginForm />, {
      preloadedState: {
        auth: initialAuthState,
        hotel: initialHotelState,
      },
    });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });
});