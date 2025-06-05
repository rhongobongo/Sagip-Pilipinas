'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/Firebase/Firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc, 
  Timestamp as FirebaseTimestamp,
  FirestoreError,
} from 'firebase/firestore';

type RequestStatus =
  | 'pending_verification'
  | 'verified'
  | 'flagged'
  | 'rejected'
  | 'completed';

type RequestDetails = {
  id: string;
  requesterName: string; 
  contactNumber: string;
  location: string; 
  calamityType: string;
  calamityLevel: string;
  date: string; 
  time: string; 
  status: RequestStatus; 
  timestamp?: FirebaseTimestamp | string; 
  submissionDate?: string; 
  submissionTime?: string;
  address?: string;
  coordinates?: { latitude: number; longitude: number };

  imageURL?: string;
  verificationDocumentUrl?: string;
  shortDesc?: string;
  aidNeeded?: string;
  name?: string;
};

type TimestampParameter = FirebaseTimestamp | string | null | undefined;

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

const NavTab: React.FC<{ label: string; href: string; active?: boolean }> = ({ label, href, active = false }) => {
    const baseClasses = "py-1.5 px-6 text-sm font-bold rounded-full transition-all duration-200";
    const activeClasses = "bg-white text-red-800 shadow-sm";
    const inactiveClasses = "text-white hover:bg-red-700";
    return ( <a href={href} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}> {label} </a> );
};


interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const GenericConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
        <div className="mb-6 text-gray-700 text-sm">{message}</div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};


// Paste this into your AidRequestsPage.tsx or wherever VerificationModal is defined

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: RequestDetails | null; // Make sure RequestDetails is defined or imported
    onStatusChange: (requestId: string, newStatus: RequestStatus) => Promise<void>; // Make sure RequestStatus is defined
  }
  
  const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, request, onStatusChange }) => {
    if (!isOpen || !request) return null;
  
    const [currentStatus, setCurrentStatus] = useState<RequestStatus>(request.status);
    const [isUpdating, setIsUpdating] = useState(false);
  
    useEffect(() => {
      setCurrentStatus(request.status);
    }, [request]);
  
    const handleSaveStatus = async () => {
      setIsUpdating(true);
      try {
        await onStatusChange(request.id, currentStatus);
        onClose(); // Close modal on successful update
      } catch (error) {
        console.error("Error updating status from modal:", error);
        alert(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsUpdating(false);
      }
    };
  
    const statusOptions: RequestStatus[] = ['pending_verification', 'verified', 'flagged', 'rejected', 'completed'];
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[60] p-4">
        <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-red-scrollbar">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Request Details & Verification</h2> {/* Changed to gray-900 for stronger black */}
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-2xl">&times;</button> {/* Darker hover for close */}
          </div>
  
          {/* Added text-gray-800 for default text color in this content area */}
          <div className="space-y-3 text-sm text-gray-800">
            <p><strong>Request ID:</strong> {request.id}</p>
            <p><strong>Requester Name:</strong> {request.requesterName}</p>
            <p><strong>Contact Number:</strong> {request.contactNumber}</p>
            <p><strong>Location:</strong> {request.location}</p>
            {request.coordinates && <p><strong>Coordinates:</strong> Lat: {request.coordinates.latitude.toFixed(6)}, Lon: {request.coordinates.longitude.toFixed(6)}</p>}
            <p><strong>Calamity Type:</strong> {request.calamityType}</p>
            <p><strong>Calamity Level:</strong> {request.calamityLevel}</p>
            <p><strong>Date Submitted:</strong> {request.date} at {request.time}</p>
            <p><strong>Aid Needed:</strong> {request.aidNeeded || 'N/A'}</p>
            <div className="py-1">
              <strong className="text-gray-900">Description:</strong> 
              <p className="mt-1 p-2 bg-gray-50 border rounded text-xs whitespace-pre-wrap text-gray-700">{request.shortDesc || 'No description provided.'}</p>
            </div>
  
            {request.imageURL && (
              <div className="mt-2">
                <p className="font-semibold mb-1 text-gray-900">Situation Image:</p> 
                <a href={request.imageURL} target="_blank" rel="noopener noreferrer">
                  <img src={request.imageURL} alt="Situation" className="max-w-full h-auto max-h-60 border rounded object-contain"/>
                </a>
              </div>
            )}
  
            {request.verificationDocumentUrl && (
              <div className="mt-2">
                <p className="font-semibold mb-1 text-gray-900">Verification Document:</p> 
                {request.verificationDocumentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                   <a href={request.verificationDocumentUrl} target="_blank" rel="noopener noreferrer">
                      <img src={request.verificationDocumentUrl} alt="Verification Document" className="max-w-full h-auto max-h-60 border rounded object-contain"/>
                   </a>
                ) : (
                  <a
                    href={request.verificationDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-800 underline break-all"
                  >
                    View Document (PDF or other)
                  </a>
                )}
              </div>
            )}
  
            <div className="mt-4 pt-4 border-t">
              <label htmlFor="statusChange" className="block font-semibold mb-1 text-gray-900">Change Status:</label> 
              <select
                id="statusChange"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value as RequestStatus)}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-red-500 focus:border-red-500"
                disabled={isUpdating}
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt} className="text-gray-900">{opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>
  
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
              Close
            </button>
            <button
              onClick={handleSaveStatus}
              disabled={isUpdating || currentStatus === request.status}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:bg-gray-400"
            >
              {isUpdating ? 'Saving...' : 'Save Status'}
            </button>
          </div>
        </div>
      </div>
    );
  };


const AidRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [locationInput, setLocationInput] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<{ id: string; name: string } | null>(null);

  // State for Verification Modal
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [selectedRequestForVerification, setSelectedRequestForVerification] = useState<RequestDetails | null>(null);


  const welcomeHeaderBgColor = 'bg-red-800';
  const BOX_CONTENT_HEIGHT = 'h-[400px] sm:h-[450px]'; 

  const fetchData = useCallback(async () => {
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
      const fetchedRequests: RequestDetails[] = querySnapshot.docs.map((docSnapshot) => { 
        const data = docSnapshot.data();
        const { date, time } = formatDateTimeClient(data.timestamp, data.submissionDate, data.submissionTime);
        
        let location = 'Location Unavailable';
        if (data.coordinates && typeof data.coordinates.latitude === 'number' && typeof data.coordinates.longitude === 'number') {
          const lat = data.coordinates.latitude; const lon = data.coordinates.longitude;
          location = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
        } else if (data.address && typeof data.address === 'string') {
          location = data.address;
        }

        let status: RequestStatus = data.status as RequestStatus;
        if (!status || typeof status !== 'string' || !['pending_verification', 'verified', 'flagged', 'rejected', 'completed'].includes(status)) {
           if(status && (status as string) === 'pending' || (status as string) === 'approved') { 
                status = (status as string) === 'pending' ? 'pending_verification' : 'verified';
           } else {
             status = 'verified'; 
           }
        }


        return {
          id: docSnapshot.id,
          requesterName: data.name || 'N/A',
          contactNumber: data.contactNumber || 'N/A',
          location: location,
          calamityType: data.calamityType || 'N/A',
          calamityLevel: data.calamityLevel || 'N/A',
          date: date,
          time: time,
          status: status,
          timestamp: data.timestamp,
          submissionDate: data.submissionDate,
          submissionTime: data.submissionTime,
          address: data.address,
          coordinates: data.coordinates,
          imageURL: data.imageUrl || data.imageURL,
          verificationDocumentUrl: data.verificationDocumentUrl,
          shortDesc: data.shortDesc,
          aidNeeded: data.aidNeeded,
          name: data.name, 
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
  }, []); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    if (!db) {
      alert("Firestore not initialized.");
      throw new Error("Firestore not initialized.");
    }
    try {
      const requestDocRef = doc(db, "aidRequest", requestId);
      await updateDoc(requestDocRef, { status: newStatus });
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      
      throw error; 
    }
  };

  const openVerificationModal = (request: RequestDetails) => {
    setSelectedRequestForVerification(request);
    setIsVerificationModalOpen(true);
  };

  const closeVerificationModal = () => {
    setIsVerificationModalOpen(false);
    setSelectedRequestForVerification(null);
  };


  const disasterTypes = [...new Set(requests.map(request => request.calamityType).filter(Boolean))];
  const calamityLevels = [...new Set(requests.map(request => request.calamityLevel).filter(Boolean))];
  const dates = [...new Set(requests.map(request => request.date).filter(Boolean))];
  const statuses: RequestStatus[] = ['pending_verification', 'verified', 'flagged', 'rejected', 'completed'];

  const filterOptions = [
    { value: 'calamityType', label: 'Disaster Type', options: disasterTypes },
    { value: 'calamityLevel', label: 'Calamity Level', options: calamityLevels },
    { value: 'location', label: 'Location', options: [] }, 
    { value: 'date', label: 'Date', options: dates },
    { value: 'status', label: 'Status', options: statuses }
  ];

  const filteredRequests = requests.filter(request => {
    if (!filterType || !filterValue && filterType !== 'location') return true; 

    if (filterType === 'location') {
      return locationInput ? String(request.location || '').toLowerCase().includes(locationInput.toLowerCase()) : true;
    }

    if (filterValue) {
      const key = filterType as keyof Pick<RequestDetails, 'calamityType' | 'calamityLevel' | 'date' | 'status'>;
      if (key in request && request[key] !== undefined && request[key] !== null) {
        return String(request[key]).toLowerCase() === String(filterValue).toLowerCase();
      }
      return false;
    }
    return true; 
  });


  const initiateDelete = (id: string, name: string) => {
    setRequestToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!requestToDelete || !db) {
      alert("Error: Could not delete. Request details missing or Firestore not initialized.");
      setIsDeleteModalOpen(false);
      setRequestToDelete(null);
      return;
    }
    const { id, name } = requestToDelete;
    try {
      const requestDocRef = doc(db, "aidRequest", id);
      await deleteDoc(requestDocRef);
      setRequests(prevRequests => prevRequests.filter(r => r.id !== id));
      alert(`Request from ${name} successfully deleted.`);
    } catch (err: FirestoreError | unknown) {
      console.error("Error deleting document:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to delete request from ${name}: ${errorMessage}`);
    } finally {
      setIsDeleteModalOpen(false);
      setRequestToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setRequestToDelete(null);
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'pending_verification': return 'text-yellow-600 bg-yellow-100';
      case 'verified': return 'text-green-600 bg-green-100';
      case 'flagged': return 'text-red-600 bg-red-100';
      case 'rejected': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };


  return (
    <div className="w-full min-h-screen p-2 sm:p-4 font-inter bg-gray-100">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .custom-red-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-red-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-red-scrollbar::-webkit-scrollbar-thumb { background: #DC2626; border-radius: 10px; }
        .custom-red-scrollbar::-webkit-scrollbar-thumb:hover { background: #B91C1C; }
        .custom-red-scrollbar { scrollbar-width: thin; scrollbar-color: #DC2626 #f1f1f1; }
        html { scroll-behavior: smooth; }
      `}</style>

      <div className={`${welcomeHeaderBgColor} p-4 sm:p-6 rounded-lg mb-6 text-white shadow relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 rounded-full bg-red-700 opacity-30 transform translate-x-1/4 -translate-y-1/4" aria-hidden="true"></div>
        <div className="absolute top-5 right-10 sm:top-10 sm:right-20 w-20 h-20 sm:w-40 sm:h-40 rounded-full bg-red-600 opacity-20" aria-hidden="true"></div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 relative z-10">Admin Verification Panel</h1>
        <p className="text-xs sm:text-sm text-gray-200 font-medium relative z-10 mb-4 text-center">
          Review, verify, and manage all incoming aid requests.
        </p>
        <div className="flex flex-wrap justify-center items-center mt-4 space-x-2 sm:space-x-4 relative z-10">
          <NavTab label="Review Requests" href="/admin/review-requests" active/>
          <NavTab label="Dashboard" href="/admin/analytics" />
          <NavTab label="News Articles" href="/admin/news" />
          <NavTab label="Organizations" href="/admin/organizations" />
          <NavTab label="Volunteers" href="/admin/volunteers" />
        </div>
      </div>

      <div className="flex flex-wrap items-center mb-4 sm:mb-6 gap-2">
        <span className="text-gray-700 font-medium text-sm sm:text-base">Filter by:</span>
        <select
          aria-label="Filter type"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setFilterValue('');
            setLocationInput('');
          }}
          className="border border-gray-300 rounded px-2 py-1.5 text-xs sm:text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
        >
          <option value="">Select Filter Type</option>
          {filterOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
        </select>
        {filterType && filterType !== 'location' && (
          <select
            aria-label={`Filter value for ${filterType}`}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs sm:text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Select {filterOptions.find(opt => opt.value === filterType)?.label}</option>
            {filterOptions.find(opt => opt.value === filterType)?.options.map(optionValue => (
              <option key={String(optionValue)} value={String(optionValue)}>
                {filterType === 'status' ? String(optionValue).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : String(optionValue)}
              </option>
            ))}
          </select>
        )}
        {filterType === 'location' && (
          <input
            type="text"
            aria-label="Filter by location"
            placeholder="Enter Location Keyword"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs sm:text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 w-full sm:w-auto"
          />
        )}
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-gray-600">Loading requests...</div>
      ) : error ? (
        <div className="p-10 text-center text-red-600 border border-red-300 bg-red-50 rounded">
          <p className="font-semibold">Error Loading Data</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Aid Requests ({filteredRequests.length})</h2>
            </div>
            <div className={`${BOX_CONTENT_HEIGHT} overflow-y-auto custom-red-scrollbar`}>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="block border-b border-gray-200 last:border-b-0"
                  >
                    <div className="px-3 sm:px-4 py-3 hover:bg-gray-50 active:bg-gray-100 text-gray-800 font-inter space-y-1 text-xs sm:text-sm transition-colors duration-150">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm sm:text-base font-semibold">
                          <span className="text-gray-600">ID: </span>
                          <span className="text-red-600">{request.id.substring(0,10)}...</span>
                        </p>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-1">
                        <div><span>Requester:</span> <span className="font-semibold">{request.requesterName}</span></div>
                        <div className="md:text-center"><span>Calamity:</span> <span className="font-semibold">{request.calamityType} ({request.calamityLevel})</span></div>
                        <div className="md:text-right"><span>Date:</span> {request.date} {request.time}</div>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-1">
                        <div><span>Contact:</span> <span className="font-semibold">{request.contactNumber}</span></div>
                        <div className="md:text-center" title={request.location}>
                          <span>Location:</span> <span className="font-semibold truncate inline-block max-w-[150px] sm:max-w-[200px] align-bottom">{request.location}</span>
                        </div>
                         <div className="flex flex-col sm:flex-row justify-start md:justify-end items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-1 md:mt-0">
                            <button
                                onClick={() => openVerificationModal(request)}
                                aria-label={`Verify request from ${request.requesterName}`}
                                className="bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded hover:bg-blue-700 active:bg-blue-800 transition-colors w-full sm:w-auto"
                            >
                                View & Verify
                            </button>
                            <button
                                onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                initiateDelete(request.id, request.requesterName);
                                }}
                                aria-label={`Delete request from ${request.requesterName}`}
                                className="bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded hover:bg-red-700 active:bg-red-800 transition-colors w-full sm:w-auto"
                            >
                                Delete
                            </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-gray-500">No requests match the current filters.</div>
              )}
            </div>
          </div>
        </>
      )}

      <GenericConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={<p>Are you sure you want to delete the request from <span className="font-bold">{requestToDelete?.name || ''}</span>? This action cannot be undone.</p>}
        confirmButtonText="Confirm Delete"
      />

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={closeVerificationModal}
        request={selectedRequestForVerification}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default AidRequestsPage;