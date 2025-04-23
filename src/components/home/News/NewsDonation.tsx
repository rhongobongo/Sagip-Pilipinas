'use client';

import React, {
  useState,
  useRef,
  RefObject, // Removed useEffect from here
} from 'react';
import NewsCard, { NewsItem } from './NewsCard';

interface NewsDisplaySectionProps {
  newsItems: NewsItem[];
  scrollTargetRef: React.RefObject<HTMLDivElement | null>;
  listMinHeightClass: string;
  idPrefix: string;
}

const NewsDisplaySection = ({
  newsItems,
  scrollTargetRef,
  listMinHeightClass = 'min-h-[1098px]',
  idPrefix,
}: NewsDisplaySectionProps) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);
  const [searchTerm, setSearchTerm] = useState<string>('');
  // const prevPageRef = useRef<number>(null); // --- Remove this line ---

  // ... (filtering logic remains the same) ...
  const filteredNews = searchTerm
    ? newsItems.filter((item) => {
        const term = searchTerm.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(term) ?? false;
        const typeMatch =
          item.calamityType?.toLowerCase().includes(term) ?? false;
        const summaryMatch =
          item.summary?.toLowerCase().includes(term) ?? false;
        return titleMatch || typeMatch || summaryMatch;
      })
    : newsItems;

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / itemsPerPage));
  // Ensure currentPage resets if filters reduce total pages below current page
  const safeCurrentPage = Math.min(currentPage, totalPages);
  // Reset to page 1 if search term changes and current page becomes invalid
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const indexOfLastItem = safeCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);

  // --- Modify the paginate function ---
  const paginate = (pageNumber: number) => {
    const newPage = Math.min(Math.max(1, pageNumber), totalPages);

    // Only update state and scroll if the page number is actually changing
    if (newPage !== safeCurrentPage) {
      setCurrentPage(newPage);

      // Use setTimeout to ensure scroll happens after potential re-render
      setTimeout(() => {
        if (scrollTargetRef.current) {
          scrollTargetRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 0); // Delay of 0 ms is usually enough
    }
  };

  // --- Remove the useEffect for scrolling ---
  // useEffect(() => {
  //     // ... (removed code) ...
  // }, [safeCurrentPage, scrollTargetRef]);

  return (
    <>
      {/* ... (Search input JSX remains the same) ... */}
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mb-4 ml-auto">
        {/* Search Input JSX */}
        <input
          type="text"
          id={`${idPrefix}-search`} // Unique ID using prefix
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border w-full border-gray-300 rounded-full px-4 text-black py-2 pl-10 focus:outline-none"
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

      {/* ... (News card grid JSX remains the same) ... */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${listMinHeightClass}`} // Apply min-height consistently or conditionally as needed
      >
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <NewsCard key={`${idPrefix}-${item.id}`} item={item} />
          ))
        ) : (
          <p className="text-black col-span-full text-center py-10">
            {searchTerm ? 'No similar results found.' : 'No items available.'}
          </p>
        )}
      </div>

      {/* ... (Pagination controls JSX remains the same) ... */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8 pb-8 mt-12">
          {/* Pagination JSX */}
          {/* Previous Page Button */}
          <button
            onClick={() => paginate(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className={`px-3 py-1 rounded font-bold ${
              safeCurrentPage === 1
                ? 'text-transparent cursor-default' // Make it invisible and non-interactive
                : 'text-white hover:scale-105'
            }`}
            aria-label="Previous Page"
            style={{ visibility: safeCurrentPage === 1 ? 'hidden' : 'visible' }} // Hide completely when disabled
          >
            &lt; {/* Left arrow */}
          </button>

          {/* Page Number Buttons Indicator Container */}
          <div className="flex relative rounded-md">
            {/* Sliding background */}
            <div
              className={`absolute top-0 left-0 h-full bg-[#fefefe] rounded-md transition-transform duration-300 ease-in-out`}
              style={{
                width: `calc(100% / ${totalPages})`,
                transform: `translateX(${(safeCurrentPage - 1) * 100}%)`,
                zIndex: 1,
              }}
              aria-hidden="true"
            />
            {/* Page Number Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`font-bold relative z-10 px-3 py-1 transition-colors duration-300 ease-in-out ${
                    safeCurrentPage === pageNumber
                      ? 'text-[#B0022A]' // Active
                      : 'text-white' // Inactive
                  }`}
                  aria-current={
                    safeCurrentPage === pageNumber ? 'page' : undefined
                  }
                >
                  {pageNumber}
                </button>
              )
            )}
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => paginate(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            className={`px-3 py-1 rounded font-bold ${
              safeCurrentPage === totalPages
                ? 'text-transparent cursor-default' // Make it invisible and non-interactive
                : 'text-white hover:scale-105'
            }`}
            aria-label="Next Page"
            style={{
              visibility: safeCurrentPage === totalPages ? 'hidden' : 'visible',
            }} // Hide completely when disabled
          >
            &gt; {/* Right arrow */}
          </button>
        </div>
      )}
    </>
  );
};

export default NewsDisplaySection;
