export const aidTypes = [
    { id: 'food', label: 'Food' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'medicalSupplies', label: 'Medical Supplies' },
    { id: 'shelter', label: 'Shelter' },
    { id: 'searchAndRescue', label: 'Search and Rescue' },
    { id: 'financialAssistance', label: 'Financial Assistance' },
    { id: 'counseling', label: 'Counseling' },
    { id: 'technicalSupport', label: 'Technical/Logistical Support' },
] as const;

export type AidTypeId = (typeof aidTypes)[number]['id'];

export interface AidDetails {
    food: { foodPacks: string; category: string };
    clothing: { male: string; female: string; children: string };
    medicalSupplies: { kits: string; kitType: string };
    shelter: { tents: string; blankets: string };
    searchAndRescue: { rescueKits: string; rescuePersonnel: string };
    financialAssistance: { totalFunds: string; currency: string };
    counseling: { counselors: string; hours: string };
    technicalSupport: { vehicles: string; communication: string };
}

export interface SocialLink {
    username: string;
    link: string;
    mode: 'initial' | 'adding' | 'editing' | 'added';
}

export interface SocialLinks {
    twitter: SocialLink;
    facebook: SocialLink;
    instagram: SocialLink;
}

export interface OrgFormData {
    name: string;
    email: string;
    contactNumber: string;
    acctUsername: string;
    password: string;
    retypePassword: string;
    type: string;
    description: string;
    location: string;
    dateOfEstablishment: string;
    otherText: string;
    contactPerson: string;
    orgPosition: string;
}

export interface Sponsor {
    id: string;
    name: string;
    other: string;
    photoFile: File | null;
    photoPreview: string | null;
}



export interface OrgRegistrationContextType {
    formData: OrgFormData;
    setFormData: React.Dispatch<React.SetStateAction<OrgFormData>>;
    image: File | null;
    setImage: React.Dispatch<React.SetStateAction<File | null>>;
    imagePreview: string | null;
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
    checkedAidTypes: Record<string, boolean>;
    setCheckedAidTypes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    aidDetails: AidDetails;
    setAidDetails: React.Dispatch<React.SetStateAction<AidDetails>>;
    sponsors: Sponsor[];
    setSponsors: React.Dispatch<React.SetStateAction<Sponsor[]>>;
    isAddingSponsor: boolean;
    setIsAddingSponsor: React.Dispatch<React.SetStateAction<boolean>>;
    currentSponsorData: Omit<Sponsor, "id">;
    setCurrentSponsorData: React.Dispatch<React.SetStateAction<Omit<Sponsor, "id">>>;
    socialLinks: SocialLinks;
    setSocialLinks: React.Dispatch<React.SetStateAction<SocialLinks>>;
    isMapModalOpen: boolean;
    setIsMapModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editValues: {
        platform: keyof SocialLinks | null;
        username: string;
        link: string;
    };
    setEditValues: React.Dispatch<React.SetStateAction<{ platform: keyof SocialLinks | null; username: string; link: string }>>;
    latitude: number | null;
    setLatitude: React.Dispatch<React.SetStateAction<number | null>>;
    longitude: number | null;
    setLongitude: React.Dispatch<React.SetStateAction<number | null>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    success: string | null;
    setSuccess: React.Dispatch<React.SetStateAction<string | null>>;
    otherTextbox: boolean;
    setOtherTextbox: React.Dispatch<React.SetStateAction<boolean>>;
    showMainPassword: boolean;
    setShowMainPassword: React.Dispatch<React.SetStateAction<boolean>>;
    showRetypePassword: boolean;
    setShowRetypePassword: React.Dispatch<React.SetStateAction<boolean>>;
}