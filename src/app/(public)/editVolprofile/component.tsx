'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';

// Define types
type ProfileData = {
    name: string;
    email: string;
    contactNumber: string;
    username: string;
    profileImageUrl: string;
    organizationId: string;
    organization: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
};

type EditableData = {
    name: string;
    email: string;
    contactNumber: string;
    organizationId: string;
};

type PasswordForm = {
    currentPassword: string;
    newPassword: string;
    retypePassword: string;
};

type OrganizationsMap = {
    [key: string]: string;
};

const VolunteerProfileManagement = () => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('/profile-placeholder.jpg');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        currentPassword: '',
        newPassword: '',
        retypePassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);

    // Hardcoded profile data
    const [profileData, setProfileData] = useState<ProfileData>({
        name: "John Doe",
        email: "johndoe@example.com",
        contactNumber: "(555) 123-4567",
        username: "johndoe123",
        profileImageUrl: '/profile-placeholder.jpg',
        organizationId: "org1",
        organization: "Community Helpers",
        createdAt: "2023-06-15T10:30:00.000Z",
        updatedAt: "2024-02-20T14:45:00.000Z",
        userId: "user123"
    });

    // Hardcoded organizations
    const organizations: OrganizationsMap = {
        "org1": "Community Helpers",
        "org2": "Local Food Bank",
        "org3": "Animal Shelter",
        "org4": "Environmental Group"
    };

    // Hardcoded contributions
    const contributions = "Volunteered 45 hours in the last 3 months. Participated in 5 community events. Led the downtown cleanup initiative.";

    const [editableData, setEditableData] = useState<EditableData>({
        name: profileData.name,
        email: profileData.email,
        contactNumber: profileData.contactNumber,
        organizationId: profileData.organizationId
    });

    // Initialize imagePreview from profileData when component mounts
    useEffect(() => {
        setImagePreview(profileData.profileImageUrl);
    }, [profileData.profileImageUrl]);

    const handleEditToggle = (): void => {
        if (isEditing) {
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

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setEditableData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setImage(selectedFile);

            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                if (event.target?.result) {
                    setImagePreview(event.target.result as string);
                }
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleRemoveImage = (): void => {
        setImage(null);
        setImagePreview('/profile-placeholder.jpg');
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            // Update the profile data with new values including the image
            const updatedProfileData = {
                ...profileData,
                name: editableData.name,
                email: editableData.email,
                contactNumber: editableData.contactNumber,
                organizationId: editableData.organizationId,
                organization: organizations[editableData.organizationId] || 'Unknown Organization',
                updatedAt: new Date().toISOString()
            };
            
            // Only update the image URL if it has changed
            if (imagePreview !== profileData.profileImageUrl) {
                updatedProfileData.profileImageUrl = imagePreview;
            }
            
            setProfileData(updatedProfileData);
            setSuccess("Profile updated successfully!");
            setIsEditing(false);
            setIsLoading(false);
        }, 1000);
    };

    const handlePasswordSubmit = (e: FormEvent): void => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setSuccess("Password updated successfully!");
            setShowPasswordForm(false);
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                retypePassword: ''
            });
            setIsLoading(false);
        }, 1000);
    };

    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Clear success/error messages after a timeout
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess(null);
                setError(null);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [success, error]);

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
                                    {imagePreview && imagePreview !== '/profile-placeholder.jpg' && (
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
                                <p className="text-gray-600">{profileData.organization}</p>
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
                                    <p className="text-gray-700">{contributions}</p>
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