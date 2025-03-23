"use client";

import { useState, useMemo, useContext, useEffect } from "react";
import { VolunteerProfileContext, VolunteerProfileData, VolunteerProfileContextType } from "./VolunteerProfileContext";
import { AuthContext } from "@/stores/AuthStores/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/Firebase/Firebase";

const DEFAULT_PROFILE: VolunteerProfileData = {
    name: "",
    email: "",
    contactNumber: "",
    username: "",
    profileImageUrl: "/logo.png",
    organizationId: "",
    organization: "",
    createdAt: "",
    updatedAt: "",
    userId: "",
    description: "",
    skills: "",
    availability: "",
};

const VolunteerProfileProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>("/logo.png");
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    
    const [profileData, setProfileData] = useState<VolunteerProfileData>(DEFAULT_PROFILE);

    useEffect(() => {
        if (!user?.uid) return;

        const fetchProfile = async () => {
            try {
                const profileRef = doc(db, "volunteers", user.uid);
                const profileSnap = await getDoc(profileRef);

                if (profileSnap.exists()) {
                    setProfileData(profileSnap.data() as VolunteerProfileData);
                    setImagePreview(profileSnap.data()?.profileImageUrl || "/logo.png");
                }
            } catch (error) {
                console.error("Error fetching volunteer profile:", error);
            }
        };

        fetchProfile();
    }, [user]);

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
