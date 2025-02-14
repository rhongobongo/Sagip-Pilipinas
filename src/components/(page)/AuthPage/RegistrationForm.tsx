"use client"

import { auth, createUserWithEmailAndPassword } from '@/lib/Firebase/Firebase';
import { loginWithCredentials } from '@/lib/APICalls/Auth/login';
import React, {
    useState
} from 'react';


const RegistrationForm: React.FC = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const setUpAccountInFireStore = async (
        idToken: string,
    ) => {
        try {
            const response = await fetch("/api/registration", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw(errorData);
            }
        } catch (e) {
            console.error("Error in setUpAccountInFireStore:", e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await loginWithCredentials(await userCredential.user.getIdToken());
            await setUpAccountInFireStore(await userCredential.user.getIdToken())

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md"
                onSubmit={handleSubmit}>
                <h2 className="text-2xl font-semibold text-center mb-6">Registration</h2>

                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="submit"
                    className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default RegistrationForm;
