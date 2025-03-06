"use client";

import { useState } from "react";
import { db, collection, addDoc } from "@/lib/Firebase/Firebase";
import RequestMap from "@/components/map/RequestAidMapWrapper";

const RequestAidPage: React.FC = () => {

    const [contact, setContact] = useState("");
    const [disaster, setDisaster] = useState("");
    const [aidType, setAidType] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        disaster: "",
        aidType: "",
      });

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "aidType") {
            setAidType(value);
            return;
        }

        if (name === "disaster") {
            setDisaster(value);
            return;
        }

        if (name === "contact") {
            let sanitizedValue = value.replace(/\D/g, "");

            if (sanitizedValue.length > 11) {
                sanitizedValue = sanitizedValue.slice(0, 11);
            }

            setFormData((prev) => ({ ...prev, contact: sanitizedValue }));
            return;
        }

        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
    
      const handleSubmit = async (e: React.FormEvent) => {
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
      };

    return (
        <>
            <div>Request Aid Page</div>
            <RequestMap></RequestMap>
            <div></div>
            <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
            <div>Full Name:</div>
            <input type="text" name="name" required onChange={handleChange} className="inputBox"/>
            <div>Contact Number:</div>
            <input type="text" name="contact" value={formData.contact} placeholder="Enter 11-digit number" required onChange={handleChange} pattern="0[0-9]{10}" maxLength={11} inputMode="numeric" className="inputBox"/>
            <div>Disaster:</div>
            <select name="disaster" onChange={handleChange} className="inputBox" value={disaster}>
                <option value="">-Select Disaster Type-</option> 
                <option value="Fire">Fire</option>
                <option value="Flood">Flood</option>
                <option value="Typhoon">Typhoon</option>
                <option value="Tsunami">Tsunami</option>
                <option value="Landslide">Landslide</option>
                <option value="Earthquakes">Earthquakes</option>
                <option value="Other">Other</option>
            </select>
            {disaster == "Other" && (
                <input name="text" placeholder="Disaster Type" onChange={handleChange} className="inputBox"></input>
            )}
            <div>Aid Needed:</div>
            <select name="aidType" onChange={handleChange} className="inputBox" value={aidType}>
                <option value="">-Select Aid Type-</option> 
                <option value="Food">Food</option>
                <option value="Medical Help">Medical Help</option>
                <option value="Shelter">Shelter</option>
                <option value="Rescue">Rescue</option>
                <option value="Other">Other</option>
            </select>
            {aidType == "Other" && (
                <input name="text" placeholder="Additional Information" onChange={handleChange} className="inputBox"></input>
            )}
            <button
                onClick={handleSubmit}
                >Submit Request
            </button>
            </form>
        </>
    )
};

export default RequestAidPage;