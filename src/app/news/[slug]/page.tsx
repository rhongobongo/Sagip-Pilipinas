import { db } from '@/lib/Firebase-Admin';
import { notFound } from 'next/navigation';
import ClientMapWrapper from '@/components/map/ClientMapWrapper';
import * as admin from 'firebase-admin';
import RespondToAidRequestSection from '@/components/news/RespondToAidRequestSection';

import { getAuthTokens } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge';
import { cookies } from 'next/headers';
import ImageCard from '@/components/ui/ImageCard'; // Adjust path as needed
import ScrollToMainOnLoad from '@/components/utils/ScrollToMainOnLoad';

import Link from 'next/link';
import { IoCloseCircleOutline } from 'react-icons/io5';

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
    Math.cos(deg2rad(point1.latitude)) *
      Math.cos(deg2rad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Define more specific type to replace 'any'
interface GeoData {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
}

function getCoords(
  data: GeoData | admin.firestore.GeoPoint | null
): Coordinates | null {
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
    // Get cookies and properly await them
    const cookieStore = await cookies();

    // Now pass the cookie store to get auth tokens
    const tokens = await getAuthTokens(cookieStore);

    if (!tokens) {
      return { userId: null };
    }
    return { userId: tokens.decodedToken.uid };
  } catch (error) {
    console.error('Error getting user session in NewsPage:', error);
    return { userId: null };
  }
}

