'use server';

import { db, storage, auth } from '@/lib/Firebase-Admin'; // Ensure storage is exported from index
import * as admin from 'firebase-admin';
// *** ADD GeoPoint to import ***
import { Timestamp, GeoPoint } from 'firebase-admin/firestore';
import { File as FormDataFile } from 'buffer'; // Use an alias if 'File' conflicts with DOM File
// Removed unused imports like updateProfileImage, DecodedIdToken if not used here

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

// --- MODIFIED Organization Interface ---
interface Organization {
  name: string;
  email: string;
  contactNumber: string;
  location: string; // Address string
  // *** ADD coordinates field ***
  coordinates?: admin.firestore.GeoPoint; // Store as GeoPoint (making it optional for safety)
  dateOfEstablishment: string;
  type: string;
  otherTypeText?: string;
  description: string;
  profileImageUrl: string;
  contactPerson: string;
  orgPosition: string;
  socialMedia?: {
    twitter?: { username: string; link?: string };
    facebook?: { username: string; link?: string };
    instagram?: { username: string; link?: string };
  };
  sponsors: SponsorData[];
  aidStock: AidStockDetails;
  createdAt: string; // Consider using Timestamp or Date type if preferable
  updatedAt: string; // Consider using Timestamp or Date type if preferable
  userId: string;
}
// --- END MODIFIED Organization Interface ---


// Helper function to safely get string value from FormData
function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  // Ensure null/undefined becomes empty string, handle potential File objects returning name
  if (value === null || value === undefined) return '';
  if (value instanceof File) return value.name; // Or handle file differently if needed
  return String(value);
}

// Helper function to safely get file value from FormData
function getFile(formData: FormData, key: string): File | null {
  const file = formData.get(key);
  // Ensure it's a File object and has size, otherwise return null
  if (file instanceof File && file.size > 0) {
    return file;
  }
  return null;
}

