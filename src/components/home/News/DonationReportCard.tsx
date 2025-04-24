// src/components/DonationReportCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { DonationReportItem } from '@/types/reportTypes'; // Adjust path if needed

// Helper function to format the timestamp (optional)
const formatDateTime = (isoString: string) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

const DonationReportCard = ({ item }: { item: DonationReportItem }) => {
  const linkHref = `/donations/${item.donationId || item.id}`;

  // Construct a dynamic summary
  const summary = `Donation by ${item.organizationName || 'an organization'}. Items: ${item.donatedTypes?.join(', ') || 'various'}. Responding to ${item.calamityType || 'an event'}.`;

  return (
    <Link href={`/donation/${item.id}`} key={item.id}>
      <div className="border-2 border-black rounded-2xl hover:shadow-[0px_10px_30px_rgba(0,0,0,0.7)] transition-shadow duration-300 bg-[#f3f3f3] p-4 h-96 flex flex-col">
        <div className="relative h-48">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title || 'Aid request image'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-2xl border-2 border-black"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-black rounded-2xl border-2 border-black">
              <span className="text-black">{item.calamityType || 'Event'}</span>
            </div>
          )}
          {item.calamityLevel && (
            <div className="absolute top-1 right-1 bg-red-500 text-white text-sm px-2 py-0.5 rounded-full font-semibold shadow-md">
              Level: {item.calamityLevel}
            </div>
          )}
          {/* Badge for Donation */}
          <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-md">
            Donation Report
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow p-1 flex flex-col justify-between">
          <div>
            <h2
              className="text-black font-semibold text-lg truncate mb-1"
              title={item.title}
            >
              {item.title || 'Aid Request'}
            </h2>
            <p className="text-gray-700 text-xs mb-2">
              by{' '}
              <span className="font-medium">
                {item.organizationName || 'Unknown Org'}
              </span>
            </p>
            <p className="text-black text-sm line-clamp-3 mb-3">
              {item.donationSummary || summary}
            </p>
            <p className="text-gray-600 text-xs mb-2">
              Donated Items:{' '}
              <span className="font-medium">
                {item.donatedTypes?.join(', ') || 'N/A'}
              </span>
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
              <span>Request: {formatDateTime(item.requestTimestamp)}</span>
              <span>Donated: {formatDateTime(item.donationTimestamp)}</span>
            </div>
            {/* Optional: Estimated Drop-off */}
            {item.estimatedDropoffDate && (
              <div className="text-right text-xs text-gray-500 mt-1">
                Est. Drop-off: {item.estimatedDropoffDate}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DonationReportCard;
