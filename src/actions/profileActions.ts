// src/actions/profileActions.ts
'use server';

import { db, auth } from '@/lib/Firebase-Admin'; 
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

interface VolunteerProfile {
    userId: string;
    firstName?: string;
    surname?: string;
    email?: string; 
    contactNumber?: string;
    username?: string; 
    description?: string; 
    skills?: string[];
    availability?: string; 
    socialMedia?: Record<string, string>;
    updatedAt?: string; 
}

interface OrganizationProfile {
    userId: string;
    name?: string;
    email?: string; // Usually from auth, but might be stored
    contactNumber?: string;
    description?: string;
    location?: string;
    contactPerson?: string;
    orgPosition?: string;
    // Add other organization-specific fields
    socialMedia?: Record<string, string>; // Add this field
    updatedAt?: string; // Changed from FieldValue | Timestamp | string
    coordinates?: { latitude: number; longitude: number }; // Plain JS version of GeoPoint
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
        photoFile?: File;
        photoPreview?: string | null;
    }>;
}

type UserProfile = VolunteerProfile | OrganizationProfile;
type UserType = 'volunteer' | 'organization' | 'unknown';

interface FetchResult {
    profile: UserProfile | null;
    userType: UserType;
    error?: string;
}

// Define a generic FirestoreData type for converting Firestore objects
type FirestoreData = Record<string, unknown>;

/**
 * Helper function to convert Firestore objects to plain JS objects
 * @param data - The data object containing potential Firestore specific objects
 * @returns A plain JavaScript object with serializable values
 */
function convertFirestoreData(data: FirestoreData): FirestoreData {
    if (!data) return data;
    
    const result: FirestoreData = {};
    
    Object.keys(data).forEach(key => {
        const value = data[key];
        
        // Handle Timestamp objects
        if (value && typeof value === 'object' && 
            'toDate' in value && typeof value.toDate === 'function') {
            // Convert Timestamp to ISO string
            result[key] = value.toDate().toISOString();
        }
        // Handle GeoPoint objects
        else if (value && typeof value === 'object' && 
                '_latitude' in value && '_longitude' in value) {
            // Convert GeoPoint to plain object
            result[key] = {
                latitude: value._latitude,
                longitude: value._longitude
            };
        }
        // Handle nested objects
        else if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = convertFirestoreData(value as FirestoreData);
        }
        // Handle arrays (in case they contain Firestore objects)
        else if (Array.isArray(value)) {
            result[key] = value.map(item => 
                typeof item === 'object' ? convertFirestoreData(item as FirestoreData) : item
            );
        }
        // Pass through other values
        else {
            result[key] = value;
        }
    });
    
    return result;
}

/**
 * Fetches profile data for a given user ID.
 * Checks both 'volunteers' and 'organizations' collections.
 * @param userId - The ID of the user whose profile to fetch.
 * @returns An object containing the profile data, user type, and optional error message.
 */
