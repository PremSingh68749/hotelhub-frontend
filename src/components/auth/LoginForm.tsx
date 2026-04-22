'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../lib/store';
import { login, clearError } from '../../lib/slices/authSlice';
import { LoginInput } from '../../graphql/auth';
import { showSuccessToast, showErrorToast } from '../../lib/toast';
import { PasswordInput } from '../PasswordInput';

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, requiresOTP, otpEmail } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow spaces during typing, don't trim on change
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    // Trim all form data
    const trimmedFormData = {
      email: formData.email.trim(),
      password: formData.password.trim()
    };

    // Frontend validation
    if (!trimmedFormData.email) {
      showErrorToast('Please enter your email address');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedFormData.email)) {
      showErrorToast('Please enter a valid email address');
      return;
    }

    if (!trimmedFormData.password) {
      showErrorToast('Please enter your password');
      return;
    }

    const result = await dispatch(login(trimmedFormData));
    if (login.fulfilled.match(result)) {
      if (result.payload.token) {
        showSuccessToast('Login successful!');
        router.push('/dashboard');
      } else if (result.payload.requiresOTP) {
        showSuccessToast('OTP verification required. Please check your email.');
        // Store email in localStorage for OTP verification page
        localStorage.setItem('otpEmail', trimmedFormData.email);
        router.push('/auth/verify-otp');
      }
    } else if (login.rejected.match(result)) {
      showErrorToast(result.payload as string);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <h1 className="text-3xl font-bold text-indigo-600">HotelHub</h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded transition-colors duration-200" aria-label="Create a new account">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-label="Email address"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                // Keep onBlur trimming for final cleanup
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                autoComplete="current-password"
                ariaLabel="Password"
                className="appearance-none rounded-none relative block w-full px-3 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
              className="group relative w-full flex justify-center py-3 px-4 border-2 border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Sign in to your account"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded transition-colors duration-200" aria-label="Reset your password">
                Forgot your password?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
