// LogoutButton.tsx (Client Component)
'use client';

import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const router = useRouter();

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
    } catch (error: any) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-white px-1.5 py-0.5 inline-block text-lg font-extralight transition-all ease-in-out duration-300 hover:text-white hover:decoration-white hover:underline hover:decoration-2 hover:underline-offset-8 hover:scale-110 cursor-pointer"
    >
      Log out
    </button>
  );
};

export default LogoutButton;
