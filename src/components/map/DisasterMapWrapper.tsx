"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { usePinsStore } from "@/stores/usePinStore";
import { MapRef } from "./GoogleMapComponent";
import { MainPin } from "@/types/types";

const DynamicMap = dynamic(() => import("./GoogleMapComponent"), { ssr: false });

interface DisasterMapWrapperProps {
    pinData: MainPin[];
    pin: MainPin | null;
    setPin: (pin: MainPin) => void;
}

const DisasterMapWrapper: React.FC<DisasterMapWrapperProps> = ({ pinData, pin, setPin }) => {
    const pins = usePinsStore((state) => state.pins);
    const initializePins = usePinsStore((state) => state.initializePins);
    const fetchPins = usePinsStore((state) => state.fetchPins);
    const mapRef = useRef<MapRef>(null);

    const mapStyle : React.CSSProperties = {
        width: "100%",
        height: "93vh"
    }

    useEffect(() => {
        initializePins(pinData);
        const unsubscribe = fetchPins();
        return () => unsubscribe();
    }, [pinData, initializePins, fetchPins]);

    useEffect(() => {
        if (pin) {
            mapRef.current?.zoomMarker?.(pin);
        }
    }, [pin]);
    
    return (
        <DynamicMap ref={mapRef} pins={pins} setPin={setPin} mapStyle={mapStyle}/>
    );
};

export default DisasterMapWrapper;
