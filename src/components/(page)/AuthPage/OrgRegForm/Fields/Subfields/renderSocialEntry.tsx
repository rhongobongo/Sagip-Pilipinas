"use client";

import { useOrgRegForm } from "../../OrgRegFormContext";
import { CiCirclePlus } from "react-icons/ci";
import { SocialLinks } from "../../types";

// Renamed to uppercase to follow React component naming convention
const SocialEntry = ({
    platform,
    IconComponent,
    platformName
}: {
    platform: keyof SocialLinks;
    IconComponent: React.ElementType;
    platformName: string;
}) => {
    const {
        socialLinks,
        setSocialLinks,
        editValues,
        setEditValues,
        setError,
    } = useOrgRegForm();

    const { username, link, mode } = socialLinks[platform];
    const isCurrentlyEditing = editValues.platform === platform;

    /** Handles when a user clicks "Add Link" */
    const handleAddClick = () => {
        setEditValues({ platform, username: "", link: "" });
        setSocialLinks(prev => ({
            ...prev,
            [platform]: { username: "", link: "", mode: "adding" },
        }));
    };

    /** Handles when a user clicks "Edit" */
    const handleEditClick = () => {
        setEditValues({ platform, username, link });
        setSocialLinks(prev => ({
            ...prev,
            [platform]: { ...prev[platform], mode: "editing" },
        }));
    };

    /** Handles input change when editing */
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditValues(prev => ({ ...prev, [name]: value }));
    };

    /** Handles deleting a social link */
    const handleDeleteClick = () => {
        setSocialLinks(prev => ({
            ...prev,
            [platform]: { username: "", link: "", mode: "initial" }, // Reset dynamically
        }));
        if (editValues.platform === platform) {
            setEditValues({ platform: null, username: "", link: "" });
        }
    };

    /** Handles canceling an edit */
    const handleCancel = () => {
        setSocialLinks(prev => ({
            ...prev,
            [platform]: { ...prev[platform], mode: username ? "added" : "initial" },
        }));
        setEditValues({ platform: null, username: "", link: "" });
    };

    /** Handles saving a social link */
    const handleSave = () => {
        if (!editValues.username.trim()) {
            setError("Username cannot be empty.");
            return;
        }
        setSocialLinks(prev => ({
            ...prev,
            [platform]: {
                username: editValues.username,
                link: editValues.link,
                mode: "added",
            },
        }));
        setEditValues({ platform: null, username: "", link: "" });
    };

    switch (mode) {
        case "adding":
        case "editing":
            return (
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <h2 className="flex items-center gap-1 font-semibold">
                        <IconComponent className="text-2xl" /> {platformName}
                    </h2>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={isCurrentlyEditing ? editValues.username : ""}
                        onChange={handleEditInputChange}
                        className="textbox w-full p-2 border rounded placeholder:text-gray-300"
                        required
                    />
                    <input
                        type="text"
                        name="link"
                        placeholder="Profile Link (Optional)"
                        value={isCurrentlyEditing ? editValues.link : ""}
                        onChange={handleEditInputChange}
                        className="textbox w-full p-2 border rounded placeholder:text-gray-300"
                    />
                    <div className="flex gap-2 mt-1">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            );
        case "added":
            return (
                <div className="flex flex-col gap-1 items-start">
                    <h2 className="flex items-center gap-1 font-semibold">
                        <IconComponent className="text-2xl" />
                        {link ? (
                            <a
                                href={link.startsWith("http") ? link : `https://${link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                title={link}
                            >
                                {username}
                            </a>
                        ) : (
                            <span>{username}</span>
                        )}
                    </h2>
                    <div className="flex gap-2 mt-1">
                        <button
                            type="button"
                            onClick={handleEditClick}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            );
        case "initial":
        default:
            return (
                <div>
                    <h1 className="flex items-center gap-1">
                        <IconComponent className="text-2xl" />
                        <button
                            className="flex items-center gap-1 px-3 py-1 rounded hover:bg-red-200"
                            type="button"
                            onClick={handleAddClick}
                        >
                            <CiCirclePlus /> Add Link
                        </button>
                    </h1>
                </div>
            );
    }
};

export default SocialEntry;