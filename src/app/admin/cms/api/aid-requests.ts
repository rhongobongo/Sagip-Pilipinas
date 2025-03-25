// src/app/admin/cms/api/aid-requests.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAidRequests } from './fetchAidRequests'; // Import the helper function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const aidRequests = await fetchAidRequests(); // Fetch aid requests using the helper function
    res.status(200).json(aidRequests); // Send the fetched data as JSON
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ message: 'Failed to fetch aid requests' });
  }
}
