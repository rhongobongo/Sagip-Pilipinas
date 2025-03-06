"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapRef } from "./GoogleMapComponent";
import { RequestPin } from "@/types/types";

const DynamicMap = dynamic(() => import("./GoogleMapComponent"), { ssr: false });

const RequestAidMapWrapper
    : React.FC = () => {

        const [pin, setPin] = useState<RequestPin | null>(null);
        const mapRef = useRef<MapRef>(null);
        const mapSize = { width: "100%", height: "80vh" };

        const handleMapClick = (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
                const newPin: RequestPin = {
                    coordinates: {
                        latitude: event.latLng.lat(),
                        longitude: event.latLng.lng(),
                    },
                };
                setPin(newPin);
                mapRef.current?.addMarker?.(newPin);
            }
        };

        const handleSubmit = async () => {
            if (!pin) {
                console.error("No pin selected to submit");
                return;
            }
            try {
                const reqPin: RequestPin = { coordinates: pin.coordinates };
                const response = await fetch("/api/requestAid", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(reqPin),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw errorData;
                }

                console.log("Pin submitted successfully");
            } catch (e) {
                console.error("Error in requestAid:", e);
            }
        };

        return (
            <div>
                <DynamicMap ref={mapRef} onClick={handleMapClick} />
                <div className="flex flex-col space-y-2">
                    <label htmlFor="latitude" className="text-sm font-medium text-gray-700">
                        Latitude
                    </label>
                    <input
                        id="latitude"
                        type="text"
                        value={pin?.coordinates.latitude ?? ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                    />
                </div>
                <div className="flex flex-col space-y-2">
                    <label htmlFor="longitude" className="text-sm font-medium text-gray-700">
                        Longitude
                    </label>
                    <input
                        id="longitude"
                        type="text"
                        value={pin?.coordinates.longitude ?? ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 text-center w-full"
                >
                    Submit
                </button>
            </div>
        );
    };

export default RequestAidMapWrapper
    ;
