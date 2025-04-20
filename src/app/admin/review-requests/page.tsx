'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/Firebase/Firebase';
import { collection, getDocs, query, orderBy, doc, deleteDoc, Timestamp as ClientTimestamp } from 'firebase/firestore';

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
};

function formatDateTimeClient(timestamp: any, dateStr?: string, timeStr?: string): { date: string; time: string } {
    let finalDate = dateStr || '';
    let finalTime = timeStr || '';
    if (timestamp && typeof timestamp.toDate === 'function') {
        const dateObj = timestamp.toDate();
        finalDate = dateObj.toLocaleDateString('en-CA');
        finalTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (typeof timestamp === 'string') {
        const parts = timestamp.split(' at ');
        if (parts.length === 2) {
            if (!dateStr) finalDate = parts[0];
            if (!timeStr) finalTime = parts[1].replace(/ UTC\+\d+$/, '');
        } else if (!dateStr) { finalDate = timestamp; }
    } else if (dateStr && timeStr) { finalDate = dateStr; finalTime = timeStr; }
    finalDate = finalDate || 'N/A'; finalTime = finalTime || 'N/A';
    return { date: finalDate, time: finalTime };
}


const SECTION_IDS = {
    ALL: 'all-requests-section',
    COMPLETED: 'completed-requests-section',
};

const NavTab: React.FC<{ label: string; href: string; active?: boolean }> = ({ label, href, active = false }) => {
    const baseClasses = "py-1.5 px-6 text-sm font-bold rounded-full transition-all duration-200";
    const activeClasses = "bg-white text-red-800 shadow-sm";
    const inactiveClasses = "text-white hover:bg-red-700";
    return ( <a href={href} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}> {label} </a> );
};

type RequestListHeaderProps = {
    activeTab: 'All Aid Requests' | 'Completed Requests';
    onNavClick: (sectionId: string) => void;
};
const RequestListHeader: React.FC<RequestListHeaderProps> = ({ activeTab, onNavClick }) => {
    const tabs = [ { id: SECTION_IDS.ALL, label: 'All Aid Requests' }, { id: SECTION_IDS.COMPLETED, label: 'Completed Requests' }];
    const containerBgColor = 'bg-red-300';
    const activeTabBgColor = 'bg-red-700';
    const inactiveTabTextColor = 'text-red-900';
    const activeTabTextColor = 'text-white';
    const getTabClass = (tabLabel: string) => {
        const baseClasses = "py-1.5 px-6 text-sm font-semibold cursor-pointer transition-all duration-200 ease-in-out rounded-full";
        const isActive = activeTab === tabLabel;
        const activeClasses = `${activeTabBgColor} ${activeTabTextColor} shadow-sm`;
        const inactiveClasses = `${inactiveTabTextColor} hover:bg-red-300`;
        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
    };
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        event.preventDefault();
        onNavClick(sectionId);
    };
    return (
        <div className={`inline-flex items-center p-1 ${containerBgColor} rounded-full space-x-2`}>
            {tabs.map(tab => (
                <a key={tab.id} href={`#${tab.id}`} onClick={(e) => handleClick(e, tab.id)} className={`${getTabClass(tab.label)}`}>
                    {tab.label}
                </a>
            ))}
        </div>
    );
};


