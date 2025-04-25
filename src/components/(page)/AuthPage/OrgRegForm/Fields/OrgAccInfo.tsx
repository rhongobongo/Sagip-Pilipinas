'use client';

import { useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useOrgRegForm } from '../OrgRegFormContext';

const OrgAccInfo = () => {
  const { formData, setFormData } = useOrgRegForm();
  const [showMainPassword, setShowMainPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState('');

  const toggleMainPasswordVisibility = () =>
    setShowMainPassword((prev) => !prev);
  const toggleRetypePasswordVisibility = () =>
    setShowRetypePassword((prev) => !prev);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (formData.password !== formData.retypePassword) {
      setPasswordMatchError('Passwords do not match');
    } else {
      setPasswordMatchError('');
    }
  }, [formData.password, formData.retypePassword]);

  return (
    <div className="w-full">
      <div className="relative mb-[-1rem] z-10 w-fit">
        <label
          htmlFor="accountDetails"
          className="font-bold bg-white rounded-3xl px-4 py-1 border-2 border-[#ef8080]"
        >
          Account Details: <span className="text-red-500">*</span>
        </label>
      </div>
      <div
        id="accountDetails"
        className="flex flex-col md:flex-row justify-center bg-white w-full text-black shadow-lg border-2 border-[#ef8080] rounded-lg p-6 pt-8 gap-4 md:gap-8"
      >
        {/* Username Field */}
        <div className="w-full">
          <label
            htmlFor="acctUsername"
            className="block text-sm font-medium mb-1"
          >
            Account Username:{' '}
            <label htmlFor="min6Charcters" className="text-xs opacity-50">
              *min 6 characters
            </label>
          </label>
          <input
            id="acctUsername"
            className="textbox w-full"
            type="text"
            name="acctUsername"
            value={formData.acctUsername}
            onChange={handleInputChange}
            required
            minLength={6}
            autoComplete="username"
          />
        </div>

        {/* Password Field */}
        <div className="w-full relative">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Account Password:{' '}
            <label htmlFor="min6Charcters" className="text-xs opacity-50">
              *min 6 characters
            </label>
          </label>
          <input
            id="password"
            type={showMainPassword ? 'text' : 'password'}
            className="textbox w-full pr-10"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={toggleMainPasswordVisibility}
            className="absolute inset-y-0 right-0 top-5 pr-3 flex items-center text-gray-600 hover:text-gray-800"
            aria-label={showMainPassword ? 'Hide password' : 'Show password'}
          >
            {showMainPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        {/* Retype Password Field */}
        <div className="w-full relative">
          <label
            htmlFor="retypePassword"
            className="block text-sm font-medium mb-1"
          >
            Retype Password:
          </label>
          <input
            id="retypePassword"
            type={showRetypePassword ? 'text' : 'password'}
            className="textbox w-full pr-10"
            name="retypePassword"
            value={formData.retypePassword}
            onChange={handleInputChange}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={toggleRetypePasswordVisibility}
            className="absolute inset-y-0 right-0 top-5 pr-3 flex items-center text-gray-600 hover:text-gray-800"
            aria-label={showRetypePassword ? 'Hide password' : 'Show password'}
          >
            {showRetypePassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>
      </div>
      {passwordMatchError && (
        <p className="text-red-500 text-sm mt-1">{passwordMatchError}</p>
      )}
    </div>
  );
};

export default OrgAccInfo;
