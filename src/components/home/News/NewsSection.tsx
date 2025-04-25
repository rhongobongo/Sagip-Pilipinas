import { db } from '@/lib/Firebase-Admin';
import NewsGrid from './News';
import { DonationReportItem } from '@/types/reportTypes';
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
export async function fetchDonations(): Promise<DonationReportItem[]> {
  try {
    const donationsRef = db.collection('donations');
    const snapshot = await donationsRef.orderBy('timestamp', 'desc').get();

    const donationItems: DonationReportItem[] = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Try to get aid request data if it exists
        let imageUrl = null;
        let requestTimestamp = '';
        let calamityType = '';
        let calamityLevel = '';

        if (data.aidRequestId) {
          try {
            const aidRequestDoc = await db
              .collection('aidRequest')
              .doc(data.aidRequestId)
              .get();
            if (aidRequestDoc.exists) {
              const aidData = aidRequestDoc.data();
              imageUrl = aidData?.imageUrl || null;
              requestTimestamp = aidData?.timestamp
                ? aidData.timestamp.toDate().toISOString()
                : '';
              calamityType = aidData?.calamityType || '';
              calamityLevel = aidData?.calamityLevel || '';
            }
          } catch (error) {
            console.error('Error fetching associated aid request:', error);
          }
        }

        // Get donation types as an array
        const donatedTypes = Object.keys(data.donationTypes || {}).filter(
          (key) => data.donationTypes[key] === true
        );

        // Create a meaningful title based on organization and calamity type
        const title = `${data.organizationName || 'Organization'} Donation${calamityType ? ` for ${calamityType}` : ''}`;

        // Create a summary of what was donated
        let donationSummary = 'Donation includes: ';
        if (donatedTypes.length > 0) {
          donationSummary += donatedTypes.join(', ');
        } else {
          donationSummary += 'various aid items';
        }

        return {
          id: doc.id,
          donationId: doc.id,
          aidRequestId: data.aidRequestId || null,
          title: title,
          calamityType: calamityType,
          calamityLevel: calamityLevel,
          imageUrl: imageUrl,
          requestTimestamp: requestTimestamp,
          organizationId: data.organizationId || '',
          organizationName: data.organizationName || 'Unknown Organization',
          donationTimestamp: data.timestamp
            ? data.timestamp.toDate().toISOString()
            : '',
          estimatedDropoffDate: data.estimatedDropoffDate || undefined,
          donatedTypes: donatedTypes,
          donationSummary: donationSummary,
        };
      })
    );

    return donationItems;
  } catch (error) {
    console.error('Error fetching donations:', error);
    throw new Error('Failed to fetch donation items');
  }
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
  const donationNews = await fetchDonations();

  return (
    <div>
      <NewsGrid newsItems={initialNews} donationNewsItems={donationNews} />
    </div>
  );
};

export default NewsSection;
