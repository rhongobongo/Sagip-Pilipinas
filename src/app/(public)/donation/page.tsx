import React from 'react';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { authConfig } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge'; // Your auth config
import { db as adminDb } from '@/lib/Firebase-Admin'; // Import the ADMIN SDK Firestore instance!
import { db } from "@/lib/Firebase-Admin";
import { RequestPin } from "@/types/types";
import { GeoPoint, Timestamp } from "firebase-admin/firestore";
import DonationPageForm from '@/components/(page)/donationPage/donationPageForm';
import DonationMapWrapper from '@/components/map/DonationMapWrapper';

const fetchAidRequests = async (): Promise<RequestPin[]> => {
  const snapshot = await db.collection("aidRequest").get();
  return snapshot.docs.map((doc) => {
      const data = doc.data();
      const { latitude, longitude } = (data.coordinates as GeoPoint);
      
      return {
          id: doc.id,
          name: data.name || "",
          contactNum: data.contactNumber || "",
          calamityLevel: data.calamityLevel || "",
          calamityType: data.calamityType || "",
          shortDesc: data.shortDesc || "",
          imageURL: data.imageUrl,
          coordinates: { 
              latitude, 
              longitude 
          },
          submissionDate: data.submissionDate || 
              (data.timestamp ? (data.timestamp as Timestamp).toDate().toISOString().split('T')[0] : ""),
          submissionTime: data.submissionTime || "",
      };
  });
};

interface OrganizationData {
  name?: string;
  location?: string;
  contactNumber?: string;
  email?: string;
  // Update to match the structure from registerOrganization
  aidStock?: {
    food?: {
      available: boolean;
      foodPacks?: number;
    };
    clothing?: {
      available: boolean;
      male?: number;
      female?: number;
      children?: number;
    };
    medicalSupplies?: {
      available: boolean;
      kits?: number;
    };
    shelter?: {
      available: boolean;
      tents?: number;
      blankets?: number;
    };
    searchAndRescue?: {
      available: boolean;
      rescueKits?: number;
      rescuePersonnel?: number;
    };
    financialAssistance?: {
      available: boolean;
      totalFunds?: number;
    };
    counseling?: {
      available: boolean;
      counselors?: number;
      hours?: number;
    };
    technicalSupport?: {
      available: boolean;
      vehicles?: number;
      communication?: number;
    };
  };
}

// Make the component async
const DonationPage = async () => {
  const aidRequests = await fetchAidRequests();
  
  let organizationData: OrganizationData | null = null;
  let errorMessage: string | null = null;
  let userId: string | null = null;

  try {
    // 1. Get logged-in user's ID server-side
    const tokens = await getTokens(await cookies(), authConfig);

    if (tokens) {
      userId = tokens.decodedToken.uid;
      console.log('Server Component: User ID found:', userId);

      // 2. Fetch organization data using Admin SDK (bypasses rules)
      if (userId) {
        const orgDocRef = adminDb.collection('organizations').doc(userId);
        const docSnap = await orgDocRef.get(); // Fetches the DocumentSnapshot

        // Using docSnap.exists property, not method
        if (docSnap.exists) {
          const data = docSnap.data();
          // Optional: Check if data is actually defined after calling .data()
          if (data) {
            // Extract the organization data directly matching your interface
            organizationData = {
              name: data.name,
              location: data.location,
              contactNumber: data.contactNumber,
              email: data.email,
              // Map aidStock if it exists, otherwise set up default values
              aidStock: data.aidStock || {
                food: { 
                  available: false, 
                  foodPacks: 20 
                },
                clothing: { 
                  available: false, 
                  male: 50, 
                  female: 50, 
                  children: 30 
                },
                medicalSupplies: { 
                  available: false, 
                  kits: 25 
                },
                shelter: { 
                  available: false, 
                  tents: 20, 
                  blankets: 100 
                },
                searchAndRescue: { 
                  available: false, 
                  rescueKits: 10, 
                  rescuePersonnel: 5 
                },
                financialAssistance: { 
                  available: false, 
                  totalFunds: 50000 
                },
                counseling: { 
                  available: false, 
                  counselors: 5, 
                  hours: 40 
                },
                technicalSupport: { 
                  available: false, 
                  vehicles: 3, 
                  communication: 10 
                }
              }
            };
            console.log(
              'Server Component: Org Data Fetched:',
              organizationData
            );
          } else {
            // This case is less common if docSnap.exists is true, but good practice
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
      // Redirecting should ideally happen in middleware based on auth state
    }
  } catch (error) {
    console.error('Server Component: Error fetching organization data:', error);
    // Don't expose detailed errors to the client unless intended
    errorMessage = 'An error occurred while loading organization data.';
    // If the error object has more details, you might log them server-side
    if (error instanceof Error) {
      console.error('Detailed Error:', error.message, error.stack);
    }
  }

  // Handle loading/error states
  if (errorMessage) {
    return (
      <div>Error: {errorMessage} Please try logging in or contact support.</div>
    );
  }

  if (!organizationData && userId) {
    // Check userId to differentiate from "not logged in"
    // This might happen if the user is logged in but the doc doesn't exist yet
    // Or if data was undefined in the check above
    return <div>Loading organization data or data not found...</div>;
  }
  if (!organizationData && !userId) {
    // This case should ideally be handled by middleware redirect or earlier error message
    return <div>User not authenticated.</div>;
  }

  // --- Render page content with fetched data ---
  // Added a null check for safety before rendering DonationPageForm
  if (!organizationData) {
    return <div>Failed to load organization data.</div>; // Fallback if somehow data is null here
  }

  return (
    <div className="bg-white w-full h-full text-black">
      <div className="text-3xl font-semibold ml-[10%] pt-8">
        <h1>MAKE DONATIONS</h1>
      </div>
      <div className="grid justify-center">
        <div>
          <h2 className="text-xl pt-6">
            Help disaster victims by making donations through filling up the
            form below. Anywhere you are, lending a helping hand is always
            possible.
          </h2>
        </div>
        <div className="flex flex-col">
          <div>
            <DonationMapWrapper initialPins={aidRequests} />
          </div>
          <div>
            {/* Pass the fetched data as a prop now, including aid stock info */}
            <DonationPageForm fetchedOrgData={organizationData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationPage;