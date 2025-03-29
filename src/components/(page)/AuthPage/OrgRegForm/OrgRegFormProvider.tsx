"use client";

import { useState, useMemo } from "react";
import { OrgRegFormContext } from "./OrgRegFormContext";
import { AidTypeId, AidDetails, Sponsor, SocialLinks, OrgFormData, SocialLink } from "./types";

const initialCheckedAidState: Record<AidTypeId, boolean> = {
    food: false, clothing: false, medicalSupplies: false, shelter: false,
    searchAndRescue: false, financialAssistance: false, counseling: false, technicalSupport: false,
};

const initialAidDetailsState = {
    food: { foodPacks: '', category: '' },
    clothing: { male: '', female: '', children: '' },
    medicalSupplies: { kits: '', kitType: '' },
    shelter: { tents: '', blankets: '' },
    searchAndRescue: { rescueKits: '', rescuePersonnel: '' },
    financialAssistance: { totalFunds: '', currency: 'PHP' },
    counseling: { counselors: '', hours: '' },
    technicalSupport: { vehicles: '', communication: '' },
};

const initialFormData: OrgFormData = {
    name: '',
    email: '',
    contactNumber: '',
    acctUsername: '',
    password: '',
    retypePassword: '',
    type: '',
    description: '',
    location: '',
    dateOfEstablishment: '',
    otherText: '',
    contactPerson: '',
    orgPosition: '',
};

const initialSocialState: SocialLink = {
    username: '',
    link: '',
    mode: 'initial',
  };
  
  const initialSocialLinks: SocialLinks = {
    twitter: { ...initialSocialState },
    facebook: { ...initialSocialState },
    instagram: { ...initialSocialState },
  };


  export const OrgRegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [formData, setFormData] = useState<OrgFormData>(initialFormData);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [checkedAidTypes, setCheckedAidTypes] = useState<Record<AidTypeId, boolean>>(initialCheckedAidState);
    const [aidDetails, setAidDetails] = useState<AidDetails>(initialAidDetailsState);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [socialLinks, setSocialLinks] = useState<SocialLinks>(initialSocialLinks);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isAddingSponsor, setIsAddingSponsor] = useState<boolean>(false);
    const [currentSponsorData, setCurrentSponsorData] = useState<Omit<Sponsor, "id">>({
        name: "",
        other: "",
        photoFile: null,
        photoPreview: null,
    });

    const [editValues, setEditValues] = useState<{
        platform: keyof SocialLinks | null;
        username: string;
        link: string;
    }>({
        platform: null,
        username: "",
        link: "",
    });

    const [otherTextbox, setOtherTextbox] = useState<boolean>(false);
    const [showMainPassword, setShowMainPassword] = useState<boolean>(false);
    const [showRetypePassword, setShowRetypePassword] = useState<boolean>(false);

    // Memoized state values to optimize context re-renders
    const memoizedFormData = useMemo(() => formData, [formData]);
    const memoizedCheckedAidTypes = useMemo(() => checkedAidTypes, [checkedAidTypes]);
    const memoizedAidDetails = useMemo(() => aidDetails, [aidDetails]);
    const memoizedSponsors = useMemo(() => sponsors, [sponsors]);
    const memoizedSocialLinks = useMemo(() => socialLinks, [socialLinks]);
    const memoizedEditValues = useMemo(() => editValues, [editValues]);
    const memoizedCurrentSponsorData = useMemo(() => currentSponsorData, [currentSponsorData]);
    
    const contextValue = useMemo(() => ({
        formData: memoizedFormData, setFormData,
        image, setImage,
        imagePreview, setImagePreview,
        checkedAidTypes: memoizedCheckedAidTypes, setCheckedAidTypes,
        aidDetails: memoizedAidDetails, setAidDetails,
        sponsors: memoizedSponsors, setSponsors,
        socialLinks: memoizedSocialLinks, setSocialLinks,
        isMapModalOpen, setIsMapModalOpen,
        latitude, setLatitude,
        longitude, setLongitude,
        isLoading, setIsLoading,
        error, setError,
        success, setSuccess,
        isAddingSponsor, setIsAddingSponsor,
        currentSponsorData: memoizedCurrentSponsorData, setCurrentSponsorData,
        editValues: memoizedEditValues, setEditValues,
        otherTextbox, setOtherTextbox,
        showMainPassword, setShowMainPassword,
        showRetypePassword, setShowRetypePassword,
    }), [
        memoizedFormData, image, imagePreview, memoizedCheckedAidTypes, 
        memoizedAidDetails, memoizedSponsors, memoizedSocialLinks, isMapModalOpen,
        latitude, longitude, isLoading, error, success, isAddingSponsor, 
        memoizedCurrentSponsorData, memoizedEditValues, otherTextbox, 
        showMainPassword, showRetypePassword
    ]);

    return (
        <OrgRegFormContext.Provider value={contextValue}>
            {children}
        </OrgRegFormContext.Provider>
    );
};