export async function registerOrganization(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  let userId: string | null = null; // Define userId here to be accessible in catch
  try {
    const email = getString(formData, 'email');
    const password = getString(formData, 'password');
    const name = getString(formData, 'name');
    // *** ADD: Get latitude and longitude strings ***
    const latitudeStr = getString(formData, 'latitude');
    const longitudeStr = getString(formData, 'longitude');

    // Basic validation
    if (!email || !password || !name) {
      return {
        success: false,
        message: 'Email, password, and organization name are required.',
      };
    }

    // *** ADD: Validate and parse coordinates ***
    const latitude = parseFloat(latitudeStr);
    const longitude = parseFloat(longitudeStr);
    if (isNaN(latitude) || isNaN(longitude)) {
       // Check specifically if they were provided but invalid
       if (latitudeStr || longitudeStr) {
           return { success: false, message: 'Invalid location coordinates provided.' };
       } else {
           // Or if they were completely missing (if making required on backend too)
           return { success: false, message: 'Location coordinates are required.'};
       }
    }

    // 1. Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name,
    });
    userId = userRecord.uid; // Assign the created userId
    console.log(`Created auth user with ID: ${userId}`);

    // 2. Handle Profile Image Upload
    let profileImageUrl = '';
    const profileImage = getFile(formData, 'profileImage');

    if (profileImage) {
      try {
         const bucket = storage;
         // Use a consistent file extension extraction method
         const fileExtension = profileImage.name.includes('.')
             ? profileImage.name.substring(profileImage.name.lastIndexOf('.'))
             : ''; // Handle cases with no extension
         const filePath = `organizations/${userId}/profile-image${fileExtension}`;
         const file = bucket.file(filePath);
         await file.save(Buffer.from(await profileImage.arrayBuffer()), {
             metadata: { contentType: profileImage.type },
         });
         await file.makePublic();
         // Ensure publicUrl() is the correct method or construct URL manually if needed
         profileImageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
         console.log(`Profile image uploaded to: ${profileImageUrl}`);
      } catch (uploadError) {
          console.error("Error uploading profile image:", uploadError);
          // Decide if this is a critical error or if registration can continue without image
          // profileImageUrl will remain empty if upload fails
      }
    } else {
      console.log('No profile image provided or found in FormData.');
    }

    // 3. Handle Sponsor Data and Images
    const sponsorsJson = getString(formData, 'sponsors_json');
    let sponsors: SponsorData[] = [];
    if (sponsorsJson) {
      try {
        // Expecting an array of objects like { name: string, other: string }
        const sponsorsBase = JSON.parse(sponsorsJson) as Omit<SponsorData, 'imageUrl'>[];
        // Initialize with imageUrl as undefined
        sponsors = sponsorsBase.map((s) => ({ ...s, imageUrl: undefined }));
      } catch (e) {
        console.error('Failed to parse sponsors_json:', e);
        // Continue without sponsors if JSON is invalid
      }
    }

    // Process sponsor images concurrently
    const sponsorImageUploadPromises: Promise<void>[] = [];
    sponsors.forEach((sponsor, index) => {
      // Construct the expected key for the sponsor's image file
      const imageKey = `sponsor_photo_${sponsor.name.replace(/\s+/g, '_')}`;
      const sponsorImageFile = getFile(formData, imageKey);

      if (sponsorImageFile) {
        const bucket = storage;
         const fileExtension = sponsorImageFile.name.includes('.')
             ? sponsorImageFile.name.substring(sponsorImageFile.name.lastIndexOf('.'))
             : '';
        // Sanitize name for use in path
        const sanitizedSponsorName = sponsor.name.replace(/[^a-zA-Z0-9]/g, '_');
        const filePath = `organizations/${userId}/sponsors/${sanitizedSponsorName}_${Date.now()}${fileExtension}`; // Add timestamp for uniqueness
        const file = bucket.file(filePath);

        sponsorImageUploadPromises.push(
          (async () => {
            try {
              await file.save(Buffer.from(await sponsorImageFile.arrayBuffer()), {
                metadata: { contentType: sponsorImageFile.type },
              });
              await file.makePublic();
              // Update the imageUrl in the sponsors array (ensure index is correct)
              sponsors[index].imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
              console.log(`Sponsor image for ${sponsor.name} uploaded to: ${sponsors[index].imageUrl}`);
            } catch (uploadError) {
              console.error(`Failed to upload image for sponsor ${sponsor.name}:`, uploadError);
              // imageUrl remains undefined for this sponsor
            }
          })()
        );
      }
    });
    // Wait for all sponsor image uploads to settle (complete or fail)
    await Promise.allSettled(sponsorImageUploadPromises);
    console.log('Sponsor images processed.');


    // 4. Process Social Media Links
    const socialMedia: Organization['socialMedia'] = {};
    const platforms = ['twitter', 'facebook', 'instagram'];
    platforms.forEach((platform) => {
      const username = getString(formData, `social_${platform}_username`);
      if (username) {
         // Define the structure for each platform
         const platformData: { username: string; link?: string } = { username: username };
         const link = getString(formData, `social_${platform}_link`);
         if (link) {
            platformData.link = link;
         }
         // Assign to the correct key in socialMedia object
         socialMedia[platform as keyof typeof socialMedia] = platformData;
      }
    });


    // 5. Process Aid Stock Details
    const aidStock: AidStockDetails = {};
    // Iterate through expected aid types to check availability and details
    const allAidTypes = [ 'food', 'clothing', 'medicalSupplies', 'shelter', 'searchAndRescue', 'financialAssistance', 'counseling', 'technicalSupport'];
    allAidTypes.forEach(aidId => {
        const isAvailable = getString(formData, `aid_${aidId}_available`) === 'true';
        if (isAvailable) {
            aidStock[aidId] = { available: true };
            // Find all details associated with this aidId
            for (const [key, value] of formData.entries()) {
                if (key.startsWith(`aid_${aidId}_`) && key !== `aid_${aidId}_available`) {
                    const field = key.substring(`aid_${aidId}_`.length);
                    const stringValue = getString(formData, key); // Use helper to get string value
                    const numValue = Number(stringValue);

                    // Define fields expected to be numbers
                    const numericFields = [ 'foodPacks', 'male', 'female', 'children', 'kits', 'tents', 'blankets', 'rescueKits', 'rescuePersonnel', 'totalFunds', 'counselors', 'hours', 'vehicles', 'communication'];

                    if (numericFields.includes(field) && !isNaN(numValue)) {
                        aidStock[aidId][field] = numValue;
                    } else if (stringValue) { // Store non-empty strings for non-numeric fields
                        aidStock[aidId][field] = stringValue;
                    }
                }
            }
        }
    });
    console.log('Aid Stock details processed:', JSON.stringify(aidStock, null, 2));


    // 6. Prepare Organization Data for Firestore
    const orgType = getString(formData, 'type');
    // Base data structure matching the Interface (excluding conditional fields initially)
    const organizationDataBase = {
      userId: userId,
      name: name,
      email: email,
      contactNumber: getString(formData, 'contactNumber'),
      location: getString(formData, 'location'), // Address string
      // *** ADD: Store coordinates as GeoPoint ***
      coordinates: new GeoPoint(latitude, longitude),
      dateOfEstablishment: getString(formData, 'dateOfEstablishment'),
      type: orgType,
      description: getString(formData, 'description'),
      contactPerson: getString(formData, 'contactPerson'),
      orgPosition: getString(formData, 'orgPosition'),
      profileImageUrl: profileImageUrl || '', // Use empty string if no image uploaded
      sponsors: sponsors, // Use the processed sponsors array
      aidStock: aidStock, // Use the processed aidStock object
      createdAt: new Date().toISOString(), // Use ISO string format
      updatedAt: new Date().toISOString(), // Use ISO string format
    };

    // Create the final object, adding conditional fields
    const organizationData: Partial<Organization> = { ...organizationDataBase };

    // Handle 'other' type text
    if (orgType === 'other') {
      const otherTextValue = getString(formData, 'otherTypeText');
      if (otherTextValue) {
        organizationData.otherTypeText = otherTextValue;
      }
    }

    // Add social media if it's not empty
    if (Object.keys(socialMedia).length > 0) {
      organizationData.socialMedia = socialMedia;
    }

    console.log(
      'Final organization data for Firestore:',
      JSON.stringify(organizationData, null, 2)
    );

    // 7. Save Organization Data to Firestore
    // Ensure data conforms to Partial<Organization> before setting
    await db.collection('organizations').doc(userId).set(organizationData as Organization); // Cast after construction

    // 8. [Optional] Set Custom Claims (Example)
    // Consider adding roles for easier frontend/backend access control
    // await auth.setCustomUserClaims(userId, { role: 'organization', orgId: userId });

    console.log(
      `Organization ${name} registered successfully with ID: ${userId}`
    );
    return { success: true, message: 'Registration successful!' };

  } catch (error: unknown) {
    // Error handling remains largely the same as provided in the previous fetched content
    let errorMessage = 'Registration failed. Please try again.';
    console.error('Error during organization registration:', error); // Corrected context message

    // Auth User Cleanup Logic (important)
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
        // Log this but don't override the original registration error message
      }
    }

    // Type Guarding for 'error'
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      errorMessage = firebaseError.message; // Default to Firebase message

      // Refine message for common codes
      const errorCode = firebaseError.code;
      if (
        errorCode === 'auth/email-already-exists' ||
        errorCode === 'auth/email-already-in-use'
      ) {
        errorMessage = 'This email is already registered. Please use a different email or log in.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'The email address provided is not valid.';
      } else if (errorCode === 'auth/weak-password') {
        errorMessage = 'The password provided is too weak.';
      }
      // Add more specific error code handling if needed
    } else if (error instanceof Error) {
      // Handle generic JavaScript Error objects
      errorMessage = error.message;
    } else {
       // Handle non-standard errors
      try { errorMessage = JSON.stringify(error); }
      catch { errorMessage = String(error); }
    }

    return { success: false, message: errorMessage };
  }
}


