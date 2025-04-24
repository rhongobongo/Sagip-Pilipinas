// ./src/components/(page)/EditProfileForm/EditProfileForm.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { getProfileData } from '@/actions/profileActions';
import OrganizationProfileForm, { OrganizationProfile } from './OrganizationProfileForm'; // <-- IMPORT OrganizationProfile
import VolunteerProfileForm, { VolunteerProfile } from './VolunteerProfileForm';       // <-- IMPORT VolunteerProfile

type UserType = 'volunteer' | 'organization' | 'unknown';

interface EditProfileFormProps {
  userId: string;
  organizations?: { id: string; name: string }[]; // For volunteer org selection
}

// Define a union type for the profile state
type ProfileData = OrganizationProfile | VolunteerProfile; // <-- Define a union type

export default function EditProfileForm({
  userId,
  organizations = [],
}: EditProfileFormProps) {
  const [userType, setUserType] = useState<UserType>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Use the specific union type instead of 'any'
  const [profile, setProfile] = useState<ProfileData | null>(null); // <-- FIX HERE

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User ID is missing.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Assuming getProfileData returns a profile matching one of the interfaces
        const result = await getProfileData(userId);
        if (result.error) {
          setError(result.error);
          setProfile(null);
          setUserType('unknown');
        } else if (result.profile) {
          // Basic check to ensure profile has necessary fields, adjust as needed
          // TypeScript might still need assertions below depending on getProfileData's return type
          const fetchedProfile = result.profile as ProfileData; // You might need type assertion here

          const profileWithDefaults: ProfileData = { // Ensure this assignment is type-safe
            ...fetchedProfile,
            socialMedia: fetchedProfile.socialMedia || {},
            profileImageUrl: fetchedProfile.profileImageUrl || undefined,
            // Add defaults for any other potentially missing fields defined in the interfaces
          };

          setProfile(profileWithDefaults);
          setUserType(result.userType as UserType); // Assert userType as well if needed
        } else {
          setError('Profile data not found.');
          setProfile(null);
          setUserType('unknown');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching data.');
        console.error(err);
        setProfile(null);
        setUserType('unknown');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }

  if (error && !profile) {
    return (
      <div className="p-4 text-red-500">Error loading profile: {error}</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        Edit{' '}
        {userType === 'volunteer'
          ? 'Volunteer'
          : userType === 'organization'
            ? 'Organization'
            : 'Unknown'}{' '}
        Profile
      </h2>

      {/* TypeScript might still warn here if it can't guarantee the type based on userType */}
      {/* You can use type assertion if confident, but the runtime check is key */}
      {profile && userType === 'organization' && (
        <OrganizationProfileForm
          userId={userId}
          profile={profile as OrganizationProfile} // Type assertion adds clarity
        />
      )}

      {profile && userType === 'volunteer' && (
        <VolunteerProfileForm
          userId={userId}
          profile={profile as VolunteerProfile} // Type assertion adds clarity
          organizations={organizations}
        />
      )}

      {!profile && !isLoading && userType === 'unknown' && !error && (
        <div className="p-4 text-center bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
          Profile data could not be loaded or is unavailable.
        </div>
      )}
    </div>
  );
}