'use client';
import React, { useState } from 'react';
// Import Lucide icons for arrows and cards
import { ArrowBigUp, ArrowBigDown, Building2, HandHelping, Flame, Waves, Building, Wind, Mountain, HelpCircle, UtensilsCrossed, Shirt, Users, Package} from 'lucide-react'; // Using HandHelping now

// Import your custom SVG icon component (if still needed elsewhere, otherwise remove)
// import Organization1Icon from '@/components/icons/organization-1-icon.svg'; // Commented out/Removed as we use Building2 now

const AnalyticsDashboard: React.FC = () => {
  const [selectedOrganization, setSelectedOrganization] = useState('Select organization');

  // Mock data (updated disaster traffic values to match your image)
  const analyticsData = {
    averageRequests: { weekly: 7.86, monthly: 11.5, yearly: 52.33, weeklyTrend: 'down', monthlyTrend: 'up', yearlyTrend: 'up' },
    totalOrganizations: 22, totalVolunteers: 538, completedOperations: 241,
    disasterTypes: [ { name: 'Flood', percentage: 18, icon: '🌊', rank: 2 }, { name: 'Earthquake', percentage: 25, icon: '🏚️', rank: 1 }, { name: 'Typhoon', percentage: 17, icon: '🌀', rank: 3 }, { name: 'Fire', percentage: 23, icon: '🔥', rank: 6 }, { name: 'Landslide', percentage: 14, icon: '⛰️', rank: 5 }, { name: 'Other', percentage: 10, icon: '❓', rank: 4 } ],
    // Updated regions and values to match your image
    disasterTraffic: { 
      regions: ['Manila', 'Cebu', 'Davao', 'Vigan', 'Quezon', 'Batangas', 'Laoag'],
      values: [16.6, 8.7, 16.9, 3.3, 13.1, 21.1, 22.3] 
    },
    aidTypesStocks: { food: '10,500 packs', clothes: '2,550 pairs', volunteers: '220 people', medicine: '1,720' },
    operationSuccessRate: '92%', engagements: '12,256',
    averageResponseTime: { earthquake: '1 hour', fire: '20 minutes', flood: '35 minutes', landslide: '45 minutes', other: '1.5 hours', typhoon: '3 hours' }
  };

  // Trend icon component (remains the same)
  const TrendIcon: React.FC<{ trend: string }> = ({ trend }) => {
    if (trend === 'up') {
      return <ArrowBigUp className="w-5 h-5 inline-block text-green-500" />;
    } else if (trend === 'down') {
      return <ArrowBigDown className="w-5 h-5 inline-block text-red-500" />;
    }
    return null;
  };

  // Color variables (remain the same)
  const welcomeHeaderBgColor = 'bg-red-800';
  const cardBgColor = 'bg-red-800';
  const cardHeaderBgColor = 'bg-red-900';

  return (
    <div className="w-full h-full p-4 font-inter bg-gray-50">
      {/* Global styles (remain the same) */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        /* Custom Scrollbar Styles */
        .custom-red-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-red-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-red-scrollbar::-webkit-scrollbar-thumb { background: #DC2626; /* red-500 */ border-radius: 10px; }
        .custom-red-scrollbar::-webkit-scrollbar-thumb:hover { background: #B91C1C; /* red-700 */ }
        .custom-red-scrollbar { scrollbar-width: thin; scrollbar-color: #DC2626 #f1f1f1; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Header Section (remains the same) */}
      <div className={`${welcomeHeaderBgColor} p-6 rounded-lg mb-6 text-white shadow relative overflow-hidden`}>
         <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-700 opacity-30 transform translate-x-1/4 -translate-y-1/4"></div>
         <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-red-600 opacity-20"></div>
         <h1 className="text-3xl font-bold mb-2 relative z-10">Hello Admin!</h1>
         <p className="text-sm text-gray-200 font-medium relative z-10 mb-4 text-center"> {/* Centered text */}
           Track real-time insights and performance metrics to make informed decisions. Explore user activity, disaster reports, and aid distribution data all in one place.
         </p>
         <div className="flex flex-wrap justify-between mt-2 relative z-10">
           <NavTab label="Review Requests" href="/admin/review-requests" />
           <NavTab label="Analytics" href="/admin/analytics" active />
           <NavTab label="Deployed Aid" href="/admin/deployed" />
           <NavTab label="Donations" href="/admin/donations" />
           <NavTab label="News Articles" href="/admin/news" />
           <NavTab label="Organizations" href="/admin/organizations" />
           <NavTab label="Resources" href="/admin/resources" />
           <NavTab label="Volunteers" href="/admin/volunteers" />
         </div>
      </div>

      {/* Stats Grid - Top Row (Flex layout remains the same) */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">

        {/* Average Aid Requests Card (remains the same) */}
        <div className={`${cardBgColor} rounded-lg shadow-sm overflow-hidden text-white md:basis-1/3`}>
           <div className={`${cardHeaderBgColor} px-3 py-2 text-sm font-medium uppercase tracking-wider text-center`}> Average Aid Requests </div>
           <div className="p-4 flex justify-around items-center">
               <div className="text-center"> <div className="text-small mb-1">Weekly</div> <div className="text-2xl font-bold"><TrendIcon trend={analyticsData.averageRequests.weeklyTrend} /> {analyticsData.averageRequests.weekly}</div> </div>
               <div className="text-center"> <div className="text-small mb-1">Monthly</div> <div className="text-2xl font-bold"><TrendIcon trend={analyticsData.averageRequests.monthlyTrend} /> {analyticsData.averageRequests.monthly}</div> </div>
               <div className="text-center"> <div className="text-small mb-1">Yearly</div> <div className="text-2xl font-bold"><TrendIcon trend={analyticsData.averageRequests.yearlyTrend} /> {analyticsData.averageRequests.yearly}</div> </div>
           </div>
        </div>

        {/* Wrapper for the remaining 3 cards */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Total Organizations - Using Lucide Icon */}
            <div className={`${cardBgColor} rounded-lg shadow-sm overflow-hidden text-white`}>
              <div className={`${cardHeaderBgColor} px-4 py-2 text-sm font-medium uppercase tracking-wider text-center`}>
                Total Organizations
              </div>
              <div className="p-4 flex items-center justify-center">
                <div className="mr-3">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold">{analyticsData.totalOrganizations}</div>
              </div>
            </div>

            {/* Total Volunteers - Using Lucide Icon */}
            <div className={`${cardBgColor} rounded-lg shadow-sm overflow-hidden text-white`}>
              <div className={`${cardHeaderBgColor} px-4 py-2 text-sm font-medium uppercase tracking-wider text-center`}>
                Total Volunteers
              </div>
              <div className="p-4 flex items-center justify-center">
                 <div className="mr-3">
                  {/* Using Lucide HandHelping icon */}
                  <HandHelping className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold">{analyticsData.totalVolunteers}</div>
              </div>
            </div>

            {/* Completed Operations */}
            <div className={`${cardBgColor} rounded-lg shadow-sm overflow-hidden text-white`}>
              <div className={`${cardHeaderBgColor} px-4 py-2 text-sm font-medium uppercase tracking-wider text-center`}>
                Completed Operations
              </div>
              <div className="p-4 flex items-center justify-center">
                <div className="mr-3">
                  {/* Using placeholder Check icon */}
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  {/* Consider replacing with Lucide's CheckCircle2 */}
                </div>
                <div className="text-4xl font-bold">{analyticsData.completedOperations}</div>
              </div>
            </div>
         </div> {/* End wrapper for 3 cards */}
      </div> {/* End of Top Stats Row */}


      {/* --- Charts Row - REVISED 50/50 Layout --- */}
      {/* Changed lg:grid-cols-3 to lg:grid-cols-2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 text-center">

        {/* Disaster Traffic Chart - Now 50% width on large screens */}
        {/* lg:col-span-1 makes it take 1 of 2 columns */}
        <div className={`${cardBgColor} rounded-lg shadow p-4 text-white flex flex-col lg:col-span-1`}>
          {/* Title centered and uppercase */}
          <h3 className="text-lg font-bold text-center uppercase tracking-wider mb-4 text-white">
            Disaster Traffic in the Philippines
          </h3>

          {/* Chart Area with white background */}
          <div className="bg-white rounded-lg p-4 flex-grow flex flex-col mx-auto w-full max-w-3xl">
            {/* Chart container with fixed height */}
            <div className="flex-grow relative" style={{ height: "240px" }}>
              {/* Y-axis with visible values */}
              <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-gray-500">
                <span>100</span> <span>90</span> <span>80</span> <span>70</span> <span>60</span> <span>50</span> <span>40</span> <span>30</span> <span>20</span> <span>10</span> <span>0</span>
              </div>

              {/* Bar Chart - With accurate height representation */}
              <div className="h-full flex items-end justify-around gap-4 pl-8">
                {analyticsData.disasterTraffic.regions.map((region, index) => (
                  <div key={region} className="flex flex-col items-center flex-1 h-full justify-end">
                    {/* Bar */}
                    <div
                      className="w-1/3 bg-black rounded-t"
                      style={{ height: `${analyticsData.disasterTraffic.values[index]}%` }}
                    ></div>
                    {/* Percentage */}
                    <div className="mt-2 text-gray-800 text-xs font-medium">
                      {analyticsData.disasterTraffic.values[index]}%
                    </div>
                    {/* Region name */}
                    <div className="mt-1 text-gray-800 text-sm">
                      {region}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Disaster Types Chart - Updated with Static CSS Pie Chart Mock */}
        {/* Still takes 50% width on large screens due to lg:col-span-1 in the parent grid */}
        <div className={`${cardBgColor} rounded-lg shadow p-4 text-white flex flex-col lg:col-span-1`}>
          {/* Title */}
          <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4 text-center">
            Disaster Types
          </h3>

          {/* Content Area - Flex Layout (Chart Left, Legend Right) */}
          <div className="flex flex-grow items-center justify-center gap-6 p-4"> {/* Centered items, added gap & padding */}

            {/* Static Pie Chart Placeholder using conic-gradient */}
            <div className="flex-shrink-0">
              {/* NOTE: This is a static CSS mock. Replace with a real charting library later. */}
              <div
                className="w-60 h-60 rounded-full shadow-lg" // Removed background classes, added shadow
                style={{
                  // Using percentages from the design image (approximated to 100%)
                  // Flood: 19%, Earthquake: 25%, Typhoon: 17%, Fire: 9%, Landslide: 14%, Other: 16%
                  background: `conic-gradient(
                    #38BDF8 0% 19%,      /* sky-400 (Flood) */
                    #4ADE80 19% 44%,      /* green-400 (Earthquake) */
                    #F87171 44% 61%,      /* red-400 (Typhoon) */
                    #FACC15 61% 70%,      /* yellow-400 (Fire) */
                    #FB923C 70% 84%,      /* orange-400 (Landslide) */
                    #C084FC 84% 100%     /* purple-400 (Other) */
                  )`
                }}
              >
                {/* Content removed - the background *is* the chart mock */}
              </div>
            </div>

            {/* Legend - Using Lucide Icons (Consider replacing with custom SVGs for design match) */}
            {/* Legend data still comes from analyticsData, but chart visual uses design percentages */}
            <div className="text-sm">
              <h4 className="font-semibold mb-2 text-white">Ranking:</h4>
              <ul className="space-y-2">
                {analyticsData.disasterTypes // Legend list uses data from the code
                  .sort((a, b) => a.rank - b.rank)
                  .map((type) => {
                    let IconComponent;
                    switch (type.name.toLowerCase()) {
                      case 'earthquake': IconComponent = Building; break;
                      case 'flood': IconComponent = Waves; break;
                      case 'typhoon': IconComponent = Wind; break;
                      case 'landslide': IconComponent = Mountain; break;
                      case 'fire': IconComponent = Flame; break;
                      default: IconComponent = HelpCircle;
                    }
                    return (
                      <li key={type.name} className="flex justify-between items-center gap-3">
                        <span className="truncate pr-1 text-white">{type.rank} - {type.name}</span>
                        {IconComponent && <IconComponent className="w-5 h-5 text-white flex-shrink-0" />}
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </div>
        </div>


      {/* --- Bottom Row - REVISED based on image_5a0ef1.png --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-white"> {/* Changed grid definition, added text-white */}

        {/* Aid Types Stocks - Spanning 6 columns */}
        <div className={`md:col-span-6 ${cardBgColor} rounded-lg shadow-sm p-4 flex flex-col`}>
          <h3 className="text-sm font-medium uppercase tracking-wider text-center mb-4"> Aid Types Stocks </h3>
          {/* Organization Dropdown - Styled */}
          <div className="mb-4 px-4">
            <label htmlFor="org-select-b" className="sr-only">Organization:</label> {/* Screen reader only label */}
            <select
              id="org-select-b"
              name="organization"
              value={selectedOrganization}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              // Custom styling for dropdown to match dark theme
              className={`block w-full pl-3 pr-10 py-2 text-sm bg-red-700 border border-red-600 focus:outline-none focus:ring-1 focus:ring-white focus:border-white rounded-md appearance-none`} // Added appearance-none, check browser compatibility or add custom arrow
            >
              <option>Select organization</option>
              <option>Red Cross Cebu</option>
              <option>DSWD Region 7</option>
              <option>Local LGU</option>
            </select>
            {/* Consider adding a custom arrow overlay for the select if appearance-none removes it */}
          </div>
          {/* Stock Items Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 px-4 flex-grow">
            {/* Food */}
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="w-8 h-8 text-white flex-shrink-0" />
              <div>
                <div className="text-xs text-red-200">Food:</div>
                <div className="font-medium">{analyticsData.aidTypesStocks.food}</div>
              </div>
            </div>
            {/* Volunteers */}
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-white flex-shrink-0" />
              <div>
                <div className="text-xs text-red-200">Volunteers:</div>
                <div className="font-medium">{analyticsData.aidTypesStocks.volunteers}</div>
              </div>
            </div>
            {/* Clothes */}
            <div className="flex items-center gap-3">
              <Shirt className="w-8 h-8 text-white flex-shrink-0" />
              <div>
                <div className="text-xs text-red-200">Clothes:</div>
                <div className="font-medium">{analyticsData.aidTypesStocks.clothes}</div>
              </div>
            </div>
            {/* Medicine */}
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-white flex-shrink-0" /> {/* Using Package as placeholder for Medicine */}
              <div>
                <div className="text-xs text-red-200">Medicine:</div>
                <div className="font-medium">{analyticsData.aidTypesStocks.medicine}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column Wrapper - Spanning 3 columns */}
        <div className="md:col-span-3 flex flex-col gap-4">
          {/* Operation Success Rate */}
          <div className={`${cardBgColor} rounded-lg shadow-sm p-4 flex flex-col items-center justify-center flex-grow`}>
             <h3 className="text-sm font-medium uppercase tracking-wider text-center mb-2"> Operation Success Rate </h3>
             <div className="flex items-center justify-center gap-2">
                {/* Assuming trend is 'up' based on design */}
                <TrendIcon trend="up" />
                <div className="text-5xl font-bold">{analyticsData.operationSuccessRate}</div>
             </div>
          </div>

          {/* Engagements */}
          <div className={`${cardBgColor} rounded-lg shadow-sm p-4 flex flex-col items-center justify-center flex-grow`}>
            <h3 className="text-sm font-medium uppercase tracking-wider text-center mb-2"> Engagements </h3>
            <div className="text-5xl font-bold">{analyticsData.engagements}</div>
          </div>
        </div>

        {/* Average Response Time - Spanning 3 columns */}
        <div className={`md:col-span-3 ${cardBgColor} rounded-lg shadow-sm p-4 flex flex-col`}>
           <h3 className="text-sm font-medium uppercase tracking-wider text-center mb-4"> Average Response Time </h3>
           <div className="space-y-2 px-2 flex-grow">
             {Object.entries(analyticsData.averageResponseTime).map(([type, time]) => (
               <div key={type} className="flex justify-between items-center text-sm">
                 <div className="capitalize">{type}:</div>
                 <div className="font-medium">{time}</div>
               </div>
             ))}
           </div>
        </div>

      </div> {/* End Bottom Row */}

     </div> // End Page Container
   );
 };

 // Navigation Tab Component (remains the same)
 const NavTab: React.FC<{ label: string; href: string; active?: boolean }> = ({
   label, href, active = false
 }) => {
    const baseClasses = "py-1 px-3 text-sm font-medium rounded-full transition-all duration-200";
    const activeClasses = "bg-white text-red-800";
    const inactiveClasses = "text-white hover:bg-red-700";
    return ( <a href={href} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`} > {label} </a> );
 };

 export default AnalyticsDashboard;