// src/app/admin/cms/api/fetchAidRequests.ts
import { db } from "@/lib/Firebase-Admin"; // Firebase initialization

export interface AidRequest {
  id: string;
  name: string;
  contactNum: string;
  calamityType: string;
  calamityLevel: string;
  shortDesc: string;
  submissionDate: string;
  imageUrl: string | null;
}

export async function fetchAidRequests(): Promise<AidRequest[]> {
  try {
    const aidRequestsRef = db.collection('aidRequests');
    const snapshot = await aidRequestsRef.orderBy('submissionDate', 'desc').limit(20).get();

    const aidRequests: AidRequest[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'No Name',
        contactNum: data.contactNum || 'No Contact',
        calamityType: data.calamityType || 'Unknown',
        calamityLevel: data.calamityLevel || 'Unknown',
        shortDesc: data.shortDesc || 'No Description',
        submissionDate: data.submissionDate ? data.submissionDate.toDate().toISOString() : '',
        imageUrl: data.imageUrl || '/placeholder-image.jpg',
      };
    });

    return aidRequests;
  } catch (error: unknown) {
    console.error('Error fetching aid requests:', error);
    throw new Error('Failed to fetch aid requests');
  }
}
