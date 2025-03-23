'use server';

import { db, storage } from '@/lib/Firebase-Admin';

// Function to fetch volunteer profile with organization details
export async function getVolunteerProfile(userId: string) {
  try {
    // Get volunteer data
    const volunteerDoc = await db.collection('volunteers').doc(userId).get();
    
    if (!volunteerDoc.exists) {
      return null;
    }
    
    const volunteerData = volunteerDoc.data();
    
    // Fetch organization data if organizationId exists
    let organizationData = null;
    if (volunteerData?.organizationId) {
      const orgDoc = await db.collection('organizations').doc(volunteerData.organizationId).get();
      if (orgDoc.exists) {
        organizationData = {
          name: orgDoc.data()?.name || 'Unknown Organization',
          profileImageUrl: orgDoc.data()?.profileImageUrl || null
        };
      }
    }
    
    // Return combined data
    return {
      ...volunteerData,
      organization: organizationData
    };
  } catch (error) {
    console.error('Error fetching volunteer profile:', error);
    throw new Error('Failed to fetch profile data');
  }
}

// Function to update volunteer profile
export async function updateVolunteerProfile(formData: FormData, userId: string) {
  try {
    // Prepare update data
    const updateData = {
      name: formData.get('name'),
      contactNumber: formData.get('contactNumber'),
      username: formData.get('username'),
      description: formData.get('description'),
      skills: formData.get('skills'),
      availability: formData.get('availability'),
      updatedAt: new Date().toISOString()
    };
    
    // Update the volunteer document
    await db.collection('volunteers').doc(userId).update(updateData);
    
    return { success: true, message: 'Profile updated successfully!' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Profile update failed. Please try again.' };
  }
}

// Function to upload profile image
export async function uploadProfileImage(imageFile: File, userId: string) {
  try {
    if (!imageFile) {
      return { success: false, message: 'No image file provided' };
    }
    
    const bucket = storage;
    const file = bucket.file(`volunteers/${userId}/profile-image`);
    
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    
    // Check if buffer is empty
    if (imageBuffer.length === 0) {
      console.error('Image buffer is empty');
      return { success: false, message: 'Empty image file. Please try again.' };
    }
    
    // Set metadata to make the file publicly accessible
    const metadata = {
      contentType: imageFile.type,
      metadata: {
        firebaseStorageDownloadTokens: userId // This helps with public access
      }
    };
    
    // Save file with metadata
    await file.save(imageBuffer, {
      metadata: metadata,
      validation: 'md5'
    });
    
    // Make the file publicly accessible
    await file.makePublic();
    
    // Update the profile image URL in the volunteer document
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    await db.collection('volunteers').doc(userId).update({
      profileImageUrl: imageUrl,
      updatedAt: new Date().toISOString()
    });
    
    return { 
      success: true, 
      message: 'Profile image updated successfully!',
      imageUrl
    };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return { success: false, message: 'Image upload failed. Please try again.' };
  }
}