import { NextResponse } from 'next/server';
import { db } from '@/lib/Firebase-Admin';

export async function GET() {
  try {
    const snapshot = await db.collection('organizations').get();
    const organizations = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      profileImageUrl: doc.data().profileImageUrl,
    }));
    
    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}