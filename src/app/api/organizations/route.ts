// src/app/api/organizations/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/Firebase-Admin';
import { GeoPoint } from 'firebase-admin/firestore'; // Ensure GeoPoint is imported

export async function GET() {
  try {
    const organizationsSnapshot = await db.collection('organizations').get();
    console.log(`API Route: Fetched ${organizationsSnapshot.docs.length} org documents from Firestore.`); // Server-side log

    const organizations = organizationsSnapshot.docs.map(doc => {
      const data = doc.data();
      let processedCoordinates = null;

      // --- Explicit GeoPoint Handling ---
      if (data.coordinates && data.coordinates instanceof GeoPoint) {
        // Create a NEW plain object with the correct keys
        processedCoordinates = {
          latitude: data.coordinates.latitude,
          longitude: data.coordinates.longitude
        };
      } else {
        // Log if coordinates are missing or not a GeoPoint IN FIRESTORE
        console.warn(`API Route: Org ${doc.id} missing or has invalid Firestore coordinates format. Coords:`, data.coordinates);
      }

      return {
        userId: doc.id,
        name: data.name || 'Unnamed Org',
        email: data.email || null, // Keep email check here too
        coordinates: processedCoordinates, // Assign the new plain object (or null)
        // ... include other necessary fields ...
      };
    });

    // Filter server-side ONLY for orgs that ended up with valid coordinates and email
    // This ensures we only send valid structured data to the client
    const validOrganizations = organizations.filter(org => org.coordinates && org.email);

    console.log(`API Route: Returning ${validOrganizations.length} valid organizations to client.`);
    return NextResponse.json(validOrganizations, { status: 200 });

  } catch (error) {
    console.error('Error fetching organizations in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}