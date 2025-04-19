// Example Path: src/app/login/page.tsx OR wherever your login page route resides

'use client';

import {
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
} from '@/lib/Firebase/Firebase'; // Assuming firebase setup path
import { loginWithCredentials } from '@/lib/APICalls/Auth/login'; // Assuming login API call path
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link'; // Import Link from next/link

// --- LoginForm Component (exactly as you provided) ---
const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLoginSuccess = async (idToken: string) => {
    try {
      await loginWithCredentials(idToken);
      toast.success('Login Successful! Redirecting...', { duration: 2000 });
      setTimeout(() => {
        // Consider a more robust redirect or state update instead of reload
        // For SPA feel, use router.push('/') or state management update
        document.location.reload(); // Or router.push('/');
      }, 1000);
      // router.push('/'); // Redirect might happen before reload completes
    } catch (backendError) {
      console.error('Backend login error:', backendError);
      let backendErrorMessage = 'Login failed during server verification.';
      if (backendError instanceof Error) {
        backendErrorMessage = backendError.message;
      }
      setError(backendErrorMessage);
      // It's important to re-throw or handle appropriately so the calling code knows about the failure
      throw backendError;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const loadingToastId = toast.loading('Logging in...');

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();
      await handleLoginSuccess(token); // Call success handler
      toast.dismiss(loadingToastId); // Dismiss loading toast *after* success logic
    } catch (error) {
      toast.dismiss(loadingToastId); // Dismiss loading on error
      console.error('Login error:', error); // More generic log
      let errorMessage = 'Login failed. Please check credentials.';

      // Firebase specific error handling
      if (error instanceof Error && 'code' in error) {
        const errorCode = (error as { code: string }).code;
        if (
          errorCode === 'auth/user-not-found' ||
          errorCode === 'auth/wrong-password' ||
          errorCode === 'auth/invalid-credential'
        ) {
          errorMessage = 'Invalid email or password.';
        } else if (errorCode === 'auth/invalid-email') {
          errorMessage = 'Invalid email format.';
        } else if (errorCode === 'auth/too-many-requests') {
          errorMessage =
            'Access temporarily disabled due to too many failed attempts. Please try again later.';
        }
        // Don't overwrite with generic message if it came from handleLoginSuccess
        else if (
          error.message.startsWith('Login failed during server verification')
        ) {
          errorMessage = error.message; // Keep the specific backend error
        }
      } else if (error instanceof Error) {
        // Catch errors potentially thrown from handleLoginSuccess
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      // Short delay to allow visual feedback even on fast errors/successes
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  return (
    // Note: Toaster is now likely outside this component in the main page/layout<>
    <div className="h-full md:h-full w-full max-w-sm bg-gradient-to-r from-[#480011] via-[#71001B] to-[#AE0029] p-6 rounded-lg shadow-xl backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center text-white md:hidden text-center mb-8">
        <h1 className="text-2xl lg:text-6xl font-bold mb-4 text-shadow-md underline">
          WELCOME!
        </h1>{' '}
        {/* Added text shadow */}
        <p className="text-lg lg:text-xl max-w-md text-shadow text-justify">
          {' '}
          {/* Added text shadow */}
          Together, we stand strong. Welcome to Sagip Pilipinas, where every act
          of kindness makes a difference.
        </p>
      </div>
      <h2 className="text-2xl font-semibold text-center mb-6 text-white">
        Login
      </h2>
      {/* Inline error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        {/* Password Input */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-white mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        {/* Forgot Password Link */}
        <div className="mb-4 text-right">
          <Link 
            href="/forgot-password" 
            className="text-sm text-white hover:text-red-200 underline focus:outline-none"
          >
            Forgot Password?
          </Link>
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition duration-150 ease-in-out ${
            isLoading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-[#E50036] hover:bg-[#c2002d]' // Using specific red
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-white">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-white underline hover:text-red-200"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

// --- Page Component integrating LoginForm and Background ---
const LoginPage: React.FC = () => {
  return (
    <>
      {/* Place Toaster here for page-specific notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Background Container */}
      <div className="relative min-h-screen w-full overflow-hidden  bg-[#870020]">
        {' '}
        {/* Darker Base */}
        {/* Diagonal Shape Layer */}
        <div
          className="absolute inset-0 bg-white [clip-path:polygon(0%_0%,_100%_0%,_0%_100%,_0%_100%)] md:[clip-path:polygon(0%_0%,_60%_0%,_40%_100%,_0%_100%)]"
          // Adjust 65% and 35% to get the desired angle/position
        ></div>
        {/* Content Layer */}
        <div className="min-w-full relative z-10 flex min-h-screen items-center justify-center md:justify-around md:w-full p-4 md:p-8">
          {/* Grid for Layout (adjust columns/gap as needed) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 w-full max-w-6xl">
            {/* Login Form Column */}

            <div className="flex items-center justify-center md:justify-end md:mr-12">
              <LoginForm /> {/* Embed the LoginForm component */}
            </div>

            {/* Welcome Text Column */}
            <div className=" hidden md:flex flex-col items-end justify-center md:text-white text-left">
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-shadow-md underline">
                WELCOME!
              </h1>{' '}
              {/* Added text shadow */}
              <p className="w-full text-lg lg:text-xl max-w-md text-shadow text-justify">
                {' '}
                {/* Added text shadow */}
                Together, we stand strong. Welcome to Sagip Pilipinas, where
                every act of kindness makes a difference.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

// Optional: Add simple text-shadow utility if needed in your globals.css
/*
@layer utilities {
  .text-shadow {
    text-shadow: 0 1px 3px rgb(0 0 0 / 0.4);
  }
  .text-shadow-md {
    text-shadow: 0 2px 5px rgb(0 0 0 / 0.4);
  }
}
*/