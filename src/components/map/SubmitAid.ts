// src/components/map/SubmitAid.ts
'use server';

import { db } from '@/lib/Firebase-Admin';
import { GeoPoint, Timestamp } from 'firebase-admin/firestore';
import { RequestPin } from '@/types/types'; // Ensure RequestPin includes all fields being saved

// Modify function to return Promise including the requestId
export async function requestAid(aidRequest: RequestPin): Promise<{ message: string; requestId: string }> {
  // Validate coordinates - Ensure they exist and are numbers before creating GeoPoint
  if (typeof aidRequest.coordinates?.latitude !== 'number' || typeof aidRequest.coordinates?.longitude !== 'number') {
    console.error("Invalid or missing coordinates in aidRequest:", aidRequest.coordinates);
    throw new Error('Missing or invalid coordinate fields');
  }

  const uniqueID = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const geoPoint = new GeoPoint(
    aidRequest.coordinates.latitude,
    aidRequest.coordinates.longitude
  );

  // Data to be saved - ensure it matches expected structure and types
  const dataToSave = {
    name: aidRequest.name || null, // Use null or default if potentially undefined
    contactNumber: aidRequest.contactNum || null,
    calamityLevel: aidRequest.calamityLevel || null,
    calamityType: aidRequest.calamityType || null,
    shortDesc: aidRequest.shortDesc || null,
    imageUrl: aidRequest.imageURL || null, // Ensure imageURL is passed correctly
    coordinates: geoPoint,
    timestamp: Timestamp.now(),
    submissionDate: aidRequest.submissionDate || null,
    submissionTime: aidRequest.submissionTime || null,
    aidNeeded: aidRequest.aidNeeded || null,
    // Add any other fields from RequestPin interface if needed
  };


  try {
      await db.collection('aidRequest').doc(uniqueID).set(dataToSave);
       console.log(`Server Action: Aid Request ${uniqueID} saved successfully.`);
      // Return success message AND the uniqueID
      return { message: 'Request Aid set up successfully.', requestId: uniqueID };
  } catch (error) {
      console.error(`Server Action: Error saving Aid Request ${uniqueID}:`, error);
       // Re-throw the error so the client-side catch block handles it
       // Or return a specific error structure if preferred:
       // return { message: 'Failed to save request.', error: error.message, requestId: null };
       throw error; // Rethrowing is often simpler
  }

}