// --- Main Page Component ---
export default async function NewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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
    timestamp:
      newsItemData?.timestamp instanceof admin.firestore.Timestamp
        ? newsItemData.timestamp.toDate().toISOString()
        : newsItemData?.submissionDate && newsItemData?.submissionTime
          ? new Date(
              `${newsItemData.submissionDate} ${newsItemData.submissionTime}`
            ).toISOString()
          : new Date().toISOString(),
    calamityType: newsItemData?.calamityType || 'Not specified',
    calamityLevel: newsItemData?.calamityLevel || 'Not specified',
    name: newsItemData?.name || 'Anonymous',
    contactNumber: newsItemData?.contactNumber || 'Not provided',
    requestDate: newsItemData?.submissionDate || 'Not specified',
    coordinates: getCoords(newsItemData?.coordinates),
    aidRequested: newsItemData?.aidRequest || 'Details not provided',
  };

  const formattedDate = newsItem.timestamp
    ? new Date(newsItem.timestamp).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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
      distanceKm = calculateDistance(
        newsItem.coordinates,
        organizationCoordinates
      );
      isNearby = distanceKm <= 20;
    }
  }

  // Condition to show the button section
  const showSendHelpSection =
    isOrganizationLoggedIn &&
    organizationCoordinates &&
    newsItem.coordinates &&
    isNearby;

  // --- Render Page ---
  return (
    <main
      id="main-content-area"
      className="mx-auto lg:py-6 bg-[#fffdfd] shadow-sm text-black transition-all duration-300"
    >
      <div className="bg-[#B0022A] p-6 w-full lg:w-3/4 lg:rounded-xl mx-auto lg:h-full">
        <article>
          <header className="mb-4 text-white">
            {/*for back button na circle*/}
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold"> {newsItem.title} </h1>
              <Link
                href="/" //padulong ni home
                className="inline-flex items-center text-white hover:text-gray-300 transition-colors duration-200" // Adjusted hover for icon
                aria-label="Back to News Feed"
              >
                <IoCloseCircleOutline className="h-16 w-16" />
              </Link>
            </div>

            <p className="text-sm">Posted on: {formattedDate}</p>
          </header>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full">
              {/* Main Content Area */}
              <div className="w-full space-y-6">
                {/* --- Conditional Send Help Section --- */}
                {showSendHelpSection && (
                  <RespondToAidRequestSection
                    aidRequestId={newsItem.id}
                    distance={distanceKm}
                    organizationName={orgData?.name || 'Your Organization'}
                  />
                )}
              </div>

              {/* Aid Request Details */}
              <section className="mb-6 rounded-xl p-4 bg-[#8F0022] border border-black">
                <h2 className="text-xl font-semibold mb-3 text-white tracking wide">
                  REQUEST OVERVIEW
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-bold">
                  <DetailCard
                    title={'Calamity Information'}
                    titleStyle={{ fontWeight: 'bold' }}
                    titleColor="#8F0022"
                  >
                    <DetailItem label="Type" value={newsItem.calamityType} />
                    <DetailItem label="Level" value={newsItem.calamityLevel} />
                    <DetailItem
                      label="Date Reported"
                      value={newsItem.requestDate}
                    />
                    <DetailItem
                      label="Aid Requested"
                      value={newsItem.aidRequested}
                    />
                  </DetailCard>

                  <DetailCard
                    title={'Contact Information'}
                    titleStyle={{ fontWeight: 'bold' }}
                    titleColor="#8F0022"
                  >
                    <DetailItem label="Reported by" value={newsItem.name} />
                    <DetailItem
                      label="Contact Number"
                      value={newsItem.contactNumber}
                    />
                  </DetailCard>

                  <DetailCard
                    title={'Location Details'}
                    titleStyle={{ fontWeight: 'bold' }}
                    titleColor="#8F0022"
                    fullWidth
                  >
                    <DetailItem
                      label="Coordinates"
                      value={
                        newsItem.coordinates
                          ? `${newsItem.coordinates.latitude.toFixed(4)}, ${newsItem.coordinates.longitude.toFixed(4)}`
                          : 'Location not available'
                      }
                    />
                    {newsItem.coordinates && (
                      <div className="h-64 w-full border-4 border-black rounded-md overflow-hidden">
                        <ClientMapWrapper
                          pin={{
                            id: newsItem.id,
                            coordinates: {
                              latitude: newsItem.coordinates.latitude,
                              longitude: newsItem.coordinates.longitude,
                            },
                            title: newsItem.title,
                            type: newsItem.calamityType,
                          }}
                          options={{
                            center: {
                              lat: newsItem.coordinates.latitude,
                              lng: newsItem.coordinates.longitude,
                            },
                            zoom: 15,
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
              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3 text-white">
                  Summary
                </h2>
                <DetailCard>
                  <p className="text-black leading-relaxed">{newsItem.title}</p>
                  <p className="text-sm text-black justify md:text-justify text-wrap overflow-y-auto">
                    This aid request was submitted on {formattedDate}. Emergency
                    services have been notified. Updates will be posted as the
                    situation develops. As for now, please keep updated on other
                    news. Latest updates on any news will be reflected
                    immediately.
                  </p>
                </DetailCard>
              </section>
            </div>

            {/* Sidebar Area */}
            <aside className="w-full md:w-1/3 space-y-6">
              <ImageCard
                imageUrl={newsItem.imageUrl}
                altText={newsItem.title}
              />
              {isOrganizationLoggedIn && organizationCoordinates && (
                <DetailCard title="Your Location Proximity">
                  <DetailItem
                    label="Your Coordinates"
                    value={`${organizationCoordinates.latitude.toFixed(4)}, ${organizationCoordinates.longitude.toFixed(4)}`}
                  />
                  <DetailItem
                    label="Distance to Request"
                    value={
                      distanceKm !== null
                        ? `${distanceKm.toFixed(2)} km`
                        : 'N/A'
                    }
                  />
                </DetailCard>
              )}
              <EmergencyContacts />
            </aside>
          </div>
        </article>
      </div>
      <ScrollToMainOnLoad />
    </main>
  );
}

// --- Reusable Components (Defined directly in this file, EXCEPT ImageCard) ---

const DetailCard = ({
  title,
  titleStyle,
  titleColor,
  children,
  fullWidth = false,
}: {
  title?: string;
  titleStyle?: React.CSSProperties;
  titleColor?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) => (
  <div
    className={`bg-white p-4 rounded-lg shadow-sm border border-black ${fullWidth ? 'md:col-span-2' : ''}`}
  >
    {title && (
      <h3
        style={{ ...titleStyle, color: titleColor }}
        className="font-medium mb-2 text-black"
      >
        {title}
      </h3>
    )}
    <div className="space-y-2">{children}</div>
  </div>
);

const DetailItem = ({
  label,
  labelStyle,
  value,
}: {
  label: string;
  labelStyle?: React.CSSProperties;
  value: string | number;
}) => (
  <p className="text-black mb-1">
    <span style={labelStyle} className="font-medium">
      {label}:
    </span>{' '}
    {value}
  </p>
);

// ImageCard definition is removed (should be imported)

const EmergencyContacts = () => (
  <DetailCard title="Emergency Contacts">
    <ul className="space-y-2">
      <li className="text-sm text-black">
        Emergency Hotline:{' '}
        <span className="font-medium text-gray-900">911</span>
      </li>
      <li className="text-sm text-black">
        Disaster Response:{' '}
        <span className="font-medium text-gray-900">8-7000</span>
      </li>
      <li className="text-sm text-black">
        Medical Assistance:{' '}
        <span className="font-medium text-gray-900">143</span>
      </li>
    </ul>
  </DetailCard>
);
