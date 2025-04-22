// src/app/api/volunteers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/Firebase-Admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('orgId'); // Expecting ?orgId=... query parameter

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID (orgId) is required' }, { status: 400 });
    }

    console.log(`API Route: Fetching volunteers for orgId: ${organizationId}`); // Server log

    const volunteersSnapshot = await db.collection('volunteers')
                                     .where('organizationId', '==', organizationId)
                                     .get();

    if (volunteersSnapshot.empty) {
       console.log(`API Route: No volunteers found for orgId: ${organizationId}`);
      return NextResponse.json([], { status: 200 }); // Return empty array
    }

    const volunteers = volunteersSnapshot.docs.map(doc => {
      const data = doc.data();
      // Return only necessary fields
      return {
        userId: doc.id,
        email: data.email || null,
        firstName: data.firstName || 'Volunteer',
      };
    }).filter(v => v.email); // Ensure email exists

    console.log(`API Route: Found ${volunteers.length} volunteers with email for orgId: ${organizationId}`);
    return NextResponse.json(volunteers, { status: 200 });

  } catch (error) {
    console.error('Error fetching volunteers by organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteers' },
      { status: 500 }
    );
  }
}