import MapContainerInteractive from "@/components/(page)/MapPage/MapContainer";
import { db } from "@/lib/Firebase-Admin";
import { MainPin } from "@/types/types";
import { GeoPoint } from "firebase-admin/firestore";

const fetchPins = async (): Promise<MainPin[]> => {
    const snapshot = await db.collection("map").get();
    return snapshot.docs.map((doc) => {
        const { latitude, longitude } = (doc.get("coordinates") as GeoPoint);
        return {
            id: doc.id,
            coordinates: { latitude, longitude },
        };
    });
};

const DisasterMapPage : React.FC = async () => {
    const pins = await fetchPins();

    return (
        <MapContainerInteractive pins={pins}></MapContainerInteractive>
    );
};

export default DisasterMapPage;
