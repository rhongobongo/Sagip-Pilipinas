import Link from "next/link";

interface LinkInterface {
    displayName: string;
    href: string;
}

const linksArray: LinkInterface[] = [
    { displayName: "Request Aid", href: "/" },
    { displayName: "Map", href: "/map" },
    { displayName: "Request Aid", href: "/request-aid" },
    { displayName: "Learn More", href: "/learnmore" },
    { displayName: "Sign Up", href: "/sign-up" },
];

const Navbar: React.FC = () => {
    return (
        <nav className="p-4 bg-[#B0022A] shadow-[inset_0_-1px_0_0_rgba(169,169,169,.5)]">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                
                <div className="flex items-center space-x-3">
                    <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
                    <Link href="/" className="font-bold text-lg text-white">
                        SAGIP PILIPINAS: HELP THOSE IN NEED!
                    </Link>
                </div>
                
                <ul className="flex space-x-6">
                    {linksArray.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className="text-white px-1.5 py-0.5 inline-block text-lg font-extralight hover:text-gray-200 duration-300"
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
