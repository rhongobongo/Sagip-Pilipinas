"use server";

import { db, storage, auth } from "@/lib/Firebase-Admin";
import { GeoPoint } from "firebase-admin/firestore";
import { updateProfileImage } from "../User/updateProfileImage";
import coordinatesToDetails from "../Map/coordinatesToDetails";

interface SponsorData {
    name: string;
    other: string;
    imageUrl?: string;
}

type AidStockDetails = {
    [aidId: string]: {
        available: boolean;
        [key: string]: string | number | boolean | undefined;
    };
};

interface Organization {
    name: string;
    email: string;
    contactNumber: string;
    location: string;
    coordinates?: GeoPoint;
    dateOfEstablishment: string;
    type: string;
    otherTypeText?: string;
    description: string;
    profileImageUrl: string;
    contactPerson: string;
    orgPosition: string;
    socialMedia?: {
        twitter?: { username?: string; link?: string };
        facebook?: { username?: string; link?: string };
        instagram?: { username?: string; link?: string };
    };
    sponsors: SponsorData[];
    aidStock: AidStockDetails;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

const getString = (formData: FormData, key: string): string => {
    const value = formData.get(key);
    if (value === null || value === undefined) return "";
    if (value instanceof File) return value.name;
    return String(value);
};

const getFile = (formData: FormData, key: string): File | null => {
    const file = formData.get(key);
    if (file instanceof File && file.size > 0) return file;
    return null;
};

const validateFormData = (
    formData: FormData
): { success: boolean; message: string } => {
    const email = getString(formData, "email");
    const password = getString(formData, "password");
    const name = getString(formData, "name");
    const latitudeStr = getString(formData, "latitude");
    const longitudeStr = getString(formData, "longitude");

    if (!email || !password || !name) {
        return {
            success: false,
            message: "Email, password, and organization name are required.",
        };
    }

    const latitude = parseFloat(latitudeStr);
    const longitude = parseFloat(longitudeStr);

    if (isNaN(latitude) || isNaN(longitude)) {
        if (latitudeStr || longitudeStr) {
            return {
                success: false,
                message: "Invalid location coordinates provided.",
            };
        }
        return {
            success: false,
            message: "Location coordinates are required.",
        };
    }

    return { success: true, message: "Validation successful" };
};

const createAuthUser = async (
    email: string,
    password: string,
    name: string
): Promise<string> => {
    const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
    });
    return userRecord.uid;
};

const processProfileImage = async (
    formData: FormData,
    userId: string
): Promise<string> => {
    const profileImage = getFile(formData, "profileImage");
    return profileImage
        ? await updateProfileImage(profileImage, userId, "organizations")
        : "";
};

const processSponsors = async (
    formData: FormData,
    userId: string
): Promise<SponsorData[]> => {
    const sponsorsJson = getString(formData, "sponsors_json");
    if (!sponsorsJson) return [];

    try {
        const sponsorsBase = JSON.parse(sponsorsJson) as Omit<
            SponsorData,
            "imageUrl"
        >[];
        const sponsors = sponsorsBase.map((s) => ({
            ...s,
            imageUrl: undefined,
        }));
        await uploadSponsorImages(formData, userId, sponsors);
        return sponsors;
    } catch (e) {
        console.error("Failed to parse sponsors_json:", e);
        return [];
    }
};

const uploadSponsorImages = async (
    formData: FormData,
    userId: string,
    sponsors: SponsorData[]
): Promise<void> => {
    const sponsorImageUploadPromises: Promise<void>[] = [];
    sponsors.forEach((sponsor, index) => {
        const imageKey = `sponsor_photo_${sponsor.name.replace(/\s+/g, "_")}`;
        const sponsorImageFile = getFile(formData, imageKey);

        if (sponsorImageFile) {
            sponsorImageUploadPromises.push(
                uploadSingleSponsorImage(formData, userId, sponsor, index)
            );
        }
    });

    await Promise.allSettled(sponsorImageUploadPromises);
    console.log("Sponsor images processed.");
};

