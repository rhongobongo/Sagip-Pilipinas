'use server';

import { db, storage, auth } from '@/lib/Firebase-Admin';
import { DecodedIdToken } from 'firebase-admin/auth'; // Import if needed for role setting

// --- Define expected structures ---

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
    socialMedia?: { // Added social media structure
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


export async function registerOrganization(formData: FormData): Promise<{ success: boolean; message: string }> {
    let userId: string | null = null; // Define userId here to be accessible in catch
    try {
        const email = getString(formData, "email");
        const password = getString(formData, "password");
        const name = getString(formData, "name");

        if (!email || !password || !name) {
            return { success: false, message: "Email, password, and organization name are required." };
        }

        // 1. Create Firebase Auth user
        const userRecord = await auth.createUser({
            email: email,
            password: password,
            displayName: name
        });
        userId = userRecord.uid; // Assign the created userId

        // 2. Handle Profile Image Upload
        let profileImageUrl = '';
        const profileImage = getFile(formData, "profileImage");

        if (profileImage) {
            const bucket = storage;
            const fileExtension = profileImage.name.substring(profileImage.name.lastIndexOf("."));
            const filePath = `organizations/${userId}/profile-image${fileExtension}`;
            const file = bucket.file(filePath);
            await file.save(Buffer.from(await profileImage.arrayBuffer()), { metadata: { contentType: profileImage.type } });
            await file.makePublic();
            profileImageUrl = file.publicUrl();
            console.log(`Profile image uploaded to: ${profileImageUrl}`);
        } else {
             console.log("No profile image provided or found in FormData.");
        }


        // 3. Handle Sponsor Data and Images
        const sponsorsJson = getString(formData, 'sponsors_json');
        let sponsors: SponsorData[] = [];
        if (sponsorsJson) {
            try {
                const sponsorsBase = JSON.parse(sponsorsJson) as Omit<SponsorData, 'imageUrl'>[];
                sponsors = sponsorsBase.map(s => ({ ...s, imageUrl: undefined }));
            } catch (e) { console.error("Failed to parse sponsors_json:", e); }
        }

        const sponsorImageUploadPromises: Promise<void>[] = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('sponsor_photo_') && value instanceof File) {
                const sponsorNameKey = key.replace('sponsor_photo_', '').replace(/_/g, ' ');
                const sponsorIndex = sponsors.findIndex(s => s.name === sponsorNameKey);
                if (sponsorIndex !== -1 && value.size > 0) {
                    const sponsorImageFile = value;
                    const bucket = storage;
                    const fileExtension = sponsorImageFile.name.substring(sponsorImageFile.name.lastIndexOf("."));
                    const sanitizedSponsorName = sponsors[sponsorIndex].name.replace(/[^a-zA-Z0-9]/g, '_');
                    const filePath = `organizations/${userId}/sponsors/${sanitizedSponsorName}${fileExtension}`;
                    const file = bucket.file(filePath);
                     sponsorImageUploadPromises.push(
                         (async () => {
                              try {
                                 await file.save(Buffer.from(await sponsorImageFile.arrayBuffer()), { metadata: { contentType: sponsorImageFile.type } });
                                 await file.makePublic();
                                 sponsors[sponsorIndex].imageUrl = file.publicUrl();
                                 console.log(`Sponsor image for ${sponsors[sponsorIndex].name} uploaded to: ${sponsors[sponsorIndex].imageUrl}`);
                              } catch(uploadError){ console.error(`Failed to upload image for sponsor ${sponsors[sponsorIndex].name}:`, uploadError); }
                         })()
                     );
                }
            }
        }
        await Promise.all(sponsorImageUploadPromises);
        console.log("Sponsor images processed.");


       // 4. Process Social Media Links
       const socialMedia: Organization['socialMedia'] = {};
       const platforms = ['twitter', 'facebook', 'instagram'];
       platforms.forEach(platform => {
           const username = getString(formData, `social_${platform}_username`);
           if (username) {
               socialMedia[platform as keyof typeof socialMedia] = {
                   username: username,
                   link: getString(formData, `social_${platform}_link`) || undefined
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
                    if (!aidStock[aidId]) { aidStock[aidId] = { available: false }; }
                    if (field === 'available') {
                        aidStock[aidId].available = value === 'true';
                    } else {
                        const numValue = Number(value);
                         if (!isNaN(numValue) && [
                             'foodPacks', 'male', 'female', 'children', 'kits', 'tents', 'blankets',
                             'rescueKits', 'specializedEquipment', 'totalFunds', 'counselors',
                             'hours', 'vehicles', 'communication'
                         ].includes(field)) {
                             aidStock[aidId][field] = numValue;
                         } else {
                             aidStock[aidId][field] = value;
                         }
                    }
                }
            }
        }
         console.log("Aid Stock details processed.");


        // 6. Prepare Organization Data for Firestore
        const orgType = getString(formData, "type");
        const organizationDataBase = {
            userId: userId, name: name, email: email,
            contactNumber: getString(formData, "contactNumber"), location: getString(formData, "location"),
            dateOfEstablishment: getString(formData, "dateOfEstablishment"), type: orgType,
            description: getString(formData, "description"), contactPerson: getString(formData, "contactPerson"),
            orgPosition: getString(formData, "orgPosition"), profileImageUrl: profileImageUrl,
            sponsors: sponsors, aidStock: aidStock,
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        const organizationData: Partial<Organization> = { ...organizationDataBase };
        if (orgType === 'other') {
            const otherTextValue = getString(formData, "otherTypeText");
            if (otherTextValue) { organizationData.otherTypeText = otherTextValue; }
        }
        if (Object.keys(socialMedia).length > 0) { organizationData.socialMedia = socialMedia; }
        console.log("Organization data prepared:", JSON.stringify(organizationData, null, 2));

        // 7. Save Organization Data to Firestore
        await db.collection("organizations").doc(userId).set(organizationData);

        // 8. [Optional] Set Custom Claims
        // await auth.setCustomUserClaims(userId, { role: 'organizationAdmin' });

        console.log(`Organization ${name} registered successfully with ID: ${userId}`);
        return { success: true, message: "Registration successful!" };

    } catch (error: any) {
        let errorMessage = "Registration failed. Please try again.";
        console.error("Error during organization registration:", error);

        if (error.code) {
            const errorCode = error.code;
             if (errorCode === 'auth/email-already-exists' || errorCode === 'auth/email-already-in-use') { errorMessage = "This email is already registered."; }
             else if (errorCode === 'auth/invalid-email') { errorMessage = "Invalid email format."; }
             else if (errorCode === 'auth/weak-password') { errorMessage = "Password is too weak (at least 6 characters)."; }
             else if (error.message) { errorMessage = error.message; }
        } else if (error instanceof Error) { errorMessage = error.message; }

        // Attempt to delete the created auth user if Firestore save failed
        if (userId) { // Check if userId was obtained before the error
            try {
                 // --- FIX: Ensure userId (capital i) is used ---
                await auth.deleteUser(userId);
                console.log(`Cleaned up created auth user ${userId} due to Firestore error.`);
            } catch (deleteError) {
                 // --- FIX: Ensure userId (capital i) is used ---
                console.error(`Failed to clean up auth user ${userId}:`, deleteError);
            }
        }
        return { success: false, message: errorMessage };
    }
}


// --- Volunteer Registration Function ---

interface Volunteer {
    name: string; email: string; contactNumber: string; username: string;
    profileImageUrl: string; organizationId: string; createdAt: string;
    updatedAt: string; userId: string;
}

export async function registerVolunteer(formData: FormData): Promise<{ success: boolean; message: string }> {
    let userId: string | null = null; // Keep track of userId for potential cleanup
    try {
        const email = getString(formData, "email");
        const password = getString(formData, "password");
        const name = getString(formData, "name");
        const username = getString(formData, "username");
        if (!email || !password || !name || !username) {
             return { success: false, message: "Email, password, name, and username are required." };
        }

        const userRecord = await auth.createUser({ email: email, password: password, displayName: name });
        userId = userRecord.uid; // Assign the created userId

        let profileImageUrl = '';
        const profileImage = getFile(formData, "profileImage");
        if (profileImage) {
            const bucket = storage;
            const originalName = profileImage.name;
            const fileExtension = originalName.substring(originalName.lastIndexOf("."));
            const filePath = `volunteers/${userId}/profile-image${fileExtension}`;
            const file = bucket.file(filePath);
            const imageBuffer = Buffer.from(await profileImage.arrayBuffer());
            await file.save(imageBuffer, { metadata: { contentType: profileImage.type } });
            await file.makePublic();
            profileImageUrl = file.publicUrl();
            console.log(`Volunteer profile image uploaded to: ${profileImageUrl}`);
        } else { console.log("No volunteer profile image provided."); }

        const volunteerData: Volunteer = {
            userId: userId, name: name, email: email,
            contactNumber: getString(formData, "contactNumber"), username: username,
            profileImageUrl: profileImageUrl, organizationId: getString(formData, "organization"),
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        await db.collection("volunteers").doc(userId).set(volunteerData);
        await db.collection("users").doc(userId).set({ role: "volunteer", createdAt: new Date().toISOString() });
        // await auth.setCustomUserClaims(userId, { role: 'volunteer', orgId: volunteerData.organizationId });

        console.log(`Successfully created volunteer ${name} with User ID: ${userId}`);
        return { success: true, message: "Registration successful!" };

    } catch (error: any) {
        let errorMessage = "Registration failed. Please try again.";
        console.error("Error during volunteer registration:", error);

        if (error.code) {
            const errorCode = error.code;
            if (errorCode === 'auth/email-already-exists' || errorCode === 'auth/email-already-in-use') { errorMessage = "This email is already registered."; }
            else if (errorCode === 'auth/invalid-email') { errorMessage = "Invalid email format."; }
            else if (errorCode === 'auth/weak-password') { errorMessage = "Password is too weak."; }
            else if (errorCode === 'auth/uid-already-exists') { errorMessage = "Account conflict occurred."; }
            else if (error.message) { errorMessage = error.message; }
        } else if (error instanceof Error) { errorMessage = error.message; }

        // Attempt to delete the created auth user if Firestore save failed
        if (userId) { // Check if userId was obtained before the error
            try {
                 // --- FIX: Ensure userId (capital i) is used ---
                await auth.deleteUser(userId);
                console.log(`Cleaned up created auth user ${userId} due to Firestore error.`);
            } catch (deleteError) {
                 // --- FIX: Ensure userId (capital i) is used ---
                console.error(`Failed to clean up auth user ${userId}:`, deleteError);
            }
        }
        return { success: false, message: errorMessage };
    }
}