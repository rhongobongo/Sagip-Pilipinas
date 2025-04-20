import AdminHeader from "@/components/(page)/Admin/AdminHeader";
import AdminNavbar from "@/components/(page)/Admin/Navbar/AdminNavbar";

export default function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="min-h-screen w-full h-full font-inter bg-gray-100">
            <AdminHeader />
                <main className="transition-all p-10 sticky max-w-screen-xl mx-auto">
                    
                <AdminNavbar></AdminNavbar>
                    <div className="bg-white shadow-md rounded-lg">
                        {children}
                    </div>
                </main>
        </div>
    );
}
