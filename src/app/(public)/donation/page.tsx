// src/app/(public)/donation/page.tsx

import React from 'react';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { authConfig } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge'; // Your auth config

import { db } from '@/lib/Firebase-Admin';
import { RequestPin } from '@/types/types';
import { GeoPoint, Timestamp } from 'firebase-admin/firestore';

// Import the page form component (already correct)
import { default as DonationPageForm } from '@/components/(page)/donationPage/donationPageForm';

// --- REMOVE the dynamic import from here ---
// import dynamic from 'next/dynamic';
// const DonationMapWrapper = dynamic(
//   () => import('@/components/map/DonationMapWrapper'),
//   { ssr: false } // <-- This was the problematic line
// );

// +++ IMPORT the new Client Component Loader +++
import DonationMapClientLoader from '@/components/map/DonationMapClientLoader'; // Adjust path if necessary

// --- Keep the fetchAidRequests function as is ---
const fetchAidRequests = async (): Promise<RequestPin[]> => {
  const snapshot = await db.collection('aidRequest').get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const { latitude, longitude } = data.coordinates as GeoPoint;

    return {
      id: doc.id,
      name: data.name ?? '',
      contactNum: data.contactNumber ?? '',
      calamityLevel: data.calamityLevel ?? '',
      calamityType: data.calamityType ?? '',
      shortDesc: data.shortDesc ?? '',
      imageURL: data.imageUrl,
      coordinates: {
        latitude,
        longitude,
      },
      submissionDate:
        data.submissionDate ||
        (data.timestamp
          ? (data.timestamp as Timestamp).toDate().toISOString().split('T')[0]
          : ''),
      submissionTime: data.submissionTime ?? '',
    };
  });
};

// --- Keep the OrganizationData interface as is ---
interface OrganizationData {
  id: string;
  email?: string;
  name?: string;
  location?: string;
  contactNumber?: string;
  aidStock?: {
    food?: { available: boolean; foodPacks?: number; };
    clothing?: { available: boolean; male?: number; female?: number; children?: number; };
    medicalSupplies?: { available: boolean; kits?: number; };
    shelter?: { available: boolean; tents?: number; blankets?: number; };
    searchAndRescue?: { available: boolean; rescueKits?: number; rescuePersonnel?: number; };
    financialAssistance?: { available: boolean; totalFunds?: number; };
    counseling?: { available: boolean; counselors?: number; hours?: number; };
    technicalSupport?: { available: boolean; vehicles?: number; communication?: number; };
  };
}

// --- Keep the DonationPage component structure ---
const DonationPage = async () => {
  const aidRequests = await fetchAidRequests();

  let organizationData: OrganizationData | null = null;
  let errorMessage: string | null = null;
  let userId: string | null = null;

  // --- Keep the data fetching logic as is ---
  try {
    const tokens = await getTokens(await cookies(), authConfig);

    if (tokens) {
      userId = tokens.decodedToken.uid;
      console.log('Server Component: User ID found:', userId);

      if (userId) {
        const orgDocRef = db.collection('organizations').doc(userId);
        const docSnap = await orgDocRef.get();

        if (docSnap.exists) {
          const data = docSnap.data();
          if (data) {
            organizationData = {
              name: data.name,
              location: data.location,
              contactNumber: data.contactNumber,
              id: docSnap.id,
              aidStock: data.aidStock,
              email: data.email ?? userId, // Fallback email to userId if not present
            };
            console.log('Server Component: Org Data Fetched:', organizationData);
          } else {
            errorMessage = `Organization document exists but data is undefined for user ID: ${userId}`;
            console.log(errorMessage);
          }
        } else {
          errorMessage = `Organization document not found for user ID: ${userId}`;
          console.log(errorMessage);
        }
      }
    } else {
      errorMessage = 'User not authenticated.';
      console.log(errorMessage);
    }
  } catch (error) {
    console.error('Server Component: Error fetching organization data:', error);
    errorMessage = 'An error occurred while loading organization data.';
    if (error instanceof Error) {
      console.error('Detailed Error:', error.message, error.stack);
    }
  }

  // --- Keep the error/loading handling as is ---
  if (errorMessage) {
    return (
      <div>Error: {errorMessage} Please try logging in or contact support.</div>
    );
  }
  if (!organizationData && userId) {
    return <div>Loading organization data or data not found...</div>;
  }
  if (!organizationData && !userId) {
    return <div>User not authenticated.</div>;
  }
  if (!organizationData) {
    return <div>Failed to load organization data.</div>; // Fallback
  }

  // --- Render page content, using the new Client Component Loader ---
  return (
    <div className="bg-white w-full h-full text-black">
      <div className="text-xl sm:text-3xl font-semibold mx-2 lg:ml-[10%] pt-8">
        <h1>MAKE DONATIONS</h1>
      </div>
      <div className="grid justify-center">
        <div>
          <h2 className="text-base sm:text-xl pt-4 mx-2 sm:mx-0">
            Help disaster victims by making donations through filling up the
            form below. Anywhere you are, lending a helping hand is always
            possible.
          </h2>
        </div>
        <div className="flex flex-col">
          <div>
            {/* +++ Use the new DonationMapClientLoader here +++ */}
            <DonationMapClientLoader initialPins={aidRequests} />
          </div>
          <div>
            {/* Pass the fetched data as a prop */}
            <DonationPageForm fetchedOrgData={organizationData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationPage;