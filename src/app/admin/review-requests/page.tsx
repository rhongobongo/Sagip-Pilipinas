'use client';
import React, { useState } from 'react';

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
};

// Predefined Aid Types
const AID_TYPES = [
    'Medical Supplies',
    'Clothes',
    'Shelter',
    'Food',
    'Water'
];

// Mock data (with a few extra entries to demonstrate scrolling)
const mockRequests: RequestDetails[] = [
    { id: '1006-2365-22', requesterName: 'Mark John A. Toroy', contactNumber: '0912-345-6789', location: 'DAS, Lutopan, Toledo City, Cebu', calamityType: 'Earthquake', aidType: 'Medical Supplies, Shelter', date: 'March 24, 2025', time: '9:12 PM' },
    { id: '1023-2687-25', requesterName: 'Sarah Jane Cruz', contactNumber: '0998-765-4321', location: 'Cebu City, Cebu', calamityType: 'Flood', aidType: 'Food, Water', date: 'March 25, 2025', time: '2:45 PM' },
    { id: '1045-3698-30', requesterName: 'Juan dela Cruz', contactNumber: '0923-456-7890', location: 'Davao City, Davao', calamityType: 'Typhoon', aidType: 'Shelter, Medical Supplies, Clothes', date: 'March 26, 2025', time: '11:30 AM' },
    { id: '1055-4708-35', requesterName: 'Maria Garcia', contactNumber: '0934-567-8901', location: 'Mandaue City, Cebu', calamityType: 'Fire', aidType: 'Clothes, Shelter, Food', date: 'March 27, 2025', time: '08:00 AM' },
    { id: '1065-5819-40', requesterName: 'Peter Lim', contactNumber: '0945-678-9012', location: 'Lapu-Lapu City, Cebu', calamityType: 'Flood', aidType: 'Water, Medical Supplies', date: 'March 27, 2025', time: '10:15 AM' },
    { id: '1075-6920-45', requesterName: 'Ana Santos', contactNumber: '0956-789-0123', location: 'Talisay City, Cebu', calamityType: 'Earthquake', aidType: 'Food, Shelter', date: 'March 27, 2025', time: '01:00 PM' },
];

