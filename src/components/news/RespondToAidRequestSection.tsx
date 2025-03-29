"use client";

import React from 'react';

interface RespondToAidRequestSectionProps {
  aidRequestId: string;
  distance: number | null;
  organizationName: string;
}

const RespondToAidRequestSection: React.FC<RespondToAidRequestSectionProps> = ({ 
  aidRequestId, 
  distance, 
  organizationName 
}) => {
  // Client-side event handler
  const handleSendHelp = () => {
    alert(`(Placeholder) Button clicked for aid request: ${aidRequestId}. Implement actual action.`);
  };
  
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-2">Respond to this Request</h3>
      <p className="text-sm mb-1">
        This aid request is located approximately <span className="font-bold">{distance?.toFixed(1) ?? 'N/A'} km</span> from your organization&apos;s registered location ({organizationName}).
      </p>
      <p className="text-sm mb-3">
        Your assistance may be valuable here. Would you like to assess this request further or initiate a response?
      </p>
      <button
        onClick={handleSendHelp}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out"
      >
        Send Help / Respond
      </button>
    </div>
  );
};

export default RespondToAidRequestSection;