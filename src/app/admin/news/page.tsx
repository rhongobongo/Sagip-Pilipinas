'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/Firebase/Firebase';
import { collection, getDocs, query, orderBy, doc, deleteDoc, Timestamp as FirebaseTimestamp, FirestoreError } from 'firebase/firestore';

type NewsItem = {
    id: string;
    requesterName: string;
    contactNumber: string;
    location: string;
    calamityType: string;
    calamityLevel: string;
    shortDesc?: string;
    date: string;
    time: string;
    status?: 'pending' | 'approved' | 'completed';
    imageUrl?: string;
    coordinates?: { latitude: number; longitude: number; };
};

function formatDateTimeClient(timestamp: FirebaseTimestamp | string | null | undefined, dateStr?: string, timeStr?: string): { date: string; time: string } {
    let finalDate = dateStr || '';
    let finalTime = timeStr || '';

    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
        const dateObj = timestamp.toDate();
        finalDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit'});
        finalTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (typeof timestamp === 'string') {
        const parts = timestamp.split(' at ');
        if (parts.length === 2) {
             if (!dateStr) finalDate = parts[0];
             if (!timeStr) {
                 const timePartMatch = parts[1].match(/^(\d{1,2}:\d{2}:\d{2}\s*[AP]M)/i);
                 if (timePartMatch) {
                     finalTime = timePartMatch[1];
                 } else {
                      finalTime = parts[1].replace(/ UTC\+\d+$/, '');
                 }
             }
        } else if (!dateStr) {
            finalDate = timestamp;
        }
    } else if (dateStr && timeStr) {
        finalDate = dateStr;
        finalTime = timeStr;
    }

    try {
        if (finalDate && isNaN(Date.parse(finalDate)) && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(finalDate) && !/^[A-Za-z]+ \d{1,2}, \d{4}$/.test(finalDate) ) {
             finalDate = finalDate || 'N/A';
        } else if (finalDate) {
             const d = new Date(finalDate);
             if (!isNaN(d.getTime())) {
                  finalDate = d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit'});
             } else {
                   finalDate = finalDate || 'N/A';
             }
        }
    } catch (e) {
       finalDate = finalDate || 'N/A';
    }

    if (finalTime && /^\d{1,2}:\d{2}$/.test(finalTime)) {
    }

    finalDate = finalDate || 'N/A';
    finalTime = finalTime || 'N/A';

    return { date: finalDate, time: finalTime };
}

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

