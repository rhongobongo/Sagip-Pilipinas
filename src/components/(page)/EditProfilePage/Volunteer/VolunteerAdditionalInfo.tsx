"use client";

import { useContext } from "react";
import { VolunteerProfileContext } from "./VolunteerProfileContext";

const VolunteerAdditionalInfo = () => {
    const context = useContext(VolunteerProfileContext);

    if (!context) {
        return <p className="text-center text-gray-500">Loading profile...</p>;
    }

    const { profileData, setProfileData, isEditing } = context;

    return (
        <div className="border-t pt-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>

            <div className="space-y-4">
                {/* About Me */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        About Me
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={profileData.description ?? ""}
                        onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={!isEditing}
                        placeholder="Tell us a bit about yourself..."
                    />
                </div>

                {/* Skills */}
                <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                        Skills
                    </label>
                    <textarea
                        id="skills"
                        name="skills"
                        rows={3}
                        value={profileData.skills ?? ""}
                        onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={!isEditing}
                        placeholder="List your skills..."
                    />
                </div>

                <div>
                    <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                        Availability
                    </label>
                    <textarea
                        id="availability"
                        name="availability"
                        rows={2}
                        value={profileData.availability ?? ""}
                        onChange={(e) => setProfileData({ ...profileData, availability: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={!isEditing}
                        placeholder="When are you typically available? (e.g., Weekends, Evenings, Mondays and Wednesdays)"
                    />
                </div>
            </div>
        </div>
    );
};

export default VolunteerAdditionalInfo;
