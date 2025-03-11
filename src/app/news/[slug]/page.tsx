import { db } from '@/lib/Firebase-Admin';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ClientMapWrapper from '@/components/map/ClientMapWrapper';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function NewsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
    const params = await props.params;
    
    if (!params.slug) {
        return notFound();
    }

    try {
        const newsRef = db.collection('aidRequest');
        const snapshot = await newsRef.doc(params.slug).get();

        if (!snapshot.exists) {
            return notFound();
        }

        const data = snapshot.data() ?? {};

        const newsItem = {
            id: snapshot.id,
            title: data.shortDesc || 'News Title',
            summary: data.calamityType
                ? `${data.calamityType} - ${data.calamityLevel}`
                : 'News Summary',
            imageUrl: data.imageUrl || '/placeholder-image.jpg',
            timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : '',
            calamityType: data.calamityType || 'Not specified',
            calamityLevel: data.calamityLevel || 'Not specified',
            name: data.name || 'Anonymous',
            contactNumber: data.contactNumber || 'Not provided',
            requestDate: data.date || 'Not specified',
            coordinates: data.coordinates
                ? { lat: data.coordinates.latitude, lng: data.coordinates.longitude }
                : undefined,
        };

        const formattedDate = newsItem.timestamp
            ? new Date(newsItem.timestamp).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            : 'Date unavailable';

        return (
            <main className="max-w-5xl mx-auto p-6 bg-[#F3F3F3] rounded-lg shadow-sm text-black">
                <article>
                    <header className="mb-6">
                        <h1 className="text-3xl font-bold mb-2 text-black">{newsItem.title}</h1>
                        <time className="text-sm text-black">{formattedDate}</time>
                    </header>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-2/3">
                            <p className="text-black text-lg leading-relaxed mb-6">{newsItem.summary}</p>

                            {/* Aid Request Details */}
                            <section className="mb-6">
                                <h2 className="text-xl font-semibold mb-3 text-black">Aid Request Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailCard title="Calamity Information">
                                        <DetailItem label="Type" value={newsItem.calamityType} />
                                        <DetailItem label="Level" value={newsItem.calamityLevel} />
                                        <DetailItem label="Date Reported" value={newsItem.requestDate} />
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
                                                    ? `${newsItem.coordinates.lat.toFixed(4)}, ${newsItem.coordinates.lng.toFixed(4)}`
                                                    : 'Location not available'
                                            }
                                        />
                                        {newsItem.coordinates && (
                                            <div className="h-64 w-full border border-gray-200 rounded-md overflow-hidden">
                                                <ClientMapWrapper
                                                    pin={{
                                                        id: newsItem.id,
                                                        coordinates: {
                                                            latitude: newsItem.coordinates.lat,
                                                            longitude: newsItem.coordinates.lng,
                                                        },
                                                    }}
                                                    options={{
                                                        zoom: 15,
                                                        center: {
                                                            lat: newsItem.coordinates.lat,
                                                            lng: newsItem.coordinates.lng,
                                                        },
                                                        zoomControl: true,
                                                        mapTypeControl: false,
                                                        streetViewControl: false,
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </DetailCard>
                                </div>
                            </section>

                            {/* Additional Information */}
                            <section className="mb-6">
                                <h2 className="text-xl font-semibold mb-3 text-black">Additional Information</h2>
                                <DetailCard>
                                    <p className="text-black">
                                        This aid request was submitted on {formattedDate}. Emergency services have been notified.
                                        Updates will be posted as the situation develops.
                                    </p>
                                </DetailCard>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <aside className="w-full md:w-1/3 sticky top-6">
                            <ImageCard imageUrl={newsItem.imageUrl} altText={newsItem.title} />
                            <StatusCard formattedDate={formattedDate} />
                            <EmergencyContacts />
                        </aside>
                    </div>
                </article>
            </main>
        );
    } catch (error) {
        console.error('Error fetching news:', error);
        return notFound();
    }
}

/* === Reusable Components === */
const DetailCard = ({ title, children, fullWidth = false }: { title?: string; children: React.ReactNode; fullWidth?: boolean }) => (
    <div className={`bg-white p-4 rounded-lg shadow-sm ${fullWidth ? 'md:col-span-2' : ''}`}>
        {title && <h3 className="font-medium mb-2 text-black">{title}</h3>}
        {children}
    </div>
);

const DetailItem = ({ label, value }: { label: string; value: string }) => (
    <p className="text-black mb-1">
        <span className="font-medium">{label}:</span> {value}
    </p>
);

const ImageCard = ({ imageUrl, altText }: { imageUrl: string; altText: string }) => (
    <div className="overflow-hidden rounded-lg mb-4">
        <Image src={imageUrl} alt={altText} width={400} height={300} className="w-full h-auto object-cover" />
    </div>
);

const StatusCard = ({ formattedDate }: { formattedDate: string }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <h3 className="font-medium mb-2 text-black">Request Status</h3>
        <div className="flex items-center">
            <span className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></span>
            <p className="text-black">Pending Assessment</p>
        </div>
        <p className="text-black mt-2 text-sm">Last updated: {formattedDate}</p>
    </div>
);

const EmergencyContacts = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium mb-2 text-black">Emergency Contacts</h3>
        <ul className="space-y-2">
            <li className="text-black">Emergency Hotline: 911</li>
            <li className="text-black">Disaster Response: 8-7000</li>
            <li className="text-black">Medical Assistance: 143</li>
        </ul>
    </div>
);