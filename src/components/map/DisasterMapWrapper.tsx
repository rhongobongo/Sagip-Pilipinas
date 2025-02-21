"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { usePinsStore } from "@/stores/usePinStore";
import { MapRef } from "./GoogleMapComponent";
import { MainPin } from "@/types/types";

const DynamicMap = dynamic(() => import("./GoogleMapComponent"), { ssr: false });

interface DisasterMapWrapperProps {
    pinData: MainPin[];
}

const DisasterMapWrapper: React.FC<DisasterMapWrapperProps> = ({ pinData }) => {
    const pins = usePinsStore((state) => state.pins);
    const initializePins = usePinsStore((state) => state.initializePins);
    const fetchPins = usePinsStore((state) => state.fetchPins);
    const mapRef = useRef<MapRef>(null);

    useEffect(() => {
        initializePins(pinData);
        const unsubscribe = fetchPins();
        return () => unsubscribe();
    }, [pinData, initializePins, fetchPins]);

    return (
        <DynamicMap ref={mapRef} pins={pins} />
    );
};

export default DisasterMapWrapper;
