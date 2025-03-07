"use client";

import { useState } from "react";
import { db, collection, addDoc } from "@/lib/Firebase/Firebase";
import RequestMap from "@/components/map/RequestAidMapWrapper";

const RequestAidPage: React.FC = () => {

    return (
        <>
            <div>RequestAidPage</div>
            <RequestMap></RequestMap>
        </>
    )
};

export default RequestAidPage;