'use client';

import React, { useState, useEffect, useRef, RefObject } from 'react';
import NewsCard, { NewsItem } from './NewsCard';

interface NewsDisplaySectionProps {
    newsItems: NewsItem[];
    scrollTargetRef: React.RefObject<HTMLDivElement>; // Receive the ref from parent which is ang News.tsx
    listMinHeightClass?: string;
    idPrefix: string;
}

const NewsDisplaySection = ({
    newsItems,
    scrollTargetRef,
    listMinHeightClass = 'min-h-[1098px]',
    idPrefix
}: NewsDisplaySectionProps) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(9);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const prevPageRef = useRef<number>(null);

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

    useEffect(() => { //Scroll effect after ichange or inext ang page number
        if (prevPageRef.current !== undefined && prevPageRef.current !== safeCurrentPage) {
            if (scrollTargetRef.current) {
                scrollTargetRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        }
        prevPageRef.current = safeCurrentPage;
    }, [safeCurrentPage, scrollTargetRef]);

    return (
        <>
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mb-4 ml-auto">
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
                    fill="currentColor" viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd" />
                </svg>
            </div>

            {/* Container for donation news cards */}
            <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${safeCurrentPage === totalPages ? listMinHeightClass : ''
                    }`
                }>
                {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                        <NewsCard key={`${idPrefix}-${item.id}`} item={item} />
                    ))
                ) : (
                    // Message if no items or no search results
                    <p className="text-black col-span-full text-center py-10">
                        {searchTerm ? 'No similar results found.' : 'No items available.'}
                    </p>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8 pb-8 mt-12">
                    {/* Previous Page Button */}
                    <button
                        onClick={() => paginate(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        className={`px-3 py-1 rounded font-bold ${safeCurrentPage === 1
                            ? 'text-transparent'
                            : 'text-white hover:scale-105'
                            }`}
                        aria-label="Previous Page"
                    >
                        &lt; {/* Left arrow */}
                    </button>

                    {/* Page Number Buttons Indicator Container */}
                    <div className="flex relative rounded-md">
                        {/* Sliding Background Animation */}
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
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                            <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={`font-bold relative z-10 px-3 py-1 transition-colors duration-300 ease-in-out ${safeCurrentPage === pageNumber
                                    ? 'text-[#B0022A]' // Active
                                    : 'text-white' // Inactive
                                    }`}
                                aria-current={safeCurrentPage === pageNumber ? 'page' : undefined}
                            >
                                {pageNumber}
                            </button>
                        ))}
                    </div>

                    {/* Next Page Button */}
                    <button
                        onClick={() => paginate(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                        className={`px-3 py-1 rounded font-bold ${safeCurrentPage === totalPages
                            ? 'text-transparent'
                            : 'text-white hover:scale-105'
                            }`}
                        aria-label="Next Page"
                    >
                        &gt; {/* Right arrow */}
                    </button>
                </div>
            )}
        </>
    );
};

export default NewsDisplaySection;