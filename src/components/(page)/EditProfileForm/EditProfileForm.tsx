// ./src/components/(page)/EditProfileForm/EditProfileForm.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { getProfileData } from '@/actions/profileActions';
// Import the function to fetch organizations (adjust path if necessary)
import { fetchOrganizations } from '@/lib/APICalls/Organizations/fetchOrganization';
import OrganizationProfileForm, {
  OrganizationProfile,
} from './OrganizationProfileForm'; // <-- IMPORT OrganizationProfile
import VolunteerProfileForm, { VolunteerProfile } from './VolunteerProfileForm'; // <-- IMPORT VolunteerProfile

type UserType = 'volunteer' | 'organization' | 'unknown';

// Define a type for the organization list items
interface OrganizationOption {
  id: string;
  name: string;
}

interface EditProfileFormProps {
  userId: string;
  // organizations prop is no longer needed here, it will be fetched internally
}

// Define a union type for the profile state
type ProfileData = OrganizationProfile | VolunteerProfile;

export default function EditProfileForm({ userId }: EditProfileFormProps) {
  const [userType, setUserType] = useState<UserType>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  // Add state for the organizations list
  const [organizationsList, setOrganizationsList] = useState<OrganizationOption[]>([]);

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
        // Fetch profile data and organizations list concurrently
        const [profileResult, fetchedOrganizations] = await Promise.all([
          getProfileData(userId),
          // Fetch organizations - assumes fetchOrganizations returns { id: string; name: string; ... }[]
          // Adjust mapping if your fetchOrganizations function returns a different structure
          fetchOrganizations().then(orgs => orgs.map(org => ({ id: org.userId, name: org.name }))),
        ]);

        // Set organizations list state
        setOrganizationsList(fetchedOrganizations || []);

        // Process profile data result
        if (profileResult.error) {
          setError(profileResult.error);
          setProfile(null);
          setUserType('unknown');
        } else if (profileResult.profile) {
          const fetchedProfile = profileResult.profile as ProfileData; // Keep initial assertion

          // Create base defaults common to both or potentially existing on both
          // Initialize profileWithDefaults using fetchedProfile, which is still ProfileData
          let profileWithDefaults: ProfileData = {
            ...fetchedProfile,
            socialMedia: fetchedProfile.socialMedia || {},
            profileImageUrl: fetchedProfile.profileImageUrl || undefined,
            // Do NOT add skills here directly as fetchedProfile might be OrganizationProfile
          };

          // --- FIX: Conditionally handle 'skills' based on userType ---
          if (profileResult.userType === 'volunteer') {
            // Cast to VolunteerProfile SINCE we checked the type
            const volunteerProfile = profileWithDefaults as VolunteerProfile;
            // Ensure skills is an array or default to empty array
            volunteerProfile.skills = volunteerProfile.skills && Array.isArray(volunteerProfile.skills)
              ? volunteerProfile.skills
              : [];
            // Update the main variable after ensuring skills is correct type
            profileWithDefaults = volunteerProfile;
          }
          // --- END FIX ---

          // Now set the potentially modified profileWithDefaults to state
          setProfile(profileWithDefaults);
          setUserType(profileResult.userType as UserType); // Assert userType as well if needed

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
        setOrganizationsList([]); // Reset org list on error too
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }

  // Display error if profile fetch failed, even if org fetch succeeded
  if (error && !profile) {
    return (
      <div className="p-4 text-red-500">Error loading profile: {error}</div>
    );
  }

  // Display error if only org fetch failed but profile loaded (optional)
  if (profile && organizationsList.length === 0 && userType === 'volunteer') {
      // You might want to show a warning or allow proceeding without affiliation change
      console.warn("Organizations list could not be loaded.");
  }


  return (
    <div className="max-w-4xl mx-auto">
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
          organizations={organizationsList} // Pass the fetched organizations list
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