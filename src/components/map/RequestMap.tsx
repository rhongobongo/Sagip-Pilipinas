"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapRef } from "./MapComponent";
import { Pin, RequestPin } from "@/types/types";

const DynamicMap = dynamic(() => import("./MapComponent"), { ssr: false });

const RequestMap: React.FC = () => {
    const [pins, setPins] = useState<Pin[]>([]);
    const mapRef = useRef<MapRef>(null);

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const newPin: Pin = {
                id: "Event Ping",
                coordinates: {
                    latitude: event.latLng.lat(),
                    longitude: event.latLng.lng(),
                },
            };
            setPins([newPin]);
        }
    };

    const handleSubmit = async () => {
        try {
            const reqPin: RequestPin = { coordinates: pins[0].coordinates }
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
        } catch (e) {
            console.error("Error in requestAid:", e);
        }
    }

    return (
        <div>
            <DynamicMap ref={mapRef} pins={pins} onClick={handleMapClick} />
            <div className="flex flex-col space-y-2">
                <label htmlFor="latitude" className="text-sm font-medium text-gray-700">
                    Latitude
                </label>
                <input
                    id="latitude"
                    type="text"
                    value={pins[0]?.coordinates.latitude || ""}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                />
            </div>
            <div className="flex flex-col space-y-2">
                <label htmlFor="longitude" className="text-sm font-medium text-gray-700">
                    Latitude
                </label>
                <input
                    id="longitude"
                    type="text"
                    value={pins[0]?.coordinates.longitude || ""}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                />
            </div>
            <button onClick={handleSubmit}
                className="bg-red-700">
                    Submit
            </button>
        </div>
    );
};

export default RequestMap;
