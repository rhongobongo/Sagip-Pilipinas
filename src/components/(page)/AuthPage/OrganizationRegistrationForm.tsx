'use client';
import { useState } from 'react';
import preview from '../../../../public/PreviewPhoto.svg';
import Image from 'next/image';
import { registerOrganization } from '@/lib/APICalls/Auth/registerAuth';

import { FaPeopleGroup } from 'react-icons/fa6';
import { BsTwitterX } from 'react-icons/bs';
import { FaInstagram } from 'react-icons/fa';
import { FaFacebook } from 'react-icons/fa';
import { CiCirclePlus } from 'react-icons/ci';
import { FiEye, FiEyeOff } from 'react-icons/fi';

import imageCompression from 'browser-image-compression';


const OrgRegistrationForm: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    acctUsername: '',
    password: '',
    retypePassword: '',
    type: '',
    description: '',
    location: '', // Added location
    dateOfEstablishment: '', // Added dateOfEstablishment
    otherText: '', // Added otherText
    contactPerson: '',
    orgPosition: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otherTextbox, setOtherTextbox] = useState(false);
  const [showMainPassword, setShowMainPassword] = useState<boolean>(false);
  const [showRetypePassword, setShowRetypePassword] = useState<boolean>(false);

  interface Sponsor {
    id: string; // Temporary ID for key/handling before saving
    name: string;
    other: string; // Description, link, etc.
    photoFile: File | null;
    photoPreview: string | null;
  }

  const [sponsors, setSponsors] = useState<Sponsor[]>([]); // Array to hold added sponsors
  const [isAddingSponsor, setIsAddingSponsor] = useState<boolean>(false); // Flag to show/hide add form
  const [currentSponsorData, setCurrentSponsorData] = useState<
    Omit<Sponsor, 'id'>
  >({
    // Data for the sponsor being added
    name: '',
    other: '',
    photoFile: null,
    photoPreview: null,
  });

  const toggleMainPasswordVisibility = () => {
    setShowMainPassword((prev) => !prev);
  };

  const toggleRetypePasswordVisibility = () => {
    setShowRetypePassword((prev) => !prev);
  };

  // *** START: ADDED FOR SPONSORS ***

  const handleAddSponsorClick = () => {
    setIsAddingSponsor(true);
    // Reset the form for adding a new sponsor
    setCurrentSponsorData({
      name: '',
      other: '',
      photoFile: null,
      photoPreview: null,
    });
  };

  const handleCancelAddSponsor = () => {
    setIsAddingSponsor(false);
    // Clear the form data
    setCurrentSponsorData({
      name: '',
      other: '',
      photoFile: null,
      photoPreview: null,
    });
  };

  // Handler for name/other input changes for the current sponsor
  const handleCurrentSponsorInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentSponsorData((prev) => ({ ...prev, [name]: value }));
  };

  // Adapted image handling logic for the current sponsor's photo
  const handleCurrentSponsorImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      console.log(
        `Original sponsor file size: ${originalFile.size / 1024 / 1024} MB`
      );

      // --- START: Compression Logic ---
      const options = {
        maxSizeMB: 0.2, // Maybe smaller target size for sponsors? ADJUST AS NEEDED
        maxWidthOrHeight: 800, // Maybe smaller dimensions for sponsors? ADJUST AS NEEDED
        useWebWorker: true,
      };

      try {
        console.log('Compressing sponsor image...');
        const compressedFile = await imageCompression(originalFile, options);
        console.log(
          `Compressed sponsor file size: ${compressedFile.size / 1024 / 1024} MB`
        );
        // --- END: Compression Logic ---

        // Use the compressedFile from now on
        const reader = new FileReader();
        reader.onload = (event) => {
          setCurrentSponsorData((prev) => ({
            ...prev,
            photoFile: compressedFile, // Set compressed file
            photoPreview: (event.target?.result as string) ?? null,
          }));
        };
        reader.readAsDataURL(compressedFile); // Read compressed file for preview
      } catch (error) {
        console.error('Error during sponsor image compression:', error);
        // Handle error appropriately
        // setCurrentSponsorData(prev => ({ ...prev, photoFile: originalFile, ... }));
        // reader.readAsDataURL(originalFile);
      }

      e.target.value = ''; // Clear input value
    }
  };

  const handleRemoveCurrentSponsorImage = () => {
    setCurrentSponsorData((prev) => ({
      ...prev,
      photoFile: null,
      photoPreview: null,
    }));
  };

  // Saves the currently entered sponsor data to the sponsors list (in state)
  const handleSaveSponsor = () => {
    if (!currentSponsorData.name.trim()) {
      alert('Sponsor name is required.');
      return;
    }
    // Create a new sponsor object with a temporary unique ID
    const newSponsor: Sponsor = {
      id: `sponsor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Temp ID
      ...currentSponsorData,
    };
    setSponsors((prev) => [...prev, newSponsor]); // Add to the list
    setIsAddingSponsor(false); // Hide the form
    // Reset form data (optional, handled by handleAddSponsorClick next time)
    // setCurrentSponsorData({ name: '', other: '', photoFile: null, photoPreview: null });
  };

  // Deletes a sponsor from the list by its temporary ID
  const handleDeleteSponsor = (idToDelete: string) => {
    setSponsors((prev) => prev.filter((sponsor) => sponsor.id !== idToDelete));
  };

  // *** END: ADDED FOR SPONSORS ***

  const initialSocialState = {
    username: '',
    link: '',
    mode: 'initial', // 'initial', 'adding', 'editing', 'added'
  };

  const [socialLinks, setSocialLinks] = useState({
    twitter: { ...initialSocialState },
    facebook: { ...initialSocialState },
    instagram: { ...initialSocialState },
  });

  const [editValues, setEditValues] = useState<{
    platform: keyof typeof socialLinks | null; // Use keys of socialLinks or null
    username: string;
    link: string;
  }>({
    platform: null, // Initial value is null
    username: '',
    link: '',
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      console.log(`Original file size: ${originalFile.size / 1024 / 1024} MB`); // Log original size

      // --- START: Compression Logic ---
      const options = {
        maxSizeMB: 0.3, // Target size in MB (e.g., 0.3MB = 300KB) - ADJUST AS NEEDED
        maxWidthOrHeight: 1024, // Max width or height in pixels - ADJUST AS NEEDED
        useWebWorker: true, // Use multi-threading for faster compression (recommended)
        // You can add more options here, see library docs for details
        // initialQuality: 0.7 // Example: Set initial quality before iterating
      };

      try {
        console.log('Compressing image...');
        const compressedFile = await imageCompression(originalFile, options);
        console.log(
          `Compressed file size: ${compressedFile.size / 1024 / 1024} MB`
        ); // Log compressed size

        // --- END: Compression Logic ---

        // Use the compressedFile from now on
        const reader = new FileReader();
        reader.onload = (event) => {
          // Use optional chaining for safety
          setImagePreview((event.target?.result as string) ?? null);
          setImage(compressedFile); // Set the compressed file in state
        };
        reader.readAsDataURL(compressedFile); // Read the compressed file for preview
      } catch (error) {
        console.error('Error during image compression:', error);
        // Handle error: maybe show a message to the user?
        // Fallback: use original file? (May still hit size limit)
        // For simplicity here, we'll just log the error.
        // Consider setting the original file if compression fails:
        // setImage(originalFile);
        // reader.readAsDataURL(originalFile);
      }

      // Clear the input value (optional, allows re-uploading same file)
      e.target.value = '';
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

    if (name === 'type' && value === 'other') {
      setOtherTextbox(true);
      //Crucially, keep other text if they switch back
      setFormData((prevData) => ({ ...prevData, type: value }));
    } else if (name === 'type') {
      setOtherTextbox(false);
      // Reset otherText when a different radio button is selected
      setFormData((prevData) => ({ ...prevData, type: value, otherText: '' }));
    } else if (name === 'otherText') {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddClick = (platform: keyof typeof socialLinks) => {
    setEditValues({ platform, username: '', link: '' }); // Now matches the state type
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], mode: 'adding' },
    }));
  };

  const handleEditClick = (platform: keyof typeof socialLinks) => {
    const currentData = socialLinks[platform];
    setEditValues({
      platform, // Now matches the state type
      username: currentData.username,
      link: currentData.link,
    });
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], mode: 'editing' },
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // Get the name ('username' or 'link') and value from the input
    setEditValues((prev) => ({
      ...prev,
      [name]: value, // Update the corresponding property in the editValues state
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

  const handleSave = (platform: keyof typeof socialLinks) => {
    if (!editValues.username.trim()) {
      alert('Username cannot be empty.');
      return;
    }

    setSocialLinks((prev) => ({
      ...prev,
      [platform]: {
        username: editValues.username,
        link: editValues.link,
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

  // --- Helper to Render Each Social Entry ---
  const renderSocialEntry = (
    platform: keyof typeof socialLinks,
    IconComponent: React.ElementType,
    platformName: string
  ) => {
    const { username, link, mode } = socialLinks[platform];
    const isCurrentlyEditing = editValues.platform === platform; // Check if this platform is being edited

    switch (mode) {
      case 'adding':
      case 'editing':
        return (
          <div className="flex flex-col gap-2 w-full md:w-auto">
            {' '}
            {/* Adjust width as needed */}
            <h2 className="flex items-center gap-1 font-semibold">
              <IconComponent className="text-2xl" /> {platformName}
            </h2>
            {/* Use the specific handler for these inputs */}
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={isCurrentlyEditing ? editValues.username : ''}
              onChange={handleEditInputChange}
              className="textbox w-full p-2 border rounded placeholder:text-gray-300" // Add/ensure 'textbox' class styles apply
              required // HTML5 validation
            />
            <input
              type="text"
              name="link"
              placeholder="Profile Link (Optional)"
              value={isCurrentlyEditing ? editValues.link : ''}
              onChange={handleEditInputChange}
              className="textbox w-full p-2 border rounded placeholder:text-gray-300" // Add/ensure 'textbox' class styles apply
            />
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => handleSave(platform)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm" // Example style
              >
                {/* <FiSave /> */} Save
              </button>
              <button
                type="button"
                onClick={() => handleCancel(platform)}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm" // Example style
              >
                {/* <FiXCircle /> */} Cancel
              </button>
            </div>
          </div>
        );

      case 'added':
        return (
          <div className="flex flex-col gap-1 items-start">
            <h2 className="flex items-center gap-1 font-semibold">
              <IconComponent className="text-2xl" />
              {/* Optionally make username a link if link exists */}
              {link ? (
                <a
                  href={link.startsWith('http') ? link : `https://${link}`} // Ensure link has protocol
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  title={link} // Show full link on hover
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
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm" // Example style
              >
                {/* <FiEdit /> */} Edit
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClick(platform)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm" // Example style
              >
                {/* <FiTrash2 /> */} Delete
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
                className="flex items-center gap-1 px-3 py-1 rounded hover:bg-red-200" // Example style
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

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      return 'Email format is invalid';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.contactNumber.trim()) return 'Contact number is required';
    if (!formData.contactPerson.trim()) return 'Contact Person is required';
    if (!formData.orgPosition.trim())
      return 'Organization Position is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6)
      return 'Password must be at least 6 characters';
    if (formData.password !== formData.retypePassword)
      return "Passwords don't match";
    if (!formData.type) return 'Organization type is required';
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
      // Append main form data (unchanged)
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('contactNumber', formData.contactNumber);
      formDataObj.append('acctUsername', formData.acctUsername);
      formDataObj.append('password', formData.password);
      formDataObj.append('retypePassword', formData.retypePassword);
      formDataObj.append('type', formData.type);
      formDataObj.append('description', formData.description);
      formDataObj.append('location', formData.location);
      formDataObj.append('dateOfEstablishment', formData.dateOfEstablishment);
      formDataObj.append('otherText', formData.otherText);
      formDataObj.append('contactPerson', formData.contactPerson);
      formDataObj.append('orgPosition', formData.orgPosition);

      // *** START: ADDED SOCIAL MEDIA DATA APPENDING ***
      // Iterate through the socialLinks state
      Object.entries(socialLinks).forEach(([platform, data]) => {
        // Check if the mode is 'added' and username is not empty/whitespace
        if (data.mode === 'added' && data.username.trim()) {
          // Append username (use keys like 'social_twitter_username', 'social_facebook_username', etc.)
          formDataObj.append(
            `social_${platform}_username`,
            data.username.trim()
          );

          // Append link only if it's also not empty/whitespace
          if (data.link.trim()) {
            formDataObj.append(`social_${platform}_link`, data.link.trim());
          }
        }
        // If mode is not 'added' or username is blank, nothing is appended for this platform.
        //SPONSOR HANDLER
        const sponsorsDataForUpload = sponsors.map((s) => ({
          id: s.id,
          name: s.name,
          other: s.other,
        }));
        formDataObj.append(
          'sponsors_json',
          JSON.stringify(sponsorsDataForUpload)
        );

        sponsors.forEach((sponsor) => {
          if (sponsor.photoFile) {
            // Use the temp ID in the key
            formDataObj.append(
              `sponsor_photo_${sponsor.id}`,
              sponsor.photoFile
            );
          }
        });
      });
      // *** END: ADDED SOCIAL MEDIA DATA APPENDING ***

      // Now call the API with the FormData object containing all data
      const response = await registerOrganization(formDataObj, image);

      if (response.success) {
        setSuccess('Registration successful! Redirecting to login...');

        // Reset form (unchanged)
        setFormData({
          /* ... reset fields ... */ name: '',
          email: '',
          contactNumber: '',
          acctUsername: '',
          password: '',
          retypePassword: '',
          type: '',
          description: '',
          location: '',
          dateOfEstablishment: '',
          otherText: '',
          contactPerson: '',
          orgPosition: '',
        });
        setImage(null);
        setImagePreview(null);

        // Reset social media links state (unchanged)
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
        setError(response.message);
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
          <FaPeopleGroup className="text-3xl pr-1" /> Organization
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
        <div className="flex items-start justify-around">
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
          <div className="w-full flex flex-col gap-3">
            <div className="flex w-full gap-4">
              <div className="items-center w-full">
                <label className="w-full text-right font-bold">
                  Organization Name:
                </label>{' '}
                <input
                  className="textbox w-full"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />{' '}
              </div>
              <div className="items-center w-full">
                <label className="w-32 text-right font-bold">Location:</label>{' '}
                <input
                  className="textbox w-full"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />{' '}
              </div>
              <div className="items-center w-full">
                <label className="w-32 text-right font-bold">
                  Date of Establishment:
                </label>{' '}
                <input
                  className="textbox w-full"
                  type="date"
                  name="dateOfEstablishment"
                  value={formData.dateOfEstablishment}
                  onChange={handleInputChange}
                  required
                />{' '}
              </div>
            </div>
            <div>
              <div className="flex w-[100%] justify-start mt-4">
                <div className="mb-4 bg-white w-full text-black shadow-lg border-4 border-[#ef8080] rounded-lg px-6 pb-6">
                  <label className=" border-[#ef8080] flex justify-center font-bold -translate-x-7 -translate-y-3 bg-white rounded-3xl w-1/5 ">
                    Type of Organization:
                  </label>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="ngo"
                        checked={formData.type === 'ngo'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">
                        Non-Governmental Organization (NGO)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="charity"
                        checked={formData.type === 'charity'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">
                        Local Community Organization (Charity)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="foundation"
                        checked={formData.type === 'foundation'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">
                        Government Agency (Foundation)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="nonprofit"
                        checked={formData.type === 'nonprofit'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">
                        Religious Organization (Non-Profit)
                      </span>
                    </label>
                    <label className="flex items-center w-2/3 col-span-2">
                      <input
                        type="radio"
                        name="type"
                        value="other"
                        checked={formData.type === 'other'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container "></span>
                      <span className="ml-1 ">Others: (Specify)</span>
                      <div className="flex pl-4 w-2/3">
                        {otherTextbox && (
                          <div className="w-full">
                            <input
                              type="text"
                              name="otherText" // Correct name
                              value={formData.otherText} // Correct value
                              onChange={handleInputChange}
                              className="textbox w-full" //Consistent Styling
                            />
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
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
                        placeholder="Primary Contact Person Name"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="orgPosition"
                        value={formData.orgPosition}
                        onChange={handleInputChange}
                        className="textbox placeholder:text-gray-300 w-[80%] ml-10"
                        placeholder="Position in organization"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-col items-start">
                  <div className="w-full flex flex-col items-start">
                    {' '}
                    {/* Adjust width */}
                    {/* Adjusted Label Styling: Using relative/absolute */}
                    <div className="relative mb-[-1rem] z-10 w-full flex justify-center md:justify-start">
                      {' '}
                      {/* Container for label */}
                      <label className="font-bold bg-white rounded-3xl px-4 py-1 border-2 border-[#ef8080]">
                        {' '}
                        {/* Simplified border */}
                        Social Media:
                      </label>
                    </div>
                    {/* Main Content Box for Social Media */}
                    <div className="flex flex-col sm:flex-row flex-wrap justify-around items-start bg-white w-full text-black shadow-lg border-2 border-[#ef8080] rounded-lg p-6 pt-8 gap-6 md:gap-8">
                      {' '}
                      {/* Added pt-8, simplified border */}
                      {/* *** START: DYNAMIC SOCIAL MEDIA RENDERING *** */}
                      {renderSocialEntry('twitter', BsTwitterX, 'Twitter')}
                      {renderSocialEntry('facebook', FaFacebook, 'Facebook')}
                      {renderSocialEntry('instagram', FaInstagram, 'Instagram')}
                      {/* *** END: DYNAMIC SOCIAL MEDIA RENDERING *** */}
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="mt-2 w-full">
                      <h1 className="text-lg font-semibold w-full">Email:</h1>
                      <input
                        className="textbox w-full"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full py-4">
                <label className="border-[#ef8080] flex justify-center font-bold -translate-x-1 translate-y-2 bg-white rounded-3xl w-1/5">
                  Type of Aid In Stock:
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
                        <span>Food</span>
                      </label>
                    </div>
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          className="custom-checkbox-input peer sr-only"
                        />
                        <span className="custom-checkbox-indicator"></span>
                        <span>Clothing</span>
                      </label>
                    </div>
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          className="custom-checkbox-input peer sr-only"
                        />
                        <span className="custom-checkbox-indicator"></span>
                        <span>Shelter</span>
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
                        <input
                          type="checkbox"
                          className="custom-checkbox-input peer sr-only"
                        />
                        <span className="custom-checkbox-indicator"></span>
                        <span>Medical Supplies</span>
                      </label>
                    </div>
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          className="custom-checkbox-input peer sr-only"
                        />
                        <span className="custom-checkbox-indicator"></span>
                        <span>Search and Rescue</span>
                      </label>
                    </div>
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          className="custom-checkbox-input peer sr-only"
                        />
                        <span className="custom-checkbox-indicator"></span>
                        <span>Financial Assistance</span>
                      </label>
                    </div>
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          className="custom-checkbox-input peer sr-only"
                        />
                        <span className="custom-checkbox-indicator"></span>
                        <span>Technical/Logistical Support</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                {/* --- START: SPONSORS SECTION (DYNAMIC) --- */}
                <div className="flex flex-col justify-center">
                  {/* Sponsor Display and Add Form Container */}
                  <div className="bg-white w-full text-black shadow-lg border-4 border-[#ef8080] rounded-lg p-6 mt-7">
                    <div className="w-full flex justify-center mb-4 text-xl">
                      <h1 className="font-bold">Sponsors: </h1>
                    </div>

                    {/* Display Existing Sponsors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {sponsors.map((sponsor) => (
                        <div
                          key={sponsor.id}
                          className="border p-3 rounded-lg shadow relative flex flex-col items-center text-center"
                        >
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSponsor(sponsor.id)}
                            className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full p-0.5 text-xs"
                            aria-label="Delete sponsor"
                          >
                            ✕ {/* Simple X icon */}
                          </button>

                          {/* Sponsor Image Preview */}
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-2 flex items-center justify-center">
                            {sponsor.photoPreview ? (
                              <img
                                src={sponsor.photoPreview}
                                alt={`${sponsor.name} logo`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-500 text-xs">
                                No Photo
                              </span>
                            )}
                          </div>
                          {/* Sponsor Name */}
                          <p className="font-semibold text-sm mb-1">
                            {sponsor.name}
                          </p>
                          {/* Sponsor Other Info */}
                          <p className="text-xs text-gray-600">
                            {sponsor.other}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Add Sponsor Form (Conditional) */}
                    {isAddingSponsor ? (
                      <div className="border-t pt-4 mt-4 flex flex-col items-center gap-3">
                        <h2 className="font-semibold mb-2">Add New Sponsor</h2>
                        {/* Name Input */}
                        <div className="w-full max-w-sm">
                          <label
                            className="block text-sm font-medium mb-1"
                            htmlFor={`sponsor-name-${sponsors.length}`}
                          >
                            Sponsor Name:
                          </label>
                          <input
                            type="text"
                            id={`sponsor-name-${sponsors.length}`}
                            name="name"
                            value={currentSponsorData.name}
                            onChange={handleCurrentSponsorInputChange}
                            className="textbox w-full" // Use existing style
                            required
                          />
                        </div>
                        {/* Other Info Input */}
                        <div className="w-full max-w-sm">
                          <label
                            className="block text-sm font-medium mb-1"
                            htmlFor={`sponsor-other-${sponsors.length}`}
                          >
                            Other Info (Link/Desc):
                          </label>
                          <input
                            type="text"
                            id={`sponsor-other-${sponsors.length}`}
                            name="other"
                            value={currentSponsorData.other}
                            onChange={handleCurrentSponsorInputChange}
                            className="textbox w-full" // Use existing style
                          />
                        </div>
                        {/* Image Upload for Current Sponsor */}
                        <div className="flex flex-col items-center gap-2 w-full max-w-sm">
                          <label
                            className="block text-sm font-medium"
                            htmlFor={`sponsor-photo-${sponsors.length}`}
                          >
                            Sponsor Photo:
                          </label>
                          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center border">
                            {!currentSponsorData.photoPreview && (
                              <span className="text-xs text-gray-500">
                                Preview
                              </span>
                            )}
                            {currentSponsorData.photoPreview && (
                              <img
                                src={currentSponsorData.photoPreview}
                                alt="Sponsor Preview"
                                className="w-full h-full object-cover"
                              />
                            )}
                            {/* Hidden File Input */}
                            <input
                              type="file"
                              id={`sponsor-photo-${sponsors.length}`}
                              accept="image/*"
                              onChange={handleCurrentSponsorImageChange}
                              className="absolute inset-0 opacity-0 cursor-pointer" // Make it cover the preview area
                            />
                          </div>
                          {currentSponsorData.photoPreview ? (
                            <button
                              type="button"
                              onClick={handleRemoveCurrentSponsorImage}
                              className="mt-1 text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove Photo
                            </button>
                          ) : (
                            <label
                              htmlFor={`sponsor-photo-${sponsors.length}`}
                              className="mt-1 text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                            >
                              Upload Photo
                            </label>
                          )}
                        </div>
                        {/* Save/Cancel Buttons */}
                        <div className="flex gap-4 mt-3">
                          <button
                            type="button"
                            onClick={handleSaveSponsor}
                            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Save Sponsor
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelAddSponsor}
                            className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Initial "Add Sponsor" Button */
                      <div className="w-full flex justify-center pt-4 border-t mt-4 text-xl">
                        <button
                          className="text-6xl text-gray-500 hover:text-gray-700"
                          type="button"
                          onClick={handleAddSponsorClick} // Use the new handler
                        >
                          <CiCirclePlus />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* --- END: SPONSORS SECTION (DYNAMIC) --- */}
                <div className="flex flex-col mt-8 mb-8 w-full pl-2">
                  <label className="w-24 text-right whitespace-nowrap text-black font-bold">
                    Organization Description:
                  </label>
                  <textarea
                    className="shortDesc"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
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
                      <div className="items-center relative">
                        <label className="text-right mr-2">
                          Account Password:
                        </label>
                        <input
                          // Use showMainPassword for type
                          type={showMainPassword ? 'text' : 'password'}
                          className="textbox w-full pr-10"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                        <button
                          type="button"
                          // Use toggleMainPasswordVisibility for onClick
                          onClick={toggleMainPasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-gray-800 translate-y-3"
                          // Update aria-label
                          aria-label={
                            showMainPassword ? 'Hide password' : 'Show password'
                          }
                        >
                          {/* Use showMainPassword for icon */}
                          {showMainPassword ? (
                            <FiEyeOff size={20} />
                          ) : (
                            <FiEye size={20} />
                          )}
                        </button>
                      </div>
                      <div className="items-center relative">
                        <label className="text-right mr-2">
                          Retype Password:
                        </label>
                        <input
                          // Use showRetypePassword for type
                          type={showRetypePassword ? 'text' : 'password'}
                          className="textbox w-full pr-10"
                          name="retypePassword"
                          value={formData.retypePassword}
                          onChange={handleInputChange}
                          required
                        />
                        <button
                          type="button"
                          // Use toggleRetypePasswordVisibility for onClick
                          onClick={toggleRetypePasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-gray-800 translate-y-3"
                          // Update aria-label
                          aria-label={
                            showRetypePassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {/* Use showRetypePassword for icon */}
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

export default OrgRegistrationForm;
