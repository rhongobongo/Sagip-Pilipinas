// src/actions/profileActions.ts
'use server';

import { db, auth, storage } from '@/lib/Firebase-Admin'; // Ensure storage is imported
import { FieldValue, Timestamp, GeoPoint } from 'firebase-admin/firestore'; // Added GeoPoint
// *** Import the image update function ***
import { updateProfileImage } from '@/lib/APICalls/User/updateProfileImage'; // Adjust path if necessary

// --- Interfaces ---
// Ensure profileImageUrl is optional string | undefined
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
  organizationId?: string;
  roleOrCategory?: string;
  socialMedia?: Record<string, string>;
  profileImageUrl?: string | undefined; // Use undefined for optional
  updatedAt?: string; // Expect ISO string from conversion
}

interface OrganizationProfile {
  userId: string;
  name?: string;
  email?: string;
  contactNumber?: string;
  description?: string;
  location?: string;
  contactPerson?: string;
  orgPosition?: string;
  socialMedia?: Record<string, string>;
  profileImageUrl?: string | undefined; // Use undefined for optional
  updatedAt?: string; // Expect ISO string from conversion
  coordinates?: { latitude: number; longitude: number }; // Expect plain object from conversion
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
    imageUrl?: string | undefined | null; // URL stored in Firestore
  }>;
}

type UserProfile = VolunteerProfile | OrganizationProfile;
type UserType = 'volunteer' | 'organization' | 'unknown';

interface FetchResult {
  profile: UserProfile | null;
  userType: UserType;
  error?: string;
}

type FirestoreData = Record<string, unknown>;

// --- Helper: Convert Firestore Data ---
// Converts Timestamps to ISO strings and GeoPoints to {lat, lng} objects
function convertFirestoreData(data: FirestoreData): FirestoreData {
  if (!data) return data;
  const result: FirestoreData = {};
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else if (value instanceof GeoPoint) {
      result[key] = { latitude: value.latitude, longitude: value.longitude };
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = convertFirestoreData(value as FirestoreData);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item && typeof item === 'object'
          ? convertFirestoreData(item as FirestoreData)
          : item
      );
    } else {
      result[key] = value;
    }
  });
  return result;
}

