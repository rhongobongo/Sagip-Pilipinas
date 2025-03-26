'use client';

import { auth, createUserWithEmailAndPassword } from '@/lib/Firebase/Firebase';
import { loginWithCredentials } from '@/lib/APICalls/Auth/login';
import OrgRegistrationForm from './OrganizationRegistrationForm';
import VolRegistrationForm from './VolunteerRegistrationForm';
import React, { useState } from 'react';

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
    <div className="flex items-center justify-center bg-white">
      <div className="max-w-[1600px] h-screen py-8 ">
        {!showVolunteerForm && !showOrganizationForm && (
          <h1 className="text-black flex justify-center text-2xl font-bold">
            Join us now!
          </h1>
        )}
        {!showVolunteerForm && !showOrganizationForm && (
          <div className="flex flex-grow-0 flex-shrink-0 gap-4 mt-4 mb-4 rounded-sm   ">
            <div className="w-full">
              <label className="flex justify-center items-center">
                Volunteer
              </label>
              <button
                type="submit"
                className="w-full p-2 bg-red-500 text-white rounded-md hover:opacity-90 focus:outline-none mt-4"
                onClick={() => handleInitialSubmit('volunteer')}
              >
                <img src="/home-image/image1.jpg" alt="" />
              </button>
            </div>
            <div className="w-full">
              <label className="flex justify-center items-center">
                Organization
              </label>
              <button
                type="submit"
                className="w-full p-2 bg-red-500 text-white rounded-md hover:opacity-90 focus:outline-none mt-4"
                onClick={() => handleInitialSubmit('organization')}
              >
                <img src="/home-image/image9.jpg" alt="" className="w-full" />
              </button>
            </div>
          </div>
        )}
        {!showVolunteerForm && !showOrganizationForm && (
          <>
            <h2 className="text-black flex justify-center">
              Already have an account?
            </h2>
            <div className="flex gap-4 mt-4">
              <button
                type="submit" // Keep these as submit if they navigate to a login route
                className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
              >
                Login as Volunteer
              </button>
              <button
                type="submit" // Keep these as submit if they navigate to a login route
                className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
              >
                Login as Organization
              </button>
            </div>
          </>
        )}
      </div>
      {showVolunteerForm && <VolRegistrationForm />}
      {showOrganizationForm && <OrgRegistrationForm />}
    </div>
  );
};

// Random Shiet
export default RegistrationForm;
