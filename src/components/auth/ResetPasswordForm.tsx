'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../lib/store';
import { resetPassword, clearError } from '../../lib/slices/authSlice';
import { ResetPasswordInput } from '../../graphql/auth';
import { showSuccessToast, showErrorToast } from '../../lib/toast';
import { PasswordInput } from '../PasswordInput';

const ResetPasswordForm = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, resetToken, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<ResetPasswordInput>({
    email: '',
    newPassword: '',
    resetToken: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Get email and reset token from Redux state
  useEffect(() => {
    if (resetToken) {
      setFormData(prev => ({ ...prev, resetToken }));
    }
    
    // Get email from localStorage or query params
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || localStorage.getItem('forgotPasswordEmail');
    if (email) {
      setFormData(prev => ({ ...prev, email }));
    }
  }, [resetToken]);

  // Redirect to dashboard if password reset was successful
  useEffect(() => {
    if (isAuthenticated) {
      showSuccessToast('Password reset successful! You are now logged in.');
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear password errors when user types
    if (name === 'newPassword') {
      setPasswordErrors([]);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (!formData.email || !formData.newPassword || !formData.resetToken) {
      showErrorToast('Please fill in all fields');
      return;
    }

    // Validate password strength
    const errors = validatePassword(formData.newPassword);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }

    // Check if passwords match
    if (formData.newPassword !== confirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }

    try {
      await dispatch(resetPassword(formData)).unwrap();
      // Success will be handled by the useEffect that watches isAuthenticated
    } catch (error: any) {
      showErrorToast(error || 'Password reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                disabled={true}
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="New password"
                required
                autoComplete="new-password"
                disabled={isLoading}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm new password"
                required
                autoComplete="new-password"
                disabled={isLoading}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Password Requirements */}
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">Password must contain:</p>
            <ul className="list-disc list-inside space-y-1">
              <li className={passwordErrors.includes('Password must be at least 6 characters long') ? 'text-red-600' : 'text-green-600'}>
                At least 6 characters
              </li>
              <li className={passwordErrors.includes('Password must contain at least one uppercase letter') ? 'text-red-600' : 'text-green-600'}>
                One uppercase letter
              </li>
              <li className={passwordErrors.includes('Password must contain at least one lowercase letter') ? 'text-red-600' : 'text-green-600'}>
                One lowercase letter
              </li>
              <li className={passwordErrors.includes('Password must contain at least one number') ? 'text-red-600' : 'text-green-600'}>
                One number
              </li>
              <li className={passwordErrors.includes('Password must contain at least one special character') ? 'text-red-600' : 'text-green-600'}>
                One special character
              </li>
            </ul>
          </div>

          {passwordErrors.length > 0 && (
            <div className="text-red-600 text-sm">
              {passwordErrors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>

          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