// --- Server Action: Get Profile Data ---
export async function getProfileData(userId: string): Promise<FetchResult> {
  if (!userId) {
    return {
      profile: null,
      userType: 'unknown',
      error: 'User ID is required.',
    };
  }
  try {
    const volunteerDocRef = db.collection('volunteers').doc(userId);
    const volunteerDoc = await volunteerDocRef.get();
    if (volunteerDoc.exists) {
      console.log(`Found profile in 'volunteers' for user: ${userId}`);
      const rawData = volunteerDoc.data();
      const convertedData = convertFirestoreData(rawData as FirestoreData);
      const profileData: VolunteerProfile = { userId, ...convertedData };
      if (!profileData.socialMedia) profileData.socialMedia = {};
      if (profileData.profileImageUrl === null)
        profileData.profileImageUrl = undefined; // Ensure undefined not null
      return { profile: profileData, userType: 'volunteer' };
    }

    const orgDocRef = db.collection('organizations').doc(userId);
    const orgDoc = await orgDocRef.get();
    if (orgDoc.exists) {
      console.log(`Found profile in 'organizations' for user: ${userId}`);
      const rawData = orgDoc.data();
      const convertedData = convertFirestoreData(rawData as FirestoreData);
      const profileData: OrganizationProfile = { userId, ...convertedData };
      if (!profileData.socialMedia) profileData.socialMedia = {};
      if (profileData.profileImageUrl === null)
        profileData.profileImageUrl = undefined; // Ensure undefined not null
      return { profile: profileData, userType: 'organization' };
    }

    console.log(`No profile found for user: ${userId}`);
    return { profile: null, userType: 'unknown', error: 'Profile not found.' };
  } catch (error: unknown) {
    console.error(`Error fetching profile data for user ${userId}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      profile: null,
      userType: 'unknown',
      error: `Failed to fetch profile: ${errorMessage}`,
    };
  }
}

// --- Helper: Process Aid Stock ---
// Takes raw data (possibly with string numbers) and returns processed data for Firestore
interface RawAidStockData {
  [aidId: string]: { available?: boolean; [key: string]: unknown } | null;
}
interface ProcessedAidStockData {
  [aidId: string]: { available: boolean; [key: string]: unknown };
}

function processAidStock(
  rawAidStockData: RawAidStockData
): ProcessedAidStockData {
  const result: ProcessedAidStockData = {};
  const numericFields: Record<string, string[]> = {
    food: ['foodPacks'],
    clothing: ['male', 'female', 'children'],
    medicalSupplies: ['kits'],
    shelter: ['tents', 'blankets'],
    searchAndRescue: ['rescueKits', 'rescuePersonnel'],
    financialAssistance: ['totalFunds'],
    counseling: ['counselors', 'hours'],
    technicalSupport: ['vehicles', 'communication'],
  };

  for (const aidId in rawAidStockData) {
    const aidData = rawAidStockData[aidId];
    if (!aidData || typeof aidData !== 'object') continue;

    result[aidId] = { available: !!aidData.available }; // Ensure boolean

    for (const field in aidData) {
      if (field === 'available') continue;
      const value = aidData[field];
      if (numericFields[aidId]?.includes(field)) {
        if (value !== undefined && value !== null && value !== '') {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            result[aidId][field] = numValue;
          } else {
            console.warn(
              `Could not convert field '${field}' for aid '${aidId}' to number: value was '${value}'`
            );
          }
        }
      } else {
        if (value !== undefined && value !== null) {
          result[aidId][field] = value;
        }
      }
    }
  }
  return result;
}

// --- Type for Firestore Update Payload ---
interface UpdateData {
  [key: string]: unknown;
  socialMedia?: Record<string, string | FieldValue>; // Allow FieldValue for deletion
  skills?: string[];
  sponsors?: Array<{
    id: string;
    name: string;
    other: string;
    imageUrl?: string | null;
  }>;
  aidStock?: ProcessedAidStockData;
  updatedAt?: FieldValue;
}

// --- Server Action: Update Profile Data ---
export async function updateProfileData(
  userId: string,
  userType: UserType,
  formData: FormData
): Promise<{ success: boolean; message: string; imageUrl?: string | null }> {
  if (!userId || userType === 'unknown') {
    return { success: false, message: 'Invalid user ID or type.' };
  }

  console.log(
    `[profileActions] Starting update for user: ${userId}, type: ${userType}`
  );

  const collectionName =
    userType === 'volunteer' ? 'volunteers' : 'organizations';
  const docRef = db.collection(collectionName).doc(userId);

  let profileImageFile: File | null = null;
  let uploadedImageUrl: string | null = null;

  try {
    const updateData: UpdateData = {};
    const socialMediaUpdates: Record<string, string | FieldValue> = {}; // For handling deletes
    let hasSocialMediaChanges = false;
    let hasOtherChanges = false;

    // Separate image file handling
    if (formData.has('profileImage')) {
      const fileValue = formData.get('profileImage');
      if (fileValue instanceof File && fileValue.size > 0) {
        profileImageFile = fileValue;
        formData.delete('profileImage'); // Remove from formData
        console.log(
          `[profileActions] Found profile image file: ${profileImageFile.name}, size: ${profileImageFile.size}`
        );
      } else {
        console.warn(
          "[profileActions] FormData had 'profileImage' but it wasn't a valid File."
        );
      }
    } else {
      console.log('[profileActions] No profile image file found in FormData.');
    }

    // Process other form data fields
    console.log('[profileActions] Processing other form data fields...');
    for (const [key, value] of formData.entries()) {
      if (key === 'profileImageInput') continue; // Skip the input element itself

      // Social Media (Prepare for potential deletions)
      if (key.startsWith('socialMedia.') && typeof value === 'string') {
        const platform = key.split('.')[1];
        const trimmedValue = value.trim();
        if (trimmedValue) {
          socialMediaUpdates[platform] = trimmedValue;
        } else {
          socialMediaUpdates[platform] = FieldValue.delete(); // Use FieldValue.delete()
        }
        hasSocialMediaChanges = true;
      }
      // Skills
      else if (key === 'skills' && typeof value === 'string') {
        updateData.skills = value
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
        hasOtherChanges = true;
      }
      // Sponsors
      else if (key === 'sponsors' && typeof value === 'string') {
        try {
          const parsedSponsors = JSON.parse(value).map((s: any) => ({
            id: s.id,
            name: s.name,
            other: s.other,
            imageUrl: s.imageUrl ?? null, // Ensure null consistency if needed
          }));
          updateData.sponsors = parsedSponsors;
          hasOtherChanges = true;
        } catch (e) {
          console.error(`[profileActions] Error parsing sponsors JSON:`, e);
        }
      }
      // Aid Stock
      else if (key === 'aidStock' && typeof value === 'string') {
        try {
          const parsedRawAidStock = JSON.parse(value) as RawAidStockData;
          updateData.aidStock = processAidStock(parsedRawAidStock);
          hasOtherChanges = true;
        } catch (e) {
          console.error(`[profileActions] Error parsing aidStock JSON:`, e);
        }
      }
      // Skip Read-Only Fields
      else if (key === 'firstName' || key === 'surname' || key === 'name') {
        continue;
      }
      // Other String Fields
      else if (typeof value === 'string') {
        updateData[key] = value; // Keep as is or trim if needed
        hasOtherChanges = true;
      }
    }
    console.log('[profileActions] Finished processing other form data fields.');

    // Apply social media updates using dot notation for deletes
    if (hasSocialMediaChanges) {
      console.log(
        '[profileActions] Applying social media updates:',
        socialMediaUpdates
      );
      for (const platform in socialMediaUpdates) {
        updateData[`socialMedia.${platform}`] = socialMediaUpdates[platform];
      }
      hasOtherChanges = true; // Mark overall change
    }

    // Update Firestore for non-image fields if changes exist
    if (hasOtherChanges) {
      updateData.updatedAt = FieldValue.serverTimestamp();
      console.log(
        `[profileActions] Updating Firestore (non-image fields) for user ${userId}:`,
        JSON.stringify(updateData, null, 2)
      ); // Log the payload
      await docRef.update(updateData);
      console.log(
        `[profileActions] Successfully updated non-image profile fields for user ${userId}`
      );
    } else {
      console.log(
        `[profileActions] No non-image field changes detected for user ${userId}.`
      );
    }

    // Handle Image Upload Separately
    if (profileImageFile) {
      console.log(
        `[profileActions] Attempting to upload profile image for user ${userId}...`
      );
      try {
        uploadedImageUrl = await updateProfileImage(
          profileImageFile,
          userId,
          userType
        );

        if (uploadedImageUrl) {
          console.log(
            `[profileActions] Profile image uploaded successfully. URL: ${uploadedImageUrl}`
          );
          // Update Firestore specifically with the new image URL and timestamp
          const imageUpdatePayload = {
            profileImageUrl: uploadedImageUrl,
            updatedAt: FieldValue.serverTimestamp(),
          };
          console.log(
            `[profileActions] Updating Firestore with image URL for user ${userId}:`,
            imageUpdatePayload
          );
          await docRef.update(imageUpdatePayload);
          console.log(
            `[profileActions] Successfully updated profile image URL in Firestore for user ${userId}`
          );
        } else {
          console.warn(
            `[profileActions] updateProfileImage completed but did not return a URL for user ${userId}.`
          );
          // Return success=true, but indicate image URL wasn't saved
          return {
            success: true,
            message:
              'Profile updated, but failed to get image URL after upload.',
            imageUrl: null,
          };
        }
      } catch (imgError) {
        console.error(
          `[profileActions] CRITICAL ERROR during image upload/update for user ${userId}:`,
          imgError
        );
        // Return failure as the image process failed
        return {
          success: false,
          message: `Failed to upload or save profile image: ${imgError instanceof Error ? imgError.message : 'Unknown image upload error'}`,
        };
      }
    }

    // Final success check
    if (!hasOtherChanges && !profileImageFile) {
      console.log(
        `[profileActions] No changes detected overall for user ${userId}.`
      );
      return { success: false, message: 'No changes detected to update.' };
    }

    console.log(
      `[profileActions] Update process completed successfully (or with non-critical image URL issue) for user ${userId}.`
    );
    return {
      success: true,
      message: 'Profile updated successfully!',
      imageUrl: uploadedImageUrl, // Return new URL or null
    };
  } catch (error: unknown) {
    // Catch errors during the main Firestore update (non-image)
    console.error(
      `[profileActions] CRITICAL ERROR during main update logic for user ${userId}:`,
      error
    );
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during profile update';
    return {
      success: false,
      message: `Failed to update profile: ${errorMessage}`,
    };
  }
}
