'use client';
import { useState, useEffect } from 'react';
import preview from '../../../../public/PreviewPhoto.svg';
import Image from 'next/image';
import { registerVolunteer } from '@/lib/APICalls/Auth/registerAuth';

// Define the Organization interface
interface Organization {
  name: string;
  email: string;
  contactNumber: string;
  type: string;
  description: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const VolRegistrationForm: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    username: '',
    password: '',
    retypePassword: '',
    organization: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  // Fetch organizations on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        // Replace this with your actual API call to fetch organizations
        const response = await fetch('/api/organizations');
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        const data = await response.json();
        setOrganizations(data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setError('Failed to load organizations. Please refresh the page.');
      } finally {
        setIsLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return "Email format is invalid";
    if (!formData.contactNumber.trim()) return "Contact number is required";
    if (!formData.username.trim()) return "Username is required";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.retypePassword) return "Passwords don't match";
    if (!formData.organization) return "Please select an organization";
    return null;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    setError(null);
    setSuccess(null);
  
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
  
    if (!image) {
      setError("Profile image is required.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const formDataObj = new FormData();
      
      // Append all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });
      
      // Append the image with the correct field name to match the API function
      if (image) {
        formDataObj.append("profileImage", image);
      }
      
      // Call the registerVolunteer function
      const response = await registerVolunteer(formDataObj);
  
      if (response && response.success) {
        setSuccess("Registration successful! Redirecting to login page...");
  
        // Reset form
        setFormData({
          name: '',
          email: '',
          contactNumber: '',
          username: '',
          password: '',
          retypePassword: '',
          organization: ''
        });
        setImage(null);
        setImagePreview(null);
  
        setTimeout(() => {
          window.location.href = './login';
        }, 2000);
      } else {
        setError(response?.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error during registration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full text-black">
      <div className="">
        <h1 className="flex items-center justify-center mb-4">
          Help out people in their time of need by registering now! Choose an
          organization that is partnered with SAGIP PILIPINAS and start helping
          as soon as help is needed!
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-start justify-around mt-16">
          <div className="flex justify-center mt-5 w-full pl-2 flex-col items-center">
            {/* Image Upload Section */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
              {!imagePreview && (
                <Image
                  src={preview}
                  alt="Placeholder"
                  layout="fill"
                  objectFit="cover"
                />
              )}
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {!imagePreview && (
              <label
                htmlFor="image-upload"
                className="mt-2 text-black text-center cursor-pointer text-sm"
              >
                Upload Photo Here
              </label>
            )}
            {imagePreview && (
              <div className="mt-2 text-black text-center text-sm">
                Upload Photo Here
              </div>
            )}
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="mt-1 text-black hover:text-red-700 text-sm"
              >
                Delete Photo
              </button>
            )}
          </div>
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center">
              <label className="w-32 text-right mr-2">Name:</label>{' '}
              <input 
                className="textbox w-full" 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />{' '}
            </div>
            <div className="flex items-center">
              <label className="w-32 text-right mr-2">Email:</label>
              <input 
                className="textbox w-full" 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-32 text-right mr-2">Contact #:</label>
              <input 
                className="textbox w-full" 
                type="text" 
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center">
              <label className="w-32 text-right mr-2">Username:</label>
              <input 
                className="textbox w-full" 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-32 text-right mr-2">Password:</label>
              <input 
                className="textbox w-full" 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-32 text-right mr-2">Retype Password:</label>
              <input 
                className="textbox w-full" 
                type="password" 
                name="retypePassword"
                value={formData.retypePassword}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-right mt-8">
          <h1>Organizations: </h1>
          <select
            className="w-1/2 bg-[#ededed] rounded-2xl min-h-8 mt-2"
            name="organization"
            value={formData.organization}
            onChange={handleInputChange}
            required
            disabled={isLoadingOrgs}
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org.userId} value={org.userId}>
                {org.name} - {org.type}
              </option>
            ))}
          </select>
          
          {/* Organizations display section */}
          <div className="w-full mt-8">
            {isLoadingOrgs ? (
              <p className="text-center">Loading organizations...</p>
            ) : organizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizations.map((org) => (
                  <div 
                    key={org.userId}
                    className={`p-4 border rounded-lg hover:shadow-md cursor-pointer transition-all ${
                      formData.organization === org.userId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, organization: org.userId }))}
                  >
                    <div className="flex items-center mb-2">
                      {org.profileImageUrl ? (
                        <img 
                          src={org.profileImageUrl} 
                          alt={org.name} 
                          className="w-12 h-12 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                          {org.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{org.name}</h3>
                        <p className="text-sm text-gray-600">{org.type}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{org.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No organizations are currently available</p>
            )}
          </div>
        </div>
        
        <div className="mt-10 flex justify-end pb-8">
          <button
            type="submit"
            className={`bg-gray-300 text-black font-semibold text-sm px-8 py-2 rounded-md hover:bg-gray-400 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
      
      <div className="flex items-center justify-center">
        <h1>
          Already have an account? Log in{' '}
          <a className="text-blue-800" href="./login">
            here!
          </a>
        </h1>
      </div>
    </div>
  );
};

export default VolRegistrationForm;