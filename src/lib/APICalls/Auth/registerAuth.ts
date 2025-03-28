'use server';

import { db, storage, auth } from '@/lib/Firebase-Admin'; // Ensure storage is exported from index
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore'; // Correct import if needed elsewhere, or use admin.firestore.Timestamp
import { File as FormDataFile } from 'buffer'; // Use an alias if 'File' conflicts with DOM File
import { updateProfileImage } from '../User/updateProfileImage';
import { DecodedIdToken } from 'firebase-admin/auth'; // Import if needed for role setting

// Interface for the final sponsor data structure in Firestore
interface SponsorData {
  name: string;
  other: string;
  imageUrl?: string; // Add imageUrl field
}

// Define a type for the aid details structure you expect to save
type AidStockDetails = {
  [aidId: string]: {
    available: boolean;
    // Allow any other string key to hold string, number, boolean, or be undefined
    [key: string]: string | number | boolean | undefined;
  };
};

interface Organization {
  name: string;
  email: string;
  contactNumber: string;
  location: string; // Added from form
  dateOfEstablishment: string; // Added from form
  type: string;
  otherTypeText?: string; // Changed to optional
  description: string;
  profileImageUrl: string;
  contactPerson: string; // Added from form
  orgPosition: string; // Added from form
  socialMedia?: {
    // Added social media structure
    twitter?: { username: string; link?: string };
    facebook?: { username: string; link?: string };
    instagram?: { username: string; link?: string };
  };
  sponsors: SponsorData[]; // Changed to array of SponsorData
  aidStock: AidStockDetails; // Added Aid Stock structure
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Helper function to safely get string value from FormData
function getString(formData: FormData, key: string): string {
  return (formData.get(key) as string) ?? '';
}

// Helper function to safely get file value from FormData
function getFile(formData: FormData, key: string): File | null {
  const file = formData.get(key);
  return file instanceof File ? file : null;
}

export async function registerOrganization(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  let userId: string | null = null; // Define userId here to be accessible in catch
  try {
    const email = getString(formData, 'email');
    const password = getString(formData, 'password');
    const name = getString(formData, 'name');

    if (!email || !password || !name) {
      return {
        success: false,
        message: 'Email, password, and organization name are required.',
      };
    }

    // 1. Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name,
    });
    userId = userRecord.uid; // Assign the created userId

    // 2. Handle Profile Image Upload
    let profileImageUrl = '';
    const profileImage = getFile(formData, 'profileImage');

    if (profileImage) {
      const bucket = storage;
      const fileExtension = profileImage.name.substring(
        profileImage.name.lastIndexOf('.')
      );
      const filePath = `organizations/${userId}/profile-image${fileExtension}`;
      const file = bucket.file(filePath);
      await file.save(Buffer.from(await profileImage.arrayBuffer()), {
        metadata: { contentType: profileImage.type },
      });
      await file.makePublic();
      profileImageUrl = file.publicUrl();
      console.log(`Profile image uploaded to: ${profileImageUrl}`);
    } else {
      console.log('No profile image provided or found in FormData.');
    }

    // 3. Handle Sponsor Data and Images
    const sponsorsJson = getString(formData, 'sponsors_json');
    let sponsors: SponsorData[] = [];
    if (sponsorsJson) {
      try {
        const sponsorsBase = JSON.parse(sponsorsJson) as Omit<
          SponsorData,
          'imageUrl'
        >[];
        sponsors = sponsorsBase.map((s) => ({ ...s, imageUrl: undefined }));
      } catch (e) {
        console.error('Failed to parse sponsors_json:', e);
      }
    }

