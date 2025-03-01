"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { usePinsStore } from "@/stores/usePinStore";
import { MapRef } from "./GoogleMapComponent";
import { MainPin } from "@/types/types";

const DynamicMap = dynamic(() => import("./GoogleMapComponent"), { ssr: false });

interface DistributionMapHomeWrapperProps {
    pinData: MainPin[];
}

const DistributionMapHomeWrapper: React.FC<DistributionMapHomeWrapperProps> = ({ pinData }) => {
    const pins = usePinsStore((state) => state.pins);
    const initializePins = usePinsStore((state) => state.initializePins);
    const fetchPins = usePinsStore((state) => state.fetchPins);
    const mapRef = useRef<MapRef>(null);
    const mapSize = { width: "100%", height: "80vh" };

    useEffect(() => {
        initializePins(pinData);
        const unsubscribe = fetchPins();
        return () => unsubscribe();
    }, [pinData, initializePins, fetchPins]);


    return (
        <div className="max-w-3xl">
            <DynamicMap ref={mapRef} pins={pins} mapSize={mapSize}/>
        </div>
    );
};

export default DistributionMapHomeWrapper;
