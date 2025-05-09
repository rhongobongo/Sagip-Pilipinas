'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/Firebase/Firebase';
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    DocumentData,
    FirestoreError
} from 'firebase/firestore';

type Organization = {
    id: string;
    name: string;
    contactNumber: string;
    poc: string;
    location: string;
    dateOfEst: string;
};

const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
           return dateString;
        }
        const [year, month, day] = dateString.split('-');
        return `${parseInt(month)}/${parseInt(day)}/${year}`;
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
    }
};

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

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Confirm Deletion</h3>
                <p className="mb-6 text-gray-700">
                    Are you sure you want to delete the organization &quot;<span className="font-bold">{itemName}</span>&quot;? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        type="button"
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const OrganizationsPage: React.FC = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        const fetchOrganizations = async () => {
            if (!db) {
                 setError("Firestore is not available. Check Firebase configuration.");
                 setIsLoading(false);
                 return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const organizationsCol = collection(db, 'organizations');
                const organizationSnapshot = await getDocs(organizationsCol);
                const orgsList = organizationSnapshot.docs.map(doc => {
                    const data = doc.data() as DocumentData;
                    return {
                        id: doc.id,
                        name: data.name ?? 'N/A',
                        contactNumber: data.contactNumber ?? 'N/A',
                        poc: data.contactPerson ?? 'N/A',
                        location: data.location ?? 'N/A',
                        dateOfEst: formatDate(data.dateOfEstablishment),
                    };
                });
                setOrganizations(orgsList);
            } catch (err: FirestoreError | unknown) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`Failed to load organizations: ${errorMessage}`);
                console.error("Error fetching organizations:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrganizations();
    }, []);

    const initiateDelete = (orgId: string, orgName: string) => {
        if (!db) {
            alert("Firestore is not available. Check Firebase configuration.");
            return;
        }
        setItemToDelete({ id: orgId, name: orgName });
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete || !db) {
            alert("Error: Could not delete. Organization details missing or Firestore not initialized.");
            setIsModalOpen(false);
            setItemToDelete(null);
            return;
        }
        const { id, name } = itemToDelete;

        try {
            const organizationDocRef = doc(db, 'organizations', id);
            await deleteDoc(organizationDocRef);
            setOrganizations(prevOrgs => prevOrgs.filter(org => org.id !== id));
            alert(`Organization "${name}" deleted successfully.`);
        } catch (err: FirestoreError | unknown) {
            console.error(`Error deleting organization ${id}:`, err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            alert(`Failed to delete organization "${name}": ${errorMessage}`);
        } finally {
            setIsModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    return (
        <div className="w-full min-h-screen p-4 font-inter bg-gray-50">
             <style jsx global>{`
                 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                 html { scroll-behavior: smooth; }
                 .custom-red-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                 .custom-red-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                 .custom-red-scrollbar::-webkit-scrollbar-thumb { background: #DC2626; border-radius: 10px; }
                 .custom-red-scrollbar::-webkit-scrollbar-thumb:hover { background: #B91C1C; }
                 .custom-red-scrollbar { scrollbar-width: thin; scrollbar-color: #DC2626 #f1f1f1; }
             `}</style>

            <div className={'bg-red-800 p-6 rounded-lg mb-6 text-white shadow relative overflow-hidden'}>
                 <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-700 opacity-30 transform translate-x-1/4 -translate-y-1/4" aria-hidden="true"></div>
                 <div className="absolute top-10 right-20 w-40 h-40 rounded-full bg-red-600 opacity-20" aria-hidden="true"></div>
                 <div className="relative z-10">
                      <h1 className="text-3xl font-bold mb-2">Hello Admin!</h1>
                      <p className="text-base text-gray-200 font-medium mb-4 text-center md:text-left">
                           Manage and review the organizations registered on the platform. Deactivate inactive organizations.
                      </p>
                      <div className="flex flex-wrap justify-center items-center mt-4 space-x-2 sm:space-x-4">
                           <NavTab label="Review Requests" href="/admin/review-requests" />
                           <NavTab label="Dashboard" href="/admin/analytics" />
                           <NavTab label="News Articles" href="/admin/news" />
                           <NavTab label="Organizations" href="/admin/organizations" active />
                           <NavTab label="Volunteers" href="/admin/volunteers" />
                      </div>
                  </div>
             </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Organization Management</h2>
                </div>

                <div className="overflow-x-auto rounded-md border border-red-300 custom-red-scrollbar">
                    <table className="w-full min-w-[800px] table-auto border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-center text-xs font-bold text-red-600 uppercase tracking-wider border-b border-r border-red-200 w-[5%]">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-red-200 w-[20%]">Organization</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-red-200 w-[15%]">Contact #</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-red-200 w-[15%]">POC</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-red-200 w-[20%]">Location</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-r border-red-200 w-[12%]">Date of Est.</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-red-200 w-[13%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-red-200">
                            {isLoading ? (
                                <tr key="loading"><td colSpan={7} className="text-center py-10 px-4 text-gray-500">Loading organizations...</td></tr>
                            ) : error ? (
                                <tr key="error"><td colSpan={7} className="text-center py-10 px-4 text-red-600 border border-red-200 bg-red-50"><p className="font-semibold">Error Loading Organizations</p><p>{error}</p></td></tr>
                            ) : organizations.length > 0 ? (
                                organizations.map((org, index) => (
                                    <tr key={org.id} className="hover:bg-red-50 transition-colors duration-150 ease-in-out">
                                        <td className="px-4 py-2 text-sm font-bold text-red-600 text-center border-r border-red-200">{index + 1}</td>
                                        <td className="px-4 py-2 text-sm text-gray-800 font-semibold border-r border-red-200">{org.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap border-r border-red-200">{org.contactNumber}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600 border-r border-red-200">{org.poc}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600 border-r border-red-200">{org.location}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap border-r border-red-200">{org.dateOfEst}</td>
                                        <td className="px-4 py-2 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => initiateDelete(org.id, org.name)}
                                                className={`text-xs font-bold py-1 px-4 rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75 bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`}
                                                aria-label={`Delete ${org.name}`}
                                            >
                                                Deactivate
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr key="no-items"><td colSpan={7} className="text-center py-10 px-4 text-gray-500">No organizations found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                itemName={itemToDelete?.name || ''}
            />

        </div>
    );
};

export default OrganizationsPage;
