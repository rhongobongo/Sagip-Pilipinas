import { db } from '@/lib/Firebase-Admin';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ClientMapWrapper from '@/components/map/ClientMapWrapper'; // Import the new wrapper component

export default async function NewsPage({ params }: { params: { slug: string } }) {
  try {
    // Early return if slug is missing
    if (!params.slug) {
      return notFound();
    }

    const newsRef = db.collection('aidRequest');
    const snapshot = await newsRef.doc(params.slug).get();

    if (!snapshot.exists) {
      return notFound();
    }

    // Destructure data with default values for safety
    const data = snapshot.data() || {};
    const {
      shortDesc = 'News Title',
      calamityType = '',
      calamityLevel = '',
      imageUrl = '/placeholder-image.jpg',
      timestamp,
      name = 'Anonymous',
      contactNumber = 'Not provided',
      date = 'Not specified',
      coordinates,
    } = data;

    const newsItem = {
      id: snapshot.id,
      title: shortDesc,
      summary: calamityType ? `${calamityType} - ${calamityLevel}` : 'News Summary',
      imageUrl,
      timestamp: timestamp ? timestamp.toDate().toISOString() : '',
      calamityType,
      calamityLevel,
      name,
      contactNumber,
      requestDate: date,
      location: coordinates ? 
        `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}` : 
        'Location not available',
      slug: snapshot.id,
      coordinates: coordinates ? { lat: coordinates.latitude, lng: coordinates.longitude } : undefined,
    };

    const formattedDate = newsItem.timestamp 
      ? new Date(newsItem.timestamp).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
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
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3 text-black">Aid Request Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Calamity Info */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium mb-2 text-black">Calamity Information</h3>
                    <p className="text-black mb-1"><span className="font-medium">Type:</span> {newsItem.calamityType || 'Not specified'}</p>
                    <p className="text-black mb-1"><span className="font-medium">Level:</span> {newsItem.calamityLevel || 'Not specified'}</p>
                    <p className="text-black"><span className="font-medium">Date Reported:</span> {newsItem.requestDate}</p>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium mb-2 text-black">Contact Information</h3>
                    <p className="text-black mb-1"><span className="font-medium">Reported by:</span> {newsItem.name}</p>
                    <p className="text-black"><span className="font-medium">Contact Number:</span> {newsItem.contactNumber}</p>
                  </div>

                  {/* Location Info */}
                  <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-2">
                    <h3 className="font-medium mb-2 text-black">Location Details</h3>
                    <p className="text-black mb-2"><span className="font-medium">Coordinates:</span> {newsItem.location}</p>
                    
                    {/* Using the ClientMapWrapper component instead of direct GoogleMapComponent */}
                    {newsItem.coordinates && (
                      <div className="h-64 w-full border border-gray-200 rounded-md overflow-hidden">
                        <ClientMapWrapper
                          pin={{
                            id: newsItem.id,
                            coordinates: {
                              latitude: newsItem.coordinates.lat,
                              longitude: newsItem.coordinates.lng
                            }
                          }}
                          options={{
                            zoom: 15,
                            center: { lat: newsItem.coordinates.lat, lng: newsItem.coordinates.lng },
                            zoomControl: true,
                            mapTypeControl: false,
                            streetViewControl: false
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Additional content section */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3 text-black">Additional Information</h2>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-black">
                    This aid request was submitted on {formattedDate}. Emergency services have been notified.
                    Updates will be posted as the situation develops.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <div className="sticky top-6">
                <div className="overflow-hidden rounded-lg mb-4">
                  <Image
                    src={newsItem.imageUrl}
                    alt={newsItem.title}
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover"
                  />
                </div>
                
                {/* Status card */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <h3 className="font-medium mb-2 text-black">Request Status</h3>
                  <div className="flex items-center">
                    <span className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></span>
                    <p className="text-black">Pending Assessment</p>
                  </div>
                  <p className="text-black mt-2 text-sm">
                    Last updated: {formattedDate}
                  </p>
                </div>
                
                {/* Actions card */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2 text-black">Emergency Contacts</h3>
                  <ul className="space-y-2">
                    <li className="text-black">Emergency Hotline: 911</li>
                    <li className="text-black">Disaster Response: 8-7000</li>
                    <li className="text-black">Medical Assistance: 143</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    return notFound();
  }
}