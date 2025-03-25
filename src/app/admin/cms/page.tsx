"use client"

import React, { useState } from 'react';
import { Bell, User, ChevronLeft, ChevronRight } from 'lucide-react';
import ReviewRequests from './components/ReviewRequests';  // Import the ReviewRequests component

const AdminDashboard: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Analytics');

  const toggleNav = (): void => {
    setIsNavOpen(!isNavOpen);
  };

  const navItems: string[] = [
    'Analytics',
    'Donations',
    'News Articles',
    'Organizations',
    'Resources',
    'Review Aid Requests',
    'Track Deployed Aid',
    'Volunteers'
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-700 text-white p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white rounded-full p-1 mr-2">
            <span className="text-red-700 text-xs font-bold">ICON</span>
          </div>
          <h1 className="text-lg font-bold">SAGIP PILIPINAS: HELP THOSE IN NEED!</h1>
        </div>
        
        <div className="flex items-center">
          <div className="relative mr-4">
            <input
              type="text"
              placeholder="Search"
              className="px-3 py-1 pr-8 rounded-full text-sm text-black"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <Bell size={20} className="mr-4" />
          <User size={20} />
        </div>
      </header>

      <div className="flex flex-grow">
        {/* Navigation Sidebar */}
        <aside 
          className={`h-full bg-red-700 text-white transition-all duration-300 ease-in-out ${
            isNavOpen ? 'w-56' : 'w-0'
          } overflow-hidden`}
        >
          <div className="py-3 px-4 font-bold border-b border-red-600">
            Navigation
          </div>
          <nav>
            <ul>
              {navItems.map((item) => (
                <li 
                  key={item}
                  className={`px-4 py-3 cursor-pointer hover:bg-red-600 transition ${activeTab === item ? 'bg-red-800' : ''}`}
                  onClick={() => setActiveTab(item)} // This will set the active tab
                >
                  {item}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Toggle Button - positioned at the edge of the sidebar */}
        <div className="relative">
          <button
            onClick={toggleNav}
            className="absolute top-0 -left-1 z-10 bg-red-700 text-white p-2 h-12 flex items-center"
          >
            {isNavOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Main Content */}
        <main 
          className={`flex-grow bg-blue-100`}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-black">.  {activeTab}</h2>
            <div className="bg-white p-6 rounded-lg shadow text-black">    
              {/* Show the component when "Review Aid Requests" is selected */}
              {activeTab === 'Review Aid Requests' ? <ReviewRequests /> : <p>Content for {activeTab} will appear here.</p>}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
