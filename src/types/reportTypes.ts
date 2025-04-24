// src/types/reportTypes.ts (or similar)
import type { Timestamp } from 'firebase/firestore';

export interface DonationReportItem {
  id: string; // Use donation ID as the unique key for the report card
  donationId: string;
  aidRequestId: string | null; // The ID of the original aid request (slug for linking)

  // Information primarily from Aid Request (or fallback)
  title: string; // e.g., "Urgent Need: Flood in Cebu City"
  calamityType: string;
  calamityLevel: string;
  requestImageUrl: string | null; // Image associated with the aid request
  requestTimestamp: string; // When the aid request was made

  // Information primarily from Donation
  organizationId: string;
  organizationName: string;
  donationTimestamp: string; // When the donation was recorded
  estimatedDropoffDate?: string;
  donatedTypes: string[]; // Array of donated item types (e.g., ['food', 'clothing'])
  donationSummary?: string; // Optional summary specifically about the donation
}