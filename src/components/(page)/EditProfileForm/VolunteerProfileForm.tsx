'use client';
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { updateProfileData } from '@/actions/profileActions';
import imageCompression from 'browser-image-compression';

interface VolunteerProfile {
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

export default function VolunteerProfileForm({
  userId,
  profile,
  organizations = [],
}: VolunteerProfileFormProps) {
  const [socialLinks, setSocialLinks] = useState<{
    [platform: string]: string;
  }>(profile.socialMedia || {});
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile.skills || []);
  const [otherSkill, setOtherSkill] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>(profile.roleOrCategory || '');

  // Available skills options
  const skillOptions = [
    'First Aid C P R',
    'Psychosocial Support',
    'Medical Services',
    'Search Rescue',
    'Clerical Work',
    'Counseling'
  ];

  // Available role/category options
  const roleOptions = [
    'Disaster Response and Relief',
    'Food and Supply Distribution',
    'Community Outreach',
    'Evacuation Center Assistance',
    'Medical Assistance and First Aid',
    'Documentation and Reporting',
    'Psychosocial Support Services',
    'Fundraising and Donation Management'
  ];

  // Handle social media link changes
  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };

  // Handle skill checkbox changes
  const handleSkillChange = (skill: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
  };

  // Handle role selection
  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

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
      event.target.value = '';
    }
  };

  // Handle Form Submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isCompressing) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    
    // Add social media data
    Object.entries(socialLinks).forEach(([platform, link]) => {
      formData.append(`socialMedia.${platform}`, link || '');
    });

    // Add selected skills
    const skillsToSubmit = [...selectedSkills];
    if (otherSkill.trim()) {
      skillsToSubmit.push(otherSkill.trim());
    }
    
    // Remove and re-add skills to FormData
    formData.delete('skills');
    formData.append('skills', skillsToSubmit.join(','));
    
    // Add selected role
    formData.set('roleOrCategory', selectedRole);

    // Append profile image if selected
    if (imageFile) {
      formData.append('profileImage', imageFile, imageFile.name);
    }

    try {
      const result = await updateProfileData(userId, 'volunteer', formData);
      
      if (result.success) {
        setSuccessMessage(result.message);
        setImageFile(null);
        setImagePreview(null);
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

  return (
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
            }
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
                  setImageFile(null);
                  setImagePreview(null);
                  const input = document.getElementById(
                    'profileImage'
                  ) as HTMLInputElement;
                  if (input) input.value = '';
                }}
                className="ml-3 text-sm text-red-600 hover:text-red-800"
              >
                Cancel Change
              </button>
            )}
          </div>
        </div>
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

      {/* Contact Information */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
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
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Volunteer Details</h3>
        
        {/* Personal Information (Read Only) */}
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
        
        {/* Skills Selection - Checkboxes matching the image */}
        <div className="mb-6">
          <div className="border border-red-300 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-2 text-red-800">Skills and Expertise:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                {skillOptions.slice(0, 2).map(skill => (
                  <div key={skill} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`skill-${skill}`}
                      checked={selectedSkills.includes(skill)}
                      onChange={() => handleSkillChange(skill)}
                      className="h-4 w-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor={`skill-${skill}`} className="ml-2 text-sm">
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
              
              <div>
                {skillOptions.slice(2, 4).map(skill => (
                  <div key={skill} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`skill-${skill}`}
                      checked={selectedSkills.includes(skill)}
                      onChange={() => handleSkillChange(skill)}
                      className="h-4 w-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor={`skill-${skill}`} className="ml-2 text-sm">
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
              
              <div>
                {skillOptions.slice(4).map(skill => (
                  <div key={skill} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`skill-${skill}`}
                      checked={selectedSkills.includes(skill)}
                      onChange={() => handleSkillChange(skill)}
                      className="h-4 w-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor={`skill-${skill}`} className="ml-2 text-sm">
                      {skill}
                    </label>
                  </div>
                ))}
                
                {/* Others input field */}
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="skill-other"
                    checked={otherSkill.trim() !== ''}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        setOtherSkill('');
                      }
                    }}
                    className="h-4 w-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="skill-other" className="ml-2 text-sm">
                    Others:
                  </label>
                  <input
                    type="text"
                    value={otherSkill}
                    onChange={(e) => setOtherSkill(e.target.value)}
                    className="ml-2 p-1 text-sm border rounded border-red-300 focus:ring-red-500 focus:border-red-500"
                    placeholder="Specify other skills"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Role/Category Preference - Radio buttons matching the image */}
        <div className="mb-6">
          <div className="border border-red-300 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-2 text-red-800">Role/Category Preference: <span className="text-red-500">*</span></h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                {roleOptions.slice(0, 3).map(role => (
                  <div key={role} className="flex items-center mb-2">
                    <input
                      type="radio"
                      id={`role-${role}`}
                      name="rolePreference"
                      value={role}
                      checked={selectedRole === role}
                      onChange={() => handleRoleChange(role)}
                      className="h-4 w-4 text-red-600 border-red-300 focus:ring-red-500"
                      required
                    />
                    <label htmlFor={`role-${role}`} className="ml-2 text-sm">
                      {role}
                    </label>
                  </div>
                ))}
              </div>
              
              <div>
                {roleOptions.slice(3, 6).map(role => (
                  <div key={role} className="flex items-center mb-2">
                    <input
                      type="radio"
                      id={`role-${role}`}
                      name="rolePreference"
                      value={role}
                      checked={selectedRole === role}
                      onChange={() => handleRoleChange(role)}
                      className="h-4 w-4 text-red-600 border-red-300 focus:ring-red-500"
                    />
                    <label htmlFor={`role-${role}`} className="ml-2 text-sm">
                      {role}
                    </label>
                  </div>
                ))}
              </div>
              
              <div>
                {roleOptions.slice(6).map(role => (
                  <div key={role} className="flex items-center mb-2">
                    <input
                      type="radio"
                      id={`role-${role}`}
                      name="rolePreference"
                      value={role}
                      checked={selectedRole === role}
                      onChange={() => handleRoleChange(role)}
                      className="h-4 w-4 text-red-600 border-red-300 focus:ring-red-500"
                    />
                    <label htmlFor={`role-${role}`} className="ml-2 text-sm">
                      {role}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            defaultValue={profile.organizationId || ''}
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {successMessage && (
            <p className="text-green-600 text-sm">{successMessage}</p>
          )}
        </div>
      </div>
    </form>
  );
}