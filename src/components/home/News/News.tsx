'use client';

import { useState } from 'react';
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

  const paginate = (pageNumber: number) =>
    setCurrentPage(Math.min(pageNumber, totalPages));

  return (
    <div className="bg-[#F3F3F3] w-full">
      <div className="mx-auto p-32 bg-[#B0022A] w-full h-full">
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
              className="border w-full border-gray-300 rounded-full px-6 text-black py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-black font-bold"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
          {newsItems.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsGrid;
