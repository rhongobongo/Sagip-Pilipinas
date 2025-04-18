'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapRef } from './GoogleMapComponent';
import { RequestPin } from '@/types/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/Firebase/Firebase'; // Make sure this is your client-side Firebase import
import { CiCircleAlert } from 'react-icons/ci';
import { useRouter } from 'next/navigation';

// Use dynamic import with ssr: false for the map component
const DynamicMap = dynamic(() => import('./GoogleMapComponent'), {
  ssr: false,
});

interface AidRequestMapWrapperProps {
  initialPins?: RequestPin[];
  onPinSelect?: (pin: RequestPin) => void;
}

const AidRequestMapWrapper: React.FC<AidRequestMapWrapperProps> = ({
  initialPins = [],
  onPinSelect,
}) => {
  const router = useRouter();
  const [pins, setPins] = useState<RequestPin[]>(initialPins);
  const [selectedPin, setSelectedPin] = useState<RequestPin | null>(null);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const fetchAidRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'aidRequest'));
        const aidRequests: RequestPin[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          aidRequests.push({
            id: doc.id,
            name: data.name,
            contactNum: data.contactNumber,
            calamityLevel: data.calamityLevel,
            calamityType: data.calamityType,
            shortDesc: data.shortDesc,
            imageURL: data.imageUrl,
            coordinates: {
              latitude: data.coordinates.latitude,
              longitude: data.coordinates.longitude,
            },
            submissionDate: data.submissionDate,
            submissionTime: data.submissionTime,
          });
        });

        setPins(aidRequests);
      } catch (error) {
        console.error('Error fetching aid requests:', error);
      }
    };

    fetchAidRequests();
  }, []);

  const handlePinSelect = (pin: RequestPin) => {
    setSelectedPin(pin);
    if (onPinSelect) {
      onPinSelect(pin);
    }

    // Zoom to the selected pin
    if (mapRef.current?.zoomMarker) {
      mapRef.current.zoomMarker(pin);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDonate = () => {
    router.push(`/donation?aidRequestId=${selectedPin?.id}`);
  };
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen">
      {/* Left panel - Aid request list */}
      <div className="w-full h-1/2 md:w-1/3 md:h-full bg-white p-4 overflow-y-auto shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-black">Aid Requests</h2>

        {selectedPin && (
          <div className="bg-red-50 p-4 mb-6 rounded-lg border border-red-200 text-black">
            <h3 className="text-lg font-semibold text-red-700">
              Selected Request
            </h3>
            <div className="mt-2">
              <p className="font-semibold">
                Name: <span className="font-normal">{selectedPin.name}</span>
              </p>
              <p className="font-semibold">
                Contact:{' '}
                <span className="font-normal">{selectedPin.contactNum}</span>
              </p>
              <p className="font-semibold">
                Calamity Type:{' '}
                <span className="font-normal">{selectedPin.calamityType}</span>
              </p>
              <p className="font-semibold">
                Level:{' '}
                <span className="font-normal">{selectedPin.calamityLevel}</span>
              </p>
              <p className="font-semibold">
                Date:{' '}
                <span className="font-normal">
                  {formatDate(selectedPin.submissionDate || '')}
                </span>
              </p>
              <p className="font-semibold">
                Time:{' '}
                <span className="font-normal">
                  {selectedPin.submissionTime}
                </span>
              </p>
              <p className="font-semibold">
                Location:{' '}
                <span className="font-normal">
                  {selectedPin.coordinates?.latitude.toFixed(6)},{' '}
                  {selectedPin.coordinates?.longitude.toFixed(6)}
                </span>
              </p>
              <p className="font-semibold mt-2">Description:</p>
              <p className="bg-white p-2 rounded mt-1 border overflow-x-auto">
                {selectedPin.shortDesc}
              </p>

              {selectedPin.imageURL && (
                <div className="mt-3">
                  <p className="font-semibold">Image:</p>
                  <img
                    src={selectedPin.imageURL}
                    alt="Aid request"
                    className="mt-1 rounded-md w-full object-cover max-h-48"
                  />
                </div>
              )}

              <button
                className="bg-red-600 text-white my-3 p-3 rounded-2xl"
                onClick={handleDonate}
              >
                DONATE
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 text-black ">
          {pins.map((pin) => (
            <button
              key={pin.id}
              className={`w-full p-3 rounded-md cursor-pointer hover:bg-red-100 border transition-colors${
                selectedPin?.id === pin.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-red-200'
              }`}
              onClick={() => handlePinSelect(pin)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-start font-medium">{pin.name}</h3>
                  <p className="text-sm text-gray-600">
                    {pin.calamityType} - Level {pin.calamityLevel}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(pin.submissionDate || '')}
                </span>
                <div className="h-full mb-auto">
                  <CiCircleAlert className="text-red-800 text-2xl" />
                </div>
              </div>
              <p className="text-start text-sm mt-1 text-gray-700 line-clamp-2">
                {pin.shortDesc}
              </p>
            </button>
          ))}

          {pins.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No aid requests available
            </div>
          )}
        </div>
      </div>
      {/* Right panel - Aid request map */}
      <div className="w-full h-1/2 md:w-2/3 md:h-full">
        <DynamicMap
          ref={mapRef}
          pins={pins}
          setPin={handlePinSelect}
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
};

export default AidRequestMapWrapper;
