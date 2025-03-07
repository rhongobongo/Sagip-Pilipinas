"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapRef } from "./GoogleMapComponent";
import { RequestPin } from "@/types/types";
import { requestAid } from "./SubmitAid";

const DynamicMap = dynamic(() => import("./GoogleMapComponent"), { ssr: false });

interface RequestAidMapWrapperProps {
    width?: string; // Optional width prop
    height?: string; // Optional height prop
}

const RequestAidMapWrapper : React.FC<RequestAidMapWrapperProps> = ({ width = "100vw", height = "100vh" }) => {
    const [formData, setFormData] = useState<RequestPin>({
        fullName: "",
        contactNumber: "",
        disasterType: "",
        aidType: "",
        coordinates: { latitude: null, longitude: null },
    });

    const mapRef = useRef<MapRef>(null);

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return;

        const latitude = event.latLng?.lat();
        const longitude = event.latLng?.lng();

        setFormData((prev) => ({
            ...prev,
            coordinates: { latitude, longitude },
        }));

        mapRef.current?.addMarker?.({ coordinates: { latitude, longitude } });
    };

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "contactNumber" ? value.replace(/\D/g, "").slice(0, 11) : value,
        }));
    };

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.coordinates.latitude || !formData.coordinates.longitude) {
            alert("Please select a location on the map.");
            return;
        }
        else if (!formData.aidType && !formData.disasterType) {
            alert("Please select Disaster and Aid type.");
            return;
        }
        else if (!formData.aidType) {
            alert("Please select Aid type.");
            return;
        }
        else if (!formData.disasterType) {
            alert("Please select Disaster type.");
            return;
        }

        try {
            requestAid(formData);
            alert("Aid request submitted successfully!");
        } catch (error) {
            console.error("Error in requestAid:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div>
            <DynamicMap ref={mapRef} onClick={handleMapClick} />

            <form onSubmit={handleSubmit} className="space-y-4">
                {[
                    { label: "Full Name", name: "name", type: "text", required: true },
                    { label: "Contact Number", name: "contactNumber", type: "text", required: true},
                ].map(({ label, name, ...props }) => (
                    <div key={name}>
                        <label className="block text-sm font-medium">{label}:</label>
                        <input name={name} value={(formData as any)[name]} onChange={handleChange} className="inputBox" {...props} inputMode="text" />
                    </div>
                ))}


                {[
                    { label: "Disaster", name: "disasterType", options: ["Fire", "Flood", "Typhoon", "Tsunami", "Landslide", "Earthquakes", "Other"] },
                    { label: "Aid Needed", name: "aidType", options: ["Food", "Medical Help", "Shelter", "Rescue", "Other"] },
                ].map(({ label, name, options }) => (
                    <div key={name}>
                        <label className="block text-sm font-medium">{label}:</label>
                        <select name={name} value={(formData as any)[name]} onChange={handleChange} className="inputBox">
                            <option value="">-Select {label}-</option>
                            {options.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        {(formData as any)[name] === "Other" && (
                            <input name={name} placeholder={`Specify ${label}`} onChange={handleChange} className="inputBox" />
                        )}
                    </div>
                ))}
                {["latitude", "longitude"].map((coord) => (
                    <div key={coord} className="flex flex-col space-y-2">
                        <label htmlFor={coord} className="text-sm font-medium text-gray-700 capitalize">
                            {coord}
                        </label>
                        <input id={coord} type="text" value={formData.coordinates[coord as "latitude" | "longitude"] ?? ""} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500" />
                    </div>
                ))}

                {/** Submit Button */}
                <button type="submit" className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 w-full">
                    Submit Request
                </button>
            </form>
        </div>
    );
};

export default RequestAidMapWrapper;
