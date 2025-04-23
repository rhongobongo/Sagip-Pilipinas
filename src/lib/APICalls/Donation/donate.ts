// src/lib/APICalls/Donation/donate.ts
"use server";

import { db } from "@/lib/Firebase-Admin";
import {
    CheckedDonationTypes,
    DonationDetails,
    FoodDetails,
    ClothingDetails,
    MedicalSuppliesDetails,
    ShelterDetails,
    SearchAndRescueDetails,
    FinancialAssistanceDetails,
    CounselingDetails,
    TechnicalSupportDetails,
} from "@/components/(page)/donationPage/types";
import {
    Transaction,
    DocumentReference,
    FieldValue,
} from "firebase-admin/firestore";
import { AidDetails } from "@/components/(page)/AuthPage/OrgRegForm/types";
import { RequestPin } from "@/types/types";

export async function donate(
    checkedDonationTypes: CheckedDonationTypes,
    donationDetails: Partial<DonationDetails>,
    donationDate: string,
    organizationId: string,
    selectedPin: RequestPin
): Promise<{
    success: boolean;
    donationUID?: string;
    organizationId?: string;
    error?: string;
}> {
    console.log("Server Action: Incoming Donation Details:", donationDetails);
    let donationUID: string = "";
    let orgName: string = "The organization"; // Default name
    const aidRequestId = selectedPin.id;
    try {
        await db.runTransaction(async (transaction: Transaction) => {
            const orgRef: DocumentReference = db
                .collection("organizations")
                .doc(organizationId);
            const orgSnap = await transaction.get(orgRef);
            if (!orgSnap.exists) {
                throw new Error(
                    `Organization ${organizationId} does not exist`
                );
            }

            const orgData = orgSnap.data();
            orgName = orgData?.name || orgName; // Get org name
            const currentStock: AidDetails =
                (orgData?.aidStock as AidDetails) ?? {};

            const donationRef: DocumentReference = db
                .collection("donations")
                .doc();
            donationUID = donationRef.id; // Store the generated donation ID

            console.log("Server Action: Current Org Stock:", currentStock);

            // Create the primary donation document data
            const donationData = {
                donationTypes: checkedDonationTypes,
                details: donationDetails,
                estimatedDropoffDate: donationDate,
                organizationId: organizationId,
                organizationName: orgName, // Store org name for convenience
                aidRequestId: aidRequestId || null,
                timestamp: FieldValue.serverTimestamp(),
            };

            // Set the main donation document
            transaction.set(donationRef, donationData);
            console.log(`Server Action: Set donation document ${donationUID}`);

            // Update organization's aidStock based on donation details
            for (const type in checkedDonationTypes) {
                const donationTypeKey = type as keyof CheckedDonationTypes;
                if (
                    checkedDonationTypes[donationTypeKey] &&
                    donationDetails[donationTypeKey]
                ) {
                    console.log(
                        `Server Action: Updating stock for type: ${donationTypeKey}`
                    );
                    switch (donationTypeKey) {
                        case "food":
                            if (donationDetails.food)
                                updateOrgFoodStock(
                                    transaction,
                                    orgRef,
                                    donationDetails.food,
                                    currentStock
                                );
                            break;
                        case "clothing":
                            if (donationDetails.clothing)
                                updateOrgClothingStock(
                                    transaction,
                                    orgRef,
                                    donationDetails.clothing,
                                    currentStock
                                );
                            break;
                        case "medicalSupplies":
                            if (donationDetails.medicalSupplies)
                                updateOrgMedStock(
                                    transaction,
                                    orgRef,
                                    donationDetails.medicalSupplies,
                                    currentStock
                                );
                            break;
                        case "shelter":
                            if (donationDetails.shelter)
                                updateOrgShelterStock(
                                    transaction,
                                    orgRef,
                                    donationDetails.shelter,
                                    currentStock
                                );
                            break;
                        case "searchAndRescue":
                            if (donationDetails.searchAndRescue)
                                updateOrgSRStock(
                                    transaction,
                                    orgRef,
                                    donationDetails.searchAndRescue,
                                    currentStock
                                );
                            break;
                        case "financialAssistance":
                            if (donationDetails.financialAssistance)
                                updateOrgFinancialStock(
                                    transaction,
                                    orgRef,
                                    donationDetails.financialAssistance,
                                    currentStock
                                );
                            break;
                        case "counseling":
                            if (donationDetails.counseling)
                                updateOrgCounselStock(
                                    transaction,
                                    orgRef,
                                    donationDetails.counseling,
                                    currentStock
                                );
                            break;
                        case "technicalSupport":
                            if (donationDetails.technicalSupport)
                                updateOrgTechSuppStock(
                                    transaction,
                                    orgRef,
                                    donationDetails.technicalSupport,
                                    currentStock
                                );
                            break;
                    }
                }
            }
            updateDonationStats(transaction, selectedPin, donationDate);
        });


        console.log(
            `Server Action: Transaction completed successfully. Donation ID: ${donationUID}`
        );
        return {
            success: true,
            donationUID: donationUID,
            organizationId: organizationId,
        };
    } catch (error: unknown) {
        console.error("Server Action: Donation transaction failed:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "An error occurred during the donation transaction.",
        };
    }
}

