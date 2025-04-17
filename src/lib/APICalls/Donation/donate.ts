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
import { Transaction, DocumentReference } from "firebase-admin/firestore";
import { AidDetails } from "@/components/(page)/AuthPage/OrgRegForm/types";

export const donate = async (
    types: CheckedDonationTypes,
    details: DonationDetails,
    donationDate: string,
    id: string
) => {
    console.log("Details:", details);

    try {
        await db.runTransaction(async (transaction: Transaction) => {
            const orgRef = db.collection("organizations").doc(id);
            const orgSnap = await transaction.get(orgRef);
            if (!orgSnap.exists) throw new Error("Org does not exist");

            const orgData = orgSnap.data();
            const currentStock: AidDetails = orgData?.aidStock ?? {};

            const donationRef = db.collection("donations").doc();

            console.log("Current Stock:", currentStock);

            transaction.set(donationRef, {
                orgId: orgRef,
                createdAt: new Date(),
                donationDate: donationDate,
            });

            for (const type in types) {
                if (types[type as keyof CheckedDonationTypes]) {
                    switch (type) {
                        case "food":
                            if (details.food)
                                donateFood(
                                    transaction,
                                    orgRef,
                                    donationRef,
                                    details.food,
                                    currentStock
                                );
                            break;
                        case "clothing":
                            if (details.clothing)
                                donateClothing(
                                    transaction,
                                    orgRef,
                                    donationRef,
                                    details.clothing,
                                    currentStock
                                );
                            break;
                        case "medicalSupplies":
                            if (details.medicalSupplies)
                                donateMed(
                                    transaction,
                                    orgRef,
                                    donationRef,
                                    details.medicalSupplies,
                                    currentStock
                                );
                            break;
                        case "shelter":
                            if (details.shelter)
                                donateShelter(
                                    transaction,
                                    orgRef,
                                    donationRef,
                                    details.shelter,
                                    currentStock
                                );
                            break;
                        case "searchAndRescue":
                            if (details.searchAndRescue)
                                donateSR(
                                    transaction,
                                    orgRef,
                                    donationRef,
                                    details.searchAndRescue,
                                    currentStock
                                );
                            break;
                        case "financialAssistance":
                            if (details.financialAssistance)
                                donateFinancial(
                                    transaction,
                                    orgRef,
                                    donationRef,
                                    details.financialAssistance,
                                    currentStock
                                );
                            break;
                        case "counseling":
                            if (details.counseling)
                                donateCounsel(
                                    transaction,
                                    orgRef,
                                    donationRef,
                                    details.counseling,
                                    currentStock
                                );
                            break;
                        case "technicalSupport":
                            if (details.technicalSupport)
                                donateTechSupp(
                                    transaction,
                                    orgRef,
                                    donationRef,
                                    details.technicalSupport,
                                    currentStock
                                );
                            break;
                    }
                }
            }
        });

        console.log("Transaction completed successfully.");
    } catch (error) {
        console.error("Transaction failed:", error);
    }
};

const donateFood = (
    transaction: Transaction,
    orgRef: DocumentReference,
    donationRef: DocumentReference,
    details: FoodDetails,
    currentStock: AidDetails
) => {
    const currentPacks = parseOrDefaultInt(currentStock.food?.foodPacks ?? "0");
    const donatedPacks = parseOrDefaultInt(details.foodPacks ?? "0");
    const updatedPacks = Math.max(0, currentPacks - donatedPacks);

    transaction.update(orgRef, {
        "aidStock.food.foodPacks": updatedPacks,
    });

    transaction.set(
        donationRef,
        {
            donations: {
                food: details,
            },
        },
        { merge: true }
    );
};

const donateClothing = (
    transaction: Transaction,
    orgRef: DocumentReference,
    donationRef: DocumentReference,
    details: ClothingDetails,
    currentStock: AidDetails
) => {
    const currentMale = parseOrDefaultInt(currentStock.clothing?.male ?? "0");
    const currentFemale = parseOrDefaultInt(
        currentStock.clothing?.female ?? "0"
    );
    const currentChildren = parseOrDefaultInt(
        currentStock.clothing?.children ?? "0"
    );

    const donatedMale = parseOrDefaultInt(details.male ?? "0");
    const donatedFemale = parseOrDefaultInt(details.female ?? "0");
    const donatedChildren = parseOrDefaultInt(details.children ?? "0");

    console.log(donatedFemale);

    const updatedMale = Math.max(0, currentMale - donatedMale);
    const updatedFemale = Math.max(0, currentFemale - donatedFemale);
    const updatedChildren = Math.max(0, currentChildren - donatedChildren);

    transaction.update(orgRef, {
        "aidStock.clothing.male": updatedMale,
        "aidStock.clothing.female": updatedFemale,
        "aidStock.clothing.children": updatedChildren,
    });

    transaction.set(
        donationRef,
        {
            donations: {
                clothing: details,
            },
        },
        { merge: true }
    );
};

const donateSR = (
    transaction: Transaction,
    orgRef: DocumentReference,
    donationRef: DocumentReference,
    details: SearchAndRescueDetails,
    currentStock: AidDetails
) => {
    const currentKits = parseOrDefaultInt(
        currentStock.searchAndRescue?.rescueKits ?? "0"
    );
    const currentPersonnel = parseOrDefaultInt(
        currentStock.searchAndRescue?.rescuePersonnel ?? "0"
    );

    const donatedKits = parseOrDefaultInt(details.rescueKits ?? "0");
    const donatedPersonnel = parseOrDefaultInt(details.rescuePersonnel ?? "0");

    const updatedKits = Math.max(0, currentKits - donatedKits);
    const updatedPersonnel = Math.max(0, currentPersonnel - donatedPersonnel);

    transaction.update(orgRef, {
        "aidStock.searchAndRescue.rescueKits": updatedKits,
        "aidStock.searchAndRescue.rescuePersonnel": updatedPersonnel,
    });

    transaction.set(
        donationRef,
        {
            donations: {
                searchAndRescue: details,
            },
        },
        { merge: true }
    );
};

