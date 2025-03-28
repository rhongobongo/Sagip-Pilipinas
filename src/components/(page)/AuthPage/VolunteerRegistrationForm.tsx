'use client';
import { useState, useEffect } from 'react';
import preview from '../../../../public/PreviewPhoto.svg';
import Image from 'next/image';
import { registerVolunteer } from '@/lib/APICalls/Auth/registerAuth';
import { fetchOrganizations } from '@/lib/APICalls/Organizations/fetchOrganization';
import { FaPeopleGroup } from 'react-icons/fa6';
import { BsTwitterX } from 'react-icons/bs';
import { FaInstagram } from 'react-icons/fa';
import { FaFacebook } from 'react-icons/fa';
import { CiCirclePlus } from 'react-icons/ci';

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
    firstName: '',
    middleName: '',
    surname: '',
    email: '',
    gender: '',
    address: '',
    areaOfOperation: '',
    contactNumber: '',
    dateOfBirth: '',
    acctUsername: '',
    password: '',
    retypePassword: '',
    organization: '',
    roleOrCategory: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  // Fetch organizations on component mount
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const data: Organization[] = await fetchOrganizations();
        console.log(data);
        setOrganizations(data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setError('Failed to load organizations. Please refresh the page.');
      } finally {
        setIsLoadingOrgs(false);
      }
    };
    fetchOrgs();
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'Name is required';
    if (!formData.middleName.trim()) return 'Name is required';
    if (!formData.surname.trim()) return 'Name is required';

    if (!formData.email.trim()) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      return 'Email format is invalid';
    if (!formData.contactNumber.trim()) return 'Contact number is required';
    if (!formData.acctUsername.trim()) return 'Username is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6)
      return 'Password must be at least 6 characters';
    if (formData.password !== formData.retypePassword)
      return "Passwords don't match";
    if (!formData.gender) return 'Gender is required';
    if (!formData.organization) return 'Please select an organization';
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
      setError('Profile image is required.');
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
        formDataObj.append('profileImage', image);
      }

      // Call the registerVolunteer function
      const response = await registerVolunteer(formDataObj);

      if (response && response.success) {
        setSuccess('Registration successful! Redirecting to login page...');

        // Reset form
        setFormData({
          firstName: '',
          middleName: '',
          surname: '',
          email: '',
          gender: '',
          address: '',
          areaOfOperation: '',
          contactNumber: '',
          dateOfBirth: '',
          acctUsername: '',
          password: '',
          retypePassword: '',
          organization: '',
          roleOrCategory: '',
        });
        setImage(null);
        setImagePreview(null);

        setTimeout(() => {
          window.location.href = './login';
        }, 2000);
      } else {
        setError(response?.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error during registration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] bg-white w-full text-black shadow-lg border-4 border-black rounded-lg p-8 ">
      <div className="w-1/6 flex justify-center">
        <h1 className="flex justify-start mb-4 -translate-y-12 bg-white px-4 rounded-3xl font-bold">
          <FaPeopleGroup className="text-3xl pr-1" /> Volunteer
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
          <div className="flex justify-center mt-5 w-1/4 pl-2 flex-col items-center">
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
          <div className="w-full flex flex-col justify-center items-center">
            <div className="w-full flex gap-3">
              <div className="items-center w-full">
                <label className="w-32 text-right mr-2">First Name:</label>{' '}
                <input
                  className="textbox w-full"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />{' '}
              </div>
              <div className="items-center w-full">
                <label className="w-32 text-right mr-2">Middle Name:</label>{' '}
                <input
                  className="textbox w-full"
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  required
                />{' '}
              </div>
              <div className="items-center w-full">
                <label className="w-32 text-right mr-2">Surname:</label>{' '}
                <input
                  className="textbox w-full"
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  required
                />{' '}
              </div>
            </div>

            <div className="w-full flex gap-3">
              <div className=" items-center w-full">
                <label className="w-32 text-right mr-2">
                  Contact Information:
                </label>
                <input
                  className="textbox w-full placeholder:text-black"
                  type="text"
                  name="contactNumber"
                  placeholder="+63 |"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="items-center w-full">
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
              <div className="items-center w-full">
                <label className="w-32 text-right font-bold">
                  Date of Birth:
                </label>{' '}
                <input
                  className="textbox w-full"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />{' '}
              </div>
            </div>
            <div className="flex w-full pt-4 gap-8">
              <div className="w-full flex flex-col items-start">
                <div className="w-full">
                  <label className="flex justify-center font-bold -translate-x-1 translate-y-2 bg-white rounded-3xl w-1/4">
                    Social Media:
                  </label>
                  <div className="flex justify-center bg-white w-full text-black shadow-lg border-4 border-[#ef8080] rounded-lg p-6 gap-8">
                    <div>
                      <h1 className="flex items-center gap-1">
                        <BsTwitterX className="text-2xl" />{' '}
                        <button className="flex items-center">
                          <CiCirclePlus /> Add Link
                        </button>
                      </h1>
                    </div>
                    <div>
                      <h1 className="flex items-center gap-1">
                        <FaFacebook className="text-2xl" />{' '}
                        <button className="flex items-center">
                          <CiCirclePlus /> Add Link
                        </button>{' '}
                      </h1>
                    </div>
                    <div>
                      <h1 className="flex items-center gap-1">
                        <FaInstagram className="text-2xl" />{' '}
                        <button className="flex items-center">
                          <CiCirclePlus /> Add Link
                        </button>{' '}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-[100%] justify-start mt-4">
                <div className="mb-4 bg-white w-full text-black shadow-lg border-4 border-[#ef8080] rounded-lg px-6">
                  <label className="flex justify-center font-bold -translate-x-7 -translate-y-3 bg-white rounded-3xl w-1/5">
                    Gender:
                  </label>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">Male</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">Female</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="non-binary"
                        checked={formData.gender === 'non-binary'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">Non-Binary</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex gap-8">
              <div className="flex flex-col w-2/3">
                <label className="font-bold">Current Address:</label>
                <input
                  type="text"
                  className="textbox"
                  placeholder="Street, Barangay, City/Municipality, Province, Zipcode"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col w-1/3">
                <label className="font-bold">Region/Area of Operation:</label>
                <input
                  type="text"
                  className="textbox"
                  placeholder="Where you prefer to help"
                  name="areaOfOperation"
                  value={formData.areaOfOperation}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="w-full py-4">
              <label className="flex justify-center font-bold -translate-x-1 translate-y-2 bg-white rounded-3xl w-1/5">
                Skills and Expertise:
              </label>
              <div className="flex justify-center bg-white w-full text-black shadow-lg border-4 border-[#ef8080] rounded-lg p-6 gap-8">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span>First Aid & CPR</span>
                    </label>
                  </div>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span>Psyochosocial Support</span>
                    </label>
                  </div>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span>Medical Services</span>
                    </label>
                  </div>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span>Others: </span>
                    </label>
                  </div>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span>Search & Rescue</span>
                    </label>
                  </div>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span>Clerical Work</span>
                    </label>
                  </div>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span>Counseling</span>
                    </label>
                  </div>
                  <div>
                    <label>
                      <input type="text" className="w-full" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex w-[100%] justify-start mt-8">
                <div className="mb-4 bg-white w-full text-black shadow-lg border-4 border-[#ef8080] rounded-lg px-6 pb-5">
                  <label className="flex justify-center font-bold -translate-x-7 -translate-y-3 bg-white rounded-3xl w-1/5">
                    Role/Category Preference:
                  </label>
                  <div className="grid grid-cols-3 gap-2 w-full">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="roleOrCategory"
                        value="disasterResponseAndRelief"
                        checked={
                          formData.roleOrCategory ===
                          'disasterResponseAndRelief'
                        }
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">Disaster Response and Relief</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="roleOrCategory"
                        value="foodSupplyDistribution"
                        checked={
                          formData.roleOrCategory === 'foodSupplyDistribution'
                        }
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">Food and Supply Distribution</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="roleOrCategory"
                        value="communityOutreach"
                        checked={
                          formData.roleOrCategory === 'communityOutreach'
                        }
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">Community Outreach</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="roleOrCategory"
                        value="EvacCenterAssist"
                        checked={formData.roleOrCategory === 'EvacCenterAssist'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">Evacuation Center Assistance</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="roleOrCategory"
                        value="medicalAssistAndFirstAid"
                        checked={
                          formData.roleOrCategory === 'medicalAssistAndFirstAid'
                        }
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">
                        Medical Assistance and First Aid
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="roleOrCategory"
                        value="documentationAndReporting"
                        checked={
                          formData.roleOrCategory ===
                          'documentationAndReporting'
                        }
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">Documentation and Reporting</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="roleOrCategory"
                        value="psyochoSupportServices"
                        checked={
                          formData.roleOrCategory === 'psyochoSupportServices'
                        }
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">
                        Psychosocial Support Services
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="roleOrCategory"
                        value="fundraisingAndDonation"
                        checked={
                          formData.roleOrCategory === 'fundraisingAndDonation'
                        }
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">
                        Fundraising and Donation Management
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-center pb-8">
                <div className="h-[4.25rem] translate-y-24 translate-x-6 border-l-2 border-black"></div>
                <div className="flex flex-col items-start w-full">
                  <h2 className="text-lg font-semibold mb-4">
                    <div className="w-4 translate-y-28 translate-x-6 border-t-2 border-black"></div>
                    <div className="w-4 translate-y-40 translate-x-6 border-t-2 border-black"></div>
                    Contact Information:
                  </h2>
                  <div className="flex flex-col gap-1.5 w-full">
                    <div>
                      <input
                        type="text"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className="textbox placeholder:text-black w-[86.5%]"
                        placeholder="+63 |"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="textbox placeholder:text-gray-300 w-[80%] ml-10"
                        placeholder="Primary Contact Person Name"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="textbox placeholder:text-gray-300 w-[80%] ml-10"
                        placeholder="Position in organization"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center bg-white w-full text-black shadow-lg border-4 border-[#ef8080] rounded-lg p-6 gap-8">
                <div className="flex flex-col items-center justify-right mt-8">
                  <h1>
                    Choose the organization/s you would like to work with:{' '}
                  </h1>
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
                              formData.organization === org.userId
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200'
                            }`}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                organization: org.userId,
                              }))
                            }
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
                                <p className="text-sm text-gray-600">
                                  {org.type}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {org.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500">
                        No organizations are currently available
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full">
                <label className="flex justify-center font-bold -translate-x-1 translate-y-2 bg-white rounded-3xl w-1/6">
                  Account Details:
                </label>
                <div className="flex justify-center bg-white w-full text-black shadow-lg border-4 border-[#ef8080] rounded-lg p-6 gap-8">
                  <div className="w-full flex gap-3 justify-center">
                    <div className="items-center">
                      <label className="text-right mr-2">
                        Account Username:
                      </label>
                      <input
                        className="textbox w-full"
                        type="text"
                        name="acctUsername"
                        value={formData.acctUsername}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="items-center">
                      <label className="text-right mr-2">
                        Account Password:
                      </label>
                      <input
                        className="textbox w-full"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="items-center">
                      <label className="text-right mr-2">
                        Retype Password:
                      </label>
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
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end pb-8">
          <button
            type="submit"
            className={`bg-red-600 text-white font-semibold text-sm px-8 py-2 rounded-md hover:bg-red-700 ${
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