    const sponsorImageUploadPromises: Promise<void>[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('sponsor_photo_') && value instanceof File) {
        const sponsorNameKey = key
          .replace('sponsor_photo_', '')
          .replace(/_/g, ' ');
        const sponsorIndex = sponsors.findIndex(
          (s) => s.name === sponsorNameKey
        );
        if (sponsorIndex !== -1 && value.size > 0) {
          const sponsorImageFile = value;
          const bucket = storage;
          const fileExtension = sponsorImageFile.name.substring(
            sponsorImageFile.name.lastIndexOf('.')
          );
          const sanitizedSponsorName = sponsors[sponsorIndex].name.replace(
            /[^a-zA-Z0-9]/g,
            '_'
          );
          const filePath = `organizations/${userId}/sponsors/${sanitizedSponsorName}${fileExtension}`;
          const file = bucket.file(filePath);
          sponsorImageUploadPromises.push(
            (async () => {
              try {
                await file.save(
                  Buffer.from(await sponsorImageFile.arrayBuffer()),
                  { metadata: { contentType: sponsorImageFile.type } }
                );
                await file.makePublic();
                sponsors[sponsorIndex].imageUrl = file.publicUrl();
                console.log(
                  `Sponsor image for ${sponsors[sponsorIndex].name} uploaded to: ${sponsors[sponsorIndex].imageUrl}`
                );
              } catch (uploadError) {
                console.error(
                  `Failed to upload image for sponsor ${sponsors[sponsorIndex].name}:`,
                  uploadError
                );
              }
            })()
          );
        }
      }
    }
    await Promise.all(sponsorImageUploadPromises);
    console.log('Sponsor images processed.');

    // 4. Process Social Media Links
    const socialMedia: Organization['socialMedia'] = {};
    const platforms = ['twitter', 'facebook', 'instagram'];
    platforms.forEach((platform) => {
      const username = getString(formData, `social_${platform}_username`);
      if (username) {
        socialMedia[platform as keyof typeof socialMedia] = {
          username: username,
          link: getString(formData, `social_${platform}_link`) || undefined,
        };
      }
    });

    // 5. Process Aid Stock Details
    const aidStock: AidStockDetails = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('aid_') && typeof value === 'string') {
        const parts = key.split('_');
        if (parts.length >= 2) {
          const aidId = parts[1];
          const field = parts.slice(2).join('_');
          if (!aidStock[aidId]) {
            aidStock[aidId] = { available: false };
          }
          if (field === 'available') {
            aidStock[aidId].available = value === 'true';
          } else {
            const numValue = Number(value);
            if (
              !isNaN(numValue) &&
              [
                'foodPacks',
                'male',
                'female',
                'children',
                'kits',
                'tents',
                'blankets',
                'rescueKits',
                'specializedEquipment',
                'totalFunds',
                'counselors',
                'hours',
                'vehicles',
                'communication',
              ].includes(field)
            ) {
              aidStock[aidId][field] = numValue;
            } else {
              aidStock[aidId][field] = value;
            }
          }
        }
      }
    }
    console.log('Aid Stock details processed.');

    // 6. Prepare Organization Data for Firestore
    const orgType = getString(formData, 'type');
    const organizationDataBase = {
      userId: userId,
      name: name,
      email: email,
      contactNumber: getString(formData, 'contactNumber'),
      location: getString(formData, 'location'),
      dateOfEstablishment: getString(formData, 'dateOfEstablishment'),
      type: orgType,
      description: getString(formData, 'description'),
      contactPerson: getString(formData, 'contactPerson'),
      orgPosition: getString(formData, 'orgPosition'),
      profileImageUrl: profileImageUrl,
      sponsors: sponsors,
      aidStock: aidStock,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const organizationData: Partial<Organization> = { ...organizationDataBase };
    if (orgType === 'other') {
      const otherTextValue = getString(formData, 'otherTypeText');
      if (otherTextValue) {
        organizationData.otherTypeText = otherTextValue;
      }
    }
    if (Object.keys(socialMedia).length > 0) {
      organizationData.socialMedia = socialMedia;
    }
    console.log(
      'Organization data prepared:',
      JSON.stringify(organizationData, null, 2)
    );

    // 7. Save Organization Data to Firestore
    await db.collection('organizations').doc(userId).set(organizationData);

    // 8. [Optional] Set Custom Claims
    // await auth.setCustomUserClaims(userId, { role: 'organizationAdmin' });

    console.log(
      `Organization ${name} registered successfully with ID: ${userId}`
    );
    return { success: true, message: 'Registration successful!' };
  } catch (error: unknown) {
    // <--- Change 'any' to 'unknown'
    let errorMessage = 'Registration failed. Please try again.';
    console.error('Error during volunteer registration:', error);

    // --- Auth User Cleanup Logic (remains the same) ---
    if (userId) {
      try {
        console.log(`Attempting to delete orphaned auth user: ${userId}`);
        await auth.deleteUser(userId);
        console.log(`Successfully deleted orphaned auth user: ${userId}`);
      } catch (deleteError) {
        console.error(
          `Failed to delete orphaned auth user ${userId}:`,
          deleteError
        );
      }
    }

    // --- Type Guarding for 'error' (Type checking required for 'unknown') ---
    // Check if it looks like a Firebase Auth Error (has a 'code' property)
    if (typeof error === 'object' && error !== null && 'code' in error) {
      // We can reasonably assume 'message' also exists for these errors
      const firebaseError = error as { code: string; message: string }; // Assert type after check
      const errorCode = firebaseError.code;
      // Use the specific error message from Firebase by default
      errorMessage = firebaseError.message;

      // Refine the message for known common codes
      if (
        errorCode === 'auth/email-already-exists' ||
        errorCode === 'auth/email-already-in-use'
      ) {
        errorMessage =
          'This email is already registered. Please use a different email.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (errorCode === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      // For other Firebase error codes, the default firebaseError.message will be used.
    } else if (error instanceof Error) {
      // Handle generic JavaScript Error objects
      errorMessage = error.message;
    } else {
      // Handle cases where something other than an Error object was thrown
      // (e.g., a string, number, etc.) - Less common but possible
      try {
        errorMessage = JSON.stringify(error); // Try to stringify if it's an object/array
      } catch {
        errorMessage = String(error); // Fallback to basic string conversion
      }
    }

    return { success: false, message: errorMessage };
  }
}

