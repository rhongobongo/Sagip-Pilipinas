"use client";

import { RefObject, useEffect } from "react";
import { usePinsStore } from "@/stores/usePinStore";
import { MainPin } from "@/types/types";
import { MapRef } from "../GoogleMapComponent";

interface PinListProps {
    pinData: MainPin[];
    mapRef: RefObject<MapRef | null>;
}

const PinList: React.FC<PinListProps> = ({ pinData, mapRef }) => {

    const realTimePins = usePinsStore((state) => state.pins);
    const fetchPins = usePinsStore((state) => state.fetchPins);

    useEffect(() => {
        const unsubscribe = fetchPins();
        return () => unsubscribe();
    }, [fetchPins]);

    const onPinClick = (pin: MainPin) => {
        console.log(mapRef?.current);
        mapRef?.current?.zoomMarker?.(pin);
    }

    return (
        <>
            {realTimePins && realTimePins.length > 0 ? (
                <ul>
                    {realTimePins.map((pin) => (
                        <button
                            key={pin.id}
                            onClick={() => onPinClick(pin)}
                            className="cursor-pointer p-3 border-b border-gray-300 hover:bg-gray-100 transition duration-200"
                        >
                            <p className="text-lg font-semibold">
                                Latitude: {pin.coordinates.latitude}, Longitude: {pin.coordinates.longitude}
                            </p>
                        </button>
                    ))}
                </ul>
            ) : (
                <p>No pins available.</p>
            )}
        </>
    );
};

export default PinList;
