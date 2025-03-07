"use client";

import { useEffect } from "react";
import { usePinsStore } from "@/stores/usePinStore";
import { MainPin } from "@/types/types";

interface PinListProps {
    pinData: MainPin[];
    setPin: ( pin : MainPin ) => void;
}

const PinList: React.FC<PinListProps> = ({ pinData, setPin }) => {

    const realTimePins = usePinsStore((state) => state.pins);
    const fetchPins = usePinsStore((state) => state.fetchPins);

    useEffect(() => {
        const unsubscribe = fetchPins();
        return () => unsubscribe();
    }, [fetchPins]);

    const onPinClick = (pin: MainPin) => {
        setPin(pin);
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