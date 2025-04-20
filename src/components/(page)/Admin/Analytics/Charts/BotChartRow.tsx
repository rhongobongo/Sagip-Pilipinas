"use client"

import { useState } from "react";
import { Shirt, Users, UtensilsCrossed, Package } from "lucide-react";

const BotChartRow = () => {
    const [selectedOrganization, setSelectedOrganization] = useState(
        "Select organization"
    );

    const analyticsData = {
        averageRequests: {
            weekly: 7.86,
            monthly: 11.5,
            yearly: 52.33,
            weeklyTrend: "down",
            monthlyTrend: "up",
            yearlyTrend: "up",
        },
        totalOrganizations: 22,
        totalVolunteers: 538,
        completedOperations: 241,
        disasterTypes: [
            { name: "Flood", percentage: 18, icon: "🌊", rank: 2 },
            { name: "Earthquake", percentage: 25, icon: "🏚️", rank: 1 },
            { name: "Typhoon", percentage: 17, icon: "🌀", rank: 3 },
            { name: "Fire", percentage: 23, icon: "🔥", rank: 6 },
            { name: "Landslide", percentage: 14, icon: "⛰️", rank: 5 },
            { name: "Other", percentage: 10, icon: "❓", rank: 4 },
        ],

        disasterTraffic: {
            regions: [
                "Manila",
                "Cebu",
                "Davao",
                "Vigan",
                "Quezon",
                "Batangas",
                "Laoag",
            ],
            values: [16.6, 8.7, 16.9, 3.3, 13.1, 21.1, 22.3],
        },
        aidTypesStocks: {
            food: "10,500 packs",
            clothes: "2,550 pairs",
            volunteers: "220 people",
            medicine: "1,720",
        },
        operationSuccessRate: "92%",
        engagements: "12,256",
        averageResponseTime: {
            earthquake: "1 hour",
            fire: "20 minutes",
            flood: "35 minutes",
            landslide: "45 minutes",
            other: "1.5 hours",
            typhoon: "3 hours",
        },
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-white">
                {" "}
                {/* Changed grid definition, added text-white */}
                {/* Aid Types Stocks - Spanning 6 columns */}
                <div
                    className={`md:col-span-6 bg-red-800 rounded-lg shadow-sm p-4 flex flex-col`}
                >
                    <h3 className="text-sm font-medium uppercase tracking-wider text-center mb-4">
                        {" "}
                        Aid Types Stocks{" "}
                    </h3>
                    {/* Organization Dropdown - Styled */}
                    <div className="mb-4 px-4">
                        <label htmlFor="org-select-b" className="sr-only">
                            Organization:
                        </label>{" "}
                        {/* Screen reader only label */}
                        <select
                            id="org-select-b"
                            name="organization"
                            value={selectedOrganization}
                            onChange={(e) =>
                                setSelectedOrganization(e.target.value)
                            }
                            // Custom styling for dropdown to match dark theme
                            className={`block w-full pl-3 pr-10 py-2 text-sm bg-red-700 border border-red-600 focus:outline-none focus:ring-1 focus:ring-white focus:border-white rounded-md appearance-none`} // Added appearance-none, check browser compatibility or add custom arrow
                        >
                            <option>Select organization</option>
                            <option>Red Cross Cebu</option>
                            <option>DSWD Region 7</option>
                            <option>Local LGU</option>
                        </select>
                        {/* Consider adding a custom arrow overlay for the select if appearance-none removes it */}
                    </div>
                    {/* Stock Items Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 px-4 flex-grow">
                        {/* Food */}
                        <div className="flex items-center gap-3">
                            <UtensilsCrossed className="w-8 h-8 text-white flex-shrink-0" />
                            <div>
                                <div className="text-xs text-red-200">
                                    Food:
                                </div>
                                <div className="font-medium">
                                    {analyticsData.aidTypesStocks.food}
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
                                    {analyticsData.aidTypesStocks.volunteers}
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
                                    {analyticsData.aidTypesStocks.clothes}
                                </div>
                            </div>
                        </div>
                        {/* Medicine */}
                        <div className="flex items-center gap-3">
                            <Package className="w-8 h-8 text-white flex-shrink-0" />{" "}
                            {/* Using Package as placeholder for Medicine */}
                            <div>
                                <div className="text-xs text-red-200">
                                    Medicine:
                                </div>
                                <div className="font-medium">
                                    {analyticsData.aidTypesStocks.medicine}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Average Response Time - Spanning 3 columns */}
                <div
                    className={`md:col-span-6 bg-red-800 rounded-lg shadow-sm p-4 flex flex-col`}
                >
                    <h3 className="text-sm font-medium uppercase tracking-wider text-center mb-4">
                        {" "}
                        Average Response Time{" "}
                    </h3>
                    <div className="space-y-2 px-2 flex-grow">
                        {Object.entries(analyticsData.averageResponseTime).map(
                            ([type, time]) => (
                                <div
                                    key={type}
                                    className="flex justify-between items-center text-sm"
                                >
                                    <div className="capitalize">{type}:</div>
                                    <div className="font-medium">{time}</div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>{" "}
        </>
    );
};

export default BotChartRow;