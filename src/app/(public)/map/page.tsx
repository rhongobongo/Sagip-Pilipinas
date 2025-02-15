import DisasterMap from "@/components/map/DisasterMap";
import { db } from "@/lib/Firebase-Admin";
import { Pin } from "@/types/types";
import { GeoPoint } from "firebase-admin/firestore";

const fetchPins = async (): Promise<Pin[]> => {
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
            <DisasterMap pinData={ pins }/>
            {pins && pins.length > 0 ? (
                <ul>
                    {pins.map((pin) => (
                        <li key={pin.id}>
                            Latitude: {pin.coordinates.latitude}, Longitude:{" "}
                            {pin.coordinates.longitude}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No pins available.</p>
            )}
        </div>
    );
};

export default DisasterMapPage;
