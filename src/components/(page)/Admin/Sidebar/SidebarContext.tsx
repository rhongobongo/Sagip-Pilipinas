"use client"

import { createContext, useContext, useState, useMemo, ReactNode } from "react";

interface SidebarContextType {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}

export function SidebarProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [isOpen, setIsOpen] = useState(true);
    const toggleSidebar = () => setIsOpen((prev) => !prev);

    const contextValue = useMemo(() => ({ isOpen, toggleSidebar }), [isOpen]);

    return (
        <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>
    );
}
