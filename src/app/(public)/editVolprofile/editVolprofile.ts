'use server';

import { db, storage } from '@/lib/Firebase-Admin';

export async function updateVolunteerProfile(formData: FormData, userId: string, imageFile?: File) {
  try {
    // Prepare update data
    const updateData: any = {
      name: formData.get('name'),
      contactNumber: formData.get('contactNumber'),
      username: formData.get('username'),
      description: formData.get('description'),
      skills: formData.get('skills'),
      availability: formData.get('availability'),
      updatedAt: new Date().toISOString()
    };
    
    // Handle profile image update if a new image was uploaded
    if (imageFile) {
      const bucket = storage;
      const file = bucket.file(`volunteers/${userId}/profile-image`);
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      await file.save(imageBuffer);
      updateData.profileImageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    }
    
    // Update the volunteer document
    await db.collection('volunteers').doc(userId).update(updateData);
    
    return { success: true, message: 'Profile updated successfully!' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Profile update failed. Please try again.' };
  }
}