'use client';

import { auth, createUserWithEmailAndPassword } from '@/lib/Firebase/Firebase';
import { loginWithCredentials } from '@/lib/APICalls/Auth/login';
import OrgRegistrationForm from './OrganizationRegistrationForm';
import VolRegistrationForm from './VolunteerRegistrationForm';
import React, { useState } from 'react';
import Image from 'next/image';

const RegistrationForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showOrganizationForm, setShowOrganizationForm] = useState(false);

  const setUpAccountInFireStore = async (idToken: string) => {
    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }
    } catch (e) {
      console.error('Error in setUpAccountInFireStore:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await loginWithCredentials(await userCredential.user.getIdToken());
      await setUpAccountInFireStore(await userCredential.user.getIdToken());
    } catch (error) {
      console.log(error);
    }
  };

  const handleInitialSubmit = (userType: 'volunteer' | 'organization') => {
    if (userType === 'volunteer') {
      setShowVolunteerForm(true);
      setShowOrganizationForm(false);
    } else if (userType === 'organization') {
      setShowOrganizationForm(true);
      setShowVolunteerForm(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        className="w-[75%] bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        {!showVolunteerForm && !showOrganizationForm && (
          <h1 className="text-black flex justify-center">Join us now!</h1>
        )}
        {!showVolunteerForm && !showOrganizationForm && (
          <div className="flex flex-grow-0 flex-shrink-0 gap-4 mt-4 mb-4 rounded-sm   ">
            <div className="w-full">
              <Image src="/home-image/image9.jpg" alt="" />
              <button
                type="submit"
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none mt-4"
                onClick={() => handleInitialSubmit('volunteer')}
              >
                Volunteer
              </button>
            </div>
            <div className="w-full">
              <Image src="/home-image/image1.jpg" alt="" className="w-full" />
              <button
                type="submit"
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none mt-4"
                onClick={() => handleInitialSubmit('organization')}
              >
                Organization
              </button>
            </div>
          </div>
        )}
        {!showVolunteerForm && !showOrganizationForm && (
          <>
            <h2 className="text-black flex justify-center">
              Already have an account?
            </h2>
            <div className="grid gap-4 mt-4">
              <button
                type="submit" // Keep these as submit if they navigate to a login route
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
              >
                Login as Volunteer
              </button>
              <button
                type="submit" // Keep these as submit if they navigate to a login route
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
              >
                Login as Organization
              </button>
            </div>
          </>
        )}
        {showVolunteerForm && <VolRegistrationForm />}
        {showOrganizationForm && <OrgRegistrationForm />}
      </form>
    </div>
  );
};

export default RegistrationForm;
