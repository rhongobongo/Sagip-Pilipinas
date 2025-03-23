'use client';

import { useState, useMemo } from 'react';
import { VolunteerProfileContext, VolunteerProfileData, VolunteerProfileContextType } from './VolunteerProfileContext';

const VolunteerProfileProvider = ({ children }: { children: React.ReactNode }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>('/logo.png');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [profileData, setProfileData] = useState<VolunteerProfileData>({
        name: "John Doe",
        email: "johndoe@example.com",
        contactNumber: "(555) 123-4567",
        username: "johndoe123",
        profileImageUrl: '/logo.png',
        organizationId: "org1",
        organization: "Community Helpers",
        createdAt: "2023-06-15T10:30:00.000Z",
        updatedAt: "2024-02-20T14:45:00.000Z",
        userId: "user123"
    });

    const contextValue: VolunteerProfileContextType = useMemo(() => ({
        isEditing, setIsEditing,
        imagePreview, setImagePreview,
        showPasswordForm, setShowPasswordForm,
        profileData, setProfileData
    }), [isEditing, imagePreview, showPasswordForm, profileData]);

    return (
        <VolunteerProfileContext.Provider value={contextValue}>
            {children}
        </VolunteerProfileContext.Provider>
    );
};

export default VolunteerProfileProvider;
