/* eslint-disable @next/next/no-img-element */
// src/components/(page)/EditProfilePage/EditProfileForm.tsx
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { getProfileData, updateProfileData } from '@/actions/profileActions';
import imageCompression from 'browser-image-compression'; // *** Import compression library ***

// Import types (ensure Sponsor definition matches backend expectations)
import {
  AidTypeId,
  aidTypes,
  AidDetails,
  SocialLinks,
  SocialLink,
  Sponsor, // Assuming Sponsor type includes imageUrl?: string | undefined
} from '@/components/(page)/AuthPage/OrgRegForm/types'; // Adjust path as needed

// Interfaces (ensure profileImageUrl is string | undefined)
interface VolunteerProfile {
  userId: string;
  firstName?: string;
  surname?: string;
  contactNumber?: string;
  roleOrCategory?: string;
  skills?: string[];
  organizationId?: string;
  socialMedia?: Record<string, string>;
  profileImageUrl?: string | undefined; // Use undefined
  // Add other fields if they exist in your Firestore data for volunteers
}

interface OrganizationProfile {
  userId: string;
  name?: string;
  contactNumber?: string;
  description?: string;
  contactPerson?: string;
  orgPosition?: string;
  profileImageUrl?: string | undefined; // Use undefined
  aidStock?: {
    [aidId: string]: {
      available: boolean;
      [key: string]: unknown;
    };
  };
  // Use a type that reflects Firestore data structure (likely without File/Preview)
  sponsors?: Array<{
    id: string;
    name: string;
    other: string;
    imageUrl?: string | undefined | null; // Backend only stores URL
  }>;
  socialMedia?: Record<string, string>;
  // Add other fields if they exist in your Firestore data for organizations
}

// Define a type for sponsor data state (includes File/Preview for UI)
interface SponsorData {
  id: string;
  name: string;
  other: string;
  photoFile: File | null; // Keep for UI interaction
  photoPreview: string | null; // Keep for UI interaction
  imageUrl?: string | undefined | null; // Backend only needs this (keep consistent)
}

type UserProfile = VolunteerProfile | OrganizationProfile;
type UserType = 'volunteer' | 'organization' | 'unknown';

interface EditProfileFormProps {
  userId: string;
  organizations?: { id: string; name: string }[]; // For volunteer org selection
}

