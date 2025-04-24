'use client';
import React, {
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
  useCallback,
} from 'react';
import { updateProfileData } from '@/actions/profileActions';
import imageCompression from 'browser-image-compression';
import {
  AidTypeId,
  aidTypes,
} from '@/components/(page)/AuthPage/OrgRegForm/types';
import LocationSetterMapWrapper from './LocationSetterMapWrapper';
// --- Interfaces (Keep as is) ---
export interface OrganizationProfile {
  userId: string;
  name?: string;
  contactNumber?: string;
  description?: string;
  contactPerson?: string;
  orgPosition?: string;
  profileImageUrl?: string | undefined;
  coordinates?: { latitude: number; longitude: number };
  location?: string;
  aidStock?: {
    [aidId: string]: {
      available: boolean;
      [key: string]: unknown;
    };
  };
  sponsors?: Array<{
    id: string;
    name: string;
    other: string;
    imageUrl?: string | undefined | null;
  }>;
  socialMedia?: Record<string, string>;
}

interface SponsorData {
  id: string;
  name: string;
  other: string;
  photoFile: File | null;
  photoPreview: string | null;
  imageUrl?: string | undefined | null;
}

interface OrganizationProfileFormProps {
  userId: string;
  profile: OrganizationProfile;
}

// --- aidTypeFields (Keep as is) ---
const aidTypeFields = {
  food: [
    { name: 'foodPacks', label: 'Food Packs', type: 'number' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'description', label: 'Description', type: 'text' },
  ],
  clothing: [
    { name: 'male', label: 'Male Clothing', type: 'number' },
    { name: 'female', label: 'Female Clothing', type: 'number' },
    { name: 'children', label: 'Children Clothing', type: 'number' },
    { name: 'notes', label: 'Notes', type: 'text' },
  ],
  medicalSupplies: [
    { name: 'kits', label: 'Medical Kits', type: 'number' },
    { name: 'medicines', label: 'Medicines', type: 'number' },
    { name: 'equipment', label: 'Medical Equipment', type: 'number' },
    { name: 'details', label: 'Details', type: 'text' },
  ],
  shelter: [
    { name: 'tents', label: 'Tents', type: 'number' },
    { name: 'blankets', label: 'Blankets', type: 'number' },
    { name: 'capacity', label: 'Capacity', type: 'number' },
    { name: 'notes', label: 'Notes', type: 'text' },
  ],
  searchAndRescue: [
    { name: 'rescueKits', label: 'Rescue Kits', type: 'number' },
    { name: 'rescuePersonnel', label: 'Rescue Personnel', type: 'number' },
    { name: 'equipment', label: 'Equipment', type: 'number' },
    { name: 'details', label: 'Details', type: 'text' },
  ],
  financialAssistance: [
    { name: 'totalFunds', label: 'Total Funds', type: 'number' },
    { name: 'currency', label: 'Currency', type: 'text' },
    { name: 'notes', label: 'Notes', type: 'text' },
  ],
  counseling: [
    { name: 'counselors', label: 'Counselors', type: 'number' },
    { name: 'hours', label: 'Available Hours', type: 'number' },
    { name: 'specialties', label: 'Specialties', type: 'text' },
  ],
  technicalSupport: [
    { name: 'vehicles', label: 'Vehicles', type: 'number' },
    { name: 'communication', label: 'Communication Devices', type: 'number' },
    { name: 'equipment', label: 'Technical Equipment', type: 'number' },
    { name: 'details', label: 'Details', type: 'text' },
  ],
};



