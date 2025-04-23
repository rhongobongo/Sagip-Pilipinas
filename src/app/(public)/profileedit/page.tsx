// src/app/profile/edit/page.tsx
'use client'; // This page uses hooks for auth state
import React from 'react';
import EditProfileForm from '@/components/(page)/EditProfileForm/EditProfileForm';
import { auth } from '@/lib/Firebase/Firebase'; // Update this path to match your firebase.ts location
import { onAuthStateChanged } from 'firebase/auth';

// Real Firebase Auth hook
const useAuth = () => {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
      setLoadingAuth(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  return { userId, loadingAuth };
};

export default function EditProfilePage() {
  const { userId, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <div>Loading authentication state...</div>;
  }

  if (!userId) {
    return <div>Please log in to edit your profile.</div>;
  }

  return (
    <div className="bg-white text-black" style={{ padding: '20px' }}>
      <h1>Edit Your Profile</h1>
      <p>User ID: {userId}</p>
      <hr className="border-red-400" style={{ margin: '20px 0' }} />
      <EditProfileForm userId={userId} />
    </div>
  );
}
