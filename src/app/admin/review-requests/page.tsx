'use client';
import React, { useState } from 'react';

// Define Section IDs as constants for consistency
const SECTION_IDS = {
  ALL: 'all-requests-section',
  PENDING: 'pending-requests-section',
  APPROVED: 'approved-requests-section',
  COMPLETED: 'completed-requests-section',
};

// --- Reusable Header Component (For Inside Boxes, but with Clickable Nav) ---
type RequestListHeaderProps = {
  activeTab: 'All Aid Requests' | 'Pending Requests' | 'Approved Requests' | 'Completed Requests'; // Which tab to highlight
  onNavClick: (sectionId: string) => void; // Function to handle click/scroll
};

const RequestListHeader: React.FC<RequestListHeaderProps> = ({ activeTab, onNavClick }) => {
  const tabs = [
    { id: SECTION_IDS.ALL, label: 'All Aid Requests' },
    { id: SECTION_IDS.PENDING, label: 'Pending Requests' },
    { id: SECTION_IDS.APPROVED, label: 'Approved Requests' },
    { id: SECTION_IDS.COMPLETED, label: 'Completed Requests' },
  ];
  const activeBgColor = 'bg-red-700'; // Adjusted to red-700 as seen in user's code paste
  const activeBorderColor = 'border-red-700'; // Matching border

  const getTabClass = (tabId: string) => {
    // Base classes: Oblong shape, padding, transitions, transparent border, pointer cursor
    const baseClasses = "py-1.5 px-6 text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out rounded-full border-2 border-transparent";

    // Inactive tab style
    const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:border-gray-300";

    // Active tab style (based on the 'activeTab' prop matching the tab's label)
    const activeClasses = `${activeBgColor} text-white ${activeBorderColor} shadow`;

    // Check if the current tab's LABEL matches the activeTab prop for styling
    const currentTabLabel = tabs.find(t => t.id === tabId)?.label;
    return `${baseClasses} ${activeTab === currentTabLabel ? activeClasses : inactiveClasses}`;
  };

  // Handle click: prevent default anchor jump, call parent handler
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      event.preventDefault();
      onNavClick(sectionId); // Trigger scroll/action defined in parent
  };

  return (
    // Container for the header tabs: Evenly spaced
    <div className="flex w-full flex-wrap sm:flex-nowrap justify-around items-center border-b border-gray-200 px-2 sm:px-4 py-3 bg-white rounded-t-lg">
      {tabs.map(tab => (
        // Use anchor tags for navigation
        <a
          key={tab.id}
          href={`#${tab.id}`} // href for semantic meaning/fallback
          onClick={(e) => handleClick(e, tab.id)} // Click triggers page scroll
          className={`${getTabClass(tab.id)} mb-1 sm:mb-0 text-center`} // Style based on activeTab prop
        >
          {tab.label}
        </a>
      ))}
    </div>
  );
};
// --- End Reusable Header Component ---


// TypeScript type for request details
type RequestDetails = {
    id: string;
    requesterName: string;
    contactNumber: string;
    location: string;
    calamityType: string;
    aidType: string;
    date: string;
    time: string;
    status?: 'pending' | 'approved' | 'completed'; // Status field
};

// Predefined Aid Types
const AID_TYPES = [
    'Medical Supplies',
    'Clothes',
    'Shelter',
    'Food',
    'Water'
];

// Mock data - Ensure examples for all statuses
const mockRequests: RequestDetails[] = [
    { id: '1006-2365-22', requesterName: 'Mark John A. Toroy', contactNumber: '0912-345-6789', location: 'DAS, Lutopan, Toledo City, Cebu', calamityType: 'Earthquake', aidType: 'Medical Supplies, Shelter', date: 'March 24, 2025', time: '9:12 PM', status: 'pending' },
    { id: '1023-2687-25', requesterName: 'Sarah Jane Cruz', contactNumber: '0998-765-4321', location: 'Cebu City, Cebu', calamityType: 'Flood', aidType: 'Food, Water', date: 'March 25, 2025', time: '2:45 PM', status: 'pending' },
    { id: '1045-3698-30', requesterName: 'Juan dela Cruz', contactNumber: '0923-456-7890', location: 'Davao City, Davao', calamityType: 'Typhoon', aidType: 'Shelter, Medical Supplies, Clothes', date: 'March 26, 2025', time: '11:30 AM', status: 'approved' },
    { id: '1055-4708-35', requesterName: 'Maria Garcia', contactNumber: '0934-567-8901', location: 'Mandaue City, Cebu', calamityType: 'Fire', aidType: 'Clothes, Shelter, Food', date: 'March 27, 2025', time: '08:00 AM', status: 'pending' },
    { id: '1065-5819-40', requesterName: 'Peter Lim', contactNumber: '0945-678-9012', location: 'Lapu-Lapu City, Cebu', calamityType: 'Flood', aidType: 'Water, Medical Supplies', date: 'March 27, 2025', time: '10:15 AM', status: 'completed' },
    { id: '1075-6920-45', requesterName: 'Ana Santos', contactNumber: '0956-789-0123', location: 'Talisay City, Cebu', calamityType: 'Earthquake', aidType: 'Food, Shelter', date: 'March 27, 2025', time: '01:00 PM', status: 'pending' },
    { id: '1085-7031-50', requesterName: 'John Doe', contactNumber: '0911-222-3333', location: 'Manila City', calamityType: 'Flood', aidType: 'Food, Clothes', date: 'March 28, 2025', time: '10:00 AM', status: 'approved' },
    { id: '1095-8142-55', requesterName: 'Jane Smith', contactNumber: '0922-333-4444', location: 'Quezon City', calamityType: 'Fire', aidType: 'Shelter', date: 'March 28, 2025', time: '11:30 AM', status: 'approved' },
    { id: '1105-9253-60', requesterName: 'Robert Brown', contactNumber: '0933-444-5555', location: 'Cebu City, Cebu', calamityType: 'Typhoon', aidType: 'Water', date: 'March 29, 2025', time: '02:00 PM', status: 'completed' },
];

