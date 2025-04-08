'use client';
import React, { useState, useRef } from 'react';

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
    status?: 'pending' | 'approved' | 'completed'; // Example status field
};

// Predefined Aid Types
const AID_TYPES = [
    'Medical Supplies',
    'Clothes',
    'Shelter',
    'Food',
    'Water'
];

// Mock data - Add example statuses
const mockRequests: RequestDetails[] = [
    { id: '1006-2365-22', requesterName: 'Mark John A. Toroy', contactNumber: '0912-345-6789', location: 'DAS, Lutopan, Toledo City, Cebu', calamityType: 'Earthquake', aidType: 'Medical Supplies, Shelter', date: 'March 24, 2025', time: '9:12 PM', status: 'pending' },
    { id: '1023-2687-25', requesterName: 'Sarah Jane Cruz', contactNumber: '0998-765-4321', location: 'Cebu City, Cebu', calamityType: 'Flood', aidType: 'Food, Water', date: 'March 25, 2025', time: '2:45 PM', status: 'pending' },
    { id: '1045-3698-30', requesterName: 'Juan dela Cruz', contactNumber: '0923-456-7890', location: 'Davao City, Davao', calamityType: 'Typhoon', aidType: 'Shelter, Medical Supplies, Clothes', date: 'March 26, 2025', time: '11:30 AM', status: 'approved' },
    { id: '1055-4708-35', requesterName: 'Maria Garcia', contactNumber: '0934-567-8901', location: 'Mandaue City, Cebu', calamityType: 'Fire', aidType: 'Clothes, Shelter, Food', date: 'March 27, 2025', time: '08:00 AM', status: 'pending' },
    { id: '1065-5819-40', requesterName: 'Peter Lim', contactNumber: '0945-678-9012', location: 'Lapu-Lapu City, Cebu', calamityType: 'Flood', aidType: 'Water, Medical Supplies', date: 'March 27, 2025', time: '10:15 AM', status: 'completed' },
    { id: '1075-6920-45', requesterName: 'Ana Santos', contactNumber: '0956-789-0123', location: 'Talisay City, Cebu', calamityType: 'Earthquake', aidType: 'Food, Shelter', date: 'March 27, 2025', time: '01:00 PM', status: 'pending' },
];


