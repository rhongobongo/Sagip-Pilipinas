"use client";

import React, { useState } from "react";
import DonationMapWrapper from "@/components/map/DonationMapWrapper";
import DonationPageForm from "@/components/(page)/donationPage/donationPageForm";
import { RequestPin } from "@/types/types";
import { OrganizationData } from "@/app/(public)/donation/page";

interface DonationSectionClientProps {
    aidRequests: RequestPin[];
    organizationData: OrganizationData | null;
}

const DonationPageClient: React.FC<DonationSectionClientProps> = ({
    aidRequests,
    organizationData,
}) => {
    const [selectedPin, setSelectedPin] = useState<RequestPin | null>(null);

    const handlePinSelect = (pinData: RequestPin) => {
        setSelectedPin(pinData);
    };

    return (
        <div className="flex flex-col">
            <div>
                <DonationMapWrapper
                    initialPins={aidRequests}
                    onPinSelect={handlePinSelect}
                />
            </div>
            <div>
                <DonationPageForm
                    fetchedOrgData={organizationData}
                    selectedPin={selectedPin}
                />
            </div>
        </div>
    );
};

export default DonationPageClient;
