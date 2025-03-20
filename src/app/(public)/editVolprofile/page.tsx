'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import preview from '../../../../public/PreviewPhoto.svg';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface ProfileData {
  name: string;
  email: string;
  contactNumber: string;
  username: string;
  profileImageUrl: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  organization?: string; // Will be populated after fetching organization details
}

const VolunteerProfileManagement: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    retypePassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editableData, setEditableData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    organizationId: ''
  });
  
  const [organizations, setOrganizations] = useState<{[key: string]: string}>({});
  const [contributions, setContributions] = useState<string>('');
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          setError('You must be logged in to view your profile');
          return;
        }
        
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'volunteers', currentUser.uid));
        
        if (!userDoc.exists()) {
          setError('Volunteer profile not found');
          return;
        }
        
        const userData = userDoc.data() as ProfileData;
        
        // Get organization name
        const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
        
        // Fetch available organizations for the dropdown
        const orgsSnapshot = await getDoc(doc(db, 'organizations-list', 'all'));
        const orgsData = orgsSnapshot.exists() ? orgsSnapshot.data() : { organizations: {} };
        setOrganizations(orgsData.organizations || {});
        
        // Fetch volunteer contributions/activities
        const activitiesSnapshot = await getDoc(doc(db, 'volunteer-activities', currentUser.uid));
        const activitiesData = activitiesSnapshot.exists() ? activitiesSnapshot.data() : { description: '' };
        setContributions(activitiesData.description || '');
        
        // Set profile data
        const fullData = {
          ...userData,
          organization: orgDoc.exists() ? orgDoc.data().name : 'Unknown Organization'
        };
        
        setProfileData(fullData);
        setEditableData({
          name: fullData.name,
          email: fullData.email,
          contactNumber: fullData.contactNumber,
          organizationId: fullData.organizationId
        });
        
        // Set profile image if available
        if (fullData.profileImageUrl) {
          setImagePreview(fullData.profileImageUrl);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);
  
  const handleEditToggle = () => {
    if (isEditing && profileData) {
      // Cancel editing - reset to original data
      setEditableData({
        name: profileData.name,
        email: profileData.email,
        contactNumber: profileData.contactNumber,
        organizationId: profileData.organizationId
      });
      setImagePreview(profileData.profileImageUrl);
      setImage(null);
    }
    setIsEditing(!isEditing);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditableData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleRemoveImage = () => {
    setImage(null);
    // If there was an existing image, keep that as the preview
    if (profileData && profileData.profileImageUrl) {
      setImagePreview(profileData.profileImageUrl);
    } else {
      setImagePreview(null);
    }
  };
  
  const validateForm = () => {
    if (!editableData.name.trim()) return "Name is required";
    if (!editableData.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(editableData.email)) return "Email format is invalid";
    if (!editableData.contactNumber.trim()) return "Contact number is required";
    return null;
  };
  
  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) return "Current password is required";
    if (!passwordForm.newPassword) return "New password is required";
    if (passwordForm.newPassword.length < 6) return "Password must be at least 6 characters";
    if (passwordForm.newPassword !== passwordForm.retypePassword) return "Passwords don't match";
    return null;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setSuccess(null);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    if (!profileData) {
      setError("Profile data not loaded");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        setError('You must be logged in to update your profile');
        return;
      }
      
      const db = getFirestore();
      const storage = getStorage();
      
      // Update profile image if changed
      let profileImageUrl = profileData.profileImageUrl;
      
      if (image) {
        // Upload new image
        const storageRef = ref(storage, `volunteers/${currentUser.uid}/profile-image`);
        await uploadBytes(storageRef, image);
        profileImageUrl = await getDownloadURL(storageRef);
      } else if (profileData.profileImageUrl && !imagePreview) {
        // Delete image if removed
        const storageRef = ref(storage, `volunteers/${currentUser.uid}/profile-image`);
        await deleteObject(storageRef);
        profileImageUrl = '';
      }
      
      // Update profile data
      const updateData = {
        name: editableData.name,
        email: editableData.email,
        contactNumber: editableData.contactNumber,
        organizationId: editableData.organizationId,
        profileImageUrl,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'volunteers', currentUser.uid), updateData);
      
      // Get organization name for display
      const orgDoc = await getDoc(doc(db, 'organizations', editableData.organizationId));
      const orgName = orgDoc.exists() ? orgDoc.data().name : 'Unknown Organization';
      
      // Update local state
      setProfileData({
        ...profileData,
        ...updateData,
        organization: orgName
      });
      
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setSuccess(null);
    
    const validationError = validatePasswordForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        setError('You must be logged in to change your password');
        return;
      }
      
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordForm.newPassword);
      
      setSuccess("Password updated successfully!");
      setShowPasswordForm(false);
      
      // Reset password form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        retypePassword: ''
      });
    } catch (error) {
      console.error("Error updating password:", error);
      let errorMessage = "An unexpected error occurred.";
      
      if (error instanceof Error) {
        if (error.message.includes('auth/wrong-password')) {
          errorMessage = "Current password is incorrect.";
        } else if (error.message.includes('auth/requires-recent-login')) {
          errorMessage = "Please log out and log back in before changing your password.";
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  if (isLoading && !profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-8 text-black">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error || "Failed to load profile data. Please try again later."}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 text-black">
      <h1 className="text-2xl font-bold mb-6">Volunteer Profile Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            {/* Profile Image Section */}
            <div className="md:w-1/4 flex flex-col items-center justify-start md:border-r md:pr-6">
              <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gray-300 mb-4">
                {!imagePreview && (
                  <Image
                    src={preview}
                    alt="Profile"
                    layout="fill"
                    objectFit="cover"
                  />
                )}
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
                {isEditing && (
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                )}
              </div>
              
              {isEditing && (
                <div className="flex flex-col items-center">
                  <label
                    htmlFor="profile-image"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer text-sm hover:bg-blue-600 mb-2"
                  >
                    Change Photo
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              )}
              
              <div className="text-center mt-4">
                <h2 className="font-bold text-xl">{profileData.name}</h2>
                <p className="text-gray-600">{profileData.organization || 'Organization'}</p>
                <p className="text-sm text-gray-500 mt-2">Member since: {formatDate(profileData.createdAt)}</p>
              </div>
            </div>
            
            {/* Profile Details Section */}
            <div className="md:w-3/4 md:pl-6 mt-6 md:mt-0">
              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editableData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <p className="text-gray-900">{profileData.username}</p>
                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editableData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="contactNumber"
                        value={editableData.contactNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.contactNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                    {isEditing ? (
                      <select
                        name="organizationId"
                        value={editableData.organizationId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Organization</option>
                        {Object.entries(organizations).map(([id, name]) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{profileData.organization}</p>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <p className="text-gray-900">••••••••</p>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="text-blue-500 hover:text-blue-700 text-sm mt-1"
                      >
                        {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
                      </button>
                    </div>
                  )}
                </div>
                
                {showPasswordForm && !isEditing && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium mb-4">Change Password</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Retype New Password</label>
                        <input
                          type="password"
                          name="retypePassword"
                          value={passwordForm.retypePassword}
                          onChange={handlePasswordInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={handlePasswordSubmit}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8">
                  <h3 className="font-medium mb-2">Contributions</h3>
                  <p className="text-gray-700">{contributions || 'No contributions recorded yet.'}</p>
                </div>
                
                <div className="mt-8 flex justify-end space-x-4">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleEditToggle}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEditToggle}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfileManagement;