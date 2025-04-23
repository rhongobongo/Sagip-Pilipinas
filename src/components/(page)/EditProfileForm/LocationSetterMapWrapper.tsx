'use client';
import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapRef } from '@/components/map/GoogleMapComponent';
import { DefaultPin } from '@/types/types';

// Dynamically import the map component with no SSR
const DynamicMap = dynamic(
  () => import('@/components/map/GoogleMapComponent'),
  { ssr: false }
);

interface LocationSetterMapWrapperProps {
  initialLatitude: number | null;
  initialLongitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

const LocationSetterMapWrapper: React.FC<LocationSetterMapWrapperProps> = ({
  initialLatitude,
  initialLongitude,
  onLocationChange,
}) => {
  const mapRef = useRef<MapRef>(null);
  
  // Create a pin object representing the organization's location
  const currentPin: DefaultPin | null = initialLatitude && initialLongitude 
    ? {
        id: 'org-location',
        coordinates: {
          latitude: initialLatitude,
          longitude: initialLongitude,
        },
      }
    : null;

  // After map loads, add marker if there's an initial location
  useEffect(() => {
    if (mapRef.current && currentPin) {
      // Add marker for initial location
      setTimeout(() => {
        mapRef.current?.addMarker?.(currentPin);
        mapRef.current?.zoomMarker?.(currentPin);
      }, 500);
    }
  }, [currentPin]);
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    
    const latitude = event.latLng.lat();
    const longitude = event.latLng.lng();
    
    
    // Create new pin with clicked coordinates
    const newPin: DefaultPin = {
      id: 'org-location',
      coordinates: { latitude, longitude },
    };
    
    // Add marker to map
    mapRef.current?.addMarker?.(newPin);
    
    // Add debug logging
    console.log(`Sending location to parent: Lat: ${latitude}, Lng: ${longitude}`);
    
    // Inform parent component about location change
    onLocationChange(latitude, longitude);
  };

  return (
    <div className="mb-4">
      <div style={{ height: '400px', width: '100%' }} className="rounded-lg overflow-hidden border border-gray-300">
        <DynamicMap
          ref={mapRef}
          onClick={handleMapClick}
          pins={currentPin ? [currentPin] : []}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
          }}
          width="100%"
          height="100%"
        />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        {currentPin ? (
          <p>Location set at: {currentPin.coordinates.latitude.toFixed(6)}, {currentPin.coordinates.longitude.toFixed(6)}</p>
        ) : (
          <p>Click on the map to set your organization&apos;s location</p>
        )}
      </div>
    </div>
  );
};

export default LocationSetterMapWrapper;