'use server';

import { db, storage, auth } from '@/lib/Firebase-Admin'; // Ensure storage is exported from index
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore'; // Correct import if needed elsewhere, or use admin.firestore.Timestamp
import { File as FormDataFile } from 'buffer'; // Use an alias if 'File' conflicts with DOM File
import { updateProfileImage } from '../User/updateProfileImage';

// Interface for the final sponsor data structure in Firestore
interface SponsorDataForFirestore {
  name: string;
  other: string;
  photoUrl: string | null; // URL after upload, or null
}

// Updated Organization interface
interface Organization {
  name: string;
  email: string;
  contactNumber: string;
  type: string;
  description: string;
  location?: string;
  dateOfEstablishment?: string;
  otherText?: string;
  contactPerson?: string;
  orgPosition?: string;
  profileImageUrl: string;
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue | string;
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue | string;
  userId: string;
  socialMedia?: {
    [key: string]: {
      username: string;
      link?: string;
    };
  };
  // Add the sponsors array field (optional)
  sponsors?: SponsorDataForFirestore[];
}

export async function registerOrganization(
  formData: FormData,
  profileImage: File /* Renamed from 'image' for clarity */
) {
  try {
    console.log('Registering organization for email:', formData.get('email'));
    const userRecord = await auth.createUser({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      displayName: formData.get('name') as string,
    });
    const userId = userRecord.uid; // Store for consistent use

    let profileImageUrl = '';

    // 1. --- Handle Main Profile Image Upload ---
    if (profileImage && profileImage.size > 0) {
      try {
        const bucket = storage; // Get storage bucket instance
        const profileImageName = profileImage.name;
        const profileFileExtension = profileImageName.substring(
          profileImageName.lastIndexOf('.')
        );
        const profileImagePath = `organizations/${userId}/profile-image${profileFileExtension}`;
        const profileFileRef = bucket.file(profileImagePath);

        console.log(`Uploading profile image to: ${profileImagePath}`);
        const profileImageBuffer = Buffer.from(
          await profileImage.arrayBuffer()
        );
        await profileFileRef.save(profileImageBuffer, {
          metadata: { contentType: profileImage.type }, // Set content type
        });
        // Make file public if needed (consider security implications)
        // await profileFileRef.makePublic();
        profileImageUrl = `https://storage.googleapis.com/${bucket.name}/${profileFileRef.name}`;
        console.log(`Profile image URL: ${profileImageUrl}`);
      } catch (uploadError) {
        console.error('Error uploading profile image:', uploadError);
        // Decide if this error is critical or if registration can continue without profile image
        // profileImageUrl = ''; // Keep it empty or set a default
      }
    } else {
      console.log('No profile image provided or image is empty.');
    }

    // 2. --- Prepare Base Organization Data ---
    const organizationData: Omit<Organization, 'sponsors'> & {
      sponsors?: SponsorDataForFirestore[];
    } = {
      // Use Omit temporarily
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      contactNumber: formData.get('contactNumber') as string,
      type: formData.get('type') as string,
      description: formData.get('description') as string,
      location: (formData.get('location') as string) || '',
      dateOfEstablishment:
        (formData.get('dateOfEstablishment') as string) || '',
      otherText: (formData.get('otherText') as string) || '',
      contactPerson: (formData.get('contactPerson') as string) || '',
      orgPosition: (formData.get('orgPosition') as string) || '',
      profileImageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      userId: userId,
    };

    // 3. --- Handle Social Media Data ---
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
    // Add to main data if not empty
    if (Object.keys(socialMediaData).length > 0) {
      organizationData.socialMedia = socialMediaData;
    }

    // 4. --- Handle Sponsors Data and Image Uploads ---
    const finalSponsorsData: SponsorDataForFirestore[] = [];
    const sponsorsJson = formData.get('sponsors_json') as string;
    const sponsorFilesMap: Map<string, File> = new Map(); // Use DOM File type here

    // Separate sponsor files from other form data
    for (const [key, value] of formData.entries()) {
      if (
        key.startsWith('sponsor_photo_') &&
        value instanceof File &&
        value.size > 0
      ) {
        const sponsorId = key.replace('sponsor_photo_', '');
        sponsorFilesMap.set(sponsorId, value);
        console.log(
          `Found sponsor photo file for ID: ${sponsorId}, Name: ${value.name}, Size: ${value.size}`
        );
      }
    }

    if (sponsorsJson) {
      try {
        const sponsorsInfo = JSON.parse(sponsorsJson) as {
          id: string;
          name: string;
          other: string;
        }[];
        console.log(`Processing ${sponsorsInfo.length} sponsors from JSON.`);

        // Process each sponsor sequentially using map and Promise.all for uploads
        const sponsorProcessingPromises = sponsorsInfo.map(
          async (sponsorInfo) => {
            let sponsorPhotoUrl: string | null = null;
            const sponsorPhotoFile = sponsorFilesMap.get(sponsorInfo.id);

            if (sponsorPhotoFile) {
              try {
                const bucket = storage; // Get storage bucket instance
                const sponsorPhotoName = sponsorPhotoFile.name;
                const sponsorPhotoExtension = sponsorPhotoName.substring(
                  sponsorPhotoName.lastIndexOf('.')
                );
                const sponsorPhotoPath = `organizations/${userId}/sponsors/${sponsorInfo.id}/logo${sponsorPhotoExtension}`;
                const sponsorFileRef = bucket.file(sponsorPhotoPath);

                console.log(
                  `Uploading sponsor photo for ${sponsorInfo.id} to: ${sponsorPhotoPath}`
                );
                const sponsorPhotoBuffer = Buffer.from(
                  await sponsorPhotoFile.arrayBuffer()
                );

                await sponsorFileRef.save(sponsorPhotoBuffer, {
                  metadata: { contentType: sponsorPhotoFile.type }, // Set content type
                });
                // Make file public if needed
                // await sponsorFileRef.makePublic();
                sponsorPhotoUrl = `https://storage.googleapis.com/${bucket.name}/${sponsorFileRef.name}`;
                console.log(
                  `Uploaded sponsor photo for ${sponsorInfo.id}. URL: ${sponsorPhotoUrl}`
                );
              } catch (sponsorUploadError) {
                console.error(
                  `Error uploading sponsor photo for ${sponsorInfo.id}:`,
                  sponsorUploadError
                );
                // Keep sponsorPhotoUrl as null if upload fails
              }
            } else {
              console.log(
                `No photo file found for sponsor ID: ${sponsorInfo.id}`
              );
            }

            // Return the data structure for Firestore
            return {
              name: sponsorInfo.name,
              other: sponsorInfo.other,
              photoUrl: sponsorPhotoUrl,
            };
          }
        );

        // Wait for all sponsor uploads and data preparation to complete
        const results = await Promise.all(sponsorProcessingPromises);
        finalSponsorsData.push(...results); // Add results to the final array
      } catch (parseError) {
        console.error('Error parsing sponsors_json:', parseError);
        // Decide how to handle: stop registration, continue without sponsors?
        // For now, we'll just log the error and continue without sponsors
      }
    } else {
      console.log('No sponsors_json data found in form data.');
    }

    // Add the processed sponsors array to the main data object if not empty
    if (finalSponsorsData.length > 0) {
      organizationData.sponsors = finalSponsorsData;
      console.log(
        `Adding ${finalSponsorsData.length} processed sponsors to Firestore data.`
      );
    }

    // 5. --- Save Everything to Firestore ---
    console.log(
      'Final organization data being saved to Firestore:',
      JSON.stringify(organizationData, null, 2)
    ); // Pretty print for readability
    await db.collection('organizations').doc(userId).set(organizationData);

    console.log(`Organization ${userId} saved successfully.`);
    return { success: true, message: 'Registration successful!' };
  } catch (error) {
    let errorMessage = 'Registration failed. Please try again.';
    console.error('Error during organization registration:', error);
    // Consider deleting the Auth user if Firestore write fails to avoid orphaned auth accounts
    // if (userId) { try { await auth.deleteUser(userId); } catch (deleteError) { console.error("Failed to clean up auth user:", deleteError); } }

    if (error instanceof Error && 'code' in error) {
      const errorCode = (error as { code: string }).code;
      if (errorCode === 'auth/email-already-exists') {
        errorMessage =
          'This email is already registered. Please use a different email.';
      } // ... other specific auth errors
    }
    return { success: false, message: errorMessage };
  }
}

interface Volunteer {
  // Keep existing relevant fields
  email: string;
  contactNumber: string;
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
