'use client';

import { useState, useEffect, useRef } from 'react';
import NewsCard from './NewsCard';

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

interface NewsGridProps {
  newsItems: NewsItem[];
}

const NewsGrid = ({ newsItems }: NewsGridProps) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const scrollTargetRef = useRef<HTMLDivElement>(null);

  const filteredNews = searchTerm
    ? newsItems.filter(
      (item) => {
        const term = searchTerm.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(term) ?? false;
        const typeMatch = item.calamityType?.toLowerCase().includes(term) ?? false;
        const summaryMatch = item.summary?.toLowerCase().includes(term) ?? false;
        return titleMatch || typeMatch || summaryMatch;
      })
    : newsItems;

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) =>
    setCurrentPage(Math.min(Math.max(1, pageNumber), totalPages));

  useEffect(() => {
    if (scrollTargetRef.current) {
      scrollTargetRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [safeCurrentPage]);

  return (
    <div className="w-full">
      <div ref={scrollTargetRef} className="mx-auto p-20 bg-[#B0022A] w-full h-full">
        <div className="flex justify-between items-center w-full pb-4">
          <h1 className="text-3xl font-bold text-white drop-shadow-[2px_2px_2px_black]">
            Latest News
          </h1>

          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border w-full border-gray-300 rounded-full px-6 text-black py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blackx"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
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

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${safeCurrentPage === totalPages ? 'min-h-[1098px]' : ''
          }`}>
          {currentItems.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8 pb-8">
          {/* Previous Button */}
          <button
            onClick={() => paginate(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1} // Disable if on the first page
            className={`px-3 py-1 rounded ${safeCurrentPage === 1
                ? 'text-white text-transparent animate: '
                : 'hover:font-bold text-white hover:scale-105'
              }`}
            aria-label="Previous Page"
          >
            &lt; {/* Left arrow character */}
          </button>

          {/* Page Number Indicators */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => paginate(pageNumber)}
              disabled={safeCurrentPage === pageNumber} // Disable the button for the current page
              className={`px-3 py-1 rounded ${safeCurrentPage === pageNumber
                  ? 'bg-white text-[#B0022A] font-bold cursor-default' // Current page
                  : 'text-white' // Inactive
                }`}
              aria-current={safeCurrentPage === pageNumber ? 'page' : undefined} // Accessibility
            >
              {pageNumber}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => paginate(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages} // Disable if on the last page
            className={`px-3 py-1 rounded ${safeCurrentPage === totalPages
                ? 'text-white text-transparent'
                : 'hover:font-bold text-white hover:scale-105'
              }`}
            aria-label="Next Page"
          >
            &gt; {/* Right arrow character */}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsGrid;
