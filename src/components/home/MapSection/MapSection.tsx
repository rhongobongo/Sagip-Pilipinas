import { db } from "@/lib/Firebase-Admin";
import { DefaultPin } from "@/types/types";
import MapSectionInteractive from "./MapSectionInteractive";
import { GeoPoint } from "firebase-admin/firestore";

export interface OrgPin extends DefaultPin {
    name: string;
    region: string;
    local: string;
    location: string;
}

const MapSection: React.FC = async () => {
    const pins = await fetchPins();
    return (
        <div className="h-[105vh] w-full bg-[#F3F3F3] flex items-center justify-center">
            <div className="mx-auto bg-[#8F0022] w-[1400px] rounded-xl py-2 mt-5 mb-5">
                <div
                    className="font-semibold text-center text-3xl text-black tracking-wide rounded-full
                    bg-[#F3F3F3] border-4 border-black p-3 max-w-4xl mx-auto flex items-center mb-3 mt-3"
                >
                    <img
                        src="/home-image/pin.png"
                        className="w-10 h-10 ml-9 mr-3"
                        alt="pin"
                    />
                    <div>KNOW YOUR NEAREST DISTRIBUTION CENTER!</div>
                </div>
                <MapSectionInteractive locations={pins}></MapSectionInteractive>
            </div>
        </div>
    );
};

const REGION_TO_ISLAND_GROUP: Record<string, "LUZON" | "VISAYAS" | "MINDANAO"> =
    {
        "Ilocos Region": "LUZON",
        "Cagayan Valley": "LUZON",
        "Central Luzon": "LUZON",
        "CALABARZON": "LUZON",
        "MIMAROPA": "LUZON",
        "Cordillera Administrative Region": "LUZON",
        "National Capital Region": "LUZON",
        "Western Visayas": "VISAYAS",
        "Central Visayas": "VISAYAS",
        "Eastern Visayas": "VISAYAS",       
        "Zamboanga Peninsula": "MINDANAO",
        "Northern Mindanao": "MINDANAO",
        "Davao Region": "MINDANAO",
        "SOCCSKSARGEN": "MINDANAO",
        "Caraga": "MINDANAO",
        "Bangsamoro Autonomous Region in Muslim Mindanao": "MINDANAO",
    };

const fetchPins = async (): Promise<OrgPin[]> => {
    const snapshot = await db
        .collection("organizations")
        .select(
            "name",
            "location",
            "coordinates",
            "locationDetails.city",
            "locationDetails.region"
        )
        .get();

    const pins: OrgPin[] = snapshot.docs.map((doc) => {
        const data = doc.data();

        const rawRegion = data.locationDetails?.region ?? "";
        const mappedRegion = REGION_TO_ISLAND_GROUP[rawRegion];

        return {
            id: doc.id,
            name: data.name,
            region: mappedRegion,
            local: data.locationDetails?.city ?? "",
            location: data.location,
            coordinates: {
                latitude: (data.coordinates as GeoPoint).latitude,
                longitude: (data.coordinates as GeoPoint).longitude,
            },
        };
    });

    return pins;
};

export default MapSection;
