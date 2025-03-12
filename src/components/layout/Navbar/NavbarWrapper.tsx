"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const HIDDEN_NAVBAR_PATHS = ["/admin"];

const NavbarWrapper = () => {
    const pathname = usePathname();
    return HIDDEN_NAVBAR_PATHS.includes(pathname) ? null : <Navbar />;
};

export default NavbarWrapper;
