import Link from "next/link";

const Sidebar = () => {
    const navItems = [
        { name: "Dashboar / Analytics", path: "/admin" },
        { name: "Donations", path: "/admin/donations" },
        { name: "News Articles", path: "/admin/cms" },
        { name: "Organizations", path: "/admin/organizations" },
        { name: "Resources", path: "/admin/resources" },
        { name: "Review Aid Request", path: "/admin/aid-requests" },
        { name: "Track Deployed Aid", path: "/admin/deployed-aid" },
        { name: "Volunteers", path: "/admin/volunteers" },
    ];

    return (
        <div className="bg-red-700 h-[93vh] text-white w-64 p-4">
            <nav>
                <ul className="space-y-4">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                href={item.path}
                                className="block p-2 rounded hover:bg-gray-700"
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
