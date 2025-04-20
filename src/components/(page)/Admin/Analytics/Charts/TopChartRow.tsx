import TrendIcon from "../TrendIcon";
import { HandHelping, Building2 } from "lucide-react";

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


const TopChartRow = () => {
    return (
        <>
            {/* Stats Grid - Top Row (Flex layout remains the same) */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                {/* Average Aid Requests Card (remains the same) */}
                <div
                    className={`bg-red-800 rounded-lg shadow-sm overflow-hidden text-white md:basis-1/3`}
                >
                    <div
                        className={`bg-red-900 px-3 py-2 text-sm font-medium uppercase tracking-wider text-center`}
                    >
                        {" "}
                        Average Aid Requests{" "}
                    </div>
                    <div className="p-4 flex justify-around items-center">
                        <div className="text-center">
                            {" "}
                            <div className="text-small mb-1">Weekly</div>{" "}
                            <div className="text-2xl font-bold">
                                <TrendIcon
                                    trend={
                                        analyticsData.averageRequests
                                            .weeklyTrend
                                    }
                                />{" "}
                                {analyticsData.averageRequests.weekly}
                            </div>{" "}
                        </div>
                        <div className="text-center">
                            {" "}
                            <div className="text-small mb-1">Monthly</div>{" "}
                            <div className="text-2xl font-bold">
                                <TrendIcon
                                    trend={
                                        analyticsData.averageRequests
                                            .monthlyTrend
                                    }
                                />{" "}
                                {analyticsData.averageRequests.monthly}
                            </div>{" "}
                        </div>
                        <div className="text-center">
                            {" "}
                            <div className="text-small mb-1">Yearly</div>{" "}
                            <div className="text-2xl font-bold">
                                <TrendIcon
                                    trend={
                                        analyticsData.averageRequests
                                            .yearlyTrend
                                    }
                                />{" "}
                                {analyticsData.averageRequests.yearly}
                            </div>{" "}
                        </div>
                    </div>
                </div>
                {/* Wrapper for the remaining 3 cards */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Total Organizations - Using Lucide Icon */}
                    <div
                        className={`bg-red-800 rounded-lg shadow-sm overflow-hidden text-white`}
                    >
                        <div
                            className={`bg-red-900 px-4 py-2 text-sm font-medium uppercase tracking-wider text-center`}
                        >
                            Total Organizations
                        </div>
                        <div className="p-4 flex items-center justify-center">
                            <div className="mr-3">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-4xl font-bold">
                                {analyticsData.totalOrganizations}
                            </div>
                        </div>
                    </div>

                    <div
                        className={`bg-red-800 rounded-lg shadow-sm overflow-hidden text-white`}
                    >
                        <div
                            className={`bg-red-900 px-4 py-2 text-sm font-medium uppercase tracking-wider text-center`}
                        >
                            Total Volunteers
                        </div>
                        <div className="p-4 flex items-center justify-center">
                            <div className="mr-3">
                                {/* Using Lucide HandHelping icon */}
                                <HandHelping className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-4xl font-bold">
                                {analyticsData.totalVolunteers}
                            </div>
                        </div>
                    </div>

                    <div
                        className={`bg-red-800 rounded-lg shadow-sm overflow-hidden text-white`}
                    >
                        <div
                            className={`bg-red-900 px-4 py-2 text-sm font-medium uppercase tracking-wider text-center`}
                        >
                            Completed Operations
                        </div>
                        <div className="p-4 flex items-center justify-center">
                            <div className="mr-3">
                                {/* Using placeholder Check icon */}
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                                {/* Consider replacing with Lucide's CheckCircle2 */}
                            </div>
                            <div className="text-4xl font-bold">
                                {analyticsData.completedOperations}
                            </div>
                        </div>
                    </div>
                </div>{" "}
                {/* End wrapper for 3 cards */}
            </div>{" "}
        </>
    );
};

export default TopChartRow