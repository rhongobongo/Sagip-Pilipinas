// src/app/admin/news/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link for navigation

// --- Define the structure for a news item based on your API response ---
// (Derived from src/app/api/news/route.ts - Ensure this matches!)
// IMPORTANT: Make sure 'slug' holds the document ID from the 'aidRequest' collection
// if you intend to link to the Aid Request detail page.
type NewsItem = {
    id: string;
    title: string;          // From shortDesc or 'News Title'
    summary: string;        // From calamityType/Level or 'News Summary'
    imageUrl: string;       // From imageUrl or placeholder
    timestamp: string;      // ISO string format
    calamityType?: string;  // Optional fields from source data
    calamityLevel?: string; // Optional fields from source data
    slug: string;           // Should be the ID for the item in the target collection (e.g., 'aidRequest')
};


// --- NavTab Component ---
// (Keep this or import from a shared file)
const NavTab: React.FC<{ label: string; href: string; active?: boolean }> = ({ label, href, active = false }) => {
    const baseClasses = "py-1.5 px-6 text-sm font-bold rounded-full transition-all duration-200";
    const activeClasses = "bg-white text-red-800 shadow-sm";
    const inactiveClasses = "text-white hover:bg-red-700";
    return (
        <a href={href} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            {label}
        </a>
    );
};

// --- News Article Page Component ---
const NewsArticlePage: React.FC = () => {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Ensure your API route /api/news fetches the correct data,
                // including the 'slug' which should be the document ID
                // for the detail page (e.g., the ID from 'aidRequest' collection).
                const response = await fetch('/api/news');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: NewsItem[] = await response.json();
                setNewsItems(data);
            } catch (err: any) {
                console.error("Failed to fetch news:", err);
                setError(`Failed to load news items: ${err.message || 'Please check console.'}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, []); // Empty dependency array means this runs once on mount


    // Helper to format date/time from ISO string
    const formatDateTime = (isoString: string) => {
        if (!isoString) return { date: 'N/A', time: 'N/A' };
        try {
            const dateObj = new Date(isoString);
            const date = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD
            const time = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            return { date, time };
        } catch (e) {
            console.error("Error formatting date:", e);
            return { date: 'Invalid Date', time: '' };
        }
    };


    return (
        <div className="w-full min-h-screen p-4 font-inter bg-gray-50">
            {/* Global styles - Optional */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                html { scroll-behavior: smooth; }
                 /* Add custom scrollbar styles if needed */
                .custom-red-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-red-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-red-scrollbar::-webkit-scrollbar-thumb { background: #DC2626; border-radius: 10px; }
                .custom-red-scrollbar::-webkit-scrollbar-thumb:hover { background: #B91C1C; }
                .custom-red-scrollbar { scrollbar-width: thin; scrollbar-color: #DC2626 #f1f1f1; }
            `}</style>

            {/* Integrated Main Header Section */}
            <div className={'bg-red-800 p-6 rounded-lg mb-6 text-white shadow relative overflow-hidden'}>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-700 opacity-30 transform translate-x-1/4 -translate-y-1/4" aria-hidden="true"></div>
                <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-red-600 opacity-20" aria-hidden="true"></div>

                {/* Header Content */}
                <h1 className="text-3xl font-bold mb-2 relative z-10">Hello Admin!</h1>
                <p className="text-medium text-gray-200 font-medium relative z-10 mb-4 text-center">
                    Manage and review news articles for the platform. Create, edit, or delete articles to keep the community informed.
                </p>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap justify-center items-center mt-4 space-x-4 relative z-10">
                    <NavTab label="Review Requests" href="/admin/review-requests" />
                    <NavTab label="Dashboard" href="/admin/analytics" />
                    <NavTab label="News Articles" href="/admin/news" active /> {/* Active tab */}
                    <NavTab label="Organizations" href="/admin/organizations" />
                    <NavTab label="Volunteers" href="/admin/volunteers" />
                </div>
            </div>

            {/* === Main Content Area for News Articles === */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl md:text-2xl font-semibold text-gray-800">News Feed</h2>
                     {/* Optional: Add "Create New Article" button here */}
                     {/* <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 active:bg-red-800 transition-colors">
                          + Create Article
                     </button> */}
                </div>

                {/* Conditional Rendering for Loading/Error/Content */}
                {isLoading ? (
                    <div className="p-10 text-center text-gray-600">Loading news articles...</div>
                ) : error ? (
                    <div className="p-10 text-center text-red-600 border border-red-300 bg-red-50 rounded">
                        <p className="font-semibold">Error Loading News</p>
                        <p>{error}</p>
                    </div>
                ) : newsItems.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-red-scrollbar pr-2"> {/* Added scrollbar */}
                        {newsItems.map((item) => {
                            const { date, time } = formatDateTime(item.timestamp);
                             // Basic fallback image
                            const imageUrl = item.imageUrl && item.imageUrl !== '/placeholder-image.jpg' ? item.imageUrl : '/images/default-news.png'; // Provide a real default image path

                            return (
                                // Using Link for navigation to the detail page at /news/[slug]
                                <Link
                                    key={item.id}
                                    href={`/news/${item.slug}`} // <-- UPDATED HREF points to /news/[slug]
                                    className="block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                                >
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Image Column */}
                                        <div className="flex-shrink-0 w-full md:w-32 h-32 md:h-auto">
                                          <img
                                            src={imageUrl}
                                            alt={item.title || 'News article image'}
                                            className="w-full h-full object-cover rounded"
                                            onError={(e) => {
                                              // Fallback if image fails to load
                                              (e.target as HTMLImageElement).onerror = null;
                                              (e.target as HTMLImageElement).src = '/images/default-news.png'; // Ensure this path is correct
                                            }}
                                          />
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.summary}</p> {/* Limit summary lines */}

                                            {/* Additional Details (like calamity info from your API) */}
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                                                {item.calamityType && <span>Type: <span className="font-medium">{item.calamityType}</span></span>}
                                                {item.calamityLevel && <span>Level: <span className="font-medium">{item.calamityLevel}</span></span>}
                                            </div>

                                            {/* Timestamp */}
                                            <p className="text-xs text-gray-400">
                                                Published: {date} at {time} (ID: {item.id})
                                            </p>
                                        </div>

                                        {/* Optional Actions Column (e.g., Edit/Delete) */}
                                        {/* <div className="flex-shrink-0 flex flex-col md:items-end space-y-2">
                                             <button className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
                                             <button className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                                        </div> */}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-10 text-center text-gray-500">
                        No news articles found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsArticlePage;