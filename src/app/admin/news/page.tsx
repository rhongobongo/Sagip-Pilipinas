'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/Firebase/Firebase'; // Ensure this path is correct
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc, Timestamp as FirebaseTimestamp, FirestoreError } from 'firebase/firestore';

// Define the structure for a news item (aid request)
type NewsItem = {
    id: string;
    requesterName: string;
    contactNumber: string;
    location: string;
    calamityType: string;
    calamityLevel: string; // Stored as string (e.g., "1", "2", "3", "4", "5")
    shortDesc?: string;
    date: string;
    time: string;
    status?: 'pending' | 'approved' | 'completed';
    imageUrl?: string;
    coordinates?: { latitude: number; longitude: number; };
    timestamp?: FirebaseTimestamp | string; // Firestore Timestamp or string fallback
    submissionDate?: string; // Fallback date string
    submissionTime?: string; // Fallback time string
};

// Helper function to format date and time consistently
function formatDateTimeClient(timestamp: FirebaseTimestamp | string | null | undefined, dateStr?: string, timeStr?: string): { date: string; time: string } {
    let finalDate = dateStr || '';
    let finalTime = timeStr || '';

    // Prefer Firestore Timestamp if available
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
        const dateObj = timestamp.toDate();
        finalDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        finalTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    // Handle specific string format (e.g., "Month Day, Year at HH:MM:SS AM/PM UTC±X")
    else if (typeof timestamp === 'string' && timestamp.includes(' at ') && timestamp.includes(' UTC')) {
        const parts = timestamp.split(' at ');
        if (parts.length === 2) {
            if (!dateStr) finalDate = parts[0]; // Use the date part if dateStr isn't provided
            if (!timeStr) { // Use the time part if timeStr isn't provided
                const timePartMatch = parts[1].match(/^(\d{1,2}:\d{2}(?::\d{2})?\s*[AP]M)/i); // Extract HH:MM AM/PM
                if (timePartMatch) {
                    finalTime = timePartMatch[1];
                } else {
                    // Fallback: remove UTC info if AM/PM format isn't found
                    finalTime = parts[1].replace(/\s*UTC[\+\-]\d+$/, '');
                }
            }
        }
    }
    // Handle generic string timestamp or just date/time strings provided
    else if (typeof timestamp === 'string' && !finalDate) {
        finalDate = timestamp; // Use the string as date if nothing else worked
    } else if (dateStr && timeStr) {
        // Use provided strings if timestamp parsing failed or wasn't applicable
        finalDate = dateStr;
        finalTime = timeStr;
    }

    // Attempt to reformat date string if it's not in MM/DD/YYYY format
    try {
        if (finalDate && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(finalDate)) {
            const d = new Date(finalDate);
            if (!isNaN(d.getTime())) { // Check if date is valid
                finalDate = d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            }
        }
    } catch (e) { /* Ignore date parsing errors */ }

    // Default fallbacks
    finalDate = finalDate || 'N/A';
    finalTime = finalTime || 'N/A';

    return { date: finalDate, time: finalTime };
}


// Navigation Tab Component
const NavTab: React.FC<{ label: string; href: string; active?: boolean }> = ({ label, href, active = false }) => {
    const baseClasses = "py-1.5 px-6 text-sm font-bold rounded-full transition-all duration-200";
    const activeClasses = "bg-white text-red-800 shadow-sm";
    const inactiveClasses = "text-white hover:bg-red-700";
    return (
        <a href={href} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            {label}
        </a>
    );
};

// Confirmation Modal Props Interface
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    requesterName: string;
}

// Confirmation Modal Component for Deletion
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, requesterName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Confirm Deletion</h3>
                <p className="mb-6 text-gray-700">
                    Are you sure you want to delete the request from <span className="font-bold">{requesterName}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors text-sm font-medium">Cancel</button>
                    <button onClick={onConfirm} type="button" className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium">Confirm Delete</button>
                </div>
            </div>
        </div>
    );
};

// Edit Modal Props Interface
interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<NewsItem>) => void;
    item: NewsItem | null;
}

