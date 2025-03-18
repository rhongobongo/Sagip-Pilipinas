"use client";

import { useSidebar } from "./SidebarContext";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
    icon: React.ReactNode;
    text: string;
    path: string;
}

export default function SidebarItem({ icon, text, path }: Readonly<SidebarItemProps>) {
    const { isOpen } = useSidebar();
    const pathname = usePathname();
    const isActive = pathname === path;

    return (
        <li
            className={`group relative flex items-center py-2 px-3 rounded-md transition-all cursor-pointer
            ${isActive ? "bg-gray-900" : "hover:bg-gray-800"}`}
        >
            {icon}
            <span className={`ml-3 transition-all whitespace-nowrap 
                ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"}`}>
                {text}
            </span>

            {!isOpen && (
                <div
                    className="absolute left-full ml-3 bg-gray-900 text-white text-sm rounded-md px-2 py-1 
                    opacity-0 transition-opacity group-hover:opacity-100"
                >
                    {text}
                </div>
            )}
        </li>
    );
}
