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
// Make sure to import serverTimestamp
import { Transaction, DocumentReference, FieldValue } from "firebase-admin/firestore";
import { AidDetails } from "@/components/(page)/AuthPage/OrgRegForm/types";

// Updated function signature
export const donate = async (
    checkedDonationTypes: CheckedDonationTypes,
    donationDetails: Partial<DonationDetails>, // Use Partial since not all details might be present
    donationDate: string,
    organizationId: string,
    aidRequestId: string | null // Add this parameter
) => {
    console.log("Incoming Donation Details:", donationDetails);
    let donationUID: string = "";
    try {
        await db.runTransaction(async (transaction: Transaction) => {
            // Use organizationId consistently
            const orgRef = db.collection("organizations").doc(organizationId);
            const orgSnap = await transaction.get(orgRef);
            if (!orgSnap.exists) throw new Error("Organization does not exist");

            const orgData = orgSnap.data();
            // Ensure aidStock exists or default to empty object
            const currentStock: AidDetails = orgData?.aidStock ?? {};

            const donationRef = db.collection("donations").doc();
            donationUID = donationRef.id; // Store the generated donation ID

            console.log("Current Org Stock:", currentStock);

            // --- Create the primary donation document data ---
            const donationData = {
                donationTypes: checkedDonationTypes,
                details: donationDetails, // Store the detailed breakdown
                estimatedDropoffDate: donationDate,
                organizationId: organizationId, // Store the organization ID string
                aidRequestId: aidRequestId || null, // Include the aid request ID or null
                timestamp: FieldValue.serverTimestamp(),
                // Note: You might want to add donor info here if available (e.g., userId)
            };

            // --- Set the main donation document ---
            // This replaces the initial transaction.set in the old code
            transaction.set(donationRef, donationData);

            // --- Update organization's aidStock based on donation details ---
            // Iterate through the *checked* donation types
            for (const type in checkedDonationTypes) {
                // Check if the type is true (checked) and if details exist for it
                if (checkedDonationTypes[type as keyof CheckedDonationTypes] && donationDetails[type as keyof DonationDetails]) {
                    switch (type) {
                        case "food":
                            if (donationDetails.food)
                                updateOrgFoodStock( // Renamed helper slightly for clarity
                                    transaction,
                                    orgRef,
                                    donationDetails.food,
                                    currentStock
                                );
                            break;
                        case "clothing":
                            if (donationDetails.clothing)
                                updateOrgClothingStock( // Renamed helper slightly for clarity
                                    transaction,
                                    orgRef,
                                    donationDetails.clothing,
                                    currentStock
                                );
                            break;
                        case "medicalSupplies":
                            if (donationDetails.medicalSupplies)
                                updateOrgMedStock( // Renamed helper slightly for clarity
                                    transaction,
                                    orgRef,
                                    donationDetails.medicalSupplies,
                                    currentStock
                                );
                            break;
                        case "shelter":
                            if (donationDetails.shelter)
                                updateOrgShelterStock( // Renamed helper slightly for clarity
                                    transaction,
                                    orgRef,
                                    donationDetails.shelter,
                                    currentStock
                                );
                            break;
                        case "searchAndRescue":
                            if (donationDetails.searchAndRescue)
                                updateOrgSRStock( // Renamed helper slightly for clarity
                                    transaction,
                                    orgRef,
                                    donationDetails.searchAndRescue,
                                    currentStock
                                );
                            break;
                        case "financialAssistance":
                            if (donationDetails.financialAssistance)
                                updateOrgFinancialStock( // Renamed helper slightly for clarity
                                    transaction,
                                    orgRef,
                                    donationDetails.financialAssistance,
                                    currentStock
                                );
                            break;
                        case "counseling":
                            if (donationDetails.counseling)
                                updateOrgCounselStock( // Renamed helper slightly for clarity
                                    transaction,
                                    orgRef,
                                    donationDetails.counseling,
                                    currentStock
                                );
                            break;
                        case "technicalSupport":
                            if (donationDetails.technicalSupport)
                                updateOrgTechSuppStock( // Renamed helper slightly for clarity
                                    transaction,
                                    orgRef,
                                    donationDetails.technicalSupport,
                                    currentStock
                                );
                            break;
                    }
                }
            }
        });

        console.log("Transaction completed successfully. Donation ID:", donationUID);
        // Return the generated donation ID along with success status
        return { success: true, donationUID: donationUID };

    } catch (error: unknown) {
        console.error("Transaction failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An error occurred during the donation transaction."
        };
    }
};

