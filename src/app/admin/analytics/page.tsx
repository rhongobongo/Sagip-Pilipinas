import React from "react";
import BotChartRow from "@/components/(page)/Admin/Analytics/Charts/BotChartRow";
import TopChartRow from "@/components/(page)/Admin/Analytics/Charts/TopChartRow";
import MidChartRow from "@/components/(page)/Admin/Analytics/Charts/MidChartRow";


export const revalidate = 300

const AnalyticsDashboard: React.FC = () => {
    return (
        <>
            {/* Stats Grid - Top Row (Flex layout remains the same) */}
            <TopChartRow></TopChartRow>
            {/* End of Top Stats Row */}
            {/* --- Charts Row - REVISED 50/50 Layout --- */}
            {/* Changed lg:grid-cols-3 to lg:grid-cols-2 */}
            <MidChartRow></MidChartRow>
            {/* --- Bottom Row - REVISED based on image_5a0ef1.png --- */}
            <BotChartRow></BotChartRow>
            {/* End Bottom Row */}
        </>
    );
};

export default AnalyticsDashboard;