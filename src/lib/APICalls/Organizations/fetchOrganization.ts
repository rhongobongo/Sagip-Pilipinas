// src/lib/APICalls/Organizations/fetchOrganization.ts

'use server';

import { db } from '@/lib/Firebase-Admin';
import { Timestamp } from 'firebase-admin/firestore'; // Import Timestamp type

// Update the interface to expect strings for dates after conversion
interface Organization {
  name: string;
  email: string;
  contactNumber: string;
  type: string;
  description: string;
  profileImageUrl: string;
  createdAt: string; // Expect ISO string
  updatedAt: string; // Expect ISO string
  userId: string;
  // Include other fields if they exist in Firestore
  location?: string;
  dateOfEstablishment?: string;
  otherText?: string;
  contactPerson?: string;
  orgPosition?: string;
  socialMedia?: any; // Use appropriate type if defined
  sponsors?: any[]; // Use appropriate type if defined
}

export async function fetchOrganizations(): Promise<Organization[]> {
  try {
    const organizationsSnapshot = await db.collection('organizations').get();

    const organizations: Organization[] = organizationsSnapshot.docs.map(
      (doc) => {
        const data = doc.data();
        const createdAtTimestamp = data.createdAt as Timestamp;
        const updatedAtTimestamp = data.updatedAt as Timestamp;

        // Convert Timestamps to ISO strings before returning
        return {
          name: data.name || '',
          email: data.email || '',
          contactNumber: data.contactNumber || '',
          type: data.type || '',
          description: data.description || '',
          profileImageUrl: data.profileImageUrl || '',
          // --- Convert Timestamps ---
          createdAt: createdAtTimestamp?.toDate
            ? createdAtTimestamp.toDate().toISOString()
            : '', // Convert or handle if missing
          updatedAt: updatedAtTimestamp?.toDate
            ? updatedAtTimestamp.toDate().toISOString()
            : '', // Convert or handle if missing
          // --- End Conversion ---
          userId: doc.id,
          // Include other fields and handle potential missing values
          location: data.location || '',
          dateOfEstablishment: data.dateOfEstablishment || '',
          otherText: data.otherText || '',
          contactPerson: data.contactPerson || '',
          orgPosition: data.orgPosition || '',
          socialMedia: data.socialMedia || undefined, // Pass through or use default
          sponsors: data.sponsors || undefined, // Pass through or use default
        } as Organization; // Assert type after constructing
      }
    );

    return organizations;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    // Re-throwing or returning an empty array might be better than throwing a generic error
    // depending on how the frontend handles errors.
    // throw new Error("Failed to fetch organizations");
    return []; // Return empty array on error
  }
}
