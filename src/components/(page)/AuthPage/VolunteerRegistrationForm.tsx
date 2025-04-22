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
import { FiEye, FiEyeOff } from 'react-icons/fi';
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
  // --- STATE VARIABLES (NO CHANGES) ---
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
    contactPersonNumber: '',
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
    other: false,
  });
  const [otherSkillText, setOtherSkillText] = useState('');
  const initialSocialState = {
    username: '',
    link: '',
    mode: 'initial' as 'initial' | 'adding' | 'editing' | 'added',
  };
  const [socialLinks, setSocialLinks] = useState({
    twitter: { ...initialSocialState },
    facebook: { ...initialSocialState },
    instagram: { ...initialSocialState },
  });
  const [editValues, setEditValues] = useState<{
    platform: keyof typeof socialLinks | null;
    username: string;
    link: string;
  }>({
    platform: null,
    username: '',
    link: '',
  });

  // --- HANDLERS AND LOGIC (NO CHANGES) ---
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
      [platform]: { ...initialSocialState },
    }));
    if (editValues.platform === platform) {
      setEditValues({ platform: null, username: '', link: '' });
    }
  };
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: value,
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
  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSkills((prev) => {
      const newSkills = { ...prev, [name]: checked };
      if (name === 'other' && !checked) {
        setOtherSkillText('');
      }
      return newSkills;
    });
  };
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
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const data: Organization[] = await fetchOrganizations();
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
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      try {
        console.log('Compressing profile image...');
        const compressedFile = await imageCompression(originalFile, options);
        console.log(
          `Compressed profile file size: ${compressedFile.size / 1024 / 1024} MB`
        );
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview((event.target?.result as string) ?? null);
          setImage(compressedFile);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error during profile image compression:', error);
      }
      e.target.value = '';
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
      const options = {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1200,
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
          setIdPhoto(compressedFile);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error during ID photo compression:', error);
      }
      e.target.value = '';
    }
  };
  const handleRemoveIdPhoto = () => {
    setIdPhoto(null);
    setIdPhotoPreview(null);
  };
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    // Handle checkbox separately
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const validateForm = () => {
    /* NO CHANGE */
    if (!formData.firstName.trim()) return 'First Name is required'; // Changed message slightly
    if (!formData.middleName.trim()) return 'Middle Name is required'; // Changed message slightly
    if (!formData.surname.trim()) return 'Surname is required'; // Changed message slightly
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
    // Added missing required fields
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.areaOfOperation.trim())
      return 'Area of Operation is required';
    if (!formData.dateOfBirth) return 'Date of Birth is required';
    if (!formData.roleOrCategory) return 'Role/Category Preference is required';
    if (!formData.idType) return 'Type of ID is required';
    if (!idPhoto) return 'Photo of Valid ID is required';
    if (!formData.contactPersonNumber.trim())
      return 'Emergency Contact Number is required';
    if (!formData.contactPerson.trim())
      return 'Emergency Contact Person Name is required';
    if (!formData.contactPersonRelation.trim())
      return 'Relationship with Emergency Contact is required';
    if (!formData.backgroundCheckConsent)
      return 'Background check consent is required';

    return null;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    /* NO CHANGE */
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const selectedSkills = Object.entries(skills)
      .filter(([key, value]) => key !== 'other' && value)
      .map(([key]) => key);
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
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, String(value)); // Ensure boolean is stringified
      });
      if (image) {
        formDataObj.append('profileImage', image);
      }
      if (idPhoto) {
        formDataObj.append('idPhoto', idPhoto);
      }
      if (selectedSkills.length > 0) {
        formDataObj.append('skills', JSON.stringify(selectedSkills));
      }
      Object.entries(socialLinks).forEach(([platform, data]) => {
        if (data.mode === 'added' && data.username.trim()) {
          formDataObj.append(
            `social_${platform}_username`,
            data.username.trim()
          );
          if (data.link.trim()) {
            formDataObj.append(`social_${platform}_link`, data.link.trim());
          }
        }
      });
      const response = await registerVolunteer(formDataObj);
      if (response && response.success) {
        setSuccess('Registration successful! Redirecting to login page...');
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
          contactPersonNumber: '',
          contactPerson: '',
          contactPersonRelation: '',
        });
        setSkills({
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
        setIdPhoto(null);
        setIdPhotoPreview(null);
        setSocialLinks({
          twitter: { ...initialSocialState },
          facebook: { ...initialSocialState },
          instagram: { ...initialSocialState },
        });
        setEditValues({ platform: null, username: '', link: '' });
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

  // --- RENDER SOCIAL ENTRY (Minor style adjustments) ---
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
          // Added w-full here, removed md:w-auto for better wrapping control
          <div className="flex flex-col gap-2 w-full">
            <h2 className="flex items-center gap-1 font-semibold text-sm md:text-base">
              <IconComponent className="text-xl md:text-2xl" /> {platformName}
            </h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={isCurrentlyEditing ? editValues.username : ''}
              onChange={handleEditInputChange}
              required
              className="textbox w-full p-2 border rounded text-sm placeholder:text-gray-400" // Adjusted placeholder color
            />
            <input
              type="text"
              name="link"
              placeholder="Profile Link (Optional)"
              value={isCurrentlyEditing ? editValues.link : ''}
              onChange={handleEditInputChange}
              className="textbox w-full p-2 border rounded text-sm placeholder:text-gray-400" // Adjusted placeholder color
            />
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => handleSave(platform)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs md:text-sm" // Adjusted text size
              >
                {' '}
                Save{' '}
              </button>
              <button
                type="button"
                onClick={() => handleCancel(platform)}
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs md:text-sm" // Adjusted text size
              >
                {' '}
                Cancel{' '}
              </button>
            </div>
          </div>
        );
      case 'added':
        return (
          <div className="flex flex-col gap-1 items-start w-full">
            {' '}
            {/* Ensure width */}
            <h2 className="flex items-center gap-1 font-semibold text-sm md:text-base break-all">
              {' '}
              {/* Added break-all */}
              <IconComponent className="text-xl md:text-2xl flex-shrink-0" />{' '}
              {/* Added shrink-0 */}
              {link ? (
                <a
                  href={link.startsWith('http') ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  title={link}
                >
                  {' '}
                  {username}{' '}
                </a>
              ) : (
                <span>{username}</span>
              )}
            </h2>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => handleEditClick(platform)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs md:text-sm" // Adjusted text size
              >
                {' '}
                Edit{' '}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClick(platform)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs md:text-sm" // Adjusted text size
              >
                {' '}
                Delete{' '}
              </button>
            </div>
          </div>
        );
      case 'initial':
      default:
        return (
          <div className="w-full">
            {' '}
            {/* Ensure width */}
            <h1 className="flex items-center gap-1 text-sm md:text-base">
              <IconComponent className="text-xl md:text-2xl" />
              <button
                type="button"
                onClick={() => handleAddClick(platform)}
                className="flex items-center gap-1 px-3 py-1 rounded text-black hover:text-white hover:border-none hover:bg-red-300 text-xs md:text-sm" // Adjusted text size
              >
                {' '}
                <CiCirclePlus /> Add Link{' '}
              </button>
            </h1>
          </div>
        );
    }
  };

  // --- JSX (RESPONSIVE REFACTOR) ---
  return (
    // Main container with max-width and padding
    <div className="w-full mx-auto bg-white text-black shadow-lg border-4 border-black rounded-lg p-4 md:p-8 ">
      {/* Header Section - Centered, takes more width on small screens */}
      <div className="w-full flex justify-center mb-4">
        <h1 className="flex items-center justify-center mb-4 -translate-y-8 md:-translate-y-12 bg-white px-4 rounded-3xl font-bold text-lg md:text-xl">
          <FaPeopleGroup className="text-2xl md:text-3xl pr-1" /> Volunteer
          Registration
        </h1>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {' '}
        {/* Added space-y for vertical spacing */}
        {/* --- Section 1: Profile Image & Basic Info --- */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Profile Image Upload - Centered, takes full width on small screens */}
          <div className="w-full lg:w-1/4 flex flex-col items-center gap-2">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center border border-gray-400 flex-shrink-0">
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
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
            <label
              htmlFor="image-upload"
              className="text-black text-center cursor-pointer text-sm hover:underline"
            >
              Upload Profile Photo*
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete Photo
              </button>
            )}
            {/* Required indicator for image */}
            {!image && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>

          {/* Basic Info Fields - Takes full width, stacks vertically then horizontally */}
          <div className="w-full lg:w-3/4 space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name: <span className="text-red-500">*</span>
                </label>
                <input
                  className="textbox w-full"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Middle Name: <span className="text-red-500">*</span>
                </label>
                <input
                  className="textbox w-full"
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Surname: <span className="text-red-500">*</span>
                </label>
                <input
                  className="textbox w-full"
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Contact/Email/DOB Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Number: <span className="text-red-500">*</span>
                </label>
                <input
                  className="textbox w-full placeholder:text-gray-400" // Adjusted placeholder
                  type="tel" // Use tel type
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                    if (numericValue.length <= 10) {
                      setFormData((prev) => ({
                        ...prev,
                        contactNumber: numericValue,
                      }));
                    }
                  }}
                  placeholder="+63 9XXXXXXXXX" // Simplified placeholder
                  required
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email: <span className="text-red-500">*</span>
                </label>
                <input
                  className="textbox w-full"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date of Birth: <span className="text-red-500">*</span>
                </label>
                <input
                  className="textbox w-full"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />{' '}
                {/* Added max date */}
              </div>
            </div>

            {/* Gender Selection */}
            <div className="pinkBorder pt-8 pb-4 px-4 relative">
              {' '}
              {/* Added padding */}
              <label className="absolute -top-3 left-4 font-bold bg-white px-2 py-0 text-sm border-l-2 border-r-2 border-[#ef8080]">
                {' '}
                {/* Floating label */}
                Gender: <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                {' '}
                {/* Responsive grid */}
                {(['male', 'female', 'non-binary'] as const).map(
                  (genderValue) => (
                    <label
                      key={genderValue}
                      className="flex items-center text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={genderValue}
                        checked={formData.gender === genderValue}
                        className="sr-only peer"
                        onChange={handleInputChange}
                        required
                      />
                      <span className="radio-container flex-shrink-0"></span>{' '}
                      {/* Added shrink */}
                      <span className="ml-2 capitalize">
                        {genderValue.replace('-', ' ')}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
        {/* --- Section 2: Address & Area --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Current Address: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="textbox w-full placeholder:text-gray-400 text-sm"
              placeholder="Street, Barangay, City/Municipality, Province, Zipcode"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Region/Area of Operation: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="textbox w-full placeholder:text-gray-400 text-sm"
              placeholder="Where you prefer to help"
              name="areaOfOperation"
              value={formData.areaOfOperation}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        {/* --- Section 3: Social Media --- */}
        <div className="pinkContainerBorder pt-8 pb-6 px-4 md:px-6 relative">
          <label className="absolute -top-3 left-4 font-bold bg-white px-2 py-0 text-sm border-l-2 border-r-2 border-[#ef8080]">
            {' '}
            {/* Floating label */}
            Social Media (Optional):
          </label>
          {/* Use grid for better alignment and wrapping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderSocialEntry('twitter', BsTwitterX, 'Twitter')}
            {renderSocialEntry('facebook', FaFacebook, 'Facebook')}
            {renderSocialEntry('instagram', FaInstagram, 'Instagram')}
          </div>
        </div>
        {/* --- Section 4: Skills & Expertise --- */}
        <div className="pinkContainerBorder pt-8 pb-6 px-4 md:px-6 relative">
          <label className="absolute -top-3 left-4 font-bold bg-white px-2 py-0 text-sm border-l-2 border-r-2 border-[#ef8080]">
            {' '}
            {/* Floating label */}
            Skills and Expertise:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
            {/* Map through skills */}
            {(Object.keys(skills) as Array<keyof typeof skills>)
              .filter((key) => key !== 'other')
              .map((skillKey) => (
                <div key={skillKey}>
                  <label className="flex items-center cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      name={skillKey}
                      checked={skills[skillKey]}
                      onChange={handleSkillChange}
                      className="custom-checkbox-input peer sr-only"
                    />
                    <span className="custom-checkbox-indicator flex-shrink-0"></span>
                    {/* Format label text */}
                    <span className="ml-2">
                      {skillKey
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())}
                    </span>
                  </label>
                </div>
              ))}
            {/* Others Checkbox and Input */}
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0">
              <label className="flex items-center cursor-pointer text-sm flex-shrink-0">
                <input
                  type="checkbox"
                  name="other"
                  checked={skills.other}
                  onChange={handleSkillChange}
                  className="custom-checkbox-input peer sr-only"
                />
                <span className="custom-checkbox-indicator flex-shrink-0"></span>
                <span className="ml-2">Others:</span>
              </label>
              {skills.other && (
                <input
                  type="text"
                  className="textbox p-1 text-sm flex-grow w-full sm:w-auto min-w-[150px]" // Responsive width
                  placeholder="Please specify"
                  value={otherSkillText}
                  onChange={handleOtherSkillTextChange}
                />
              )}
            </div>
          </div>
        </div>
        {/* --- Section 5: Role/Category Preference --- */}
        <div className="pinkContainerBorder pt-8 pb-6 px-4 md:px-6 relative">
          <label className="absolute -top-3 left-4 font-bold bg-white px-2 py-0 text-sm border-l-2 border-r-2 border-[#ef8080]">
            {' '}
            {/* Floating label */}
            Role/Category Preference: <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            {[
              /* Define roles here for mapping */
              {
                value: 'disasterResponseAndRelief',
                label: 'Disaster Response and Relief',
              },
              {
                value: 'foodSupplyDistribution',
                label: 'Food and Supply Distribution',
              },
              { value: 'communityOutreach', label: 'Community Outreach' },
              {
                value: 'EvacCenterAssist',
                label: 'Evacuation Center Assistance',
              },
              {
                value: 'medicalAssistAndFirstAid',
                label: 'Medical Assistance and First Aid',
              },
              {
                value: 'documentationAndReporting',
                label: 'Documentation and Reporting',
              },
              {
                value: 'psyochoSupportServices',
                label: 'Psychosocial Support Services',
              },
              {
                value: 'fundraisingAndDonation',
                label: 'Fundraising and Donation Management',
              },
            ].map((role) => (
              <label
                key={role.value}
                className="flex items-center cursor-pointer text-sm"
              >
                <input
                  type="radio"
                  name="roleOrCategory"
                  value={role.value}
                  checked={formData.roleOrCategory === role.value}
                  className="sr-only peer"
                  onChange={handleInputChange}
                  required
                />
                <span className="radio-container flex-shrink-0"></span>
                <span className="ml-2">{role.label}</span>
              </label>
            ))}
          </div>
        </div>
        {/* --- Section 6: Emergency Contact --- */}
        <div className="pinkContainerBorder pt-8 pb-6 px-4 md:px-6 relative">
          <label className="absolute -top-3 left-4 font-bold bg-white px-2 py-0 text-sm border-l-2 border-r-2 border-[#ef8080]">
            {' '}
            {/* Floating label */}
            Emergency Contact: <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Contact Number: <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactPersonNumber"
                value={formData.contactPersonNumber}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                  if (numericValue.length <= 10) {
                    setFormData((prev) => ({
                      ...prev,
                      contactPersonNumber: numericValue,
                    }));
                  }
                }}
                className="textbox placeholder:text-gray-400 w-full"
                placeholder="+63 9XXXXXXXXX"
                required
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Contact Person Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="textbox placeholder:text-gray-400 w-full"
                placeholder="Full Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Relationship: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactPersonRelation"
                value={formData.contactPersonRelation}
                onChange={handleInputChange}
                className="textbox placeholder:text-gray-400 w-full"
                placeholder="e.g., Mother, Friend"
                required
              />
            </div>
          </div>
        </div>
        {/* --- Section 7: Valid Documents --- */}
        <div className="pinkContainerBorder pt-8 pb-6 px-4 md:px-6 relative">
          <label className="absolute -top-3 left-4 font-bold bg-white px-2 py-0 text-sm border-l-2 border-r-2 border-[#ef8080]">
            {' '}
            {/* Floating label */}
            Valid Documents: <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Upload any form of valid government issued ID.
          </p>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* ID Type Dropdown */}
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium mb-1">
                Type of ID: <span className="text-red-500">*</span>
              </label>
              <select
                className="textbox w-full bg-white" // Ensure bg for dropdown arrow visibility
                name="idType"
                value={formData.idType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a valid ID</option>
                <option value="passport">Philippine Passport</option>
                <option value="national-id">National ID (PhilSys ID)</option>
                <option value="drivers-license">Driver's License (LTO)</option>
                <option value="sss-id">Social Security System (SSS) ID</option>
                <option value="umid">Unified Multi-Purpose ID (UMID)</option>
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
                <option value="pwd-id">Persons with Disability (PWD) ID</option>
                <option value="acr-id">
                  Alien Certificate of Registration (ACR) I-Card
                </option>
                <option value="seamans-book">Seaman's Book (SIRB)</option>
              </select>
            </div>
            {/* ID Photo Upload */}
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium mb-1">
                Photo of Valid ID: <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                {/* Preview Area */}
                <div className="w-28 h-20 border rounded bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                  <input
                    type="file"
                    id="id-photo-upload"
                    accept="image/*"
                    onChange={handleIdPhotoChange}
                    className="hidden"
                  />
                  {idPhotoPreview ? (
                    <button
                      type="button"
                      onClick={handleRemoveIdPhoto}
                      className="text-xs text-red-600 hover:text-red-800 mb-1"
                    >
                      {' '}
                      Delete Photo{' '}
                    </button>
                  ) : (
                    <label
                      htmlFor="id-photo-upload"
                      className="cursor-pointer text-xs text-black hover:text-white hover:border-none hover:bg-red-300 mb-1 inline-flex items-center bg-white p-4 rounded border border-gray-300"
                    >
                      <CiCirclePlus className="text-base mr-1" /> Add Photo
                    </label>
                  )}
                  {/* Required indicator */}
                  {!idPhoto && (
                    <p className="text-red-500 text-xs mt-1">Required</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* --- Section 8: Organization Selection (Logic Reverted, Style Responsive) --- */}
        <div className="pinkContainerBorder pt-8 pb-6 px-4 md:px-6 relative">
          {' '}
          {/* Use responsive container style */}
          <label className="absolute -top-3 left-4 font-bold bg-white px-2 py-0 text-sm border-l-2 border-r-2 border-[#ef8080]">
            {' '}
            {/* Floating label */}
            Affiliated Organization: <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 mb-2">
            Select from the dropdown or click a card below:
          </p>{' '}
          {/* Optional instruction */}
          {/* Styled Select Dropdown */}
          <select
            className="textbox w-full max-w-md bg-white mb-6" // Use consistent textbox/select styling
            name="organization"
            value={formData.organization}
            onChange={handleInputChange} // Updates state from dropdown
            required
            disabled={isLoadingOrgs}
          >
            <option value="">
              {isLoadingOrgs ? 'Loading...' : 'Select Organization'}
            </option>
            {organizations.map((org) => (
              <option key={org.userId} value={org.userId}>
                {org.name} ({org.type}){' '}
                {/* Show type in dropdown for clarity */}
              </option>
            ))}
          </select>
          {/* Organizations Display Section (Clickable Cards) */}
          <div className="w-full">
            {isLoadingOrgs ? (
              <p className="text-center text-sm text-gray-500">
                Loading organizations...
              </p>
            ) : organizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {' '}
                {/* Responsive grid */}
                {organizations.map((org) => (
                  <div
                    key={org.userId}
                    // Use consistent card styling + hover/selected states + cursor
                    className={`p-3 border rounded-lg transition-all text-left cursor-pointer hover:shadow-md ${
                      formData.organization === org.userId
                        ? 'border-red-500 bg-red-50 shadow-md' // Highlight selected
                        : 'border-red-200 bg-white hover:bg-red-100' // Default + hover state
                    }`}
                    // Keep the onClick handler to allow card selection
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        organization: org.userId,
                      }))
                    }
                  >
                    {/* Internal card structure using responsive styles */}
                    <div className="flex items-center mb-2">
                      {org.profileImageUrl ? (
                        <img
                          src={org.profileImageUrl}
                          alt={org.name}
                          className="w-10 h-10 rounded-full object-cover mr-2 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 mr-2 flex items-center justify-center text-sm flex-shrink-0">
                          {org.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-sm leading-tight">
                          {org.name}
                        </h3>
                        <p className="text-xs text-gray-600 capitalize">
                          {org.type}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">
                      {org.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm">
                No organizations found.
              </p>
            )}
          </div>
        </div>
        {/* --- END OF SECTION 8 --- */}
        {/* --- Section 9: Account Details --- */}
        <div className="pinkContainerBorder pt-8 pb-6 px-4 md:px-6 relative">
          <label className="absolute -top-3 left-4 font-bold bg-white px-2 py-0 text-sm border-l-2 border-r-2 border-[#ef8080]">
            {' '}
            {/* Floating label */}
            Account Details: <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Account Username: <span className="text-red-500">*</span>
              </label>
              <input
                className="textbox w-full"
                type="text"
                name="acctUsername"
                value={formData.acctUsername}
                onChange={handleInputChange}
                required
                autoComplete="username"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Password: <span className="text-red-500">*</span>
              </label>
              <input
                type={showMainPassword ? 'text' : 'password'}
                className="textbox w-full pr-10"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={toggleMainPasswordVisibility}
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                aria-label={
                  showMainPassword ? 'Hide password' : 'Show password'
                }
              >
                {showMainPassword ? (
                  <FiEyeOff size={18} />
                ) : (
                  <FiEye size={18} />
                )}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Retype Password: <span className="text-red-500">*</span>
              </label>
              <input
                type={showRetypePassword ? 'text' : 'password'}
                className="textbox w-full pr-10"
                name="retypePassword"
                value={formData.retypePassword}
                onChange={handleInputChange}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={toggleRetypePasswordVisibility}
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                aria-label={
                  showRetypePassword ? 'Hide password' : 'Show password'
                }
              >
                {showRetypePassword ? (
                  <FiEyeOff size={18} />
                ) : (
                  <FiEye size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* --- Section 10: Consent --- */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-4">
          {' '}
          {/* Added flex-wrap */}
          <span className="text-sm text-center">
            I consent to a background check to further authenticate this
            registration.*
          </span>
          <label className="flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              name="backgroundCheckConsent"
              checked={formData.backgroundCheckConsent}
              onChange={handleInputChange} // Use main handler
              className="custom-checkbox-input peer sr-only"
              required // Make consent required
            />
            <span className="custom-checkbox-indicator"></span>
          </label>
        </div>
        {/* --- Submit Button --- */}
        <div className="flex justify-end pt-6">
          {' '}
          {/* Added padding-top */}
          <button
            type="submit"
            className={`bg-red-600 text-white font-semibold text-sm md:text-base px-6 md:px-8 py-2 rounded-md hover:bg-red-700 transition duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VolRegistrationForm;
