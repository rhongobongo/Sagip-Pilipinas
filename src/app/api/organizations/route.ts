// app/api/organizations/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/Firebase-Admin'; // Adjust this import based on your firebase config path

export async function GET() {
  try {
    // Fetch all organizations from Firestore
    const organizationsSnapshot = await db.collection('organizations').get();
    
    // Convert the snapshot to an array of organization objects
    const organizations = organizationsSnapshot.docs.map(doc => ({
      ...doc.data(),
      userId: doc.id // Include the document ID as userId
    }));
    
    // Return the organizations as JSON
    return NextResponse.json(organizations, { status: 200 });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' }, 
      { status: 500 }
    );
  }
}