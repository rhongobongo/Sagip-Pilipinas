'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useLoadScript } from '@react-google-maps/api';
import { RequestPin } from '@/types/types';

// Use dynamic import with ssr: false
const DynamicAidRequestMapWrapper = dynamic(() => import('@/components/map/AidRequesMapWrapper'), {
  ssr: false,
});

interface AidRequestMapPageProps {
  initialPins: RequestPin[];
}

const AidRequestMapPage: React.FC<AidRequestMapPageProps> = ({ initialPins = [] }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  if (loadError) {
    return <div className="p-8 text-center">Error loading maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <DynamicAidRequestMapWrapper initialPins={initialPins} />
    </div>
  );
};

export default AidRequestMapPage;