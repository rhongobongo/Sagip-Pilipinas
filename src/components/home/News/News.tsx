'use client';

import React, { useState, useEffect, useRef } from 'react';
import NewsDisplaySection from './NewsDonation';
import { NewsItem } from './NewsCard'; // Assuming NewsCard exports the NewsItem type
import { DonationReportItem } from '@/types/reportTypes';

interface NewsGridProps {
  newsItems: NewsItem[];
  donationNewsItems?: DonationReportItem[];
}
type NewsView = 'latest' | 'donation';

const NewsGrid = ({ newsItems, donationNewsItems = [] }: NewsGridProps) => {
  const [currentView, setCurrentView] = useState<NewsView>('latest'); //current view either "latest" or "donation"
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  const [latestCurrentPage, setLatestCurrentPage] = useState<number>(1);
  const [donationCurrentPage, setDonationCurrentPage] = useState<number>(1);

  // --- Function to trigger scroll ---
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

  // --- Handlers for page changes from child ---
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

  const showView = (view: NewsView) => {
    if (view !== currentView) {
      setCurrentView(view);
      if (view === 'latest') {
        if (latestCurrentPage !== 1) setLatestCurrentPage(1);
      } else {
        if (donationCurrentPage !== 1) setDonationCurrentPage(1);
      }
      triggerScroll();
    }
  };

  const latestNewsMinHeight = 'min-h-[1098px]';
  const donationNewsMinHeight = 'min-h-[1098px]';

  // FIX: Map DonationReportItem[] to NewsItem[]
  const mappedDonationItems: NewsItem[] = donationNewsItems.map((item) => ({
    id: item.id, // Use donation ID as the primary ID here
    slug: item.id, // Use donation ID for slug as well (or aidRequestId if preferred)
    title: item.title, // Title from the related aid request
    summary: item.donationSummary || `Donated: ${item.donatedTypes.join(', ')}`, // Create summary
    imageUrl: item.imageUrl || '/placeholder-donation.jpg', // Use request image or placeholder
    timestamp: item.donationTimestamp, // Use donation timestamp
    // These might not directly apply or need default values for donation view
    calamityType: item.calamityType || 'N/A',
    calamityLevel: item.calamityLevel || 'N/A',
    // Add other NewsItem fields if necessary, potentially with default values
  }));

  return (
    <div className="w-full transition-all duration-300">
      <div
        ref={scrollTargetRef}
        className="mx-auto p-10 md:p-20 bg-[#B0022A] w-full min-h-[calc(100vh-80px)]"
      >
        <div className="flex flex-wrap justify-between items-center w-full pb-4 mb-4 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-[2px_2px_2px_black]">
            {currentView === 'latest' ? 'Latest News' : 'Donation News'}
          </h1>

          <button
            onClick={() =>
              showView(currentView === 'latest' ? 'donation' : 'latest')
            }
            className="px-4 py-2 bg-white text-[#B0022A] rounded-full transition-colors font-semibold whitespace-nowrap text-sm sm:text-base"
            aria-label={`Switch to ${currentView === 'latest' ? 'Donation News' : 'Latest News'}`}
          >
            {currentView === 'latest'
              ? 'View Donation News'
              : 'View Latest News'}
            {currentView === 'latest' ? ' →' : ' →'}
          </button>
        </div>

        {currentView === 'latest' && (
          <NewsDisplaySection
            key="latest-news"
            newsItems={newsItems} // Pass original NewsItem[]
            listMinHeightClass={latestNewsMinHeight}
            idPrefix="latest"
            currentPage={latestCurrentPage}
            onPageChange={handleLatestPageChange}
            isDonationView={false}
          />
        )}

        {currentView === 'donation' && (
          <NewsDisplaySection
            key="donation-news"
            newsItems={mappedDonationItems} // Pass the mapped array
            listMinHeightClass={donationNewsMinHeight}
            idPrefix="donation"
            currentPage={donationCurrentPage}
            onPageChange={handleDonationPageChange}
            isDonationView={true}
          />
        )}
      </div>
    </div>
  );
};

export default NewsGrid;
