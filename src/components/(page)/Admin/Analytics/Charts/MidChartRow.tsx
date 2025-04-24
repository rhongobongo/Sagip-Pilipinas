import {
    Building,
    Waves,
    Wind,
    Mountain,
    Flame,
    HelpCircle,
} from "lucide-react";

interface RankedDisasterType {
    name: string;
    percentage: number;
    icon: string;
    rank: number;
    count: number;
}

interface LocationData {
    [location: string]: number;
}

interface MidChartRowProps {
    rankedDisasterTypes: RankedDisasterType[];
    locationData: LocationData;
}

const MidChartRow: React.FC<MidChartRowProps> = ({
    rankedDisasterTypes,
    locationData,
}) => {
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
                        {/* Bar Chart - With accurate height representation */}
                        <div className="h-full flex items-end justify-around gap-4 pl-8">
                            {Object.entries(locationData).map(
                                ([location, value]) => (
                                    <div
                                        key={location}
                                        className="flex flex-col items-center flex-1 h-full justify-end"
                                    >
                                        {/* Bar */}
                                        <div
                                            className="w-1/3 bg-black rounded-t"
                                            style={{ height: `${value}%` }}
                                        ></div>
                                        {/* Percentage */}
                                        <div className="mt-2 text-gray-800 text-xs font-medium">
                                            {value}%
                                        </div>
                                        {/* Region name */}
                                        <div className="mt-1 text-gray-800 text-sm">
                                            {location}
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
                                    #38BDF8 0% ${rankedDisasterTypes[0]?.percentage?.toFixed(2) || 0}%, /* sky-400 (Flood) */
                                    #4ADE80 ${rankedDisasterTypes[0]?.percentage?.toFixed(2) || 0}% ${
                                        (rankedDisasterTypes[0]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[1]?.percentage ||
                                            0)
                                    }%, /* green-400 (Earthquake) */
                                    #F87171 ${
                                        (rankedDisasterTypes[0]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[1]?.percentage ||
                                            0)
                                    }% ${
                                        (rankedDisasterTypes[0]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[1]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[2]?.percentage ||
                                            0)
                                    }%, /* red-400 (Typhoon) */
                                    #FACC15 ${
                                        (rankedDisasterTypes[0]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[1]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[2]?.percentage ||
                                            0)
                                    }% ${
                                        (rankedDisasterTypes[0]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[1]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[2]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[3]?.percentage ||
                                            0)
                                    }%, /* yellow-400 (Fire) */
                                    #FB923C ${
                                        (rankedDisasterTypes[0]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[1]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[2]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[3]?.percentage ||
                                            0)
                                    }% ${
                                        (rankedDisasterTypes[0]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[1]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[2]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[3]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[4]?.percentage ||
                                            0)
                                    }%, /* orange-400 (Landslide) */
                                    #C084FC ${
                                        (rankedDisasterTypes[0]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[1]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[2]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[3]?.percentage ||
                                            0) +
                                        (rankedDisasterTypes[4]?.percentage ||
                                            0)
                                    }% 100% /* purple-400 (Other) */
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
                            {rankedDisasterTypes.map((type) => {
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
                                            {type.rank} - {type.name} -{" "}
                                            {type.percentage.toFixed(2)}%
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

export default MidChartRow;
