import { db } from "@/lib/Firebase-Admin";
import coordinatesToDetails from "../Map/coordinatesToDetails";
import { GeoPoint } from "firebase-admin/firestore";

const forceUpdateAidRequest = async () => {
    try {
        const aidRequestsSnapshot = await db.collection("aidRequest").get();

        const updatePromises: Promise<FirebaseFirestore.WriteResult>[] = [];

        aidRequestsSnapshot.forEach((doc) => {
            const data = doc.data();
            const coordinates = data.coordinates as GeoPoint | undefined;

            if (coordinates) {
                const coords = {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                };

                const detailsPromise = coordinatesToDetails(coords);

                updatePromises.push(
                    detailsPromise.then((locationDetails) =>
                        doc.ref.update({ locationDetails })
                    )
                );
            } else {
                console.warn(
                    `Document ${doc.id} has no coordinates to update.`
                );
            }
        });

        await Promise.all(updatePromises);
        console.log(
            "Successfully updated locationDetails for all aid requests."
        );
    } catch (error) {
        console.error("Error updating aid requests:", error);
    }
};

export default forceUpdateAidRequest;
