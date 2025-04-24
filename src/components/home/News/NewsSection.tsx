import { db } from '@/lib/Firebase-Admin';
import NewsGrid from './News';

interface NewsDetail {
  id: string;
  title: string;
  summary: string;
  content?: string;
  imageUrl: string | null;
  timestamp: string;
  calamityType: string;
  calamityLevel: string;
  slug: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contactInfo?: string;
}

export async function fetchDonationNews(): Promise<NewsDetail[]> {
  try {
    const donationsRef = db.collection('donations');
    const snapshot = await donationsRef.orderBy('timestamp', 'desc').get();

    const donationNewsItems: NewsDetail[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Create a readable title based on donation details
      const donationType = Object.keys(data.donationTypes || {})
        .filter(type => data.donationTypes[type])
        .join(', ');
      
      // Create a summary from the donation details
      let summary = `Donation of ${donationType} to ${data.organizationName || 'an organization'}`;
      if (data.aidRequestId) {
        summary += ` for aid request #${data.aidRequestId.substring(0, 8)}`;
      }
      
      return {
        id: doc.id,
        title: `${donationType} Donation`,
        summary: summary,
        content: generateDonationContent(data),
        imageUrl: '/donation-image.jpg', // Use a default donation image
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : '',
        calamityType: 'Donation', // Set a category for donations
        calamityLevel: '', // Donations don't have calamity levels
        slug: doc.id,
      };
    });

    return donationNewsItems;
  } catch (error: unknown) {
    console.error('Error fetching donation news:', error);
    return []; // Return empty array instead of throwing
  }
}

// Helper function to generate readable content from donation details
function generateDonationContent(data: any): string {
  let content = `<p>Donation made to ${data.organizationName || 'an organization'}</p>`;
  
  if (data.estimatedDropoffDate) {
    content += `<p>Estimated dropoff date: ${data.estimatedDropoffDate}</p>`;
  }
  
  // Add details about each donation type
  Object.keys(data.donationTypes || {}).forEach(type => {
    if (data.donationTypes[type] && data.details && data.details[type]) {
      content += `<h3>${type.charAt(0).toUpperCase() + type.slice(1)}</h3>`;
      
      const typeDetails = data.details[type];
      Object.keys(typeDetails).forEach(detail => {
        if (typeDetails[detail]) {
          content += `<p>${detail}: ${typeDetails[detail]}</p>`;
        }
      });
    }
  });
  
  return content;
}

export async function fetchNews(): Promise<NewsDetail[]> {
  try {
    const newsRef = db.collection('aidRequest');
    const snapshot = await newsRef.orderBy('timestamp', 'desc').get();

    const newsItems: NewsDetail[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.shortDesc || 'News Title',
        summary: data.calamityType
          ? `${data.calamityType} - ${data.calamityLevel || ''}`
          : 'News Summary',
        content: data.content || '',
        imageUrl: data.imageUrl || '/placeholder-image.jpg',
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : '',
        calamityType: data.calamityType || '',
        calamityLevel: data.calamityLevel || '',
        slug: doc.id,
        location: data.location
          ? {
              latitude: data.location.latitude,
              longitude: data.location.longitude,
              address: data.location.address || '',
            }
          : undefined,
        contactInfo: data.contactInfo || '',
      };
    });

    return newsItems;
  } catch (error: unknown) {
    console.error('Error fetching news:', error);
    throw new Error('Failed to fetch news items');
  }
}

const NewsSection = async () => {
  const initialNews = await fetchNews();
  const donationNews = await fetchDonationNews(); // New function to fetch donation-specific news

  return (
    <div>
      <NewsGrid newsItems={initialNews} donationNewsItems={donationNews} />
    </div>
  );
};

export default NewsSection;