"use client"

import DistributionMapHomeWrapper from "@/components/map/DistributionMapHomeWrapper"
import LocationList from "./LocationList"
import { OrganizationPin } from "@/types/PinTypes"

import { useState } from "react"

const MapSectionInteractive: React.FC<{ locations: OrganizationPin[] }> = ({ locations }) => {

    const [selectedPin, setSelectedPin] = useState<OrganizationPin | null>(null);


    return (
        <div className="container mx-auto grid grid-cols-2 gap-8 p-8 h-[80vh]">
            <div className="rounded-2xl flex-grow">
                <DistributionMapHomeWrapper pinData={locations} selectedPin={selectedPin} />
            </div>
            <div className="h-full">
                <LocationList pinData={locations} onSelectPin={setSelectedPin} />
            </div>
        </div>
    )
}

export default MapSectionInteractive