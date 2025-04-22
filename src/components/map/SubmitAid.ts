"use server";

import { db } from "@/lib/Firebase-Admin";
import { GeoPoint, Timestamp } from "firebase-admin/firestore";
import { RequestPin } from "@/types/types";
import coordinatesToDetails from "@/lib/APICalls/Map/coordinatesToDetails";

export async function requestAid(aidRequest: RequestPin) {
    if (
        !aidRequest.coordinates?.latitude ||
        !aidRequest.coordinates?.longitude
    ) {
        throw new Error("Missing fields");
    }

    const uniqueID = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const geoPoint = new GeoPoint(
        aidRequest.coordinates.latitude,
        aidRequest.coordinates.longitude
    );

    const locationDetails = await coordinatesToDetails(geoPoint);

    await db.collection("aidRequest").doc(uniqueID).set({
        name: aidRequest.name,
        contactNumber: aidRequest.contactNum,
        // date: aidRequest.date, // Removed
        calamityLevel: aidRequest.calamityLevel,
        calamityType: aidRequest.calamityType,
        shortDesc: aidRequest.shortDesc,
        imageUrl: aidRequest.imageURL,
        coordinates: geoPoint,
        timestamp: Timestamp.now(),
        submissionDate: aidRequest.submissionDate, // Added
        submissionTime: aidRequest.submissionTime, // Added
        locationDetails: locationDetails
    });

    return { message: "Request Aid set up successfully." };
}
