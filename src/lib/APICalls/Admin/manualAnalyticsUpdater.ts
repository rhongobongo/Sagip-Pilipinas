import { db } from "@/lib/Firebase-Admin";
import { DocumentData, Timestamp } from "firebase-admin/firestore";

// Define interfaces for better type safety
interface AnalyticsData {
    "org-count": number;
    "donation-count": number;
    "disaster-count": number;
    "disaster-counts": Record<string, number>;
    "average-aid-requests": AverageRequests;
    "organization-stock": OrganizationStockData;
    location_data?: Record<string, number>;
    [key: string]: unknown;
}

interface AverageRequests {
    yearly: number;
    monthly: number;
    weekly: number;
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

const countOrganizations = async () => {
    const snap = await db.collection("organizations").count().get();
    return snap.data().count;
};

const countVolunteers = async () => {
    const snap = await db.collection("volunteers").count().get();
    return snap.data().count;
};

const countDonations = async () => {
    const snap = await db.collection("donations").count().get();

    return snap.data().count;
};

const countTotalDisasters = async () => {
    const snap = await db.collection("aidRequest").count().get();
    return snap.data().count;
};

const countDisastersByType = async () => {
    const disasterTypeCounts: Record<string, number> = {};
    const calamityTypes = [
        "flood",
        "earthquake",
        "fire",
        "typhoon",
        "landslide",
    ];

    for (const type of calamityTypes) {
        const snap = await db
            .collection("aidRequest")
            .where("calamityType", "==", type)
            .count()
            .get();
        disasterTypeCounts[type] = snap.data().count;
    }

    const disasterTotalCount = await countTotalDisasters();
    const specificTypeCount = Object.values(disasterTypeCounts).reduce(
        (sum, count) => sum + count,
        0
    );
    const otherCount = disasterTotalCount - specificTypeCount;
    disasterTypeCounts["other"] = Math.max(0, otherCount);

    return disasterTypeCounts;
};

const calculateAverageAidRequests = async () => {
    const aidRequestDocs = await db.collection("aidRequest").get();
    const allTimestamps: number[] = aidRequestDocs.docs
        .map((doc) => (doc.data().timestamp as Timestamp)?.toMillis())
        .filter((ts) => typeof ts === "number");

    const averageRequests: AverageRequests = {
        yearly: 0,
        monthly: 0,
        weekly: 0,
    };

    if (allTimestamps.length > 0) {
        const now = Date.now();

        const firstRequestYear = new Date(
            Math.min(...allTimestamps)
        ).getFullYear();
        const currentYear = new Date(now).getFullYear();
        const numberOfYears = currentYear - firstRequestYear + 1;
        averageRequests.yearly = allTimestamps.length / numberOfYears;

        const firstRequestTime = Math.min(...allTimestamps);
        const numberOfMonths =
            (now - firstRequestTime) / (1000 * 60 * 60 * 24 * 30.44);
        averageRequests.monthly = allTimestamps.length / numberOfMonths;

        const numberOfWeeks =
            (now - firstRequestTime) / (1000 * 60 * 60 * 24 * 7);
        averageRequests.weekly = allTimestamps.length / numberOfWeeks;
    }

    return averageRequests;
};

const getPreviousAnalytics = async (): Promise<AnalyticsData> => {
    const previousStatsSnap = await db.collection("meta").doc("stats").get();
    await db
        .collection("meta")
        .doc("prev-stats")
        .set(previousStatsSnap.data() as DocumentData);
    return (previousStatsSnap.data() as AnalyticsData) || ({} as AnalyticsData);
};

const updateAnalyticsDocument = async (data: Record<string, unknown>) => {
    await db.collection("meta").doc("stats").set(data, { merge: true });
};

const updateLocationStatistics = async () => {
    try {
        const aidRequestCollection = db.collection("aidRequest");
        const snapshot = await aidRequestCollection.get();
        const provinceCounts: Record<string, number> = {};

        snapshot.forEach((doc) => {
            const locationDetails = doc.get("locationDetails");
            if (locationDetails) {
                const province =
                    locationDetails.province ?? locationDetails.region;

                console.log(province);
                provinceCounts[province] = (provinceCounts[province] || 0) + 1;
            }
        });

        await db.collection("meta").doc("stats").set(
            {
                location_data: provinceCounts,
            },
            { merge: true }
        );

        console.log("Finished updating location statistics in meta/stats.");
    } catch (error) {
        console.error("Error updating location statistics:", error);
    }
};

const getOrganizationStockData = async () => {
    const organizationsSnapshot = await db.collection("organizations").get();
    const organizationStockData: OrganizationStockData = {};

    organizationsSnapshot.forEach((orgDoc) => {
        const orgData = orgDoc.data();
        const orgId = orgDoc.id;
        const orgName = orgDoc.get("name");

        let clothingStock = 0;
        if (orgData.clothing) {
            if (typeof orgData.aidStock.clothing.children === "number")
                clothingStock += orgData.clothing.children;
            if (typeof orgData.aidStock.clothing.female === "number")
                clothingStock += orgData.clothing.female;
            if (typeof orgData.aidStock.clothing.male === "number")
                clothingStock += orgData.clothing.male;
        }

        let foodStock = 0;
        if (
            orgData.aidStock.food &&
            typeof orgData.aidStock.food.foodPacks === "number"
        ) {
            foodStock += orgData.aidStock.food.foodPacks;
        }

        let medicineStock = 0;
        if (
            orgData.aidStock.medicalSupplies &&
            typeof orgData.aidStock.medicalSupplies.kits === "number"
        ) {
            medicineStock += orgData.aidStock.medicalSupplies.kits;
        }

        let volunteerCount = 0;
        if (Array.isArray(orgData.volunteerIds)) {
            volunteerCount = orgData.volunteerIds.length;
        } else {
            console.warn(
                "orgData.volunteerIds is not an array:",
                orgData.volunteerIds
            );
        }

        organizationStockData[orgId] = {
            orgName: orgName,
            clothing: clothingStock,
            medicine: medicineStock,
            food: foodStock,
            volunteers: volunteerCount,
        };
    });
    return organizationStockData;
};

const logCurrentAnalytics = (analytics: AnalyticsData) => {
    console.log("Analytics updated successfully:", analytics);
};

const logComparisonWithPrevious = (
    current: AnalyticsData,
    previous: AnalyticsData
) => {
    const currentAverage = current["average-aid-requests"] ?? {
        yearly: 0,
        monthly: 0,
        weekly: 0,
    };
    const previousAverage = previous["average-aid-requests"] ?? {
        yearly: 0,
        monthly: 0,
        weekly: 0,
    };

    console.log("\nComparison with Previous Analytics:");
    console.log(
        `  Yearly Average Change: ${currentAverage.yearly - previousAverage.yearly}`
    );
    console.log(
        `  Monthly Average Change: ${currentAverage.monthly - previousAverage.monthly}`
    );
    console.log(
        `  Weekly Average Change: ${currentAverage.weekly - previousAverage.weekly}`
    );
};

const countOperations = async () => {
    const organizationsSnapshot = await db.collection("donations").get();

    let count = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    organizationsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const dropoffDateString = data.estimatedDropoffDate;

        if (dropoffDateString) {
            const dropoffDate = new Date(dropoffDateString);
            dropoffDate.setHours(0, 0, 0, 0);

            if (currentDate >= dropoffDate) {
                count++;
            }
        }
    });

    console.log(
        "Number of donations with estimated dropoff date on or before today:",
        count
    );

    try {
        await db.collection("meta").doc("stats").set({
            operationsCompleted: count,
        }, {merge: true});
        console.log(
            "Updated 'stats' document with operationsCompleted:",
            count
        );
    } catch (error) {
        console.error("Error updating 'stats' document:", error);
    }
};

