import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { db } from "@/lib/Firebase-Admin";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "Authorization header missing" }, { status: 401 });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);


    if (!decodedToken) {
      return NextResponse.json({ error: "User ID (uid) and email are required." }, { status: 400 });
    }

    const userRef = db.collection("users").doc(decodedToken.uid );
    await userRef.set(
      {
        email: decodedToken.email,
      },
      { merge: true }
    );

    return NextResponse.json({ message: "User account set up successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error setting up account:", error);
    return NextResponse.json({ error: "Failed to set up account." }, { status: 500 });
  }
}