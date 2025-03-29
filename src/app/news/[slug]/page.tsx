
import { db } from '@/lib/Firebase-Admin'; 
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ClientMapWrapper from '@/components/map/ClientMapWrapper'; 
import * as admin from 'firebase-admin';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

import { getAuthTokens } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge'; 
import { cookies } from 'next/headers'; 

// --- Import the EXTERNAL ImageCard Client Component ---
import ImageCard from '@/components/ui/ImageCard'; // Adjust path as needed

// --- Helper Functions (Defined directly in this file) ---
interface Coordinates {
    latitude: number;
    longitude: number;
}

function calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Earth radius in kilometers
    const dLat = deg2rad(point2.latitude - point1.latitude);
    const dLon = deg2rad(point2.longitude - point1.longitude);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(point1.latitude)) * Math.cos(deg2rad(point2.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

function getCoords(data: any): Coordinates | null {
    if (!data) return null;
    if (data instanceof admin.firestore.GeoPoint) {
        return { latitude: data.latitude, longitude: data.longitude };
    }
    if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return { latitude: data.latitude, longitude: data.longitude };
    }
    if (typeof data.lat === 'number' && typeof data.lng === 'number') {
        return { latitude: data.lat, longitude: data.lng };
    }
    return null;
}
async function getCurrentUserSession(): Promise<{ userId: string | null }> {
    try {
        // Explicitly assert the type of the return value of cookies()
        const cookieStore = cookies() as ReadonlyRequestCookies;

        // Now pass the asserted value
        const tokens = await getAuthTokens(cookieStore);

        if (!tokens) {
            return { userId: null };
        }
        return { userId: tokens.decodedToken.uid };

    } catch (error) {
        console.error("Error getting user session in NewsPage:", error);
        return { userId: null };
    }
}
interface NewsPageProps {
    params: { slug: string };
}

// --- Main Page Component ---
export default async function NewsPage({ params }: NewsPageProps) {

    const slug = params.slug;
    if (!slug) {
        return notFound();
    }

    // --- Data Fetching ---
    let newsItemData: admin.firestore.DocumentData | null = null;
    let orgData: admin.firestore.DocumentData | null = null;
    let loggedInUserId: string | null = null;

    try {
        const session = await getCurrentUserSession();
        loggedInUserId = session.userId;

        const newsRef = db.collection('aidRequest').doc(slug);
        const newsSnapshot = await newsRef.get();

        if (!newsSnapshot.exists) {
            console.error(`[Error] Aid Request with slug ${slug} not found.`);
            return notFound();
        }
        newsItemData = newsSnapshot.data() ?? {};

        if (loggedInUserId) {
            const orgRef = db.collection('organizations').doc(loggedInUserId);
            const orgSnapshot = await orgRef.get();
            if (orgSnapshot.exists) {
                orgData = orgSnapshot.data() ?? {};
            }
        }

    } catch (error) {
        console.error('Error during data fetching:', error);
        return notFound(); // Or render a specific error component
    }

    // --- Data Processing ---
    const newsItem = {
        id: slug,
        title: newsItemData?.shortDesc || 'Aid Request Details',
        summary: newsItemData?.calamityType
            ? `${newsItemData.calamityType} - Level ${newsItemData.calamityLevel || 'N/A'}`
            : 'Details unavailable',
        imageUrl: newsItemData?.imageUrl || '/placeholder-image.jpg',
        timestamp: newsItemData?.timestamp instanceof admin.firestore.Timestamp
            ? newsItemData.timestamp.toDate().toISOString()
            : (newsItemData?.submissionDate && newsItemData?.submissionTime
                ? new Date(`${newsItemData.submissionDate} ${newsItemData.submissionTime}`).toISOString()
                : new Date().toISOString()),
        calamityType: newsItemData?.calamityType || 'Not specified',
        calamityLevel: newsItemData?.calamityLevel || 'Not specified',
        name: newsItemData?.name || 'Anonymous',
        contactNumber: newsItemData?.contactNumber || 'Not provided',
        requestDate: newsItemData?.submissionDate || 'Not specified',
        coordinates: getCoords(newsItemData?.coordinates),
        aidRequested: newsItemData?.aidRequest || 'Details not provided'
    };

    const formattedDate = newsItem.timestamp
        ? new Date(newsItem.timestamp).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'Date unavailable';

    // --- Proximity Logic ---
    let distanceKm: number | null = null;
    let isNearby = false;
    const isOrganizationLoggedIn = !!orgData;
    let organizationCoordinates: Coordinates | null = null;

    if (isOrganizationLoggedIn && newsItem.coordinates) {
        organizationCoordinates = getCoords(orgData?.coordinates);
        if (organizationCoordinates) {
            distanceKm = calculateDistance(newsItem.coordinates, organizationCoordinates);
            isNearby = distanceKm <= 20;
        }
    }

    // Condition to show the button section
    const showSendHelpSection = isOrganizationLoggedIn && organizationCoordinates && newsItem.coordinates && isNearby;

    // --- Render Page ---
    return (
        <main className="max-w-5xl mx-auto p-6 bg-[#F3F3F3] rounded-lg shadow-sm text-black">
            <article>
                <header className="mb-6">
                    <h1 className="text-3xl font-bold mb-2 text-black">{newsItem.title}</h1>
                    <p className="text-sm text-gray-600">Posted on: {formattedDate}</p>
                </header>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Main Content Area */}
                    <div className="w-full md:w-2/3 space-y-6">

                         {/* --- Conditional Send Help Section --- */}
                         {showSendHelpSection && (
                            <RespondToAidRequestSection
                                aidRequestId={newsItem.id}
                                distance={distanceKm}
                                organizationName={orgData?.name || 'Your Organization'}
                            />
                         )}
                         {/* --- End Conditional Section --- */}

                        {/* Aid Request Details */}
                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-black border-b pb-2">Request Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailCard title="Calamity Information">
                                    <DetailItem label="Type" value={newsItem.calamityType} />
                                    <DetailItem label="Level" value={newsItem.calamityLevel} />
                                    <DetailItem label="Date Reported" value={newsItem.requestDate} />
                                    <DetailItem label="Aid Requested" value={newsItem.aidRequested} />
                                </DetailCard>

                                <DetailCard title="Contact Information">
                                    <DetailItem label="Reported by" value={newsItem.name} />
                                    <DetailItem label="Contact Number" value={newsItem.contactNumber} />
                                </DetailCard>

                                <DetailCard title="Location Details" fullWidth>
                                    <DetailItem
                                        label="Coordinates"
                                        value={
                                            newsItem.coordinates
                                                ? `${newsItem.coordinates.latitude.toFixed(4)}, ${newsItem.coordinates.longitude.toFixed(4)}`
                                                : 'Location not available'
                                        }
                                    />
                                    {newsItem.coordinates && (
                                        <div className="mt-2 h-64 w-full border border-gray-300 rounded-md overflow-hidden shadow-inner">
                                            <ClientMapWrapper
                                                pin={{
                                                    id: newsItem.id,
                                                    coordinates: { latitude: newsItem.coordinates.latitude, longitude: newsItem.coordinates.longitude },
                                                    title: newsItem.title,
                                                    type: newsItem.calamityType,
                                                }}
                                                options={{
                                                    center: { lat: newsItem.coordinates.latitude, lng: newsItem.coordinates.longitude },
                                                    zoom: 14,
                                                    disableDefaultUI: true,
                                                    zoomControl: true,
                                                }}
                                            />
                                        </div>
                                    )}
                                </DetailCard>
                            </div>
                        </section>

                        {/* Additional Info / Summary */}
                        <section>
                             <h2 className="text-xl font-semibold mb-3 text-black border-b pb-2">Summary</h2>
                             <DetailCard>
                                <p className="text-black leading-relaxed">{newsItem.title}</p>
                                <p className="text-sm text-gray-500 mt-4">
                                    This aid request requires immediate attention. Please assess the details and respond if possible.
                                </p>
                            </DetailCard>
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="w-full md:w-1/3 space-y-6">
                        <ImageCard imageUrl={newsItem.imageUrl} altText={newsItem.title} />
                        <StatusCard formattedDate={formattedDate} />
                         {isOrganizationLoggedIn && organizationCoordinates && (
                             <DetailCard title="Your Location Proximity">
                                 <DetailItem label="Your Coordinates" value={`${organizationCoordinates.latitude.toFixed(4)}, ${organizationCoordinates.longitude.toFixed(4)}`} />
                                 <DetailItem label="Distance to Request" value={distanceKm !== null ? `${distanceKm.toFixed(2)} km` : 'N/A'} />
                             </DetailCard>
                         )}
                        <EmergencyContacts />
                    </aside>
                </div>
            </article>
        </main>
    );
}


