// LogoutButton.tsx (Client Component)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CustomError {
  message: string;
  code?: number;
}

const LogoutButton = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout'); // Call your server-side logout endpoint
      if (response.ok) {
        router.push('/');
        document.location.reload();
      } else {
        console.error('Server-side logout failed');
        // Optionally handle the error on the client
      }
    } catch (error) {
      if (typeof error === 'string') {
        console.error('Error during logout (string):', error);
      } else if (error instanceof Error) {
        console.error('Error during logout (Error):', error.message);
      } else {
        console.error('Error during logout (unknown):', error);
      }
    }
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="text-white px-1.5 py-0.5 inline-block text-lg font-extralight transition-all ease-in-out duration-300 hover:text-white hover:decoration-white hover:underline hover:decoration-2 hover:underline-offset-8 hover:scale-110 cursor-pointer"
      >
        Log out
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  closeModal();
                  handleLogout();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;