// Utility functions
function parseOrDefaultInt(
    value: string | undefined | number,
    fallback: number = 0
): number {
    if (typeof value === "number") return value;
    const parsed = parseInt(value ?? "", 10); // Specify radix 10
    return isNaN(parsed) ? fallback : parsed;
}

function parseOrDefaultFloat(
    value: string | undefined | number,
    fallback: number = 0.0
): number {
    if (typeof value === "number") return value;
    const parsed = parseFloat(value ?? "");
    return isNaN(parsed) ? fallback : parsed;
}

// Helper functions for SUBTRACTING from stock (keeping original logic)
function updateOrgFoodStock(
    transaction: Transaction,
    orgRef: DocumentReference,
    details: FoodDetails,
    currentStock: AidDetails
) {
    const currentPacks = parseOrDefaultInt(currentStock.food?.foodPacks ?? 0);
    const donatedPacks = parseOrDefaultInt(details.foodPacks ?? 0);
    const updatedPacks = currentPacks - donatedPacks; // SUBTRACTING as in first file

    transaction.update(orgRef, {
        "aidStock.food.foodPacks": updatedPacks,
        "aidStock.food.available": updatedPacks > 0, // Set availability based on remaining stock
    });
}

function updateOrgClothingStock(
    transaction: Transaction,
    orgRef: DocumentReference,
    details: ClothingDetails,
    currentStock: AidDetails
) {
    const currentMale = parseOrDefaultInt(currentStock.clothing?.male ?? 0);
    const currentFemale = parseOrDefaultInt(currentStock.clothing?.female ?? 0);
    const currentChildren = parseOrDefaultInt(
        currentStock.clothing?.children ?? 0
    );

    const donatedMale = parseOrDefaultInt(details.male ?? 0);
    const donatedFemale = parseOrDefaultInt(details.female ?? 0);
    const donatedChildren = parseOrDefaultInt(details.children ?? 0);

    const updatedMale = currentMale - donatedMale; // SUBTRACTING
    const updatedFemale = currentFemale - donatedFemale; // SUBTRACTING
    const updatedChildren = currentChildren - donatedChildren; // SUBTRACTING

    transaction.update(orgRef, {
        "aidStock.clothing.male": updatedMale,
        "aidStock.clothing.female": updatedFemale,
        "aidStock.clothing.children": updatedChildren,
        "aidStock.clothing.available":
            updatedMale > 0 || updatedFemale > 0 || updatedChildren > 0,
    });
}

