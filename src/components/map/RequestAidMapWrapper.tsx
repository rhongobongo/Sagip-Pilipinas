"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapRef } from "./GoogleMapComponent";
import { RequestPin } from "@/types/types";

const DynamicMap = dynamic(() => import("./GoogleMapComponent"), { ssr: false });

const RequestAidMapWrapper: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        contactNumber: "",
        disasterType: "",
        aidType: "",
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const mapRef = useRef<MapRef>(null);
    const mapSize = { width: "100%", height: "80vh" };

    // Update form data when map is clicked
    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            setFormData((prev) => ({
                ...prev,
                latitude: event.latLng?.lat() as number,
                longitude: event.latLng?.lng() as number,
            }));
            mapRef.current?.addMarker?.({
                coordinates: {
                    latitude: event.latLng.lat(),
                    longitude: event.latLng.lng(),
                },
            });
        }
    };

    // General form change handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "contactNumber" ? value.replace(/\D/g, "").slice(0, 11) : value, // Ensuring contact number is numeric and max 11 digits
        }));
    };

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.latitude || !formData.longitude) {
            alert("Please select a location on the map.");
            return;
        }

        try {
            const response = await fetch("/api/requestAid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit request.");
            }

            alert("Aid request submitted successfully!");
        } catch (error) {
            console.error("Error in requestAid:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div>
            <DynamicMap ref={mapRef} onClick={handleMapClick} />

            <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
                <div>Full Name:</div>
                <input type="text" name="name" required onChange={handleChange} className="inputBox" />

                <div>Contact Number:</div>
                <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    placeholder="Enter 11-digit number"
                    required
                    onChange={handleChange}
                    pattern="0[0-9]{10}"
                    maxLength={11}
                    inputMode="numeric"
                    className="inputBox"
                />

                <div>Disaster:</div>
                <select name="disasterType" onChange={handleChange} className="inputBox" value={formData.disasterType}>
                    <option value="">-Select Disaster Type-</option>
                    <option value="Fire">Fire</option>
                    <option value="Flood">Flood</option>
                    <option value="Typhoon">Typhoon</option>
                    <option value="Tsunami">Tsunami</option>
                    <option value="Landslide">Landslide</option>
                    <option value="Earthquakes">Earthquakes</option>
                    <option value="Other">Other</option>
                </select>
                {formData.disasterType === "Other" && (
                    <input name="disasterType" placeholder="Disaster Type" onChange={handleChange} className="inputBox" />
                )}

                <div>Aid Needed:</div>
                <select name="aidType" onChange={handleChange} className="inputBox" value={formData.aidType}>
                    <option value="">-Select Aid Type-</option>
                    <option value="Food">Food</option>
                    <option value="Medical Help">Medical Help</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Rescue">Rescue</option>
                    <option value="Other">Other</option>
                </select>
                {formData.aidType === "Other" && (
                    <input name="aidType" placeholder="Additional Information" onChange={handleChange} className="inputBox" />
                )}

                {/* Coordinates Display */}
                <div className="flex flex-col space-y-2">
                    <label htmlFor="latitude" className="text-sm font-medium text-gray-700">
                        Latitude
                    </label>
                    <input
                        id="latitude"
                        type="text"
                        value={formData.latitude ?? ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                    />
                </div>
                <div className="flex flex-col space-y-2">
                    <label htmlFor="longitude" className="text-sm font-medium text-gray-700">
                        Longitude
                    </label>
                    <input
                        id="longitude"
                        type="text"
                        value={formData.longitude ?? ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                    />
                </div>

                <button type="submit" className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 text-center w-full">
                    Submit Request
                </button>
            </form>
        </div>
    );
};

export default RequestAidMapWrapper;
