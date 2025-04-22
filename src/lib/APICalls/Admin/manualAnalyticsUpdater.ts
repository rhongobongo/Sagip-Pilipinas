import { db } from "@/lib/Firebase-Admin";
import { Timestamp } from "firebase-admin/firestore";

const countOrganizations = async () => {
    const snap = await db.collection("organizations").count().get();
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

    const averageRequests: Record<string, number> = {
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

const getPreviousAnalytics = async () => {
    const previousStatsSnap = await db.collection("meta").doc("stats").get();
    return previousStatsSnap.data() || {};
};

const updateAnalyticsDocument = async (data: Record<string, any>) => {
    await db.collection("meta").doc("stats").set(data, { merge: true });
};

const updateLocationStatistics = async () => {
    const aidRequestCollection = db.collection("aidRequest");
    const snapshot = await aidRequestCollection.get();
    const provinceCounts: Record<string, number> = {};

    snapshot.forEach((doc) => {
        const data = doc.data();
        const locationDetails = data.locationDetails;

        if (locationDetails?.province) {
            const province = locationDetails.province;
            provinceCounts[province] = (provinceCounts[province] || 0) + 1;
        }
    });

    await db.collection("meta").doc("stats").update({
        location_data: provinceCounts,
    });

    console.log("Finished updating location statistics in meta/stats.");
};

const getOrganizationStockData = async () => {
    const organizationsSnapshot = await db.collection("organizations").get();
    const organizationStockData: Record<string, Record<string, number>> = {};

    organizationsSnapshot.forEach((orgDoc) => {
        const orgData = orgDoc.data();
        const orgId = orgDoc.id;
        const orgName = orgDoc.get("name");

        let clothingStock = 0;
        if (orgData.clothing) {
            if (typeof orgData.aidStock.clothing.children === "number")
                clothingStock += orgData.clothing.children;
            if (typeof  orgData.aidStock.clothing.female === "number")
                clothingStock += orgData.clothing.female;
            if (typeof orgData.aidStock.clothing.male === "number")
                clothingStock += orgData.clothing.male;
        }

        let foodStock = 0;
        if (orgData.aidStock.food && typeof orgData.aidStock.food.foodPacks === "number") {
            foodStock += orgData.aidStock.food.foodPacks;
        }

        let medicineStock = 0;
        if (
            orgData.aidStock.medicalSupplies &&
            typeof orgData.aidStock.medicalSupplies.kits === "number"
        ) {
            medicineStock += orgData.aidStock.medicalSupplies.kits;
        }

        organizationStockData[orgId] = {
            orgName: orgName,
            clothing: clothingStock,
            medicine: medicineStock,
            food: foodStock,
        };
    });
    return organizationStockData;
};

const logCurrentAnalytics = (analytics: Record<string, any>) => {
    console.log("Analytics updated successfully:", analytics);
};

const logComparisonWithPrevious = (
    current: Record<string, any>,
    previous: Record<string, any>
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

export const manualAnalyticsUpdater = async () => {
    try {
        const orgCount = await countOrganizations();
        const donationCount = await countDonations();
        const disasterTotalCount = await countTotalDisasters();
        const disasterTypeCounts = await countDisastersByType();
        const averageRequests = await calculateAverageAidRequests();
        const previousAnalytics = await getPreviousAnalytics();
        const organizationStockData = await getOrganizationStockData();
        await updateLocationStatistics();

        const currentAnalyticsData = {
            "org-count": orgCount,
            "donation-count": donationCount,
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
    } catch (error) {
        console.error("Error updating analytics:", error);
    }
};
