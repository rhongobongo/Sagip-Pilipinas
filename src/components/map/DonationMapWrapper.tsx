'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapRef } from './GoogleMapComponent'; // Assuming MapRef is exported from here
import { RequestPin } from '@/types/types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/Firebase/Firebase'; // Make sure this is your client-side Firebase import
import { CiCircleAlert } from 'react-icons/ci';

// Use dynamic import with ssr: false for the map component
const DynamicMap = dynamic(() => import('./GoogleMapComponent'), {
  ssr: false,
});

interface DonationMapWrapperProps {
  initialPins?: RequestPin[];
  onPinSelect?: (pin: RequestPin) => void;
  width?: string;
  height?: string;
}

const DonationMapWrapper: React.FC<DonationMapWrapperProps> = ({
  initialPins = [],
  onPinSelect,
  width = '100vw', // Default width
  height = '100vh', // Default height
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const aidRequestId = searchParams.get('aidRequestId'); // Read ID from URL

  const [pins, setPins] = useState<RequestPin[]>(initialPins);
  const [selectedPin, setSelectedPin] = useState<RequestPin | null>(null);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    // Fetch aid requests on component mount
    const fetchAidRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'aidRequest'));
        const aidRequests: RequestPin[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Basic validation for coordinates
          const latitude = data.coordinates?.latitude;
          const longitude = data.coordinates?.longitude;

          if (typeof latitude === 'number' && typeof longitude === 'number') {
            aidRequests.push({
              id: doc.id,
              name: data.name || 'Unnamed Request',
              contactNum: data.contactNumber || 'N/A',
              calamityLevel: data.calamityLevel || 'Unknown',
              calamityType: data.calamityType || 'Unknown',
              shortDesc: data.shortDesc || 'No description provided.',
              imageURL: data.imageUrl || undefined, // Use undefined if not present
              coordinates: {
                latitude: latitude,
                longitude: longitude,
              },
              // Ensure date/time fields exist or provide defaults
              submissionDate: data.submissionDate?.toDate ? data.submissionDate.toDate().toISOString() : data.submissionDate || null, // Handle Firebase Timestamp or string
              submissionTime: data.submissionTime || 'N/A',
            });
          } else {
            console.warn(`Skipping aid request ${doc.id} due to invalid coordinates:`, data.coordinates);
          }
        });

        setPins(aidRequests);

        // If there's an aid request ID in the URL, find and select that pin
        if (aidRequestId) {
          const matchedPin = aidRequests.find((pin) => pin.id === aidRequestId);
          if (matchedPin) {
            // Use setSelectedPin directly here, handlePinSelect updates URL which we don't want initially
            setSelectedPin(matchedPin);
            // Zoom to the pin after a short delay to ensure map is ready
            setTimeout(() => {
              if (mapRef.current?.zoomMarker) {
                mapRef.current.zoomMarker(matchedPin);
              }
            }, 500); // Delay might be adjusted or handled with map load state
          } else {
             console.warn(`Aid request ID "${aidRequestId}" from URL not found in fetched pins.`);
             // Optionally clear the invalid URL parameter
             // const currentPath = window.location.pathname;
             // router.push(currentPath, { scroll: false });
          }
        } else if (aidRequests.length > 0 && !selectedPin) {
           // Optionally select the first pin if none is selected and no ID in URL
           // handlePinSelect(aidRequests[0]); // Calling handlePinSelect here would update the URL
        }

      } catch (error) {
        console.error('Error fetching aid requests:', error);
        // Handle error state, e.g., show a message to the user
      }
    };

    fetchAidRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aidRequestId]); // Re-run if aidRequestId in URL changes

  // Handles selecting a pin (from list or map)
  const handlePinSelect = (pin: RequestPin) => {
    // Prevent re-selecting the same pin unnecessarily
    if (selectedPin?.id === pin.id) return;

    setSelectedPin(pin); // Update component state

    if (onPinSelect) {
      onPinSelect(pin); // Optional: notify parent component
    }

    // Update URL with the selected aid request ID using Next.js router
    // This adds "?aidRequestId=<pin.id>" to the URL without full page reload
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?aidRequestId=${pin.id}`, { scroll: false });


    // Zoom the map to the selected pin
    if (mapRef.current?.zoomMarker) {
      mapRef.current.zoomMarker(pin);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
            // Try parsing common Firestore timestamp formats if it's an object
             if (typeof dateString === 'object' && dateString && 'seconds' in dateString && 'nanoseconds' in dateString) {
                 const firestoreDate = new Date((dateString as any).seconds * 1000 + (dateString as any).nanoseconds / 1000000);
                 if (!isNaN(firestoreDate.getTime())) {
                     return firestoreDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                 }
             }
            return 'Invalid Date';
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Invalid Date Input';
    }
  };

  // Format time - assuming it's stored as a string like HH:MM
  const formatTime = (timeString: string | null | undefined) => {
      if (!timeString || typeof timeString !== 'string') return 'N/A';
       // Basic validation could be added here if needed (e.g., regex for HH:MM)
      return timeString;
  }

  return (
    // Use provided height, default to screen height
    <div className="flex flex-col sm:flex-row border-2 border-gray-300 dark:border-gray-700" style={{ height: height }}>
      {/* Left panel - Aid request list */}
      {/* Ensure panel takes full height within flex container */}
      <div className="w-full sm:w-1/3 h-1/2 sm:h-full bg-white dark:bg-gray-800 p-4 overflow-y-auto shadow-lg flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex-shrink-0">Aid Requests</h2>

        {/* Display details of the selected pin - make this scrollable if content overflows */}
        {selectedPin && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 mb-6 rounded-lg border border-red-200 dark:border-red-700 text-gray-800 dark:text-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
              Selected Request
            </h3>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <span className="font-semibold">Request ID:</span> <span className="font-normal break-all">{selectedPin.id}</span>
              </p>
              <p>
                <span className="font-semibold">Name:</span> <span className="font-normal">{selectedPin.name}</span>
              </p>
              <p>
                <span className="font-semibold">Contact:</span>{' '}
                <span className="font-normal">{selectedPin.contactNum}</span>
              </p>
              <p>
                <span className="font-semibold">Calamity Type:</span>{' '}
                <span className="font-normal">{selectedPin.calamityType}</span>
              </p>
              <p>
                <span className="font-semibold">Level:</span>{' '}
                <span className="font-normal">{selectedPin.calamityLevel}</span>
              </p>
              <p>
                <span className="font-semibold">Date:</span>{' '}
                <span className="font-normal">
                  {formatDate(selectedPin.submissionDate)}
                </span>
              </p>
              <p>
                <span className="font-semibold">Time:</span>{' '}
                <span className="font-normal">
                  {formatTime(selectedPin.submissionTime)}
                </span>
              </p>
              <p>
                <span className="font-semibold">Location:</span>{' '}
                <span className="font-normal">
                  {selectedPin.coordinates?.latitude?.toFixed(6)},{' '}
                  {selectedPin.coordinates?.longitude?.toFixed(6)}
                </span>
              </p>
              <p className="font-semibold mt-2">Description:</p>
              <p className="bg-white dark:bg-gray-700 p-2 rounded mt-1 border dark:border-gray-600 text-gray-700 dark:text-gray-300">
                {selectedPin.shortDesc}
              </p>

              {selectedPin.imageURL && (
                <div className="mt-3">
                  <p className="font-semibold">Image:</p>
                  <img
                    src={selectedPin.imageURL}
                    alt="Aid request visual"
                    className="mt-1 rounded-md w-full object-cover max-h-48 border dark:border-gray-600"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* List of all pins - make this section take remaining space and scroll */}
        <div className="space-y-2 text-gray-900 dark:text-white overflow-y-auto flex-grow">
          {pins.map((pin) => (
            <div
              key={pin.id}
              className={`p-3 rounded-md cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 border transition-colors ${
                selectedPin?.id === pin.id
                  ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30' // Highlight if selected
                  : 'border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-600'
              }`}
              onClick={() => handlePinSelect(pin)} // Select pin on click
              role="button" // Accessibility improvement
              tabIndex={0} // Make it focusable
              onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handlePinSelect(pin) : null} // Keyboard accessibility
            >
              <div className="flex justify-between items-start gap-2">
                {/* Pin details on left */}
                <div className="flex-grow min-w-0"> {/* Added min-w-0 here for flex-grow */}
                  <h3 className="font-medium text-base truncate">{pin.name}</h3> {/* Added truncate */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {pin.calamityType} - Level {pin.calamityLevel}
                  </p>
                   <p className="text-sm mt-1 text-gray-700 dark:text-gray-300 line-clamp-2">
                    {pin.shortDesc}
                  </p>
                </div>
                {/* Meta info and icon on right */}
                <div className="flex-shrink-0 flex flex-col items-end">
                   <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap"> {/* Added whitespace-nowrap */}
                      {formatDate(pin.submissionDate)}
                   </span>
                   <CiCircleAlert className="text-red-600 dark:text-red-400 text-2xl" aria-label="Alert icon" />
                </div>
              </div>

            </div>
          ))}

          {pins.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No aid requests available at the moment.
            </div>
          )}
        </div>
      </div>

      {/* Right panel - Map */}
      {/* Ensure map takes full height and width available */}
      <div className="w-full sm:w-2/3 h-1/2 sm:h-full border-t-2 sm:border-t-0 sm:border-l-2 border-gray-300 dark:border-gray-700 relative">
        {/* Map container needs explicit width and height for the GoogleMapComponent */}
        <div style={{ width: '100%', height: '100%' }}>
            <DynamicMap
                ref={mapRef}
                pins={pins}
                setPin={handlePinSelect} // Allows map clicks to trigger selection
                // selectedPinId prop removed - Component doesn't accept it
                width="100%"
                height="100%"
            />
        </div>
      </div>
    </div>
  );
};

export default DonationMapWrapper;