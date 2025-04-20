import NavTab from "./Navtab";

const AdminNavbar = () => {
    return (
        <div className="bg-red-800 p-6 rounded-lg mb-6 text-white shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-700 opacity-30 transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-red-600 opacity-20"></div>
            <h1 className="text-3xl font-bold mb-2 relative z-10">
                Hello Admin!
            </h1>
            <p className="text-sm text-gray-200 font-medium relative z-10 mb-4 text-center">
                {" "}
                {/* Centered text */}
                Track real-time insights and performance metrics to make
                informed decisions. Explore user activity, disaster reports, and
                aid distribution data all in one place.
            </p>
            <div className="flex flex-wrap justify-between mt-2 relative z-10">
                <NavTab label="Review Requests" href="/admin/review-requests" />
                <NavTab label="Analytics" href="/admin/analytics"/>
                <NavTab label="Deployed Aid" href="/admin/deployed" />
                <NavTab label="Donations" href="/admin/donations" />
                <NavTab label="News Articles" href="/admin/news" />
                <NavTab label="Organizations" href="/admin/organizations" />
                <NavTab label="Resources" href="/admin/resources" />
                <NavTab label="Volunteers" href="/admin/volunteers" />
            </div>
        </div>
    );
};

export default AdminNavbar;
