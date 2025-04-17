'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { getProfileData, updateProfileData } from '@/actions/profileActions';

// Import types
import {
  AidTypeId,
  aidTypes,
  AidDetails,
  SocialLinks,
  SocialLink,
  Sponsor
} from '@/components/(page)/AuthPage/OrgRegForm/types'; // Adjust path as needed

// Define interfaces matching your data structure
// Update the UserProfile type definitions
// In EditProfileForm.tsx
interface VolunteerProfile {
  userId: string;
  firstName?: string;
  surname?: string;
  contactNumber?: string;
  roleOrCategory?: string;
  skills?: string[];
  organizationId?: string;
  // Add this line:
  socialMedia?: Record<string, string>;
}

interface OrganizationProfile {
  userId: string;
  name?: string;
  contactNumber?: string;
  description?: string;
  contactPerson?: string;
  orgPosition?: string;
  aidStock?: {
    [aidId: string]: {
      available: boolean;
      [key: string]: unknown; // Replace any with unknown
    };
  };
  sponsors?: Sponsor[];
  // Add this line:
  socialMedia?: Record<string, string>;
}

// Define a type for sponsor data
interface SponsorData {
  id: string;
  name: string;
  other: string;
  photoFile: File | null;
  photoPreview: string | null;
  imageUrl?: string;
}

type UserProfile = VolunteerProfile | OrganizationProfile;
type UserType = 'volunteer' | 'organization' | 'unknown';

interface EditProfileFormProps {
  userId: string;
  organizations?: { id: string; name: string }[]; // For volunteer org selection
}

