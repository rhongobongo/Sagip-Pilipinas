"use server";

import { db } from "@/lib/Firebase-Admin";

export interface AverageAidRequests {
    monthly: number;
    weekly: number;
    yearly: number;
    mTrend?: "up" | "down";
    wTrend?: "up" | "down";
    yTrend?: "up" | "down";
}

const compareValues = async (
    current: number,
    previous: number
): Promise<"up" | "down"> => {
    if (current > previous) {
        return "up";
    } else {
        return "down";
    }
};

export const compareAverageAidRequests = async (
    currentSnap: FirebaseFirestore.DocumentSnapshot,
    prevSnap: FirebaseFirestore.DocumentSnapshot
): Promise<AverageAidRequests | undefined> => {
    if (currentSnap.exists) {
        const currentData = currentSnap.data() as {
            "average-aid-requests"?: Omit<
                AverageAidRequests,
                "mTrend" | "wTrend" | "yTrend"
            >;
        };
        const currentRequests = currentData["average-aid-requests"];

        if (currentRequests) {
            const prevData = prevSnap.data() as {
                "average-aid-requests"?: Omit<
                    AverageAidRequests,
                    "mTrend" | "wTrend" | "yTrend"
                >;
            };
            const previousRequests = prevData
                ? prevData["average-aid-requests"]
                : undefined;

            const trends: AverageAidRequests = {
                monthly: parseFloat(currentRequests.monthly.toFixed(2)),
                weekly: parseFloat(currentRequests.weekly.toFixed(2)),
                yearly: parseFloat(currentRequests.yearly.toFixed(2)),
            };

            if (previousRequests) {
                trends.mTrend = await compareValues(
                    currentRequests.monthly,
                    previousRequests.monthly
                );
                trends.wTrend = await compareValues(
                    currentRequests.weekly,
                    previousRequests.weekly
                );
                trends.yTrend = await compareValues(
                    currentRequests.yearly,
                    previousRequests.yearly
                );
            }
            return trends;
        } else {
            console.log(
                "No 'average-aid-requests' found in the current stats document."
            );
            return undefined;
        }
    } else {
        console.log("No current stats document!");
        return undefined;
    }
};

interface StatsData {
    "volunteer-count"?: number;
    "org-count"?: number;
    operationsCompleted?: number;
}

export const getStatsCountsFromSnapshot = async (
    snapshot: FirebaseFirestore.DocumentSnapshot
): Promise<StatsData | undefined> => {
    if (snapshot.exists) {
        return snapshot.data() as StatsData;
    } else {
        console.log("No such document!");
        return undefined;
    }
};

interface DisasterCounts {
    earthquake?: number;
    fire?: number;
    flood?: number;
    landslide?: number;
    other?: number;
    typhoon?: number;
}

interface RankedDisasterType {
    name: string;
    percentage: number;
    icon: string;
    rank: number;
}

export const processAndRankDisasterCounts = async (
    disasterCounts: DisasterCounts | undefined
): Promise<RankedDisasterType[] | undefined> => {
    if (!disasterCounts) {
        return undefined;
    }

    const totalDisasters = Object.values(disasterCounts).reduce(
        (sum, count) => sum + (count ?? 0),
        0
    );

    if (totalDisasters === 0) {
        return [];
    }

    const disasterArrayPromises = Object.entries(disasterCounts).map(
        async ([name, count]) => ({
            name: await capitalizeFirstLetter(name),
            count: count ?? 0,
            percentage: ((count ?? 0) / totalDisasters) * 100,
            icon: await getDisasterIcon(name),
        })
    );

    const disasterArray = await Promise.all(disasterArrayPromises);

    disasterArray.sort((a, b) => b.count - a.count);

    const rankedDisasters = disasterArray.map((disaster, index) => ({
        ...disaster,
        rank: index + 1,
    }));
    console.log(rankedDisasters);
    return rankedDisasters;
};

const capitalizeFirstLetter = async (str: string): Promise<string> => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const getDisasterIcon = async (name: string): Promise<string> => {
    switch (name) {
        case "flood":
            return "🌊";
        case "earthquake":
            return "🏚️";
        case "typhoon":
            return "🌀";
        case "fire":
            return "🔥";
        case "landslide":
            return "⛰️";
        default:
            return "❓";
    }
};

interface LocationData {
    [location: string]: number;
}

export const fetchAndRankTraffic = async (
    locationData: LocationData | undefined
): Promise<LocationData> => {
    try {
        if (!locationData || Object.keys(locationData).length === 0) {
            return {};
        }
        const sortedLocations = Object.entries(locationData).sort(
            ([, countA], [, countB]) => countB - countA
        );

        const top5 = sortedLocations.slice(0, 5);
        const others = sortedLocations.slice(5);

        const totalSum = Object.values(locationData).reduce(
            (sum, count) => sum + count,
            0
        );
        const rankedData: { [location: string]: number } = {};

        top5.forEach(([location, count]) => {
            rankedData[location] = parseFloat(
                ((count / totalSum) * 100).toFixed(2)
            );
        });

        if (others.length > 0) {
            const othersSum = others.reduce((sum, [, count]) => sum + count, 0);
            rankedData["Others"] = parseFloat(
                ((othersSum / totalSum) * 100).toFixed(2)
            );
        }

        console.log(rankedData);
        return rankedData;
    } catch (error) {
        console.error("Error fetching and ranking traffic:", error);
        return {};
    }
};

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


export const fetchAndProcessStats = async () => {
    try {
        const currentRef = db.collection("meta").doc("stats");
        const prevRef = db.collection("meta").doc("prev-stats");

        const [currentSnap, prevSnap] = await Promise.all([
            currentRef.get(),
            prevRef.get(),
        ]);

        const averageAidRequestsComparison = await compareAverageAidRequests(
            currentSnap,
            prevSnap
        );

        const currentStatsSnapshot = currentSnap.data() as {
            "disaster-counts"?: DisasterCounts;
            location_data?: LocationData;
        };
        const rankedDisasters = await processAndRankDisasterCounts(
            currentStatsSnapshot["disaster-counts"]
        );

        const location_data = await fetchAndRankTraffic(
            currentStatsSnapshot["location_data"]
        );

        const orgStock : OrganizationStockData = currentSnap.data()?.["organization-stock"];
        const currentStats = await getStatsCountsFromSnapshot(currentSnap);
        const previousStats = await getStatsCountsFromSnapshot(prevSnap);
        const responseTime : string = currentSnap.data()?.["averageResponseTime"];

        console.log(averageAidRequestsComparison);

        return {
            averageAidRequestsComparison,
            currentStats,
            rankedDisasters,
            previousStats,
            location_data,
            orgStock,
            responseTime
        };
    } catch (error) {
        console.error("Error fetching documents:", error);
        return {
            error: "Failed to fetch and process stats",
        };
    }
};
