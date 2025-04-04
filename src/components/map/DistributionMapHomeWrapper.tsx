"use client";

import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapRef } from "./GoogleMapComponent";
import { MainPin } from "@/types/types";
import { OrganizationPin } from "@/types/PinTypes";

const DynamicMap = dynamic(() => import("./GoogleMapComponent"), { ssr: false });

interface DistributionMapHomeWrapperProps {
    pinData: MainPin[];
    selectedPin: OrganizationPin | null;
}

const DistributionMapHomeWrapper: React.FC<DistributionMapHomeWrapperProps> = ({ pinData, selectedPin }) => {

    const mapRef = useRef<MapRef>(null);

    const mapContainerStyle: React.CSSProperties = {
        width: "100%",
        height: "75vh",
        borderRadius: "2%",
        border: "4px solid #000000", 
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    };

    const mapOptions : google.maps.MapOptions = {
        minZoom: 6.5
    }

    const onPinClick = (pin: OrganizationPin) => {
        console.log(mapRef?.current);
        mapRef?.current?.zoomMarker?.(pin);
    }
    
    useEffect(() => {
        if (selectedPin) {
            onPinClick(selectedPin)
        }
    }, [selectedPin]);

    return (
        <div className="max-w-3xl rounded-3xl">
            <DynamicMap ref={mapRef} pins={pinData} mapStyle={mapContainerStyle} options={mapOptions}/>
        </div>
    );
};

export default DistributionMapHomeWrapper;
