// src/components/map/LocationPickerModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { center, philippinesBounds } from './MapUtils/MapStyles'; // Adjust import path if needed

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  // *** MODIFIED: Add address parameter ***
  onLocationSelect: (lat: number, lng: number, address: string | null) => void;
  initialCoords?: { lat: number; lng: number };
  apiKey: string;
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '400px',
};

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization' | 'geocoding')[] = ['places', 'geocoding']; // *** ADD 'geocoding' library ***

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialCoords,
  apiKey,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries, // Load geocoding library
  });

  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false); // State to disable button during geocode
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initialPos = initialCoords ? { lat: initialCoords.lat, lng: initialCoords.lng } : null;
      setSelectedPosition(initialPos);
      const targetCenter = initialPos || center;
      const targetZoom = initialPos ? 12 : 6;

      if (mapRef.current) {
           mapRef.current.panTo(targetCenter);
           mapRef.current.setZoom(targetZoom);
      } else {
          const timer = setTimeout(() => {
             if (mapRef.current) {
                mapRef.current.panTo(targetCenter);
                mapRef.current.setZoom(targetZoom);
             }
          }, 150);
          return () => clearTimeout(timer);
      }
    } else {
        // Reset geocoding state when modal closes
        setIsGeocoding(false);
    }
  }, [isOpen, initialCoords]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setSelectedPosition({ lat, lng });
    }
  }, []);

   const handleMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          setSelectedPosition({ lat, lng });
      }
   }, []);

  // *** MODIFIED: Add Geocoding Logic ***
  const handleConfirmSelection = () => {
    if (!selectedPosition || !isLoaded || isGeocoding) {
       console.log("Cannot confirm: No position, not loaded, or already geocoding.");
       return; // Exit if no position, maps not loaded, or already processing
    }

    setIsGeocoding(true); // Disable button
    console.log("Starting geocoding for:", selectedPosition);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: selectedPosition }, (results, status) => {
        let address: string | null = null;
        if (status === google.maps.GeocoderStatus.OK) {
            if (results && results[0]) {
            address = results[0].formatted_address;
            console.log("Geocoding successful:", address);
            } else {
            console.warn("Geocoding OK but no results found.");
            }
        } else {
            console.error(`Geocoding failed due to: ${status}`);
        }

        // Call the callback with lat, lng, and the found address (or null)
        onLocationSelect(selectedPosition.lat, selectedPosition.lng, address);

        setIsGeocoding(false); // Re-enable button
        onClose(); // Close modal after processing
    });
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Render logic (loading/error states remain similar)
  if (!isOpen) return null;

   if (loadError) {
     console.error("Google Maps Load Error:", loadError);
     return ( <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"> /* Error UI */ </div> );
   }
   if (!isLoaded) {
     return ( <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"> /* Loading UI */ </div> );
   }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl text-black">
        <h2 className="text-xl font-semibold mb-4">Select Location</h2>
        <div style={containerStyle}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center} // Keep a default center
            zoom={6} // Default zoom
            options={{
               restriction: { latLngBounds: philippinesBounds, strictBounds: false },
               minZoom: 5,
               maxZoom: 18,
               mapTypeControl: false,
               streetViewControl: false,
               clickableIcons: false
            }}
            onClick={handleMapClick}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {selectedPosition && (
              <Marker
                 position={selectedPosition}
                 draggable={true}
                 onDragEnd={handleMarkerDragEnd}
               />
            )}
          </GoogleMap>
        </div>
         {selectedPosition && (
             <p className="text-sm text-gray-600 mt-2">
                 Selected: Lat: {selectedPosition.lat.toFixed(6)}, Lng: {selectedPosition.lng.toFixed(6)}
             </p>
         )}
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isGeocoding} // Disable while geocoding
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSelection}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            disabled={!selectedPosition || isGeocoding} // Disable if no marker or geocoding
          >
             {isGeocoding ? 'Getting Address...' : 'Confirm Location'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;