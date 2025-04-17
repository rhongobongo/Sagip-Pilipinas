"use server"

import { storage, auth } from "@/lib/Firebase-Admin";

export const updateProfileImage = async (image: File, uid: string, userType: string) => {
    try {
        const bucket = storage;
        const regex = /\.\w+$/;
        const match = regex.exec(image.name);
        const fileExtension = match ? match[0] : "";
        const filePath = `${userType}/${uid}/profile-image${fileExtension}`;
        const file = bucket.file(filePath);

        await file.save(Buffer.from(await image.arrayBuffer()), {
            contentType: image.type
        });

        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        await auth.updateUser(uid, { photoURL: publicUrl });
        return publicUrl;
    }
    catch (error) {
        console.error("Error updating profile image:", error);
        throw error;
    }
};
