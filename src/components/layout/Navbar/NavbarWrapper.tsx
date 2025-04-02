import { headers } from "next/headers";
import Navbar from "./Navbar";

const NavbarWrapper = async () => {
    const headersList = await headers();
    const currentPath = headersList.get("x-pathname") ?? "/";

    if (currentPath.startsWith(`/admin`)) {
        return null;
    }

    return <Navbar />;
};

export default NavbarWrapper;