function updateOrgMedStock(
    transaction: Transaction,
    orgRef: DocumentReference,
    details: MedicalSuppliesDetails,
    currentStock: AidDetails
) {
    const currentKits = parseOrDefaultInt(
        currentStock.medicalSupplies?.kits ?? 0
    );
    const donatedKits = parseOrDefaultInt(details.kits ?? 0);
    const updatedKits = currentKits - donatedKits; // SUBTRACTING

    transaction.update(orgRef, {
        "aidStock.medicalSupplies.kits": updatedKits,
        "aidStock.medicalSupplies.kitType": details.kitType || null,
        "aidStock.medicalSupplies.available": updatedKits > 0,
    });
}

function updateOrgShelterStock(
    transaction: Transaction,
    orgRef: DocumentReference,
    details: ShelterDetails,
    currentStock: AidDetails
) {
    const currentTents = parseOrDefaultInt(currentStock.shelter?.tents ?? 0);
    const currentBlankets = parseOrDefaultInt(
        currentStock.shelter?.blankets ?? 0
    );

    const donatedTents = parseOrDefaultInt(details.tents ?? 0);
    const donatedBlankets = parseOrDefaultInt(details.blankets ?? 0);

    const updatedTents = currentTents - donatedTents; // SUBTRACTING
    const updatedBlankets = currentBlankets - donatedBlankets; // SUBTRACTING

    transaction.update(orgRef, {
        "aidStock.shelter.tents": updatedTents,
        "aidStock.shelter.blankets": updatedBlankets,
        "aidStock.shelter.available": updatedTents > 0 || updatedBlankets > 0,
    });
}

function updateOrgSRStock(
    transaction: Transaction,
    orgRef: DocumentReference,
    details: SearchAndRescueDetails,
    currentStock: AidDetails
) {
    const currentKits = parseOrDefaultInt(
        currentStock.searchAndRescue?.rescueKits ?? 0
    );
    const currentPersonnel = parseOrDefaultInt(
        currentStock.searchAndRescue?.rescuePersonnel ?? 0
    );

    const donatedKits = parseOrDefaultInt(details.rescueKits ?? 0);
    const donatedPersonnel = parseOrDefaultInt(details.rescuePersonnel ?? 0);

    const updatedKits = currentKits - donatedKits; // SUBTRACTING
    const updatedPersonnel = currentPersonnel - donatedPersonnel; // SUBTRACTING

    transaction.update(orgRef, {
        "aidStock.searchAndRescue.rescueKits": updatedKits,
        "aidStock.searchAndRescue.rescuePersonnel": updatedPersonnel,
        "aidStock.searchAndRescue.available":
            updatedKits > 0 || updatedPersonnel > 0,
    });
}

function updateOrgFinancialStock(
    transaction: Transaction,
    orgRef: DocumentReference,
    details: FinancialAssistanceDetails,
    currentStock: AidDetails
) {
    const currentFunds = parseOrDefaultFloat(
        currentStock.financialAssistance?.totalFunds ?? 0
    );
    const donatedFunds = parseOrDefaultFloat(details.totalFunds ?? 0);
    const updatedFunds = currentFunds - donatedFunds; // SUBTRACTING

    transaction.update(orgRef, {
        "aidStock.financialAssistance.totalFunds": updatedFunds,
        "aidStock.financialAssistance.available": updatedFunds > 0,
    });
}

function updateOrgCounselStock(
    transaction: Transaction,
    orgRef: DocumentReference,
    details: CounselingDetails,
    currentStock: AidDetails
) {
    const currentCounselors = parseOrDefaultInt(
        currentStock.counseling?.counselors ?? 0
    );
    const currentHours = parseOrDefaultInt(currentStock.counseling?.hours ?? 0);

    const donatedCounselors = parseOrDefaultInt(details.counselors ?? 0);
    const donatedHours = parseOrDefaultInt(details.hours ?? 0);

    const updatedCounselors = currentCounselors - donatedCounselors; // SUBTRACTING
    const updatedHours = currentHours - donatedHours; // SUBTRACTING

    transaction.update(orgRef, {
        "aidStock.counseling.counselors": updatedCounselors,
        "aidStock.counseling.hours": updatedHours,
        "aidStock.counseling.available":
            updatedCounselors > 0 || updatedHours > 0,
    });
}

