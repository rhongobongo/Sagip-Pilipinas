"use client";

import { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "@/lib/Firebase/Firebase";
import Link from 'next/link';

const auth = getAuth(app);

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox (and spam folder).');
      setEmail('');
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      if (err.code === 'auth/user-not-found') {
        setError('No user found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to send password reset email. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main container: Full height, flex layout, white background, padding
    <div className="flex h-screen w-full bg-white md:p-8 font-sans transition-all duration-300 border-black">
      
      <div className="w-full md:w-1/2 bg-red-800 flex justify-center items-center h-full rounded-lg md:rounded-r-none transition-all">
       
        <div className="w-full max-w-md px-8 py-10 transition-all">
         
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Forgot Password
          </h2>
        
          <p className="text-center text-gray-200 mb-6">
            Enter the email address associated with your account, and we&apos;ll
            send you a link to reset your password.
          </p>
         
          <form onSubmit={handleSubmit} className="space-y-5">
           
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="text-black w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
            {/* Success Message Area */}
            {message && (
              <p className="text-sm text-green-300 bg-green-900 bg-opacity-50 p-3 rounded-md text-center">
                {message}
              </p>
            )}
           
            {error && (
              <p className="text-sm text-red-300 bg-red-900 bg-opacity-50 p-3 rounded-md text-center">
                {error}
              </p>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition duration-300 ease-in-out ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="text-center mt-6">
              <Link
                href="/login"
                className="text-sm text-gray-200 hover:text-white hover:underline"
              >
                Remembered your password? Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
      {/* Welcome/Info Side (Right): */}
      <div className="hidden md:flex w-1/2 bg-red-700 flex-col justify-center items-center p-12 rounded-r-lg transition-all">
        <div className="max-w-md text-center">
          
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Need to Reset Your Password?
          </h1>
          
          <p className="text-lg text-gray-100">
            No worries! Just enter your email on the left, and we&apos;ll help
            you get back into your Sagip Pilipinas account quickly.
          </p>
        </div>
      </div>
    </div>
  );
}