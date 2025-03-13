"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import AdminHeader from "@/components/(page)/Admin/AdminHeader";

const ADMIN_NAVBAR_PATHS = ["/admin"];

const NavbarWrapper = () => {
    const pathname = usePathname();

    if (pathname.startsWith("/admin")) {
        return <AdminHeader />;
    }

    return <Navbar />;
}

export default NavbarWrapper;
