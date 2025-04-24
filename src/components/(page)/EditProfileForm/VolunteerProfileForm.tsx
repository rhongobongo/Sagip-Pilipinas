// src/components/(page)/EditProfileForm/VolunteerProfileForm.tsx
'use client';
// Make sure useEffect is imported
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { updateProfileData } from '@/actions/profileActions';
import imageCompression from 'browser-image-compression';

// Interface for the profile data structure
export interface VolunteerProfile {
  userId: string;
  firstName?: string;
  surname?: string; // Changed from 'surname' to match form field if needed, check consistency
  contactNumber?: string;
  roleOrCategory?: string;
  skills?: string[];
  organizationId?: string; // Changed from organizationId to match form field if needed
  socialMedia?: Record<string, string>;
  profileImageUrl?: string | undefined;
}

// Interface for the component props
interface VolunteerProfileFormProps {
  userId: string;
  profile: VolunteerProfile;
  organizations: { id: string; name: string }[]; // Keep this for the dropdown
}

export default function VolunteerProfileForm({
  userId,
  profile,
  organizations = [],
}: VolunteerProfileFormProps) {
  // --- State variables (Keep existing, including imagePreview) ---
  const [socialLinks, setSocialLinks] = useState<{
    [platform: string]: string;
  }>(profile.socialMedia || {});
  const [imageFile, setImageFile] = useState<File | null>(null); // State for the COMPRESSED file
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State for the object URL preview
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    profile.skills || []
  );
  const [otherSkill, setOtherSkill] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>(
    profile.roleOrCategory || ''
  );
  const [displayImageUrl, setDisplayImageUrl] = useState<string | undefined>(
    profile.profileImageUrl
  );

  // --- Effect to sync display URL (Keep as is) ---
  useEffect(() => {
    if (!imagePreview && profile.profileImageUrl !== displayImageUrl) {
      setDisplayImageUrl(profile.profileImageUrl);
    }
  }, [profile.profileImageUrl, imagePreview, displayImageUrl]);

  // --- Options (Keep as is) ---
  const skillOptions = [
    'First Aid C P R',
    'Psychosocial Support',
    'Medical Services',
    'Search Rescue',
    'Clerical Work',
    'Counseling',
  ];
  const roleOptions = [
    'Disaster Response and Relief',
    'Food and Supply Distribution',
    'Community Outreach',
    'Evacuation Center Assistance',
    'Medical Assistance and First Aid',
    'Documentation and Reporting',
    'Psychosocial Support Services',
    'Fundraising and Donation Management',
  ];

  // --- Handlers (Keep existing non-image handlers) ---
  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };
  const handleSkillChange = (skill: string) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
  };
  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  // --- *** MODIFIED: Handle Image Change *** ---
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      // Clear existing preview and compressed file if selection is cancelled
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      setImageFile(null);
      return;
    }

    setError(null);
    setImageFile(null); // Clear previous compressed file state immediately

    // --- Create Instant Preview ---
    // Revoke previous object URL before creating a new one
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl); // Set the preview URL state
    // --- End Instant Preview ---

    // --- Start Compression (async) ---
    setIsCompressing(true);
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

      // Set the COMPRESSED file to state for upload
      setImageFile(compressedFile);
    } catch (compressionError) {
      console.error('Image compression error:', compressionError);
      setError('Failed to compress image. Please try a different image.');
      // Keep the preview showing the original file, but clear the file for upload
      setImageFile(null);
    } finally {
      setIsCompressing(false);
      // Don't reset event.target.value here if you want the input to retain selection state visually
      // event.target.value = '';
    }
    // --- End Compression ---
  };

  // --- *** ADDED: useEffect for Cleanup *** ---
  useEffect(() => {
    // This is the cleanup function that runs when the component unmounts
    // or *before* the effect runs again if imagePreview changes.
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        console.log('Revoked Object URL:', imagePreview); // For debugging
      }
    };
  }, [imagePreview]); // Dependency array ensures cleanup runs when preview URL changes

  // --- MODIFIED: Handle Form Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isCompressing) return; // Prevent double submission
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);

    // Append social media links
    Object.entries(socialLinks).forEach(([platform, link]) => {
      formData.append(`socialMedia.${platform}`, link || '');
    });

    // Append skills (including other) as a comma-separated string
    const skillsToSubmit = [...selectedSkills];
    if (otherSkill.trim()) {
      skillsToSubmit.push(otherSkill.trim());
    }
    formData.delete('skills'); // Remove any default checkbox values if they exist
    formData.append('skills', skillsToSubmit.join(','));

    // Set the selected role
    formData.set('roleOrCategory', selectedRole);

    // Append the COMPRESSED image file (if it exists in state)
    if (imageFile) {
      formData.append('profileImage', imageFile, imageFile.name);
    }

    try {
      // Call the server action to update the profile
      const result = await updateProfileData(userId, 'volunteer', formData);

      if (result.success) {
        // --- Update display URL and clear preview/file states ---
        if (result.imageUrl !== undefined) {
          // If upload was successful and returned a new URL, use it
          setDisplayImageUrl(result.imageUrl ?? undefined);
        } else if (imageFile) {
          // If upload succeeded but didn't return URL (shouldn't happen ideally),
          // keep the existing display URL.
          console.warn(
            'Upload succeeded but no image URL returned from backend.'
          );
        }
        // Always clear the temporary states after successful submission attempt
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview); // Revoke explicitly here too
        }
        setImagePreview(null);
        setImageFile(null);
        // --- End state update ---
        setSuccessMessage(result.message);
      } else {
        // Set error message if the update failed
        setError(result.message || 'Failed to update profile.');
      }
    } catch (err) {
      // Handle unexpected errors during the server action call
      setError('An unexpected error occurred during update.');
      console.error('Submit Error:', err);
    } finally {
      // Always set submitting state back to false
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Section */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Profile Picture</h3>
        <div className="flex items-center space-x-4">
          {/* --- *** MODIFIED: img src logic *** --- */}
          <img
            src={
              imagePreview || // 1. Show object URL preview if available
              displayImageUrl || // 2. Else, show the current stored image URL
              '/default-avatar.png' // 3. Else, show default
            }
            alt="Profile Preview" // Changed alt text for clarity
            className="w-24 h-24 rounded-full object-cover border border-gray-300"
          />
          {/* --- *** End img src logic modification *** --- */}
          <div>
            {/* Input and Buttons */}
            <label
              htmlFor="profileImage"
              className={`cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isCompressing ? 'Processing...' : 'Change Picture'}{' '}
              {/* Changed label slightly */}
            </label>
            <input
              id="profileImage"
              name="profileImageInput" // Keep distinct name if needed
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isCompressing}
            />
            {/* Cancel Button - Clears Preview and Compressed File */}
            {imagePreview && !isCompressing && (
              <button
                type="button"
                onClick={() => {
                  if (imagePreview) {
                    URL.revokeObjectURL(imagePreview);
                  }
                  setImagePreview(null);
                  setImageFile(null); // Also clear the compressed file state
                  const input = document.getElementById(
                    'profileImage'
                  ) as HTMLInputElement;
                  if (input) input.value = ''; // Attempt to reset file input
                }}
                className="ml-3 text-sm text-red-600 hover:text-red-800"
              >
                Cancel Change
              </button>
            )}
          </div>
        </div>
        {/* Feedback Messages */}
        {isCompressing && (
          <p className="text-sm text-blue-600 mt-2">Compressing image...</p>
        )}
        {/* Show selected file name based on preview existing */}
        {imagePreview && !isCompressing && (
          <p className="text-xs text-gray-500 mt-2">
            New image selected. Click &quot;Save Changes&quot; to apply.
          </p>
        )}
        {/* Show error specifically related to compression if it exists */}
        {error && error.includes('compress') && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Contact Information Section */}
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

      {/* Volunteer Details Section */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Volunteer Details</h3>
        {/* Personal Info (Read Only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="firstName" className="block mb-1 font-medium">
              First Name:
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="w-full p-2 border rounded bg-gray-100"
              defaultValue={profile.firstName || ''}
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Name cannot be changed in profile
            </p>
          </div>
          <div>
            <label htmlFor="surname" className="block mb-1 font-medium">
              Surname:
            </label>
            <input
              type="text"
              id="surname"
              name="surname"
              className="w-full p-2 border rounded bg-gray-100"
              defaultValue={profile.surname || ''}
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Surname cannot be changed in profile
            </p>
          </div>
        </div>
        {/* Skills Selection */}
        <div className="mb-6">
          <div className="border border-red-300 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-2 text-red-800">
              Skills and Expertise:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
              {skillOptions.map((skill) => (
                <div key={skill} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`skill-${skill.replace(/\s+/g, '-')}`} // Create unique ID
                    checked={selectedSkills.includes(skill)}
                    onChange={() => handleSkillChange(skill)}
                    className="h-4 w-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                  />
                  <label
                    htmlFor={`skill-${skill.replace(/\s+/g, '-')}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {skill}
                  </label>
                </div>
              ))}
              {/* Others Input Field */}
              <div className="flex items-center col-span-1 sm:col-span-2 md:col-span-3 mt-2">
                {' '}
                {/* Adjust spanning */}
                <label
                  htmlFor="skill-other"
                  className="text-sm mr-2 text-gray-700"
                >
                  Others:
                </label>
                <input
                  type="text"
                  id="skill-other"
                  value={otherSkill}
                  onChange={(e) => setOtherSkill(e.target.value)}
                  className="flex-grow p-1 text-sm border rounded border-gray-300 focus:ring-red-500 focus:border-red-500"
                  placeholder="Specify other skills (comma-separated)"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Role/Category Preference */}
        <div className="mb-6">
          <div className="border border-red-300 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-2 text-red-800">
              Role/Category Preference: <span className="text-red-500">*</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
              {roleOptions.map((role) => (
                <div key={role} className="flex items-center">
                  <input
                    type="radio"
                    id={`role-${role.replace(/\s+/g, '-')}`} // Create unique ID
                    name="rolePreference" // Group radio buttons
                    value={role}
                    checked={selectedRole === role}
                    onChange={() => handleRoleChange(role)}
                    className="h-4 w-4 text-red-600 border-red-300 focus:ring-red-500"
                    required // Make selection mandatory
                  />
                  <label
                    htmlFor={`role-${role.replace(/\s+/g, '-')}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {role}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Affiliated Organization */}
        <div className="mb-4">
          <label htmlFor="organizationId" className="block mb-1 font-medium">
            Affiliated Organization:
          </label>
          <select
            id="organizationId"
            name="organizationId"
            className="w-full p-2 border rounded bg-white border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            defaultValue={profile.organizationId || ''} // Use defaultValue for uncontrolled behavior or manage with state if needed
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

      {/* Submission Area */}
      <div className="flex justify-between items-center mt-6">
        <button
          type="submit"
          disabled={isSubmitting || isCompressing}
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
          {/* Only show submission errors here */}
          {error && !error.includes('compress') && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          {successMessage && (
            <p className="text-green-600 text-sm">{successMessage}</p>
          )}
        </div>
      </div>
    </form>
  );
}
