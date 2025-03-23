"use client";

import { createContext } from "react";

export interface VolunteerProfileData {
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
    description?: string;  // Added optional field
    skills?: string;
    availability?: string;
}

export interface VolunteerProfileContextType {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    imagePreview: string;
    setImagePreview: (value: string) => void;
    showPasswordForm: boolean;
    setShowPasswordForm: (value: boolean) => void;
    profileData: VolunteerProfileData;
    setProfileData: (data: VolunteerProfileData) => void;
}

export const VolunteerProfileContext = createContext<VolunteerProfileContextType | undefined>(undefined);
