'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../lib/store';
import { signup, clearError } from '../../lib/slices/authSlice';
import { SignupInput, UserType } from '../../graphql/auth';
import { showSuccessToast, showErrorToast } from '../../lib/toast';
import { PasswordInput } from '../PasswordInput';

const SignupForm = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<SignupInput>({
    name: '',
    email: '',
    password: '',
    userType: UserType.NORMAL_USER
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow spaces during typing, don't trim on change
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow spaces during typing, don't trim on change
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    // Trim all form data
    const trimmedFormData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      userType: formData.userType,
      ...(formData.userType === UserType.HOTEL_OWNER && { companyName: formData.companyName?.trim() })
    };
    const trimmedConfirmPassword = confirmPassword.trim();

    // Frontend validation
    if (!trimmedFormData.name) {
      showErrorToast('Please enter your full name');
      return;
    }

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
      showErrorToast('Please enter a password');
      return;
    }

    if (trimmedFormData.password.length < 6) {
      showErrorToast('Password must be at least 6 characters');
      return;
    }

    if (!trimmedConfirmPassword) {
      showErrorToast('Please confirm your password');
      return;
    }

    if (trimmedFormData.password !== trimmedConfirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }

    // Additional validation for hotel owners
    if (trimmedFormData.userType === UserType.HOTEL_OWNER) {
      if (!trimmedFormData.companyName || trimmedFormData.companyName.trim().length < 2) {
        showErrorToast('Company name must be at least 2 characters long');
        return;
      }
    }

    const result = await dispatch(signup(trimmedFormData));
    if (signup.fulfilled.match(result)) {
      showSuccessToast('Account created successfully! Please check your email for verification OTP.');
      setSignupEmail(trimmedFormData.email);
      setShowOTPVerification(true);
    } else if (signup.rejected.match(result)) {
      showErrorToast(result.payload as string);
    }
  };

  if (showOTPVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a verification OTP to {signupEmail}
            </p>
          </div>
          
          <div className="text-center">
            <Link 
              href={`/auth/verify-otp?email=${encodeURIComponent(signupEmail)}`} 
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Verify OTP
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex justify-center">
            <h1 className="text-3xl font-bold text-indigo-600">HotelHub</h1>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded transition-colors duration-200" aria-label="Sign in to existing account">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-900 mb-2">
                I want to register as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: UserType.NORMAL_USER }))}
                  className={`p-3 border-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    formData.userType === UserType.NORMAL_USER
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Individual
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: UserType.HOTEL_OWNER }))}
                  className={`p-3 border-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    formData.userType === UserType.HOTEL_OWNER
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Hotel Owner
                  </div>
                </button>
              </div>
            </div>
            
            {formData.userType === UserType.HOTEL_OWNER && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-900 mb-2">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required={formData.userType === UserType.HOTEL_OWNER}
                  aria-required={formData.userType === UserType.HOTEL_OWNER}
                  aria-describedby="companyName-error"
                  className="mt-1 appearance-none relative block w-full px-3 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                  placeholder="Enter your hotel company name"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                aria-required="true"
                aria-describedby="name-error"
                className="mt-1 appearance-none relative block w-full px-3 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                // Keep onBlur trimming for final cleanup
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-describedby="email-error"
                className="mt-1 appearance-none relative block w-full px-3 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                // Keep onBlur trimming for final cleanup
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
                ariaDescribedBy="password-error"
                className="mt-1 appearance-none relative block w-full px-3 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                minLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm your password"
                required
                ariaDescribedBy="confirmPassword-error"
                className="mt-1 appearance-none relative block w-full px-3 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !confirmPassword.trim() || formData.password.trim().length < 6 || (formData.userType === UserType.HOTEL_OWNER && (!formData.companyName?.trim() || formData.companyName.trim().length < 2))}
              className="group relative w-full flex justify-center py-3 px-4 border-2 border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Create Account"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
