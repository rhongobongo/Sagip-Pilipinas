// src/app/donations/[slug]/page.tsx
import { db } from '@/lib/Firebase-Admin';
import { notFound } from 'next/navigation';
import ImageCard from '@/components/ui/ImageCard';
import * as admin from 'firebase-admin';
import { getAuthTokens } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge';
import { cookies } from 'next/headers';
import ClientMapWrapper from '@/components/map/ClientMapWrapper';
import ScrollToMainOnLoad from '@/components/utils/ScrollToMainOnLoad';

import Link from 'next/link';
import { IoCloseCircleOutline } from 'react-icons/io5';

// Reuse the existing coordinate interfaces
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Get coordinates helper function
function getCoords(
  data: any | admin.firestore.GeoPoint | null
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

// Get the current user session (reused from NewsPage)
async function getCurrentUserSession(): Promise<{ userId: string | null }> {
  try {
    const cookieStore = await cookies();
    const tokens = await getAuthTokens(cookieStore);

    if (!tokens) {
      return { userId: null };
    }
    return { userId: tokens.decodedToken.uid };
  } catch (error) {
    console.error('Error getting user session in DonationPage:', error);
    return { userId: null };
  }
}

// Main Donation Detail Page Component
export default async function DonationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  // --- Data Fetching ---
  let donationData: admin.firestore.DocumentData | null = null;
  let linkedAidRequestData: admin.firestore.DocumentData | null = null;
  let organizationData: admin.firestore.DocumentData | null = null;
  let loggedInUserId: string | null = null;

  try {
    const session = await getCurrentUserSession();
    loggedInUserId = session.userId;

    // Fetch donation data
    const donationRef = db.collection('donations').doc(slug);
    const donationSnapshot = await donationRef.get();

    if (!donationSnapshot.exists) {
      console.error(`[Error] Donation with slug ${slug} not found.`);
      return notFound();
    }

    donationData = donationSnapshot.data() ?? {};

    // Fetch linked aid request data if available
    if (donationData.aidRequestId) {
      const aidRequestRef = db.collection('aidRequest').doc(donationData.aidRequestId);
      const aidRequestSnapshot = await aidRequestRef.get();

      if (aidRequestSnapshot.exists) {
        linkedAidRequestData = aidRequestSnapshot.data() ?? {};
      }
    }

    // Fetch organization data
    if (donationData.organizationId) {
      const orgRef = db.collection('organizations').doc(donationData.organizationId);
      const orgSnapshot = await orgRef.get();

      if (orgSnapshot.exists) {
        organizationData = orgSnapshot.data() ?? {};
      }
    }
  } catch (error) {
    console.error('Error during data fetching:', error);
    return notFound();
  }

  // --- Process Donation Data ---
  const donationTypes = donationData?.donationTypes
    ? Object.keys(donationData.donationTypes).filter(type => donationData.donationTypes[type])
    : [];

  // Prepare donation details
  const donationItem = {
    id: slug,
    title: linkedAidRequestData?.shortDesc || 'Donation Details',
    donationType: donationTypes.join(', '),
    imageUrl: linkedAidRequestData?.imageUrl || '/placeholder-donation.jpg',
    timestamp: donationData?.timestamp instanceof admin.firestore.Timestamp
      ? donationData.timestamp.toDate().toISOString()
      : new Date().toISOString(),
    estimatedDropoffDate: donationData?.estimatedDropoffDate || 'Not specified',
    calamityType: linkedAidRequestData?.calamityType || 'Not specified',
    calamityLevel: linkedAidRequestData?.calamityLevel || 'Not specified',
    organizationName: organizationData?.name || donationData?.organizationName || 'Anonymous Donor',
    organizationContact: organizationData?.phoneNumber || donationData?.contactInfo || 'Not provided',
    coordinates: linkedAidRequestData?.coordinates
      ? getCoords(linkedAidRequestData.coordinates)
      : null,
    aidRequestId: donationData?.aidRequestId || null,
    donationDetails: donationData?.details || {},
  };

  const formattedDate = donationItem.timestamp
    ? new Date(donationItem.timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'Date unavailable';

  // --- Render Donation Detail Page ---
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
              <h1 className="text-3xl font-bold mb-2"> Donation: {donationItem.title}</h1>              <Link
                href="/" //padulong ni home
                className="inline-flex items-center text-white hover:text-gray-300 transition-colors duration-200" // Adjusted hover for icon
                aria-label="Back to News Feed"
              >
                <IoCloseCircleOutline className="h-16 w-16" />
              </Link>
            </div>

            <p className="text-sm">Donated on: {formattedDate}</p>
            {donationItem.aidRequestId && (
              <p className="text-sm mt-2">
                <a href={`/news/${donationItem.aidRequestId}`} className="underline hover:text-blue-200">
                  View Original Aid Request
                </a>
              </p>
            )}
          </header>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Content Area */}
            <div className="w-full lg:w-2/3">
              {/* Donation Details */}
              <section className="mb-6 rounded-xl p-4 bg-[#8F0022] border border-black">
                <h2 className="text-xl font-semibold mb-3 text-white tracking wide">
                  DONATION OVERVIEW
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-bold">
                  <DetailCard
                    title={'Donation Information'}
                    titleStyle={{ fontWeight: 'bold' }}
                    titleColor="#8F0022"
                  >
                    <DetailItem label="Items Donated" value={donationItem.donationType} />
                    <DetailItem label="Date Donated" value={formattedDate} />
                    <DetailItem label="Est. Dropoff" value={donationItem.estimatedDropoffDate} />
                  </DetailCard>

                  <DetailCard
                    title={'Donor Information'}
                    titleStyle={{ fontWeight: 'bold' }}
                    titleColor="#8F0022"
                  >
                    <DetailItem label="Organization" value={donationItem.organizationName} />
                    <DetailItem label="Contact" value={donationItem.organizationContact} />
                  </DetailCard>

                  {linkedAidRequestData && (
                    <DetailCard
                      title={'Aid Request Information'}
                      titleStyle={{ fontWeight: 'bold' }}
                      titleColor="#8F0022"
                      fullWidth
                    >
                      <DetailItem label="Calamity Type" value={donationItem.calamityType} />
                      <DetailItem label="Calamity Level" value={donationItem.calamityLevel} />
                    </DetailCard>
                  )}

                  {donationItem.coordinates && (
                    <DetailCard
                      title={'Delivery Location'}
                      titleStyle={{ fontWeight: 'bold' }}
                      titleColor="#8F0022"
                      fullWidth
                    >
                      <DetailItem
                        label="Coordinates"
                        value={
                          `${donationItem.coordinates.latitude.toFixed(4)}, ${donationItem.coordinates.longitude.toFixed(4)}`
                        }
                      />
                      <div className="h-64 w-full border-4 border-black rounded-md overflow-hidden mt-2">
                        <ClientMapWrapper
                          pin={{
                            id: donationItem.id,
                            coordinates: {
                              latitude: donationItem.coordinates.latitude,
                              longitude: donationItem.coordinates.longitude,
                            },
                            title: donationItem.title,
                            type: 'Donation',
                          }}
                          options={{
                            center: {
                              lat: donationItem.coordinates.latitude,
                              lng: donationItem.coordinates.longitude,
                            },
                            zoom: 15,
                            disableDefaultUI: true,
                            zoomControl: true,
                          }}
                        />
                      </div>
                    </DetailCard>
                  )}
                </div>
              </section>

              {/* Detailed Donation Items Section */}
              <section className="mb-6 w-full">
                <h2 className="text-xl font-semibold mb-3 text-white">
                  Donation Details
                </h2>
                <DetailCard>
                  {donationTypes.length > 0 ? (
                    <div className="space-y-4">
                      {donationTypes.map((type) => (
                        <div key={type} className="border-b pb-3 last:border-b-0">
                          <h3 className="font-medium text-lg capitalize mb-2">{type}</h3>
                          {donationItem.donationDetails[type] && (
                            <div className="ml-4">
                              {Object.entries(donationItem.donationDetails[type]).map(([key, value]) => (
                                <DetailItem key={key} label={key} value={value as string} />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-black">No detailed information available for this donation.</p>
                  )}
                </DetailCard>
              </section>
            </div>

            {/* Sidebar Area */}
            <aside className="w-full md:w-1/3 space-y-6">
              <ImageCard
                imageUrl={donationItem.imageUrl}
                altText={`Donation for ${donationItem.title}`}
              />

              <StatusCard
                status="Donation Recorded"
                formattedDate={formattedDate}
                estimatedDropoff={donationItem.estimatedDropoffDate}
              />

              <ThankYouMessage organizationName={donationItem.organizationName} />
            </aside>
          </div>
        </article>
      </div>
      <ScrollToMainOnLoad />
    </main>
  );
}

// --- Reusable Components ---

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

const StatusCard = ({
  status,
  formattedDate,
  estimatedDropoff
}: {
  status: string;
  formattedDate: string;
  estimatedDropoff: string;
}) => (
  <DetailCard title="Donation Status">
    <div className="flex items-center mb-2">
      <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
      <p className="text-black font-medium">{status}</p>
    </div>
    <p className="text-black text-xs">Recorded on: {formattedDate}</p>
    {estimatedDropoff && estimatedDropoff !== 'Not specif   ied' && (
      <p className="text-black text-xs mt-2">
        Estimated delivery: {estimatedDropoff}
      </p>
    )}
  </DetailCard>
);

const ThankYouMessage = ({ organizationName }: { organizationName: string }) => (
  <DetailCard title="Thank You">
    <p className="text-black text-sm">
      Special thanks to <span className="font-medium">{organizationName}</span> for their generous donation. This support makes a significant difference in the response efforts.
    </p>
  </DetailCard>
);