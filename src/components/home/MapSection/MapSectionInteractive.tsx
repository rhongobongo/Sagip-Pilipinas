'use client';

import DistributionMapHomeWrapper from '@/components/map/DistributionMapHomeWrapper';
import LocationList from './LocationList';
import { OrgPin } from './MapSection';

import { useState } from 'react';

const MapSectionInteractive: React.FC<{ locations: OrgPin[] }> = ({
  locations,
}) => {
  const [selectedPin, setSelectedPin] = useState<OrgPin | null>(null);

  return (
    <div className="container mx-auto grid md:grid-cols-2 gap-8 p-2 h-full -mt-1 grid-cols-1">
      <div className="flex-grow h-full">
        <DistributionMapHomeWrapper
          pinData={locations}
          selectedPin={selectedPin}
        />
      </div>
      <div className="h-full">
        <LocationList pinData={locations} onSelectPin={setSelectedPin} />
      </div>
    </div>
  );
};

export default MapSectionInteractive;
