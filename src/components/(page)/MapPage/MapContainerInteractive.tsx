"use client"

import DisasterMapWrapper from "@/components/map/DisasterMapWrapper";
import { MainPin } from "@/types/types";
import { useState, useEffect } from "react";
import PinList from "./PinList";

interface MapContainerInteractiveProps {
    pins: MainPin[];
}

const MapContainerInteractive: React.FC<MapContainerInteractiveProps> = ({ pins }) => {

    const [pin, setPin] = useState<MainPin | null>(null);

    return (
        <div className="grid grid-cols-[20vw_80vw] grid-rows-1 bg-blue-500">
            <div className="w-[20vw]">
                <PinList pinData={pins} setPin={setPin} />
            </div>
            <div className="w-[80vw]">
                <DisasterMapWrapper pinData={pins} pin={pin} setPin={setPin} />
            </div>
        </div>
    );
};

export default MapContainerInteractive;
