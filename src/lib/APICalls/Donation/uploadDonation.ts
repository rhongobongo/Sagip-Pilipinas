"use server"

import { db, storage } from "@/lib/Firebase-Admin";

export const uploadDonation = async (image: File, donationId: string) => {
    try {
        const regex = /\.\w+$/;
        const match = regex.exec(image.name);
        const fileExtension = match ? match[0] : "";

        const filePath = `organization/${donationId}/donation/${donationId}/donation-image${fileExtension}`;
        const file = storage.file(filePath);

        // Save image to storage
        await file.save(Buffer.from(await image.arrayBuffer()), {
            contentType: image.type,
        });

        // Make image publicly accessible
        await file.makePublic();

        // Construct public URL
        const imageUrl = `https://storage.googleapis.com/${storage.name}/${filePath}`;

        // Update Firestore document
        await db.collection("donations").doc(donationId).update({
            imageUrl,
            updatedAt: new Date().toISOString(), // optional
        });

        console.log("Image uploaded and donation document updated with public URL.");
    } catch (error) {
        console.error("Error uploading public donation image:", error);
        throw error;
    }
};