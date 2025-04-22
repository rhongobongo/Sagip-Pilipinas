import { GeoPoint } from "firebase-admin/firestore";

type CoordinatesInput =
    | GeoPoint
    | { latitude: number | string; longitude: number | string };

type AddressComponent = {
    long_name: string;
    short_name: string;
    types: string[];
};

type LocationDetails = {
    city: string | null;
    region: string | null;
    province: string | null;
};

const coordinatesToDetails = async (
    input: CoordinatesInput
): Promise<LocationDetails> => {
    const lat =
        input instanceof GeoPoint ? input.latitude : Number(input.latitude);
    const lng =
        input instanceof GeoPoint ? input.longitude : Number(input.longitude);

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

    try {
        const response = await fetch(geocodeUrl);

        if (!response.ok) {
            throw new Error("Failed to fetch geocoding data");
        }

        const data = await response.json();
        const result = data.results[0];

        const components: AddressComponent[] = result?.address_components ?? [];

        const locationDetails: LocationDetails = {
            city:
                components.find((c) => c.types.includes("locality"))
                    ?.long_name ?? null,
            region:
                components.find((c) =>
                    c.types.includes("administrative_area_level_1")
                )?.long_name ?? null,
            province:
                components.find((c) =>
                    c.types.includes("administrative_area_level_2")
                )?.long_name ?? null,
        };

        return locationDetails;
    } catch (error) {
        console.error("Geocoding error:", error);
        throw new Error("Failed to retrieve location details");
    }
};

export default coordinatesToDetails;
