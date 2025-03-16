import type { Timestamp } from 'firebase/firestore';

export interface DefaultPin {
  coordinates: { latitude: number; longitude: number };
  id: string;
}

export interface MainPin extends DefaultPin {
  disasterType?: string;
  date?: Timestamp;
}

export interface RequestPin extends DefaultPin {
  name?: string;
  contactNum?: string;
  date?: Timestamp;
  calamityLevel?: string;
  calamityType?: string;
  shortDesc?: string;
  imageURL?: string;
  submissionDate?: string;
  submissionTime?: string;
}
