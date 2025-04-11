'use client';

import { useState } from 'react';
import { OrgPin } from './MapSection';
import { LocationMember } from './LocationMember';

interface LocationListProps {
  pinData: OrgPin[];
  onSelectPin: (pin: OrgPin | null) => void;
}

const LocationList: React.FC<LocationListProps> = ({
  pinData,
  onSelectPin,
}) => {
  const [region, setRegion] = useState<string>('');

  const regions = ['LUZON', 'VISAYAS', 'MINDANAO'];

  const setRegionEvent = (r: string) => {
    if (r === region) {
      setRegion('');
    } else {
      setRegion(r);
    }
  };

  return (
    <div className="flex flex-col gap-4" style={{ height: '75vh' }}>
      <div className="relative grid grid-cols-3 gap-0 text-black w-full rounded-3xl items-center justify-center font-bold overflow-hidden">
        {/* Sliding Indicator */}
        <div
          className={`absolute top-0 left-0 h-full bg-red-600 text-white border-black border-[3px] rounded-3xl transition-transform duration-300 ease-in-out`}
          style={{
            width: `calc(100% / ${regions.length})`,
            transform: region
              ? `translateX(${regions.indexOf(region) * (300 / regions.length)}%)`
              : `scaleX(0)`, // Scale to 0 when no region is selected
            transformOrigin: 'left', // Ensure it scales from the left
            zIndex: 0, // Ensure it's behind the text
          }}
        />
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setRegionEvent(r)}
            className={`relative h-12 flex items-center justify-center transition-colors duration-200 rounded-3xl z-10 ${
              region === r
                ? 'text-white'
                : 'hover:text-white hover:bg-red-500 duration-300'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-y-auto rounded-lg max-h-[75vh] border-4 border-black bg-[#F3F3F3]">
        {pinData.length > 0 && region !== '' ? (
          <ul>
            {pinData
              .filter((pin) => pin.region === region)
              .map((pin) => (
                <li key={pin.id} className="mb-2">
                  <LocationMember pin={pin} onClick={() => onSelectPin(pin)} />
                </li>
              ))}
          </ul>
        ) : (
          <ul>
            {pinData.map((pin) => (
              <li key={pin.id} className="mb-2">
                <LocationMember pin={pin} onClick={() => onSelectPin(pin)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LocationList;
