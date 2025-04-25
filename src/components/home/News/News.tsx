// Presumed path: src/components/NewsGrid.tsx (or similar)
'use client';

import React, { useState, useEffect, useRef } from 'react';
// Assuming NewsDisplaySection is in NewsDonation.tsx based on previous context
import NewsDisplaySection from './NewsDonation';
import { NewsItem } from './NewsCard'; // Assuming NewsCard exports the NewsItem type
import { DonationReportItem } from '@/types/reportTypes';

interface NewsGridProps {
  newsItems: NewsItem[]; // For the 'latest' news view
  donationNewsItems?: DonationReportItem[]; // For the 'donation' view
}
type NewsView = 'latest' | 'donation';

const NewsGrid = ({ newsItems, donationNewsItems = [] }: NewsGridProps) => {
  const [currentView, setCurrentView] = useState<NewsView>('latest');
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  const [latestCurrentPage, setLatestCurrentPage] = useState<number>(1);
  const [donationCurrentPage, setDonationCurrentPage] = useState<number>(1);

  // --- Function to trigger scroll --- (Keep as is)
  const triggerScroll = () => {
    setTimeout(() => {
      if (scrollTargetRef.current) {
        scrollTargetRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 0);
  };

  // --- Handlers for page changes from child --- (Keep as is)
  const handleLatestPageChange = (pageNumber: number) => {
    if (pageNumber !== latestCurrentPage) {
      setLatestCurrentPage(pageNumber);
      triggerScroll();
    }
  };

  const handleDonationPageChange = (pageNumber: number) => {
    if (pageNumber !== donationCurrentPage) {
      setDonationCurrentPage(pageNumber);
      triggerScroll();
    }
  };

  // --- Function to switch views --- (Keep as is)
  const showView = (view: NewsView) => {
    if (view !== currentView) {
      setCurrentView(view);
      // Reset pagination when switching views
      if (view === 'latest') {
         setLatestCurrentPage(1); // Reset latest page
      } else {
         setDonationCurrentPage(1); // Reset donation page
      }
      triggerScroll(); // Scroll to top after switching
    }
  };

  // Min height classes (Keep as is)
  const latestNewsMinHeight = 'min-h-[1098px]';
  const donationNewsMinHeight = 'min-h-[1098px]';

  // --- REMOVED the mapping from DonationReportItem[] to NewsItem[] ---
  // const mappedDonationItems: NewsItem[] = donationNewsItems.map((item) => ({ ... })); // DELETED

  return (
    <div className="w-full transition-all duration-300">
      <div
        ref={scrollTargetRef}
        className="mx-auto p-10 md:p-20 bg-[#B0022A] w-full min-h-[calc(100vh-80px)]" // Ensure enough height
      >
        {/* Header Section with Title and View Switch Button */}
        <div className="flex flex-wrap justify-between items-center w-full pb-4 mb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-[2px_2px_2px_black]">
            {currentView === 'latest' ? 'Latest News' : 'Donation News'}
          </h1>

          <button
            onClick={() =>
              showView(currentView === 'latest' ? 'donation' : 'latest')
            }
            className="px-4 py-2 bg-white text-[#B0022A] rounded-full transition-colors font-semibold whitespace-nowrap text-sm sm:text-base hover:bg-gray-200" // Added hover effect
            aria-label={`Switch to ${currentView === 'latest' ? 'Donation News' : 'Latest News'}`}
          >
            {currentView === 'latest'
              ? 'View Donation News'
              : 'View Latest News'}
            {' →'} {/* Simple arrow */}
          </button>
        </div>

        {/* Conditional Rendering based on currentView */}

        {/* LATEST NEWS VIEW (Untouched as requested) */}
        {currentView === 'latest' && (
          <NewsDisplaySection
            key="latest-news" // Added key for better reconciliation
            newsItems={newsItems} // Pass original NewsItem[]
            listMinHeightClass={latestNewsMinHeight}
            idPrefix="latest"
            currentPage={latestCurrentPage}
            onPageChange={handleLatestPageChange}
            isDonationView={false} // Explicitly set for clarity
          />
        )}

        {/* DONATION NEWS VIEW (Corrected) */}
        {currentView === 'donation' && (
          <NewsDisplaySection
            key="donation-news" // Added key for better reconciliation
            // --- PASS THE ORIGINAL DONATION ARRAY ---
            // This array comes directly from fetchDonations and contains DonationReportItem objects
            // which include the correctly populated 'donatedTypes' array.
            newsItems={donationNewsItems}
            // --- ---
            listMinHeightClass={donationNewsMinHeight}
            idPrefix="donation"
            currentPage={donationCurrentPage}
            onPageChange={handleDonationPageChange}
            isDonationView={true} // Explicitly set for clarity
          />
        )}
      </div>
    </div>
  );
};

export default NewsGrid;