"use client";

import { useContext } from "react";
import { VolunteerProfileContext } from "./VolunteerProfileContext";

const VolunteerProfileDetails = () => {
    const context = useContext(VolunteerProfileContext);

    if (!context) {
        return <p className="text-center text-gray-500">Loading profile...</p>;
    }

    const { profileData } = context;

    return (
        <div className="w-full md:w-2/3 space-y-4 text-black">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name*
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={profileData?.name || ""}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                />
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Cannot be changed)
                </label>
                <input
                    type="email"
                    id="email"
                    defaultValue={profileData?.email || ""}
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                    disabled
                />
            </div>

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username*
                </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    defaultValue={profileData?.username || ""}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                />
            </div>

            <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number*
                </label>
                <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    defaultValue={profileData?.contactNumber || ""}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    required
                />
            </div>
        </div>
    );
};

export default VolunteerProfileDetails;
