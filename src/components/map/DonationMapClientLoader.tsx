// src/components/map/DonationMapClientLoader.tsx
"use client"; // <--- Mark this component as a Client Component

import React from 'react';
import dynamic from 'next/dynamic';
import { RequestPin } from '@/types/types'; // Make sure the path is correct

// Dynamically import the map wrapper component *here*, inside the Client Component
const DonationMapWrapper = dynamic(
  () => import('@/components/map/DonationMapWrapper'),
  {
    ssr: false, // This is now allowed because we are in a Client Component
    loading: () => <p>Loading map...</p>, // Optional: Add a loading indicator
  }
);

interface DonationMapClientLoaderProps {
  initialPins: RequestPin[];
}

const DonationMapClientLoader: React.FC<DonationMapClientLoaderProps> = ({ initialPins }) => {
  // Render the dynamically loaded component, passing down the props
  return <DonationMapWrapper initialPins={initialPins} />;
};

export default DonationMapClientLoader;