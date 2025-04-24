// src/types/types.ts
import type { Timestamp } from 'firebase/firestore';

export interface DefaultPin {
  coordinates: { latitude: number; longitude: number };
  id: string; // Add id if it's always expected
}

export interface MainPin extends DefaultPin {
  disasterType?: string;
  date?: Timestamp;
}

export interface RequestPin extends DefaultPin { // Ensure DefaultPin includes id if needed
  name?: string;
  contactNum?: string;
  date?: Timestamp;
  calamityLevel?: string;
  calamityType?: string;
  shortDesc?: string;
  imageURL?: string;
  submissionDate?: string;
  submissionTime?: string;
  aidNeeded?: string; // <-- ADDED: For the selected aid type
}