'use client';

// 1. Import useRef
import React, { useState, useRef } from 'react';
import Link from 'next/link';

import { auth, createUserWithEmailAndPassword } from '@/lib/Firebase/Firebase';
import { loginWithCredentials } from '@/lib/APICalls/Auth/login';
// Make sure these paths are correct
import OrgRegistrationForm from './OrganizationRegistrationForm';
import VolRegistrationForm from './VolunteerRegistrationForm';
import OrgRegFormContainer from './OrgRegForm/OrgRegFormContainer'; // Using this one for Org

const RegistrationForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showOrganizationForm, setShowOrganizationForm] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  // 2. Create a Ref for the form container
  const formContainerRef = useRef<HTMLDivElement>(null);

  // --- (setUpAccountInFireStore and handleSubmit remain the same) ---
  const setUpAccountInFireStore = async (idToken: string) => {
    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        // Consider adding body if your API expects it
        // body: JSON.stringify({ userType: clickedButton }) // Example if needed
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to set up account in Firestore'
        );
      }
      console.log('Account setup successful in Firestore.');
    } catch (e: any) {
      // Catch specific error types if possible
      console.error('Error in setUpAccountInFireStore:', e.message || e);
      // Optionally re-throw or handle the error (e.g., show message to user)
    }
  };

  // --- End of unchanged functions ---

  const handleInitialSubmit = (userType: 'volunteer' | 'organization') => {
    setClickedButton(userType); // Set clicked button visual state

    // Update state to show the correct form
    if (userType === 'volunteer') {
      setShowVolunteerForm(true);
      setShowOrganizationForm(false);
    } else if (userType === 'organization') {
      setShowOrganizationForm(true);
      setShowVolunteerForm(false);
    }

    // 4. Implement Scrolling
    // Use setTimeout to wait for the state update and DOM to potentially re-render
    setTimeout(() => {
      if (formContainerRef.current) {
        formContainerRef.current.scrollIntoView({
          behavior: 'smooth', // Make it a smooth scroll
          block: 'start', // Align the top of the form container to the top of the viewport
        });
      }
    }, 0); // Delay of 0ms is usually sufficient
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black transition-all duration-300">
      {/* Adjusted padding and max-width */}
      <div className="max-w-[1600px] w-full px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
        <h1 className="flex justify-center text-2xl md:text-3xl font-bold text-center">
          Join us now!
        </h1>
        {/* Made text responsive and centered */}
        <h2 className="flex justify-center text-center text-sm md:text-base pb-4 w-full md:w-4/5 mx-auto mt-2">
          Sign up as an organization and help by providing services and goods,
          or as a volunteer and do voluntary work when help is needed.
        </h2>
        {/* Main content row */}
        <div className="flex flex-col md:flex-row w-full mx-auto items-center justify-center gap-4 md:gap-8">
          {/* Left Image (visible on medium screens and up) */}
          <div className="w-1/4 hidden md:flex items-center justify-center">
            <img
              src="/Register1.svg"
              alt="Illustration for Organization Registration"
              className={`w-full transition-all duration-300 ${
                hoveredButton === 'organization' ||
                clickedButton === 'organization'
                  ? 'opacity-100 blur-none'
                  : 'opacity-70 blur-sm' // Use opacity and smaller blur
              }`}
            />
          </div>

          {/* Central Form/Button Container */}
          {/* Adjusted width and padding */}
          <div className="bg-[#8F0022] text-white p-6 sm:p-8 rounded-2xl md:rounded-3xl w-full md:w-1/2 lg:w-1/3">
            <h1 className="text-lg font-semibold mb-4 text-center md:text-left">
              REGISTER AS:
            </h1>
            {/* Button Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full">
              {/* Organization Button */}
              <div className="w-full flex items-center justify-center">
                {/* Reduced max-width slightly for better fit */}
                <button
                  type="button" // Changed to type="button" as it doesn't submit a form here
                  // Consolidated styles, added focus-visible ring
                  className={`w-full max-w-[14rem] p-3 bg-white text-black rounded-lg hover:text-white hover:bg-[#D80D3C] transition-all duration-300 ease-in-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_5px_0_rgba(0,0,0,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white ${clickedButton === 'organization' ? 'ring-2 ring-white ring-offset-2 ring-offset-[#8F0022]' : ''}`} // Highlight if clicked
                  onClick={() => handleInitialSubmit('organization')}
                  onMouseEnter={() => setHoveredButton('organization')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <img
                    src="/Organization.svg"
                    alt="Register as Organization"
                    className="w-full mb-2"
                  />
                  {/* Responsive text */}
                  <span className="text-xs sm:text-sm md:text-base font-semibold block text-center">
                    ORGANIZATION
                  </span>
                </button>
              </div>
              {/* Volunteer Button */}
              <div className="w-full flex items-center justify-center">
                <button
                  type="button" // Changed type
                  className={`w-full max-w-[14rem] p-3 bg-white text-black rounded-lg hover:text-white hover:bg-[#D80D3C] transition-all duration-300 ease-in-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[5px_5px_5px_0_rgba(0,0,0,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white ${clickedButton === 'volunteer' ? 'ring-2 ring-white ring-offset-2 ring-offset-[#8F0022]' : ''}`} // Highlight if clicked
                  onClick={() => handleInitialSubmit('volunteer')}
                  onMouseEnter={() => setHoveredButton('volunteer')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <img
                    src="/Volunteer.svg"
                    alt="Register as Volunteer"
                    className="w-full mb-2"
                  />
                  <span className="text-xs sm:text-sm md:text-base font-semibold block text-center">
                    VOLUNTEER
                  </span>
                </button>
              </div>
            </div>
            {/* Login Link */}
            <h2 className="text-xs sm:text-sm md:text-base flex justify-center w-full">
              Already have an account?
              <Link
                href="/login"
                className="underline pl-1 hover:text-gray-300"
              >
                Login here
              </Link>
            </h2>
          </div>

          {/* Right Image (visible on medium screens and up) */}
          <div className="w-1/4 hidden md:flex items-center justify-center">
            <img
              src="/Register2.svg"
              alt="Illustration for Volunteer Registration"
              className={`w-full transition-all duration-300 ${
                hoveredButton === 'volunteer' || clickedButton === 'volunteer'
                  ? 'opacity-100 blur-none'
                  : 'opacity-70 blur-sm'
              }`}
            />
          </div>
        </div>{' '}
        {/* End Main content row */}
        {/* Form Container - Added padding-top */}
        {/* 3. Attach the Ref here */}
        <div
          ref={formContainerRef}
          className="flex justify-center pt-12 md:pt-16 w-full"
        >
          {/* Conditionally rendered forms */}
          {showVolunteerForm && <VolRegistrationForm />}
          {showOrganizationForm && <OrgRegFormContainer />}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