interface Volunteer {
  // Keep existing relevant fields
  email: string;
  contactNumber: string;
  contactPersonNumber: string;
  username: string; // Matches acctUsername from frontend
  profileImageUrl: string | null;
  organizationId: string;
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue | string;
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue | string;
  userId: string;

  // Fields from form
  firstName: string;
  middleName: string;
  surname: string;
  gender: string;
  address: string;
  areaOfOperation: string;
  dateOfBirth: string;
  roleOrCategory: string;
  idType: string;
  idPhotoUrl?: string | null;
  skills?: string[];
  backgroundCheckConsent?: boolean;

  // --- ADDED FIELDS ---
  contactPerson?: string; // Emergency Contact Person Name
  contactPersonRelation?: string; // Relationship to Emergency Contact
  socialMedia?: {
    // Optional Social Media Map
    [key: string]: {
      username: string;
      link?: string;
    };
  };
  // --- END ADDED FIELDS ---
}
// --- End Updated Volunteer Interface ---

// ... Organization interface and registerOrganization function ...

// --- Start Updated registerVolunteer Function ---
export async function registerVolunteer(formData: FormData) {
  let userId: string | null = null;
  try {
    const displayName =
      `${formData.get('firstName') || ''} ${formData.get('surname') || ''}`.trim();

    // 1. --- Create Auth User ---
    const userRecord = await auth.createUser({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      displayName: displayName || undefined,
    });
    userId = userRecord.uid;
    console.log(`Created auth user with ID: ${userId}`);

    // 2. --- Handle Profile Image Upload ---
    let profileImageUrl: string | null = null;
    const profileImage = formData.get('profileImage') as File | null;
    if (profileImage && profileImage.size > 0) {
      // ... (profile image upload logic - unchanged) ...
      try {
        const bucket = storage;
        const originalName = profileImage.name;
        const fileExtension = originalName.substring(
          originalName.lastIndexOf('.')
        );
        const filePath = `volunteers/${userId}/profile-image${fileExtension}`;
        const file = bucket.file(filePath);
        console.log(`Uploading profile image to: ${filePath}`);
        const imageBuffer = Buffer.from(await profileImage.arrayBuffer());
        await file.save(imageBuffer, {
          metadata: { contentType: profileImage.type },
        });
        profileImageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        console.log(`Profile image URL: ${profileImageUrl}`);
      } catch (uploadError) {
        console.error('Error uploading profile image:', uploadError);
      }
    } else {
      console.log('No profile image provided or image is empty.');
    }

    // 3. --- Handle ID Photo Upload ---
    let idPhotoUrl: string | null = null;
    const idPhoto = formData.get('idPhoto') as File | null;
    if (idPhoto && idPhoto.size > 0) {
      // ... (id photo upload logic - unchanged) ...
      try {
        const bucket = storage;
        const originalName = idPhoto.name;
        const fileExtension = originalName.substring(
          originalName.lastIndexOf('.')
        );
        const filePath = `volunteers/${userId}/idPhoto${fileExtension}`;
        const file = bucket.file(filePath);
        console.log(`Uploading ID photo to: ${filePath}`);
        const imageBuffer = Buffer.from(await idPhoto.arrayBuffer());
        await file.save(imageBuffer, {
          metadata: { contentType: idPhoto.type },
        });
        idPhotoUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        console.log(`ID photo URL: ${idPhotoUrl}`);
      } catch (uploadError) {
        console.error('Error uploading ID photo:', uploadError);
      }
    } else {
      console.log('No ID photo provided or image is empty.');
    }

    // 4. --- Parse Skills ---
    let skillsArray: string[] = [];
    const skillsJson = formData.get('skills') as string | null;
    if (skillsJson) {
      // ... (skills parsing logic - unchanged) ...
      try {
        skillsArray = JSON.parse(skillsJson);
        console.log('Parsed skills:', skillsArray);
      } catch (parseError) {
        console.error('Error parsing skills JSON:', parseError);
      }
    } else {
      console.log('No skills data found in form.');
    }

    // 5. --- Handle Consent ---
    const consentString = formData.get('backgroundCheckConsent') as
      | string
      | null;
    const hasConsent = consentString === 'true';
    console.log(`Background Check Consent: ${consentString} -> ${hasConsent}`);

    // --- START: 6. Handle Social Media Data ---
    const socialMediaData: {
      [key: string]: { username: string; link?: string };
    } = {};
    // Twitter
    const twitterUsername = formData.get('social_twitter_username') as string;
    if (twitterUsername?.trim()) {
      socialMediaData.twitter = { username: twitterUsername.trim() };
      const twitterLink = formData.get('social_twitter_link') as string;
      if (twitterLink?.trim())
        socialMediaData.twitter.link = twitterLink.trim();
    }
    // Facebook
    const facebookUsername = formData.get('social_facebook_username') as string;
    if (facebookUsername?.trim()) {
      socialMediaData.facebook = { username: facebookUsername.trim() };
      const facebookLink = formData.get('social_facebook_link') as string;
      if (facebookLink?.trim())
        socialMediaData.facebook.link = facebookLink.trim();
    }
    // Instagram
    const instagramUsername = formData.get(
      'social_instagram_username'
    ) as string;
    if (instagramUsername?.trim()) {
      socialMediaData.instagram = { username: instagramUsername.trim() };
      const instagramLink = formData.get('social_instagram_link') as string;
      if (instagramLink?.trim())
        socialMediaData.instagram.link = instagramLink.trim();
    }
    // --- END: 6. Handle Social Media Data ---

    // 7. --- Prepare Complete Volunteer Data for Firestore ---
    const volunteerData: Volunteer = {
      firstName: (formData.get('firstName') as string) || '',
      middleName: (formData.get('middleName') as string) || '',
      surname: (formData.get('surname') as string) || '',
      email: formData.get('email') as string,
      gender: (formData.get('gender') as string) || '',
      address: (formData.get('address') as string) || '',
      areaOfOperation: (formData.get('areaOfOperation') as string) || '',
      contactNumber: (formData.get('contactNumber') as string) || '',
      contactPersonNumber:
        (formData.get('contactPersonNumber') as string) || '',
      dateOfBirth: (formData.get('dateOfBirth') as string) || '',
      username: (formData.get('acctUsername') as string) || '',
      organizationId: (formData.get('organization') as string) || '',
      roleOrCategory: (formData.get('roleOrCategory') as string) || '',
      idType: (formData.get('idType') as string) || '',

      profileImageUrl: profileImageUrl,
      idPhotoUrl: idPhotoUrl,

      skills: skillsArray.length > 0 ? skillsArray : undefined,
      backgroundCheckConsent: hasConsent,

      // --- ADDED FIELDS ---
      contactPerson: (formData.get('contactPerson') as string) || undefined, // Add contact person
      contactPersonRelation:
        (formData.get('contactPersonRelation') as string) || undefined, // Add relationship
      // Add socialMedia map only if it has entries
      ...(Object.keys(socialMediaData).length > 0 && {
        socialMedia: socialMediaData,
      }),
      // --- END ADDED FIELDS ---

      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      userId: userId,
    };

    // 8. --- Save Volunteer Data to Firestore ---
    console.log(
      'Saving volunteer data:',
      JSON.stringify(volunteerData, null, 2)
    );
    await db.collection('volunteers').doc(userId).set(volunteerData);

    // 9. --- Save Basic User Role Info ---
    await db.collection('users').doc(userId).set({
      role: 'volunteer',
      organizationId: volunteerData.organizationId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      // Optional: add displayName or other refs if needed in 'users' collection
      // displayName: displayName
    });

    console.log(
      `Successfully created volunteer and user documents with ID: ${userId}`
    );
    return { success: true, message: 'Registration successful!' };
  } catch (error) {
    // ... (Error handling and Auth User Cleanup - unchanged) ...
    let errorMessage = 'Registration failed. Please try again.';
    console.error('Error during volunteer registration:', error);
    if (userId) {
      try {
        console.log(`Attempting to delete orphaned auth user: ${userId}`);
        await auth.deleteUser(userId);
        console.log(`Successfully deleted orphaned auth user: ${userId}`);
      } catch (deleteError) {
        console.error(
          `Failed to delete orphaned auth user ${userId}:`,
          deleteError
        );
      }
    }
    if (error instanceof Error && 'code' in error) {
      const errorCode = (error as { code: string }).code;
      if (errorCode === 'auth/email-already-exists') {
        errorMessage =
          'This email is already registered. Please use a different email.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (errorCode === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
    }
    return { success: false, message: errorMessage };
  }
}
