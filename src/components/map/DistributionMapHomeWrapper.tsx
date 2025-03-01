"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import { MapRef } from "./GoogleMapComponent";
import { MainPin } from "@/types/types";

const DynamicMap = dynamic(() => import("./GoogleMapComponent"), { ssr: false });

interface DistributionMapHomeWrapperProps {
    pinData: MainPin[];
}

const DistributionMapHomeWrapper: React.FC<DistributionMapHomeWrapperProps> = ({ pinData }) => {

    const mapRef = useRef<MapRef>(null);

    const mapContainerStyle: React.CSSProperties = {
        width: "100%",
        height: "80vh",
        borderRadius: "2%",
        border: "4px solid #000000", 
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    };

    return (
        <div className="max-w-3xl rounded-3xl">
            <DynamicMap ref={mapRef} pins={pinData} mapStyle={mapContainerStyle}/>
        </div>
    );
};

export default DistributionMapHomeWrapper;
