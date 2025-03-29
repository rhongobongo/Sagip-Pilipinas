import React from "react";
import { useOrgRegForm } from "../OrgRegFormContext";
import { AidTypeId, aidTypes} from "../types";

const OrgStockInfo = () => {
    // Access context values and functions
    const { checkedAidTypes, setCheckedAidTypes, aidDetails, setAidDetails } =
        useOrgRegForm();

    // Handler for aid type checkbox changes
    const handleAidCheckboxChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, checked } = e.target;
        setCheckedAidTypes((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleAidDetailChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        // Use type assertion to tell TypeScript that the split will result in valid keys
        const [aidId, field] = name.split(".") as [AidTypeId, string];
        
        let processedValue = value;
        if (type === "number") {
            const numValue = parseInt(value, 10);
            processedValue =
                isNaN(numValue) || numValue < 0 ? "" : String(numValue);
        }
        
        setAidDetails((prev) => ({
            ...prev,
            [aidId]: { ...prev[aidId], [field]: processedValue }
        }));
    };

    return (
        <div className="w-full py-4">
            <div className="relative mb-[-1rem] z-10 w-fit">
                <label className="font-bold bg-white rounded-3xl px-4 py-1 border-2 border-[#ef8080]">
                    Type of Aid In Stock:
                </label>
            </div>
            <div className="flex flex-col bg-white w-full text-black shadow-lg border-2 border-[#ef8080] rounded-lg p-6 pt-8 gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3 mb-4">
                    {aidTypes.map((aid) => (
                        <div key={aid.id}>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name={aid.id}
                                    checked={checkedAidTypes[aid.id]}
                                    onChange={handleAidCheckboxChange}
                                    className="custom-checkbox-input peer sr-only"
                                />
                                <span className="custom-checkbox-indicator"></span>
                                <span className="ml-2">{aid.label}</span>
                            </label>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-5 mt-3 border-t pt-4">
                    {checkedAidTypes.food && (
                        <div className="aid-detail-section">
                            <h3 className="font-semibold mb-2">
                                Food Details:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Number of Food Packs:
                                    </label>
                                    <input
                                        type="number"
                                        name="food.foodPacks"
                                        value={aidDetails.food.foodPacks}
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 100"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Category (Optional):
                                    </label>
                                    <select
                                        name="food.category"
                                        value={aidDetails.food.category}
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full bg-white"
                                    >
                                        <option value="">
                                            Select Category
                                        </option>
                                        <option value="non-perishable">
                                            Non-Perishable
                                        </option>
                                        <option value="ready-to-eat">
                                            Ready-to-Eat
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                    {checkedAidTypes.clothing && (
                        <div className="aid-detail-section">
                            <h3 className="font-semibold mb-2">
                                Clothing Details (Counts):
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Male:
                                    </label>
                                    <input
                                        type="number"
                                        name="clothing.male"
                                        value={aidDetails.clothing.male}
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 50"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Female:
                                    </label>
                                    <input
                                        type="number"
                                        name="clothing.female"
                                        value={aidDetails.clothing.female}
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 50"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Children:
                                    </label>
                                    <input
                                        type="number"
                                        name="clothing.children"
                                        value={aidDetails.clothing.children}
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 30"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {checkedAidTypes.medicalSupplies && (
                        <div className="aid-detail-section">
                            <h3 className="font-semibold mb-2">
                                Medical Supplies Details:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Total Medical Kits:
                                    </label>
                                    <input
                                        type="number"
                                        name="medicalSupplies.kits"
                                        value={aidDetails.medicalSupplies.kits}
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 25"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Kit Type (Optional):
                                    </label>
                                    <select
                                        name="medicalSupplies.kitType"
                                        value={
                                            aidDetails.medicalSupplies.kitType
                                        }
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full bg-white"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="first-aid">
                                            First Aid Kit
                                        </option>
                                        <option value="emergency">
                                            Emergency Kit
                                        </option>
                                        <option value="specialized">
                                            Specialized Kit
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                    {checkedAidTypes.shelter && (
                        <div className="aid-detail-section">
                            <h3 className="font-semibold mb-2">
                                Shelter Details:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Number of Tents:
                                    </label>
                                    <input
                                        type="number"
                                        name="shelter.tents"
                                        value={aidDetails.shelter.tents}
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 20"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Blankets/Sleeping Bags:
                                    </label>
                                    <input
                                        type="number"
                                        name="shelter.blankets"
                                        value={aidDetails.shelter.blankets}
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 100"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {checkedAidTypes.searchAndRescue && (
                        <div className="aid-detail-section">
                            <h3 className="font-semibold mb-2">
                                Search and Rescue Details:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Number of Rescue Kits:
                                    </label>
                                    <input
                                        type="number"
                                        name="searchAndRescue.rescueKits"
                                        value={
                                            aidDetails.searchAndRescue
                                                .rescueKits
                                        }
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 10"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Specialized Rescue Personnel:
                                    </label>
                                    <input
                                        type="number"
                                        name="searchAndRescue.rescuePersonnel"
                                        value={
                                            aidDetails.searchAndRescue
                                                .rescuePersonnel
                                        }
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 5"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {checkedAidTypes.financialAssistance && (
                        <div className="aid-detail-section">
                            <h3 className="font-semibold mb-2">
                                Financial Assistance Details:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Total Funds Available:
                                    </label>
                                    <input
                                        type="number"
                                        name="financialAssistance.totalFunds"
                                        value={
                                            aidDetails.financialAssistance
                                                .totalFunds
                                        }
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 50000"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Currency:
                                    </label>
                                    <select
                                        name="financialAssistance.currency"
                                        value={
                                            aidDetails.financialAssistance
                                                .currency
                                        }
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full bg-white"
                                    >
                                        <option value="PHP">PHP</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                    {checkedAidTypes.counseling && (
                        <div className="aid-detail-section">
                            <h3 className="font-semibold mb-2">
                                Counseling Details:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Number of Counselors Available:
                                    </label>
                                    <input
                                        type="number"
                                        name="counseling.counselors"
                                        value={aidDetails.counseling.counselors}
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 5"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Total Counseling Hours/Week:
                                    </label>
                                    <input
                                        type="number"
                                        name="counseling.hours"
                                        value={aidDetails.counseling.hours}
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 40"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {checkedAidTypes.technicalSupport && (
                        <div className="aid-detail-section">
                            <h3 className="font-semibold mb-2">
                                Technical/Logistical Support Details:
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Number of Vehicles:
                                    </label>
                                    <input
                                        type="number"
                                        name="technicalSupport.vehicles"
                                        value={
                                            aidDetails.technicalSupport.vehicles
                                        }
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 3"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Communication Equipment Count:
                                    </label>
                                    <input
                                        type="number"
                                        name="technicalSupport.communication"
                                        value={
                                            aidDetails.technicalSupport
                                                .communication
                                        }
                                        onChange={handleAidDetailChange}
                                        className="textbox w-full"
                                        placeholder="e.g., 10 radios"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrgStockInfo;
