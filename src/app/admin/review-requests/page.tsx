'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Keep Link as it was in your original code for wrapping items
import { db } from '@/lib/Firebase/Firebase';
import { collection, getDocs, query, orderBy, doc, deleteDoc, Timestamp as FirebaseTimestamp, FirestoreError } from 'firebase/firestore';

// --- Original RequestDetails type ---
type RequestDetails = {
    id: string;
    requesterName: string;
    contactNumber: string;
    location: string;
    calamityType: string;
    calamityLevel: string;
    date: string;
    time: string;
    status?: 'pending' | 'approved' | 'completed';
    // Add other potential fields from Firestore if needed, based on your actual data structure
    timestamp?: FirebaseTimestamp | string;
    submissionDate?: string;
    submissionTime?: string;
    address?: string;
    coordinates?: { latitude: number; longitude: number };
    name?: string; // This was in your original mapping logic
};

type TimestampParameter = FirebaseTimestamp | string | null | undefined;

// --- Original formatDateTimeClient function ---
function formatDateTimeClient(timestamp: TimestampParameter, dateStr?: string, timeStr?: string): { date: string; time: string } {
    let finalDate = dateStr || '';
    let finalTime = timeStr || '';
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
        const dateObj = timestamp.toDate();
        finalDate = dateObj.toLocaleDateString('en-CA');
        finalTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (typeof timestamp === 'string') {
        const parts = timestamp.split(' at ');
        if (parts.length === 2) {
            if (!dateStr) finalDate = parts[0];
            if (!timeStr) finalTime = parts[1].replace(/ UTC\+\d+$/, '');
        } else if (!dateStr) { finalDate = timestamp; }
    } else if (dateStr && timeStr) {
        finalDate = dateStr; finalTime = timeStr;
    }
    finalDate = finalDate || 'N/A'; finalTime = finalTime || 'N/A';
    return { date: finalDate, time: finalTime };
}

// --- Original NavTab component ---
const NavTab: React.FC<{ label: string; href: string; active?: boolean }> = ({ label, href, active = false }) => {
    const baseClasses = "py-1.5 px-6 text-sm font-bold rounded-full transition-all duration-200";
    const activeClasses = "bg-white text-red-800 shadow-sm";
    const inactiveClasses = "text-white hover:bg-red-700";
    return ( <a href={href} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}> {label} </a> );
};