const AidRequestsList: React.FC = () => {
    const [activeTab, setActiveTab] = useState('All Aid Requests');
    const [filterType, setFilterType] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [locationInput, setLocationInput] = useState('');

    // Get unique filter options
    const disasterTypes = [...new Set(mockRequests.map(request => request.calamityType))];
    const dates = [...new Set(mockRequests.map(request => request.date))];

    // Filter options configuration
    const filterOptions = [
        { value: 'calamityType', label: 'Disaster Type', options: disasterTypes },
        { value: 'aidType', label: 'Aid Type', options: AID_TYPES },
        { value: 'location', label: 'Location', options: [] }, // Location uses text input
        { value: 'date', label: 'Date', options: dates }
    ];

    // Filter requests based on selected criteria
    const filteredRequests = mockRequests.filter(request => {
        if (filterType && filterType !== 'location') {
            if (filterType === 'aidType') {
                return request.aidType.includes(filterValue);
            }
            const key = filterType as keyof RequestDetails;
             if (key in request) {
                 // Ensure comparison happens correctly
                 return String(request[key]) === String(filterValue);
             }
             return false;
        }
        if (filterType === 'location' && locationInput) {
            return request.location.toLowerCase().includes(locationInput.toLowerCase());
        }
        return true; // Show all if no filter or only location filter type selected but no input
    });

    return (
        <div className="w-full h-full p-4 font-inter">
            {/* Global styles including Inter font and custom scrollbar */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

                /* Custom Red Scrollbar Styles */
                .custom-red-scrollbar::-webkit-scrollbar {
                    width: 8px; /* Width of the scrollbar */
                }

                .custom-red-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1; /* Track color */
                    border-radius: 10px;
                }

                .custom-red-scrollbar::-webkit-scrollbar-thumb {
                    background: #DC2626; /* Red thumb color (Tailwind red-600) */
                    border-radius: 10px; /* Rounded corners */
                }

                .custom-red-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #B91C1C; /* Darker red on hover (Tailwind red-700) */
                }

                /* Firefox Scrollbar Styles */
                .custom-red-scrollbar {
                    scrollbar-width: thin; /* "auto" or "thin" */
                    scrollbar-color: #DC2626 #f1f1f1; /* thumb track */
                }
            `}</style>

            {/* Filter By Section */}
            <div className="flex items-center mb-4 space-x-2">
                <span className="text-gray-600 mr-2">Filter by:</span>
                {/* Filter Type Dropdown */}
                <select
                    value={filterType}
                    onChange={(e) => {
                        setFilterType(e.target.value);
                        setFilterValue(''); // Reset specific filter value when type changes
                        setLocationInput(''); // Reset location input when type changes
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-gray-600 bg-gray-100"
                >
                   <option value="">Select Filter Type</option>
                   {filterOptions.map(option => (
                       <option key={option.value} value={option.value}>
                           {option.label}
                        </option>
                    ))}
                </select>

                {/* Filter Value Dropdown (for non-location types) */}
                {filterType && filterType !== 'location' && (
                   <select
                       value={filterValue}
                       onChange={(e) => setFilterValue(e.target.value)}
                       className="border border-gray-300 rounded px-2 py-1 text-gray-600 bg-gray-100"
                    >
                      <option value="">Select {filterOptions.find(opt => opt.value === filterType)?.label}</option>
                      {filterOptions
                        .find(opt => opt.value === filterType)
                        ?.options.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))
                      }
                   </select>
                )}

                {/* Location Input */}
                {filterType === 'location' && (
                    <input
                        type="text"
                        placeholder="Enter Location"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-gray-600 bg-gray-100 w-64"
                    />
                )}
            </div>

            {/* Main Container with Tabs and List */}
            {/* UPDATED: Changed border-gray-300 to border-orange-500 */}
            <div className="border border-orange-500 rounded-lg overflow-hidden w-full">
                {/* Tabs */}
                <div className="flex w-full h-[61px] bg-white">
                    {['All Aid Requests', 'Pending Requests', 'Approved Requests', 'Completed Requests'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 text-gray-600 ${
                                activeTab === tab
                                ? 'bg-red-600 text-white rounded-l-[30px] rounded-r-[30px]'
                                : 'hover:bg-gray-100'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Scrollable Content Area */}
                {/* UPDATED: Changed max-h[...] to fixed h-[420px] */}
                <div className="h-[420px] overflow-y-auto custom-red-scrollbar">
                    {filteredRequests.map((request, index) => (
                        // Container for a single request item - Row-based layout
                        <div
                            key={index}
                            className="px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 text-black text-[16px] font-inter space-y-1" // space-y adds vertical spacing between rows
                        >
                            {/* Row 1: Request ID */}
                            <p>
                                <span className="font-bold">Request ID:</span> <span className="text-red-600 font-bold">{request.id}</span>
                            </p>

                            {/* Row 2: Name (Left), Calamity (Center), Date (Right) */}
                            <div className="flex justify-between items-start">
                                <p className="w-1/3 pr-4"> {/* Adjust width/padding as needed */}
                                    Name of Requester: <span className="font-bold">{request.requesterName}</span>
                                </p>
                                <p className="w-1/3 text-center px-4"> {/* Adjust width/padding as needed */}
                                    Type of Calamity: <span className="font-bold">{request.calamityType}</span>
                                </p>
                                <p className="w-1/3 text-right pl-4"> {/* Adjust width/padding as needed */}
                                    Date: <span className="font-bold">{request.date}</span>
                                </p>
                            </div>

                             {/* Row 3: Contact (Left), Aid Type (Center), Time (Right) */}
                             <div className="flex justify-between items-start">
                                <p className="w-1/3 pr-4"> {/* Adjust width/padding as needed */}
                                    Contact Number: <span className="font-bold">{request.contactNumber}</span>
                                </p>
                                <p className="w-1/3 text-center px-4"> {/* Adjust width/padding as needed */}
                                    Aid Type Request: <span className="font-bold">{request.aidType}</span>
                                </p>
                                <p className="w-1/3 text-right pl-4"> {/* Adjust width/padding as needed */}
                                    Time: <span className="font-bold">{request.time}</span>
                                </p>
                             </div>

                            {/* Row 4: Location */}
                            <p>
                                Location: <span className="font-bold">{request.location}</span>
                            </p>
                        </div>
                    ))}

                     {/* Message shown if no requests match the current filter */}
                     {filteredRequests.length === 0 && (
                        <div className="px-4 py-10 text-center text-gray-500">
                            No requests match the current filter criteria.
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
}

export default AidRequestsList;