import admin from "./FirebaseAdmin";

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();