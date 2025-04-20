const NavTab: React.FC<{ label: string; href: string; active?: boolean }> = ({
    label,
    href,
    active = false,
}) => {
    const baseClasses =
        "py-1 px-3 text-sm font-medium rounded-full transition-all duration-200";
    const activeClasses = "bg-white text-red-800";
    const inactiveClasses = "text-white hover:bg-red-700";
    return (
        <a
            href={href}
            className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
        >
            {" "}
            {label}{" "}
        </a>
    );
};

export default NavTab;
