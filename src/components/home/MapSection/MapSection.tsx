import DistributionMapHomeWrapper from "@/components/map/DistributionMapHomeWrapper";
import { db } from "@/lib/Firebase-Admin";
import { GeoPoint } from "firebase-admin/firestore";
import { MainPin } from "@/types/types";
import LocationList from "./LocationList";
import { OrganizationPin } from "@/types/PinTypes";

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

const locations: OrganizationPin[] = [
    {
        id: "1",
        coordinates: { latitude: 14.5995, longitude: 120.9842 },
        region: "LUZON",
        name: "Manila",
        location: "Ermita, Manila"
    },
    {
        id: "2",
        coordinates: { latitude: 10.3157, longitude: 123.8854 },
        region: "VISAYAS",
        name: "Cebu City",
        location: "Osmeña Blvd, Cebu City"
    },
    {
        id: "3",
        coordinates: { latitude: 7.1907, longitude: 125.4553 },
        region: "MINDANAO",
        name: "Davao City",
        location: "San Pedro Street, Davao City"
    },
    {
        id: "4",
        coordinates: { latitude: 16.4023, longitude: 120.5960 },
        region: "LUZON",
        name: "Baguio City",
        location: "Session Road, Baguio City"
    },
    {
        id: "5",
        coordinates: { latitude: 13.4125, longitude: 123.4138 },
        region: "LUZON",
        name: "Legazpi City",
        location: "Peñaranda Street, Legazpi City"
    },
    {
        id: "6",
        coordinates: { latitude: 8.4772, longitude: 124.6459 },
        region: "MINDANAO",
        name: "Cagayan de Oro",
        location: "CM Recto Avenue, Cagayan de Oro"
    },
    {
        id: "7",
        coordinates: { latitude: 9.3068, longitude: 123.3054 },
        region: "VISAYAS",
        name: "Dumaguete City",
        location: "Real Street, Dumaguete City"
    },
    {
        id: "8",
        coordinates: { latitude: 6.9214, longitude: 122.0790 },
        region: "MINDANAO",
        name: "Zamboanga City",
        location: "Pilar Street, Zamboanga City"
    },
    {
        id: "9",
        coordinates: { latitude: 17.5700, longitude: 120.3883 },
        region: "LUZON",
        name: "Vigan City",
        location: "Calle Crisologo, Vigan City"
    },
    {
        id: "10",
        coordinates: { latitude: 11.2446, longitude: 125.0034 },
        region: "VISAYAS",
        name: "Tacloban City",
        location: "Justice Romualdez Street, Tacloban City"
    },
    {
        id: "11",
        coordinates: { latitude: 15.1621, longitude: 120.5675 },
        region: "LUZON",
        name: "Angeles City",
        location: "MacArthur Highway, Angeles City"
    },
    {
        id: "12",
        coordinates: { latitude: 12.8797, longitude: 121.7740 },
        region: "LUZON",
        name: "Puerto Princesa",
        location: "Rizal Avenue, Puerto Princesa"
    },
    {
        id: "13",
        coordinates: { latitude: 14.6760, longitude: 121.0437 },
        region: "LUZON",
        name: "Quezon City",
        location: "Commonwealth Avenue, Quezon City"
    },
    {
        id: "14",
        coordinates: { latitude: 18.1960, longitude: 120.5931 },
        region: "LUZON",
        name: "Laoag City",
        location: "Rizal Street, Laoag City"
    },
    {
        id: "15",
        coordinates: { latitude: 13.8307, longitude: 121.5463 },
        region: "LUZON",
        name: "Batangas City",
        location: "P. Burgos Street, Batangas City"
    },
    {
        id: "16",
        coordinates: { latitude: 13.8407, longitude: 121.5463 },
        region: "LUZON",
        name: "Batangas City",
        location: "P. Burgos Street, Batangas City"
    },
    {
        id: "17",
        coordinates: { latitude: 13.8357, longitude: 121.5463 },
        region: "LUZON",
        name: "Batangas City",
        location: "P. Burgos Street, Batangas City"
    }
];

const MapSection: React.FC = async () => {

    const pins = await fetchPins();
    return (
        <div className="h-screen w-full bg-[#D9D9D9]">
            <div className="pt-8 font-semibold text-center text-4xl text-black">KNOW YOUR NEAREST DISTRIBUTION CENTER</div>
            <div className="grid grid-cols-2 gap-8 p-8 h-[80vh]">
                <div className="mx-20 rounded-2xl flex-grow">
                    <DistributionMapHomeWrapper pinData={locations} />
                </div>
                <div className="h-full">
                    <LocationList pinData={locations} />
                </div>
            </div>  
        </div>
    )
}

export default MapSection;