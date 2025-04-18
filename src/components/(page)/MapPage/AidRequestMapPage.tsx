'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { RequestPin } from '@/types/types';

// Use dynamic import with ssr: false
const DynamicAidRequestMapWrapper = dynamic(() => import('@/components/map/AidRequesMapWrapper'), {
  ssr: false,
});

interface AidRequestMapPageProps {
  initialPins: RequestPin[];
}

const AidRequestMapPage: React.FC<AidRequestMapPageProps> = ({ initialPins = [] }) => {

  return (
    <div className="h-screen w-screen">
      <DynamicAidRequestMapWrapper initialPins={initialPins} />
    </div>
  );
};

export default AidRequestMapPage;