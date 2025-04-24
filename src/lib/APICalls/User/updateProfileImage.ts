// src/lib/APICalls/User/updateProfileImage.ts
'use server';

import { storage, auth } from '@/lib/Firebase-Admin';
import { FirebaseError } from 'firebase-admin/app'; // Keep for type checking in catch

export const updateProfileImage = async (
  image: File,
  uid: string,
  userType: string
): Promise<string | null> => {
  // console.log(`[updateProfileImage] Attempting to update profile image for user: ${uid}, type: ${userType}`); // REMOVED
  // console.log(`[updateProfileImage] Received file: ${image.name}, size: ${image.size}, type: ${image.type}`); // REMOVED

  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    console.error(
      '[updateProfileImage] CRITICAL ERROR: FIREBASE_STORAGE_BUCKET environment variable is not set.'
    );
    throw new Error(
      'Server configuration error: Storage bucket not specified.'
    );
  }

  try {
    const bucket = storage;
    // console.log(`[updateProfileImage] Using storage bucket: ${bucket.name}`); // REMOVED

    const regex = /\.\w+$/;
    const match = regex.exec(image.name);
    const fileExtension = match ? match[0] : '.unknown';
    const filePath = `${userType}/${uid}/profile-image${fileExtension}`;
    const file = bucket.file(filePath);

    // console.log(`[updateProfileImage] Attempting to save file to path: ${filePath}`); // REMOVED
    const imageBuffer = Buffer.from(await image.arrayBuffer());

    await file.save(imageBuffer, {
      contentType: image.type,
      metadata: {
        cacheControl: 'public, max-age=0, no-cache, must-revalidate',
      },
    });
    // console.log(`[updateProfileImage] File saved successfully with cache control.`); // REMOVED

    // console.log(`[updateProfileImage] Attempting to make file public...`); // REMOVED
    await file.makePublic();
    // console.log(`[updateProfileImage] File made public successfully.`); // REMOVED

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    // console.log(`[updateProfileImage] Generated public URL: ${publicUrl}`); // REMOVED

    // console.log(`[updateProfileImage] Attempting to update Firebase Auth user photoURL...`); // REMOVED
    await auth.updateUser(uid, { photoURL: publicUrl });
    // console.log(`[updateProfileImage] Firebase Auth user photoURL updated successfully.`); // REMOVED

    return publicUrl;
  } catch (error: unknown) {
    // Keep error logging
    console.error(
      '[updateProfileImage] Detailed Error updating profile image:',
      error
    );

    let errorMessage = 'An unknown error occurred during image processing.';
    let errorCode: string | null = null;

    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof (error as any).message === 'string') {
        errorMessage = (error as any).message;
      }
      if ('code' in error && typeof (error as any).code === 'string') {
        errorCode = (error as any).code;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    if (errorCode) {
      errorMessage = `Error Code (${errorCode}): ${errorMessage}`;
      if (errorCode === 'storage/unauthorized') {
        errorMessage +=
          ' Access denied. Please check Storage permissions (IAM roles for service account).';
      } else if (errorCode === 'storage/object-not-found') {
        errorMessage +=
          ' File path not found. Check bucket name or generated file path.';
      } else if (errorCode === 'storage/bucket-not-found') {
        errorMessage +=
          ' Storage bucket not found. Check FIREBASE_STORAGE_BUCKET environment variable.';
      } else if (errorCode.startsWith('auth/')) {
        errorMessage +=
          ' Authentication error occurred during user update. Check Auth permissions.';
      }
    }

    throw new Error(`Failed to update profile image: ${errorMessage}`);
  }
};
