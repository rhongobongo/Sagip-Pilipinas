"use client";
import { useContext } from "react";
import { OrgRegFormContext } from "./OrgRegFormContext";
import preview from "../../../../../public/PreviewPhoto.svg";
import Image from "next/image";
import imageCompression from "browser-image-compression"; // Make sure to import this

const OrgRegFormImage = () => {
    const context = useContext(OrgRegFormContext);
    if (!context) {
        return <div>LOADING...</div>;
    }

    const { imagePreview, setImagePreview, setImage } = context;

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        /* Original Compression & preview logic */
        if (e.target.files?.[0]) {
            const o = e.target.files[0];
            console.log(`Original file size: ${o.size / 1024 / 1024} MB`);
            const p = {
                maxSizeMB: 0.3,
                maxWidthOrHeight: 1024,
                useWebWorker: !0,
            };
            try {
                console.log("Compressing image...");
                const s = await imageCompression(o, p);
                console.log(`Compressed file size: ${s.size / 1024 / 1024} MB`);
                const r = new FileReader();
                r.onload = (t) => {
                    setImagePreview((t.target?.result as string) ?? null);
                    setImage(s);
                };
                r.readAsDataURL(s);
            } catch (s) {
                console.error("Error during image compression:", s);
                const r = new FileReader();
                r.onload = (t) => {
                    setImagePreview((t.target?.result as string) ?? null);
                    setImage(o);
                };
                r.readAsDataURL(o);
            }
            e.target.value = "";
        }
    };

    return (
        <div className="flex justify-center mt-5 w-full lg:w-1/4 flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center border border-gray-400">
                {!imagePreview && (
                    <Image
                        src={preview}
                        alt="Placeholder"
                        layout="fill"
                        objectFit="cover"
                    />
                )}
                {imagePreview && (
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                )}
                <input
                    type="file"
                    id="image-upload"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
            </div>
            <label
                htmlFor="image-upload"
                className="mt-2 text-black text-center cursor-pointer text-sm hover:underline"
            >
                Upload Photo Here
            </label>
            {imagePreview && (
                <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="mt-1 text-red-600 hover:text-red-800 text-sm"
                >
                    Delete Photo
                </button>
            )}
        </div>
    );
};

export default OrgRegFormImage;
