"use client";

import { useState } from "react";
import NewsCard from "./NewsCard";

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
    const [searchTerm, setSearchTerm] = useState<string>("");

    const filteredNews = searchTerm
        ? newsItems.filter(
            (item) =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.calamityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.summary.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : newsItems;

    const totalPages = Math.max(1, Math.ceil(filteredNews.length / itemsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const indexOfLastItem = safeCurrentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => setCurrentPage(Math.min(pageNumber, totalPages));

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsItems.map((item) => (
                    <NewsCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default NewsGrid;