const uploadSingleSponsorImage = async (
    formData: FormData,
    userId: string,
    sponsor: SponsorData,
    index: number
): Promise<void> => {
    const imageKey = `sponsor_photo_${sponsor.name.replace(/\s+/g, "_")}`;
    const sponsorImageFile = getFile(formData, imageKey);
    if (!sponsorImageFile) return;

    const bucket = storage;
    const fileExtension = sponsorImageFile.name.includes(".")
        ? sponsorImageFile.name.substring(
              sponsorImageFile.name.lastIndexOf(".")
          )
        : "";
    const sanitizedSponsorName = sponsor.name.replace(/[^a-zA-Z0-9]/g, "_");
    const filePath = `organizations/${userId}/sponsors/${sanitizedSponsorName}_${Date.now()}${fileExtension}`;
    const file = bucket.file(filePath);

    try {
        await file.save(Buffer.from(await sponsorImageFile.arrayBuffer()), {
            metadata: { contentType: sponsorImageFile.type },
        });
        await file.makePublic();
        sponsor.imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        console.log(
            `Sponsor image for ${sponsor.name} uploaded to: ${sponsor.imageUrl}`
        );
    } catch (uploadError) {
        console.error(
            `Failed to upload image for sponsor ${sponsor.name}:`,
            uploadError
        );
    }
};

const processSocialMedia = (
    formData: FormData
): Organization["socialMedia"] | undefined => {
    const socialMedia: NonNullable<Organization["socialMedia"]> = {};
    const platforms = ["twitter", "facebook", "instagram"];
    let hasSocialMedia = false;
    platforms.forEach((platform) => {
        const username = getString(formData, `social_${platform}_username`);
        if (username) {
            hasSocialMedia = true;
            const platformData: { username: string; link?: string } = {
                username,
            };
            const link = getString(formData, `social_${platform}_link`);
            if (link) platformData.link = link;
            socialMedia[platform as keyof typeof socialMedia] = platformData;
        }
    });

    return hasSocialMedia ? socialMedia : undefined;
};

const processAidStock = (formData: FormData): AidStockDetails => {
    const aidStock: AidStockDetails = {};
    const allAidTypes = [
        "food",
        "clothing",
        "medicalSupplies",
        "shelter",
        "searchAndRescue",
        "financialAssistance",
        "counseling",
        "technicalSupport",
    ];

    allAidTypes.forEach((aidId) => {
        const isAvailable =
            getString(formData, `aid_${aidId}_available`) === "true";
        if (isAvailable) {
            aidStock[aidId] = { available: true };
            for (const [key] of formData.entries()) {
                if (
                    key.startsWith(`aid_${aidId}_`) &&
                    key !== `aid_${aidId}_available`
                ) {
                    const field = key.substring(`aid_${aidId}_`.length);
                    const stringValue = getString(formData, key);
                    const numValue = Number(stringValue);
                    const numericFields = [
                        "foodPacks",
                        "male",
                        "female",
                        "children",
                        "kits",
                        "tents",
                        "blankets",
                        "rescueKits",
                        "rescuePersonnel",
                        "totalFunds",
                        "counselors",
                        "hours",
                        "vehicles",
                        "communication",
                    ];

                    if (numericFields.includes(field) && !isNaN(numValue)) {
                        aidStock[aidId][field] = numValue;
                    } else if (stringValue) {
                        aidStock[aidId][field] = stringValue;
                    }
                }
            }
        }
    });
    console.log(
        "Aid Stock details processed:",
        JSON.stringify(aidStock, null, 2)
    );
    return aidStock;
};

