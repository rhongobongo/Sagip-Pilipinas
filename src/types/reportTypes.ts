import type { Timestamp } from 'firebase/firestore';

export interface DonationReportItem {
  id: string;
  donationId: string;
  aidRequestId: string | null;
  title: string;
  calamityType: string;
  calamityLevel: string;
  imageUrl: string | null;
  requestTimestamp: string;
  organizationId: string;
  organizationName: string;
  donationTimestamp: string;
  estimatedDropoffDate?: string;
  donatedTypes: string[];
  donationSummary?: string;
}
