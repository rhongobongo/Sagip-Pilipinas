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
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Add this line
import imageCompression from 'browser-image-compression';

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
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const [showMainPassword, setShowMainPassword] = useState<boolean>(false);
  const [showRetypePassword, setShowRetypePassword] = useState<boolean>(false);
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
    idType: '',
    backgroundCheckConsent: false,
    contactPerson: '',
    contactPersonRelation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [skills, setSkills] = useState({
    firstAidCPR: false,
    psychosocialSupport: false,
    medicalServices: false,
    searchRescue: false,
    clericalWork: false,
    counseling: false,
    other: false, // State for the "Others" checkbox itself
  });
  const [otherSkillText, setOtherSkillText] = useState('');

  const initialSocialState = {
    // Define initial state structure
    username: '',
    link: '',
    mode: 'initial' as 'initial' | 'adding' | 'editing' | 'added', // Add type assertion
  };

  const [socialLinks, setSocialLinks] = useState({
    twitter: { ...initialSocialState },
    facebook: { ...initialSocialState },
    instagram: { ...initialSocialState },
  });

  // State for temporary input values during add/edit social links
  const [editValues, setEditValues] = useState<{
    platform: keyof typeof socialLinks | null;
    username: string;
    link: string;
  }>({
    platform: null,
    username: '',
    link: '',
  });

  const handleAddClick = (platform: keyof typeof socialLinks) => {
    setEditValues({ platform, username: '', link: '' });
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], mode: 'adding' },
    }));
  };

  const handleEditClick = (platform: keyof typeof socialLinks) => {
    const currentData = socialLinks[platform];
    setEditValues({
      platform,
      username: currentData.username,
      link: currentData.link,
    });
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], mode: 'editing' },
    }));
  };

  const handleDeleteClick = (platform: keyof typeof socialLinks) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: { ...initialSocialState }, // Reset to initial state
    }));
    if (editValues.platform === platform) {
      setEditValues({ platform: null, username: '', link: '' });
    }
  };

  // Handler specifically for social media input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: value, // Update 'username' or 'link' in editValues
    }));
  };

  const handleSave = (platform: keyof typeof socialLinks) => {
    if (!editValues.username.trim()) {
      alert('Username cannot be empty.');
      return;
    }
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: {
        username: editValues.username.trim(),
        link: editValues.link.trim(),
        mode: 'added',
      },
    }));
    setEditValues({ platform: null, username: '', link: '' });
  };

  const handleCancel = (platform: keyof typeof socialLinks) => {
    const previousMode = socialLinks[platform].username ? 'added' : 'initial';
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], mode: previousMode },
    }));
    setEditValues({ platform: null, username: '', link: '' });
  };

  const renderSocialEntry = (
    platform: keyof typeof socialLinks,
    IconComponent: React.ElementType,
    platformName: string
  ) => {
    const { username, link, mode } = socialLinks[platform];
    const isCurrentlyEditing = editValues.platform === platform;

    switch (mode) {
      case 'adding':
      case 'editing':
        return (
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <h2 className="flex items-center gap-1 font-semibold">
              <IconComponent className="text-2xl" /> {platformName}
            </h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={isCurrentlyEditing ? editValues.username : ''}
              onChange={handleEditInputChange}
              className="textbox w-full p-2 border rounded text-sm" // Added text-sm
              required
            />
            <input
              type="text"
              name="link"
              placeholder="Profile Link (Optional)"
              value={isCurrentlyEditing ? editValues.link : ''}
              onChange={handleEditInputChange}
              className="textbox w-full p-2 border rounded text-sm" // Added text-sm
            />
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => handleSave(platform)}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => handleCancel(platform)}
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      case 'added':
        return (
          <div className="flex flex-col gap-1 items-start">
            <h2 className="flex items-center gap-1 font-semibold">
              <IconComponent className="text-2xl" />
              {link ? (
                <a
                  href={link.startsWith('http') ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  title={link}
                >
                  {username}
                </a>
              ) : (
                <span>{username}</span>
              )}
            </h2>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => handleEditClick(platform)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClick(platform)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        );
      case 'initial':
      default:
        return (
          <div>
            <h1 className="flex items-center gap-1">
              <IconComponent className="text-2xl" />
              <button
                className="flex items-center gap-1 px-3 py-1 rounded hover:bg-red-200"
                type="button"
                onClick={() => handleAddClick(platform)}
              >
                <CiCirclePlus /> Add Link
              </button>
            </h1>
          </div>
        );
    }
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSkills((prev) => {
      const newSkills = { ...prev, [name]: checked };
      // If "other" is being unchecked, clear the text field
      if (name === 'other' && !checked) {
        setOtherSkillText('');
      }
      return newSkills;
    });
  };

  // Handles changes specifically for the "Others" text input
  const handleOtherSkillTextChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOtherSkillText(e.target.value);
  };

  const toggleMainPasswordVisibility = () => {
    setShowMainPassword((prev) => !prev);
  };

  const toggleRetypePasswordVisibility = () => {
    setShowRetypePassword((prev) => !prev);
  };

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      console.log(
        `Original profile file size: ${originalFile.size / 1024 / 1024} MB`
      );

      // Compression options (adjust as needed for profile pictures)
      const options = {
        maxSizeMB: 0.5, // Target ~500KB
        maxWidthOrHeight: 1024, // Resize to max 1024px
        useWebWorker: true,
      };

      try {
        console.log('Compressing profile image...');
        const compressedFile = await imageCompression(originalFile, options);
        console.log(
          `Compressed profile file size: ${compressedFile.size / 1024 / 1024} MB`
        );

        // Use the compressedFile for preview and state
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview((event.target?.result as string) ?? null);
          setImage(compressedFile); // Set the COMPRESSED file in state
        };
        reader.readAsDataURL(compressedFile); // Read compressed file for preview
      } catch (error) {
        console.error('Error during profile image compression:', error);
        // Optionally handle error, e.g., fallback to original file
        // or show an error message to the user.
        // Example Fallback (may still cause size limit issues):
        // setImage(originalFile);
        // const reader = new FileReader();
        // reader.onload = (event) => { setImagePreview(event.target?.result as string ?? null); };
        // reader.readAsDataURL(originalFile);
      }

      e.target.value = ''; // Clear input value
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleIdPhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      console.log(
        `Original ID Photo size: ${originalFile.size / 1024 / 1024} MB`
      );

      // Compression options (adjust as needed for ID photos)
      const options = {
        maxSizeMB: 0.4, // Target 500KB - IDs might need clarity
        maxWidthOrHeight: 1200, // Allow slightly higher resolution?
        useWebWorker: true,
      };

      try {
        console.log('Compressing ID photo...');
        const compressedFile = await imageCompression(originalFile, options);
        console.log(
          `Compressed ID Photo size: ${compressedFile.size / 1024 / 1024} MB`
        );

        const reader = new FileReader();
        reader.onload = (event) => {
          setIdPhotoPreview((event.target?.result as string) ?? null);
          setIdPhoto(compressedFile); // Set compressed file in state
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error during ID photo compression:', error);
        // Handle error, maybe fallback to original or show message
      }

      e.target.value = ''; // Clear input value
    }
  };

  // Handler to remove the selected ID Photo
  const handleRemoveIdPhoto = () => {
    setIdPhoto(null);
    setIdPhotoPreview(null);
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

    const selectedSkills = Object.entries(skills)
      .filter(([key, value]) => key !== 'other' && value) // Get checked skills (excluding 'other' itself)
      .map(([key]) => key); // Get only the names

    // Add the 'other' text if the 'other' checkbox is checked and text is entered
    if (skills.other && otherSkillText.trim()) {
      selectedSkills.push(otherSkillText.trim());
    }

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
        // Convert value to string before appending
        formDataObj.append(key, String(value));
      });

      // Append the image with the correct field name to match the API function
      if (image) {
        formDataObj.append('profileImage', image);
      }
      if (idPhoto) {
        formDataObj.append('idPhoto', idPhoto);
      }

      if (selectedSkills.length > 0) {
        formDataObj.append('skills', JSON.stringify(selectedSkills));
        // Alternatively, as comma-separated:
        // formDataObj.append('skills', selectedSkills.join(','));
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
          idType: '',
          backgroundCheckConsent: false,
          contactPerson: '',
          contactPersonRelation: '',
        });

        setSkills({
          // Reset skills state
          firstAidCPR: false,
          psychosocialSupport: false,
          medicalServices: false,
          searchRescue: false,
          clericalWork: false,
          counseling: false,
          other: false,
        });
        setOtherSkillText('');

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
              <div className="w-full pt-4">
                {' '}
                {/* Add padding-top */}
                <div className="relative mb-[-1rem] z-10 w-full flex justify-center md:justify-start">
                  <label className="font-bold bg-white rounded-3xl px-4 py-1 border-2 border-[#ef8080]">
                    Social Media (Optional):
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap justify-around items-start bg-white w-full text-black shadow-lg border-2 border-[#ef8080] rounded-lg p-6 pt-8 gap-6 md:gap-8">
                  {renderSocialEntry('twitter', BsTwitterX, 'Twitter')}
                  {renderSocialEntry('facebook', FaFacebook, 'Facebook')}
                  {renderSocialEntry('instagram', FaInstagram, 'Instagram')}
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
                  className="textbox placeholder:text-gray-300"
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
                  className="textbox placeholder:text-gray-300"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                  {' '}
                  {/* Ensure width */}
                  {/* First Aid & CPR */}
                  <div>
                    <label className="inline-flex items-center">
                      {' '}
                      {/* Use inline-flex */}
                      <input
                        type="checkbox"
                        name="firstAidCPR" // Unique name
                        checked={skills.firstAidCPR} // Use state
                        onChange={handleSkillChange} // Use new handler
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span className="ml-2">First Aid & CPR</span>{' '}
                      {/* Add ml-2 for spacing */}
                    </label>
                  </div>
                  {/* Psychosocial Support */}
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="psychosocialSupport" // Unique name
                        checked={skills.psychosocialSupport} // Use state
                        onChange={handleSkillChange} // Use new handler
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span className="ml-2">Psychosocial Support</span>
                    </label>
                  </div>
                  {/* Medical Services */}
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="medicalServices" // Unique name
                        checked={skills.medicalServices} // Use state
                        onChange={handleSkillChange} // Use new handler
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span className="ml-2">Medical Services</span>
                    </label>
                  </div>
                  {/* Search & Rescue */}
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="searchRescue" // Unique name
                        checked={skills.searchRescue} // Use state
                        onChange={handleSkillChange} // Use new handler
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span className="ml-2">Search & Rescue</span>
                    </label>
                  </div>
                  {/* Clerical Work */}
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="clericalWork" // Unique name
                        checked={skills.clericalWork} // Use state
                        onChange={handleSkillChange} // Use new handler
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span className="ml-2">Clerical Work</span>
                    </label>
                  </div>
                  {/* Counseling */}
                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="counseling" // Unique name
                        checked={skills.counseling} // Use state
                        onChange={handleSkillChange} // Use new handler
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span className="ml-2">Counseling</span>
                    </label>
                  </div>
                  {/* Others */}
                  <div className="col-span-1 sm:col-span-2 flex items-center flex-wrap">
                    {' '}
                    {/* Allow wrapping */}
                    <label className="inline-flex items-center mr-2 mb-2 sm:mb-0">
                      {' '}
                      {/* Add margin */}
                      <input
                        type="checkbox"
                        name="other" // Specific name "other"
                        checked={skills.other} // Use state
                        onChange={handleSkillChange} // Use new handler
                        className="custom-checkbox-input peer sr-only"
                      />
                      <span className="custom-checkbox-indicator"></span>
                      <span className="ml-2">Others:</span>
                    </label>
                    {/* Conditionally Render Textbox */}
                    {skills.other && (
                      <input
                        type="text"
                        className="textbox p-1 text-sm flex-grow min-w-[150px]" // Use textbox style, adjust padding/size, allow growth
                        placeholder="Please specify"
                        value={otherSkillText}
                        onChange={handleOtherSkillTextChange} // Use specific handler
                      />
                    )}
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
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        className="textbox placeholder:text-gray-300 w-[80%] ml-10"
                        placeholder="Emergency Contact Person Name"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="contactPersonRelation"
                        value={formData.contactPersonRelation}
                        onChange={handleInputChange}
                        className="textbox placeholder:text-gray-300 w-[80%] ml-10"
                        placeholder="Relationship with contact Person"
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col gap-4 border-4 border-[#ef8080] rounded-2xl p-4">
                  <div className="mt-2 text-lg">
                    <label className="font-bold">Valid Documents:</label>
                    <p className="text-md ml-8 mt-2">
                      Upload any form of valid government issued ID
                    </p>
                  </div>
                  <div className="flex flex-col w-full">
                    {/* ID Type Dropdown */}
                    <div className="flex w-full">
                      <label className="flex w-1/4 justify-start items-center pl-4">
                        {' '}
                        {/* Adjusted width/padding */}
                        Type of ID:
                      </label>
                      {/* Make sure this select has name="idType" */}
                      <select
                        className="textbox w-3/4" // Adjusted width
                        name="idType" // Ensure name attribute is set
                        value={formData.idType}
                        onChange={handleInputChange}
                        required // Add required if applicable
                      >
                        <option value="">Select a valid ID</option>
                        <option value="passport">Philippine Passport</option>
                        <option value="national-id">
                          National ID (PhilSys ID)
                        </option>
                        <option value="drivers-license">
                          Driver's License (LTO)
                        </option>
                        <option value="sss-id">
                          Social Security System (SSS) ID
                        </option>
                        <option value="umid">
                          Unified Multi-Purpose ID (UMID)
                        </option>
                        {/* ... other ID options ... */}
                        <option value="gsis-id">
                          Government Service Insurance System (GSIS) eCard
                        </option>
                        <option value="prc-id">
                          Professional Regulation Commission (PRC) ID
                        </option>
                        <option value="voters-id">
                          COMELEC Voter's ID or Voter's Certification
                        </option>
                        <option value="ibp-id">
                          Integrated Bar of the Philippines (IBP) ID
                        </option>
                        <option value="owwa-id">
                          Overseas Workers Welfare Administration (OWWA) ID
                        </option>
                        <option value="senior-id">Senior Citizen ID</option>
                        <option value="pwd-id">
                          Persons with Disability (PWD) ID
                        </option>
                        <option value="acr-id">
                          Alien Certificate of Registration (ACR) I-Card
                        </option>
                        <option value="seamans-book">
                          Seaman's Book (SIRB)
                        </option>
                      </select>
                    </div>

                    {/* ID Photo Upload Section */}
                    <div className="flex w-full mt-4 items-center">
                      <label className="flex w-1/4 justify-start items-center pl-4 shrink-0">
                        {' '}
                        {/* Adjusted width/padding */}
                        Photo of Valid ID:
                      </label>
                      <div className="flex items-center gap-4 w-3/4">
                        {' '}
                        {/* Adjusted width */}
                        {/* Preview Area */}
                        <div className="w-28 h-20 border rounded bg-gray-100 flex items-center justify-center overflow-hidden ml-2">
                          {idPhotoPreview ? (
                            <img
                              src={idPhotoPreview}
                              alt="ID Preview"
                              className="object-contain h-full w-full"
                            />
                          ) : (
                            <span className="text-xs text-gray-500 p-1 text-center">
                              ID Preview
                            </span>
                          )}
                        </div>
                        {/* Controls Area */}
                        <div className="flex flex-col">
                          {/* Hidden Input */}
                          <input
                            type="file"
                            id="id-photo-upload" // Unique ID
                            accept="image/*"
                            onChange={handleIdPhotoChange} // Use specific handler
                            className="hidden"
                          />
                          {/* Show Upload or Delete Button */}
                          {idPhotoPreview ? (
                            <button
                              type="button"
                              onClick={handleRemoveIdPhoto} // Use specific handler
                              className="text-sm text-red-600 hover:text-red-800 mb-1"
                            >
                              Delete Photo
                            </button>
                          ) : (
                            <label
                              htmlFor="id-photo-upload"
                              className="cursor-pointer text-sm text-black hover:text-blue-800 mb-1 inline-flex items-center"
                            >
                              <CiCirclePlus className="text-lg mr-1" /> Add
                              Photo
                            </label>
                          )}
                          {/* <p className="text-xs text-gray-500">
                            Max 0.5MB recommended
                          </p> */}
                        </div>
                      </div>
                    </div>
                  </div>{' '}
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
                    <div className="items-center relative w-full md:w-1/3">
                      {' '}
                      {/* Added relative, control width */}
                      <label className="text-right mr-2">
                        Account Password:
                      </label>
                      <input
                        type={showMainPassword ? 'text' : 'password'} // Use state for type
                        className="textbox w-full pr-10" // Add padding for icon
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={toggleMainPasswordVisibility} // Use specific handler
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-gray-800 translate-y-3"
                        aria-label={
                          showMainPassword ? 'Hide password' : 'Show password'
                        }
                      >
                        {showMainPassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </button>
                    </div>

                    {/* --- Retype Password (Updated) --- */}
                    <div className="items-center relative w-full md:w-1/3">
                      {' '}
                      {/* Added relative, control width */}
                      <label className="text-right mr-2">
                        Retype Password:
                      </label>
                      <input
                        type={showRetypePassword ? 'text' : 'password'} // Use state for type
                        className="textbox w-full pr-10" // Add padding for icon
                        name="retypePassword"
                        value={formData.retypePassword}
                        onChange={handleInputChange}
                        required
                      />
                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={toggleRetypePasswordVisibility} // Use specific handler
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-gray-800 translate-y-3"
                        aria-label={
                          showRetypePassword ? 'Hide password' : 'Show password'
                        }
                      >
                        {showRetypePassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </button>
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
          I consent to a background check to further authenticate this
          registration.
        </h1>
        <label className="flex items-center cursor-pointer ml-2">
          {/* 1. The hidden INPUT with specific classes */}
          <input
            type="checkbox"
            name="backgroundCheckConsent"
            checked={formData.backgroundCheckConsent}
            onChange={handleInputChange}
            className="custom-checkbox-input peer sr-only" // Crucial classes
          />
          {/* 2. The visible INDICATOR span immediately after input */}
          <span className="custom-checkbox-indicator"></span>
        </label>
      </div>
    </div>
  );
};

export default VolRegistrationForm;
