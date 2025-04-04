import { db } from "@/lib/Firebase-Admin";
import { GeoPoint } from "firebase-admin/firestore";
import { MainPin } from "@/types/types";
import { OrganizationPin } from "@/types/PinTypes";
import MapSectionInteractive from "./MapSectionInteractive";

const MapSection: React.FC = async () => {

    const pins = await fetchPins();
    return (
        <div className="h-[105vh] w-full bg-[#F3F3F3] flex items-center justify-center">
            <div className="mx-auto bg-[#8F0022] w-[1400px] rounded-xl py-2 mt-5 mb-5">
                <div className="font-semibold text-center text-3xl text-black tracking-wide rounded-full
                    bg-[#F3F3F3] border-4 border-black p-3 max-w-4xl mx-auto flex items-center mb-3 mt-3">
                    <img src="/home-image/pin.png" className="w-10 h-10 ml-9 mr-3"/>
                    KNOW YOUR NEAREST DISTRIBUTION CENTER!
                </div>
                <MapSectionInteractive locations={locations}></MapSectionInteractive>
            </div>
            
        </div>
    )
}

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
];

export default MapSection;