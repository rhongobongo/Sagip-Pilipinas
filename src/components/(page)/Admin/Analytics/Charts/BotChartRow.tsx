"use client";

import { useState, useMemo } from "react";
import { Shirt, Users, UtensilsCrossed, Package } from "lucide-react";

interface OrganizationStockData {
    [orgId: string]: OrganizationStock;
}

interface OrganizationStock {
    orgName: string;
    clothing: number;
    medicine: number;
    food: number;
    volunteers: number;
}

interface BotChartRowProps {
    orgStock: OrganizationStockData;
    responseTime: string;
}

const BotChartRow: React.FC<BotChartRowProps> = ({ orgStock, responseTime }) => {
    const [selectedOrganization, setSelectedOrganization] = useState(
        "Select organization"
    );

    const organizationIds = Object.keys(orgStock);

    const selectedOrgData =
        selectedOrganization && selectedOrganization !== "Select organization"
            ? orgStock[selectedOrganization]
            : null;

    const totalStocks = useMemo(() => {
        if (!selectedOrgData && Object.keys(orgStock).length > 0) {
            let totalFood = 0;
            let totalVolunteers = 0;
            let totalClothing = 0;
            let totalMedicine = 0;

            Object.values(orgStock).forEach((org) => {
                totalFood += org.food;
                totalVolunteers += org.volunteers;
                totalClothing += org.clothing;
                totalMedicine += org.medicine;
            });

            return {
                food: totalFood,
                volunteers: totalVolunteers,
                clothing: totalClothing,
                medicine: totalMedicine,
            };
        }
        return null;
    }, [selectedOrgData, orgStock]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-white">
                {" "}
                {/* Changed grid definition, added text-white */}
                {/* Aid Types Stocks - Spanning 6 columns */}
                <div
                    className={`md:col-span-6 bg-red-800 rounded-lg shadow-sm p-4 flex flex-col`}
                >
                    <h3 className="text-sm font-medium uppercase tracking-wider text-center mb-4 text-white">
                        Aid Types Stocks
                    </h3>
                    {/* Organization Dropdown */}
                    <div className="mb-4 px-4">
                        <label htmlFor="org-select-b" className="sr-only">
                            Organization:
                        </label>
                        <select
                            id="org-select-b"
                            name="organization"
                            value={selectedOrganization || ""}
                            onChange={(e) =>
                                setSelectedOrganization(e.target.value)
                            }
                            className={`block w-full pl-3 pr-10 py-2 text-sm bg-red-700 border border-red-600 focus:outline-none focus:ring-1 focus:ring-white rounded-md appearance-none text-white`}
                        >
                            <option value="">Select organization</option>
                            {organizationIds.map((orgId) => (
                                <option key={orgId} value={orgId}>
                                    {orgStock[orgId].orgName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedOrgData && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6 px-4 flex-grow text-white">
                            {/* Food */}
                            <div className="flex items-center gap-3">
                                <UtensilsCrossed className="w-8 h-8 text-white flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-red-200">
                                        Food:
                                    </div>
                                    <div className="font-medium">
                                        {selectedOrgData.food}
                                    </div>
                                </div>
                            </div>
                            {/* Volunteers */}
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-white flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-red-200">
                                        Volunteers:
                                    </div>
                                    <div className="font-medium">
                                        {selectedOrgData.volunteers}
                                    </div>
                                </div>
                            </div>
                            {/* Clothes */}
                            <div className="flex items-center gap-3">
                                <Shirt className="w-8 h-8 text-white flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-red-200">
                                        Clothes:
                                    </div>
                                    <div className="font-medium">
                                        {selectedOrgData.clothing}
                                    </div>
                                </div>
                            </div>
                            {/* Medicine */}
                            <div className="flex items-center gap-3">
                                <Package className="w-8 h-8 text-white flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-red-200">
                                        Medicine:
                                    </div>
                                    <div className="font-medium">
                                        {selectedOrgData.medicine}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!selectedOrgData && totalStocks && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6 px-4 flex-grow text-white">
                            {/* Total Food */}
                            <div className="flex items-center gap-3">
                                <UtensilsCrossed className="w-8 h-8 text-white flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-red-200">
                                        Total Food:
                                    </div>
                                    <div className="font-medium">
                                        {totalStocks.food}
                                    </div>
                                </div>
                            </div>
                            {/* Total Volunteers */}
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-white flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-red-200">
                                        Total Volunteers:
                                    </div>
                                    <div className="font-medium">
                                        {totalStocks.volunteers}
                                    </div>
                                </div>
                            </div>
                            {/* Total Clothes */}
                            <div className="flex items-center gap-3">
                                <Shirt className="w-8 h-8 text-white flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-red-200">
                                        Total Clothes:
                                    </div>
                                    <div className="font-medium">
                                        {totalStocks.clothing}
                                    </div>
                                </div>
                            </div>
                            {/* Total Medicine */}
                            <div className="flex items-center gap-3">
                                <Package className="w-8 h-8 text-white flex-shrink-0" />
                                <div>
                                    <div className="text-xs text-red-200">
                                        Total Medicine:
                                    </div>
                                    <div className="font-medium">
                                        {totalStocks.medicine}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Average Response Time - Spanning 3 columns */}
                <div
                    className={`md:col-span-6 bg-red-800 rounded-lg shadow-sm p-4 flex flex-col`}
                >
                    <h3 className="text-sm font-medium uppercase tracking-wider text-center mb-4">
                        {" "}
                        Average Response Time{" "}
                    </h3>
                        <div className="space-y-2 px-2 flex-grow flex justify-center">
                            <div className="p-10 text-4xl text-center">{responseTime}</div>
                        </div>
                </div>
            </div>{" "}
        </>
    );
};

export default BotChartRow;
