import Link from "next/link";

const AdminHeader: React.FC = () => {
    return (
        <div className="p-4 bg-[#B0022A] shadow-[inset_0_-1px_0_0_rgba(169,169,169,.5)] sticky">
            <div className="max-w-6xl mx-auto flex justify-between items-center">

                <div className="flex items-center space-x-3">
                    <img src="/SGP_LOGO.svg" alt="Logo" className="h-10 w-10 object-contain" />
                    <Link href="/" className="font-bold text-lg text-white">
                        SAGIP PILIPINAS: HELP THOSE IN NEED!
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;