// Main Component
const AidRequestsList: React.FC = () => {
    // State and Filter Logic
    const [filterType, setFilterType] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [locationInput, setLocationInput] = useState('');
    // No 'activeSection' state needed here for styling, highlighting is local to each header

    // Filtering logic
    const disasterTypes = [...new Set(mockRequests.map(request => request.calamityType))];
    const dates = [...new Set(mockRequests.map(request => request.date))];
    const filterOptions = [
        { value: 'calamityType', label: 'Disaster Type', options: disasterTypes },
        { value: 'aidType', label: 'Aid Type', options: AID_TYPES },
        { value: 'location', label: 'Location', options: [] },
        { value: 'date', label: 'Date', options: dates }
    ];

    const generallyFilteredRequests = mockRequests.filter(request => {
         let generalFilterPass = true;
        if (filterType && filterType !== 'location') {
            if (filterType === 'aidType') {
                const requestedAidTypes = request.aidType.split(',').map(type => type.trim());
                generalFilterPass = requestedAidTypes.includes(filterValue);
            } else {
                const key = filterType as keyof Pick<RequestDetails, 'requesterName' | 'contactNumber' | 'location' | 'calamityType' | 'date' | 'time'>;
                 if (key in request && typeof request[key] === 'string') {
                    generalFilterPass = String(request[key]).toLowerCase() === String(filterValue).toLowerCase();
                 } else if (filterType === 'date') {
                    generalFilterPass = request.date === filterValue;
                 } else {
                    generalFilterPass = false;
                 }
            }
        } else if (filterType === 'location' && locationInput) {
            generalFilterPass = request.location.toLowerCase().includes(locationInput.toLowerCase());
        }
        return generalFilterPass;
    });

    // Create lists based on status *after* general filtering
    const allFilteredRequests = generallyFilteredRequests;
    const pendingRequests = generallyFilteredRequests.filter(request => request.status === 'pending');
    const approvedRequests = generallyFilteredRequests.filter(request => request.status === 'approved');
    const completedRequests = generallyFilteredRequests.filter(request => request.status === 'completed');

    const welcomeHeaderBgColor = 'bg-red-800'; // Define the class name
    const BOX_CONTENT_HEIGHT = 'h-[350px]'; // Define height for consistency

    // Function to handle navigation clicks and scroll the page
    const handleNavClick = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        setTimeout(() => {
            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    };

    return (
        <div className="w-full h-full p-4 font-inter bg-gray-50"> {/* Page background */}
            {/* Global styles */}
            <style jsx global>{`
                 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                 /* Custom Scrollbar Styles */
                 .custom-red-scrollbar::-webkit-scrollbar { width: 8px; }
                 .custom-red-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                 .custom-red-scrollbar::-webkit-scrollbar-thumb { background: #DC2626; /* red-500 */ border-radius: 10px; }
                 .custom-red-scrollbar::-webkit-scrollbar-thumb:hover { background: #B91C1C; /* red-700 */ }
                 .custom-red-scrollbar { scrollbar-width: thin; scrollbar-color: #DC2626 #f1f1f1; }
                 /* Smooth scrolling for the whole page */
                 html { scroll-behavior: smooth; }
                 /* Offset scroll target slightly (adjust value if needed) */
                 .scroll-target { scroll-margin-top: 20px; }
             `}</style>

             {/* Welcome Header Section */}
             <div className={`${welcomeHeaderBgColor} p-6 rounded-lg mb-6 text-white shadow`}>
                 <h1 className="text-3xl font-bold mb-2">Hello Admin!</h1>
                 <p className="text-sm text-gray-200 font-medium">
                      Track real-time insights and performance metrics to make informed decisions. Explore user activity, disaster reports, and aid distribution data all in one place.
                 </p>
             </div>

            {/* Filter By Section */}
             <div className="flex flex-wrap items-center mb-6 gap-y-2 gap-x-2 sm:gap-x-4">
                <span className="text-gray-600 font-medium w-full sm:w-auto flex-shrink-0">Filter by:</span>
                <select
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value); setFilterValue(''); setLocationInput(''); }}
                    className="border border-gray-300 rounded px-2 py-1.5 text-gray-600 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 flex-grow sm:flex-grow-0"
                >
                   <option value="">Select Filter Type</option>
                   {filterOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
                {filterType && filterType !== 'location' && (
                    <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-gray-600 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 flex-grow sm:flex-grow-0">
                       <option value="">Select {filterOptions.find(opt => opt.value === filterType)?.label}</option>
                       {filterOptions.find(opt => opt.value === filterType)?.options.map(option => (<option key={option} value={option}>{option}</option>))}
                    </select>
                )}
                {filterType === 'location' && (<input type="text" placeholder="Enter Location" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-gray-600 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 w-full sm:w-64 flex-grow sm:flex-grow-0"/> )}
            </div>


            {/* === Box 1: All Aid Requests === */}
             {/* Orange border, unique layout */}
            <div id={SECTION_IDS.ALL} className="scroll-target mb-8 bg-white rounded-lg border-2 border-orange-500 shadow-sm overflow-hidden">
                <RequestListHeader
                    activeTab="All Aid Requests"
                    onNavClick={handleNavClick}
                />
                <div className={`${BOX_CONTENT_HEIGHT} overflow-y-auto custom-red-scrollbar`}>
                    {allFilteredRequests.length > 0 ? (
                        allFilteredRequests.map((request, index) => (
                            // Layout specific to Box 1
                            <div key={`${request.id}-all-${index}`} className="px-4 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 text-black font-inter space-y-1 text-sm">
                                <p className="text-base mb-1"><span className="font-bold">Request ID: </span> <span className="text-red-600 font-bold">{request.id}</span></p>
                                <div className="flex flex-wrap justify-between items-start">
                                    <p className="w-full md:w-1/3 pr-4 mb-1 md:mb-0"><span>Name of Requester:</span> <span className="font-semibold">{request.requesterName}</span></p>
                                    <p className="w-full md:w-1/3 px-0 md:px-4 mb-1 md:mb-0 text-left md:text-center"><span>Type of Calamity:</span> <span className="font-semibold">{request.calamityType}</span></p>
                                    <p className="w-full md:w-1/3 pl-0 md:pl-4 text-left md:text-right"><span>Date:</span> {request.date}</p>
                                </div>
                                <div className="flex flex-wrap justify-between items-start">
                                    <div className="w-full md:w-1/3 pr-4 mb-1 md:mb-0">
                                        <p><span>Contact Number:</span> <span className="font-semibold">{request.contactNumber}</span></p>
                                        <p className="mt-1"><span>Location:</span> <span className="font-semibold">{request.location}</span></p>
                                    </div>
                                    <div className="w-full md:w-1/3 px-0 md:px-4 mb-1 md:mb-0 text-left md:text-center">
                                        <p><span>Aid Type Request:</span> <span className="font-semibold">{request.aidType}</span></p>
                                    </div>
                                    <div className="w-full md:w-1/3 pl-0 md:pl-4 text-left md:text-right">
                                        <p><span>Time:</span> {request.time}</p>
                                        <p className="capitalize mt-1">
                                            <span className="font-semibold">Status: </span>
                                            <span className={`font-semibold ${ request.status === 'pending' ? 'text-orange-500' : request.status === 'approved' ? 'text-green-500' : request.status === 'completed' ? 'text-blue-500' : 'text-gray-500' }`}>{request.status || 'N/A'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                         ))
                     ) : ( <div className="p-10 text-center text-gray-500">No requests match filters.</div> )}
                </div>
            </div>

            {/* === Box 2: Pending Requests === */}
             {/* Orange border, specific layout with adjusted actions */}
             <div id={SECTION_IDS.PENDING} className="scroll-target mb-8 bg-white rounded-lg border-2 border-orange-500 shadow-sm overflow-hidden">
                <RequestListHeader
                    activeTab="Pending Requests"
                    onNavClick={handleNavClick}
                />
                <div className={`${BOX_CONTENT_HEIGHT} overflow-y-auto custom-red-scrollbar`}>
                    {pendingRequests.length > 0 ? (
                        pendingRequests.map((request, index) => (
                            <div key={`${request.id}-pending-${index}`} className="px-4 py-4 border-b border-gray-200 last:border-b-0 odd:bg-gray-50 font-inter flex flex-wrap md:flex-nowrap justify-between items-start gap-x-4 gap-y-3 text-black text-sm">

                                {/* Left/Middle Info Section (Combined) */}
                                <div className="w-full md:flex-grow space-y-1">
                                    <p className="text-base mb-1"><span className="font-bold">Request ID:</span> <span className="text-red-600 font-bold">{request.id}</span></p>
                                    <div className="flex flex-wrap md:flex-nowrap items-start">
                                        <p className="w-full md:w-1/2 pr-2 mb-1 md:mb-0"><span>Name of Requester:</span> <span className="font-semibold">{request.requesterName}</span></p>
                                        <p className="w-full md:w-1/2 md:pl-2"><span>Type of Calamity:</span> <span className="font-semibold">{request.calamityType}</span></p>
                                    </div>
                                    <div className="flex flex-wrap md:flex-nowrap items-start mt-1">
                                        <p className="w-full md:w-1/2 pr-2 mb-1 md:mb-0"><span>Contact Number:</span> <span className="font-semibold">{request.contactNumber}</span></p>
                                        <p className="w-full md:w-1/2 md:pl-2"><span>Aid Type Request:</span> <span className="font-semibold">{request.aidType}</span></p>
                                    </div>
                                    <div className="flex items-start mt-1">
                                         <p className="w-full"><span>Location:</span> <span className="font-semibold">{request.location}</span></p>
                                    </div>
                                </div>

                                {/* Right Actions Section (Updated button container styling) */}
                                <div className="w-full md:w-auto flex flex-col space-y-2 items-stretch md:min-w-[240px] flex-shrink-0 md:pl-4">
                                    <div>
                                        <label htmlFor={`org-select-${request.id}`} className="block text-xs text-gray-700 mb-1">Organization:</label>
                                        <select
                                            id={`org-select-${request.id}`}
                                            name="organization"
                                            className="block w-full pl-3 pr-8 py-1.4 text-sm border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-md bg-red-700 text-white appearance-none"
                                        >
                                            <option className="bg-white text-black">Select Org...</option>
                                            <option className="bg-white text-black">Red Cross Cebu</option>
                                            <option className="bg-white text-black">DSWD Region 7</option>
                                            <option className="bg-white text-black">Local LGU</option>
                                        </select>
                                    </div>
                                    {/* Updated button container: justify-end, space-x-3 */}
                                    <div className='w-full flex justify-end space-x-3'>
                                        {/* Buttons use py-1 px-2.5, no flex-1 */}
                                        <button className="bg-red-800 hover:bg-red-900 text-white text-xs font-medium py-1 px-2.5 rounded-lg transition-colors">Deny</button>
                                        {/* Approve button uses lime color */}
                                        <button className="bg-green-500 hover:bg-green-500 text-white text-xs font-medium py-1 px-2.5 rounded-lg transition-colors">Approve</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : ( <div className="p-10 text-center text-gray-500">No pending requests match filters.</div> )}
                </div>
            </div>

             {/* === Box 3: Approved Requests === */}
            {/* Orange border, CORRECTED 3-column layout based on image_91f6b5.png */}
            <div id={SECTION_IDS.APPROVED} className="scroll-target mb-8 bg-white rounded-lg border-2 border-orange-500 shadow-sm overflow-hidden">
                <RequestListHeader
                    activeTab="Approved Requests"
                    onNavClick={handleNavClick}
                />
                <div className={`${BOX_CONTENT_HEIGHT} overflow-y-auto custom-red-scrollbar`}>
                    {approvedRequests.length > 0 ? (
                         approvedRequests.map((request, index) => (
                            // ****** CORRECTED LAYOUT FOR THIS BOX ******
                            <div key={`${request.id}-approved-${index}`} className="px-4 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 text-black font-inter text-sm">
                                {/* Row 1: Request ID (Full Width) */}
                                <p className="text-base mb-2"> {/* Added bottom margin */}
                                    <span className="font-bold">Request ID: </span>
                                    <span className="text-red-600 font-bold">{request.id}</span>
                                </p>

                                {/* Row 2: Three Columns Container */}
                                <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-x-4 gap-y-1"> {/* Reduced gap-y */}

                                    {/* Column 1: Basic Info */}
                                    {/* Width adjusted slightly, check vs column 2 */}
                                    <div className="w-full md:w-2/5 space-y-1">
                                        <p><span>Name of Requester:</span> <span className="font-bold">{request.requesterName}</span></p>
                                        <p><span>Contact Number:</span> <span className="font-bold">{request.contactNumber}</span></p>
                                        <p><span>Location:</span> <span className="font-bold">{request.location}</span></p>
                                    </div>

                                    {/* Column 2: Calamity/Aid Info */}
                                     {/* Width adjusted slightly, check vs column 1 */}
                                    <div className="w-full md:w-2/5 space-y-1 md:pl-2">
                                        <p><span>Type of Calamity:</span> <span className="font-bold">{request.calamityType}</span></p>
                                        <p><span>Aid Type Request:</span> <span className="font-bold">{request.aidType}</span></p>
                                    </div>

                                     {/* Column 3: Status (Takes remaining space) */}
                                     {/* Width allows it to take remaining space */}
                                    <div className="w-full md:w-1/5 space-y-1 md:pl-4 text-left"> {/* Adjusted width, text-left */}
                                         <p className="capitalize">
                                             <span className="text-gray-600">Status: </span> {/* Label normal gray */}
                                             <span className='font-bold text-black'> {/* Data bold black */}
                                                 {request.status ? `${request.status.charAt(0).toUpperCase() + request.status.slice(1)}` : 'N/A'}
                                                 {/* Simulation logic */}
                                                 {request.status === 'approved' ? (index % 3 === 0 ? ' - Ongoing' : (index % 3 === 1 ? ' - Preparing' : ' - Going to Site')) : ''}
                                             </span>
                                         </p>
                                     </div>
                                </div>
                            </div>
                           // ****** END OF CORRECTED LAYOUT ******
                         ))
                     ) : ( <div className="p-10 text-center text-gray-500">No approved requests match filters.</div> )}
                </div>
            </div>

             {/* === Box 4: Completed Requests === */}
            {/* Orange border, Updated 3-column layout based on image_9189f4.png */}
            <div id={SECTION_IDS.COMPLETED} className="scroll-target mb-8 bg-white rounded-lg border-2 border-orange-500 shadow-sm overflow-hidden">
                <RequestListHeader
                    activeTab="Completed Requests"
                    onNavClick={handleNavClick}
                />
                 <div className={`${BOX_CONTENT_HEIGHT} overflow-y-auto custom-red-scrollbar`}>
                    {completedRequests.length > 0 ? (
                         completedRequests.map((request, index) => (
                            // ****** UPDATED LAYOUT FOR THIS BOX ******
                            <div key={`${request.id}-completed-${index}`} className="px-4 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 text-black font-inter text-sm">
                                {/* Row 1: Request ID (Full Width) */}
                                <p className="text-base mb-2">
                                    <span className="font-bold">Request ID: </span>
                                    <span className="text-red-600 font-bold">{request.id}</span>
                                </p>

                                {/* Row 2: Three Columns Container */}
                                <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-x-4 gap-y-1">

                                    {/* Column 1: Basic Info */}
                                    <div className="w-full md:w-2/5 space-y-1">
                                        <p><span>Name of Requester:</span> <span className="font-bold">{request.requesterName}</span></p>
                                        <p><span>Contact Number:</span> <span className="font-bold">{request.contactNumber}</span></p>
                                        <p><span>Location:</span> <span className="font-bold">{request.location}</span></p>
                                    </div>

                                    {/* Column 2: Calamity/Aid Info */}
                                    <div className="w-full md:w-2/5 space-y-1 md:pl-2">
                                        <p><span>Type of Calamity:</span> <span className="font-bold">{request.calamityType}</span></p>
                                        <p><span>Aid Type Request:</span> <span className="font-bold">{request.aidType}</span></p>
                                    </div>

                                     {/* Column 3: Status Icon & Text */}
                                    <div className="w-full md:w-1/5 flex items-center md:pl-4 text-left"> {/* Use flex items-center */}
                                         {/* Checkmark Icon (Inline SVG) */}
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                         </svg>
                                         {/* Completed Text */}
                                         <span className='ml-1.5 font-bold text-green-600'> {/* Added margin-left */}
                                             Completed!
                                         </span>
                                     </div>
                                </div>
                                {/* "Completed On" (request.date) removed */}
                            </div>
                           // ****** END OF UPDATED LAYOUT ******
                         ))
                     ) : ( <div className="p-10 text-center text-gray-500">No completed requests match filters.</div> )}
                 </div>
             </div>

        </div> // End of main page container
    );
}

export default AidRequestsList;