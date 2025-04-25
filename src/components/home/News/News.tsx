
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
  const [currentView, setCurrentView] = useState<NewsView>('latest');
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  const [latestCurrentPage, setLatestCurrentPage] = useState<number>(1);
  const [donationCurrentPage, setDonationCurrentPage] = useState<number>(1);

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
         setLatestCurrentPage(1); 
      } else {
         setDonationCurrentPage(1); 
      }
      triggerScroll(); 
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
            className="px-4 py-2 bg-white text-[#B0022A] rounded-full transition-colors font-semibold whitespace-nowrap text-sm sm:text-base hover:bg-gray-200" // Added hover effect
            aria-label={`Switch to ${currentView === 'latest' ? 'Donation News' : 'Latest News'}`}
          >
            {currentView === 'latest'
              ? 'View Donation News'
              : 'View Latest News'}
            {' →'} 
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
            newsItems={donationNewsItems}
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