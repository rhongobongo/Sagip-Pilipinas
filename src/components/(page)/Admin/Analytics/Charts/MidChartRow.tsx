import { Building, Waves, Wind, Mountain, Flame, HelpCircle } from "lucide-react";

const analyticsData = {
    averageRequests: {
        weekly: 7.86,
        monthly: 11.5,
        yearly: 52.33,
        weeklyTrend: "down",
        monthlyTrend: "up",
        yearlyTrend: "up",
    },
    totalOrganizations: 22,
    totalVolunteers: 538,
    completedOperations: 241,
    disasterTypes: [
        { name: "Flood", percentage: 18, icon: "🌊", rank: 2 },
        { name: "Earthquake", percentage: 25, icon: "🏚️", rank: 1 },
        { name: "Typhoon", percentage: 17, icon: "🌀", rank: 3 },
        { name: "Fire", percentage: 23, icon: "🔥", rank: 6 },
        { name: "Landslide", percentage: 14, icon: "⛰️", rank: 5 },
        { name: "Other", percentage: 10, icon: "❓", rank: 4 },
    ],

    disasterTraffic: {
        regions: [
            "Manila",
            "Cebu",
            "Davao",
            "Vigan",
            "Quezon",
            "Batangas",
            "Laoag",
        ],
        values: [16.6, 8.7, 16.9, 3.3, 13.1, 21.1, 22.3],
    },
    aidTypesStocks: {
        food: "10,500 packs",
        clothes: "2,550 pairs",
        volunteers: "220 people",
        medicine: "1,720",
    },
    operationSuccessRate: "92%",
    engagements: "12,256",
    averageResponseTime: {
        earthquake: "1 hour",
        fire: "20 minutes",
        flood: "35 minutes",
        landslide: "45 minutes",
        other: "1.5 hours",
        typhoon: "3 hours",
    },
};

const MidChartRow = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 text-center">
            {/* Disaster Traffic Chart - Now 50% width on large screens */}
            {/* lg:col-span-1 makes it take 1 of 2 columns */}
            <div
                className={`bg-red-800 rounded-lg shadow p-4 text-white flex flex-col lg:col-span-1`}
            >
                {/* Title centered and uppercase */}
                <h3 className="text-lg font-bold text-center uppercase tracking-wider mb-4 text-white">
                    Disaster Traffic in the Philippines
                </h3>

                {/* Chart Area with white background */}
                <div className="bg-white rounded-lg p-4 flex-grow flex flex-col mx-auto w-full max-w-3xl">
                    {/* Chart container with fixed height */}
                    <div
                        className="flex-grow relative"
                        style={{ height: "240px" }}
                    >
                        {/* Y-axis with visible values */}
                        <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-gray-500">
                            <span>100</span> <span>90</span> <span>80</span>{" "}
                            <span>70</span> <span>60</span> <span>50</span>{" "}
                            <span>40</span> <span>30</span> <span>20</span>{" "}
                            <span>10</span> <span>0</span>
                        </div>

                        {/* Bar Chart - With accurate height representation */}
                        <div className="h-full flex items-end justify-around gap-4 pl-8">
                            {analyticsData.disasterTraffic.regions.map(
                                (region, index) => (
                                    <div
                                        key={region}
                                        className="flex flex-col items-center flex-1 h-full justify-end"
                                    >
                                        {/* Bar */}
                                        <div
                                            className="w-1/3 bg-black rounded-t"
                                            style={{
                                                height: `${analyticsData.disasterTraffic.values[index]}%`,
                                            }}
                                        ></div>
                                        {/* Percentage */}
                                        <div className="mt-2 text-gray-800 text-xs font-medium">
                                            {
                                                analyticsData.disasterTraffic
                                                    .values[index]
                                            }
                                            %
                                        </div>
                                        {/* Region name */}
                                        <div className="mt-1 text-gray-800 text-sm">
                                            {region}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Disaster Types Chart - Updated with Static CSS Pie Chart Mock */}
            {/* Still takes 50% width on large screens due to lg:col-span-1 in the parent grid */}
            <div
                className={`bg-red-800 rounded-lg shadow p-4 text-white flex flex-col lg:col-span-1`}
            >
                {/* Title */}
                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4 text-center">
                    Disaster Types
                </h3>

                {/* Content Area - Flex Layout (Chart Left, Legend Right) */}
                <div className="flex flex-grow items-center justify-center gap-6 p-4">
                    {" "}
                    {/* Centered items, added gap & padding */}
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
                  )`,
                            }}
                        >
                            {/* Content removed - the background *is* the chart mock */}
                        </div>
                    </div>
                    {/* Legend - Using Lucide Icons (Consider replacing with custom SVGs for design match) */}
                    {/* Legend data still comes from analyticsData, but chart visual uses design percentages */}
                    <div className="text-sm">
                        <h4 className="font-semibold mb-2 text-white">
                            Ranking:
                        </h4>
                        <ul className="space-y-2">
                            {analyticsData.disasterTypes // Legend list uses data from the code
                                .sort((a, b) => a.rank - b.rank)
                                .map((type) => {
                                    let IconComponent;
                                    switch (type.name.toLowerCase()) {
                                        case "earthquake":
                                            IconComponent = Building;
                                            break;
                                        case "flood":
                                            IconComponent = Waves;
                                            break;
                                        case "typhoon":
                                            IconComponent = Wind;
                                            break;
                                        case "landslide":
                                            IconComponent = Mountain;
                                            break;
                                        case "fire":
                                            IconComponent = Flame;
                                            break;
                                        default:
                                            IconComponent = HelpCircle;
                                    }
                                    return (
                                        <li
                                            key={type.name}
                                            className="flex justify-between items-center gap-3"
                                        >
                                            <span className="truncate pr-1 text-white">
                                                {type.rank} - {type.name}
                                            </span>
                                            {IconComponent && (
                                                <IconComponent className="w-5 h-5 text-white flex-shrink-0" />
                                            )}
                                        </li>
                                    );
                                })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MidChartRow
