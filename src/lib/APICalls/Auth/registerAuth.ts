'use server';

import { db, storage, auth } from '@/lib/Firebase-Admin';

interface Organization {
    name: string;
    email: string;
    contactNumber: string;
    type: string;
    description: string;
    profileImageUrl: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export async function registerOrganization(formData: FormData, image: File) {
    try {
        console.log(formData.get("email"));
        const userRecord = await auth.createUser({
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            displayName: formData.get("name") as string
        });

        let profileImageUrl = '';
        
        if (image) {
            const bucket = storage;

            const regex = /\.\w+$/;
            const match = regex.exec(image.name);
            const fileExtension = match ? match[0] : "";
            const file = bucket.file(`organizations/${userRecord.uid}/profile-image${fileExtension}`);
            await file.save(Buffer.from(await image.arrayBuffer()));
            profileImageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        }
        

        const organizationData: Organization = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            contactNumber: formData.get("contactNumber") as string,
            type: formData.get("type") as string,
            description: formData.get("description") as string,
            profileImageUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: userRecord.uid
        };

        console.log(organizationData);

        await db.collection("organizations").doc(userRecord.uid).set(organizationData);

        return { success: true, message: "Registration successful!" };
    } catch (error) {
        let errorMessage = "Registration failed. Please try again.";
        console.log(error);
        if (error instanceof Error && 'code' in error) {
            const errorCode = (error as { code: string }).code;

            if (errorCode === 'auth/email-already-exists') {
                errorMessage = "This email is already registered. Please use a different email.";
            } else if (errorCode === 'auth/invalid-email') {
                errorMessage = "Invalid email format.";
            } else if (errorCode === 'auth/weak-password') {
                errorMessage = "Password is too weak. Please use a stronger password.";
            }
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
          email: formData.get("email") as string,
          password: formData.get("password") as string,
          displayName: formData.get("name") as string
      });

      const userId = userRecord.uid; // Store UID to use consistently

      let profileImageUrl = '';
      const profileImage = formData.get("profileImage") as File;
      
      if (profileImage) {
          const bucket = storage;
      
          const originalName = profileImage.name;
          const fileExtension = originalName.substring(originalName.lastIndexOf(".")); 
      
          // Ensure the extension is included in the stored file name
          const file = bucket.file(`volunteers/${userId}/profile-image${fileExtension}`);
      
          // Convert image to Buffer
          const imageBuffer = Buffer.from(await profileImage.arrayBuffer());
      
          // Save the file to the storage bucket
          await file.save(imageBuffer);
      
          // Construct the public URL
          profileImageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      }
      

      // Create volunteer data with the same userId
      const volunteerData: Volunteer = {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          contactNumber: formData.get("contactNumber") as string,
          username: formData.get("username") as string,
          profileImageUrl,
          organizationId: formData.get("organization") as string, // Match the field name from the form
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: userId // Use the same userId from auth
      };
      
      // Create volunteer document with the userId as the document ID
      await db.collection("volunteers").doc(userId).set(volunteerData);
      
      // Create user document with the same userId
      await db.collection("users").doc(userId).set({
          role: "volunteer",
          organizationId: formData.get("organization") as string, // Match the field name from the form
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