import DisasterMapWrapper from "@/components/map/DisasterMapWrapper";
import { db } from "@/lib/Firebase-Admin";
import { MainPin } from "@/types/types";
import { GeoPoint } from "firebase-admin/firestore";

const fetchPins = async (): Promise<MainPin[]> => {
    const snapshot = await db.collection("map").get();
    return snapshot.docs.map((doc) => {
        const { latitude, longitude } = (doc.get("location") as GeoPoint);
        return {
            id: doc.id,
            coordinates: { latitude, longitude },
        };
    });
};

const MapContainer : React.FC = async () => {
    const pins = await fetchPins();

    return (
        <div>
            <DisasterMapWrapper pinData={ pins }/>
        </div>
    );
};

export default MapContainer;
