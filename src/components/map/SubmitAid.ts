"use server";

import { db } from "@/lib/Firebase/Firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function submitRequestAid(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const contactNumber = formData.get("contactNumber") as string;
    const disasterType = formData.get("disasterType") as string;
    const aidType = formData.get("aidType") as string;
    const latitude = formData.get("latitude") ? Number(formData.get("latitude")) : null;
    const longitude = formData.get("longitude") ? Number(formData.get("longitude")) : null;

    if (!latitude || !longitude) {
        return { error: "Please select a location on the map." };
    }

    try {
        await addDoc(collection(db, "aid_requests"), {
            name,
            contactNumber,
            disasterType,
            aidType,
            coordinates: { latitude, longitude },
            timestamp: Timestamp.now(),
        });

        return { success: "Aid request submitted successfully!" };
    } catch (error) {
        console.error("Error in requestAid:", error);
        return { error: "An error occurred. Please try again." };
    }
}
