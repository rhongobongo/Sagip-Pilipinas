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
    <div className="flex min-h-screen bg-white">
      {/* Form Side */}
      <div className="w-1/2 bg-red-800 flex justify-center items-center">
        <div className="w-full max-w-md px-8">
          <h2 className="text-2xl font-bold text-white mb-6">Forgot Password</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              />
            </div>

            {message && <p className="text-sm text-green-300 text-center">{message}</p>}
            {error && <p className="text-sm text-red-300 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md"
            >
              Reset Password
            </button>

            <div className="text-center mt-2">
              <Link href="/login" className="text-sm text-white hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Welcome Side */}
      <div className="w-1/2 bg-red-700 flex flex-col justify-center items-center p-8">
        <div className="max-w-lg text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            WELCOME!
          </h1>
          <p className="text-xl text-white">
            Together, we stand strong. Welcome to Sagip Pilipinas, where every act of kindness makes a difference.
          </p>
        </div>
      </div>
    </div>
  );
}