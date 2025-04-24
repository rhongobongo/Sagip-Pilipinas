// src/app/(public)/admin/news/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/Firebase/Firebase';
import {
  collection,
  getDocs,
  query,
  orderBy as firestoreOrderBy,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp as FirebaseTimestamp, // Client-side Timestamp import
  FirestoreError,
  GeoPoint, // Assuming GeoPoint might be used client-side if needed
} from 'firebase/firestore';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

// Define the structure for an individual report within the reports array
type ReportEntry = {
  reason: string;
  reportedBy: string | null;
  timestamp: Date; // Ensure this is always a Date object after processing
};

// Define a type for the raw report data from Firestore
type RawReportEntry = {
  reason?: string;
  reportedBy?: string | null;
  timestamp?: FirebaseTimestamp | Date | string | number; // Allow multiple potential types from Firestore
};

// Updated structure for a news item (aid request)
type NewsItem = {
  id: string;
  requesterName: string;
  contactNumber: string;
  location: string;
  calamityType: string;
  calamityLevel: string;
  shortDesc?: string;
  date: string; // Formatted date string for display
  time: string; // Formatted time string for display
  status?: 'pending' | 'approved' | 'completed';
  imageUrl?: string;
  coordinates?: { latitude: number; longitude: number };
  originalTimestamp?: FirebaseTimestamp | string | Date; // Store original for reference (allow Date too)
  sortableDate: Date | null; // +++ Added dedicated field for sorting +++
  submissionDate?: string;
  submissionTime?: string;
  reportCount: number;
  reports: ReportEntry[];
  latestReportReason?: string;
};

// Define valid sortable columns
type SortableColumn =
  | 'requesterName'
  | 'calamityType'
  | 'calamityLevel'
  | 'sortableDate' // +++ Sort by the Date object field +++
  | 'status'
  | 'reportCount'
  | 'latestReportReason';

type SortDirection = 'asc' | 'desc';

// Helper function to safely get a Date object
function getDateObject(
  value: unknown // Accept unknown type
): Date | null {
  // Check for Firebase Client SDK Timestamp
  // FIX 1: Use instanceof for FirebaseTimestamp check
  if (value instanceof FirebaseTimestamp) {
    try {
      return value.toDate();
    } catch (e) {
      console.error('Error converting Firestore Timestamp:', e);
      return null;
    }
  }
  // Check for standard JS Date object
  if (value instanceof Date) {
    // Check if the date is valid
    if (!isNaN(value.getTime())) {
      return value;
    }
  }
  // Check for string and try parsing
  if (typeof value === 'string') {
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    } catch (e) {
      /* Ignore parse error */
    }
  }
  // Check for number (milliseconds)
  if (typeof value === 'number') {
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    } catch (e) {
      /* Ignore */
    }
  }
  return null;
}

// Updated helper function (logic remains same)
function formatDateTimeClient(
  timestamp: FirebaseTimestamp | Date | string | null | undefined, // Allow Date too
  dateStr?: string,
  timeStr?: string
): { date: string; time: string; dateObject: Date | null } {
  let finalDate = 'N/A';
  let finalTime = 'N/A';
  let dateObject: Date | null = null;

  // Attempt to get Date object from primary timestamp first
  dateObject = getDateObject(timestamp);

  // If primary failed, try combining dateStr and timeStr
  if (!dateObject && dateStr && timeStr) {
    try {
      const combined = `${dateStr} ${timeStr}`; // Adjust format if needed
      const potentialDate = new Date(combined);
      if (!isNaN(potentialDate.getTime())) {
        dateObject = potentialDate;
      }
    } catch (e) {
      /* ignore parse error */
    }
  }
  // Fallback to just dateStr or original timestamp string if parsing failed
  else if (!dateObject && dateStr) {
    dateObject = getDateObject(dateStr);
  } else if (!dateObject && typeof timestamp === 'string') {
    dateObject = getDateObject(timestamp);
  }

  // Format date and time strings *if* we successfully got a Date object
  if (dateObject) {
    finalDate = dateObject.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    finalTime = dateObject.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  // Use original strings as fallback if dateObject is still null
  else {
    finalDate = dateStr || (typeof timestamp === 'string' ? timestamp : 'N/A');
    finalTime = timeStr || 'N/A';
  }

  return { date: finalDate, time: finalTime, dateObject };
}

// Navigation Tab Component (remains the same)
const NavTab: React.FC<{ label: string; href: string; active?: boolean }> = ({
  label,
  href,
  active = false,
}) => {
  const baseClasses =
    'py-1.5 px-6 text-sm font-bold rounded-full transition-all duration-200';
  const activeClasses = 'bg-white text-red-800 shadow-sm';
  const inactiveClasses = 'text-white hover:bg-red-700';
  return (
    <a
      href={href}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      {label}
    </a>
  );
};

// Confirmation Modal Component (remains the same)
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requesterName: string;
}
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  requesterName,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Confirm Deletion
        </h3>
        <p className="mb-6 text-gray-700">
          Are you sure you want to delete the request from{' '}
          <span className="font-bold">{requesterName}</span>? This action cannot
          be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
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