// --- Volunteer Interface (Keep as is from fetched content) ---
interface Volunteer {
  // ... existing fields ...
  email: string;
  contactNumber: string;
  contactPersonNumber: string;
  username: string;
  profileImageUrl: string | null;
  organizationId: string;
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue | string;
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue | string;
  userId: string;
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
  contactPerson?: string;
  contactPersonRelation?: string;
  socialMedia?: {
    [key: string]: {
      username: string;
      link?: string;
    };
  };
}

// --- registerVolunteer Function (Keep as is from fetched content) ---
export async function registerVolunteer(formData: FormData) {
  let userId: string | null = null;
  try {
      // 1. --- Create Auth User ---
       const displayName = `${getString(formData, 'firstName')} ${getString(formData, 'surname')}`.trim();
       const userRecord = await auth.createUser({
         email: getString(formData, 'email'),
         password: getString(formData, 'password'),
         displayName: displayName || undefined,
       });
       userId = userRecord.uid;
       console.log(`Created volunteer auth user with ID: ${userId}`);

      // 2. --- Handle Profile Image Upload ---
      let profileImageUrl: string | null = null;
      const profileImage = getFile(formData, 'profileImage');
      if (profileImage) {
          try {
              const bucket = storage;
              const fileExtension = profileImage.name.includes('.') ? profileImage.name.substring(profileImage.name.lastIndexOf('.')) : '';
              const filePath = `volunteers/${userId}/profile-image${fileExtension}`;
              const file = bucket.file(filePath);
              await file.save(Buffer.from(await profileImage.arrayBuffer()), { metadata: { contentType: profileImage.type } });
              await file.makePublic();
              profileImageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
              console.log(`Volunteer profile image URL: ${profileImageUrl}`);
          } catch (uploadError) {
              console.error('Error uploading volunteer profile image:', uploadError);
          }
      } else {
          console.log('No volunteer profile image provided.');
      }


      // 3. --- Handle ID Photo Upload ---
       let idPhotoUrl: string | null = null;
       const idPhoto = getFile(formData, 'idPhoto');
       if (idPhoto) {
           try {
               const bucket = storage;
               const fileExtension = idPhoto.name.includes('.') ? idPhoto.name.substring(idPhoto.name.lastIndexOf('.')) : '';
               const filePath = `volunteers/${userId}/idPhoto${fileExtension}`;
               const file = bucket.file(filePath);
               await file.save(Buffer.from(await idPhoto.arrayBuffer()), { metadata: { contentType: idPhoto.type } });
               await file.makePublic();
               idPhotoUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
               console.log(`ID photo URL: ${idPhotoUrl}`);
           } catch (uploadError) {
               console.error('Error uploading ID photo:', uploadError);
           }
       } else {
           console.log('No ID photo provided.');
       }

      // 4. --- Parse Skills ---
       let skillsArray: string[] = [];
       const skillsJson = getString(formData, 'skills');
       if (skillsJson) {
           try { skillsArray = JSON.parse(skillsJson); }
           catch (parseError) { console.error('Error parsing skills JSON:', parseError); }
       } else { console.log('No skills data found.'); }


      // 5. --- Handle Consent ---
       const consentString = getString(formData, 'backgroundCheckConsent');
       const hasConsent = consentString === 'true';
       console.log(`Background Check Consent: ${consentString} -> ${hasConsent}`);


      // 6. --- Handle Social Media Data ---
      const socialMediaData: Volunteer['socialMedia'] = {};
      ['twitter', 'facebook', 'instagram'].forEach(platform => {
          const username = getString(formData, `social_${platform}_username`);
          if (username) {
              socialMediaData[platform] = { username };
              const link = getString(formData, `social_${platform}_link`);
              if (link) socialMediaData[platform].link = link;
          }
      });

      // 7. --- Prepare Complete Volunteer Data for Firestore ---
       const volunteerData: Volunteer = {
           firstName: getString(formData, 'firstName'),
           middleName: getString(formData, 'middleName'),
           surname: getString(formData, 'surname'),
           email: getString(formData, 'email'),
           gender: getString(formData, 'gender'),
           address: getString(formData, 'address'),
           areaOfOperation: getString(formData, 'areaOfOperation'),
           contactNumber: getString(formData, 'contactNumber'),
           contactPersonNumber: getString(formData, 'contactPersonNumber'),
           dateOfBirth: getString(formData, 'dateOfBirth'),
           username: getString(formData, 'acctUsername'),
           organizationId: getString(formData, 'organization'),
           roleOrCategory: getString(formData, 'roleOrCategory'),
           idType: getString(formData, 'idType'),
           profileImageUrl: profileImageUrl,
           idPhotoUrl: idPhotoUrl,
           skills: skillsArray.length > 0 ? skillsArray : undefined,
           backgroundCheckConsent: hasConsent,
           contactPerson: getString(formData, 'contactPerson') || undefined,
           contactPersonRelation: getString(formData, 'contactPersonRelation') || undefined,
           socialMedia: Object.keys(socialMediaData).length > 0 ? socialMediaData : undefined,
           createdAt: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp
           updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp
           userId: userId,
       };

      // 8. --- Save Volunteer Data to Firestore ---
      console.log('Saving volunteer data:', JSON.stringify(volunteerData, null, 2));
      await db.collection('volunteers').doc(userId).set(volunteerData);

      // 9. --- Save Basic User Role Info ---
      await db.collection('users').doc(userId).set({
          role: 'volunteer',
          organizationId: volunteerData.organizationId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          displayName: displayName || volunteerData.username // Use constructed name or username
      });

      console.log(`Successfully created volunteer and user documents with ID: ${userId}`);
      return { success: true, message: 'Registration successful!' };

  } catch (error) {
     // Error handling for volunteer registration (similar logic as organization)
     let errorMessage = 'Volunteer registration failed. Please try again.';
     console.error('Error during volunteer registration:', error);
     if (userId) { /* Auth cleanup */
         try { await auth.deleteUser(userId); console.log(`Deleted orphaned volunteer auth user: ${userId}`); }
         catch (deleteError) { console.error(`Failed to delete orphaned volunteer auth user ${userId}:`, deleteError); }
     }
      // Refine error message based on error type/code
      if (typeof error === 'object' && error !== null && 'code' in error) {
           const firebaseError = error as { code: string; message: string };
           errorMessage = firebaseError.message; // Default
           const errorCode = firebaseError.code;
           if (errorCode === 'auth/email-already-exists' || errorCode === 'auth/email-already-in-use') {
               errorMessage = 'This email is already registered. Please use a different email or log in.';
           } else if (errorCode === 'auth/invalid-email') {
               errorMessage = 'The email address provided is not valid.';
           } else if (errorCode === 'auth/weak-password') {
               errorMessage = 'The password provided is too weak.';
           }
       } else if (error instanceof Error) {
           errorMessage = error.message;
       } else {
           try { errorMessage = JSON.stringify(error); } catch { errorMessage = String(error); }
       }
     return { success: false, message: errorMessage };
  }
}