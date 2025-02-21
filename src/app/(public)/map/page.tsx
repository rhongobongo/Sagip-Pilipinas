import DisasterMapWrapper from "@/components/map/DisasterMapWrapper";
import PinList from "@/components/map/Pins/PinList";
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

const DisasterMapPage : React.FC = async () => {
    const pins = await fetchPins();

    return (
        <div>
            <h1>Disaster Map Page</h1>
            <DisasterMapWrapper pinData={ pins }/>
            <PinList pinData={ pins }></PinList>
        </div>
    );
};

export default DisasterMapPage;
