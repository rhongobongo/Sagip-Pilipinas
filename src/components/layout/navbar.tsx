import Link from "next/link";

interface LinkInterface {
    displayName: string;
    href: string;
}

const linksArray: LinkInterface[] = [
    { displayName: "Home", href: "/" },
    { displayName: "Map", href: "/map" },
    { displayName: "Request Aid", href: "/request-aid" },
];

const Navbar: React.FC = () => {
    return (
        <nav className="p-4 shadow-[inset_0_-1px_0_0_rgba(169,169,169,.5)]">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link href="/" className="font-bold text-lg">
                    SAGIP PILIPINAS
                </Link>

                <ul className="flex space-x-6">
                    {linksArray.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className="text-[#727272] px-1.5 py-.5  inline-block text-lg font-extralight hover:text-black dark:hover:text-white duration-300"
                            >
                                {link.displayName}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
