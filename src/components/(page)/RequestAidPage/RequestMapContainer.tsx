"use client"

import RequestAidMapWrapper from "@/components/map/RequestAidMapWrapper";
import RequestAidForm from "./RequestAidForm";

import { useState } from "react";
import { DefaultPin } from "@/types/types";

const RequestMapContainer = () => {

    const [pin, setPin] = useState<DefaultPin | null>(null);

    return (
        <div className="grid grid-rows-2 grid-cols-1">
            <div>
                <RequestAidMapWrapper pin={pin} setPin={setPin}></RequestAidMapWrapper>
            </div>
            <div>
                <RequestAidForm pin={pin}></RequestAidForm>
            </div>
        </div>
    )
}

export default RequestMapContainer;