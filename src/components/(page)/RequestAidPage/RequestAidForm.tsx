'use client'

import { useState } from "react";
import { RequestPin } from "@/types/types";
import { requestAid } from "@/components/map/SubmitAid";

interface RequestFormProps {
    pin: RequestPin | null;
}

const RequestAidForm: React.FC<RequestFormProps> = ({ pin }) => {
    const [fullName, setFullName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [disasterType, setDisasterType] = useState("");
    const [aidType, setAidType] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        if (pin) {
            e.preventDefault();

            Object.assign(pin, { fullName, contactNumber, disasterType, aidType });

            requestAid(pin);

        }
    };


    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md"
                />
                <input
                    type="text"
                    placeholder="Contact Number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md"
                />
                <input
                    type="text"
                    placeholder="Disaster Type"
                    value={disasterType}
                    onChange={(e) => setDisasterType(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md"
                />
                <input
                    type="text"
                    placeholder="Aid Type"
                    value={aidType}
                    onChange={(e) => setAidType(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md"
                />
                <button type="submit" className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 w-full">
                    Submit Request
                </button>
            </form>
        </div>
    );
};

export default RequestAidForm;
