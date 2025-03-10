"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface NewsDetail {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  timestamp: string;
  calamityType: string;
  calamityLevel: string;
  slug: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contactInfo?: string;
}

const NewsDetailPage = () => {
  const { slug } = useParams();
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        
        const response = await fetch(`/api/news/${slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Server error details:', errorData);
          throw new Error(`Server responded with ${response.status}: ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        
        // Format the timestamp if available
        const formattedData = {
          ...data,
          timestamp: data.timestamp ? new Date(data.timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : ''
        };
        
        setNewsDetail(formattedData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching news detail:', err);
        setError(`Failed to fetch news details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNewsDetail();
  }, [slug]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading news details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !newsDetail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-red-500 mb-4">{error || "News not found"}</p>
          <Link href="/news" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Back to News
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 bg-[#F3F3F3]">
      <div className="mb-4">
        <Link href="/news" className="text-blue-500 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to News
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header with title and metadata */}
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold mb-3">{newsDetail.title}</h1>
          <div className="flex flex-wrap gap-2 mb-2">
            {newsDetail.calamityType && (
              <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                {newsDetail.calamityType}
              </span>
            )}
            {newsDetail.calamityLevel && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                Level: {newsDetail.calamityLevel}
              </span>
            )}
          </div>
          {newsDetail.timestamp && (
            <p className="text-gray-500 text-sm">{newsDetail.timestamp}</p>
          )}
        </div>
        
        {/* Featured image */}
        <div className="relative w-full h-96">
          {newsDetail.imageUrl ? (
            <Image 
              src={newsDetail.imageUrl} 
              alt={newsDetail.title} 
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">{newsDetail.calamityType || 'News'}</span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Summary */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <p className="text-gray-700 leading-relaxed">{newsDetail.summary}</p>
          </div>
          
          {/* Main content */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <div className="text-gray-700 leading-relaxed prose max-w-none" 
                 dangerouslySetInnerHTML={{ __html: newsDetail.content || 'No detailed information available.' }} />
          </div>
          
          {/* Location information if available */}
          {newsDetail.location && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p className="text-gray-700">{newsDetail.location.address || 'Location information available.'}</p>
              <div className="mt-2 h-64 bg-gray-200 rounded flex items-center justify-center">
                <p>Map view would be displayed here</p>
                {/* Integrate with a map component if needed */}
              </div>
            </div>
          )}
          
          {/* Contact information if available */}
          {newsDetail.contactInfo && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
              <p className="text-gray-700">{newsDetail.contactInfo}</p>
            </div>
          )}
          
          {/* Aid request section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Need Assistance?</h3>
            <p className="text-gray-700 mb-4">
              If you're affected by this situation, you can request aid using our assistance system.
            </p>
            <Link href="/request-aid" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Request Aid
            </Link>
          </div>
        </div>
        
        {/* Footer with sharing options */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">Share this article:</p>
              <div className="flex space-x-4 mt-2">
                <button className="text-gray-600 hover:text-blue-600">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button className="text-gray-600 hover:text-blue-800">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </button>
                <button className="text-gray-600 hover:text-blue-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
                Print Article
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;