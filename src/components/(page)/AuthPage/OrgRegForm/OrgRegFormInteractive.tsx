"use client";

import { useContext } from "react";
import { OrgRegFormContext } from "./OrgRegFormContext";
import OrgRegFormImage from "./OrgRegFormImage";
import { AidTypeId, aidTypes } from "./types";
import { registerOrganization } from "@/lib/APICalls/Auth/registerOrganization";
import OrgRegFormFields from "./OrgRegFormFields";
import LocationPickerModal from "@/components/map/LocationPickerModal";

const OrgRegFormInteractive = () => {
    const context = useContext(OrgRegFormContext);

    if (!context) {
        return <p className="text-center text-gray-500">Loading form...</p>;
    }

    const {
        formData,
        setFormData,
        image,
        setImage,
        setImagePreview,
        checkedAidTypes,
        setCheckedAidTypes,
        aidDetails,
        setAidDetails,
        sponsors,
        setSponsors,
        socialLinks,
        setSocialLinks,
        latitude,
        setLatitude,
        longitude,
        setLongitude,
        isLoading,
        setIsLoading,
        error,
        setError,
        success,
        setSuccess,
        setOtherTextbox,
        setShowMainPassword,
        setShowRetypePassword,
        isMapModalOpen,
        setIsMapModalOpen,
    } = context;

    const handleCloseMapModal = () => setIsMapModalOpen(false);
    const handleLocationSelect = (
        lat: number,
        lng: number,
        address: string | null
    ) => {
        setLatitude(lat);
        setLongitude(lng);
        if (address) {
            setFormData((prev) => ({ ...prev, location: address })); // Update address field
        } else {
            console.warn("No address found for selected coordinates.");
            // Keep existing address text if geocoding fails
            setFormData((prev) => ({
                ...prev,
                location:
                    prev.location ||
                    `Coords: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            }));
        }
        // Modal closing is handled within LocationPickerModal after geocoding
    };

    const validateForm = () => {
        if (!formData.name.trim()) return "Name is required";
        if (!formData.email.trim()) return "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(formData.email))
            return "Email format is invalid";
        // --- ADDED Coordinate validation ---
        if (latitude === null || longitude === null)
            return "Please select a location on the map";
        // --- End Coordinate validation ---
        if (!formData.description.trim()) return "Description is required";
        if (!formData.contactNumber.trim()) return "Contact number is required";
        if (!formData.contactPerson.trim()) return "Contact Person is required";
        if (!formData.orgPosition.trim())
            return "Organization Position is required";
        if (!formData.password) return "Password is required";
        if (formData.password.length < 6)
            return "Password must be at least 6 characters";
        if (formData.password !== formData.retypePassword)
            return "Passwords don't match";
        if (!formData.type) return "Organization type is required";
        // Original aid validation loop...
        for (const aidId of aidTypes.map((a) => a.id)) {
            if (checkedAidTypes[aidId]) {
                /*...*/
            }
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }
        if (!image) {
            setError("Profile image is required.");
            return;
        }
        if (latitude === null || longitude === null) {
            setError("Location coordinates are missing. Please select on map.");
            return;
        }

        setIsLoading(true);
        try {
            const formDataObj = new FormData();
            // Append original form data (excluding helper fields)
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== "otherText" && key !== "retypePassword") {
                    formDataObj.append(key, value);
                }
            });
            if (formData.type === "other" && formData.otherText) {
                formDataObj.append("otherTypeText", formData.otherText);
            }

            // Append latitude and longitude
            formDataObj.append("latitude", latitude.toString());
            formDataObj.append("longitude", longitude.toString());

            // Append profile image
            if (image) formDataObj.append("profileImage", image);

            // Append social media
            Object.entries(socialLinks).forEach(([platform, data]) => {
                if (data.mode === "added" && data.username.trim()) {
                    formDataObj.append(
                        `social_${platform}_username`,
                        data.username.trim()
                    );
                    if (data.link.trim())
                        formDataObj.append(
                            `social_${platform}_link`,
                            data.link.trim()
                        );
                }
            });

            // Append Sponsors
            const sponsorsDataForUpload = sponsors.map((s) => ({
                name: s.name,
                other: s.other,
            }));
            if (sponsorsDataForUpload.length > 0)
                formDataObj.append(
                    "sponsors_json",
                    JSON.stringify(sponsorsDataForUpload)
                );
            sponsors.forEach((sponsor) => {
                if (sponsor.photoFile)
                    formDataObj.append(
                        `sponsor_photo_${sponsor.name.replace(/\s+/g, "_")}`,
                        sponsor.photoFile,
                        sponsor.photoFile.name
                    );
            });

            // Append Aid Stock
            Object.entries(checkedAidTypes).forEach(([aidId, isChecked]) => {
                if (isChecked) {
                    formDataObj.append(`aid_${aidId}_available`, "true");
                    const details = aidDetails[aidId as AidTypeId];
                    Object.entries(details).forEach(([field, value]) => {
                        if (value !== "" && value !== null)
                            formDataObj.append(
                                `aid_${aidId}_${field}`,
                                String(value)
                            );
                    });
                }
            });

            const response = await registerOrganization(formDataObj);

            // Handle Response
            if (response.success) {
                setSuccess("Registration successful! Redirecting to login...");
                // Reset form state - you can use initialState constants from your context here
                setFormData({
                    name: "",
                    email: "",
                    contactNumber: "",
                    acctUsername: "",
                    password: "",
                    retypePassword: "",
                    type: "",
                    description: "",
                    location: "",
                    dateOfEstablishment: "",
                    otherText: "",
                    contactPerson: "",
                    orgPosition: "",
                });
                setImage(null);
                setImagePreview(null);
                setOtherTextbox(false);
                setShowMainPassword(false);
                setShowRetypePassword(false);

                // Reset complex states
                setSocialLinks({
                    twitter: { username: "", link: "", mode: "initial" },
                    facebook: { username: "", link: "", mode: "initial" },
                    instagram: { username: "", link: "", mode: "initial" },
                });

                setSponsors([]);

                setCheckedAidTypes({
                    food: false,
                    clothing: false,
                    medicalSupplies: false,
                    shelter: false,
                    searchAndRescue: false,
                    financialAssistance: false,
                    counseling: false,
                    technicalSupport: false,
                });

                setAidDetails({
                    food: { foodPacks: "", category: "" },
                    clothing: { male: "", female: "", children: "" },
                    medicalSupplies: { kits: "", kitType: "" },
                    shelter: { tents: "", blankets: "" },
                    searchAndRescue: { rescueKits: "", rescuePersonnel: "" },
                    financialAssistance: { totalFunds: "", currency: "PHP" },
                    counseling: { counselors: "", hours: "" },
                    technicalSupport: { vehicles: "", communication: "" },
                });

                setLatitude(null);
                setLongitude(null);

                setTimeout(() => {
                    window.location.href = "./login";
                }, 2000);
            } else {
                setError(
                    response.message ||
                        "Registration failed. Please check details."
                );
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Error during registration:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                    {success}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col lg:flex-row items-start justify-around gap-6">
                    <OrgRegFormImage />
                    <div className="w-full lg:w-3/4 flex flex-col gap-4">
                        <OrgRegFormFields></OrgRegFormFields>
                    </div>
                </div>
                <div className="mt-10 flex justify-end pb-8">
                    <button
                        type="submit"
                        className={`bg-red-600 text-white font-semibold text-lg px-8 py-2.5 rounded-md hover:bg-red-700 transition duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Registering..." : "Register Organization"}
                    </button>
                </div>
            </form>

            <LocationPickerModal
                isOpen={isMapModalOpen}
                onClose={handleCloseMapModal}
                onLocationSelect={handleLocationSelect} // Pass the updated handler
                initialCoords={
                    latitude && longitude
                        ? { lat: latitude, lng: longitude }
                        : undefined
                }
                apiKey={process.env.NEXT_PUBLIC_Maps_API_KEY ?? ""} // Ensure API Key is set
            />
        </>
    );
};

export default OrgRegFormInteractive;