// Edit Modal Component (remains largely the same, maybe add report info if needed)
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<NewsItem>) => void;
  item: NewsItem | null;
}
const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
}) => {
  const [formData, setFormData] = useState<Partial<NewsItem>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        requesterName: item.requesterName,
        contactNumber: item.contactNumber,
        calamityType: item.calamityType,
        calamityLevel: String(item.calamityLevel || ''),
        shortDesc: item.shortDesc || '',
        status: item.status || 'pending',
        location: item.location, // Display only
        // Do not include reports/reportCount here unless editable
      });
    } else {
      setFormData({});
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      requesterName: formData.requesterName,
      contactNumber: formData.contactNumber,
      calamityType: formData.calamityType,
      calamityLevel: formData.calamityLevel,
      shortDesc: formData.shortDesc,
      status: formData.status,
    });
  };

  // Dropdown options (same as before)
  const calamityTypeOptions = [
    { value: 'flood', label: 'Flood' },
    { value: 'earthquake', label: 'Earthquake' },
    { value: 'fire', label: 'Fire' },
    { value: 'typhoon', label: 'Typhoon' },
    { value: 'landslide', label: 'Landslide' },
    { value: 'volcanic eruption', label: 'Volcanic Eruption' },
    { value: 'tsunami', label: 'Tsunami' },
    { value: 'other', label: 'Other' },
  ];
  const calamityLevelOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
  ];

  // Modal JSX (same as before)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto text-black">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Edit Request Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Requester Name & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="requesterName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Requester Name
              </label>
              <input
                type="text"
                id="requesterName"
                name="requesterName"
                value={formData.requesterName || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="contactNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contact Number
              </label>
              <input
                type="text"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Calamity Type & Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="calamityType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Calamity Type
              </label>
              <select
                id="calamityType"
                name="calamityType"
                value={formData.calamityType || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Select Calamity Type</option>
                {calamityTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="calamityLevel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Calamity Level
              </label>
              <select
                id="calamityLevel"
                name="calamityLevel"
                value={formData.calamityLevel || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Select Calamity Level</option>
                {calamityLevelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location (Read-Only) */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address/Location (Read-only)
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location || ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none focus:ring-0 text-gray-600"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="shortDesc"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Short Description
            </label>
            <textarea
              id="shortDesc"
              name="shortDesc"
              value={formData.shortDesc || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Page Component
const NewsArticlePage: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [sortColumn, setSortColumn] = useState<SortableColumn>('sortableDate'); // Default sort by actual date
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Modal State (same as before)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<NewsItem | null>(null);

  // +++ State for Reports Modal +++
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [reportsModalItem, setReportsModalItem] = useState<NewsItem | null>(
    null
  );

  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch data
  const fetchData = async () => {
    // ... (initial checks) ...
    if (!db) {
      setError('Firestore is not available.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const requestsRef = collection(db, 'aidRequest');
      const q = query(requestsRef, firestoreOrderBy('timestamp', 'desc')); // Still fetch ordered by server timestamp initially
      const querySnapshot = await getDocs(q);

      const fetchedRequests: NewsItem[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Format date/time and get the Date object
        const { date, time, dateObject } = formatDateTimeClient(
          data.timestamp,
          data.submissionDate,
          data.submissionTime
        );

        // Process Location (same as before)
        let locationString = 'Location Unavailable';
        let coordinates: { latitude: number; longitude: number } | undefined =
          undefined;
        // ... (location processing logic remains the same) ...
        if (data.locationDetails?.city || data.locationDetails?.province) {
          locationString = [
            data.locationDetails.city,
            data.locationDetails.province,
            data.locationDetails.region,
          ]
            .filter(Boolean)
            .join(', ');
        } else if (data.address && typeof data.address === 'string') {
          locationString = data.address;
        } else if (
          data.coordinates instanceof GeoPoint // Check if it's Firestore GeoPoint
        ) {
          const lat = data.coordinates.latitude;
          const lon = data.coordinates.longitude;
          locationString = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
          coordinates = { latitude: lat, longitude: lon };
        } else if (
          data.coordinates &&
          typeof data.coordinates.latitude === 'number' &&
          typeof data.coordinates.longitude === 'number'
        ) {
          // Check for plain object {lat, lon}
          const lat = data.coordinates.latitude;
          const lon = data.coordinates.longitude;
          locationString = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
          coordinates = { latitude: lat, longitude: lon };
        } else if (data.coordinates && typeof data.coordinates === 'string') {
          // Fallback for string coordinates
          const match = data.coordinates.match(
            /(\-?\d+\.?\d*)\s*[°]?\s*[NS]?,\s*(\-?\d+\.?\d*)\s*[°]?\s*[EW]?/i
          );
          if (match && match.length === 3) {
            const lat = parseFloat(match[1]);
            const lon = parseFloat(match[2]);
            if (!isNaN(lat) && !isNaN(lon)) {
              locationString = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
              coordinates = { latitude: lat, longitude: lon };
            }
          }
        }

        // Process Status (same as before)
        const status: NewsItem['status'] = [
          'pending',
          'approved',
          'completed',
        ].includes(data.status)
          ? data.status
          : 'pending';
        const shortDesc: string = data.shortDesc || '';

        // FIX 2: Use RawReportEntry type for mapping
        const reports: ReportEntry[] = (data.reports || []).map(
          (r: RawReportEntry) => ({
            reason: r?.reason ?? 'N/A',
            reportedBy: r?.reportedBy ?? null,
            // Ensure timestamp is Date, fallback to epoch if conversion fails
            timestamp: getDateObject(r?.timestamp) || new Date(0),
          })
        );
        // Sort reports by Date timestamp descending
        reports.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const latestReportReason =
          reports.length > 0 ? reports[0].reason : undefined;

        // Construct NewsItem
        return {
          id: doc.id,
          requesterName: data.name || data.requesterName || 'N/A',
          contactNumber: data.contactNumber || 'N/A',
          location: locationString,
          calamityType: data.calamityType || 'N/A',
          calamityLevel: String(data.calamityLevel || 'N/A'),
          shortDesc: shortDesc,
          date: date, // Formatted display date
          time: time, // Formatted display time
          originalTimestamp: data.timestamp, // Keep original Firestore value
          sortableDate: dateObject, // Store the JS Date object for sorting
          status: status,
          imageUrl: data.imageUrl || undefined,
          coordinates: coordinates,
          reportCount: data.reportCount || 0,
          reports: reports,
          latestReportReason: latestReportReason,
          submissionDate: data.submissionDate,
          submissionTime: data.submissionTime,
        };
      });
      setNewsItems(fetchedRequests);
    } catch (err) {
      // Error handling (same as before)
      let specificError = 'An unknown error occurred.';
      if (err instanceof Error) {
        specificError = err.message;
      } else if (typeof err === 'string') {
        specificError = err;
      } else if (err && typeof err === 'object' && 'code' in err) {
        const firestoreError = err as FirestoreError;
        specificError = `Firestore error (${firestoreError.code}): ${firestoreError.message}`;
        if (
          firestoreError.code === 'failed-precondition' &&
          specificError.includes('index')
        ) {
          specificError += ' Ensure Firestore index is created.';
        }
      }
      console.error('Error fetching data:', err);
      setError(`Failed to load requests: ${specificError}.`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Sorting Logic ---
  const sortedNewsItems = useMemo(() => {
    // FIX 3: Use const instead of let
    const sortableItems = [...newsItems];
    sortableItems.sort((a, b) => {
      // FIX 4 & 5: Use unknown instead of any
      const valA = a[sortColumn as keyof NewsItem] as unknown;
      const valB = b[sortColumn as keyof NewsItem] as unknown;

      let comparison = 0;

      // Handle null/undefined first
      if (valA === null || valA === undefined) comparison = -1;
      else if (valB === null || valB === undefined) comparison = 1;
      // Specific sort for the 'sortableDate' column
      else if (sortColumn === 'sortableDate') {
        // Ensure valA and valB are potentially Date objects or convertible
        const dateA = getDateObject(valA);
        const dateB = getDateObject(valB);
        if (dateA && dateB) {
          comparison = dateA.getTime() - dateB.getTime();
        } else if (dateA) {
          comparison = 1; // Valid date comes after invalid/null
        } else if (dateB) {
          comparison = -1; // Invalid/null comes before valid date
        } else {
          comparison = 0; // Both invalid/null
        }
      }
      // Handle numbers (like reportCount)
      else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      }
      // Default to string comparison for other columns
      else {
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        comparison = strA.localeCompare(strB);
      }

      return sortDirection === 'desc' ? comparison * -1 : comparison;
    });
    return sortableItems;
  }, [newsItems, sortColumn, sortDirection]);

  // Function to handle sorting clicks
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Helper to render sort icons
  const renderSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column) {
      return <FaSort className="inline ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <FaSortUp className="inline ml-1 text-gray-700" />
    ) : (
      <FaSortDown className="inline ml-1 text-gray-700" />
    );
  };
  // --- End Sorting Logic ---

  // Edit and Delete Handlers (remain the same)
  const handleEdit = (item: NewsItem) => {
    console.log('Editing item:', item);
    setItemToEdit(item);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (editedData: Partial<NewsItem>) => {
    if (!itemToEdit || !db) {
      alert(
        'Error: Cannot save. Item data missing or database connection lost.'
      );
      setIsEditModalOpen(false);
      setItemToEdit(null);
      return;
    }
    const currentItemId = itemToEdit.id;
    setIsLoading(true); // Consider a specific "saving" state

    try {
      const docRef = doc(db, 'aidRequest', currentItemId);

      // FIX: Disable ESLint rule for this line as 'any' is needed for updateDoc
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = {
        // Ensure field names match Firestore document fields
        name: editedData.requesterName, // Assuming 'name' is the field in Firestore
        requesterName: editedData.requesterName, // Keep if also used
        contactNumber: editedData.contactNumber,
        calamityType: editedData.calamityType,
        calamityLevel: editedData.calamityLevel,
        shortDesc: editedData.shortDesc,
        status: editedData.status,
        // Add updatedAt timestamp
        updatedAt: FirebaseTimestamp.now(), // Use server timestamp for updates
      };

      // Remove undefined fields (keep this logic)
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );

      await updateDoc(docRef, updateData);

      // Update local state more accurately
      setNewsItems((prevItems) =>
        prevItems.map((item) =>
          item.id === currentItemId
            ? {
                ...item,
                ...editedData, // Apply edited fields
                // Update fields derived from edited data if necessary
                requesterName: editedData.requesterName ?? item.requesterName,
                contactNumber: editedData.contactNumber ?? item.contactNumber,
                calamityType: editedData.calamityType ?? item.calamityType,
                calamityLevel: editedData.calamityLevel ?? item.calamityLevel,
                shortDesc: editedData.shortDesc ?? item.shortDesc,
                status: editedData.status ?? item.status,
                // You might want to update the originalTimestamp locally too,
                // but getting the actual server timestamp back requires another read.
                // For now, just applying the editedData is usually sufficient for UI update.
              }
            : item
        )
      );
      alert(`Request from ${editedData.requesterName} updated successfully.`);
    } catch (error) {
      console.error(`Error updating item ${currentItemId}:`, error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during update.';
      setError(`Failed to update item ${currentItemId}. ${errorMessage}`);
      alert(
        `Error updating request. Error: ${errorMessage}. See console for details.`
      );
    } finally {
      setIsEditModalOpen(false);
      setItemToEdit(null);
      setIsLoading(false); // Reset loading state
    }
  };

  const initiateDelete = (id: string, name: string) => {
    const item = newsItems.find((i) => i.id === id);
    const requesterName = item?.requesterName || name || 'this item';
    setItemToDelete({ id, name: requesterName });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !db) {
      alert(
        'Error: Cannot delete. Item data missing or database connection lost.'
      );
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      return;
    }
    const { id, name } = itemToDelete;
    setIsLoading(true);

    try {
      await deleteDoc(doc(db, 'aidRequest', id));
      setNewsItems((prevItems) => prevItems.filter((item) => item.id !== id));
      alert(`Request from ${name} (ID: ${id}) deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting item ${id}:`, error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during deletion.';
      setError(`Failed to delete item ${id}. ${errorMessage}`);
      alert(
        `Error deleting request from ${name} (ID: ${id}). Error: ${errorMessage}. See console for details.`
      );
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // +++ Handler to Open Reports Modal +++
  const handleViewReports = (item: NewsItem) => {
    if (item.reportCount > 0) {
      setReportsModalItem(item);
      setIsReportsModalOpen(true);
    }
  };

  // Render the Page UI
  return (
    <div className="w-full min-h-screen p-4 font-inter bg-gray-50">
      {/* Global Styles (same as before) */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        html {
          scroll-behavior: smooth;
        }
        body {
          font-family: 'Inter', sans-serif;
        }
        .custom-red-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-thumb {
          background: #dc2626;
          border-radius: 10px;
        }
        .custom-red-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b91c1c;
        }
        .custom-red-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #dc2626 #f1f1f1;
        }
      `}</style>

      {/* Header Section (same as before) */}
      <div
        className={
          'bg-red-800 p-6 rounded-lg mb-6 text-white shadow relative overflow-hidden'
        }
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hello Admin!</h1>
          <p className="text-base text-gray-200 font-medium mb-4 text-center md:text-left">
            Manage and review aid requests submitted to the platform.
          </p>
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
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
            Aid Request Management
          </h2>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Loading / Error Display (same as before) */}
        {isLoading && !error && (
          <div className="p-10 text-center text-gray-600">
            Loading requests...
          </div>
        )}
        {error && (
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

        {/* --- TABLE DISPLAY --- */}
        {!isLoading && !error && (
          <div className="overflow-x-auto overflow-y-auto max-h-[75vh] custom-red-scrollbar rounded-md overflow-hidden border-2 border-gray-200 shadow-sm">
            {/* Table */}
            <table className="w-full min-w-[1200px] table-auto border-collapse">
              {' '}
              {/* Increased min-width */}
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {/* Adjusted Headers with Sorting */}
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[3%]">
                    #
                  </th>
                  <th
                    className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[12%] cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('requesterName')}
                  >
                    Requester {renderSortIcon('requesterName')}
                  </th>
                  <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[7%]">
                    Image
                  </th>
                  <th
                    className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[10%] cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('calamityType')}
                  >
                    Calamity Type {renderSortIcon('calamityType')}
                  </th>
                  <th
                    className="px-3 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[5%] cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('calamityLevel')}
                  >
                    Level {renderSortIcon('calamityLevel')}
                  </th>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[15%]">
                    Description
                  </th>
                  <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[13%]">
                    Location
                  </th>
                  <th
                    className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[9%] cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('sortableDate')}
                  >
                    Date/Time {renderSortIcon('sortableDate')}
                  </th>
                  {/* +++ New Report Columns +++ */}
                  <th
                    className="px-3 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[6%] cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('reportCount')}
                  >
                    Reports {renderSortIcon('reportCount')}
                  </th>
                  <th
                    className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-gray-200 w-[12%] cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('latestReportReason')}
                  >
                    Last Report {renderSortIcon('latestReportReason')}
                  </th>
                  {/* End New Columns */}
                  <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 w-[8%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Use sortedNewsItems here */}
                {sortedNewsItems.length > 0 ? (
                  sortedNewsItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    >
                      {/* Data Cells */}
                      <td className="px-3 py-3 text-sm font-medium text-gray-500 align-top border-r border-gray-200">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-800 font-semibold align-top border-r border-gray-200">
                        {item.requesterName}
                        <span className="block text-xs text-gray-500 font-normal mt-0.5">
                          {item.contactNumber}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 align-middle text-center border-r border-gray-200">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={`Condition for ${item.id}`}
                            width={56}
                            height={56}
                            className="inline-block object-cover rounded border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                'none';
                            }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No Image
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 align-top border-r border-gray-200">
                        {item.calamityType}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 font-medium align-top border-r border-gray-200 text-center">
                        {item.calamityLevel}
                      </td>
                      <td
                        className="px-3 py-3 text-sm text-gray-600 max-w-xs break-words align-top border-r border-gray-200"
                        title={item.shortDesc || ''}
                      >
                        {item.shortDesc || (
                          <span className="text-xs text-gray-400 italic">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 align-top border-r border-gray-200 min-w-[10rem] break-words">
                        {item.location}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap align-top border-r border-gray-200">
                        <span className="block">{item.date}</span>
                        <span className="block text-xs">{item.time}</span>
                      </td>
                      {/* +++ Updated Reports Count Cell +++ */}
                      <td
                        className={`px-3 py-3 text-sm font-medium align-top border-r border-gray-200 text-center ${
                          item.reportCount > 0
                            ? 'text-red-600 cursor-pointer hover:underline'
                            : 'text-gray-600'
                        }`}
                        onClick={() => handleViewReports(item)} // Added onClick
                        title={
                          item.reportCount > 0 ? 'Click to view reports' : ''
                        } // Add tooltip
                      >
                        {item.reportCount > 0 ? item.reportCount : '-'}
                      </td>
                      <td
                        className="px-3 py-3 text-sm text-gray-600 max-w-[150px] truncate align-top border-r border-gray-200"
                        title={item.latestReportReason || ''}
                      >
                        {item.latestReportReason || (
                          <span className="text-xs text-gray-400 italic">
                            N/A
                          </span>
                        )}
                      </td>
                      {/* End New Data Cells */}
                      <td className="px-3 py-3 text-sm text-center whitespace-nowrap align-middle">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1.5 px-3 rounded-full mr-1.5 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                          aria-label={`Edit request from ${item.requesterName}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            initiateDelete(item.id, item.requesterName)
                          }
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                          aria-label={`Delete request from ${item.requesterName}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key="no-items">
                    <td
                      colSpan={11} // Updated colspan
                      className="text-center py-10 px-3 text-gray-500 italic"
                    >
                      No aid requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals (remain the same) */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        requesterName={itemToDelete?.name || ''}
      />
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveEdit}
        item={itemToEdit}
      />
      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => {
          setIsReportsModalOpen(false);
          setReportsModalItem(null);
        }}
        item={reportsModalItem}
      />
    </div> // End main container
  );
};

export default NewsArticlePage;

// +++ NEW COMPONENT +++
interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: NewsItem | null; // Pass the whole item to access reports and name
}

const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  if (!isOpen || !item) return null;

  // Format timestamp within the modal for display
  const formatReportTimestamp = (timestamp: Date): string => {
    if (!(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
      return 'Invalid date';
    }
    return timestamp.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full my-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Close reports modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h3 className="text-xl font-semibold mb-4 text-gray-900">
          Reports for Request by: {item.requesterName}
        </h3>

        {/* Reports List */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-red-scrollbar pr-2">
          {item.reports && item.reports.length > 0 ? (
            item.reports.map((report, index) => (
              <div
                key={index}
                className="border border-gray-200 p-3 rounded-md bg-gray-50"
              >
                <p className="text-sm text-gray-800 mb-1">{report.reason}</p>
                <p className="text-xs text-gray-500">
                  Reported By: {report.reportedBy || 'Unknown User'}{' '}
                  {/* Consider fetching user details if needed */}
                </p>
                <p className="text-xs text-gray-500">
                  Time: {formatReportTimestamp(report.timestamp)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 italic">
              No reports found for this request.
            </p>
          )}
        </div>

        {/* Modal Footer (optional, e.g., just a close button) */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
