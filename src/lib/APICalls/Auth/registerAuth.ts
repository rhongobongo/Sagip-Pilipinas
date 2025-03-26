'use server';

import { db, auth } from '@/lib/Firebase-Admin';
import { updateProfileImage } from '../User/updateProfileImage';

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

        if (image) {
            updateProfileImage(image, userRecord.uid, "organizations")
        }

        const organizationData: Omit<Organization, "profileImageUrl"> = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            contactNumber: formData.get("contactNumber") as string,
            type: formData.get("type") as string,
            description: formData.get("description") as string,
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