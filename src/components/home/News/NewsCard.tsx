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
            <div className="border-2 border-black rounded-2xl hover:shadow-[0px_10px_30px_rgba(0,0,0,0.7)] transition-shadow duration-300 bg-[#A11234]">
                <div className="relative h-48">
                    {item.imageUrl ? (
                        <Image
                            src={item.imageUrl}
                            alt={item.title || "News image"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="rounded-2xl border-2 border-black"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">{item.calamityType || "News"}</span>
                        </div>
                    )}
                    {item.calamityLevel && ( //Notification-like circle
                        <div className="absolute top-1 right-1 bg-red-500 text-white text-lg px-3 py-1 rounded-full font-bold">
                            {item.calamityLevel}
                        </div>
                    )}
                </div>

                <div className="p-1">
                    <div className="p-3 rounded-md">
                        <h2 className="font-medium text-lg line-clamp-2 mb-2">{item.title || "News Title"}</h2>
                        <p className="text-white text-sm line-clamp-4">{item.summary || "No summary available"}</p>

                        {item.timestamp && (
                            <div className="flex justify-end items-center text-xs text-white mt-2">
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