// --- Helper functions to update Organization Stock (Removed donationRef updates) ---

const updateOrgFoodStock = ( // Renamed
    transaction: Transaction,
    orgRef: DocumentReference,
    details: FoodDetails,
    currentStock: AidDetails
) => {
    // *** Important: Decide if donation ADDS to stock or FULFILLS a need (subtracts) ***
    // The OLD code SUBTRACTED from stock, assuming stock represented NEEDED items.
    // If a donation INCREASES available stock, you should ADD instead of subtract.
    // Assuming donation INCREASES available stock:
    const currentPacks = parseOrDefaultInt(currentStock.food?.foodPacks ?? "0");
    const donatedPacks = parseOrDefaultInt(details.foodPacks ?? "0");
    const updatedPacks = currentPacks - donatedPacks; // ADDING donated items

    transaction.update(orgRef, {
        "aidStock.food.foodPacks": updatedPacks,
    });
};

const updateOrgClothingStock = ( // Renamed
    transaction: Transaction,
    orgRef: DocumentReference,
    details: ClothingDetails,
    currentStock: AidDetails
) => {
    // Assuming donation INCREASES available stock:
    const currentMale = parseOrDefaultInt(currentStock.clothing?.male ?? "0");
    const currentFemale = parseOrDefaultInt(currentStock.clothing?.female ?? "0");
    const currentChildren = parseOrDefaultInt(currentStock.clothing?.children ?? "0");

    const donatedMale = parseOrDefaultInt(details.male ?? "0");
    const donatedFemale = parseOrDefaultInt(details.female ?? "0");
    const donatedChildren = parseOrDefaultInt(details.children ?? "0");

    const updatedMale = currentMale - donatedMale; // ADDING
    const updatedFemale = currentFemale - donatedFemale; // ADDING
    const updatedChildren = currentChildren - donatedChildren; // ADDING

    transaction.update(orgRef, {
        "aidStock.clothing.male": updatedMale,
        "aidStock.clothing.female": updatedFemale,
        "aidStock.clothing.children": updatedChildren,
    });
};

const updateOrgSRStock = ( // Renamed
    transaction: Transaction,
    orgRef: DocumentReference,
    details: SearchAndRescueDetails,
    currentStock: AidDetails
) => {
    // Assuming donation INCREASES available stock:
    const currentKits = parseOrDefaultInt(currentStock.searchAndRescue?.rescueKits ?? "0");
    const currentPersonnel = parseOrDefaultInt(currentStock.searchAndRescue?.rescuePersonnel ?? "0");

    const donatedKits = parseOrDefaultInt(details.rescueKits ?? "0");
    const donatedPersonnel = parseOrDefaultInt(details.rescuePersonnel ?? "0");

    const updatedKits = currentKits - donatedKits; // ADDING
    const updatedPersonnel = currentPersonnel - donatedPersonnel; // ADDING (if personnel means available volunteers)

    transaction.update(orgRef, {
        "aidStock.searchAndRescue.rescueKits": updatedKits,
        "aidStock.searchAndRescue.rescuePersonnel": updatedPersonnel,
    });
};

const updateOrgCounselStock = ( // Renamed
    transaction: Transaction,
    orgRef: DocumentReference,
    details: CounselingDetails,
    currentStock: AidDetails
) => {
    // Assuming donation INCREASES available stock:
    const currentCounselors = parseOrDefaultInt(currentStock.counseling?.counselors ?? "0");
    const currentHours = parseOrDefaultInt(currentStock.counseling?.hours ?? "0");

    const donatedCounselors = parseOrDefaultInt(details.counselors ?? "0");
    const donatedHours = parseOrDefaultInt(details.hours ?? "0");

    const updatedCounselors = currentCounselors - donatedCounselors; // ADDING
    const updatedHours = currentHours - donatedHours; // ADDING

    transaction.update(orgRef, {
        "aidStock.counseling.counselors": updatedCounselors,
        "aidStock.counseling.hours": updatedHours,
    });
};

