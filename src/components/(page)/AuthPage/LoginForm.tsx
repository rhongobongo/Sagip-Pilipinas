
"use client";

import {
    auth,
    signInWithEmailAndPassword,
    signInWithPopup,
    googleProvider
} from '@/lib/Firebase/Firebase'; 

import { loginWithCredentials } from '@/lib/APICalls/Auth/login';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter(); // Initialize router

    const handleLoginSuccess = async (idToken: string) => {
        try {
          
            await loginWithCredentials(idToken);

            toast.success('Login Successful! Redirecting...', { duration: 2000 });

            setTimeout(() => {
                
                router.push('/dashboard');
              
            }, 1500);

        } catch (backendError) {
             
            console.error("Backend login error:", backendError);
            let backendErrorMessage = "Login failed during server verification.";
            if (backendError instanceof Error) {
                backendErrorMessage = backendError.message;
            }
            setError(backendErrorMessage);
            throw backendError; 
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        const loadingToastId = toast.loading('Logging in...'); // Show loading toast

        try {
           
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            await handleLoginSuccess(token);
             toast.dismiss(loadingToastId); 

        } catch (error) {
             toast.dismiss(loadingToastId); 
            console.error("Firebase login error:", error); 
            let errorMessage = "Login failed. Please try again.";

            if (error instanceof Error && 'code' in error) {
                const errorCode = (error as { code: string }).code;

                if (errorCode === 'auth/user-not-found' ||
                    errorCode === 'auth/wrong-password' ||
                    errorCode === 'auth/invalid-credential' 
                   ) {
                    errorMessage = "Invalid email or password.";
                } else if (errorCode === 'auth/invalid-email') {
                    errorMessage = "Invalid email format.";
                } else if (errorCode === 'auth/too-many-requests') {
                    errorMessage = "Access temporarily disabled due to too many failed attempts. Please try again later.";
                }
                 
                 else if (!error.message.startsWith("Login failed during server verification")) {

                     errorMessage = (error as Error).message;
                 }
            } else if (error instanceof Error) {
               
                 errorMessage = error.message;
            }

            setError(errorMessage); // Set error state to display in the form
            toast.error(errorMessage); // Also show error toast

        } finally {
            
            setTimeout(() => setIsLoading(false), 500);
        }
    }

    const handleGoogleSignIn = async () => {
        setError("");
        setIsLoading(true);
         const loadingToastId = toast.loading('Signing in with Google...'); // Show loading toast

        try {
            // 1. Sign in with Google Popup
            const userCredential = await signInWithPopup(auth, googleProvider);
            const token = await userCredential.user.getIdToken();

            // 2. Handle backend session creation and redirect
            await handleLoginSuccess(token);
            toast.dismiss(loadingToastId); // Dismiss loading on success

        } catch (error) {
            toast.dismiss(loadingToastId); // Dismiss loading on error
            console.error("Error during Google sign-in:", error);

             let errorMessage = "Google sign-in failed. Please try again.";
              if (error instanceof Error && 'code' in error) {
                 const errorCode = (error as { code: string }).code;
                 if (errorCode === 'auth/popup-closed-by-user') {
                     errorMessage = "Sign-in cancelled.";
                 } else if (errorCode === 'auth/account-exists-with-different-credential') {
                     errorMessage = "An account already exists with the same email address using a different sign-in method.";
                 }
                  // Keep generic message for errors from handleLoginSuccess (backend)
                 else if (!error.message.startsWith("Login failed during server verification")) {
                     errorMessage = (error as Error).message; // Use Firebase error message
                 }
             } else if (error instanceof Error) {
                 errorMessage = error.message; // Use message from handleLoginSuccess if thrown
             }

            setError(errorMessage);
            toast.error(errorMessage);

        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    return (
        <> {/* Use Fragment to include Toaster */}
            {/* Place Toaster here or in your main layout file */}
            <Toaster position="top-center" reverseOrder={false} />

            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4"> {/* Added min-h-screen and padding */}
                <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Login</h2> {/* Adjusted text color */}

                    {/* Keep inline error display for form validation feedback */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md"> {/* Made text smaller */}
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email} // Control input value
                                placeholder="Enter your email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading} // Disable input while loading
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password} // Control input value
                                placeholder="Enter your password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading} // Disable input while loading
                            />
                             
                        </div>

                        <button
                            type="submit"
                             className={`w-full py-2 px-4 rounded-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
                                isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                             }`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">OR</p>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                         className={`w-full mt-4 flex items-center justify-center px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out ${
                            isLoading
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-blue-400'
                         }`}
                        disabled={isLoading}
                    >
                        {/* SVG remains same */}
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.17 0 5.99 1.11 8.21 2.94l6.14-6.14C34.1 3.67 29.3 1.5 24 1.5 14.95 1.5 7.38 7.7 4.42 16.17l7.37 5.72C13.45 14.77 18.3 9.5 24 9.5z"/>
                            <path fill="#34A853" d="M46.61 24.03c0-1.57-.14-3.08-.4-4.54H24v8.59h12.74c-.55 2.77-2.17 5.12-4.58 6.69l7.37 5.72C43.24 36.89 46.61 30.91 46.61 24.03z"/>
                            <path fill="#4A90E2" d="M10.13 28.55l-7.37-5.72c-.76 2.02-1.19 4.2-1.19 6.55 0 2.36.43 4.53 1.19 6.55l7.37-5.72z"/>
                            <path fill="#FBBC05" d="M24 46.5c5.3 0 10.1-1.77 13.96-4.79l-7.37-5.72c-2.12 1.42-4.74 2.25-7.59 2.25-5.7 0-10.55-5.27-12.2-12.19l-7.37 5.72C7.38 40.3 14.95 46.5 24 46.5z"/>
                        </svg>
                        Sign in with Google
                    </button>

                    {/* Optional: Add Sign Up link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <a href="/register" className="font-medium text-blue-600 hover:underline">
                                Sign Up
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginForm;
