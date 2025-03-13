import Sidebar from "@/components/(page)/Admin/Sidebar";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="min-h-[93vh] bg-red-700 text-white">
            <div className="container mx-auto flex min-h-[93vh]">
                <Sidebar />
                <div className="flex-1 overflow-auto bg-white">{children}</div>
            </div>
        </div>
    );
}