export async function getProfileData(userId: string): Promise<FetchResult> {
    if (!userId) {
        return { profile: null, userType: 'unknown', error: 'User ID is required.' };
    }

    try {
        // Check volunteer collection first
        const volunteerDocRef = db.collection('volunteers').doc(userId);
        const volunteerDoc = await volunteerDocRef.get();

        if (volunteerDoc.exists) {
            console.log(`Found profile in 'volunteers' for user: ${userId}`);
            // Get the raw data and convert to plain JS objects
            const rawData = volunteerDoc.data() as FirestoreData;
            const convertedData = convertFirestoreData(rawData as FirestoreData);
            const profileData: VolunteerProfile = { userId, ...convertedData };
            
            // Ensure socialMedia is initialized
            if (!profileData.socialMedia) {
                profileData.socialMedia = {};
            }
            
            return { profile: profileData, userType: 'volunteer' };
        }

        // If not found in volunteers, check organizations
        const orgDocRef = db.collection('organizations').doc(userId);
        const orgDoc = await orgDocRef.get();

        if (orgDoc.exists) {
            console.log(`Found profile in 'organizations' for user: ${userId}`);
            // Get the raw data and convert to plain JS objects
            const rawData = orgDoc.data() as FirestoreData;
            const convertedData = convertFirestoreData(rawData as FirestoreData);
        const profileData: OrganizationProfile = { userId, ...convertedData };
            if (!profileData.socialMedia) {
                profileData.socialMedia = {};
            }
            
            return { profile: profileData, userType: 'organization' };
        }

        // If not found in either
        console.log(`No profile found for user: ${userId}`);
        return { profile: null, userType: 'unknown', error: 'Profile not found.' };

    } catch (error: unknown) {
        console.error(`Error fetching profile data for user ${userId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { profile: null, userType: 'unknown', error: `Failed to fetch profile: ${errorMessage}` };
    }
}

// Define a type for AidStock data
interface AidStockData {
    [aidId: string]: {
        available?: boolean;
        [key: string]: unknown;
    } | null;
}

/**
 * Processes aidStock data, converting numeric string values to numbers
 * @param aidStockData - The raw aidStock data from form
 * @returns Processed aidStock object with proper data types
 */
function processAidStock(aidStockData: AidStockData): AidStockData {
    const result: AidStockData = {};
    
    // Numeric fields in each aid type that should be converted from string to number
    const numericFields: Record<string, string[]> = {
        'food': ['foodPacks'],
        'clothing': ['male', 'female', 'children'],
        'medicalSupplies': ['kits'],
        'shelter': ['tents', 'blankets'],
        'searchAndRescue': ['rescueKits', 'rescuePersonnel'],
        'financialAssistance': ['totalFunds'],
        'counseling': ['counselors', 'hours'],
        'technicalSupport': ['vehicles', 'communication']
    };
    
    // Process each aid type in the aidStock
    Object.keys(aidStockData).forEach(aidId => {
        const aidData = aidStockData[aidId];
        
        // Skip if aidData is null or not an object
        if (!aidData || typeof aidData !== 'object') {
            result[aidId] = aidData;
            return;
        }
        
        // Create a copy of the aid data
        result[aidId] = { ...aidData };
        
        // Convert numeric fields to numbers
        if (numericFields[aidId]) {
            numericFields[aidId].forEach(field => {
                if (field in aidData && aidData[field] !== undefined && aidData[field] !== null && aidData[field] !== '') {
                    // Try to convert to number
                    const numValue = Number(aidData[field]);
                    if (!isNaN(numValue)) {
                        if (result[aidId]) {
                            (result[aidId] as Record<string, unknown>)[field] = numValue;
                        }
                    }
                }
            });
        }
    });
    
    return result;
}

// Define a type for the update data
interface UpdateData {
    [key: string]: unknown;
    socialMedia?: Record<string, string>;
    updatedAt?: FieldValue;
}

/**
 * Updates profile data in Firestore.
 * @param userId - The ID of the user whose profile to update.
 * @param userType - The type of user ('volunteer' or 'organization').
 * @param formData - The FormData object containing the updated fields.
 * @returns An object indicating success or failure with a message.
 */
export async function updateProfileData(
    userId: string,
    userType: UserType,
    formData: FormData
): Promise<{ success: boolean; message: string }> {
    if (!userId || userType === 'unknown') {
        return { success: false, message: 'Invalid user ID or type.' };
    }

    const collectionName = userType === 'volunteer' ? 'volunteers' : 'organizations';
    const docRef = db.collection(collectionName).doc(userId);

    try {
        const updateData: UpdateData = {};
        const socialMediaData: Record<string, string> = {};
        let hasSocialMedia = false;

        // Iterate over FormData entries and build the update object
        for (const [key, value] of formData.entries()) {
            // Handle social media fields separately
            if (key.startsWith('socialMedia.') && typeof value === 'string') {
                const platform = key.split('.')[1]; // Extract the platform name
                if (value.trim()) {
                    socialMediaData[platform] = value.trim();
                    hasSocialMedia = true;
                }
            }
            // Basic handling for potential array fields (like 'skills')
            else if (key === 'skills' && typeof value === 'string') {
                // Assuming skills are comma-separated in the input
                updateData[key] = value.split(',').map(s => s.trim()).filter(s => s);
            }
            // Handle JSON stringified objects
            else if (key === 'sponsors' && typeof value === 'string') {
                try {
                    updateData[key] = JSON.parse(value);
                } catch (e) {
                    console.error(`Error parsing ${key} JSON:`, e);
                }
            }
            // Handle aidStock JSON with numeric conversion
            else if (key === 'aidStock' && typeof value === 'string') {
                try {
                    const parsedAidStock = JSON.parse(value) as AidStockData;
                    updateData[key] = processAidStock(parsedAidStock);
                } catch (e) {
                    console.error(`Error parsing aidStock JSON:`, e);
                }
            }
            // Handle regular string values
            else if (typeof value === 'string' && value.trim() !== '') {
                updateData[key] = value.trim();
            }
        }

        // Add social media data to update object if there are any entries
        if (hasSocialMedia) {
            updateData.socialMedia = socialMediaData;
        }

        // Always add/update the 'updatedAt' timestamp
        updateData.updatedAt = FieldValue.serverTimestamp();

        if (Object.keys(updateData).length <= 1) { // Only updatedAt added
             return { success: false, message: 'No changes detected to update.' };
        }

        console.log(`Updating profile for user ${userId} in ${collectionName} with data:`, updateData);

        await docRef.update(updateData);

        console.log(`Successfully updated profile for user ${userId}`);
        return { success: true, message: 'Profile updated successfully!' };

    } catch (error: unknown) {
        console.error(`Error updating profile for user ${userId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Failed to update profile: ${errorMessage}` };
    }
}