"use client";


import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NewsGrid = () => {
  // Temporary placeholder data - this will be replaced with Firebase data
  const newsItems = [
    {
      id: 1,
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      imageUrl: '/placeholder-news-1.jpg',
      slug: 'news-item-1'
    },
    {
      id: 2,
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      imageUrl: '/placeholder-news-2.jpg',
      slug: 'news-item-2'
    },
    {
      id: 3,
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      imageUrl: '/placeholder-news-3.jpg',
      slug: 'news-item-3'
    },
    {
      id: 4,
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      imageUrl: '/placeholder-news-4.jpg',
      slug: 'news-item-4'
    },
    {
      id: 5,
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      imageUrl: '/placeholder-news-5.jpg',
      slug: 'news-item-5'
    },
    {
      id: 6,
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      imageUrl: '/placeholder-news-6.jpg',
      slug: 'news-item-6'
    },
    {
      id: 7,
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      imageUrl: '/placeholder-news-7.jpg',
      slug: 'news-item-7'
    },
    {
      id: 8,
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      imageUrl: '/placeholder-news-8.jpg',
      slug: 'news-item-8'
    },
    {
      id: 9,
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      imageUrl: '/placeholder-news-9.jpg',
      slug: 'news-item-9'
    }
  ];

  // State for pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(9);
  
  // Calculate total pages
  const totalPages = Math.ceil(newsItems.length / itemsPerPage);
  
  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = newsItems.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber : number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4 py-8 bg-[#F3F3F3]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Latest News</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
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
        {currentItems.map((item) => (
          <Link href={`/news/${item.slug}`} key={item.id}>
            <div className="border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 relative">
                {/* Placeholder image - replace with your actual Image component */}
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Image Placeholder</span>
                </div>
                {/* When you have actual images, use this instead:
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  layout="fill"
                  objectFit="cover"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                />
                */}
              </div>
              <div className="p-4">
                <h2 className="font-medium text-lg line-clamp-2 mb-2">{item.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-4">{item.summary}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-10 space-x-1">
        <button
          onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          &lt;
        </button>
        
        {[...Array(totalPages).keys()].map(number => (
          <button
            key={number + 1}
            onClick={() => paginate(number + 1)}
            className={`px-3 py-1 rounded border ${
              currentPage === number + 1
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 hover:bg-gray-100'
            }`}
          >
            {number + 1}
          </button>
        ))}
        
        <button
          onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default NewsGrid;