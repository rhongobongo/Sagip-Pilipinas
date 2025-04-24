// src/actions/profileActions.ts
'use server';

import { db, auth, storage } from '@/lib/Firebase-Admin'; // Ensure storage is imported if used directly here, otherwise ensure it's initialized in Firebase-Admin/index
import { FieldValue, Timestamp, GeoPoint } from 'firebase-admin/firestore'; // Added GeoPoint
import { updateProfileImage } from '@/lib/APICalls/User/updateProfileImage'; // Adjust path if necessary

// --- Interfaces ---
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
  profileImageUrl?: string | undefined;
  updatedAt?: string; // Should ideally be Date | Timestamp | FieldValue server-side
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
  profileImageUrl?: string | undefined;
  updatedAt?: string; // Should ideally be Date | Timestamp | FieldValue server-side
  coordinates?: { latitude: number; longitude: number }; // For frontend fetch
  aidStock?: {
    [aidId: string]: {
      available: boolean;
      [key: string]: unknown; // Use unknown for flexibility before processing
    };
  };
  sponsors?: Array<{
    id: string;
    name: string;
    other: string;
    imageUrl?: string | undefined | null;
  }>;
}

// Define structure expected from JSON.parse for sponsors
interface RawSponsorData {
  id: string;
  name: string;
  other: string;
  imageUrl?: string | null; // Matches the structure in updateData
}

type UserProfile = VolunteerProfile | OrganizationProfile;
type UserType = 'volunteer' | 'organization' | 'unknown';

interface FetchResult {
  profile: UserProfile | null;
  userType: UserType;
  error?: string;
}

// Represents raw data potentially read from Firestore
type FirestoreData = Record<string, unknown>;

// --- Helper: Convert Firestore Data (e.g., Timestamps, GeoPoints) for Frontend ---
function convertFirestoreData(data: FirestoreData): FirestoreData {
  if (!data) return data;
  const result: FirestoreData = {};
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString(); // Convert Timestamp to ISO string
    } else if (value instanceof GeoPoint) {
      // Convert GeoPoint to a plain object for JSON serialization
      result[key] = { latitude: value.latitude, longitude: value.longitude };
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively convert nested objects
      result[key] = convertFirestoreData(value as FirestoreData);
    } else if (Array.isArray(value)) {
      // Recursively convert items in arrays
      result[key] = value.map((item) =>
        item && typeof item === 'object'
          ? convertFirestoreData(item as FirestoreData)
          : item
      );
    } else {
      // Keep other types as they are
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
    // Check volunteers collection
    const volunteerDocRef = db.collection('volunteers').doc(userId);
    const volunteerDoc = await volunteerDocRef.get();
    if (volunteerDoc.exists) {
      console.log(`Found profile in 'volunteers' for user: ${userId}`);
      const rawData = volunteerDoc.data();
      const convertedData = convertFirestoreData(rawData as FirestoreData);
      const profileData = { userId, ...convertedData } as VolunteerProfile; // Cast to specific type
      // Ensure defaults or consistency
      if (!profileData.socialMedia) profileData.socialMedia = {};
      if (profileData.profileImageUrl === null)
        profileData.profileImageUrl = undefined;
      return { profile: profileData, userType: 'volunteer' };
    }

    // Check organizations collection
    const orgDocRef = db.collection('organizations').doc(userId);
    const orgDoc = await orgDocRef.get();
    if (orgDoc.exists) {
      console.log(`Found profile in 'organizations' for user: ${userId}`);
      const rawData = orgDoc.data();
      const convertedData = convertFirestoreData(rawData as FirestoreData);
      const profileData = { userId, ...convertedData } as OrganizationProfile; // Cast to specific type
      // Ensure defaults or consistency
      if (!profileData.socialMedia) profileData.socialMedia = {};
      if (profileData.profileImageUrl === null)
        profileData.profileImageUrl = undefined;
      // Ensure coordinates are correctly typed if needed here, though conversion handles it
      if (
        profileData.coordinates &&
        !(typeof profileData.coordinates.latitude === 'number')
      ) {
        console.warn(
          `Org ${userId} coordinates were not correctly converted.`,
          profileData.coordinates
        );
        // Optionally clear or fix coordinates here if needed before returning
      }
      return { profile: profileData, userType: 'organization' };
    }

    // Not found in either collection
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

// --- Helper: Process Aid Stock Data from JSON String ---
// Define structure expected from JSON.parse for aidStock
interface RawAidStockData {
  [aidId: string]: { available?: boolean; [key: string]: unknown } | null;
}
// Define structure expected after processing for Firestore
interface ProcessedAidStockData {
  [aidId: string]: { available: boolean; [key: string]: unknown };
}

function processAidStock(
  rawAidStockData: RawAidStockData
): ProcessedAidStockData {
  const result: ProcessedAidStockData = {};
  // Define which fields within each aid type should be treated as numbers
  const numericFields: Record<string, string[]> = {
    food: ['foodPacks'],
    clothing: ['male', 'female', 'children'],
    medicalSupplies: ['kits', 'medicines', 'equipment'], // Added more based on OrgForm
    shelter: ['tents', 'blankets', 'capacity'], // Added more
    searchAndRescue: ['rescueKits', 'rescuePersonnel', 'equipment'], // Added more
    financialAssistance: ['totalFunds'],
    counseling: ['counselors', 'hours'],
    technicalSupport: ['vehicles', 'communication', 'equipment'], // Added more
  };

  for (const aidId in rawAidStockData) {
    const aidData = rawAidStockData[aidId];
    // Skip if data is null or not an object
    if (!aidData || typeof aidData !== 'object') continue;

    // Ensure 'available' is explicitly boolean
    result[aidId] = { available: !!aidData.available };

    // Process other fields within this aid type
    for (const field in aidData) {
      if (field === 'available') continue; // Skip the availability flag itself

      const value = aidData[field];

      // Check if this field should be numeric for this aidId
      if (numericFields[aidId]?.includes(field)) {
        // Attempt to convert to number if not undefined/null/empty string
        if (value !== undefined && value !== null && value !== '') {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            result[aidId][field] = numValue; // Store as number
          } else {
            // Log warning if conversion fails but value existed
            console.warn(
              `[processAidStock] Could not convert field '${field}' for aid '${aidId}' to number: value was '${value}'`
            );
            // Optionally store as 0 or skip storing
          }
        }
        // If value is empty/null/undefined for a numeric field, maybe store 0 or skip?
        // else { result[aidId][field] = 0; }
      } else {
        // For non-numeric fields, store if not undefined/null
        if (value !== undefined && value !== null) {
          result[aidId][field] = value; // Store as is (likely string)
        }
      }
    }
  }
  return result;
}

