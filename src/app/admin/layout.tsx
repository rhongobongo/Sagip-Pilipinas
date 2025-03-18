import AdminHeader from "@/components/(page)/Admin/AdminHeader";
import Sidebar from "@/components/(page)/Admin/Sidebar/Sidebar";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <AdminHeader />

            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 transition-all sticky">
                    <div className="max-w-screen-xl mx-auto bg-white p-6 shadow-md rounded-lg">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