const AidRequestsPage: React.FC = () => {
    // State Hooks
    const [requests, setRequests] = useState<RequestDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [locationInput, setLocationInput] = useState('');

    const welcomeHeaderBgColor = 'bg-red-800';
    const BOX_CONTENT_HEIGHT = 'h-[350px]';

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
                        const lat = data.coordinates.latitude;
                        const lon = data.coordinates.longitude;
                        location = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                    }
                    else if (data.address && typeof data.address === 'string') {
                        location = data.address;
                    }
                    else if (data.coordinates) {
                        console.warn(`Unexpected coordinates format for doc ${doc.id}:`, data.coordinates);
                    }

                    // ==================================================
                    // FIXME: Implement Real Logic for STATUS Below
                    const status: RequestDetails['status'] = data.status as RequestDetails['status'] || 'pending';
                    // ==================================================

                    return {
                        id: doc.id,
                        requesterName: data.name || 'N/A',
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

            } catch (err: any) {
                console.error("Error fetching aid requests:", err);
                setError(`Failed to load requests: ${err.message || 'Please check console.'}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Filtering Logic ---
    const disasterTypes = [...new Set(requests.map(request => request.calamityType).filter(Boolean))];
    const calamityLevels = [...new Set(requests.map(request => request.calamityLevel).filter(Boolean))];
    const dates = [...new Set(requests.map(request => request.date).filter(Boolean))];
    const filterOptions = [ { value: 'calamityType', label: 'Disaster Type', options: disasterTypes }, { value: 'calamityLevel', label: 'Calamity Level', options: calamityLevels }, { value: 'location', label: 'Location', options: [] }, { value: 'date', label: 'Date', options: dates } ];
    const generallyFilteredRequests = requests.filter(request => { let generalFilterPass = true; if (filterType && filterType !== 'location' && filterValue) { const key = filterType as keyof Pick<RequestDetails, 'calamityType' | 'calamityLevel' | 'date'>; if (key in request && request[key] !== undefined && request[key] !== null) { generalFilterPass = String(request[key]).toLowerCase() === String(filterValue).toLowerCase(); } else { generalFilterPass = false; } } else if (filterType === 'location' && locationInput) { generalFilterPass = String(request.location || '').toLowerCase().includes(locationInput.toLowerCase()); } return generalFilterPass; });
    const allFilteredRequests = generallyFilteredRequests;
    // Filtering for completed requests depends on the 'status' logic above being correct
    const completedRequests = generallyFilteredRequests.filter(request => request.status === 'completed');


    const handleNavClick = (sectionId: string) => { const element = document.getElementById(sectionId); setTimeout(() => { element?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); };
    const handleDelete = async (idToDelete: string) => { if (!db) { alert("Firestore not initialized."); return; } if (window.confirm(`Delete request ${idToDelete}?`)) { try { const requestDocRef = doc(db, "aidRequest", idToDelete); await deleteDoc(requestDocRef); setRequests(prevRequests => prevRequests.filter(r => r.id !== idToDelete)); alert(`Request ${idToDelete} deleted.`); } catch (err: any) { console.error("Error deleting: ", err); alert(`Failed to delete: ${err.message}`); } } };

    return (
        <div className="w-full h-full p-4 font-inter bg-gray-50">
            {/* Global styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                .custom-red-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-red-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-red-scrollbar::-webkit-scrollbar-thumb { background: #DC2626; border-radius: 10px; }
                .custom-red-scrollbar::-webkit-scrollbar-thumb:hover { background: #B91C1C; }
                .custom-red-scrollbar { scrollbar-width: thin; scrollbar-color: #DC2626 #f1f1f1; }
                html { scroll-behavior: smooth; }
                .scroll-target { scroll-margin-top: 20px; }
                .request-item-link .details-grid { transition: background-color 0.2s ease-in-out; }
                .request-item-link:hover .details-grid { background-color: #f9fafb; }
                .request-item-link:active .details-grid { background-color: #f3f4f6; }
            `}</style>

            {/* Integrated Main Header Section */}
            <div className={'bg-red-800 p-6 rounded-lg mb-6 text-white shadow relative overflow-hidden'}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-700 opacity-30 transform translate-x-1/4 -translate-y-1/4" aria-hidden="true"></div>
                <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-red-600 opacity-20" aria-hidden="true"></div>
                <h1 className="text-3xl font-bold mb-2 relative z-10">Hello Admin!</h1>
                <p className="text-medium text-gray-200 font-medium relative z-10 mb-4 text-center"> Track real-time insights and performance metrics to make informed decisions. Explore user activity, disaster reports, and aid distribution data all in one place. </p>
                <div className="flex flex-wrap justify-center items-center mt-4 space-x-4 relative z-10">
                    <NavTab label="Review Requests" href="/admin/review-requests" active />
                    <NavTab label="Dashboard" href="/admin/analytics" />
                    <NavTab label="News Articles" href="/admin/news" />
                    <NavTab label="Organizations" href="/admin/organizations" />
                    <NavTab label="Volunteers" href="/admin/volunteers" />
                </div>
            </div>

            {/* Filter Controls Section */}
            <div className="flex flex-wrap items-center mb-6 gap-y-2 gap-x-2 sm:gap-x-4">
                <span className="text-gray-600 font-medium w-full sm:w-auto flex-shrink-0">Filter by:</span>
                <select aria-label="Filter type" value={filterType} onChange={(e) => { setFilterType(e.target.value); setFilterValue(''); setLocationInput(''); }} className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 flex-grow sm:flex-grow-0">
                    <option value="">Select Filter Type</option>
                    {filterOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
                {filterType && filterType !== 'location' && (
                    <select aria-label={`Filter value for ${filterType}`} value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 flex-grow sm:flex-grow-0">
                        <option value="">Select {filterOptions.find(opt => opt.value === filterType)?.label}</option>
                        {filterOptions.find(opt => opt.value === filterType)?.options.map(option => (<option key={option} value={option}>{option}</option>))}
                    </select>
                )}
                {filterType === 'location' && (
                    <input type="text" aria-label="Filter by location" placeholder="Enter Location" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 w-full sm:w-64 flex-grow sm:flex-grow-0" />
                )}
            </div>

            {/* Conditional Rendering for Loading/Error/Content */}
            {isLoading ? (
                <div className="p-10 text-center text-gray-600">Loading requests...</div>
            ) : error ? (
                <div className="p-10 text-center text-red-600 border border-red-300 bg-red-50 rounded">
                    <p className="font-semibold">Error Loading Data</p>
                    <p>{error}</p>
                </div>
            ) : (
                <>
                    {/* === Box 1: All Aid Requests List === */}
                    <div id={SECTION_IDS.ALL} className="scroll-target mb-8 bg-white rounded-lg border-2 border-orange-500 shadow-sm overflow-hidden">
                        <div className="flex justify-center items-center px-4 py-3 border-b border-gray-200 bg-white rounded-t-lg">
                            <RequestListHeader activeTab="All Aid Requests" onNavClick={handleNavClick} />
                        </div>
                        <div className={`${BOX_CONTENT_HEIGHT} overflow-y-auto custom-red-scrollbar`}>
                            {allFilteredRequests.length > 0 ? (
                                allFilteredRequests.map((request) => (
                                    <Link
                                        key={request.id}
                                        href={`/news/${request.id}`} // Corrected href
                                        className="block border-b border-gray-200 last:border-b-0 request-item-link"
                                        aria-label={`View details for request ${request.id}`}
                                    >
                                        <div className="px-4 py-4 hover:bg-gray-50 active:bg-gray-100 text-black font-inter space-y-1 text-sm details-grid transition-colors duration-150">
                                            {/* Row 1 */}
                                            <p className="text-base mb-1"><span className="font-bold">Request ID: </span> <span className="text-red-600 font-bold">{request.id}</span></p>
                                            {/* Row 2 */}
                                            <div className="flex flex-wrap justify-between items-start">
                                                <p className="w-full md:w-1/3 pr-4 mb-1 md:mb-0"><span>Name of Requester:</span> <span className="font-semibold">{request.requesterName}</span></p>
                                                <p className="w-full md:w-1/3 px-0 md:px-4 mb-1 md:mb-0 text-left md:text-center"><span>Type of Calamity:</span> <span className="font-semibold">{request.calamityType}</span></p>
                                                <p className="w-full md:w-1/3 pl-0 md:pl-4 text-left md:text-right"><span>Date:</span> {request.date}</p>
                                            </div>
                                            {/* Row 3 */}
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
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(request.id); }}
                                                        aria-label={`Delete request ${request.id}`}
                                                        className="relative z-10 bg-red-700 text-white text-xs font-medium px-3 py-1 rounded hover:bg-red-800 active:bg-red-900 transition-colors"
                                                    > Delete </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : ( <div className="p-10 text-center text-gray-500">No requests match the current filters.</div> )}
                        </div>
                    </div>

                    {/* === Box 2: Completed Requests List === */}
                    <div id={SECTION_IDS.COMPLETED} className="scroll-target mb-8 bg-white rounded-lg border-2 border-orange-500 shadow-sm overflow-hidden">
                        <div className="flex justify-center items-center px-4 py-3 border-b border-gray-200 bg-white rounded-t-lg">
                            <RequestListHeader activeTab="Completed Requests" onNavClick={handleNavClick} />
                        </div>
                        <div className={`${BOX_CONTENT_HEIGHT} overflow-y-auto custom-red-scrollbar`}>
                            {completedRequests.length > 0 ? (
                                completedRequests.map((request) => (
                                    <Link
                                        key={request.id}
                                        href={`/news/${request.id}`}
                                        className="block border-b border-gray-200 last:border-b-0 request-item-link"
                                        aria-label={`View details for request ${request.id}`}
                                    >
                                        <div className="px-4 py-4 hover:bg-gray-50 active:bg-gray-100 text-black font-inter text-sm details-grid transition-colors duration-150">
                                            <p className="text-base mb-2"> <span className="font-bold">Request ID: </span> <span className="text-red-600 font-bold">{request.id}</span> </p>
                                            <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-x-4 gap-y-1">
                                                <div className="w-full md:w-2/5 space-y-1"> <p><span>Name:</span> <span className="font-bold">{request.requesterName}</span></p> <p><span>Contact:</span> <span className="font-bold">{request.contactNumber}</span></p> <p><span>Location:</span> <span className="font-bold">{request.location}</span></p> </div>
                                                <div className="w-full md:w-2/5 space-y-1 md:pl-2"> <p><span>Calamity:</span> <span className="font-bold">{request.calamityType}</span></p> <p><span>Level:</span> <span className="font-bold">{request.calamityLevel}</span></p> <p><span>Date Completed:</span> <span className="font-bold">{request.date}</span></p> <p><span>Time:</span> <span className="font-bold">{request.time}</span></p> </div>
                                                <div className="w-full md:w-1/5 flex items-center justify-start md:justify-end md:pl-4 text-left mt-1 md:mt-0"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"> <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> </svg> <span className='ml-1.5 font-bold text-green-600'> Completed! </span> </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : ( <div className="p-10 text-center text-gray-500">No completed requests match the current filters.</div> )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AidRequestsPage;