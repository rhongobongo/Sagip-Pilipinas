import { db } from "@/lib/Firebase-Admin";
import { FieldValue } from "firebase-admin/firestore";
const updateOrganizationsWithVolunteerIds = async () => {
    try {
        const volunteersSnapshot = await db.collection("volunteers").get();

        const updatePromises: Promise<void>[] = [];

        volunteersSnapshot.forEach((volunteerDoc) => {
            const volunteerData = volunteerDoc.data();
            const organizationId = volunteerData.organizationId;
            const volunteerId = volunteerDoc.id;

            if (organizationId) {
                const organizationRef = db
                    .collection("organizations")
                    .doc(organizationId);

                updatePromises.push(
                    organizationRef.get().then(async (organizationDoc) => {
                        if (organizationDoc.exists) {
                            const organizationData = organizationDoc.data();

                            const currentVolunteers =
                                organizationData?.volunteerIds ?? [];

                            if (!currentVolunteers.includes(volunteerId)) {
                                await organizationRef.update({
                                    volunteerIds:
                                        FieldValue.arrayUnion(volunteerId),
                                });
                                console.log(
                                    `Volunteer ${volunteerId} added to organization ${organizationId}.`
                                );
                            } else {
                                console.log(
                                    `Volunteer ${volunteerId} is already in organization ${organizationId}.`
                                );
                            }
                        } else {
                            console.warn(
                                `Organization ${organizationId} not found for volunteer ${volunteerId}.`
                            );
                        }
                    })
                );
            } else {
                console.warn(`Volunteer ${volunteerId} has no organizationId.`);
            }
        });

        await Promise.all(updatePromises);

        console.log("Successfully updated organizations with volunteer IDs.");
    } catch (error) {
        console.error("Error updating organizations:", error);
        throw error;
    }
};

export default updateOrganizationsWithVolunteerIds;
