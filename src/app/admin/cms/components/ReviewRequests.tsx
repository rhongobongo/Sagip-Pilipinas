// src/app/admin/cms/components/ReviewRequests.tsx
import { useState, useEffect } from 'react';

const ReviewRequests = () => {
  const [aidRequests, setAidRequests] = useState<any[]>([]); // Declare the state type
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadAidRequests = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/cms/api/aid-requests`); // Use absolute URL
        if (!response.ok) throw new Error('Failed to fetch aid requests');
        
        const data = await response.json();
        console.log('Fetched data:', data); // Log to verify the data structure
        setAidRequests(data);
      } catch (err: any) {
        console.error("Error fetching aid requests:", err);
        setError("Failed to load aid requests.");
      } finally {
        setLoading(false);
      }
    };

    loadAidRequests();
  }, []);

  if (loading) return <p>Loading aid requests...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Submitted Aid Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aidRequests.map((request) => (
          <div key={request.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{request.name}</h3>
            <p><strong>Contact:</strong> {request.contactNum}</p>
            <p><strong>Calamity:</strong> {request.calamityType}</p>
            <p><strong>Level:</strong> {request.calamityLevel}</p>
            <p><strong>Description:</strong> {request.shortDesc}</p>
            <p><strong>Submitted On:</strong> {new Date(request.submissionDate).toLocaleString()}</p> {/* Format date */}
            {request.imageUrl && <img src={request.imageUrl} alt="Aid request" className="w-full h-40 object-cover mt-2" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewRequests;
