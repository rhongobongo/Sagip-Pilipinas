"use client"

import {
    auth,
    signInWithEmailAndPassword,
    signInWithPopup,
    googleProvider
} from '@/lib/Firebase/Firebase';

import { loginWithCredentials } from '@/lib/APICalls/Auth/login';
import React, {
    useState
} from 'react';

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            await loginWithCredentials(token);
        } catch (error) {
            console.log(error);
            let errorMessage = "Login failed. Please try again.";
            
            if (error instanceof Error && 'code' in error) {
                const errorCode = (error as { code: string }).code;
                
                if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
                    errorMessage = "Invalid email or password.";
                } else if (errorCode === 'auth/invalid-email') {
                    errorMessage = "Invalid email format.";
                } else if (errorCode === 'auth/too-many-requests') {
                    errorMessage = "Too many unsuccessful login attempts. Please try again later.";
                }
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleSignIn = async () => {
        setError("");
        setIsLoading(true);
        
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            const token = await userCredential.user.getIdToken();
            await loginWithCredentials(token);
        } catch (error) {
            console.error("Error during Google sign-in:", error);
            setError("Google sign-in failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
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
                            placeholder="Enter your email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
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
                    className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    disabled={isLoading}
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                    >
                        <path
                            fill="#EA4335"
                            d="M24 9.5c3.17 0 5.99 1.11 8.21 2.94l6.14-6.14C34.1 3.67 29.3 1.5 24 1.5 14.95 1.5 7.38 7.7 4.42 16.17l7.37 5.72C13.45 14.77 18.3 9.5 24 9.5z"
                        />
                        <path
                            fill="#34A853"
                            d="M46.61 24.03c0-1.57-.14-3.08-.4-4.54H24v8.59h12.74c-.55 2.77-2.17 5.12-4.58 6.69l7.37 5.72C43.24 36.89 46.61 30.91 46.61 24.03z"
                        />
                        <path
                            fill="#4A90E2"
                            d="M10.13 28.55l-7.37-5.72c-.76 2.02-1.19 4.2-1.19 6.55 0 2.36.43 4.53 1.19 6.55l7.37-5.72z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M24 46.5c5.3 0 10.1-1.77 13.96-4.79l-7.37-5.72c-2.12 1.42-4.74 2.25-7.59 2.25-5.7 0-10.55-5.27-12.2-12.19l-7.37 5.72C7.38 40.3 14.95 46.5 24 46.5z"
                        />
                    </svg>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default LoginForm;