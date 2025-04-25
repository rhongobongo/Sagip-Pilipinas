'use client';
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { updateProfileData } from '@/actions/profileActions';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';

// --- Interfaces ---
export interface VolunteerProfile {
  userId: string;
  firstName?: string;
  surname?: string;
  contactNumber?: string;
  roleOrCategory?: string;
  skills?: string[];
  organizationId?: string;
  socialMedia?: Record<string, string>;
  profileImageUrl?: string | undefined;
}

interface VolunteerProfileFormProps {
  userId: string;
  profile: VolunteerProfile;
  organizations: { id: string; name: string }[];
}

// --- Helper function to normalize strings (remove spaces and lowercase) ---
const normalizeString = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.replace(/\s+/g, '').toLowerCase();
};
// --- End Helper ---

export default function VolunteerProfileForm({
  userId,
  profile,
  organizations = [],
}: VolunteerProfileFormProps) {
  // --- State Variables ---
  const [socialLinks, setSocialLinks] = useState<{
    [platform: string]: string;
  }>(profile.socialMedia || {});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [displayImageUrl, setDisplayImageUrl] = useState<string | undefined>(
    profile.profileImageUrl
  );
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    // Use the robust initialization from previous version
    Array.isArray(profile.skills) ? profile.skills : []
  );
  const [otherSkill, setOtherSkill] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>(
    profile.roleOrCategory || ''
  );
  const [affiliatedOrganizationId, setAffiliatedOrganizationId] =
    useState<string>(profile.organizationId || '');

  // --- Effect for display URL ---
  useEffect(() => {
    if (!imagePreview && profile.profileImageUrl !== displayImageUrl) {
      setDisplayImageUrl(profile.profileImageUrl);
    }
  }, [profile.profileImageUrl, imagePreview, displayImageUrl]);

  // --- Options ---
  // These remain the same, with spaces for display
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
    'Evacuation Center Assistance', // Note: Saved as "EvacCenterAssist"
    'Medical Assistance and First Aid',
    'Documentation and Reporting',
    'Psychosocial Support Services',
    'Fundraising and Donation Management',
  ];

  // --- Handlers ---
  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };

  // Skill change handler - adds/removes the option *with spaces* to the state
  const handleSkillChange = (skill: string) => {
    // We still manage the state with the display value (with spaces)
    setSelectedSkills((prev) => {
      // Normalize for checking existence
      const normalizedSkill = normalizeString(skill);
      const exists = prev.some(
        (s) => normalizeString(s) === normalizedSkill
      );

      if (exists) {
        // Filter out based on normalized comparison
        return prev.filter((s) => normalizeString(s) !== normalizedSkill);
      } else {
        // Add the original skill (with spaces)
        return [...prev, skill];
      }
    });
  };

  // Role change handler - sets the state to the option *with spaces*
  const handleRoleChange = (role: string) => {
    setSelectedRole(role); // Store the display value (with spaces)
  };

  const handleOrganizationChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setAffiliatedOrganizationId(event.target.value);
  };

  // --- Image Handling Logic (Unchanged) ---
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setImageFile(null);
      return;
    }

    setError(null);
    setImageFile(null);

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    setIsCompressing(true);
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      initialQuality: 0.7,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setImageFile(compressedFile);
    } catch (compressionError) {
      console.error('Image compression error:', compressionError);
      setError('Failed to compress image. Please try a different image.');
      setImageFile(null);
    } finally {
      setIsCompressing(false);
    }
  };

  // --- Cleanup Effect for Image Preview (Unchanged) ---
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // --- Form Submission (Unchanged, sends display values) ---
  // NOTE: The backend (`updateProfileData`) should handle normalizing
  // the submitted values if needed before saving, or save them as they are.
  // This frontend handleSubmit sends the values *with* spaces.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
     event.preventDefault();
     if (isSubmitting || isCompressing) return;
     setIsSubmitting(true);
     setError(null);
     setSuccessMessage(null);

     const formData = new FormData(event.currentTarget);

     Object.entries(socialLinks).forEach(([platform, link]) => {
       formData.append(`socialMedia.${platform}`, link || '');
     });

     // IMPORTANT: We are submitting the skills WITH spaces here.
     // Ensure your backend expects this or normalizes them.
     const skillsToSubmit = [...selectedSkills];
     if (otherSkill.trim()) {
       skillsToSubmit.push(otherSkill.trim());
     }
     formData.delete('skills');
     formData.append('skills', skillsToSubmit.join(',')); // Send as comma-separated string WITH spaces

     // IMPORTANT: Submitting role WITH spaces
     formData.set('roleOrCategory', selectedRole);
     formData.set('organizationId', affiliatedOrganizationId);

     if (imageFile) {
       formData.append('profileImage', imageFile, imageFile.name);
     }

     try {
       const result = await updateProfileData(userId, 'volunteer', formData);

       if (result.success) {
         if (result.imageUrl !== undefined) {
           setDisplayImageUrl(result.imageUrl ?? undefined);
         }
         if (imagePreview) URL.revokeObjectURL(imagePreview);
         setImagePreview(null);
         setImageFile(null);
         setSuccessMessage(result.message);
       } else {
         setError(result.message || 'Failed to update profile.');
       }
     } catch (err) {
       setError('An unexpected error occurred during update.');
       console.error('Submit Error:', err);
     } finally {
       setIsSubmitting(false);
     }
   };

  // --- JSX Rendering ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50">
      {/* Profile Picture Section (Unchanged) */}
       <div className="bg-white p-4 rounded-lg shadow textbox flex flex-col">
         <h3 className="text-xl font-semibold mb-3 text-center">
           Profile Picture
         </h3>
         <div className="flex items-center flex-col">
           <img
             src={imagePreview || displayImageUrl || '/default-avatar.png'}
             alt="Profile Preview"
             className="w-24 h-24 rounded-full object-cover border border-red-300 mb-4"
           />
           <div className="mx-auto flex flex-col sm:flex-row items-center justify-center transition-all duration-300">
             <label
               htmlFor="profileImage"
               className={`cursor-pointer transition-all duration-300 py-2 px-3 border bg-red-500 hover:bg-red-600 rounded-lg shadow-sm text-sm leading-4 font-medium text-white mx-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                 isCompressing ? 'opacity-50 cursor-not-allowed' : ''
               }`}
             >
               {isCompressing ? 'Processing...' : 'Change Picture'}
             </label>
             <input
               id="profileImage"
               name="profileImageInput"
               type="file"
               className="sr-only"
               accept="image/*"
               onChange={handleImageChange}
               disabled={isCompressing}
             />
             {imagePreview && !isCompressing && (
               <button
                 type="button"
                 onClick={() => {
                   if (imagePreview) URL.revokeObjectURL(imagePreview);
                   setImagePreview(null);
                   setImageFile(null);
                   const input = document.getElementById(
                     'profileImage'
                   ) as HTMLInputElement;
                   if (input) input.value = '';
                 }}
                 className="text-sm my-4 sm:my-0 sm:ml-5 border py-1.5 px-3 text-white rounded-lg border-gray-400 bg-gray-500 hover:bg-gray-600 transition-all duration-300"
               >
                 Cancel Change
               </button>
             )}
           </div>
         </div>
         {isCompressing && (
           <p className="text-sm text-blue-600 mt-2">Compressing image...</p>
         )}
         {imagePreview && !isCompressing && (
           <p className="text-xs text-gray-500 mt-2">
             New image selected. Click &quot;Save Changes&quot; to apply.
           </p>
         )}
         {error && error.includes('compress') && (
           <p className="text-red-500 text-sm mt-2">{error}</p>
         )}
       </div>

      {/* Personal Details Section (Unchanged) */}
      <div className="bg-white p-4 rounded-lg shadow pinkBorder">
         <h3 className="text-xl font-semibold mb-3">Personal Details</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
           <div>
             <label htmlFor="firstName" className="block mb-1 font-medium">
               First Name:
             </label>
             <input
               type="text"
               id="firstName"
               name="firstName"
               className="w-full p-2 border rounded bg-gray-300 textbox"
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
               className="w-full p-2 border rounded bg-gray-300 textbox"
               defaultValue={profile.surname || ''}
               readOnly
             />
             <p className="text-xs text-gray-500 mt-1">
               Surname cannot be changed in profile
             </p>
           </div>
         </div>
       </div>

      {/* Contact Information Section (Unchanged) */}
      <div className="bg-white p-4 rounded-lg shadow pinkBorder">
        <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
        <div className="mb-4">
          <label htmlFor="contactNumber" className="block mb-1 font-medium">
            Contact Number:
          </label>
          <input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            className="w-full p-2 border rounded textbox"
            defaultValue={profile.contactNumber || ''}
          />
        </div>
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
                className="w-full p-2 border rounded textbox"
                placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} profile URL`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Volunteer Details Section */}
      <div className="bg-white p-4 rounded-lg shadow textbox">
        <h3 className="text-xl font-semibold mb-3">Volunteer Details</h3>

        {/* Skills Selection - MODIFIED CHECK */}
        <div className="mb-6 border p-4 rounded-lg pinkBorder">
          <h4 className="text-lg font-semibold mb-2 text-red-800">
            Skills and Expertise:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
            {skillOptions.map((skillOption) => {
              // --- FIX: Use normalized comparison for 'checked' ---
              const isChecked = selectedSkills.some(savedSkill => normalizeString(savedSkill) === normalizeString(skillOption));
              // --- END FIX ---
              return (
                <label key={skillOption} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={`skill-${skillOption.replace(/\s+/g, '-')}`}
                    // Use the result of the normalized comparison
                    checked={isChecked}
                    // onChange still uses the display value (with spaces)
                    onChange={() => handleSkillChange(skillOption)}
                    className="custom-checkbox-input peer sr-only"
                  />
                  <span className="custom-checkbox-indicator flex-shrink-0 mr-2"></span>
                  <span className="text-sm text-gray-700">{skillOption}</span>
                </label>
              );
            })}
            {/* Others Input Field (Unchanged) */}
             <div className="flex items-center col-span-1 sm:col-span-2 md:col-span-3 mt-2">
               <label
                 htmlFor="skill-other"
                 className="text-sm mr-2 text-gray-700 flex-shrink-0"
               >
                 Others:
               </label>
               <input
                 type="text"
                 id="skill-other"
                 value={otherSkill}
                 onChange={(e) => setOtherSkill(e.target.value)}
                 className="flex-grow p-1 text-sm border rounded border-gray-300 focus:ring-red-500 focus:border-red-500 textbox"
                 placeholder="Specify other skills"
               />
             </div>
          </div>
        </div>

        {/* Role/Category Preference - MODIFIED CHECK */}
        <div className="mb-6 border p-4 rounded-lg pinkBorder">
          <h4 className="text-lg font-semibold mb-2 text-red-800">
            Role/Category Preference: <span className="text-red-500">*</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
            {roleOptions.map((roleOption) => {
              // --- FIX: Use normalized comparison for 'checked' ---
              const isChecked = normalizeString(selectedRole) === normalizeString(roleOption);
              // --- END FIX ---
              return (
                <label key={roleOption} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id={`role-${roleOption.replace(/\s+/g, '-')}`}
                    name="rolePreference"
                    value={roleOption} // Value remains the display value
                    // Use the result of the normalized comparison
                    checked={isChecked}
                    // onChange still uses the display value (with spaces)
                    onChange={() => handleRoleChange(roleOption)}
                    className="sr-only peer"
                    required
                  />
                  <div className="radio-container mr-2 flex-shrink-0"></div>
                  <span className="ml-2 text-sm text-gray-700">{roleOption}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Affiliated Organization (Unchanged - already fixed) */}
         <div className="mb-4">
           <label htmlFor="organizationId" className="block mb-1 font-medium">
             Affiliated Organization:
           </label>
           <select
             id="organizationId"
             name="organizationId"
             className="w-full p-2 border rounded bg-white border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 textbox"
             value={affiliatedOrganizationId} // Controlled by state
             onChange={handleOrganizationChange} // Use state handler
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

      {/* Submission Area (Unchanged) */}
      <div className="flex justify-between items-center mt-6 transition-all duration-300">
        <button
          type="submit"
          disabled={isSubmitting || isCompressing}
          className={`px-6 py-2 rounded-lg text-white font-semibold mx-auto sm:mx-0 ${
            isSubmitting || isCompressing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isSubmitting
            ? 'Saving...'
            : isCompressing
              ? 'Processing Image...'
              : 'Save Changes'}
        </button>
        <div className="text-right">
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