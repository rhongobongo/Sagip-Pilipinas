'use client';

import { useState, FormEvent, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { VolunteerProfileContext } from './VolunteerProfileContext';
import { updateVolunteerProfile } from '@/lib/APICalls/Volunteer/editVolunteerProfile';

import VolunteerProfileImage from '@/components/(page)/EditProfilePage/Volunteer/VolunteerProfileImage';
import VolunteerProfileDetails from '@/components/(page)/EditProfilePage/Volunteer/VolunteerProfileDetails';
import VolunteerAdditionalInfo from '@/components/(page)/EditProfilePage/Volunteer/VolunteerAdditionalInfo';

export default function VolunteerProfileUpdate() {
    const router = useRouter();
    const context = useContext(VolunteerProfileContext);

    if (!context) {
        return <p className="text-center text-gray-500">Loading profile...</p>;
    }

    const { profileData, setProfileData } = context;
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [updateMessage, setUpdateMessage] = useState({ type: '', message: '' });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdateMessage({ type: '', message: '' });

        const formData = new FormData(e.currentTarget);

        try {
            if (!formData.get('name') || !formData.get('contactNumber') || !formData.get('username')) {
                setUpdateMessage({ type: 'error', message: 'Please fill out all required fields' });
                return;
            }

            const result = await updateVolunteerProfile(formData, profileData.userId, imageFile || undefined);

            setUpdateMessage({
                type: result.success ? 'success' : 'error',
                message: result.message
            });

            if (result.success) {
                setProfileData({
                    ...profileData,
                    name: formData.get('name') as string,
                    contactNumber: formData.get('contactNumber') as string,
                    username: formData.get('username') as string,
                    description: formData.get('description') as string,
                    skills: formData.get('skills') as string,
                    availability: formData.get('availability') as string
                });

                setImageFile(null);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setUpdateMessage({ type: 'error', message: 'An unexpected error occurred' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6">Update Your Profile</h1>

            {updateMessage.message && (
                <div className={`p-4 mb-6 rounded ${updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {updateMessage.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8">
                    <VolunteerProfileImage/>
                    <VolunteerProfileDetails />
                </div>

                <VolunteerAdditionalInfo />

                <div className="flex justify-end space-x-4 pt-6">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