export default function OrganizationProfileForm({
  userId,
  profile,
}: OrganizationProfileFormProps) {
  // --- State variables (Keep existing, including imagePreview) ---
  const [socialLinks, setSocialLinks] = useState<{
    [platform: string]: string;
  }>(profile.socialMedia || {});
  const [sponsors, setSponsors] = useState<SponsorData[]>(
    (profile.sponsors || []).map((sponsor) => ({
      id: sponsor.id || Date.now().toString(),
      name: sponsor.name || '',
      other: sponsor.other || '',
      imageUrl: sponsor.imageUrl ?? undefined,
      photoFile: null,
      photoPreview: sponsor.imageUrl || null,
    }))
  );
  const [displayImageUrl, setDisplayImageUrl] = useState<string | undefined>(
    profile.profileImageUrl
  );
  const [currentSponsor, setCurrentSponsor] = useState<{
    name: string;
    other: string;
  }>({ name: '', other: '' });
  const [editingSponsorIndex, setEditingSponsorIndex] = useState<number | null>(
    null
  );
  const [aidStock, setAidStock] = useState<{
    [key: string]: Record<string, unknown>;
  }>(profile.aidStock || {});
  const [imageFile, setImageFile] = useState<File | null>(null); // State for the COMPRESSED file
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State for the object URL preview
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(
    profile.coordinates?.latitude ?? null
  );
  const [longitude, setLongitude] = useState<number | null>(
    profile.coordinates?.longitude ?? null
  );

  // --- Handlers (Keep existing non-image handlers) ---
  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    console.log(`Form received location update: Lat: ${lat}, Lng: ${lng}`);
  }, []);
  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };
  const handleAidStockChange = (
    aidId: string,
    field: string,
    value: string | boolean
  ) => {
    setAidStock((prev) => {
      const currentAidStock = prev[aidId] || { available: true };
      const processedValue =
        aidTypeFields[aidId as keyof typeof aidTypeFields]?.find(
          (f) => f.name === field
        )?.type === 'number'
          ? value === ''
            ? '0'
            : value
          : value;
      return {
        ...prev,
        [aidId]: {
          ...currentAidStock,
          [field]: processedValue,
        },
      };
    });
  };
  const toggleAidAvailability = (aidId: string) => {
    setAidStock((prev) => {
      const isCurrentlyAvailable = !!prev[aidId]?.available;
      if (!isCurrentlyAvailable) {
        const newAidStock = { ...prev };
        const fieldsForType =
          aidTypeFields[aidId as keyof typeof aidTypeFields] || [];
        const newAidTypeStock: Record<string, unknown> = { available: true };
        fieldsForType.forEach((field) => {
          newAidTypeStock[field.name] = field.type === 'number' ? '0' : '';
        });
        newAidStock[aidId] = newAidTypeStock;
        return newAidStock;
      }
      return {
        ...prev,
        [aidId]: {
          ...(prev[aidId] || {}),
          available: !isCurrentlyAvailable,
        },
      };
    });
  };
  // --- Sponsor Handlers (Keep as is) ---
  const handleAddSponsor = () => {
    if (currentSponsor.name.trim()) {
      if (editingSponsorIndex !== null) {
        const updatedSponsors = [...sponsors];
        updatedSponsors[editingSponsorIndex] = {
          ...updatedSponsors[editingSponsorIndex],
          name: currentSponsor.name,
          other: currentSponsor.other,
        };
        setSponsors(updatedSponsors);
        setEditingSponsorIndex(null);
      } else {
        setSponsors([
          ...sponsors,
          {
            id: Date.now().toString(),
            name: currentSponsor.name,
            other: currentSponsor.other,
            photoFile: null,
            photoPreview: null,
            imageUrl: undefined,
          },
        ]);
      }
      setCurrentSponsor({ name: '', other: '' });
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
      setEditingSponsorIndex(null);
      setCurrentSponsor({ name: '', other: '' });
    }
  };
  const handleSponsorImageUpload = async (index: number, file: File) => {
    // Sponsor image upload logic goes here
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
    if (isSubmitting || isCompressing) {
      return;
    }
    if (!latitude || !longitude) {
      setError(
        'Please set your organization location on the map before saving.'
      );
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);

    Object.entries(socialLinks).forEach(([platform, link]) => {
      formData.append(`socialMedia.${platform}`, link || '');
    });
    const sponsorsToSave = sponsors.map(
      ({ photoFile, photoPreview, ...rest }) => ({
        ...rest,
        imageUrl: rest.imageUrl ?? null,
      })
    );
    formData.append('sponsors', JSON.stringify(sponsorsToSave));
    formData.append('aidStock', JSON.stringify(aidStock));
    formData.append(
      'coordinates',
      JSON.stringify({
        latitude: latitude,
        longitude: longitude,
        type: 'geopoint',
      })
    );

    // Append the COMPRESSED image file (if it exists in state)
    if (imageFile) {
      formData.append('profileImage', imageFile, imageFile.name);
    }

    try {
      const result = await updateProfileData(userId, 'organization', formData);

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
            {/* Input and Buttons (Keep as is, including cancel button logic) */}
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
                  if (input) input.value = '';
                }}
                className="ml-3 text-sm text-red-600 hover:text-red-800"
              >
                Cancel Change
              </button>
            )}
          </div>
        </div>
        {/* Feedback Messages (Keep as is) */}
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

      {/* Other Form Sections (Keep as is) */}
      {/* Organization Details */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Organization Details</h3>
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
            defaultValue={profile.name || ''}
            readOnly
          />
        </div>
        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block mb-1 font-medium">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            className="w-full p-2 border rounded h-32"
            defaultValue={profile.description || ''}
          />
        </div>
        {/* Contact Person */}
        <div className="mb-4">
          <label htmlFor="contactPerson" className="block mb-1 font-medium">
            Contact Person:
          </label>
          <input
            type="text"
            id="contactPerson"
            name="contactPerson"
            className="w-full p-2 border rounded"
            defaultValue={profile.contactPerson || ''}
          />
        </div>
        {/* Contact Person Position */}
        <div className="mb-4">
          <label htmlFor="orgPosition" className="block mb-1 font-medium">
            Contact Person&apos;s Position:
          </label>
          <input
            type="text"
            id="orgPosition"
            name="orgPosition"
            className="w-full p-2 border rounded"
            defaultValue={profile.orgPosition || ''}
          />
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Organization Location</h3>
        <p className="text-sm text-gray-600 mb-2">
          Click on the map to set or update your organization&apos;s precise
          location.
        </p>
        <LocationSetterMapWrapper
          initialLatitude={latitude}
          initialLongitude={longitude}
          onLocationChange={handleLocationChange}
        />
        {latitude && longitude ? (
          <p className="text-sm text-gray-800 mt-2">
            Selected Coordinates: Lat: {latitude.toFixed(6)}, Lng:{' '}
            {longitude.toFixed(6)}
          </p>
        ) : (
          <p className="text-sm text-yellow-600 mt-2">
            No location set. Please click on the map.
          </p>
        )}
      </div>

      {/* Contact Information */}
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

      {/* Aid Stock Management */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">Aid Stock Management</h3>
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
                    className="font-medium text-black"
                  >
                    {aidType.label}
                  </label>
                </div>
                {isAvailable && (
                  <div className="pl-6 space-y-2">
                    {aidTypeFields[
                      aidType.id as keyof typeof aidTypeFields
                    ]?.map((field) => (
                      <div key={`${aidType.id}-${field.name}`}>
                        <label className="text-sm block text-black">
                          {field.label}:
                        </label>
                        {field.type === 'number' ? (
                          <input
                            type="number"
                            value={
                              (aidStock[aidType.id]?.[field.name] as
                                | string
                                | number) ||
                              (field.type === 'number' ? '0' : '')
                            }
                            onChange={(e) =>
                              handleAidStockChange(
                                aidType.id,
                                field.name,
                                e.target.value
                              )
                            }
                            className="w-full p-1 border rounded text-black"
                            min="0"
                          />
                        ) : (
                          <input
                            type="text"
                            value={
                              (aidStock[aidType.id]?.[field.name] as string) ||
                              ''
                            }
                            onChange={(e) =>
                              handleAidStockChange(
                                aidType.id,
                                field.name,
                                e.target.value
                              )
                            }
                            className="w-full p-1 border rounded text-black"
                          />
                        )}
                      </div>
                    ))}
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
                      <p className="text-sm text-gray-600">{sponsor.other}</p>
                    )}
                    {(sponsor.photoPreview || sponsor.imageUrl) && (
                      <img
                        src={sponsor.photoPreview || sponsor.imageUrl || ''}
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
            {editingSponsorIndex !== null ? 'Edit Sponsor' : 'Add New Sponsor'}
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
                  setCurrentSponsor({ ...currentSponsor, name: e.target.value })
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
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleAddSponsor}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                {editingSponsorIndex !== null ? 'Update' : 'Add'} Sponsor
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
          {error && !error.includes('compress') && (
            <p className="text-red-500 text-sm">{error}</p>
          )}{' '}
          {/* Only show submit errors here */}
          {successMessage && (
            <p className="text-green-600 text-sm">{successMessage}</p>
          )}
        </div>
      </div>
    </form>
  );
}
