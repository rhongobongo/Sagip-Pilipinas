import { headers } from "next/headers";
import Navbar from "./Navbar";

const NavbarWrapper = async () => {
    const headersList = await headers();
    const currentPath = headersList.get("x-original-url") ?? "/";

    if (currentPath.startsWith("/admin")) {
        return null;
    }

    return <Navbar />;
};

export default NavbarWrapper;
