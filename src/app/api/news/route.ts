import { db } from '@/lib/Firebase-Admin';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Make sure you're using the correct collection
    const newsRef = db.collection('aidRequest'); // or 'news' if you have a separate collection
    const snapshot = await newsRef
                          .orderBy('timestamp', 'desc')
                          .limit(20)
                          .get();
    
    const newsItems = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.shortDesc || 'News Title',
        summary: data.calamityType ? `${data.calamityType} - ${data.calamityLevel || ''}` : 'News Summary',
        imageUrl: data.imageUrl || '/placeholder-image.jpg', // Adjust field name if needed
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : '',
        calamityType: data.calamityType || '',
        calamityLevel: data.calamityLevel || '',
        slug: doc.id,
      };
    });

    return new Response(JSON.stringify(newsItems), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch news items' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}