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
  name: string;
  email: string;
  contactNumber: string;
  username: string;
  profileImageUrl: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
  
export async function registerVolunteer(formData: FormData) {
  try {
    // First, create the auth user to get a UID
    const userRecord = await auth.createUser({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      displayName: formData.get('name') as string,
    });

    const userId = userRecord.uid; // Store UID to use consistently

    let profileImageUrl = '';
    const profileImage = formData.get('profileImage') as File;

    if (profileImage) {
      const bucket = storage;

      const originalName = profileImage.name;
      const fileExtension = originalName.substring(
        originalName.lastIndexOf('.')
      );

      // Ensure the extension is included in the stored file name
      const file = bucket.file(
        `volunteers/${userId}/profile-image${fileExtension}`
      );

      // Convert image to Buffer
      const imageBuffer = Buffer.from(await profileImage.arrayBuffer());

      // Save the file to the storage bucket
      await file.save(imageBuffer);

      // Construct the public URL
      profileImageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    }

    // Create volunteer data with the same userId
    const volunteerData: Volunteer = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      contactNumber: formData.get('contactNumber') as string,
      username: formData.get('username') as string,
      profileImageUrl,
      organizationId: formData.get('organization') as string, // Match the field name from the form
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId, // Use the same userId from auth
    };

    // Create volunteer document with the userId as the document ID
    await db.collection('volunteers').doc(userId).set(volunteerData);

    // Create user document with the same userId
    await db
      .collection('users')
      .doc(userId)
      .set({
        role: 'volunteer',
        organizationId: formData.get('organization') as string, // Match the field name from the form
        createdAt: new Date().toISOString(),
      });

    console.log(`Successfully created volunteer with ID: ${userId}`);
    return { success: true, message: 'Registration successful!' };
  } catch (error) {
    let errorMessage = 'Registration failed. Please try again.';
    console.error('Error during volunteer registration:', error);

    if (error instanceof Error && 'code' in error) {
      const errorCode = (error as { code: string }).code;
      if (errorCode === 'auth/email-already-exists') {
        errorMessage =
          'This email is already registered. Please use a different email.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (errorCode === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (errorCode === 'auth/uid-already-exists') {
        errorMessage =
          'Username is already taken. Please choose a different username.';
      }
    }

    return { success: false, message: errorMessage };
  }
}
    try {
        const userRecord = await auth.createUser({
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            displayName: formData.get("name") as string
        });

        const userId = userRecord.uid;

        const profileImage = formData.get("profileImage") as File;

        if (profileImage) {
            await updateProfileImage(profileImage, userRecord.uid, "volunteers");
        }

        const volunteerData: Omit<Volunteer, "profileImageUrl"> = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            contactNumber: formData.get("contactNumber") as string,
            username: formData.get("username") as string,
            organizationId: formData.get("organization") as string,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: userId // Use the same userId from auth
        };

        await db.collection("volunteers").doc(userId).set(volunteerData);

        await db.collection("users").doc(userId).set({
            role: "volunteer",
            organizationId: formData.get("organization") as string,
            createdAt: new Date().toISOString()
        });

        console.log(`Successfully created volunteer with ID: ${userId}`);
        return { success: true, message: "Registration successful!" };
    } catch (error) {
        let errorMessage = "Registration failed. Please try again.";
        console.error("Error during volunteer registration:", error);

        if (error instanceof Error && 'code' in error) {
            const errorCode = (error as { code: string }).code;
            if (errorCode === 'auth/email-already-exists') {
                errorMessage = "This email is already registered. Please use a different email.";
            } else if (errorCode === 'auth/invalid-email') {
                errorMessage = "Invalid email format.";
            } else if (errorCode === 'auth/weak-password') {
                errorMessage = "Password is too weak. Please use a stronger password.";
            } else if (errorCode === 'auth/uid-already-exists') {
                errorMessage = "Username is already taken. Please choose a different username.";
            }
        }

        return { success: false, message: errorMessage };
    }
}
