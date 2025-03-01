"use client";

import { useState } from "react";
import { OrganizationPin } from "@/types/PinTypes";
import { LocationMember } from "./LocationMember";

interface LocationListProps {
    pinData: OrganizationPin[];
}

const LocationList: React.FC<LocationListProps> = ({ pinData }) => {
    const [region, setRegion] = useState<string>("");

    const regions = ["LUZON", "VISAYAS", "MINDANAO"];

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="grid grid-cols-3 gap-0 text-black w-full h-20 rounded-3xl items-center justify-center bg-[#BE8E8E]">
                {regions.map((r) => (
                    <button
                        key={r}
                        onClick={() => setRegion(r)}
                        className={`flex-grow h-full flex items-center justify-center transition-colors duration-200 rounded-3xl ${region === r ? "text-white bg-black" : "text-black hover:bg-gray-300"
                            }`}
                    >
                        {r}
                    </button>
                ))}
            </div>

            <div className="flex-grow overflow-y-auto border border-gray-300 rounded-lg max-h-[70vh]">
                {pinData.length > 0 && region !== "" ? (
                    <ul>
                        {pinData
                            .filter((pin) => pin.region === region)
                            .map((pin) => (
                                <li key={pin.id} className="mb-2">
                                    <LocationMember pin={pin} />
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center">Select a region to view locations.</p>
                )}
            </div>
        </div>


    );
};

export default LocationList;
