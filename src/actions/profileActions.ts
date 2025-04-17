// src/actions/profileActions.ts
'use server';

import { db, auth } from '@/lib/Firebase-Admin'; // Assuming your Firebase Admin setup is here
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// Define interfaces for the data structures (adjust based on your actual Firestore structure)
// You might want to import these from a shared types file if you have one
interface VolunteerProfile {
    userId: string;
    firstName?: string;
    surname?: string;
    email?: string; // Usually from auth, but might be stored
    contactNumber?: string;
    username?: string; // Assuming username is stored/editable
    description?: string; // Example field
    skills?: string[]; // Example field
    availability?: string; // Example field
    // Add other volunteer-specific fields
    updatedAt?: string; // Changed from FieldValue | Timestamp | string
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
    updatedAt?: string; // Changed from FieldValue | Timestamp | string
    coordinates?: { latitude: number; longitude: number }; // Plain JS version of GeoPoint
}

type UserProfile = VolunteerProfile | OrganizationProfile;
type UserType = 'volunteer' | 'organization' | 'unknown';

interface FetchResult {
    profile: UserProfile | null;
    userType: UserType;
    error?: string;
}

/**
 * Helper function to convert Firestore objects to plain JS objects
 * @param data - The data object containing potential Firestore specific objects
 * @returns A plain JavaScript object with serializable values
 */
function convertFirestoreData(data: any): any {
    if (!data) return data;
    
    const result: any = {};
    
    Object.keys(data).forEach(key => {
        const value = data[key];
        
        // Handle Timestamp objects
        if (value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
            // Convert Timestamp to ISO string
            result[key] = value.toDate().toISOString();
        }
        // Handle GeoPoint objects
        else if (value && typeof value === 'object' && value._latitude !== undefined && value._longitude !== undefined) {
            // Convert GeoPoint to plain object
            result[key] = {
                latitude: value._latitude,
                longitude: value._longitude
            };
        }
        // Handle nested objects
        else if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = convertFirestoreData(value);
        }
        // Handle arrays (in case they contain Firestore objects)
        else if (Array.isArray(value)) {
            result[key] = value.map(item => 
                typeof item === 'object' ? convertFirestoreData(item) : item
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
            const rawData = volunteerDoc.data();
            const profileData = convertFirestoreData({ userId, ...rawData }) as VolunteerProfile;
            
            return { profile: profileData, userType: 'volunteer' };
        }

        // If not found in volunteers, check organizations
        const orgDocRef = db.collection('organizations').doc(userId);
        const orgDoc = await orgDocRef.get();

        if (orgDoc.exists) {
            console.log(`Found profile in 'organizations' for user: ${userId}`);
            // Get the raw data and convert to plain JS objects
            const rawData = orgDoc.data();
            const profileData = convertFirestoreData({ userId, ...rawData }) as OrganizationProfile;
            
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
        const updateData: { [key: string]: any } = {};

        // Iterate over FormData entries and build the update object
        // Note: This assumes form field names directly match Firestore field names
        // You might need more specific logic based on your form structure
        for (const [key, value] of formData.entries()) {
            // Skip empty values unless you specifically want to clear fields
            if (value !== null && value !== undefined && value !== '') {
                 // Basic handling for potential array fields (like 'skills')
                 // This is a simple example; robust parsing might be needed
                 if (key === 'skills' && typeof value === 'string') {
                    // Assuming skills are comma-separated in the input
                    updateData[key] = value.split(',').map(s => s.trim()).filter(s => s);
                 } else if (typeof value === 'string') {
                    updateData[key] = value;
                 }
                 // Add handling for other data types (numbers, booleans) if necessary
            }
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