const createOrganizationData = async (
    formData: FormData,
    userId: string,
    sponsors: SponsorData[],
    aidStock: AidStockDetails,
    profileImageUrl: string
): Promise<Partial<Organization>> => {
    const name = getString(formData, "name");
    const email = getString(formData, "email");
    const latitude = parseFloat(getString(formData, "latitude"));
    const longitude = parseFloat(getString(formData, "longitude"));

    const locationDetails = await coordinatesToDetails(
        new GeoPoint(latitude, longitude)
    );
    const orgType = getString(formData, "type");
    const organizationDataBase = {
        userId,
        name,
        email,
        contactNumber: getString(formData, "contactNumber"),
        location: getString(formData, "location"),
        locationDetails,
        coordinates: new GeoPoint(latitude, longitude),
        dateOfEstablishment: getString(formData, "dateOfEstablishment"),
        type: orgType,
        description: getString(formData, "description"),
        contactPerson: getString(formData, "contactPerson"),
        orgPosition: getString(formData, "orgPosition"),
        profileImageUrl: profileImageUrl || "",
        sponsors,
        aidStock,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const organizationData: Partial<Organization> = {
        ...organizationDataBase,
    };

    if (orgType === "other") {
        const otherTextValue = getString(formData, "otherTypeText");
        if (otherTextValue) {
            organizationData.otherTypeText = otherTextValue;
        }
    }
    return organizationData;
};

const saveOrganizationData = async (
    userId: string,
    organizationData: Partial<Organization>
): Promise<void> => {
    await db
        .collection("organizations")
        .doc(userId)
        .set(organizationData as Organization);
};

const cleanupAuthUser = async (userId: string): Promise<void> => {
    try {
        console.log(`Attempting to delete orphaned auth user: ${userId}`);
        await auth.deleteUser(userId);
        console.log(`Successfully deleted orphaned auth user: ${userId}`);
    } catch (deleteError) {
        console.error(
            `Failed to delete orphaned auth user ${userId}:`,
            deleteError
        );
    }
};

const handleRegistrationError = async (
    error: unknown,
    userId: string | null
): Promise<{ success: boolean; message: string }> => {
    let errorMessage;
    console.error("Error during organization registration:", error);

    if (userId) {
        await cleanupAuthUser(userId);
    }

    if (typeof error === "object" && error !== null && "code" in error) {
        const firebaseError = error as { code: string; message: string };
        errorMessage = firebaseError.message;

        const errorCode = firebaseError.code;
        if (
            errorCode === "auth/email-already-exists" ||
            errorCode === "auth/email-already-in-use"
        ) {
            errorMessage =
                "This email is already registered. Please use a different email or log in.";
        } else if (errorCode === "auth/invalid-email") {
            errorMessage = "The email address provided is not valid.";
        } else if (errorCode === "auth/weak-password") {
            errorMessage = "The password provided is too weak.";
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else {
        try {
            errorMessage = JSON.stringify(error);
        } catch {
            errorMessage = String(error);
        }
    }

    return { success: false, message: errorMessage };
};

export const registerOrganization = async (
    formData: FormData
): Promise<{ success: boolean; message: string }> => {
    let userId: string | null = null;

    try {
        const validationResult = validateFormData(formData);
        if (!validationResult.success) {
            return validationResult;
        }

        const email = getString(formData, "email");
        const password = getString(formData, "password");
        const name = getString(formData, "name");

        userId = await createAuthUser(email, password, name);
        const profileImageUrl = await processProfileImage(formData, userId);
        const sponsors = await processSponsors(formData, userId);
        const socialMedia = processSocialMedia(formData);
        const aidStock = processAidStock(formData);

        const organizationData = await createOrganizationData(
            formData,
            userId,
            sponsors,
            aidStock,
            profileImageUrl
        );

        if (socialMedia) {
            organizationData.socialMedia = socialMedia;
        }

        await saveOrganizationData(userId, organizationData);

        console.log(
            `Organization ${name} registered successfully with ID: ${userId}`
        );
        return { success: true, message: "Registration successful!" };
    } catch (error: unknown) {
        return handleRegistrationError(error, userId);
    }
};
