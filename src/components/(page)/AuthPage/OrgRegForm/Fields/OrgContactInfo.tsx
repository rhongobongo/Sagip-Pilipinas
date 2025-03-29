"use client";

import { useOrgRegForm } from "../OrgRegFormContext";
import { BsTwitterX } from "react-icons/bs";
import { FaFacebook, FaInstagram } from "react-icons/fa6";
import renderSocialEntry from "./Subfields/renderSocialEntry";

const OrgContactInfo = () => {
    const { formData, setFormData } = useOrgRegForm();

    /** Handles input changes dynamically */
    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="flex flex-col md:flex-row gap-4">
            {/* Contact Info */}
            <div className="w-full md:w-1/2 flex flex-col">
                <h2 className="text-lg font-semibold mb-2">
                    Contact Information: <span className="text-red-500">*</span>
                </h2>
                <div className="flex flex-col gap-2.5 w-full">
                    <div className="relative">
                        <label htmlFor="contactNumber" className="sr-only">
                            Contact Number
                        </label>
                        <input
                            type="tel"
                            id="contactNumber"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={(e) => {
                                const nv = e.target.value.replace(/\D/g, "");
                                if (nv.length <= 10) {
                                    setFormData((p) => ({
                                        ...p,
                                        contactNumber: nv,
                                    }));
                                }
                            }}
                            className="textbox pl-12 w-full placeholder:text-gray-200"
                            placeholder="9XXXXXXXXX"
                            required
                            maxLength={10}
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            +63 |
                        </span>
                    </div>
                    <div>
                        <label htmlFor="contactPerson" className="sr-only">
                            Contact Person
                        </label>
                        <input
                            type="text"
                            id="contactPerson"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleInputChange}
                            className="textbox placeholder:text-gray-200 w-full"
                            placeholder="Primary Contact Person Name"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="orgPosition" className="sr-only">
                            Organization Position
                        </label>
                        <input
                            type="text"
                            id="orgPosition"
                            name="orgPosition"
                            value={formData.orgPosition}
                            onChange={handleInputChange}
                            className="textbox placeholder:text-gray-200 w-full"
                            placeholder="Position in organization"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="email"
                            className="text-md font-semibold w-full block mb-1"
                        >
                            Email: <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="textbox w-full"
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Social Media */}
            <div className="w-full md:w-1/2 flex flex-col">
                <div className="relative mb-[-1rem] z-10 w-fit">
                    <div className="font-bold bg-white rounded-3xl px-4 py-1 border-2 border-[#ef8080]">
                        Social Media:
                    </div>
                </div>
                <div className="flex flex-col justify-around items-start bg-white w-full h-full text-black shadow-lg border-2 border-[#ef8080] rounded-lg p-6 pt-8 gap-4">
                    {renderSocialEntry("twitter", BsTwitterX, "Twitter")}
                    {renderSocialEntry("facebook", FaFacebook, "Facebook")}
                    {renderSocialEntry("instagram", FaInstagram, "Instagram")}
                </div>
            </div>
        </div>
    );
};

export default OrgContactInfo;
