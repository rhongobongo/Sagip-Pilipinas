"use client";

import { useState } from "react";
import { db, collection, addDoc } from "@/lib/Firebase/Firebase";
import RequestMap from "@/components/map/RequestAidMapWrapper";

const RequestAidPage: React.FC = () => {

      /*const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!aidType && !disaster) {
            alert("Please select Disaster and Aid type.");
            return;
        }
        else if (!aidType) {
            alert("Please select Aid type.");
            return;
        }
        else if (!disaster) {
            alert("Please select Disaster type.");
            return;
        }

        try {
            const docRef = await addDoc(collection(db, "aid_requests"), {
                name: formData.name,
                contact: formData.contact,
                disaster,
                aidType,
                timestamp: new Date(),
            });
            alert("Aid Request Submitted! Request ID: " + docRef.id);
        } catch (error) {
            console.error("Error submitting request:", error);
        }
      };*/

    return (
        <>
            <div>Request Aid Page</div>
            <RequestMap></RequestMap>
        </>
    )
};

export default RequestAidPage;