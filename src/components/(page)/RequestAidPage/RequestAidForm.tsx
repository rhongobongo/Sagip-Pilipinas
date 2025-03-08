"use client";

import { useState } from "react";
import { RequestPin } from "@/types/types";
import { requestAid } from "@/components/map/SubmitAid";
import { uploadImage } from "./uploadImage";

interface RequestFormProps {
    pin: RequestPin | null;
}

const RequestAidForm: React.FC<RequestFormProps> = ({ pin }) => {
    const [name, setName] = useState("");
    const [contactNum, setContactNum] = useState("");
    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");
    const [calamityLevel, setCalamityLevel] = useState("");
    const [calamityType, setCalamityType] = useState("");
    const [shortDesc, setShortDesc] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setImage(selectedFile);

            // Create a preview URL for the image
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("reached");
        if (!pin || !image) return;

        console.log("reached 2");
        const imageURL = await uploadImage(image); 

        Object.assign(pin, {
            name,
            contactNum,
            date,
            location,
            calamityLevel,
            calamityType,
            shortDesc,
            imageURL,
        });

        await requestAid(pin);
    };


    return (
        <form onSubmit={handleSubmit} className="text-white font-sans">
            <div className="flex justify-center items-center w-full gap-20">
                <div className="ml-5 grid gap-2 w-1/3">
                    <div className="flex items-center">
                        <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
                            Name:
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-2xl bg-red-700"
                        />
                    </div>
                    <div className="flex items-center">
                        <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
                            Date:
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2 border rounded-2xl bg-red-700"
                        />
                    </div>
                    <div className="flex items-center">
                        <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
                            Location:
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-4 py-2 border rounded-2xl bg-red-700"
                        />
                    </div>
                </div>
                <div className="grid gap-2 w-1/3">
                    <div className="flex items-center">
                        <label className="w-24 text-right mr-2 whitespace-nowrap text-black -translate-x-5">
                            Contact Number:
                        </label>
                        <input
                            type="text"
                            value={contactNum}
                            onChange={(e) => setContactNum(e.target.value)}
                            className="w-full px-4 py-2 border rounded-2xl bg-red-700"
                        />
                    </div>
                    <div className="flex items-center">
                        <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
                            Calamity Type:
                        </label>
                        <select
                            value={calamityType}
                            onChange={(e) => setCalamityType(e.target.value)}
                            className="w-full px-4 py-2 border rounded-2xl bg-red-700"
                        >
                            <option value="">Select Type</option>
                            <option value="flood">Flood</option>
                            <option value="earthquake">Earthquake</option>
                            <option value="fire">Fire</option>
                            <option value="typhoon">Typhoon</option>
                            <option value="landslide">Landslide</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
                            Calamity Level:
                        </label>
                        <select
                            value={calamityLevel}
                            onChange={(e) => setCalamityLevel(e.target.value)}
                            className="w-full px-4 py-2 border rounded-2xl bg-red-700"
                        >
                            <option value="">Select Level</option>
                            <option value="1">Level 1 - Minor</option>
                            <option value="2">Level 2 - Moderate</option>
                            <option value="3">Level 3 - Major</option>
                            <option value="4">Level 4 - Severe</option>
                            <option value="5">Level 5 - Catastrophic</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center mt-3 w-full pl-2">
                <label className="w-24 text-right whitespace-nowrap text-black -translate-x-10">
                    Short Description:
                </label>
                <textarea
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    className="px-4 py-2 border rounded-2xl w-4/6 bg-red-700 h-36 resize-none"
                />
            </div>

            {/* Image Upload Section */}
            <div className="flex justify-center items-center mt-5 w-full pl-2">
                <label className="w-24 text-right whitespace-nowrap text-black -translate-x-10">
                    Attach Image:
                </label>
                <div className="w-4/6 flex flex-col">
                    <div className="flex items-center">
                        <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="image-upload"
                            className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 cursor-pointer inline-block"
                        >
                            Choose Image
                        </label>
                        {image && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="ml-3 text-black hover:text-red-700"
                            >
                                Remove
                            </button>
                        )}
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="mt-3 border rounded-lg p-2 bg-gray-100">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-40 max-w-full object-contain"
                            />
                            <p className="text-black text-sm mt-1">{image?.name}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-10 flex justify-end pb-8">
                <button
                    type="submit"
                    className="bg-red-700 text-white px-8 py-2 rounded-md hover:bg-red-800 mr-36"
                >
                    Send Request
                </button>
            </div>
        </form>
    );
};

export default RequestAidForm;