// --- Reusable Components (Defined directly in this file, EXCEPT ImageCard) ---

const DetailCard = ({ title, children, fullWidth = false }: { title?: string; children: React.ReactNode; fullWidth?: boolean }) => (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${fullWidth ? 'md:col-span-2' : ''}`}>
        {title && <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>}
        <div className="space-y-2">{children}</div>
    </div>
);

const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
    <p className="text-sm text-gray-700">
        <span className="font-medium text-gray-900">{label}:</span> {value}
    </p>
);

// ImageCard definition is removed (should be imported)

const StatusCard = ({ formattedDate }: { formattedDate: string }) => (
    <DetailCard title="Request Status">
        <div className="flex items-center mb-2">
            <span className="h-3 w-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
            <p className="text-gray-800 font-medium">Pending Assessment</p>
        </div>
        <p className="text-gray-600 text-xs">Last update approx: {formattedDate}</p>
    </DetailCard>
);

const EmergencyContacts = () => (
     <DetailCard title="Emergency Contacts">
        <ul className="space-y-1">
            <li className="text-sm text-gray-700">Emergency Hotline: <span className="font-medium text-gray-900">911</span></li>
            <li className="text-sm text-gray-700">Disaster Response: <span className="font-medium text-gray-900">8-7000</span></li>
            <li className="text-sm text-gray-700">Medical Assistance: <span className="font-medium text-gray-900">143</span></li>
        </ul>
    </DetailCard>
);

const RespondToAidRequestSection = ({ aidRequestId, distance, organizationName }: { aidRequestId: string; distance: number | null; organizationName: string }) => {
    // Button currently uses a placeholder alert.
    // TODO: Implement actual functionality (Server Action or Client Component logic)
    return (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-2">Respond to this Request</h3>
            <p className="text-sm mb-1">
                This aid request is located approximately <span className="font-bold">{distance?.toFixed(1) ?? 'N/A'} km</span> from your organization's registered location ({organizationName}).
            </p>
            <p className="text-sm mb-3">
                Your assistance may be valuable here. Would you like to assess this request further or initiate a response?
            </p>
            <button
                 onClick={() => alert(`(Placeholder) Button clicked for aid request: ${aidRequestId}. Implement actual action.`)}
                 className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out"
             >
                Send Help / Respond
            </button>
        </div>
    );
};