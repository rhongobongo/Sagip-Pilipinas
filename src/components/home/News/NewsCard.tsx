import Image from 'next/image';
import Link from 'next/link';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  timestamp: string;
  calamityType: string;
  calamityLevel: string;
  slug: string;
}

const NewsCard = ({ item }: { item: NewsItem }) => {
  return (
    <Link href={`/news/${item.slug}`} key={item.id}>
      <div className="border-2 border-black rounded-2xl hover:shadow-[0px_10px_30px_rgba(0,0,0,0.7)] transition-shadow duration-300 bg-[#f3f3f3] p-4">
        <div className="relative h-48">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title || 'News image'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-2xl border-2 border-black "
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-black">
              <span className="text-black">{item.calamityType || 'News'}</span>
            </div>
          )}
          {item.calamityLevel && ( //Notification-like circle
            <div className="absolute top-1 right-1 bg-red-500 text-white text-sm px-2 py-0.5 rounded-full font-semibold shadow-md">
              Level: {item.calamityLevel}
            </div>
          )}
        </div>

        <div className="p-1">
          <div className="p-3 rounded-md">
            <h2 className="text-black font-medium text-lg truncate mb-2">
              {item.title || 'News Title'}
            </h2>
            <p className="text-black text-sm line-clamp-4">
              {item.summary || 'No summary available'}
            </p>

            {item.timestamp && (
              <div className="flex justify-end items-center text-xs text-black mt-2">
                <span>{item.timestamp}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