// --- NEW: Simple Confirmation Modal Component ---
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    requesterName: string; // Only need the name for the message
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, requesterName }) => {
    if (!isOpen) return null;

    return (
        // Fixed position overlay to cover screen and center content
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            {/* Modal container */}
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Confirm Deletion</h3>
                <p className="mb-6 text-gray-700">
                    {/* Use requester name in the message */}
                    Are you sure you want to delete the request from <span className="font-bold">{requesterName}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    {/* Cancel Button */}
                    <button
                        onClick={onClose} // Calls the cancel handler
                        type="button"
                        className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    {/* Confirm Button */}
                    <button
                        onClick={onConfirm} // Calls the confirm handler
                        type="button"
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main AidRequestsPage Component ---
const AidRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<RequestDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [locationInput, setLocationInput] = useState('');

    // --- NEW: State for the confirmation modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<{ id: string; name: string } | null>(null); // Store ID and Name

    const welcomeHeaderBgColor = 'bg-red-800';
    const BOX_CONTENT_HEIGHT = 'h-[350px]';

    // --- Original useEffect for fetching data ---
    useEffect(() => {
        const fetchData = async () => {
            if (!db) {
                setError("Firestore is not available. Check Firebase configuration.");
                setIsLoading(false);
                console.error("Firestore db instance is null or undefined.");
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const requestsRef = collection(db, 'aidRequest');
                const q = query(requestsRef, orderBy('timestamp', 'desc'));
                const querySnapshot = await getDocs(q);
                const fetchedRequests: RequestDetails[] = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    const { date, time } = formatDateTimeClient(data.timestamp, data.submissionDate, data.submissionTime);
                    let location = 'Location Unavailable';
                    if (data.coordinates && typeof data.coordinates.latitude === 'number' && typeof data.coordinates.longitude === 'number') {
                        const lat = data.coordinates.latitude; const lon = data.coordinates.longitude;
                        location = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                    } else if (data.address && typeof data.address === 'string') { location = data.address;
                    } else if (data.coordinates) { console.warn(`Unexpected coordinates format for doc ${doc.id}:`, data.coordinates); }
                    const status: RequestDetails['status'] = data.status as RequestDetails['status'] || 'pending';
                    return { // Return structure from your original code
                        id: doc.id,
                        requesterName: data.name || 'N/A', // Using 'name' field as in your original mapping
                        contactNumber: data.contactNumber || 'N/A',
                        location: location,
                        calamityType: data.calamityType || 'N/A',
                        calamityLevel: data.calamityLevel || 'N/A',
                        date: date,
                        time: time,
                        status: status,
                    };
                });
                setRequests(fetchedRequests);
            } catch (err: FirestoreError | unknown) {
                console.error("Error fetching aid requests:", err);
                const errorMessage = err instanceof Error ? err.message : 'Please check console.';
                setError(`Failed to load requests: ${errorMessage}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Original filtering logic ---
    const disasterTypes = [...new Set(requests.map(request => request.calamityType).filter(Boolean))];
    const calamityLevels = [...new Set(requests.map(request => request.calamityLevel).filter(Boolean))];
    const dates = [...new Set(requests.map(request => request.date).filter(Boolean))];
    const filterOptions = [
        { value: 'calamityType', label: 'Disaster Type', options: disasterTypes },
        { value: 'calamityLevel', label: 'Calamity Level', options: calamityLevels },
        { value: 'location', label: 'Location', options: [] },
        { value: 'date', label: 'Date', options: dates }
    ];
    const filteredRequests = requests.filter(request => {
        let generalFilterPass = true;
        if (filterType && filterType !== 'location' && filterValue) {
            const key = filterType as keyof Pick<RequestDetails, 'calamityType' | 'calamityLevel' | 'date'>;
            if (key in request && request[key] !== undefined && request[key] !== null) {
                generalFilterPass = String(request[key]).toLowerCase() === String(filterValue).toLowerCase();
            } else { generalFilterPass = false; }
        } else if (filterType === 'location' && locationInput) {
            generalFilterPass = String(request.location || '').toLowerCase().includes(locationInput.toLowerCase());
        }
        return generalFilterPass;
    });

    // --- MODIFIED: Delete Handling uses Modal ---

    // 1. Opens the modal, storing the ID and Name
    const initiateDelete = (id: string, name: string) => {
        setRequestToDelete({ id, name });
        setIsModalOpen(true);
    };

    // 2. Performs deletion if confirmed in modal
    const handleConfirmDelete = async () => {
        if (!requestToDelete || !db) {
            alert("Error: Could not delete. Request details missing or Firestore not initialized.");
            setIsModalOpen(false); // Close modal even on error
            setRequestToDelete(null);
            return;
        }

        const { id, name } = requestToDelete; // Get details from state

        try {
            const requestDocRef = doc(db, "aidRequest", id);
            await deleteDoc(requestDocRef);
            setRequests(prevRequests => prevRequests.filter(r => r.id !== id));
            alert(`Request from ${name} successfully deleted.`); // Use original alert, include name
        } catch (err: FirestoreError | unknown) {
            console.error("Error deleting document:", err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            alert(`Failed to delete request from ${name}: ${errorMessage}`); // Use original alert, include name
        } finally {
            // Always close modal and clear state after attempting delete
            setIsModalOpen(false);
            setRequestToDelete(null);
        }
    };

    // 3. Closes the modal without deleting
    const handleCancelDelete = () => {
        setIsModalOpen(false);
        setRequestToDelete(null);
    };

    // --- Original JSX Structure (with delete button modified) ---
    return (
        <div className="w-full h-full p-4 font-inter bg-gray-50">
            {/* Original Style block */}
             <style jsx global>{`
                 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                 .custom-red-scrollbar::-webkit-scrollbar { width: 8px; }
                 .custom-red-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                 .custom-red-scrollbar::-webkit-scrollbar-thumb { background: #DC2626; border-radius: 10px; }
                 .custom-red-scrollbar::-webkit-scrollbar-thumb:hover { background: #B91C1C; }
                 .custom-red-scrollbar { scrollbar-width: thin; scrollbar-color: #DC2626 #f1f1f1; }
                 html { scroll-behavior: smooth; }
                 .request-item-link .details-grid { transition: background-color 0.2s ease-in-out; }
                 .request-item-link:hover .details-grid { background-color: #f9fafb; }
                 .request-item-link:active .details-grid { background-color: #f3f4f6; }
             `}</style>

            {/* Original Welcome Header */}
            <div className={`${welcomeHeaderBgColor} p-6 rounded-lg mb-6 text-white shadow relative overflow-hidden`}>
                 <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-700 opacity-30 transform translate-x-1/4 -translate-y-1/4" aria-hidden="true"></div>
                 <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-red-600 opacity-20" aria-hidden="true"></div>
                 <h1 className="text-3xl font-bold mb-2 relative z-10">Hello Admin!</h1>
                 <p className="text-medium text-gray-200 font-medium relative z-10 mb-4 text-center">
                     Track real-time insights and performance metrics to make informed decisions. Explore user activity, disaster reports, and aid distribution data all in one place.
                 </p>
                 <div className="flex flex-wrap justify-center items-center mt-4 space-x-4 relative z-10">
                     <NavTab label="Review Requests" href="/admin/review-requests" active />
                     <NavTab label="Dashboard" href="/admin/analytics" />
                     <NavTab label="News Articles" href="/admin/news" />
                     <NavTab label="Organizations" href="/admin/organizations" />
                     <NavTab label="Volunteers" href="/admin/volunteers" />
                 </div>
             </div>

            {/* Original Filter Controls */}
            <div className="flex flex-wrap items-center mb-6 gap-y-2 gap-x-2 sm:gap-x-4">
                <span className="text-gray-600 font-medium w-full sm:w-auto flex-shrink-0">Filter by:</span>
                <select
                    aria-label="Filter type"
                    value={filterType}
                    onChange={(e) => {
                        setFilterType(e.target.value);
                        setFilterValue('');
                        setLocationInput('');
                    }}
                    className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 flex-grow sm:flex-grow-0"
                >
                    <option value="">Select Filter Type</option>
                    {filterOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
                {filterType && filterType !== 'location' && (
                    <select
                        aria-label={`Filter value for ${filterType}`}
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 flex-grow sm:flex-grow-0"
                    >
                        <option value="">Select {filterOptions.find(opt => opt.value === filterType)?.label}</option>
                        {filterOptions.find(opt => opt.value === filterType)?.options.map(option => (<option key={option} value={option}>{option}</option>))}
                    </select>
                )}
                {filterType === 'location' && (
                    <input
                        type="text"
                        aria-label="Filter by location"
                        placeholder="Enter Location"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 w-full sm:w-64 flex-grow sm:flex-grow-0"
                    />
                )}
            </div>

            {/* Original Loading / Error States */}
             {isLoading ? (
                 <div className="p-10 text-center text-gray-600">Loading requests...</div>
             ) : error ? (
                 <div className="p-10 text-center text-red-600 border border-red-300 bg-red-50 rounded">
                     <p className="font-semibold">Error Loading Data</p>
                     <p>{error}</p>
                 </div>
             ) : (
                 // --- Original Requests Display Structure ---
                 <>
                     <div className="mb-8 bg-white rounded-lg border-2 border-orange-500 shadow-sm overflow-hidden">
                         <div className="flex justify-start items-center px-4 py-3 border-b border-gray-200 bg-white rounded-t-lg">
                             <h2 className="text-lg font-semibold text-gray-800">All Aid Requests</h2>
                         </div>
                         <div className={`${BOX_CONTENT_HEIGHT} overflow-y-auto custom-red-scrollbar`}>
                             {filteredRequests.length > 0 ? (
                                 filteredRequests.map((request) => (
                                     // Using the Link wrapper from your original code
                                     <Link
                                         key={request.id}
                                         href={`/news/${request.id}`} // Original href
                                         className="block border-b border-gray-200 last:border-b-0 request-item-link"
                                         aria-label={`View details for request ${request.id}`} // Original aria-label
                                     >
                                         {/* Original details layout inside the Link */}
                                         <div className="px-4 py-4 hover:bg-gray-50 active:bg-gray-100 text-black font-inter space-y-1 text-sm details-grid transition-colors duration-150">
                                             <p className="text-base mb-1">
                                                 <span className="font-bold">Request ID: </span>
                                                 <span className="text-red-600 font-bold">{request.id}</span>
                                             </p>
                                             {/* Original flex layout for details row 1 */}
                                             <div className="flex flex-wrap justify-between items-start">
                                                 <p className="w-full md:w-1/3 pr-4 mb-1 md:mb-0"><span>Name of Requester:</span> <span className="font-semibold">{request.requesterName}</span></p>
                                                 <p className="w-full md:w-1/3 px-0 md:px-4 mb-1 md:mb-0 text-left md:text-center"><span>Type of Calamity:</span> <span className="font-semibold">{request.calamityType}</span></p>
                                                 <p className="w-full md:w-1/3 pl-0 md:pl-4 text-left md:text-right"><span>Date:</span> {request.date}</p>
                                             </div>
                                             {/* Original flex layout for details row 2 */}
                                             <div className="flex flex-wrap justify-between items-start">
                                                 <div className="w-full md:w-1/3 pr-4 mb-1 md:mb-0">
                                                     <p><span>Contact Number:</span> <span className="font-semibold">{request.contactNumber}</span></p>
                                                     <p className="mt-1"><span>Location:</span> <span className="font-semibold">{request.location}</span></p>
                                                 </div>
                                                 <div className="w-full md:w-1/3 px-0 md:px-4 mb-1 md:mb-0 text-left md:text-center">
                                                     <p><span>Calamity Level:</span> <span className="font-semibold">{request.calamityLevel}</span></p>
                                                 </div>
                                                 <div className="w-full md:w-1/3 pl-0 md:pl-4 flex flex-col items-start md:items-end space-y-1 mt-1 md:mt-0">
                                                     <p><span>Time:</span> {request.time}</p>
                                                     {/* MODIFIED Delete Button: onClick calls initiateDelete */}
                                                     <button
                                                         onClick={(e) => {
                                                             e.preventDefault(); // Prevent Link navigation
                                                             e.stopPropagation(); // Stop event bubbling
                                                             initiateDelete(request.id, request.requesterName); // Use initiator function
                                                         }}
                                                         aria-label={`Delete request from ${request.requesterName}`} // Use name here
                                                         className="relative z-10 bg-red-700 text-white text-xs font-medium px-3 py-1 rounded hover:bg-red-800 active:bg-red-900 transition-colors"
                                                     >
                                                         Delete
                                                     </button>
                                                 </div>
                                             </div>
                                         </div>
                                     </Link>
                                 ))
                             ) : (
                                 <div className="p-10 text-center text-gray-500">No requests match the current filters.</div>
                             )}
                         </div>
                     </div>
                 </>
             )}

            {/* --- NEW: Render the Confirmation Modal --- */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={handleCancelDelete}     // Wire up cancel action
                onConfirm={handleConfirmDelete}   // Wire up confirm action
                requesterName={requestToDelete?.name || ''} // Pass the name
            />

        </div> // End of main container div
    );
};

export default AidRequestsPage;