export default function EditProfileForm({ userId, organizations = [] }: EditProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<UserType>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // State for managing social media editing
  const [socialLinks, setSocialLinks] = useState<{[platform: string]: string}>({});
  
  // State for sponsor management (organizations only)
  const [sponsors, setSponsors] = useState<SponsorData[]>([]);
  const [currentSponsor, setCurrentSponsor] = useState<{name: string, other: string}>({name: '', other: ''});
  const [editingSponsorIndex, setEditingSponsorIndex] = useState<number | null>(null);
  
  // State for aid stock management (organizations only)
  const [aidStock, setAidStock] = useState<{[key: string]: Record<string, unknown>}>({});

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
          // Create a copy of the profile with socialMedia property if it doesn't exist
          const profileWithDefaults = {
            ...result.profile,
            socialMedia: result.profile.socialMedia || {}
          };
          
          setProfile(profileWithDefaults);
          setUserType(result.userType);
          
          // Initialize social media links from profile
          setSocialLinks(profileWithDefaults.socialMedia);
          
          // Initialize sponsors for organizations
          if (result.userType === 'organization') {
            const orgProfile = profileWithDefaults as OrganizationProfile;
            
            // Set sponsors with defaults if not present
            const sponsorsList = orgProfile.sponsors || [];
            const formattedSponsors = sponsorsList.map(sponsor => {
              const sponsorObj = sponsor as unknown as Record<string, unknown>;
              return {
                id: typeof sponsorObj === 'object' && sponsorObj !== null ? 
                  (sponsorObj.id as string) || Date.now().toString() : 
                  Date.now().toString(),
                name: typeof sponsorObj === 'object' && sponsorObj !== null ? 
                  (sponsorObj.name as string) || '' : '',
                other: typeof sponsorObj === 'object' && sponsorObj !== null ? 
                  (sponsorObj.other as string) || '' : '',
                photoFile: null,
                photoPreview: typeof sponsorObj === 'object' && sponsorObj !== null ? 
                  (sponsorObj.imageUrl as string) || null : null
              };
            });
            
            setSponsors(formattedSponsors);
            
            // Set aid stock with defaults if not present
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

  // Handle form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile || userType === 'unknown' || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    
    // Add social media data to form
    Object.entries(socialLinks).forEach(([platform, link]) => {
      if (link) {
        formData.append(`socialMedia.${platform}`, link);
      }
    });
    
    // Add sponsors data for organizations
    if (userType === 'organization') {
      formData.append('sponsors', JSON.stringify(sponsors));
    }
    
    // Add aid stock data for organizations
    if (userType === 'organization') {
      formData.append('aidStock', JSON.stringify(aidStock));
    }

    try {
      const result = await updateProfileData(userId, userType, formData);
      if (result.success) {
        setSuccessMessage(result.message);
      } else {
        setError(result.message);
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
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }));
  };
  
  // Handle aid stock changes for organizations
  const handleAidStockChange = (aidId: string, field: string, value: string | boolean) => {
    setAidStock(prev => ({
      ...prev,
      [aidId]: {
        ...(prev[aidId] || { available: false }),
        [field]: value
      }
    }));
  };
  
  // Toggle aid type availability
  const toggleAidAvailability = (aidId: string) => {
    setAidStock(prev => ({
      ...prev,
      [aidId]: {
        ...(prev[aidId] || {}),
        available: !((prev[aidId] || {}).available)
      }
    }));
  };
  
  // Handle sponsor form
  const handleAddSponsor = () => {
    if (currentSponsor.name.trim()) {
      if (editingSponsorIndex !== null) {
        // Update existing sponsor
        const updatedSponsors = [...sponsors];
        updatedSponsors[editingSponsorIndex] = {
          ...updatedSponsors[editingSponsorIndex],
          name: currentSponsor.name,
          other: currentSponsor.other,
        };
        setSponsors(updatedSponsors);
        setEditingSponsorIndex(null);
      } else {
        // Add new sponsor
        setSponsors([...sponsors, {
          id: Date.now().toString(),
          name: currentSponsor.name,
          other: currentSponsor.other,
          photoFile: null,
          photoPreview: null
        }]);
      }
      // Reset form
      setCurrentSponsor({ name: '', other: '' });
    }
  };
  
  // Edit sponsor
  const handleEditSponsor = (index: number) => {
    const sponsor = sponsors[index];
    setCurrentSponsor({
      name: sponsor.name,
      other: sponsor.other
    });
    setEditingSponsorIndex(index);
  };
  
  // Remove sponsor
  const handleRemoveSponsor = (index: number) => {
    const updatedSponsors = [...sponsors];
    updatedSponsors.splice(index, 1);
    setSponsors(updatedSponsors);
    
    if (editingSponsorIndex === index) {
      setEditingSponsorIndex(null);
      setCurrentSponsor({ name: '', other: '' });
    }
  };

  // Render loading state
  if (isLoading) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }

  // Render error state
  if (error && !profile) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  // Render form based on user type
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        Edit {userType === 'volunteer' ? 'Volunteer' : userType === 'organization' ? 'Organization' : 'Unknown'} Profile
      </h2>

      {profile && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Fields - Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
            
            {/* Contact Number for both user types */}
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
            
            {/* Social Media Links for both user types */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Social Media Links</h4>
              {['facebook', 'twitter', 'instagram'].map(platform => (
                <div key={platform} className="mb-2">
                  <label htmlFor={`social-${platform}`} className="block mb-1 capitalize">
                    {platform}:
                  </label>
                  <input
                    type="text"
                    id={`social-${platform}`}
                    value={socialLinks[platform] || ''}
                    onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
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
              
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block mb-1 font-medium">
                    First Name:
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full p-2 border rounded"
                    defaultValue={(profile as VolunteerProfile).firstName || ''}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Name cannot be changed in profile</p>
                </div>
                
                <div>
                  <label htmlFor="surname" className="block mb-1 font-medium">
                    Surname:
                  </label>
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    className="w-full p-2 border rounded"
                    defaultValue={(profile as VolunteerProfile).surname || ''}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Surname cannot be changed in profile</p>
                </div>
              </div>
              
              {/* Role Preference */}
              <div className="mb-4">
                <label htmlFor="roleOrCategory" className="block mb-1 font-medium">
                  Role Preference:
                </label>
                <input
                  type="text"
                  id="roleOrCategory"
                  name="roleOrCategory"
                  className="w-full p-2 border rounded"
                  defaultValue={(profile as VolunteerProfile).roleOrCategory || ''}
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
                  defaultValue={(profile as VolunteerProfile).skills?.join(', ') || ''}
                />
              </div>
              
              {/* Affiliated Organization */}
              <div className="mb-4">
                <label htmlFor="organizationId" className="block mb-1 font-medium">
                  Affiliated Organization:
                </label>
                <select
                  id="organizationId"
                  name="organizationId"
                  className="w-full p-2 border rounded"
                  defaultValue={(profile as VolunteerProfile).organizationId || ''}
                >
                  <option value="">-- Select Organization --</option>
                  {organizations.map(org => (
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
              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">Organization Details</h3>
                
                {/* Organization Name - Read Only */}
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
                  <p className="text-xs text-gray-500 mt-1">Organization name cannot be changed in profile</p>
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
                    defaultValue={(profile as OrganizationProfile).description || ''}
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
                    defaultValue={(profile as OrganizationProfile).contactPerson || ''}
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
                    defaultValue={(profile as OrganizationProfile).orgPosition || ''}
                  />
                </div>
              </div>
              
              {/* Aid Stock Management */}
              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">Aid Stock Management</h3>
                
                <div className="space-y-4">
                  {aidTypes.map(aidType => {
                    const isAvailable = (aidStock[aidType.id]?.available as boolean) || false;
                    
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
                          <label htmlFor={`aid-${aidType.id}`} className="font-medium">
                            {aidType.label}
                          </label>
                        </div>
                        
                        {isAvailable && (
                          <div className="pl-6 space-y-2">
                            {aidType.id === 'food' && (
                              <>
                                <div>
                                  <label htmlFor="food-packs" className="block text-sm">Food Packs:</label>
                                  <input
                                    type="number"
                                    id="food-packs"
                                    value={aidStock.food?.foodPacks as string || ''}
                                    onChange={(e) => handleAidStockChange('food', 'foodPacks', e.target.value)}
                                    className="w-full p-1 border rounded"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="food-category" className="block text-sm">Category:</label>
                                  <input
                                    type="text"
                                    id="food-category"
                                    value={aidStock.food?.category as string || ''}
                                    onChange={(e) => handleAidStockChange('food', 'category', e.target.value)}
                                    className="w-full p-1 border rounded"
                                  />
                                </div>
                              </>
                            )}
                            
                            {aidType.id === 'clothing' && (
                              <>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label htmlFor="clothing-male" className="block text-sm">Male:</label>
                                    <input
                                      type="number"
                                      id="clothing-male"
                                      value={aidStock.clothing?.male as string || ''}
                                      onChange={(e) => handleAidStockChange('clothing', 'male', e.target.value)}
                                      className="w-full p-1 border rounded"
                                      min="0"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="clothing-female" className="block text-sm">Female:</label>
                                    <input
                                      type="number"
                                      id="clothing-female"
                                      value={aidStock.clothing?.female as string || ''}
                                      onChange={(e) => handleAidStockChange('clothing', 'female', e.target.value)}
                                      className="w-full p-1 border rounded"
                                      min="0"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="clothing-children" className="block text-sm">Children:</label>
                                    <input
                                      type="number"
                                      id="clothing-children"
                                      value={aidStock.clothing?.children as string || ''}
                                      onChange={(e) => handleAidStockChange('clothing', 'children', e.target.value)}
                                      className="w-full p-1 border rounded"
                                      min="0"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {aidType.id === 'medicalSupplies' && (
                              <>
                                <div>
                                  <label htmlFor="medical-kits" className="block text-sm">Medical Kits:</label>
                                  <input
                                    type="number"
                                    id="medical-kits"
                                    value={aidStock.medicalSupplies?.kits as string || ''}
                                    onChange={(e) => handleAidStockChange('medicalSupplies', 'kits', e.target.value)}
                                    className="w-full p-1 border rounded"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="medical-type" className="block text-sm">Kit Type:</label>
                                  <input
                                    type="text"
                                    id="medical-type"
                                    value={aidStock.medicalSupplies?.kitType as string || ''}
                                    onChange={(e) => handleAidStockChange('medicalSupplies', 'kitType', e.target.value)}
                                    className="w-full p-1 border rounded"
                                  />
                                </div>
                              </>
                            )}
                            
                            {aidType.id === 'shelter' && (
                              <>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label htmlFor="shelter-tents" className="block text-sm">Tents:</label>
                                    <input
                                      type="number"
                                      id="shelter-tents"
                                      value={aidStock.shelter?.tents as string || ''}
                                      onChange={(e) => handleAidStockChange('shelter', 'tents', e.target.value)}
                                      className="w-full p-1 border rounded"
                                      min="0"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="shelter-blankets" className="block text-sm">Blankets:</label>
                                    <input
                                      type="number"
                                      id="shelter-blankets"
                                      value={aidStock.shelter?.blankets as string || ''}
                                      onChange={(e) => handleAidStockChange('shelter', 'blankets', e.target.value)}
                                      className="w-full p-1 border rounded"
                                      min="0"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {aidType.id === 'searchAndRescue' && (
                              <>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label htmlFor="rescue-kits" className="block text-sm">Rescue Kits:</label>
                                    <input
                                      type="number"
                                      id="rescue-kits"
                                      value={aidStock.searchAndRescue?.rescueKits as string || ''}
                                      onChange={(e) => handleAidStockChange('searchAndRescue', 'rescueKits', e.target.value)}
                                      className="w-full p-1 border rounded"
                                      min="0"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="rescue-personnel" className="block text-sm">Personnel:</label>
                                    <input
                                      type="number"
                                      id="rescue-personnel"
                                      value={aidStock.searchAndRescue?.rescuePersonnel as string || ''}
                                      onChange={(e) => handleAidStockChange('searchAndRescue', 'rescuePersonnel', e.target.value)}
                                      className="w-full p-1 border rounded"
                                      min="0"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {aidType.id === 'financialAssistance' && (
                              <>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label htmlFor="financial-funds" className="block text-sm">Total Funds:</label>
                                    <input
                                      type="number"
                                      id="financial-funds"
                                      value={aidStock.financialAssistance?.totalFunds as string || ''}
                                      onChange={(e) => handleAidStockChange('financialAssistance', 'totalFunds', e.target.value)}
                                      className="w-full p-1 border rounded"
                                      min="0"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="financial-currency" className="block text-sm">Currency:</label>
                                    <input
                                      type="text"
                                      id="financial-currency"
                                      value={aidStock.financialAssistance?.currency as string || ''}
                                      onChange={(e) => handleAidStockChange('financialAssistance', 'currency', e.target.value)}
                                      className="w-full p-1 border rounded"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {aidType.id === 'counseling' && (
                              <>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label htmlFor="counseling-counselors" className="block text-sm">Counselors:</label>
                                    <input
                                      type="number"
                                      id="counseling-counselors"
                                      value={aidStock.counseling?.counselors as string || ''}
                                      onChange={(e) => handleAidStockChange('counseling', 'counselors', e.target.value)}
                                      className="w-full p-1 border rounded"
                                      min="0"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="counseling-hours" className="block text-sm">Hours Available:</label>
                                    <input
                                      type="number"
                                      id="counseling-hours"
                                      value={aidStock.counseling?.hours as string || ''}
                                      onChange={(e) => handleAidStockChange('counseling', 'hours', e.target.value)}
                                      className="w-full p-1 border rounded"
                                      min="0"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {aidType.id === 'technicalSupport' && (
                              <>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label htmlFor="technical-vehicles" className="block text-sm">Vehicles:</label>
                                    <input
                                      type="number"
                                      id="technical-vehicles"
                                      value={aidStock.technicalSupport?.vehicles as string || ''}
                                      onChange={(e) => handleAidStockChange('technicalSupport', 'vehicles', e.target.value)}
                                      className="w-full p-1 border rounded"
                                      min="0"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="technical-communication" className="block text-sm">Communication Equipment:</label>
                                    <input
                                      type="number"
                                      id="technical-communication"
                                      value={aidStock.technicalSupport?.communication as string || ''}
                                      onChange={(e) => handleAidStockChange('technicalSupport', 'communication', e.target.value)}
                                      className="w-full p-1 border rounded"
                                      min="0"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
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
                        <li key={sponsor.id || index} className="flex items-center justify-between border p-2 rounded">
                          <div>
                            <p className="font-medium">{sponsor.name}</p>
                            {sponsor.other && <p className="text-sm text-gray-600">{sponsor.other}</p>}
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
                      <label htmlFor="sponsor-name" className="block mb-1">Sponsor Name:</label>
                      <input
                        type="text"
                        id="sponsor-name"
                        value={currentSponsor.name}
                        onChange={(e) => setCurrentSponsor({...currentSponsor, name: e.target.value})}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label htmlFor="sponsor-details" className="block mb-1">Other Details:</label>
                      <textarea
                        id="sponsor-details"
                        value={currentSponsor.other}
                        onChange={(e) => setCurrentSponsor({...currentSponsor, other: e.target.value})}
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
            </>
          )}

          {/* Submission Area */}
          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={isSubmitting || userType === 'unknown'}
              className={`px-6 py-2 rounded-lg text-white ${
                isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            
            {/* Status Messages */}
            {error && <p className="text-red-500">{error}</p>}
            {successMessage && <p className="text-green-600">{successMessage}</p>}
          </div>
        </form>
      )}

      {/* Handle case where profile is not found after loading */}
      {!profile && !isLoading && userType === 'unknown' && !error && (
        <div className="p-4 text-center bg-yellow-50 border border-yellow-200 rounded-lg">
          Profile could not be loaded or does not exist.
        </div>
      )}
    </div>
  );
}