function updateOrgTechSuppStock(
    transaction: Transaction,
    orgRef: DocumentReference,
    details: TechnicalSupportDetails,
    currentStock: AidDetails
) {
    const currentVehicles = parseOrDefaultInt(
        currentStock.technicalSupport?.vehicles ?? 0
    );
    const currentCommunication = parseOrDefaultInt(
        currentStock.technicalSupport?.communication ?? 0
    );

    const donatedVehicles = parseOrDefaultInt(details.vehicles ?? 0);
    const donatedCommunication = parseOrDefaultInt(details.communication ?? 0);

    const updatedVehicles = currentVehicles - donatedVehicles; // SUBTRACTING
    const updatedCommunication = currentCommunication - donatedCommunication; // SUBTRACTING

    transaction.update(orgRef, {
        "aidStock.technicalSupport.vehicles": updatedVehicles,
        "aidStock.technicalSupport.communication": updatedCommunication,
        "aidStock.technicalSupport.available":
            updatedVehicles > 0 || updatedCommunication > 0,
    });
}

const updateDonationStats = async (
    transaction: Transaction,
    pin: RequestPin,
    donationDate: string
) => {
    try {
        const collectionMetaRef: DocumentReference = db
            .collection("meta")
            .doc("stats");
        const metaDoc = await transaction.get(collectionMetaRef);
        const currentStats = metaDoc.data() || {};

        const currentDonationCount = currentStats["donation-count"] ?? 0;
        transaction.update(collectionMetaRef, {
            "donation-count": currentDonationCount + 1,
        });

        const calamityType = pin.calamityType;
        const normalizedCalamityType =
            calamityType &&
            ["flood", "earthquake", "fire", "typhoon", "landslide"].includes(
                calamityType.toLowerCase()
            )
                ? calamityType.toLowerCase()
                : "other";

        if (normalizedCalamityType) {
            const calamityCountField = `calamity-${normalizedCalamityType}-count`;
            const totalResponseTimeField = `calamity-${normalizedCalamityType}-totalResponseTime`;
            const averageResponseTimeField = `calamity-${normalizedCalamityType}-averageResponseTime`;

            const currentCalamityCount = currentStats[calamityCountField] ?? 0;
            transaction.update(collectionMetaRef, {
                [calamityCountField]: currentCalamityCount + 1,
            });

            const donationTimestamp = new Date(donationDate).getTime();
            const pinDateTimestamp = pin.date?.toMillis();
            const nowTimestamp = Date.now();
            let responseTime: number | null = null;

            if (
                typeof donationTimestamp === "number" &&
                typeof pinDateTimestamp === "number"
            ) {
                responseTime = nowTimestamp - pinDateTimestamp;
                const currentTotalResponseTime =
                    currentStats[totalResponseTimeField] ?? 0;
                const newTotalResponseTime =
                    currentTotalResponseTime + responseTime;
                const averageResponseTime =
                    newTotalResponseTime / (currentCalamityCount + 1) || 0;

                transaction.update(collectionMetaRef, {
                    [totalResponseTimeField]: newTotalResponseTime,
                    [averageResponseTimeField]: averageResponseTime,
                });

                console.log(
                    `Response Time for ${normalizedCalamityType}:`,
                    responseTime,
                    "milliseconds"
                );
                console.log(
                    `Average Response Time for ${normalizedCalamityType}:`,
                    averageResponseTime,
                    "milliseconds"
                );
            } else {
                console.log(
                    "Either donationTimestamp or pinDateTimestamp is not a number, cannot calculate response time for average."
                );
            }
        }

        console.log("Donation count incremented within transaction.");
    } catch (error) {
        console.error(
            "Error incrementing donation count within transaction:",
            error
        );
    }
};
