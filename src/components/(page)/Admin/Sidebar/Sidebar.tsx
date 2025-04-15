"use client"

import { SidebarProvider, useSidebar } from "./SidebarContext";
import SidebarItem from "./SidebarItem";
import {
    ChevronFirst, ChevronLast, Home, Heart, Newspaper,
    Building, Book, ClipboardList, Send, Users
} from "lucide-react";


const navItems = [
    { name: "Dashboard", path: "/admin", icon: <Home size={20} /> },
    { name: "Donations", path: "/admin/donations", icon: <Heart size={20} /> },
    { name: "News", path: "/admin/cms", icon: <Newspaper size={20} /> },
    { name: "Organizations", path: "/admin/organizations", icon: <Building size={20} /> },
    { name: "Resources", path: "/admin/resources", icon: <Book size={20} /> },
    { name: "Review Requests", path: "/admin/review-requests", icon: <ClipboardList size={20} /> },
    { name: "Track Aid", path: "/admin/deployed-aid", icon: <Send size={20} /> },
    { name: "Analytics", path: "/admin/analytics", icon: <Users size={20} /> },
];

export default function Sidebar() {
    return (
        <SidebarProvider>
            <SidebarContent />
        </SidebarProvider>
    );
}

function SidebarContent() {
    const { isOpen, toggleSidebar } = useSidebar();

    return (
        <aside
            className={`left-0 h-100 bg-red-700 text-white
            transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}
        >
            <nav className="h-full flex flex-col">
                <div className="p-4 flex items-center justify-between">
                    <button onClick={toggleSidebar} className="bg-gray-800 p-2 rounded-full">
                        {isOpen ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
                    </button>
                </div>

                <ul className="flex-1 px-3 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <SidebarItem key={item.path} icon={item.icon} text={item.name} path={item.path} />
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
