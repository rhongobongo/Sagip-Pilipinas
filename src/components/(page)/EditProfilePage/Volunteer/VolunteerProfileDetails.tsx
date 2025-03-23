"use client";

import { useContext } from "react";
import { VolunteerProfileContext } from "./VolunteerProfileContext";

const VolunteerProfileDetails = () => {
    const context = useContext(VolunteerProfileContext);

    if (!context) {
        return <p>Loading...</p>;
    }

    const { profileData } = context;

    return (
        <div className="p-4 border rounded-lg shadow-md bg-white text-black container mx-auto">
            <img
                src={profileData.profileImageUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto"
            />
            <h2 className="text-xl font-semibold text-center mt-2">{profileData.name}</h2>
            <p className="text-gray-600 text-center">@{profileData.username}</p>

            <div className="mt-4">
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Contact:</strong> {profileData.contactNumber}</p>
                <p><strong>Organization:</strong> {profileData.organization}</p>
                <p className="text-sm text-gray-500">Joined: {new Date(profileData.createdAt).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Updated: {new Date(profileData.updatedAt).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default VolunteerProfileDetails;