// Edit Modal Component
const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState<Partial<NewsItem>>({});

    useEffect(() => {
        if (item) {
            setFormData({
                requesterName: item.requesterName,
                contactNumber: item.contactNumber,
                calamityType: item.calamityType,
                // *** MODIFIED: Ensure level is treated as string for select value matching ***
                calamityLevel: String(item.calamityLevel || ''),
                shortDesc: item.shortDesc || '',
                status: item.status || 'pending',
                location: item.location // Display only, not editable
            });
        } else {
             setFormData({}); // Reset form data when no item is selected
        }
    }, [item]); // Re-run effect when the item to edit changes

    if (!isOpen || !item) return null; // Don't render if not open or no item

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ // Pass only the editable fields back
            requesterName: formData.requesterName,
            contactNumber: formData.contactNumber,
            calamityType: formData.calamityType,
            calamityLevel: formData.calamityLevel, // This will be the string "1", "2", "3", "4", or "5"
            shortDesc: formData.shortDesc,
            status: formData.status,
        });
    };

    // Dropdown options for Calamity Type
    const calamityTypeOptions = [
        { value: "flood", label: "Flood" },
        { value: "earthquake", label: "Earthquake" },
        { value: "fire", label: "Fire" },
        { value: "typhoon", label: "Typhoon" },
        { value: "landslide", label: "Landslide" },
        { value: "volcanic eruption", label: "Volcanic Eruption" },
        { value: "tsunami", label: "Tsunami" },
        { value: "other", label: "Other" },
    ];

    // *** FIXED: Dropdown options for Calamity Level (1-5) ***
    const calamityLevelOptions = [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
    ];
    // --- END FIXED VALUES ---

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full my-8"> {/* Allow vertical scrolling within modal if content overflows */}
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-semibold text-gray-900">Edit Request Details</h3>
                     <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-4">
                     {/* Requester Name & Contact */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label htmlFor="requesterName" className="block text-sm font-medium text-gray-700 mb-1">Requester Name</label>
                             <input type="text" id="requesterName" name="requesterName" value={formData.requesterName || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" required />
                         </div>
                         <div>
                             <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                             <input type="text" id="contactNumber" name="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                         </div>
                     </div>

                     {/* Calamity Type & Level */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label htmlFor="calamityType" className="block text-sm font-medium text-gray-700 mb-1">Calamity Type</label>
                             <select id="calamityType" name="calamityType" value={formData.calamityType || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" required >
                                 <option value="">Select Calamity Type</option>
                                 {calamityTypeOptions.map(opt => (
                                     <option key={opt.value} value={opt.value}>{opt.label}</option>
                                 ))}
                             </select>
                         </div>
                         <div>
                             <label htmlFor="calamityLevel" className="block text-sm font-medium text-gray-700 mb-1">Calamity Level</label>
                             {/* Uses the FIXED calamityLevelOptions */}
                             <select id="calamityLevel" name="calamityLevel" value={formData.calamityLevel || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" required >
                                 <option value="">Select Calamity Level</option>
                                 {calamityLevelOptions.map(opt => (
                                     <option key={opt.value} value={opt.value}>{opt.label}</option> // Label is now "1", "2", etc.
                                 ))}
                             </select>
                         </div>
                     </div>

                     {/* Location (Read-Only) */}
                     <div>
                         <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Address/Location (Read-only)</label>
                         <input type="text" id="location" name="location" value={formData.location || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none focus:ring-0 text-gray-600" />
                     </div>

                     {/* Description */}
                     <div>
                         <label htmlFor="shortDesc" className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                         <textarea id="shortDesc" name="shortDesc" value={formData.shortDesc || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                     </div>

                     {/* Status */}
                     <div>
                         <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                         <select id="status" name="status" value={formData.status || 'pending'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" >
                             <option value="pending">Pending</option>
                             <option value="approved">Approved</option>
                             <option value="completed">Completed</option>
                         </select>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex justify-end space-x-3 pt-4">
                         <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors text-sm font-medium">Cancel</button>
                         <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium">Save Changes</button>
                     </div>
                 </form>
            </div>
        </div>
    );
};


// Main Page Component for displaying and managing news articles (aid requests)
const NewsArticlePage: React.FC = () => {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // For potential navigation

    // State for Modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<NewsItem | null>(null);

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // Function to fetch aid requests from Firestore
    const fetchData = async () => {
        if (!db) {
            setError("Firestore is not available. Check Firebase configuration.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const requestsRef = collection(db, 'aidRequest');
            // Order by timestamp descending to show newest first
            const q = query(requestsRef, orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);

            const fetchedRequests: NewsItem[] = querySnapshot.docs.map((doc) => {
                const data = doc.data();

                // Format date/time using helper
                const { date, time } = formatDateTimeClient(data.timestamp, data.submissionDate, data.submissionTime);

                // Parse location information (prioritize details, then address, then coordinates)
                let locationString = 'Location Unavailable';
                let coordinates: { latitude: number; longitude: number; } | undefined = undefined;
                if (data.locationDetails?.city || data.locationDetails?.province) {
                    locationString = [data.locationDetails.city, data.locationDetails.province, data.locationDetails.region].filter(Boolean).join(', ');
                } else if (data.address && typeof data.address === 'string') {
                    locationString = data.address;
                } else if (data.coordinates && typeof data.coordinates.latitude === 'number' && typeof data.coordinates.longitude === 'number') {
                    const lat = data.coordinates.latitude; const lon = data.coordinates.longitude;
                    locationString = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                    coordinates = { latitude: lat, longitude: lon };
                } else if (data.coordinates && typeof data.coordinates === 'string') { // Handle string coordinates like "lat, lon"
                    const match = data.coordinates.match(/(\-?\d+\.?\d*)\s*[°]?\s*[NS]?,\s*(\-?\d+\.?\d*)\s*[°]?\s*[EW]?/i);
                    if (match && match.length === 3) {
                        const lat = parseFloat(match[1]); const lon = parseFloat(match[2]);
                        if (!isNaN(lat) && !isNaN(lon)) {
                            locationString = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                            coordinates = { latitude: lat, longitude: lon };
                        }
                    }
                }

                // Validate status
                const status: NewsItem['status'] = ['pending', 'approved', 'completed'].includes(data.status) ? data.status : 'pending';
                const shortDesc: string = data.shortDesc || ''; // Ensure description is a string

                // Construct the NewsItem object
                return {
                    id: doc.id,
                    requesterName: data.name || data.requesterName || 'N/A', // Handle potential field name difference
                    contactNumber: data.contactNumber || 'N/A',
                    location: locationString,
                    calamityType: data.calamityType || 'N/A',
                    // *** MODIFIED: Ensure level from Firestore is treated as string ***
                    calamityLevel: String(data.calamityLevel || 'N/A'),
                    shortDesc: shortDesc,
                    date: date,
                    time: time,
                    status: status,
                    imageUrl: data.imageUrl || undefined,
                    coordinates: coordinates,
                    timestamp: data.timestamp, // Keep original timestamp for reference if needed
                    submissionDate: data.submissionDate, // Keep original strings for reference
                    submissionTime: data.submissionTime,
                };
            });
            setNewsItems(fetchedRequests); // Update state with fetched data
        } catch (err) {
            // Detailed error handling
             let specificError = "An unknown error occurred while fetching data.";
             if (err instanceof Error) { specificError = err.message; }
             else if (typeof err === 'string') { specificError = err; }
             else if (err && typeof err === 'object' && 'code' in err) {
                 const firestoreError = err as FirestoreError;
                 specificError = `Firestore error (${firestoreError.code}): ${firestoreError.message}`;
                 // Check for common index-related errors
                 if (firestoreError.code === 'failed-precondition' && specificError.includes('index')) {
                     specificError += " Ensure the required Firestore index (aidRequest collection, ordered by timestamp desc) is created in your Firebase console.";
                 }
             }
             console.error("Error fetching data:", err); // Log the raw error
             setError(`Failed to load requests: ${specificError}.`); // Set user-friendly error message
        } finally {
            setIsLoading(false); // Stop loading indicator
        }
    };

    // Function to open the Edit Modal
    const handleEdit = (item: NewsItem) => {
        console.log("Editing item:", item); // Optional: Log item being edited
        setItemToEdit(item);
        setIsEditModalOpen(true);
    };

    // Function to save edited data
    const handleSaveEdit = async (editedData: Partial<NewsItem>) => {
       if (!itemToEdit || !db) {
           alert("Error: Cannot save. Item data missing or database connection lost.");
           setIsEditModalOpen(false);
           setItemToEdit(null);
           return;
       }
       const currentItemId = itemToEdit.id;
       setIsLoading(true); // Indicate saving process

       try {
           const docRef = doc(db, 'aidRequest', currentItemId);
           // Prepare data for Firestore update (only include fields edited in the modal)
           const updateData: Record<string, any> = {
               name: editedData.requesterName, // Assuming 'name' is a possible field name
               requesterName: editedData.requesterName,
               contactNumber: editedData.contactNumber,
               calamityType: editedData.calamityType,
               calamityLevel: editedData.calamityLevel, // Save the selected string ("1"-"5")
               shortDesc: editedData.shortDesc,
               status: editedData.status,
               // Do NOT update location, coordinates, timestamp, imageUrl here
           };

           await updateDoc(docRef, updateData);

           // Update local state optimistically for immediate UI feedback
           setNewsItems(prevItems =>
               prevItems.map(item =>
                   item.id === currentItemId
                       ? {
                           ...item, // Keep existing fields like ID, location, date, time, image etc.
                           // Overwrite only the fields that were edited
                           requesterName: editedData.requesterName ?? item.requesterName,
                           contactNumber: editedData.contactNumber ?? item.contactNumber,
                           calamityType: editedData.calamityType ?? item.calamityType,
                           calamityLevel: editedData.calamityLevel ?? item.calamityLevel,
                           shortDesc: editedData.shortDesc, // Allow setting empty description
                           status: (editedData.status as NewsItem['status']) ?? item.status,
                       }
                       : item
               )
           );
           alert(`Request from ${editedData.requesterName} updated successfully.`);
       } catch (error) {
           console.error(`Error updating item ${currentItemId}:`, error);
           const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during update.';
           setError(`Failed to update item ${currentItemId}. ${errorMessage}`);
           alert(`Error updating request. Error: ${errorMessage}. See console for details.`);
       } finally {
           setIsEditModalOpen(false);
           setItemToEdit(null);
           setIsLoading(false); // Stop loading indicator
       }
    };

    // Function to initiate the delete process
    const initiateDelete = (id: string, name: string) => {
        const item = newsItems.find(i => i.id === id);
        const requesterName = item?.requesterName || name || 'this item'; // Get name for confirmation
        setItemToDelete({ id, name: requesterName });
        setIsDeleteModalOpen(true);
    };

    // Function to confirm and execute deletion
    const handleConfirmDelete = async () => {
        if (!itemToDelete || !db) {
             alert("Error: Cannot delete. Item data missing or database connection lost.");
             setIsDeleteModalOpen(false);
             setItemToDelete(null);
             return;
        }
        const { id, name } = itemToDelete;
        setIsLoading(true); // Indicate deletion process

        try {
            await deleteDoc(doc(db, 'aidRequest', id));
            // Update local state by filtering out the deleted item
            setNewsItems(prevItems => prevItems.filter(item => item.id !== id));
            alert(`Request from ${name} (ID: ${id}) deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting item ${id}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during deletion.';
            setError(`Failed to delete item ${id}. ${errorMessage}`);
            alert(`Error deleting request from ${name} (ID: ${id}). Error: ${errorMessage}. See console for details.`);
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            setIsLoading(false); // Stop loading indicator
        }
    };

    // Function to cancel deletion
    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    // Render the Page UI
    return (
        <div className="w-full min-h-screen p-4 font-inter bg-gray-50">
            {/* Global Styles and Custom Scrollbar */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                html { scroll-behavior: smooth; }
                body { font-family: 'Inter', sans-serif; }
                /* Custom Scrollbar for Webkit Browsers (Chrome, Safari) */
                .custom-red-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-red-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-red-scrollbar::-webkit-scrollbar-thumb { background: #DC2626; /* Red-600 */ border-radius: 10px; }
                .custom-red-scrollbar::-webkit-scrollbar-thumb:hover { background: #B91C1C; /* Red-700 */ }
                /* Custom Scrollbar for Firefox */
                .custom-red-scrollbar { scrollbar-width: thin; scrollbar-color: #DC2626 #f1f1f1; }
               `}</style>

            {/* Header Section */}
            <div className={'bg-red-800 p-6 rounded-lg mb-6 text-white shadow relative overflow-hidden'}>
                {/* Optional: Add background decorative elements if desired */}
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Hello Admin!</h1>
                    <p className="text-base text-gray-200 font-medium mb-4 text-center md:text-left">Manage and review aid requests submitted to the platform.</p>
                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap justify-center items-center mt-4 space-x-2 sm:space-x-4">
                        <NavTab label="Review Requests" href="/admin/review-requests" />
                        <NavTab label="Dashboard" href="/admin/analytics" />
                        <NavTab label="News Articles" href="/admin/news" active />
                        <NavTab label="Organizations" href="/admin/organizations" />
                        <NavTab label="Volunteers" href="/admin/volunteers" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Aid Request Management</h2>
                     {/* Optional: Add refresh button or other controls here */}
                     <button
                        onClick={fetchData}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                    >
                        {isLoading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>

                {/* Display Loading, Error, or Data Table */}
                {isLoading && !error && ( // Show loading only if not already showing an error from previous load
                    <div className="p-10 text-center text-gray-600">Loading requests...</div>
                )}
                {error && ( // Display error message prominently
                    <div className="p-6 my-4 text-center text-red-700 border border-red-300 bg-red-50 rounded-md">
                        <p className="font-semibold text-lg">Error Loading Data</p>
                        <p className="mt-2 text-sm">{error}</p>
                        <button
                            onClick={fetchData}
                            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                        >
                            Retry
                        </button>
                    </div>
                )}
                {!isLoading && !error && ( // Display table only if not loading and no error
                    <div className="overflow-x-auto overflow-y-auto max-h-[75vh] custom-red-scrollbar rounded-md overflow-hidden border-2 border-gray-200 shadow-sm"> {/* Adjusted border */}
                        <table className="w-full min-w-[900px] table-auto border-collapse"> {/* Increased min-width slightly */}
                            <thead className="bg-gray-100 sticky top-0 z-10">
                                <tr>
                                    {/* Table Headers */}
                                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[4%]">#</th>
                                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[15%]">Requester</th>
                                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[10%]">Image</th>
                                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[12%]">Calamity Type</th>
                                    {/* This column header remains "Level" */}
                                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[8%]">Level</th>
                                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[15%]">Description</th>
                                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[15%]">Location</th>
                                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[10%]">Date/Time</th>
                                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 w-[11%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {newsItems.length > 0 ? newsItems.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                        {/* Table Row Data */}
                                        <td className="px-3 py-3 text-sm font-medium text-gray-500 align-top border-r border-gray-200">{index + 1}</td>
                                        <td className="px-3 py-3 text-sm text-gray-800 font-semibold align-top border-r border-gray-200">
                                            {item.requesterName}
                                            <span className="block text-xs text-gray-500 font-normal mt-0.5">{item.contactNumber}</span>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600 align-middle text-center border-r border-gray-200">
                                            {item.imageUrl ? (
                                                <Image src={item.imageUrl} alt={`Condition for ${item.id}`} width={56} height={56} className="inline-block object-cover rounded border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No Image</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600 align-top border-r border-gray-200">{item.calamityType}</td>
                                        {/* This table cell will display the numerical level ("1", "2", etc.) */}
                                        <td className="px-3 py-3 text-sm text-gray-600 font-medium align-top border-r border-gray-200 text-center">{item.calamityLevel}</td>
                                        <td className="px-3 py-3 text-sm text-gray-600 max-w-xs break-words align-top border-r border-gray-200" title={item.shortDesc || ''}>{item.shortDesc || <span className="text-xs text-gray-400 italic">N/A</span>}</td>
                                        <td className="px-3 py-3 text-sm text-gray-600 align-top border-r border-gray-200 min-w-[12rem] break-words">{item.location}</td>
                                        <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap align-top border-r border-gray-200">
                                            <span className="block">{item.date}</span>
                                            <span className="block text-xs">{item.time}</span>
                                        </td>
                                        <td className="px-3 py-3 text-sm text-center whitespace-nowrap align-middle">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1.5 px-3 rounded-full mr-1.5 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                                                aria-label={`Edit request from ${item.requesterName}`}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => initiateDelete(item.id, item.requesterName)}
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                                                aria-label={`Delete request from ${item.requesterName}`}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    // Message when no items are found
                                    <tr key="no-items">
                                        <td colSpan={9} className="text-center py-10 px-3 text-gray-500 italic">
                                            No aid requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Render Modals */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                requesterName={itemToDelete?.name || ''}
            />
            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setItemToEdit(null); }} // Close and clear item
                onSave={handleSaveEdit}
                item={itemToEdit} // Pass the selected item to the modal
            />

        </div> // End of main container div
    );
};

export default NewsArticlePage;