const updateOrgMedStock = ( // Renamed
    transaction: Transaction,
    orgRef: DocumentReference,
    details: MedicalSuppliesDetails,
    currentStock: AidDetails
) => {
     // Assuming donation INCREASES available stock:
    const currentKits = parseOrDefaultInt(currentStock.medicalSupplies?.kits ?? "0");
    const donatedKits = parseOrDefaultInt(details.kits ?? "0");
    const updatedKits = currentKits + donatedKits; // ADDING

    transaction.update(orgRef, {
        "aidStock.medicalSupplies.kits": updatedKits,
        // Decide how to handle kitType - overwrite or perhaps store an array?
        // Overwriting for simplicity based on old code:
        "aidStock.medicalSupplies.kitType": details.kitType,
    });
};

const updateOrgShelterStock = ( // Renamed
    transaction: Transaction,
    orgRef: DocumentReference,
    details: ShelterDetails,
    currentStock: AidDetails
) => {
    // Assuming donation INCREASES available stock:
    const currentTents = parseOrDefaultInt(currentStock.shelter?.tents ?? "0");
    const currentBlankets = parseOrDefaultInt(currentStock.shelter?.blankets ?? "0");

    const donatedTents = parseOrDefaultInt(details.tents ?? "0");
    const donatedBlankets = parseOrDefaultInt(details.blankets ?? "0");

    const updatedTents = currentTents - donatedTents; // ADDING
    const updatedBlankets = currentBlankets - donatedBlankets; // ADDING

    transaction.update(orgRef, {
        "aidStock.shelter.tents": updatedTents,
        "aidStock.shelter.blankets": updatedBlankets,
    });
};

const updateOrgTechSuppStock = ( // Renamed
    transaction: Transaction,
    orgRef: DocumentReference,
    details: TechnicalSupportDetails,
    currentStock: AidDetails
) => {
    // Assuming donation INCREASES available stock:
    const currentVehicles = parseOrDefaultInt(currentStock.technicalSupport?.vehicles ?? "0");
    const currentCommunication = parseOrDefaultInt(currentStock.technicalSupport?.communication ?? "0");

    const donatedVehicles = parseOrDefaultInt(details.vehicles ?? "0");
    const donatedCommunication = parseOrDefaultInt(details.communication ?? "0");

    transaction.update(orgRef, {
        "aidStock.technicalSupport.vehicles": currentVehicles - donatedVehicles, // ADDING
        "aidStock.technicalSupport.communication": currentCommunication - donatedCommunication, // ADDING
    });
};

const updateOrgFinancialStock = ( // Renamed
    transaction: Transaction,
    orgRef: DocumentReference,
    details: FinancialAssistanceDetails,
    currentStock: AidDetails
) => {
    // Assuming donation INCREASES available funds:
    const currentFunds = parseOrDefaultFloat(currentStock.financialAssistance?.totalFunds ?? "0"); // Ensure path is correct
    const donatedFunds = parseOrDefaultFloat(details.totalFunds ?? "0");

    const updatedFunds = currentFunds + donatedFunds; // ADDING

    transaction.update(orgRef, {
        // Ensure the path matches your Firestore structure exactly
        "aidStock.financialAssistance.totalFunds": updatedFunds,
    });
};


// --- Utility Parsing Functions (Unchanged) ---
const parseOrDefaultInt = (
    value: string | undefined | number, // Allow number type as well
    fallback: number | string = 0
): number => {
    if (typeof value === 'number') return value; // Return if already a number
    const parsed = parseInt(value ?? "");
    const fallbackValue =
        typeof fallback === "string" ? parseInt(fallback) : fallback;
    return isNaN(parsed) ? (isNaN(fallbackValue) ? 0 : fallbackValue) : parsed; // Ensure fallback is valid
};

const parseOrDefaultFloat = (
    value: string | undefined | number, // Allow number type as well
    fallback: number | string = 0
): number => {
     if (typeof value === 'number') return value; // Return if already a number
    const parsed = parseFloat(value ?? "");
    const fallbackValue =
        typeof fallback === "string" ? parseFloat(fallback) : fallback; // Use parseFloat for fallback too
    return isNaN(parsed) ? (isNaN(fallbackValue) ? 0.0 : fallbackValue) : parsed; // Ensure fallback is valid
};