"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

// Define a type for raw API response items
interface RawNewsItem {
  id: string;
  title?: string;
  summary?: string;
  imageUrl?: string | null;
  timestamp?: string;
  calamityType?: string;
  calamityLevel?: string;
  slug: string;
}

const NewsGrid = () => {
  // State for news data
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Fetch news data from our API route
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/news', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Server error details:', errorData);
          throw new Error(`Server responded with ${response.status}: ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json() as RawNewsItem[];
        
        // Use a stable mapping that doesn't depend on random values
        const fetchedNews: NewsItem[] = data.map((item: RawNewsItem) => ({
          id: item.id,
          title: item.title || '',
          summary: item.summary || '',
          imageUrl: item.imageUrl || null,
          timestamp: item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-US') : '',
          calamityType: item.calamityType || '',
          calamityLevel: item.calamityLevel || '',
          slug: item.slug
        }));
        
        setNewsItems(fetchedNews);
        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(`Failed to fetch news items: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);
  
  // Filter news items based on search using memoization to avoid re-renders
  const filteredNews = searchTerm
    ? newsItems.filter(
        (item) => 
          (item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.calamityType.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.summary.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : newsItems;
    
  // Calculate total pages - ensure stable calculation
  const totalPages = Math.max(1, Math.ceil(filteredNews.length / itemsPerPage));
  
  // Get current items for the page safely
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  
  // Pagination handler - keep it stable
  const paginate = (pageNumber: number) => setCurrentPage(Math.min(pageNumber, totalPages));
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[#F3F3F3]">
        <div className="flex justify-center items-center h-64">
          <p>Loading news...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[#F3F3F3]">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 bg-[#F3F3F3]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Latest News</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      
      {/* News grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((item) => (
          <Link href={`/news/${item.slug}`} key={item.id}>
            <div className="border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48">
                {item.imageUrl ? (
                  <Image 
                    src={item.imageUrl} 
                    alt={item.title || 'News image'} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">{item.calamityType || 'News'}</span>
                  </div>
                )}
                {item.calamityLevel && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.calamityLevel}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h2 className="font-medium text-lg line-clamp-2 mb-2">{item.title || 'News Title'}</h2>
                <p className="text-gray-600 text-sm line-clamp-4">{item.summary || 'No summary available'}</p>
                
                {item.timestamp && (
                  <div className="flex justify-end items-center text-xs text-gray-500 mt-2">
                    <span>{item.timestamp}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 space-x-1">
          <button
            onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            &lt;
          </button>
          
          {[...Array(totalPages).keys()].map(number => (
            <button
              key={number + 1}
              onClick={() => paginate(number + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === number + 1
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              {number + 1}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsGrid;