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
            <main className="mx-auto p-6 bg-[#F3F3F3] shadow-sm text-black">
                <div className="bg-[#B0022A] p-6 rounded-xl">
                    <article>
                        <header className="mb-4 text-white">
                            <h1 className="text-3xl font-bold mb-2">{newsItem.title}</h1>
                            <time className="text-sm">{formattedDate}</time>
                        </header>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-2/3">
                                <p className="text-white text-lg leading-relaxed mb-6">{newsItem.summary}</p>
                                {/* Aid Request Details */}
                                <section className="mb-6 rounded-xl p-4 bg-[#8F0022] border border-black">
                                    <h2 className="text-xl font-semibold mb-3 text-white tracking-wide">
                                        AID REQUEST DETAILS
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-bold">
                                        <DetailCard title={"Calamity Information:"} titleStyle={{ fontWeight: "bold" }} titleColor="#8F0022">
                                            <DetailItem label="Type" value={newsItem.calamityType} />
                                            <DetailItem label="Level" value={newsItem.calamityLevel} />
                                            <DetailItem label="Date Reported" value={newsItem.requestDate} />
                                        </DetailCard>

                                        <DetailCard title={"Contact Information:"} titleStyle={{ fontWeight: "bold" }} titleColor="#8F0022">
                                            <DetailItem label="Reported by" value={newsItem.name} />
                                            <DetailItem label="Contact Number" value={newsItem.contactNumber} />
                                        </DetailCard>

                                        <DetailCard title={"Location Details:"} titleStyle={{ fontWeight: "bold" }} titleColor="#8F0022" fullWidth>
                                            <DetailItem
                                                label="Coordinates"
                                                value={
                                                    newsItem.coordinates
                                                        ? `${newsItem.coordinates.lat.toFixed(4)}, ${newsItem.coordinates.lng.toFixed(4)}`
                                                        : 'Location not available'
                                                }
                                            />
                                            {newsItem.coordinates && (
                                                <div className="h-64 w-full border-4 border-black rounded-md overflow-hidden">
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
                                                        autoZoom={true} // Enable auto-zoom
                                                    />
                                                </div>
                                            )}
                                        </DetailCard>
                                    </div>
                                </section>

                                {/* Rest of the component remains the same */}
                                <section className="mb-6 w-[1409px]">
                                    <h2 className="text-xl font-semibold mb-3 text-white">
                                        Additional Information
                                    </h2>
                                    <DetailCard>
                                        <p className="text-black justify md:text-justify">
                                            This aid request was submitted on {formattedDate}. Emergency services have been notified.
                                            Updates will be posted as the situation develops. As for now, please keep updated on other
                                            news. Latest updates on any news will be reflected immediately.
                                        </p>
                                    </DetailCard>
                                </section>
                            </div>

                            {/* Sidebar */}
                            <div className="w-full h-[590px] md:w-1/3 top-6 mt-[53px] items-center justify-center">
                                <ImageCard imageUrl={newsItem.imageUrl} altText={newsItem.title} />
                                <StatusCard formattedDate={formattedDate} />
                                <EmergencyContacts />
                            </div>
                        </div>
                    </article>
                </div>
            </main>
        );
    } catch (error) {
        console.error('Error fetching news:', error);
        return notFound();
    }
}

/* === Reusable Components === */
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
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-black ${fullWidth ? 'md:col-span-2' : ''}`}>
        {title && (
            <h3
                style={{ ...titleStyle, color: titleColor }}
                className="font-medium mb-2 text-black"
            >
                {title}
            </h3>
        )}
        {children}
    </div>
);

const DetailItem = ({ label, labelStyle, value }: { label: string; labelStyle?: React.CSSProperties, value: string }) => (
    <p className="text-black mb-1">
        <span style={labelStyle} className="font-medium">{label}:</span> {value}
    </p>
);

const ImageCard = ({ imageUrl, altText }: { imageUrl: string; altText: string }) => {
    const aspectRatio = 16 / 9;
    const width = 400;
    const height = width / aspectRatio;

    return (
        <div className="relative overflow-hidden rounded-lg mb-4 border-4 border-black">
            <Image
                src={imageUrl}
                alt={altText}
                width={width}
                height={height}
                className="w-auto h-auto object-cover"
            />
        </div>
    );
};

const StatusCard = ({ formattedDate }: { formattedDate: string }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border-2 border-black">
        <h3 className="font-medium mb-2 text-[#8F0022] font-semibold">Request Status:</h3>
        <div className="flex items-center">
            <span className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></span>
            <p className="text-black">Pending Assessment</p>
        </div>
        <p className="text-black mt-2 text-sm">Last updated: {formattedDate}</p>
    </div>
);

const EmergencyContacts = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border-2  border-black">
        <h3 className="font-medium mb-2 text-[#8F0022] font-semibold">Emergency Contacts:</h3>
        <ul className="space-y-2">
            <li className="text-black">Emergency Hotline: 911</li>
            <li className="text-black">Disaster Response: 8-7000</li>
            <li className="text-black">Medical Assistance: 143</li>
        </ul>
    </div>
);