const getAverageResponseTimeHuman = async () => {
    try {
        const donationsRef = db.collection("donations");
        const snapshot = await donationsRef.get();
        const responseTimesMillis: number[] = [];

        for (const doc of snapshot.docs) {
            const donationData = doc.data();
            const aidRequestId = donationData.aidRequestId;
            const donationTimestamp = donationData.timestamp;

            if (aidRequestId && donationTimestamp) {
                const timestampMatch = aidRequestId.match(/(\d+)_/);
                if (timestampMatch[1]) {
                    const requestTimestampMillis = parseInt(
                        timestampMatch[1],
                        10
                    );
                    const requestDate = new Date(requestTimestampMillis);
                    const donationDate = donationTimestamp.toDate();
                    const timeDifferenceMillis =
                        donationDate.getTime() - requestDate.getTime();
                    responseTimesMillis.push(timeDifferenceMillis);
                }
            }
        }

        if (responseTimesMillis.length > 0) {
            const sumMillis = responseTimesMillis.reduce(
                (acc, curr) => acc + curr,
                0
            );
            const averageMillis = sumMillis / responseTimesMillis.length;

            const formatTime = (milliseconds: number) => {
                const seconds = Math.floor((milliseconds / 1000) % 60);
                const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
                const hours = Math.floor(
                    (milliseconds / (1000 * 60 * 60)) % 24
                );
                const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

                const parts: string[] = [];
                if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
                if (hours > 0)
                    parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
                if (minutes > 0)
                    parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
                if (seconds > 0 && days === 0 && hours === 0)
                    parts.push(`${seconds} second${seconds > 1 ? "s" : ""}`);

                return parts.join(", ");
            };

            const averageResponseTime = formatTime(averageMillis);
            await db.collection('meta').doc('stats').set({ averageResponseTime }, { merge: true });
        } else {
            console.log("No valid data to calculate average response time.");
            return null;
        }
    } catch (error) {
        console.error("Error calculating average response time:", error);
        return null;
    }
};

export const manualAnalyticsUpdater = async () => {
    try {
        const orgCount = await countOrganizations();
        const donationCount = await countDonations();
        const volunteerCount = await countVolunteers();
        const disasterTotalCount = await countTotalDisasters();
        const disasterTypeCounts = await countDisastersByType();
        const averageRequests = await calculateAverageAidRequests();
        const previousAnalytics = await getPreviousAnalytics();
        const organizationStockData = await getOrganizationStockData();

        const currentAnalyticsData: AnalyticsData = {
            "org-count": orgCount,
            "donation-count": donationCount,
            "volunteer-count": volunteerCount,
            "disaster-count": disasterTotalCount,
            "disaster-counts": disasterTypeCounts,
            "average-aid-requests": averageRequests,
            "organization-stock": organizationStockData,
        };

        await updateAnalyticsDocument(currentAnalyticsData);
        logCurrentAnalytics({
            ...currentAnalyticsData,
            "previous-average-aid-requests":
                previousAnalytics["average-aid-requests"],
        });
        logComparisonWithPrevious(currentAnalyticsData, previousAnalytics);
        await updateLocationStatistics();
        await getAverageResponseTimeHuman();
        await countOperations();
    } catch (error) {
        console.error("Error updating analytics:", error);
    }
};
