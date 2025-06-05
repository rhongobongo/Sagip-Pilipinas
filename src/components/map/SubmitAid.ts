'use server';

import { db } from '@/lib/Firebase-Admin';
import { GeoPoint, Timestamp } from 'firebase-admin/firestore';
import { RequestPin } from '@/types/types';

export async function requestAid(aidRequest: RequestPin): Promise<{ message: string; requestId: string }> {
  if (typeof aidRequest.coordinates?.latitude !== 'number' || typeof aidRequest.coordinates?.longitude !== 'number') {
    console.error("Invalid or missing coordinates in aidRequest:", aidRequest.coordinates);
    throw new Error('Missing or invalid coordinate fields');
  }

  const uniqueID = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const geoPoint = new GeoPoint(
    aidRequest.coordinates.latitude,
    aidRequest.coordinates.longitude
  );

  const dataToSave = {
    name: aidRequest.name || null,
    contactNumber: aidRequest.contactNum || null,
    calamityLevel: aidRequest.calamityLevel || null,
    calamityType: aidRequest.calamityType || null,
    shortDesc: aidRequest.shortDesc || null,
    imageUrl: aidRequest.imageURL || null,
    verificationDocumentUrl: aidRequest.verificationDocumentUrl || null, // <-- Add this line
    coordinates: geoPoint,
    timestamp: Timestamp.now(),
    submissionDate: aidRequest.submissionDate || null,
    submissionTime: aidRequest.submissionTime || null,
    aidNeeded: aidRequest.aidNeeded || null,
    status: 'pending_verification', // <-- Consider adding a default status
  };

  try {
    await db.collection('aidRequest').doc(uniqueID).set(dataToSave);
    console.log(`Server Action: Aid Request ${uniqueID} saved successfully.`);
    return { message: 'Request Aid set up successfully. It will be reviewed by administrators.', requestId: uniqueID };
  } catch (error) {
    console.error(`Server Action: Error saving Aid Request ${uniqueID}:`, error);
    throw error;
  }
}