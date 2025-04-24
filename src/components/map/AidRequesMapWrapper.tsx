'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapRef } from './GoogleMapComponent';
import { RequestPin } from '@/types/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/Firebase/Firebase'; // Make sure this is your client-side Firebase import
import { CiCircleAlert } from 'react-icons/ci';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  // --- 1. Create a Ref for the scrollable list container ---
  const scrollableListRef = useRef<HTMLDivElement>(null); // Added Ref

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

    // Zoom to the selected pin on the map
    if (mapRef.current?.zoomMarker) {
      mapRef.current.zoomMarker(pin);
    }

    // --- 3. Scroll the list container to the top ---
    if (scrollableListRef.current) {
      scrollableListRef.current.scrollTo({
        top: 0,
        behavior: 'smooth', // Use 'auto' for instant scroll if preferred
      });
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
    // Ensure selectedPin and its id exist before navigating
    if (selectedPin?.id) {
      router.push(`/donation?aidRequestId=${selectedPin.id}`);
    } else {
      console.error('Cannot navigate to donation page: No selected pin ID.');
      // Optionally show an error message to the user
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen">
      {/* Left panel - Aid request list */}
      {/* --- 2. Attach the Ref to the scrollable container --- */}
      <div
        ref={scrollableListRef} // Added ref here
        className="w-full h-1/2 md:w-1/3 md:h-full bg-white p-4 overflow-y-auto shadow-lg"
      >
        <h2 className="text-xl font-bold mb-4 text-black">Aid Requests</h2>

        {/* --- Selected Pin Details Section --- */}
        {selectedPin && (
          <div className="bg-red-50 p-4 mb-6 rounded-lg border border-red-200 text-black text-base sm:text-lg">
            <h3 className=" font-semibold text-black">Selected Request</h3>
            <div className="mt-2">
              {/* ... (rest of the selected pin details remain the same) ... */}
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
                className="bg-red-600 text-white my-3 p-3 rounded-2xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                onClick={handleDonate}
                disabled={!selectedPin?.id} // Disable button if no pin is selected
              >
                DONATE
              </button>
            </div>
          </div>
        )}
        {/* --- End of Selected Pin Details --- */}

        {/* --- List of Pins Section --- */}
        <div className="space-y-2 text-black ">
          {pins.map((pin) => (
            <button
              key={pin.id}
              // --- Added type="button" for clarity ---
              type="button"
              className={`w-full p-3 rounded-md cursor-pointer text-left hover:bg-red-100 border transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 ${
                selectedPin?.id === pin.id
                  ? 'border-red-500 bg-red-200' // Added bg-red-200 for better visibility
                  : 'border-red-300'
              }`}
              onClick={() => handlePinSelect(pin)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{pin.name}</h3>
                  <p className="text-sm text-gray-600">
                    {pin.calamityType} - Level {pin.calamityLevel}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {' '}
                  {/* Group icon and date */}
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {' '}
                    {/* Prevent date wrapping */}
                    {formatDate(pin.submissionDate || '')}
                  </span>
                  <CiCircleAlert className="text-red-800 text-2xl flex-shrink-0" />{' '}
                  {/* Ensure icon doesn't shrink */}
                </div>
              </div>
              <p className="text-sm mt-1 text-gray-700 line-clamp-2">
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
        {/* --- End of List of Pins --- */}
      </div>

      {/* Right panel - Aid request map */}
      <div className="w-full h-1/2 md:w-2/3 md:h-full">
        <DynamicMap
          ref={mapRef}
          pins={pins}
          setPin={handlePinSelect} // Clicking pin on map also triggers handlePinSelect
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
};

export default AidRequestMapWrapper;