// --- Type for Firestore Update Payload ---
interface UpdateData {
  [key: string]: unknown; // Allow other fields from FormData
  // Specific typed fields we process
  socialMedia?: Record<string, string | FieldValue>; // Allow FieldValue for deletion
  skills?: string[]; // For volunteers
  sponsors?: Array<{
    // For organizations
    id: string;
    name: string;
    other: string;
    imageUrl?: string | null;
  }>;
  aidStock?: ProcessedAidStockData; // For organizations
  coordinates?: GeoPoint; // For organizations
  updatedAt?: FieldValue; // Added automatically
}

// --- THE MAIN UPDATE FUNCTION ---
export async function updateProfileData(
  userId: string,
  userType: UserType,
  formData: FormData
): Promise<{ success: boolean; message: string; imageUrl?: string | null }> {
  if (!userId || userType === 'unknown') {
    return { success: false, message: 'Invalid user ID or type.' };
  }

  const collectionName =
    userType === 'volunteer' ? 'volunteers' : 'organizations';
  const docRef = db.collection(collectionName).doc(userId);

  let profileImageFile: File | null = null;
  let uploadedImageUrl: string | null = null; // Final URL if image update succeeds fully
  let hasOtherChanges = false; // Flag to see if any non-image data changed

  try {
    // Object to build Firestore update payload
    const updateData: UpdateData = {};
    // Temporary storage for social media updates (needs dot notation for Firestore)
    const socialMediaUpdates: Record<string, string | FieldValue> = {};
    let hasSocialMediaChanges = false;
    let coordinatesToUpdate: GeoPoint | null = null;

    // --- Step 1: Extract profile image File object ---
    if (formData.has('profileImage')) {
      const fileValue = formData.get('profileImage');
      if (fileValue instanceof File && fileValue.size > 0) {
        profileImageFile = fileValue;
      } else {
        console.warn(
          "[profileActions] 'profileImage' found in FormData but it wasn't a valid File."
        );
      }
    }

    // --- Step 2: Process other form data fields ---
    for (const [key, value] of formData.entries()) {
      // Skip files/inputs handled separately
      if (key === 'profileImageInput' || key === 'profileImage') continue;

      // Handle Coordinates (Organization only)
      if (
        key === 'coordinates' &&
        typeof value === 'string' &&
        userType === 'organization'
      ) {
        try {
          const parsedCoords = JSON.parse(value);
          if (
            parsedCoords &&
            typeof parsedCoords.latitude === 'number' &&
            typeof parsedCoords.longitude === 'number'
          ) {
            coordinatesToUpdate = new GeoPoint(
              parsedCoords.latitude,
              parsedCoords.longitude
            );
            hasOtherChanges = true;
          } else {
            console.warn(
              `[profileActions] Received 'coordinates' field but failed to parse lat/lng numbers:`,
              value
            );
          }
        } catch (e) {
          console.error(`[profileActions] Error parsing coordinates JSON:`, e);
        }
        continue; // Go to next formData entry
      }
      // Handle Social Media Links (using dot notation keys)
      else if (key.startsWith('socialMedia.') && typeof value === 'string') {
        const platform = key.split('.')[1];
        const trimmedValue = value.trim();
        // Use FieldValue.delete() to remove a field if value is empty
        socialMediaUpdates[platform] = trimmedValue
          ? trimmedValue
          : FieldValue.delete();
        hasSocialMediaChanges = true;
      }
      // Handle Skills (Volunteer only)
      else if (
        key === 'skills' &&
        typeof value === 'string' &&
        userType === 'volunteer'
      ) {
        // Assuming skills are sent as a comma-separated string
        updateData.skills = value
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s);
        hasOtherChanges = true;
      }
      // Handle Sponsors (Organization only) - Expects JSON string
      else if (
        key === 'sponsors' &&
        typeof value === 'string' &&
        userType === 'organization'
      ) {
        try {
          // --- FIX: Declare variable inside try block ---
          const parsedSponsors = JSON.parse(value).map((s: RawSponsorData) => ({
            id: s.id, // Keep existing ID if available
            name: s.name || '', // Ensure defaults
            other: s.other || '',
            imageUrl: s.imageUrl ?? null, // Use null if undefined
          }));
          // --- END FIX ---
          updateData.sponsors = parsedSponsors;
          hasOtherChanges = true;
        } catch (e) {
          console.error(`[profileActions] Error parsing sponsors JSON:`, e);
        }
      }
      // Handle Aid Stock (Organization only) - Expects JSON string
      else if (
        key === 'aidStock' &&
        typeof value === 'string' &&
        userType === 'organization'
      ) {
        try {
          // --- FIX: Declare variable inside try block ---
          const parsedRawAidStock = JSON.parse(value) as RawAidStockData;
          // --- END FIX ---
          updateData.aidStock = processAidStock(parsedRawAidStock);
          hasOtherChanges = true;
        } catch (e) {
          console.error(`[profileActions] Error parsing aidStock JSON:`, e);
        }
      }
      // Skip Read-Only Fields that shouldn't be updated from profile form
      else if (
        key === 'firstName' ||
        key === 'surname' ||
        key === 'name' ||
        key === 'email'
      ) {
        continue;
      }
      // Handle other standard string fields directly
      else if (typeof value === 'string') {
        // Add to updateData if it's a direct field in the profile interfaces
        // This assumes form field names match Firestore field names
        updateData[key] = value.trim();
        hasOtherChanges = true;
      }
    } // End of formData loop

    // Apply social media updates using dot notation for Firestore
    if (hasSocialMediaChanges) {
      for (const platform in socialMediaUpdates) {
        updateData[`socialMedia.${platform}`] = socialMediaUpdates[platform];
      }
      hasOtherChanges = true; // Ensure flag is set if only social media changed
    }
    // Add processed coordinates if they exist
    if (coordinatesToUpdate) {
      updateData.coordinates = coordinatesToUpdate;
      hasOtherChanges = true; // Ensure flag is set if only coordinates changed
    }

    // --- Step 3: Update Firestore for non-image fields (if any changed) ---
    if (hasOtherChanges) {
      updateData.updatedAt = FieldValue.serverTimestamp();
      console.log(
        `[profileActions] Updating Firestore (non-image fields) for user ${userId}... Keys:`,
        Object.keys(updateData)
      );
      try {
        await docRef.update(updateData); // Perform the update
        console.log(
          `[profileActions] Successfully updated non-image profile fields for user ${userId}`
        );
      } catch (nonImageUpdateError) {
        console.error(
          `[profileActions] Error updating non-image fields for user ${userId}:`,
          nonImageUpdateError
        );
        return {
          success: false,
          message: `Failed to update profile details: ${nonImageUpdateError instanceof Error ? nonImageUpdateError.message : 'Unknown database error'}`,
        };
      }
    } else {
      console.log(
        `[profileActions] No non-image field changes detected for user ${userId}.`
      );
    }

    // --- Step 4: Handle Image Upload and Second Firestore Update (if new image exists) ---
    if (profileImageFile) {
      console.log(
        `[profileActions] Attempting image upload via updateProfileImage for user ${userId}...`
      );
      let imageUrlFromUpload: string | null = null;
      try {
        // Outer try for calling updateProfileImage
        imageUrlFromUpload = await updateProfileImage(
          profileImageFile,
          userId,
          userType
        );

        if (imageUrlFromUpload) {
          console.log(
            `[profileActions] updateProfileImage returned URL: ${imageUrlFromUpload}`
          );
          const imageUpdatePayload = {
            profileImageUrl: imageUrlFromUpload,
            updatedAt: FieldValue.serverTimestamp(),
          };

          // Specific try-catch for the second DB update
          try {
            console.log(
              `[profileActions] Attempting SECOND Firestore update with image URL for user ${userId}:`,
              imageUpdatePayload
            );
            await docRef.update(imageUpdatePayload);
            console.log(
              `[profileActions] Successfully updated Firestore with image URL for user ${userId}.`
            );
            uploadedImageUrl = imageUrlFromUpload; // Assign final URL only on full success
          } catch (imageDbUpdateError) {
            console.error(
              `[profileActions] Error updating Firestore with image URL for user ${userId}:`,
              imageDbUpdateError
            );
            return {
              success: false,
              message: `Image uploaded, but failed to save URL to profile: ${imageDbUpdateError instanceof Error ? imageDbUpdateError.message : 'Unknown database error'}`,
            };
          }
        } else {
          console.error(
            `[profileActions] updateProfileImage finished but returned no URL for user ${userId}. Firestore NOT updated with image URL.`
          );
          return {
            success: false,
            message:
              'Image processing completed without returning a valid URL.',
          };
        }
      } catch (imgProcessingError) {
        console.error(
          `[profileActions] Error occurred during image upload function call for user ${userId}:`,
          imgProcessingError
        );
        return {
          success: false,
          message: `Failed during image processing function: ${imgProcessingError instanceof Error ? imgProcessingError.message : 'Unknown error'}`,
        };
      }
    } // End if (profileImageFile)

    // --- Step 5: Final Return Logic ---
    const nonImageUpdateAttempted = hasOtherChanges;
    const imageUpdateAttempted = !!profileImageFile;
    // Considered successful only if the image URL was obtained AND saved to Firestore
    const imageUpdateSucceeded = imageUpdateAttempted
      ? !!uploadedImageUrl
      : true;

    if (imageUpdateAttempted && !imageUpdateSucceeded) {
      // This case should ideally be caught by the inner try-catch blocks now
      console.warn(
        `[profileActions] Update process completed for user ${userId}, but image update part failed.`
      );
      return {
        success: false,
        message: 'Profile update failed during image processing or saving.',
      };
    }

    if (!nonImageUpdateAttempted && !imageUpdateAttempted) {
      console.log(
        `[profileActions] No changes detected overall for user ${userId}.`
      );
      return { success: false, message: 'No changes detected to update.' };
    }

    // If we reach here, any operations that were attempted succeeded according to logs
    console.log(
      `[profileActions] Update process completed successfully for user ${userId}.`
    );
    return {
      success: true,
      message: 'Profile updated successfully!',
      imageUrl: uploadedImageUrl, // Return new URL or null/undefined based on whether image was processed
    };
  } catch (error: unknown) {
    // Catch unexpected errors in the main processing logic
    console.error(
      `[profileActions] UNEXPECTED GLOBAL ERROR during update for user ${userId}:`,
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
} // End of updateProfileData function
