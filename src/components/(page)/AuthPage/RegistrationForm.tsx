'use client';

import Link from 'next/link';

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
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<string | null>(null);

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
    setClickedButton(userType); // Set clicked button

    if (userType === 'volunteer') {
      setShowVolunteerForm(true);
      setShowOrganizationForm(false);
    } else if (userType === 'organization') {
      setShowOrganizationForm(true);
      setShowVolunteerForm(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-white text-black">
      <div className="max-w-[1600px] h-full py-8 ">
        <h1 className="flex justify-center text-2xl font-bold">Join us now!</h1>
        <h2 className="flex justify-center pb-4">
          Sign up as an organization and help by providing services and goods,
          or as a volunteer and do voluntary work when help is needed
        </h2>
        <div className="flex flex-grow-0 flex-shrink-0 w-full">
          <div className="w-auto flex align-center">
            <img
              src="/Register1.svg"
              className={`w-full transition-all duration-300 ${
                hoveredButton === 'organization' ||
                clickedButton === 'organization'
                  ? 'blur-none'
                  : 'blur-md'
              }`}
            />
          </div>
          <div className="bg-[#8F0022] text-white p-7 rounded-3xl w-1/2">
            <div className="flex flex-col">
              <h1>REGISTER AS:</h1>
            </div>
            <div className="flex gap-4 mt-4 mb-4 w-full ">
              <div className="w-full">
                <button
                  type="submit"
                  className="w-full max-w-[18.5rem] h-full max-h-[18.75rem] p-4 bg-white text-black rounded-md hover:text-white hover:bg-[#D80D3C] hover:transition-all hover:duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_5px_0_rgba(0,0,0,4)] bg-focus:outline-none mt-4"
                  onClick={() => handleInitialSubmit('organization')}
                  onMouseEnter={() => setHoveredButton('organization')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <img src="/ORGANIZATION.svg" alt="" className="w-full" />
                  <h1 className="font-[550] font-inter">ORGANIZATION</h1>
                </button>
              </div>
              <div className="w-full">
                <button
                  type="submit"
                  className="w-full max-w-[18.5rem] h-full max-h-[18.75rem] p-4 bg-white text-black rounded-md hover:text-white hover:bg-[#D80D3C] hover:transition-all hover:duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_5px_0_rgba(0,0,0,4)] bg-focus:outline-none mt-4"
                  onClick={() => handleInitialSubmit('volunteer')}
                  onMouseEnter={() => setHoveredButton('volunteer')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <img src="/VOLUNTEER.svg" alt="" className="w-full" />
                  <h1 className="font-[550] font-inter">VOLUNTEER</h1>
                </button>
              </div>
            </div>
            <h2 className=" flex justify-center">
              Already have an account?
              <Link href="/login" className="underline pl-1">
                Login in here
              </Link>
            </h2>
          </div>

          <div className="w-auto flex align-center">
            <img
              src="/Register2.svg"
              className={`w-full transition-all duration-300 ${
                hoveredButton === 'volunteer' || clickedButton === 'volunteer'
                  ? 'blur-none'
                  : 'blur-md'
              }`}
            />
          </div>
        </div>
        <div className="flex justify-center pt-8">
          {showVolunteerForm && <VolRegistrationForm />}
          {showOrganizationForm && <OrgRegistrationForm />}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
