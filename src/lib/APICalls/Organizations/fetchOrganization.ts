// src/lib/APICalls/Organizations/fetchOrganization.ts

'use server';

import { db } from '@/lib/Firebase-Admin';
import { Timestamp } from 'firebase-admin/firestore';

// --- Define SponsorData interface (matching registerOrganization) ---
// It's good practice to define this here or import from a shared types file
interface SponsorData {
  name: string;
  other: string; // Assuming 'other' holds description/details based on previous code
  imageUrl?: string; // Optional image URL
}

// --- Define Organization interface with specific types ---
interface Organization {
  name: string;
  email: string;
  contactNumber: string;
  type: string;
  description: string;
  profileImageUrl: string;
  createdAt: string; // Expect ISO string after conversion
  updatedAt: string; // Expect ISO string after conversion
  userId: string;

  // Optional fields based on registerOrganization
  location?: string;
  dateOfEstablishment?: string;
  otherTypeText?: string; // Renamed from 'otherText' to match registerOrganization structure
  contactPerson?: string;
  orgPosition?: string;

  // --- FIX: Replace 'any' with specific structure from registerOrganization ---
  socialMedia?: {
    // Optional root object
    twitter?: { username: string; link?: string }; // Optional platform objects
    facebook?: { username: string; link?: string };
    instagram?: { username: string; link?: string };
  };

  // --- FIX: Replace 'any[]' with SponsorData[] ---
  sponsors?: SponsorData[]; // Use the defined SponsorData interface for the array elements

  // Include other fields if necessary, like aidStock from registerOrganization
  // aidStock?: AidStockDetails; // If you need to fetch this too
}

// Optional: If you need aidStock details, define its type here as well
// type AidStockDetails = { ... }; // Copy definition from registerAuth if needed

export async function fetchOrganizations(): Promise<Organization[]> {
  try {
    const organizationsSnapshot = await db.collection('organizations').get();

    const organizations: Organization[] = organizationsSnapshot.docs.map(
      (doc) => {
        const data = doc.data();

        // Safely access potential Timestamps and check their type
        const createdAtTimestamp = data.createdAt;
        const updatedAtTimestamp = data.updatedAt;

        // Convert Timestamps to ISO strings only if they are indeed Timestamps
        const createdAtStr =
          createdAtTimestamp instanceof Timestamp
            ? createdAtTimestamp.toDate().toISOString()
            : // Handle cases where it might already be a string or missing/null
              typeof createdAtTimestamp === 'string'
              ? createdAtTimestamp
              : '';

        const updatedAtStr =
          updatedAtTimestamp instanceof Timestamp
            ? updatedAtTimestamp.toDate().toISOString()
            : // Handle cases where it might already be a string or missing/null
              typeof updatedAtTimestamp === 'string'
              ? updatedAtTimestamp
              : '';

        // Construct the object matching the Organization interface
        return {
          // Required fields with nullish coalescing for safety
          name: data.name ?? '',
          email: data.email ?? '',
          contactNumber: data.contactNumber ?? '',
          type: data.type ?? '',
          description: data.description ?? '',
          profileImageUrl: data.profileImageUrl ?? '', // Ensure this exists or provide default

          // Converted Timestamps
          createdAt: createdAtStr,
          updatedAt: updatedAtStr,

          // ID from document
          userId: doc.id,

          // Optional Fields - use '?? undefined' if you want undefined when missing,
          // or '?? ''' if empty string is acceptable default
          location: data.location ?? undefined,
          dateOfEstablishment: data.dateOfEstablishment ?? undefined,
          otherTypeText: data.otherTypeText ?? undefined, // Use the correct field name
          contactPerson: data.contactPerson ?? undefined,
          orgPosition: data.orgPosition ?? undefined,
          socialMedia: data.socialMedia ?? undefined, // Pass through Firestore data or undefined
          sponsors: data.sponsors ?? undefined, // Pass through Firestore data or undefined
          // aidStock: data.aidStock ?? undefined, // Include if needed
        } as Organization; // Assert type after constructing; reasonably safe here
      }
    );

    return organizations;
  } catch (error: unknown) {
    // --- Use 'unknown' for catch block ---
    console.error('Error fetching organizations:', error);
    // Optionally perform type checks on 'error' here if needed
    // if (error instanceof Error) { ... }
    return []; // Return empty array on error, safer for frontend
  }
}
