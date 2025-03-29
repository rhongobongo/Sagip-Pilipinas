"use client";

import { useOrgRegForm } from "../OrgRegFormContext";
import { FaMapMarkerAlt } from "react-icons/fa";

const OrgBasicInfo = () => {
    const { formData, setFormData, latitude, longitude, setIsMapModalOpen} = useOrgRegForm();

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpenMapModal = () => setIsMapModalOpen(true);

    return (
        <div className="flex flex-col md:flex-row w-full gap-4">
            {/* Organization Name */}
            <div className="items-center w-full">
                <label htmlFor="name" className="w-full text-left font-bold block mb-1">
                    Organization Name: <span className="text-red-500">*</span>
                </label>
                <input
                    id="name"
                    className="textbox w-full"
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    required
                />
            </div>

            {/* Address / HQ Location */}
            <div className="items-center w-full">
                <label htmlFor="location" className="w-full text-left font-bold block mb-1">
                    Address / HQ Location: <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                    <input
                        id="location"
                        className="textbox w-full"
                        type="text"
                        name="location"
                        value={formData.location || ""}
                        onChange={handleInputChange}
                        placeholder="Select on map or enter address"
                        required
                    />
                    <button
                        type="button"
                        onClick={handleOpenMapModal}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center flex-shrink-0"
                        aria-label="Select Location on Map"
                        title="Select Location on Map"
                    >
                        <FaMapMarkerAlt size={20} />
                    </button>
                </div>
                {latitude !== undefined && longitude !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                        Coords: {latitude?.toFixed(5)}, {longitude?.toFixed(5)} <span className="text-red-500">*</span>
                    </p>
                )}
            </div>

            {/* Date of Establishment */}
            <div className="items-center w-full">
                <label htmlFor="dateOfEstablishment" className="w-full text-left font-bold block mb-1">
                    Date of Establishment: <span className="text-red-500">*</span>
                </label>
                <input
                    id="dateOfEstablishment"
                    className="textbox w-full"
                    type="date"
                    name="dateOfEstablishment"
                    value={formData.dateOfEstablishment || ""}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split("T")[0]}
                    required
                />
            </div>
        </div>
    );
};

export default OrgBasicInfo;