const AidRequestsList: React.FC = () => {
    // State and Filter Logic
    const [filterType, setFilterType] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [locationInput, setLocationInput] = useState('');
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
                generalFilterPass = request.aidType.split(',').some(type => type.trim() === filterValue);
            } else {
                 const key = filterType as keyof RequestDetails;
                 if (key in request) { generalFilterPass = String(request[key]) === String(filterValue); } else { generalFilterPass = false; }
            }
        } else if (filterType === 'location' && locationInput) {
            generalFilterPass = request.location.toLowerCase().includes(locationInput.toLowerCase());
        }
        return generalFilterPass;
    });
    const pendingRequests = generallyFilteredRequests.filter(request => request.status === 'pending');
    const allFilteredRequests = generallyFilteredRequests;

    // Header background color
    const headerBgColor = '#8F0022';

    return (
        <div className="w-full h-full p-4 font-inter">
            {/* Global styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                /* Custom Scrollbar Styles */
                .custom-red-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-red-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-red-scrollbar::-webkit-scrollbar-thumb { background: #DC2626; border-radius: 10px; }
                .custom-red-scrollbar::-webkit-scrollbar-thumb:hover { background: #B91C1C; }
                .custom-red-scrollbar { scrollbar-width: thin; scrollbar-color: #DC2626 #f1f1f1; }
                html { scroll-behavior: smooth; }
            `}</style>

             {/* Header Section */}
             <div className={`bg-[${headerBgColor}] p-6 rounded-lg mb-6 text-white`}>
                 <h1 className="text-3xl font-bold mb-2">Hello Admin!</h1>
                 <p className="text-sm text-gray-200 mb-4 font-bold">
                     Track real-time insights and performance metrics to make informed decisions. Explore user activity, disaster reports, and aid distribution data all in one place.
                 </p>
             </div>

            {/* Filter By Section */}
            <div className="flex items-center mb-4 space-x-2">
                <span className="text-gray-600 mr-2">Filter by:</span>
                <select
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value); setFilterValue(''); setLocationInput(''); }}
                    className="border border-gray-300 rounded px-2 py-1 text-gray-600 bg-gray-100"
                >
                   <option value="">Select Filter Type</option>
                   {filterOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
                {filterType && filterType !== 'location' && (
                    <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-gray-600 bg-gray-100">
                      <option value="">Select {filterOptions.find(opt => opt.value === filterType)?.label}</option>
                      {filterOptions.find(opt => opt.value === filterType)?.options.map(option => (<option key={option} value={option}>{option}</option>))}
                    </select>
                )}
                {filterType === 'location' && (<input type="text" placeholder="Enter Location" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-gray-600 bg-gray-100 w-64"/> )}
            </div>

            {/* Navigation Links */}
            <div className="flex w-full h-[61px] bg-white border-2 border-orange-500 rounded-lg mb-6 overflow-hidden">
                <a href="#all-requests-section" className="flex-1 text-gray-600 hover:bg-gray-100 flex items-center justify-center border-r border-gray-200"> All Aid Requests </a>
                <a href="#pending-requests-section" className="flex-1 text-gray-600 hover:bg-gray-100 flex items-center justify-center border-r border-gray-200"> Pending Requests </a>
                <a href="#approved-requests-section" className="flex-1 text-gray-600 hover:bg-gray-100 flex items-center justify-center border-r border-gray-200"> Approved Requests </a>
                <a href="#completed-requests-section" className="flex-1 text-gray-600 hover:bg-gray-100 flex items-center justify-center"> Completed Requests </a>
            </div>

            {/* === Section 1: All Aid Requests === */}
            <section id="all-requests-section" className="mb-8">
                 <h2 className="text-xl font-semibold mb-3 text-gray-800">All Aid Requests</h2>
                 <div className="border-2 border-gray-300 rounded-lg overflow-hidden w-full">
                     <div className="h-[300px] overflow-y-auto custom-red-scrollbar">
                         {allFilteredRequests.map((request, index) => (
                             <div key={`${request.id}-all-${index}`} className="px-4 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 odd:bg-gray-50 text-black font-inter space-y-1">
                                 <p className="text-[16px]"><span className="font-bold">Request ID:</span> <span className="text-red-600 font-bold">{request.id}</span></p>
                                 <div className="flex justify-between items-start">
                                     <p className="w-1/3 pr-4 text-sm"><span className="font-bold">Name of Requester:</span> {request.requesterName}</p>
                                     <p className="w-1/3 px-4 text-center text-sm"><span className="font-bold">Type of Calamity:</span> {request.calamityType}</p>
                                     <p className="w-1/3 pl-4 text-right text-sm"><span className="font-bold">Date:</span> {request.date}</p>
                                 </div>
                                 <div className="flex justify-between items-start">
                                     <p className="w-1/3 pr-4 text-sm"><span className="font-bold">Contact Number:</span> {request.contactNumber}</p>
                                     <p className="w-1/3 px-4 text-center text-sm"><span className="font-bold">Aid Type Request:</span> {request.aidType}</p>
                                     <p className="w-1/3 pl-4 text-right text-sm"><span className="font-bold">Time:</span> {request.time}</p>
                                 </div>
                                 <p className="text-[16px]"><span className="font-bold">Location:</span> {request.location}</p>
                             </div>
                         ))}
                         {allFilteredRequests.length === 0 && ( <div className="px-4 py-10 text-center text-gray-500"> No requests match the current filter criteria. </div> )}
                     </div>
                 </div>
            </section>

            {/* === Section 2: Pending Requests === */}
            <section id="pending-requests-section" className="mb-8">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">Pending Requests</h2>
                 <div className="border-2 border-gray-300 rounded-lg overflow-hidden w-full">
                    <div className="h-[300px] overflow-y-auto custom-red-scrollbar">
                         {pendingRequests.map((request, index) => (
                              <div key={`${request.id}-pending-${index}`} className="px-4 py-4 border-b border-gray-200 last:border-b-0 odd:bg-gray-50 font-inter flex justify-between items-start space-x-4 text-black">
                                 {/* Column 1: Basic Info */}
                                 <div className="w-2/5 pr-4 space-y-1 text-sm">
                                     <p className="text-[16px]"><span className="font-bold">Request ID:</span> <span className="text-red-600 font-bold">{request.id}</span></p>
                                     <p><span className="font-bold">Name of Requester:</span> {request.requesterName}</p>
                                     <p><span className="font-bold">Contact Number:</span> {request.contactNumber}</p>
                                     <p><span className="font-bold">Location:</span> {request.location}</p>
                                 </div>
                                 {/* Column 2: Calamity Info */}
                                 <div className="w-2/5 px-4 space-y-1 text-sm">
                                     <p><span className="font-bold">Type of Calamity:</span> {request.calamityType}</p>
                                     <p><span className="font-bold">Aid Type Request:</span> {request.aidType}</p>
                                 </div>
                                 {/* Column 3: Actions - Styled as per image_a550d1.png */}
                                 <div className="w-1/5 pl-4 flex flex-col space-y-2 items-stretch">
                                     <div>
                                         <label htmlFor={`org-select-${request.id}`} className="block text-sm font-medium text-gray-700 mb-1">Organization:</label>
                                         <select
                                             id={`org-select-${request.id}`}
                                             name="organization"
                                             className="block w-full pl-3 pr-10 py-1.5 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-full bg-red-600 text-white appearance-none" // Fully rounded, maroon bg
                                         >
                                             <option className="bg-white text-black">Select Org...</option> {/* Need style for options */}
                                             <option className="bg-white text-black">Org A</option>
                                             <option className="bg-white text-black">Org B</option>
                                         </select>
                                     </div>
                                     <div className='w-full flex space-x-2'>
                                         <button className="flex-1 bg-[#8F0022] hover:bg-[#7a001c] text-white text-sm font-medium py-1 px-3 rounded-md"> {/* Maroon bg, medium round */}
                                             Deny
                                         </button>
                                         <button className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-1 px-3 rounded-md"> {/* Green bg, medium round */}
                                             Approve
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         ))}
                         {pendingRequests.length === 0 && ( <div className="px-4 py-10 text-center text-gray-500"> No pending requests match the current filter criteria. </div> )}
                     </div>
                 </div>
            </section>

            {/* Placeholder sections */}
            <section id="approved-requests-section"></section>
            <section id="completed-requests-section"></section>
        </div>
    );
}

export default AidRequestsList;