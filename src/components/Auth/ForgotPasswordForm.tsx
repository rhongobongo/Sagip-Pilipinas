'use client';

import { useState } from 'react';
// Removed Firebase imports as per request to focus on frontend only
// import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
// import { app } from '@/lib/Firebase/Firebase';
import Link from 'next/link';

// const auth = getAuth(app); // Removed Firebase auth initialization

export default function ForgotPasswordForm() {
  // State hooks remain for form functionality
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form submission handler (logic kept, but Firebase call commented out)
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    console.log('Form submitted with email:', email); // Placeholder action

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // --- Firebase logic removed as requested ---
    // try {
    //   await sendPasswordResetEmail(auth, email);
    //   setMessage(
    //     'Password reset email sent! Check your inbox (and spam folder).'
    //   );
    //   setEmail('');
    // } catch (err: unknown) {
    //   const firebaseError = err as { code?: string; message?: string };
    //   console.error('Password Reset Error:', err);
    //   if (firebaseError.code === 'auth/user-not-found') {
    //     setError('No user found with this email address.');
    //   } else if (firebaseError.code === 'auth/invalid-email') {
    //     setError('Please enter a valid email address.');
    //   } else {
    //     setError(
    //       'Failed to send password reset email. Please try again later.'
    //     );
    //   }
    // }
    // --- End of removed Firebase logic ---

    // Example success/error messages for demonstration
    if (email === 'test@example.com') {
      setMessage(
        'Password reset email sent! Check your inbox (and spam folder).'
      );
      setEmail('');
    } else if (email) {
      setError('No user found with this email address.');
    } else {
      setError('Please enter a valid email address.');
    }

    setIsLoading(false); // Set loading state back to false
  };

  // JSX structure and styling copied from the provided LoginForm example
  return (
    // Main container: Full height, flex layout, white background, padding
    <div className="flex h-screen w-full bg-white md:p-8 font-sans transition-all duration-300 border-black">
      {' '}
      {/* Assuming full screen height, adjust 'h-screen' if needed */}
      {/* Form Side (Left): Half width, dark red background, centered content */}
      <div className="w-full md:w-1/2 bg-red-800 flex justify-center items-center h-full rounded-lg md:rounded-r-none transition-all">
        {' '}
        {/* Added responsive width and rounded corners */}
        {/* Form Content Wrapper: Max width for form, padding */}
        <div className="w-full max-w-md px-8 py-10 transition-all">
          {' '}
          {/* Added vertical padding */}
          {/* Form Title */}
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {' '}
            {/* Centered title */}
            Forgot Password
          </h2>
          {/* Instructions */}
          <p className="text-center text-gray-200 mb-6">
            Enter the email address associated with your account, and we'll send
            you a link to reset your password.
          </p>
          {/* Form Element */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {' '}
            {/* Increased spacing */}
            {/* Email Input Group */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200 mb-2" /* Lighter text for label */
              >
                Email Address
              </label>
              <input
                id="email"
                name="email" // Added name attribute
                type="email"
                autoComplete="email" // Added autocomplete
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" // More specific placeholder
                required
                disabled={isLoading}
                // Input styling: white background, full width, padding, border, rounded corners, focus ring
                className="text-black w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
            {/* Success Message Area */}
            {message && (
              <p className="text-sm text-green-300 bg-green-900 bg-opacity-50 p-3 rounded-md text-center">
                {message}
              </p>
            )}
            {/* Error Message Area */}
            {error && (
              <p className="text-sm text-red-300 bg-red-900 bg-opacity-50 p-3 rounded-md text-center">
                {error}
              </p>
            )}
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              // Button styling: full width, padding, red background, hover effect, white text, rounded corners, transition
              className={`w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition duration-300 ease-in-out ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            {/* Back to Login Link */}
            <div className="text-center mt-6">
              {' '}
              {/* Increased top margin */}
              <Link
                href="/login" // Make sure this path is correct for your routing
                className="text-sm text-gray-200 hover:text-white hover:underline"
              >
                Remembered your password? Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
      {/* Welcome/Info Side (Right): Half width, slightly lighter red, centered content, hidden on smaller screens */}
      <div className="hidden md:flex w-1/2 bg-red-700 flex-col justify-center items-center p-12 rounded-r-lg transition-all">
        {' '}
        {/* Added responsive display and rounded corners */}
        <div className="max-w-md text-center">
          {/* Welcome Heading */}
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            {' '}
            {/* Adjusted leading */}
            Need to Reset Your Password?
          </h1>
          {/* Welcome Text */}
          <p className="text-lg text-gray-100">
            {' '}
            {/* Slightly lighter text */}
            No worries! Just enter your email on the left, and we'll help you
            get back into your Sagip Pilipinas account quickly.
          </p>
          {/* Optional: Add an icon or image here */}
          {/* <svg ... > */}
        </div>
      </div>
    </div>
  );
}