const donateCounsel = (
    transaction: Transaction,
    orgRef: DocumentReference,
    donationRef: DocumentReference,
    details: CounselingDetails,
    currentStock: AidDetails
) => {
    const currentCounselors = parseOrDefaultInt(
        currentStock.counseling?.counselors ?? "0"
    );
    const currentHours = parseOrDefaultInt(
        currentStock.counseling?.hours ?? "0"
    );

    const donatedCounselors = parseOrDefaultInt(details.counselors ?? "0");
    const donatedHours = parseOrDefaultInt(details.hours ?? "0");

    const updatedCounselors = Math.max(
        0,
        currentCounselors - donatedCounselors
    );
    const updatedHours = Math.max(0, currentHours - donatedHours);

    transaction.update(orgRef, {
        "aidStock.counseling.counselors": updatedCounselors,
        "aidStock.counseling.hours": updatedHours,
    });

    transaction.set(
        donationRef,
        {
            donations: {
                counseling: details,
            },
        },
        { merge: true }
    );
};

const donateMed = (
    transaction: Transaction,
    orgRef: DocumentReference,
    donationRef: DocumentReference,
    details: MedicalSuppliesDetails,
    currentStock: AidDetails
) => {
    const currentKits = parseOrDefaultInt(
        currentStock.medicalSupplies?.kits ?? "0"
    );
    const donatedKits = parseOrDefaultInt(details.kits ?? "0");
    const updatedKits = Math.max(0, currentKits - donatedKits);

    transaction.update(orgRef, {
        "aidStock.medicalSupplies.kits": updatedKits,
        "aidStock.medicalSupplies.kitType": details.kitType,
    });

    transaction.set(
        donationRef,
        {
            donations: {
                medicalSupplies: details,
            },
        },
        { merge: true }
    );
};

const donateShelter = (
    transaction: Transaction,
    orgRef: DocumentReference,
    donationRef: DocumentReference,
    details: ShelterDetails,
    currentStock: AidDetails
) => {
    const currentTents = parseOrDefaultInt(currentStock.shelter?.tents ?? "0");
    const currentBlankets = parseOrDefaultInt(
        currentStock.shelter?.blankets ?? "0"
    );

    const donatedTents = parseOrDefaultInt(details.tents ?? "0");
    const donatedBlankets = parseOrDefaultInt(details.blankets ?? "0");

    const updatedTents = Math.max(0, currentTents - donatedTents);
    const updatedBlankets = Math.max(0, currentBlankets - donatedBlankets);

    transaction.update(orgRef, {
        "aidStock.shelter.tents": updatedTents,
        "aidStock.shelter.blankets": updatedBlankets,
    });

    transaction.set(
        donationRef,
        {
            donations: {
                shelter: details,
            },
        },
        { merge: true }
    );
};

const donateTechSupp = (
    transaction: Transaction,
    orgRef: DocumentReference,
    donationRef: DocumentReference,
    details: TechnicalSupportDetails,
    currentStock: AidDetails
) => {
    const currentVehicles = parseOrDefaultInt(
        currentStock.technicalSupport?.vehicles ?? "0"
    );
    const currentCommunication = parseOrDefaultInt(
        currentStock.technicalSupport?.communication ?? "0"
    );

    const donatedVehicles = parseOrDefaultInt(details.vehicles ?? "0");
    const donatedCommunication = parseOrDefaultInt(
        details.communication ?? "0"
    );

    transaction.update(orgRef, {
        "aidStock.technicalSupport.vehicles": Math.max(
            0,
            currentVehicles - donatedVehicles
        ),
        "aidStock.technicalSupport.communication": Math.max(
            0,
            currentCommunication - donatedCommunication
        ),
    });

    transaction.set(
        donationRef,
        {
            donations: {
                technicalSupport: details,
            },
        },
        { merge: true }
    );
};

const donateFinancial = (
    transaction: Transaction,
    orgRef: DocumentReference,
    donationRef: DocumentReference,
    details: FinancialAssistanceDetails,
    currentStock: AidDetails
) => {
    const currentFunds = parseOrDefaultFloat(
        currentStock.financialAssistance.totalFunds
    );
    const donatedFunds = parseOrDefaultFloat(details.totalFunds ?? "0");

    const updatedFunds = currentFunds - donatedFunds;

    transaction.update(orgRef, {
        "aidStock.financialAssistance.totalFunds": updatedFunds,
    });

    transaction.set(
        donationRef,
        {
            donations: {
                financialAssistance: donatedFunds,
            },
        },
        { merge: true }
    );
};

const parseOrDefaultInt = (
    value: string | undefined,
    fallback: number | string = 0
): number => {
    const parsed = parseInt(value ?? "");
    const fallbackValue =
        typeof fallback === "string" ? parseInt(fallback) : fallback;
    return isNaN(parsed) ? fallbackValue : parsed;
};

const parseOrDefaultFloat = (
    value: string | undefined,
    fallback: number | string = 0
): number => {
    const parsed = parseFloat(value ?? "");
    const fallbackValue =
        typeof fallback === "string" ? parseInt(fallback) : fallback;
    return isNaN(parsed) ? fallbackValue : parsed;
};