export default function EditProfileForm({
  userId,
  organizations = [],
}: EditProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<UserType>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [socialLinks, setSocialLinks] = useState<{
    [platform: string]: string;
  }>({});
  // Use SponsorData for state to manage UI elements like file/preview
  const [sponsors, setSponsors] = useState<SponsorData[]>([]);
  const [currentSponsor, setCurrentSponsor] = useState<{
    name: string;
    other: string;
  }>({ name: '', other: '' });
  const [editingSponsorIndex, setEditingSponsorIndex] = useState<number | null>(
    null
  );
  const [aidStock, setAidStock] = useState<{
    [key: string]: Record<string, unknown>;
  }>({});
  const [imageFile, setImageFile] = useState<File | null>(null); // Holds the compressed file
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false); // Loading state for compression

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User ID is missing.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const result = await getProfileData(userId);
        if (result.error) {
          setError(result.error);
          setProfile(null);
          setUserType('unknown');
        } else if (result.profile) {
          // Prepare defaults, ensuring correct types (undefined for optional strings)
          const profileWithDefaults = {
            ...result.profile,
            socialMedia: result.profile.socialMedia || {},
            profileImageUrl: result.profile.profileImageUrl || undefined, // Use undefined
          };

          setProfile(profileWithDefaults as UserProfile); // Use type assertion after preparing
          setUserType(result.userType);
          setSocialLinks(profileWithDefaults.socialMedia);

          // Handle organization-specific initialization
          if (result.userType === 'organization') {
            const orgProfile = profileWithDefaults as OrganizationProfile; // Assert type

            // Map Firestore sponsor data (which shouldn't have File/Preview)
            // to the SponsorData state (which includes File/Preview for UI)
            const sponsorsList = orgProfile.sponsors || [];
            const formattedSponsors: SponsorData[] = sponsorsList.map(
              (sponsor) => ({
                id: sponsor.id || Date.now().toString(), // Ensure ID exists
                name: sponsor.name || '',
                other: sponsor.other || '',
                imageUrl: sponsor.imageUrl ?? undefined, // Use undefined if null/missing
                photoFile: null, // Initialize File as null in state
                photoPreview: sponsor.imageUrl || null, // Use stored imageUrl for initial preview
              })
            );
            setSponsors(formattedSponsors);
            setAidStock(orgProfile.aidStock || {});
          }
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

  // Handle Image Change with Compression
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setIsCompressing(true);
    setError(null);

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      initialQuality: 0.7,
    };

    try {
      console.log(
        `Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`
      );
      const compressedFile = await imageCompression(file, options);
      console.log(
        `Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
      );

      setImageFile(compressedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (compressionError) {
      console.error('Image compression error:', compressionError);
      setError('Failed to compress image. Please try a different image.');
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setIsCompressing(false);
      event.target.value = ''; // Reset input
    }
  };

  // Handle Form Submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile || userType === 'unknown' || isSubmitting || isCompressing) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);

    // Add social media data (send empty string for deletion if needed by backend)
    Object.entries(socialLinks).forEach(([platform, link]) => {
      formData.append(`socialMedia.${platform}`, link || ''); // Send empty if link is empty/null/undefined
    });

    // Add sponsors data (ensure only serializable data is sent)
    if (userType === 'organization') {
      // Remove File/Preview objects before stringifying
      const sponsorsToSave = sponsors.map(
        ({ photoFile, photoPreview, ...rest }) => ({
          ...rest,
          imageUrl: rest.imageUrl ?? null, // Send null if undefined for consistency maybe? Or let backend handle
        })
      );
      formData.append('sponsors', JSON.stringify(sponsorsToSave));
    }

    // Add aid stock data
    if (userType === 'organization') {
      formData.append('aidStock', JSON.stringify(aidStock));
    }

    // Append COMPRESSED Profile Image if selected
    if (imageFile) {
      formData.append('profileImage', imageFile, imageFile.name); // Use the compressed file
    }

    try {
      const result = await updateProfileData(userId, userType, formData);

      if (result.success) {
        setSuccessMessage(result.message);
        setImageFile(null); // Clear the temporary file state

        // Update profile state robustly after success
        setProfile((prevProfile) => {
          if (!prevProfile) return null;
          // Use new URL if returned, otherwise keep existing. Convert null/undefined consistently.
          const newImageUrl =
            result.imageUrl !== undefined
              ? (result.imageUrl ?? undefined)
              : prevProfile.profileImageUrl;
          return { ...prevProfile, profileImageUrl: newImageUrl };
        });

        setImagePreview(null); // Clear preview after successful save
      } else {
        setError(result.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError('An unexpected error occurred during update.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle social media link changes
  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };

  // Handle aid stock changes for organizations
  const handleAidStockChange = (
    aidId: string,
    field: string,
    value: string | boolean
  ) => {
    setAidStock((prev) => ({
      ...prev,
      [aidId]: { ...(prev[aidId] || { available: false }), [field]: value },
    }));
  };

  // Toggle aid type availability
  const toggleAidAvailability = (aidId: string) => {
    setAidStock((prev) => ({
      ...prev,
      [aidId]: {
        ...(prev[aidId] || {}),
        available: !(prev[aidId] || {}).available,
      },
    }));
  };

  // Handle sponsor form actions
  const handleAddSponsor = () => {
    if (currentSponsor.name.trim()) {
      if (editingSponsorIndex !== null) {
        // Update existing sponsor in state
        const updatedSponsors = [...sponsors];
        updatedSponsors[editingSponsorIndex] = {
          ...updatedSponsors[editingSponsorIndex], // Keep existing id, imageUrl, file/preview
          name: currentSponsor.name,
          other: currentSponsor.other,
        };
        setSponsors(updatedSponsors);
        setEditingSponsorIndex(null);
      } else {
        // Add new sponsor to state
        setSponsors([
          ...sponsors,
          {
            id: Date.now().toString(), // Generate temporary ID for client-side list key
            name: currentSponsor.name,
            other: currentSponsor.other,
            photoFile: null, // Default state
            photoPreview: null, // Default state
            imageUrl: undefined, // Default state
          },
        ]);
      }
      setCurrentSponsor({ name: '', other: '' }); // Reset form
    }
  };

  const handleEditSponsor = (index: number) => {
    const sponsor = sponsors[index];
    setCurrentSponsor({ name: sponsor.name, other: sponsor.other });
    setEditingSponsorIndex(index);
  };

  const handleRemoveSponsor = (index: number) => {
    const updatedSponsors = [...sponsors];
    updatedSponsors.splice(index, 1);
    setSponsors(updatedSponsors);
    if (editingSponsorIndex === index) {
      // Reset form if editing the removed sponsor
      setEditingSponsorIndex(null);
      setCurrentSponsor({ name: '', other: '' });
    }
  };

  // Render loading/error states
  if (isLoading) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }
  if (error && !profile) {
    // Only show error if profile failed to load initially
    return (
      <div className="p-4 text-red-500">Error loading profile: {error}</div>
    );
  }

  // Render Form
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

      {/* Render form only if profile data exists */}
      {profile && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Profile Picture</h3>
            <div className="flex items-center space-x-4">
              <img
                src={
                  imagePreview ||
                  profile.profileImageUrl ||
                  '/default-avatar.png'
                } // Fallback chain
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border border-gray-300"
              />
              <div>
                <label
                  htmlFor="profileImage"
                  className={`cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isCompressing ? 'Compressing...' : 'Change Picture'}
                </label>
                <input
                  id="profileImage"
                  name="profileImageInput" // Input name (not used by FormData key directly here)
                  type="file"
                  className="sr-only" // Visually hide the default input
                  accept="image/*" // Accept only image files
                  onChange={handleImageChange}
                  disabled={isCompressing} // Disable while compressing
                />
                {/* Show cancel button only if a preview exists and not currently compressing */}
                {imagePreview && !isCompressing && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      const input = document.getElementById(
                        'profileImage'
                      ) as HTMLInputElement;
                      if (input) input.value = ''; // Attempt to reset input value
                    }}
                    className="ml-3 text-sm text-red-600 hover:text-red-800"
                  >
                    Cancel Change
                  </button>
                )}
              </div>
            </div>
            {/* Compression/Selection feedback */}
            {isCompressing && (
              <p className="text-sm text-blue-600 mt-2">
                Compressing image, please wait...
              </p>
            )}
            {imageFile && !isCompressing && (
              <p className="text-xs text-gray-500 mt-2">
                New image selected: {imageFile.name}. Click &quot;Save
                Changes&quot; to apply.
              </p>
            )}
          </div>

          {/* Common Fields - Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
            {/* Contact Number */}
            <div className="mb-4">
              <label htmlFor="contactNumber" className="block mb-1 font-medium">
                Contact Number:
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                className="w-full p-2 border rounded"
                defaultValue={profile.contactNumber || ''}
              />
            </div>
            {/* Social Media Links */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Social Media Links</h4>
              {['facebook', 'twitter', 'instagram'].map((platform) => (
                <div key={platform} className="mb-2">
                  <label
                    htmlFor={`social-${platform}`}
                    className="block mb-1 capitalize"
                  >
                    {platform}:
                  </label>
                  <input
                    type="text"
                    id={`social-${platform}`}
                    value={socialLinks[platform] || ''}
                    onChange={(e) =>
                      handleSocialLinkChange(platform, e.target.value)
                    }
                    className="w-full p-2 border rounded"
                    placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} profile URL`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Volunteer Specific Fields */}
          {userType === 'volunteer' && (
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">Volunteer Details</h3>
              {/* Personal Information (Read Only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block mb-1 font-medium">
                    First Name:
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full p-2 border rounded bg-gray-100"
                    defaultValue={(profile as VolunteerProfile).firstName || ''}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Name cannot be changed in profile
                  </p>
                </div>
                {/* Surname */}
                <div>
                  <label htmlFor="surname" className="block mb-1 font-medium">
                    Surname:
                  </label>
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    className="w-full p-2 border rounded bg-gray-100"
                    defaultValue={(profile as VolunteerProfile).surname || ''}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Surname cannot be changed in profile
                  </p>
                </div>
              </div>
              {/* Role Preference */}
              <div className="mb-4">
                <label
                  htmlFor="roleOrCategory"
                  className="block mb-1 font-medium"
                >
                  Role Preference:
                </label>
                <input
                  type="text"
                  id="roleOrCategory"
                  name="roleOrCategory"
                  className="w-full p-2 border rounded"
                  defaultValue={
                    (profile as VolunteerProfile).roleOrCategory || ''
                  }
                />
              </div>
              {/* Skills */}
              <div className="mb-4">
                <label htmlFor="skills" className="block mb-1 font-medium">
                  Skills (comma-separated):
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  className="w-full p-2 border rounded"
                  defaultValue={
                    (profile as VolunteerProfile).skills?.join(', ') || ''
                  }
                />
              </div>
              {/* Affiliated Organization */}
              <div className="mb-4">
                <label
                  htmlFor="organizationId"
                  className="block mb-1 font-medium"
                >
                  Affiliated Organization:
                </label>
                <select
                  id="organizationId"
                  name="organizationId"
                  className="w-full p-2 border rounded"
                  defaultValue={
                    (profile as VolunteerProfile).organizationId || ''
                  }
                >
                  <option value="">-- Select Organization --</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Organization Specific Fields */}
          {userType === 'organization' && (
            <>
              {/* Organization Details */}
              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">
                  Organization Details
                </h3>
                {/* Name (Read Only) */}
                <div className="mb-4">
                  <label htmlFor="name" className="block mb-1 font-medium">
                    Organization Name:
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full p-2 border rounded bg-gray-100"
                    defaultValue={(profile as OrganizationProfile).name || ''}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Organization name cannot be changed in profile
                  </p>
                </div>
                {/* Description */}
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block mb-1 font-medium"
                  >
                    Description:
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full p-2 border rounded h-32"
                    defaultValue={
                      (profile as OrganizationProfile).description || ''
                    }
                  />
                </div>
                {/* Contact Person */}
                <div className="mb-4">
                  <label
                    htmlFor="contactPerson"
                    className="block mb-1 font-medium"
                  >
                    Contact Person:
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    className="w-full p-2 border rounded"
                    defaultValue={
                      (profile as OrganizationProfile).contactPerson || ''
                    }
                  />
                </div>
                {/* Contact Person Position */}
                <div className="mb-4">
                  <label
                    htmlFor="orgPosition"
                    className="block mb-1 font-medium"
                  >
                    Contact Person&apos;s Position:
                  </label>
                  <input
                    type="text"
                    id="orgPosition"
                    name="orgPosition"
                    className="w-full p-2 border rounded"
                    defaultValue={
                      (profile as OrganizationProfile).orgPosition || ''
                    }
                  />
                </div>
              </div>

              {/* Aid Stock Management */}
              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">
                  Aid Stock Management
                </h3>
                <div className="space-y-4">
                  {aidTypes.map((aidType) => {
                    const isAvailable =
                      (aidStock[aidType.id]?.available as boolean) || false;
                    return (
                      <div key={aidType.id} className="border p-3 rounded">
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id={`aid-${aidType.id}`}
                            checked={isAvailable}
                            onChange={() => toggleAidAvailability(aidType.id)}
                            className="mr-2"
                          />
                          <label
                            htmlFor={`aid-${aidType.id}`}
                            className="font-medium"
                          >
                            {aidType.label}
                          </label>
                        </div>
                        {isAvailable && (
                          <div className="pl-6 space-y-2">
                            {/* Dynamic inputs based on aidType.id - kept concise for brevity */}
                            {/* Example for Food */}
                            {aidType.id === 'food' && (
                              <>
                                <div>
                                  <label className="text-sm block">
                                    Food Packs:
                                  </label>
                                  <input
                                    type="number"
                                    value={
                                      (aidStock.food?.foodPacks as string) || ''
                                    }
                                    onChange={(e) =>
                                      handleAidStockChange(
                                        'food',
                                        'foodPacks',
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-1 border rounded"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm block">
                                    Category:
                                  </label>
                                  <input
                                    type="text"
                                    value={
                                      (aidStock.food?.category as string) || ''
                                    }
                                    onChange={(e) =>
                                      handleAidStockChange(
                                        'food',
                                        'category',
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-1 border rounded"
                                  />
                                </div>
                              </>
                            )}
                            {/* Add similar conditional blocks for other aid types */}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sponsor Management */}
              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">Sponsors</h3>
                {/* Current Sponsors List */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Current Sponsors</h4>
                  {sponsors.length > 0 ? (
                    <ul className="space-y-2">
                      {sponsors.map((sponsor, index) => (
                        <li
                          key={sponsor.id || index}
                          className="flex items-center justify-between border p-2 rounded"
                        >
                          <div>
                            <p className="font-medium">{sponsor.name}</p>
                            {sponsor.other && (
                              <p className="text-sm text-gray-600">
                                {sponsor.other}
                              </p>
                            )}
                            {/* Optionally display sponsor image if URL exists */}
                            {sponsor.imageUrl && (
                              <img
                                src={sponsor.imageUrl}
                                alt={sponsor.name}
                                className="h-10 w-10 object-cover rounded mt-1"
                              />
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditSponsor(index)}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSponsor(index)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No sponsors added yet.</p>
                  )}
                </div>
                {/* Add/Edit Sponsor Form */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">
                    {editingSponsorIndex !== null
                      ? 'Edit Sponsor'
                      : 'Add New Sponsor'}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="sponsor-name" className="block mb-1">
                        Sponsor Name:
                      </label>
                      <input
                        type="text"
                        id="sponsor-name"
                        value={currentSponsor.name}
                        onChange={(e) =>
                          setCurrentSponsor({
                            ...currentSponsor,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label htmlFor="sponsor-details" className="block mb-1">
                        Other Details:
                      </label>
                      <textarea
                        id="sponsor-details"
                        value={currentSponsor.other}
                        onChange={(e) =>
                          setCurrentSponsor({
                            ...currentSponsor,
                            other: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded h-20"
                      />
                    </div>
                    {/* Sponsor image upload would need separate handling here if required */}
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleAddSponsor}
                        className="px-3 py-1 bg-green-500 text-white rounded"
                      >
                        {editingSponsorIndex !== null ? 'Update' : 'Add'}{' '}
                        Sponsor
                      </button>
                      {editingSponsorIndex !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSponsorIndex(null);
                            setCurrentSponsor({ name: '', other: '' });
                          }}
                          className="px-3 py-1 bg-gray-500 text-white rounded"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Submission Area */}
          <div className="flex justify-between items-center mt-6">
            <button
              type="submit"
              disabled={isSubmitting || isCompressing || userType === 'unknown'}
              className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors duration-200 ${
                isSubmitting || isCompressing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting
                ? 'Saving...'
                : isCompressing
                  ? 'Processing Image...'
                  : 'Save Changes'}
            </button>

            {/* Status Messages */}
            <div className="text-right">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {successMessage && (
                <p className="text-green-600 text-sm">{successMessage}</p>
              )}
            </div>
          </div>
        </form>
      )}

      {/* Fallback message if profile is null after loading without initial error */}
      {!profile && !isLoading && userType === 'unknown' && !error && (
        <div className="p-4 text-center bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
          Profile data could not be loaded or is unavailable.
        </div>
      )}
    </div>
  );
}
