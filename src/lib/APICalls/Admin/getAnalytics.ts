"use server";

import { db } from "@/lib/Firebase-Admin";

export interface AnalyticsData {
    averageRequests: {
        weekly: number;
        monthly: number;
        yearly: number;
        weeklyTrend: "up" | "down";
        monthlyTrend: "up" | "down";
        yearlyTrend: "up" | "down";
    };
    totalOrganizations: number;
    totalVolunteers: number;
    completedOperations: number;
    disasterTypes: DisasterType[];
    disasterTraffic: {
        regions: string[];
        values: number[];
    };
    aidTypesStocks: {
        food: string;
        clothes: string;
        volunteers: string;
        medicine: string;
    };
    engagements: string;
    averageResponseTime: Record<DisasterCategory, string>;
}

export interface DisasterType {
    name: string;
    percentage: number;
    icon: string;
    rank: number;
}

export type DisasterCategory =
    | "earthquake"
    | "fire"
    | "flood"
    | "landslide"
    | "other"
    | "typhoon";

export const getAnalytics = async () => {
    try {
        const docRef = db.collection("meta").doc("stats");
        const snapshot = await docRef.get();

        if (snapshot.exists) {
            console.log("Document data:", snapshot.data());
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching document:", error);
    }
};
