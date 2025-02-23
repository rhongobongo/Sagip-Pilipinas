import { NextResponse } from "next/server";
import { db } from "@/lib/Firebase-Admin";
import { GeoPoint } from "firebase-admin/firestore";
import { MainPin } from "@/types/types";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const AidRequests: MainPin[] = body;

        await db.runTransaction(async (transaction) => {
            for (const request of AidRequests) {
                const aidRequestDocRef = db.collection("aidRequest").doc(request.id);
                const mapDocRef = db.collection("map").doc(request.id);

                const aidRequestDoc = await transaction.get(aidRequestDocRef);

                if (!aidRequestDoc.exists) {
                    console.error(`Document with ID ${request.id} does not exist in 'aidRequest'.`);
                    continue;
                }

               const aidRequestData = aidRequestDoc.data();

                transaction.set(mapDocRef, {
                    ...aidRequestData,
                    location: new GeoPoint(request.coordinates.latitude, request.coordinates.longitude),
                    approvedAt: new Date(),
                });

                transaction.delete(aidRequestDocRef);
            }
        });

        return NextResponse.json({ success: true, message: "Documents transferred successfully." });
    } catch (error) {
        console.error("Error transferring aid requests:", error);
        return NextResponse.json({ success: false, message: "Error transferring documents.", error });
    }
}
