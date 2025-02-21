"use client";

import { useEffect } from "react";
import { usePinsStore } from "@/stores/usePinStore";
import { MainPin } from "@/types/types";

interface PinListProps {
    pinData: MainPin[];
}

const PinList: React.FC<PinListProps> = ({ pinData }) => {

    const realTimePins = usePinsStore((state) => state.pins);
    const fetchPins = usePinsStore((state) => state.fetchPins);

    useEffect(() => {
        const unsubscribe = fetchPins();
        return () => unsubscribe();
    }, [fetchPins]);

    return (
        <>
            {realTimePins && realTimePins.length > 0 ? (
                <ul>
                    {realTimePins.map((pin) => (
                        <li key={pin.id}>
                            Latitude: {pin.coordinates.latitude}, Longitude:{" "}
                            {pin.coordinates.longitude}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No pins available.</p>
            )}
        </>
    );
};

export default PinList;
