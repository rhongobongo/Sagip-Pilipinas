"use server"

import { storage } from "@/lib/Firebase-Admin";

export async function uploadImage(file: File) {
    const bucket = storage;
    const uniqueID = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const fileExtension = file.name.split(".").pop();
    const fileName = `uploads/${uniqueID}.${fileExtension}`;
    const fileRef = bucket.file(fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    await fileRef.save(buffer, {
        metadata: { contentType: file.type },
    });

    await fileRef.makePublic();

    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}
