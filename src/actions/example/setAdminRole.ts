/*
Purpose of this code is to set admin priveleges to your account
*/

"use server"

import { db, auth } from "@/lib/Firebase-Admin"

export const setAdminRole = async (uid: string) => {
    try {
        await auth.setCustomUserClaims(uid, { admin: true });
        await db.collection("users").doc(uid).set(
            { admin: true }, 
            { merge: true }
        );
        return { success: true, message: `Admin role set for user ${uid}` };
    } catch (error: unknown) {
        let errorMessage = "Unknown error occurred";

        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return { success: false, message: `Error setting admin role: ${errorMessage}` };
    }
};

