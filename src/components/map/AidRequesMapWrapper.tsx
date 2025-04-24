'use client';

import React, { useState, useRef, useEffect } from 'react'; // Import useRef
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

// Basic type check for Firestore Timestamp-like objects if needed
interface FirestoreTimestampLike {
  toDate?: () => Date;
  // Add other properties if you expect them, e.g., seconds/nanoseconds
}


const AidRequestMapWrapper: React.FC<AidRequestMapWrapperProps> = ({
  initialPins = [],
  onPinSelect,
}) => {
  const router = useRouter();
  const [pins, setPins] = useState<RequestPin[]>(initialPins);
  const [selectedPin, setSelectedPin] = useState<RequestPin | null>(null);
  const mapRef = useRef<MapRef>(null);
  // --- 1. Create a Ref for the Left Panel ---
  const leftPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAidRequests = async () => {
      try {
        // Basic check for db connection
        if (!db) {
            console.error("Firebase db is not initialized.");
            return;
        }
        const querySnapshot = await getDocs(collection(db, 'aidRequest'));
        const aidRequests: RequestPin[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Add basic validation/defaults
          const latitude = data.coordinates?.latitude;
          const longitude = data.coordinates?.longitude;

          if (typeof latitude === 'number' && typeof longitude === 'number') {
             aidRequests.push({
                id: doc.id,
                name: data.name || 'N/A',
                contactNum: data.contactNumber || 'N/A',
                calamityLevel: data.calamityLevel || 'Unknown',
                calamityType: data.calamityType || 'Unknown',
                shortDesc: data.shortDesc || 'No description',
                imageURL: data.imageUrl || undefined, // Use undefined if missing
                coordinates: { latitude, longitude },
                // Handle potential Timestamp objects or string dates
                submissionDate: data.submissionDate?.toDate // Check if it has a toDate method (like Firebase Timestamp)
                    ? data.submissionDate.toDate().toISOString()
                    : data.submissionDate || null, // Otherwise use as is or null
                submissionTime: data.submissionTime || 'N/A',
             });
          } else {
             console.warn(`Skipping aid request ${doc.id}: Invalid coordinates`, data.coordinates);
          }
        });

        setPins(aidRequests);
        // Optionally select the first pin if none is selected yet
        // if (aidRequests.length > 0 && !selectedPin) {
        //    handlePinSelect(aidRequests[0]); // Be careful, this might cause loop if not handled well
        // }
      } catch (error) {
        console.error('Error fetching aid requests:', error);
      }
    };

    fetchAidRequests();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed selectedPin from deps if initial selection isn't desired here


  const handlePinSelect = (pin: RequestPin) => {
    // Prevent re-selecting the same pin if already selected
    if (selectedPin?.id === pin.id) return;

    setSelectedPin(pin);
    if (onPinSelect) {
      onPinSelect(pin);
    }

    // Zoom to the selected pin
    if (mapRef.current?.zoomMarker) {
      mapRef.current.zoomMarker(pin);
    }

    // --- 3. Scroll Left Panel to Top ---
    console.log('--- Scrolling Diagnostics (Pin Select) ---');
    const element = leftPanelRef.current;
    if (element) {
        console.log('Ref attached to element:', element);
        console.log('Element Height:', element.clientHeight, 'px');
        console.log('Element Scroll Height:', element.scrollHeight, 'px');

        if (element.scrollHeight > element.clientHeight) {
            console.log('Attempting scroll...');
            requestAnimationFrame(() => { // Use rAF for better timing
               element.scrollTo({ top: 0, behavior: 'smooth' });
               // Or try instant: element.scrollTop = 0;
               console.log('Scroll command executed. Current ScrollTop:', element.scrollTop);
            });
        } else {
            console.log('Scrolling not needed (Scroll Height <= Client Height).');
        }
    } else {
         console.error('ERROR: leftPanelRef.current is null!');
    }
     console.log('--- End Diagnostics ---');
     // --- End Scroll Logic ---
  };

  const formatDate = (dateInput: string | FirestoreTimestampLike | null | undefined): string => {
      if (!dateInput) return 'N/A';

      try {
          let date: Date | null = null;
          if (typeof dateInput === 'string') {
              date = new Date(dateInput);
          } else if (typeof dateInput === 'object' && dateInput !== null && typeof (dateInput as FirestoreTimestampLike).toDate === 'function') {
              // Looks like a Firestore Timestamp or similar object
              date = (dateInput as FirestoreTimestampLike).toDate!();
          }

          if (date && !isNaN(date.getTime())) {
              return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
              });
          } else {
              console.warn("Invalid date input for formatDate:", dateInput);
              return 'Invalid Date';
          }
      } catch (error) {
          console.error("Error formatting date:", dateInput, error);
          return 'Error Date';
      }
  };


  const handleDonate = () => {
      if (selectedPin) {
          router.push(`/donation?aidRequestId=${selectedPin.id}`);
      } else {
          console.warn("No pin selected to donate to.");
          // Optionally show a message to the user
      }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen">
      {/* --- 2. Attach the Ref to the Left panel div --- */}
      <div
        ref={leftPanelRef} // Attach the ref here
        className="w-full h-1/2 md:w-1/3 md:h-full bg-white p-4 overflow-y-auto shadow-lg" // This div handles the scroll
      >
        <h2 className="text-xl font-bold mb-4 text-black flex-shrink-0">Aid Requests</h2> {/* Added flex-shrink-0 */}

        {selectedPin && (
          // Added flex-shrink-0 to prevent this block from shrinking when list grows
          <div className="bg-red-50 p-4 mb-6 rounded-lg border border-red-200 text-black flex-shrink-0">
            <h3 className="text-lg font-semibold text-red-700">
              Selected Request
            </h3>
            <div className="mt-2 space-y-1 text-sm"> {/* Added spacing and text size */}
               {/* Using P tags for better structure and spacing */}
              <p>
                <span className="font-semibold">Name:</span>{' '}
                <span className="font-normal">{selectedPin.name}</span>
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
                  {selectedPin.submissionTime}
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
              <p className="bg-white p-2 rounded mt-1 border overflow-x-auto text-black"> {/* Added text-black */}
                {selectedPin.shortDesc}
              </p>

              {selectedPin.imageURL && (
                <div className="mt-3">
                  <p className="font-semibold">Image:</p>
                  <img
                    src={selectedPin.imageURL}
                    alt="Aid request"
                    className="mt-1 rounded-md w-full object-cover max-h-48 border" // Added border
                  />
                </div>
              )}

              <button
                className="bg-red-600 hover:bg-red-700 text-white my-3 py-2 px-4 rounded-lg text-base font-medium transition duration-150 ease-in-out" // Improved button style
                onClick={handleDonate}
              >
                DONATE
              </button>
            </div>
          </div>
        )}

         {/* This div will now grow and potentially scroll if needed, but the container above handles overflow */}
        <div className="space-y-2 text-black">
          {pins.map((pin) => (
            <button
              key={pin.id}
              className={`w-full p-3 rounded-md cursor-pointer hover:bg-red-100 border-2 transition-colors text-left ${ // Added text-left
                selectedPin?.id === pin.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300' // Adjusted border
              }`}
              onClick={() => handlePinSelect(pin)}
            >
              <div className="flex justify-between items-start gap-2"> {/* Added gap */}
                <div className="flex-grow min-w-0"> {/* Added min-w-0 for truncation */}
                  <h3 className="font-medium text-base truncate">{pin.name}</h3> {/* Added truncate */}
                  <p className="text-sm text-gray-600 truncate"> {/* Added truncate */}
                    {pin.calamityType} - Level {pin.calamityLevel}
                  </p>
                   <p className="text-sm mt-1 text-gray-700 line-clamp-2"> {/* Kept line-clamp */}
                     {pin.shortDesc}
                   </p>
                </div>
                 <div className="flex-shrink-0 flex flex-col items-end ml-2"> {/* Added margin */}
                    <span className="text-xs text-gray-500 mb-1 whitespace-nowrap"> {/* Added nowrap */}
                        {formatDate(pin.submissionDate)}
                    </span>
                    {/* Icon aligned with date */}
                    <CiCircleAlert className="text-red-600 text-2xl" /> {/* Adjusted color */}
                 </div>
              </div>
            </button>
          ))}

          {pins.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No aid requests available
            </div>
          )}
        </div>
      </div> {/* End of Left Panel */}

      {/* Right panel - Aid request map */}
      <div className="w-full h-1/2 md:w-2/3 md:h-full border-t-2 md:border-t-0 md:border-l-2 border-gray-200"> {/* Added border */}
        <DynamicMap
          ref={mapRef}
          pins={pins}
          setPin={handlePinSelect} // Allow map clicks to select pin
          width="100%"
          height="100%"
          // Pass selectedPinId if your Map component uses it for highlighting
          // selectedPinId={selectedPin?.id}
        />
      </div>
    </div>
  );
};

export default AidRequestMapWrapper;