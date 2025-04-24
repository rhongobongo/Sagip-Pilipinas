'use client';

import React, { useState, useEffect, useRef } from 'react';
import NewsDisplaySection from './NewsDonation';
import { NewsItem } from './NewsCard';
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
  // Encapsulates the scroll logic with a timeout for reliability
  const triggerScroll = () => {
     setTimeout(() => {
        if (scrollTargetRef.current) {
           scrollTargetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
     }, 0); // Timeout of 0ms defers execution slightly
  }

  // --- Handlers for page changes from child ---
  // Updates the correct page state based on which view is active and triggers scroll
  const handleLatestPageChange = (pageNumber: number) => {
    // Only update and scroll if page actually changes
    if (pageNumber !== latestCurrentPage) {
        setLatestCurrentPage(pageNumber);
        triggerScroll();
    }
  };

  const handleDonationPageChange = (pageNumber: number) => {
     // Only update and scroll if page actually changes
    if (pageNumber !== donationCurrentPage) {
        setDonationCurrentPage(pageNumber);
        triggerScroll();
    }
  };

  const showView = (view: NewsView) => {
    if (view !== currentView) {
      setCurrentView(view);
      // Reset the page number for the view we are switching TO
      if (view === 'latest') {
          // Reset only if not already 1 to avoid unnecessary trigger
          if (latestCurrentPage !== 1) setLatestCurrentPage(1);
      } else {
          // Reset only if not already 1
          if (donationCurrentPage !== 1) setDonationCurrentPage(1);
      }
      triggerScroll(); // Scroll when view changes
    }
  };

  const latestNewsMinHeight = 'min-h-[1098px]';
  const donationNewsMinHeight = 'min-h-[1098px]'; 

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
          newsItems={newsItems}
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
          newsItems={donationNewsItems as any}
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
