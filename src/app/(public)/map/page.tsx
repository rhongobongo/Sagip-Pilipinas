import AidRequestMapPage from "@/components/(page)/MapPage/AidRequestMapPage";
import { db } from "@/lib/Firebase-Admin";
import { RequestPin } from "@/types/types";
import { GeoPoint, Timestamp } from "firebase-admin/firestore";

const fetchAidRequests = async (): Promise<RequestPin[]> => {
    const snapshot = await db.collection("aidRequest").get();
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        const { latitude, longitude } = (data.coordinates as GeoPoint);
        
        return {
            id: doc.id,
            name: data.name || "",
            contactNum: data.contactNumber || "",
            calamityLevel: data.calamityLevel || "",
            calamityType: data.calamityType || "",
            shortDesc: data.shortDesc || "",
            imageURL: data.imageUrl,
            coordinates: { 
                latitude, 
                longitude 
            },
            submissionDate: data.submissionDate || 
                (data.timestamp ? (data.timestamp as Timestamp).toDate().toISOString().split('T')[0] : ""),
            submissionTime: data.submissionTime || "",
        };
    });
};

const DisasterMapPage = async () => {
    const aidRequests = await fetchAidRequests();

    return <AidRequestMapPage initialPins={aidRequests} />;
};

export default DisasterMapPage;


/*
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
*/