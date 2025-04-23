'use client';
import React, { useState, useEffect } from 'react';
import EditProfileForm from '@/components/(page)/EditProfileForm/EditProfileForm'; 
import { auth } from '@/lib/Firebase/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchOrganizations } from '@/lib/APICalls/Organizations/fetchOrganization';

interface OrganizationOption {
  id: string;
  name: string;
}

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

    return () => unsubscribe();
  }, []);

  return { userId, loadingAuth };
};

export default function EditProfilePage() {
  const { userId, loadingAuth } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState<boolean>(false); // Separate loading state for orgs
  const [orgsError, setOrgsError] = useState<string | null>(null); // Separate error state for orgs

  useEffect(() => {
    // Fetch organizations once userId is known (or maybe even fetch regardless of userId?)
    // Decide if you want to fetch orgs even before login, or only after.
    // Fetching after userId confirms user is logged in and might need the list.
    if (userId && !loadingOrgs && organizations.length === 0) {
      setLoadingOrgs(true);
      setOrgsError(null);
      fetchOrganizations()
        .then(organizationsData => {
          const organizationOptions: OrganizationOption[] = Array.isArray(organizationsData)
            ? organizationsData.map(org => ({
                id: org.userId, // Ensure this matches the field name from fetchOrganizations
                name: org.name
              }))
            : [];
          setOrganizations(organizationOptions);
        })
        .catch(err => {
          console.error("Failed to fetch organizations:", err);
          setOrgsError("Could not load organizations list.");
        })
        .finally(() => {
          setLoadingOrgs(false);
        });
    }
    // Add dependencies: re-run if userId changes or if loading state resets
  }, [userId, loadingOrgs, organizations.length]);

  if (loadingAuth || (userId && loadingOrgs)) {
     // Show loading if auth is loading OR if user is logged in and orgs are loading
    return <div>Loading...</div>;
  }

  if (!userId) {
    return <div>Please log in to edit your profile.</div>;
  }

  if (orgsError) {
     return <div className="p-4 text-red-500">Error loading page data: {orgsError}</div>
  }

  return (
    <div className="bg-white text-black" style={{ padding: '20px' }}>
      {/* You can remove these User ID/hr elements if not needed */}
      <p>User ID: {userId}</p>
      <hr className="border-red-400" style={{ margin: '20px 0' }} />

      {/* Pass the fetched organizations down to EditProfileForm */}
      <EditProfileForm userId={userId} organizations={organizations} />
    </div>
  );
}