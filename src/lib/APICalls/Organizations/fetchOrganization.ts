"use server";

import { db } from "@/lib/Firebase-Admin";


interface Organization {
    name: string;
    email: string;
    contactNumber: string;
    type: string;
    description: string;
    profileImageUrl: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export async function fetchOrganizations(): Promise<Organization[]> {
    try {
        const organizationsSnapshot = await db.collection("organizations").get();

        const organizations: Organization[] = organizationsSnapshot.docs.map(
            (doc) => ({
                ...(doc.data() as Omit<Organization, "userId">),
                userId: doc.id,
            })
        );

        return organizations;
    } catch (error) {
        console.error("Error fetching organizations:", error);
        throw new Error("Failed to fetch organizations");
    }
}
