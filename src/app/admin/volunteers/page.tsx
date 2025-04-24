'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/Firebase/Firebase';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    deleteDoc,
    DocumentData,
    FirestoreError
} from 'firebase/firestore';

const NavTab: React.FC<{ label: string; href: string; active?: boolean }> = ({ label, href, active = false }) => {
    const baseClasses = "py-1.5 px-6 text-sm font-bold rounded-full transition-all duration-200";
    const activeClasses = "bg-white text-red-800 shadow-sm";
    const inactiveClasses = "text-white hover:bg-red-700";
    return (
        <a href={href} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            {label}
        </a>
    );
};

type Volunteer = {
    id: string;
    fullName: string;
    contactNumber: string;
    organizationName: string;
    address: string;
    email: string;
};

type OrganizationLookup = {
    [id: string]: string;
};

const VolunteersPage: React.FC = () => {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVolunteersAndOrgs = useCallback(async () => {
        if (!db) {
            setError("Firestore is not available. Check Firebase configuration.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const orgsCol = collection(db, 'organizations');
            const orgSnapshot = await getDocs(orgsCol);
            const organizationMap: OrganizationLookup = {};
            orgSnapshot.forEach(doc => {
                const data = doc.data();
                organizationMap[doc.id] = data.name ?? 'Unknown Organization';
            });

            const volunteersCol = collection(db, 'volunteers');
            const volunteerSnapshot = await getDocs(volunteersCol);

            const volunteerList = volunteerSnapshot.docs.map(doc => {
                const data = doc.data() as DocumentData;
                const orgId = data.organizationId ?? null;

                const firstName = data.firstName ?? '';
                const middleName = data.middleName ?? '';
                const surname = data.surname ?? '';
                const fullName = [firstName, middleName, surname].filter(name => name && name.trim() !== '').join(' ');

                return {
                    id: doc.id,
                    fullName: fullName || 'N/A',
                    contactNumber: data.contactNumber ?? 'N/A',
                    organizationName: orgId ? (organizationMap[orgId] ?? 'Org Not Found') : 'N/A',
                    address: data.address ?? 'N/A',
                    email: data.email ?? 'N/A',
                };
            });

            setVolunteers(volunteerList);

        } catch (err: FirestoreError | unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to load data: ${errorMessage}`);
            console.error("Error fetching data:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVolunteersAndOrgs();
    }, [fetchVolunteersAndOrgs]);

    const handleDeactivateClick = async (volunteerId: string, volunteerName: string) => {
         if (!db) {
            alert("Firestore is not available. Check Firebase configuration.");
            return;
        }
        console.log(`Attempting to deactivate volunteer: ${volunteerName} (ID: ${volunteerId})`);

        if (window.confirm(`Are you sure you want to deactivate the volunteer "${volunteerName}" (ID: ${volunteerId})? This action might delete the record.`)) {
            try {
                const volunteerDocRef = doc(db, 'volunteers', volunteerId);
                await deleteDoc(volunteerDocRef);

                setVolunteers(prevVolunteers => prevVolunteers.filter(vol => vol.id !== volunteerId));
                alert(`Volunteer "${volunteerName}" deactivated successfully.`);
                console.log(`Volunteer "${volunteerName}" deactivated.`);

            } catch (err: FirestoreError | unknown) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                alert(`Failed to deactivate volunteer: ${errorMessage}`);
                console.error(`Failed to deactivate volunteer ${volunteerId}:`, err);
            }
        } else {
            console.log("Volunteer deactivation cancelled by user.");
        }
    };

    return (
        <div className="w-full min-h-screen p-4 font-inter bg-gray-50">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                html { scroll-behavior: smooth; }
            `}</style>

            <div className={'bg-red-800 p-6 rounded-lg mb-6 text-white shadow relative overflow-hidden'}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-700 opacity-30 transform translate-x-1/4 -translate-y-1/4" aria-hidden="true"></div>
                <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-red-600 opacity-20" aria-hidden="true"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Hello Admin!</h1>
                    <p className="text-base text-gray-200 font-medium mb-4 text-center md:text-left">
                        Manage and review volunteer profiles and activities on the platform.
                    </p>
                    <div className="flex flex-wrap justify-center items-center mt-4 space-x-2 sm:space-x-4">
                        <NavTab label="Review Requests" href="/admin/review-requests" />
                        <NavTab label="Dashboard" href="/admin/analytics" />
                        <NavTab label="News Articles" href="/admin/news" />
                        <NavTab label="Organizations" href="/admin/organizations" />
                        <NavTab label="Volunteers" href="/admin/volunteers" active={true} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Volunteer Management</h2>
                </div>

                <div className="overflow-x-auto rounded-md border border-red-300">
                    <table className="w-full min-w-[900px] table-auto border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-center text-xs font-bold text-red-600 uppercase tracking-wider border-b border-r border-red-200 w-[5%]">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-red-200 w-[20%]">Full Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-red-200 w-[15%]">Contact #</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-red-200 w-[20%]">Partnered Org.</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-red-200 w-[15%]">Address</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-red-200 w-[15%]">Email</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-red-200 w-[10%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-red-200">
                            {isLoading ? (
                                <tr key="loading">
                                    <td colSpan={7} className="text-center py-10 px-4 text-gray-500">Loading volunteers...</td>
                                </tr>
                            ) : error ? (
                                <tr key="error">
                                    <td colSpan={7} className="text-center py-10 px-4 text-red-600 border border-red-200 bg-red-50">
                                        <p className="font-semibold">Error Loading Volunteers</p>
                                        <p>{error}</p>
                                    </td>
                                </tr>
                            ) : volunteers.length > 0 ? (
                                volunteers.map((volunteer, index) => (
                                    <tr key={volunteer.id} className="hover:bg-red-50 transition-colors duration-150 ease-in-out">
                                        <td className="px-4 py-2 text-sm font-bold text-red-600 text-center border-r border-red-200">{index + 1}</td>
                                        <td className="px-4 py-2 text-sm text-gray-800 font-medium border-r border-red-200">{volunteer.fullName}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap border-r border-red-200">{volunteer.contactNumber}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600 border-r border-red-200">{volunteer.organizationName}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600 border-r border-red-200">{volunteer.address}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600 border-r border-red-200">{volunteer.email}</td>
                                        <td className="px-4 py-2 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => handleDeactivateClick(volunteer.id, volunteer.fullName)}
                                                className="text-xs font-bold py-1 px-4 rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75 bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                                                aria-label={`Deactivate ${volunteer.fullName}`}
                                            >
                                                Deactivate
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr key="no-items">
                                    <td colSpan={7} className="text-center py-10 px-4 text-gray-500">No volunteers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VolunteersPage;
