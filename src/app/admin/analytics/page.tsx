import React from "react";
import BotChartRow from "@/components/(page)/Admin/Analytics/Charts/BotChartRow";
import TopChartRow from "@/components/(page)/Admin/Analytics/Charts/TopChartRow";
import MidChartRow from "@/components/(page)/Admin/Analytics/Charts/MidChartRow";
import { manualAnalyticsUpdater } from "@/lib/APICalls/Admin/manualAnalyticsUpdater";
import { fetchAndProcessStats } from "@/lib/APICalls/Admin/getAnalytics";
import updateOrganizationsWithVolunteerIds from "@/lib/APICalls/Admin/forceUpdateVolOrg";
import NavTab from "@/components/(page)/Admin/Navbar/Navtab";
import forceUpdateAidRequest from "@/lib/APICalls/Admin/forceUpdateAidRequest";
export const revalidate = 1500;

interface AverageAidRequests {
    monthly: number;
    weekly: number;
    yearly: number;
    mTrend?: "up" | "down";
    wTrend?: "up" | "down";
    yTrend?: "up" | "down";
}

interface StatsData {
    "volunteer-count"?: number;
    "org-count"?: number;
    operationsCompleted?: number;
}

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

interface OrganizationStock {
    orgName: string;
    clothing: number;
    medicine: number;
    food: number;
    volunteers: number;
}

interface OrganizationStockData {
    [orgId: string]: OrganizationStock;
}

const AnalyticsDashboard: React.FC = async () => {
    const data = await fetchAndProcessStats();
    manualAnalyticsUpdater();
    forceUpdateAidRequest();
    return (
        <>
            <div className="bg-red-800 p-6 rounded-lg mb-6 text-white shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-700 opacity-30 transform translate-x-1/4 -translate-y-1/4"></div>
                <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-red-600 opacity-20"></div>
                <h1 className="text-3xl font-bold mb-2 relative z-10">
                    Hello Admin!
                </h1>
                <p className="text-sm text-gray-200 font-medium relative z-10 mb-4 text-center">
                    {" "}
                    {/* Centered text */}
                    Track real-time insights and performance metrics to make
                    informed decisions. Explore user activity, disaster reports,
                    and aid distribution data all in one place.
                </p>
                <div className="flex flex-wrap justify-between mt-2 relative z-10">
                    <NavTab
                        label="Review Requests"
                        href="/admin/review-requests"
                    />
                    <NavTab label="Dashboard" href="/admin/analytics " active/>
                    <NavTab label="News Articles" href="/admin/news" />
                    <NavTab label="Organizations" href="/admin/organizations" />
                    <NavTab label="Volunteers" href="/admin/volunteers" />
                </div>
            </div>
            <TopChartRow
                countStats={data.currentStats as StatsData}
                aidRequestStats={
                    data.averageAidRequestsComparison as AverageAidRequests
                }
            ></TopChartRow>
            <MidChartRow
                rankedDisasterTypes={
                    data.rankedDisasters as RankedDisasterType[]
                }
                locationData={data.location_data as LocationData}
            ></MidChartRow>
            <BotChartRow
                orgStock={data.orgStock as OrganizationStockData}
                responseTime={data.responseTime as string}
            ></BotChartRow>
        </>
    );
};

export default AnalyticsDashboard;
