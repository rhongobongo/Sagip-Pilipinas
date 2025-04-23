'use client';
import React, { useState, useEffect } from 'react';
import { getProfileData } from '@/actions/profileActions';
import OrganizationProfileForm from './OrganizationProfileForm';
import VolunteerProfileForm from './VolunteerProfileForm';

type UserType = 'volunteer' | 'organization' | 'unknown';

interface EditProfileFormProps {
  userId: string;
  organizations?: { id: string; name: string }[]; // For volunteer org selection
}

export default function EditProfileForm({
  userId,
  organizations = [],
}: EditProfileFormProps) {
  const [userType, setUserType] = useState<UserType>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

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
        const result = await getProfileData(userId);
        if (result.error) {
          setError(result.error);
          setProfile(null);
          setUserType('unknown');
        } else if (result.profile) {
          const profileWithDefaults = {
            ...result.profile,
            socialMedia: result.profile.socialMedia || {},
            profileImageUrl: result.profile.profileImageUrl || undefined,
          };
          
          setProfile(profileWithDefaults);
          setUserType(result.userType);
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

      {profile && userType === 'organization' && (
        <OrganizationProfileForm userId={userId} profile={profile} />
      )}

      {profile && userType === 'volunteer' && (
        <VolunteerProfileForm 
          userId={userId} 
          profile={profile} 
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