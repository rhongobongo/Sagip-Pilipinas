import React from "react";
import BotChartRow from "@/components/(page)/Admin/Analytics/Charts/BotChartRow";
import TopChartRow from "@/components/(page)/Admin/Analytics/Charts/TopChartRow";
import MidChartRow from "@/components/(page)/Admin/Analytics/Charts/MidChartRow";
import { manualAnalyticsUpdater } from "@/lib/APICalls/Admin/manualAnalyticsUpdater";
import { fetchAndProcessStats } from "@/lib/APICalls/Admin/getAnalytics";
import updateOrganizationsWithVolunteerIds from "@/lib/APICalls/Admin/forceUpdateVolOrg";

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
    return (
        <>
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
