import Image from "next/image";
import Link from "next/link";

interface NewsItem {
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
            <div className="border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                    {item.imageUrl ? (
                        <Image
                            src={item.imageUrl}
                            alt={item.title || "News image"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">{item.calamityType || "News"}</span>
                        </div>
                    )}
                    {item.calamityLevel && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {item.calamityLevel}
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <h2 className="font-medium text-lg line-clamp-2 mb-2">{item.title || "News Title"}</h2>
                    <p className="text-gray-600 text-sm line-clamp-4">{item.summary || "No summary available"}</p>

                    {item.timestamp && (
                        <div className="flex justify-end items-center text-xs text-gray-500 mt-2">
                            <span>{item.timestamp}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default NewsCard;
