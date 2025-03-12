import { db } from "@/lib/Firebase-Admin";
import NewsGrid from "./News";

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

export async function fetchNews(): Promise<NewsDetail[]> {
    try {
        const newsRef = db.collection('aidRequest');
        const snapshot = await newsRef.orderBy('timestamp', 'desc').limit(20).get();

        const newsItems: NewsDetail[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.shortDesc || 'News Title',
                summary: data.calamityType ? `${data.calamityType} - ${data.calamityLevel || ''}` : 'News Summary',
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

    return (
        <div className="bg-white">
            <NewsGrid newsItems={initialNews} />;
        </div>
    )
}

export default NewsSection;