'use client';

import { useState, useEffect, FormEvent } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/Firebase/Firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { updateVolunteerProfile } from '@/app/(public)/editVolprofile/editVolprofile'; // Update this path as needed

export default function VolunteerProfileUpdate() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [updateMessage, setUpdateMessage] = useState({ type: '', message: '' });
  const router = useRouter();
  
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Get volunteer profile data
        try {
          const volunteerDoc = await getDoc(doc(db, 'volunteers', currentUser.uid));
          
          if (volunteerDoc.exists()) {
            const data = volunteerDoc.data();
            setProfileData(data);
            if (data.profileImageUrl) {
              setImagePreview(data.profileImageUrl);
            }
          } else {
            // Redirect if not a volunteer
            setUpdateMessage({ 
              type: 'error', 
              message: 'Volunteer profile not found'
            });
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
        
        setLoading(false);
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    });
    
    return () => unsubscribe();
  }, [router]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdateMessage({ type: '', message: '' });
    
    if (!user) {
      return;
    }
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      // Client-side validation
      if (!formData.get('name') || !formData.get('contactNumber') || !formData.get('username')) {
        setUpdateMessage({ type: 'error', message: 'Please fill out all required fields' });
        return;
      }
      
      // Call the server action to update profile
      const result = await updateVolunteerProfile(formData, user.uid, imageFile || undefined);
      
      setUpdateMessage({ 
        type: result.success ? 'success' : 'error', 
        message: result.message 
      });
      
      if (result.success) {
        // Update local state to reflect changes
        setProfileData({
          ...profileData,
          name: formData.get('name'),
          contactNumber: formData.get('contactNumber'),
          username: formData.get('username'),
          description: formData.get('description'),
          skills: formData.get('skills'),
          availability: formData.get('availability')
        });
        
        // Reset image file state after successful update
        setImageFile(null);
      }
    } catch (error) {
      console.error('Error in profile update:', error);
      setUpdateMessage({ type: 'error', message: 'An unexpected error occurred' });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
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
          {/* Profile Image Section */}
          <div className="w-full md:w-1/3">
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-4 rounded-full overflow-hidden">
                {imagePreview ? (
                  <Image 
                    src={imagePreview} 
                    alt="Profile Preview" 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>
              
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                Change Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
          
          {/* Profile Details Section */}
          <div className="w-full md:w-2/3 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name*
              </label>
              <input
                type="text"
                name="name"
                defaultValue={profileData?.name || ''}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (Cannot be changed)
              </label>
              <input
                type="email"
                defaultValue={profileData?.email || ''}
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username*
              </label>
              <input
                type="text"
                name="username"
                defaultValue={profileData?.username || ''}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number*
              </label>
              <input
                type="tel"
                name="contactNumber"
                defaultValue={profileData?.contactNumber || ''}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Additional Information Section */}
        <div className="border-t pt-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Me
              </label>
              <textarea
                name="description"
                rows={4}
                defaultValue={profileData?.description || ''}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="Tell us a bit about yourself, your background, interests, and why you volunteer..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <textarea
                name="skills"
                rows={3}
                defaultValue={profileData?.skills || ''}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="List your skills, separated by commas (e.g., First Aid, Marketing, Teaching, Photography)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <textarea
                name="availability"
                rows={2}
                defaultValue={profileData?.availability || ''}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="When are you typically available to volunteer? (e.g., Weekends, Evenings, Mondays and Wednesdays)"
              />
            </div>
          </div>
        </div>
        
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