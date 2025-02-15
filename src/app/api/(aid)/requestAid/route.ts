import { NextResponse } from "next/server";
import { db } from "@/lib/Firebase-Admin";
import { GeoPoint } from "firebase-admin/firestore";
import { RequestPin } from "@/types/types";

export async function POST(req: Request) {

    const body = await req.json();
    const AidRequest: RequestPin = body;

    if (!AidRequest.coordinates?.latitude || !AidRequest.coordinates?.longitude) {
        return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    try {
        const unixTimestamp = Date.now();
        const randomText = Math.random().toString(36).substring(2, 10);
        const uniqueID = `${unixTimestamp}_${randomText}`;
        const geoPoint = new GeoPoint(AidRequest.coordinates.latitude, AidRequest.coordinates.longitude);

        await db.collection("map").doc(uniqueID).set(
            {
                location: geoPoint
            },
            { merge: true }
        )

        return NextResponse.json({ message: "Request Aid set up successfully." }, { status: 200 });
    } catch (error) {
        console.error("Error setting up aid:", error);
        return NextResponse.json({ error: "Failed to set up Request Aid." }, { status: 500 });
    }
}