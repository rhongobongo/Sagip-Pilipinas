"use client";

import { useContext } from "react";
import Image from "next/image";
import { VolunteerProfileContext } from "./VolunteerProfileContext";

const VolunteerProfileImage = () => {
    const context = useContext(VolunteerProfileContext);
    
    if (!context) {
        throw new Error("VolunteerProfileImage must be used within a VolunteerProfileProvider");
    }
    
    const { imagePreview, setImagePreview } = context;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target?.files?.[0]) {
            const selectedFile = e.target.files[0];

            const reader = new FileReader();
            reader.onload = (event) => {
                if (typeof event.target?.result === "string") {
                    setImagePreview(event.target.result); // Ensures only string type is passed
                }
            };
            reader.readAsDataURL(selectedFile);
        }
    };
    
    return (
        <div className="w-full md:w-1/3">
            <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-4 rounded-full overflow-hidden">
                    {imagePreview ? (
                        <Image
                            src={imagePreview}
                            alt="Profile Preview"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                        </div>
                    )}
                </div>

                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                    <div>Change Photo</div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );
};

export default VolunteerProfileImage;
