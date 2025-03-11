'use client';

import React, { useRef } from 'react';
import GoogleMapComponent, { MapRef } from '@/components/map/GoogleMapComponent';
import type { DefaultPin } from '@/types/types';

interface ClientMapWrapperProps {
  pin: {
    id: string;
    coordinates: {
      latitude: number;
      longitude: number;
    }
  };
  options?: google.maps.MapOptions;
}

export default function ClientMapWrapper({ pin, options }: ClientMapWrapperProps) {
  const mapRef = useRef<MapRef>(null);
  
  const formattedPin: DefaultPin = {
    id: pin.id,
    coordinates: {
      latitude: pin.coordinates.latitude,
      longitude: pin.coordinates.longitude
    }
  };
  const handlePinClick = (clickedPin: DefaultPin) => {
    if (mapRef.current && mapRef.current.zoomMarker) {
      mapRef.current.zoomMarker(clickedPin);
    }
  };

  return (
    <div className="h-full w-full overflow-hidden rounded-md">
      <GoogleMapComponent
        ref={mapRef}
        pins={[formattedPin]}
        options={options}
        width="100%"
        height="100%"
        setPin={handlePinClick} 
      />
    </div>
  );
}