const NewsArticlePage: React.FC = () => {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
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
                const q = query(requestsRef, orderBy('timestamp', 'desc'));
                const querySnapshot = await getDocs(q);

                const fetchedRequests: NewsItem[] = querySnapshot.docs.map((doc) => {
                    const data = doc.data();

                    const { date, time } = formatDateTimeClient(
                        data.timestamp,
                        data.submissionDate,
                        data.submissionTime
                    );

                    let location = 'Location Unavailable';
                    let coordinates: { latitude: number; longitude: number; } | undefined = undefined;

                    if (data.coordinates && typeof data.coordinates.latitude === 'number' && typeof data.coordinates.longitude === 'number') {
                        const lat = data.coordinates.latitude;
                        const lon = data.coordinates.longitude;
                        location = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                        coordinates = { latitude: lat, longitude: lon };
                    } else if (data.address && typeof data.address === 'string') {
                        location = data.address;
                    } else if (data.coordinates && typeof data.coordinates === 'string') {
                          const match = data.coordinates.match(/(\-?\d+\.?\d*)\s*[°]?\s*[NS],\s*(\-?\d+\.?\d*)\s*[°]?\s*[EW]/i);
                          if (match && match.length === 3) {
                              const lat = parseFloat(match[1]);
                              const lon = parseFloat(match[2]);
                              if (!isNaN(lat) && !isNaN(lon)) {
                                  location = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                                  coordinates = { latitude: lat, longitude: lon };
                              }
                          }
                     }

                    const status: NewsItem['status'] = ['pending', 'approved', 'completed'].includes(data.status)
                         ? data.status
                         : 'pending';
                    const shortDesc: string = data.shortDesc || '';

                    return {
                        id: doc.id,
                        requesterName: data.name || 'N/A',
                        contactNumber: data.contactNumber || 'N/A',
                        location: location,
                        calamityType: data.calamityType || 'N/A',
                        calamityLevel: data.calamityLevel || 'N/A',
                        shortDesc: shortDesc,
                        date: date,
                        time: time,
                        status: status,
                        imageUrl: data.imageUrl || undefined,
                        coordinates: coordinates,
                    };
                });

                setNewsItems(fetchedRequests);

            } catch (err) {
                let specificError = "An unknown error occurred.";
                if (err instanceof Error) {
                    specificError = err.message;
                } else if (typeof err === 'string') {
                    specificError = err;
                } else if (err && typeof err === 'object' && 'code' in err) {
                    const firestoreError = err as FirestoreError;
                    specificError = `Firestore error (${firestoreError.code}): ${firestoreError.message}`;
                    if (firestoreError.code === 'failed-precondition' && specificError.includes('index')) {
                        specificError += " Ensure the required Firestore index is created.";
                    }
                }
                setError(`Failed to load news: ${specificError}. Please check console for details.`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEdit = (id: string) => {
        router.push(`/admin/news/edit/${id}`);
    };

    const handleDelete = async (id: string) => {
        const itemToDelete = newsItems.find(item => item.id === id);
        const confirmMessage = itemToDelete
            ? `Are you sure you want to delete the request: ${itemToDelete.calamityType} - ${itemToDelete.calamityLevel} (ID: ${id})?`
            : `Are you sure you want to delete this item (ID: ${id})? This action cannot be undone.`;

        if (window.confirm(confirmMessage)) {
            try {
                if (!db) throw new Error("Firestore is not available.");
                await deleteDoc(doc(db, 'aidRequest', id));
                setNewsItems(prevItems => prevItems.filter(item => item.id !== id));
                alert(`Item ${id} deleted successfully.`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setError(`Failed to delete item ${id}. ${errorMessage}`);
                alert(`Error deleting item ${id}. Error: ${errorMessage}. See console for details.`);
            }
        }
    };

    return (
        <div className="w-full min-h-screen p-4 font-inter bg-gray-50">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                html { scroll-behavior: smooth; }
                .custom-red-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-red-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-red-scrollbar::-webkit-scrollbar-thumb { background: #DC2626; }
                .custom-red-scrollbar::-webkit-scrollbar-thumb:hover { background: #B91C1C; }
                .custom-red-scrollbar { scrollbar-width: thin; scrollbar-color: #DC2626 #f1f1f1; }
            `}</style>

            <div className={'bg-red-800 p-6 rounded-lg mb-6 text-white shadow relative overflow-hidden'}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-700 opacity-30 transform translate-x-1/4 -translate-y-1/4" aria-hidden="true"></div>
                <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-red-600 opacity-20" aria-hidden="true"></div>
                <div className="relative z-10">
                     <h1 className="text-3xl font-bold mb-2">Hello Admin!</h1>
                     <p className="text-base text-gray-200 font-medium mb-4 text-center md:text-left">
                          Manage and review news articles (aid requests) for the platform. Edit or delete requests as needed.
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

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800">News Feed Management (Aid Requests)</h2>
                </div>

                {isLoading ? (
                    <div className="p-10 text-center text-gray-600">Loading news articles... Please wait.</div>
                ) : error ? (
                    <div className="p-6 text-center text-red-700 border border-red-300 bg-red-50 rounded-md">
                        <p className="font-semibold text-lg">Error Loading News</p>
                        <p className="mt-2 text-sm">{error}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto overflow-y-auto max-h-[75vh] custom-red-scrollbar rounded-md overflow-hidden border-2 border-orange-500">
                        <table className="w-full min-w-[700px] table-auto border-collapse">
                            <thead className="bg-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 tracking-wider border-r border-orange-200 w-[5%]">#</th>
                                    <th className="px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 tracking-wider border-r border-orange-200 w-[13%]">News Title</th>
                                    <th className="px-3 py-2 text-center text-xs sm:text-sm font-semibold text-gray-700 tracking-wider border-r border-orange-200 w-[12%]">Actual Condition</th>
                                    <th className="px-3 py-2 text-center text-xs sm:text-sm font-semibold text-gray-700 tracking-wider border-r border-orange-200 w-[10%]">Classification</th>
                                    <th className="px-3 py-2 text-center text-xs sm:text-sm font-semibold text-gray-700 tracking-wider border-r border-orange-200 w-[10%]">Calamity Level</th>
                                    <th className="px-3 py-2 text-center text-xs sm:text-sm font-semibold text-gray-700 tracking-wider border-r border-orange-200 w-[13%]">Short Description</th>
                                    <th className="px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 tracking-wider border-r border-orange-200 w-[15%]">Location (Coords/Address)</th>
                                    <th className="px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 tracking-wider border-r border-orange-200 w-[10%]">Date & Time</th>
                                    <th className="px-3 py-2 text-center text-xs sm:text-sm font-semibold text-gray-700 tracking-wider w-[12%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-orange-200">
                                {newsItems.length > 0
                                    ? newsItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-orange-50 transition-colors duration-150 ease-in-out">
                                            <td className="px-3 py-2 text-sm font-bold text-orange-600 align-top border-r border-orange-200">{index + 1}</td>
                                            <td className="px-3 py-2 text-sm text-gray-800 font-bold align-top border-r border-orange-200">
                                                <Link href={`/news/${item.id}`} className="hover:underline" legacyBehavior={false}>
                                                    {`${item.calamityType} - ${item.calamityLevel}`}
                                                </Link>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-600 align-middle text-center border-r border-orange-200">
                                                {item.imageUrl ? (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={`Condition for ${item.calamityType} request ${item.id}`}
                                                        width={64}
                                                        height={64}
                                                        className="inline-block object-cover rounded"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-400">No Image</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-600 align-top text-center border-r border-orange-200">{item.calamityType}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 font-bold align-top text-center border-r border-orange-200">{item.calamityLevel}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 max-w-[12rem] truncate align-top border-r border-orange-200" title={item.shortDesc || ''}>
                                                {item.shortDesc || 'N/A'}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-600 align-top border-r border-orange-200 min-w-[12rem]">{item.location}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap align-top border-r border-orange-200">{`${item.date} ${item.time}`}</td>
                                            <td className="px-3 py-2 text-sm text-center whitespace-nowrap align-top">
                                                <button
                                                    onClick={() => handleEdit(item.id)}
                                                    className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded-full mr-1 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                                                    aria-label={`Edit ${item.calamityType} - ${item.id}`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                                                    aria-label={`Delete ${item.calamityType} - ${item.id}`}
                                                >
                                                   Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                    : (
                                        <tr key="no-items">
                                            <td colSpan={9} className="text-center py-10 px-3 text-gray-500">
                                                No news articles (aid requests) found.
                                            </td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default NewsArticlePage;
