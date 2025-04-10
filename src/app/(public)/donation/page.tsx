// Make sure this file is NOT marked with 'use client';
// Example location: app/donation/page.tsx (or similar, depending on your routing)

import React from 'react';
import { cookies } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';
import { authConfig } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge'; // Your auth config
import { db as adminDb } from '@/lib/Firebase-Admin'; // Import the ADMIN SDK Firestore instance!

import DonationPageForm from '@/components/(page)/donationPage/donationPageForm';
import DonationPageMap from '@/components/(page)/donationPage/donationPageMap';
import { Timestamp } from 'firebase-admin/firestore'; // Use admin timestamp if needed

// Define the shape of the data you expect to fetch
interface OrganizationData {
  name?: string;
  location?: string;
  contactNumber?: string;
  email?: string;
  // Add other fields from your Firestore document if needed
}

// Make the component async
const DonationPage = async () => {
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

        // --- *** THE FIX IS HERE *** ---
        // Change from docSnap.exists() to docSnap.exists (property, not method)
        if (docSnap.exists) {
          // --- *** END FIX *** ---

          const data = docSnap.data(); // data() method is correct
          // Optional: Check if data is actually defined after calling .data()
          if (data) {
            organizationData = {
              name: data.name,
              location: data.location,
              contactNumber: data.contactNumber,
              email: data.email,
              // Add other fields as needed
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
            <DonationPageMap></DonationPageMap>
            <h2 className="w-full p-12 bg-green-300 text-center text-2xl">
              THIS IS THE MAP!!!
            </h2>
          </div>
          <div>
            {/* Pass the fetched data as a prop now, instead of the ID */}
            <DonationPageForm
              fetchedOrgData={organizationData}
            ></DonationPageForm>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationPage;
