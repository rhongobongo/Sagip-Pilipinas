export interface CheckedDonationTypes {
    food: boolean;
    clothing: boolean;
    medicalSupplies: boolean;
    shelter: boolean;
    searchAndRescue: boolean;
    financialAssistance: boolean;
    counseling: boolean;
    technicalSupport: boolean;
}

export interface FoodDetails {
    foodPacks: string;
    category: string;
}

export interface ClothingDetails {
    male: string;
    female: string;
    children: string;
}

export interface MedicalSuppliesDetails {
    kits: string;
    kitType: string;
}

export interface ShelterDetails {
    tents: string;
    blankets: string;
}

export interface SearchAndRescueDetails {
    rescueKits: string;
    rescuePersonnel: string;
}

export interface FinancialAssistanceDetails {
    totalFunds: string;
    currency: "PHP";
}

export interface CounselingDetails {
    counselors: string;
    hours: string;
}

export interface TechnicalSupportDetails {
    vehicles: string;
    communication: string;
}

export interface DonationDetails {
    food?: FoodDetails;
    clothing?: ClothingDetails;
    medicalSupplies?: MedicalSuppliesDetails;
    shelter?: ShelterDetails;
    searchAndRescue?: SearchAndRescueDetails;
    financialAssistance?: FinancialAssistanceDetails;
    counseling?: CounselingDetails;
    technicalSupport?: TechnicalSupportDetails;
}
