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

// --- START: Define Aid Types and Initial States ---
const aidTypes = [
  { id: 'food', label: 'Food' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'medicalSupplies', label: 'Medical Supplies' },
  { id: 'shelter', label: 'Shelter' },
  { id: 'searchAndRescue', label: 'Search and Rescue' },
  { id: 'financialAssistance', label: 'Financial Assistance' },
  { id: 'counseling', label: 'Counseling' },
  { id: 'technicalSupport', label: 'Technical/Logistical Support' },
] as const; // Use 'as const' for stricter typing of ids

type AidTypeId = (typeof aidTypes)[number]['id'];

const initialCheckedAidState: Record<AidTypeId, boolean> = {
  food: false,
  clothing: false,
  medicalSupplies: false,
  shelter: false,
  searchAndRescue: false,
  financialAssistance: false,
  counseling: false,
  technicalSupport: false,
};

const initialAidDetailsState = {
  food: {
    foodPacks: '',
    category: '', // 'non-perishable', 'ready-to-eat', or ''
  },
  clothing: {
    male: '',
    female: '',
    children: '',
  },
  medicalSupplies: {
    kits: '',
    kitType: '', // 'first-aid', 'emergency', 'specialized', or ''
  },
  shelter: {
    tents: '',
    blankets: '', // Combined blankets/sleeping bags for simplicity
  },
  searchAndRescue: {
    rescueKits: '',
    rescuePersonnel: '',
  },
  financialAssistance: {
    totalFunds: '',
    currency: 'PHP', // Default currency
  },
  counseling: {
    counselors: '',
    hours: '',
  },
  technicalSupport: {
    vehicles: '',
    communication: '',
  },
};
// --- END: Define Aid Types and Initial States ---

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

  // --- START: State for Aid In Stock ---
  const [checkedAidTypes, setCheckedAidTypes] = useState<
    Record<AidTypeId, boolean>
  >(initialCheckedAidState);
  const [aidDetails, setAidDetails] = useState(initialAidDetailsState);
  // --- END: State for Aid In Stock ---

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
        // Fallback to original file if compression fails
        const reader = new FileReader();
        reader.onload = (event) => {
          setCurrentSponsorData((prev) => ({
            ...prev,
            photoFile: originalFile, // Set original file
            photoPreview: (event.target?.result as string) ?? null,
          }));
        };
        reader.readAsDataURL(originalFile);
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

      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      try {
        console.log('Compressing image...');
        const compressedFile = await imageCompression(originalFile, options);
        console.log(
          `Compressed file size: ${compressedFile.size / 1024 / 1024} MB`
        ); // Log compressed size

        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview((event.target?.result as string) ?? null);
          setImage(compressedFile); // Set the compressed file in state
        };
        reader.readAsDataURL(compressedFile); // Read the compressed file for preview
      } catch (error) {
        console.error('Error during image compression:', error);
        // Fallback to original file
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview((event.target?.result as string) ?? null);
          setImage(originalFile);
        };
        reader.readAsDataURL(originalFile);
      }

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
      setFormData((prevData) => ({ ...prevData, type: value }));
    } else if (name === 'type') {
      setOtherTextbox(false);
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

  // --- START: Aid In Stock Handlers ---
  const handleAidCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const aidId = name as AidTypeId;

    setCheckedAidTypes((prev) => ({
      ...prev,
      [aidId]: checked,
    }));

    // If unchecked, reset the details for that aid type
    if (!checked) {
      setAidDetails((prev) => ({
        ...prev,
        [aidId]: initialAidDetailsState[aidId],
      }));
    }
  };

  const handleAidDetailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    // name will be like "food.foodPacks" or "clothing.male"
    const [aidId, field] = name.split('.') as [AidTypeId, string];

    // Basic validation for number inputs: ensure non-negative
    let processedValue = value;
    if (type === 'number') {
      const numValue = parseInt(value, 10);
      processedValue = isNaN(numValue) || numValue < 0 ? '' : String(numValue); // Store as string, reset if invalid or negative
    }

    setAidDetails((prev) => ({
      ...prev,
      [aidId]: {
        ...prev[aidId],
        [field]: processedValue,
      },
    }));
  };
  // --- END: Aid In Stock Handlers ---

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
                Save
              </button>
              <button
                type="button"
                onClick={() => handleCancel(platform)}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm" // Example style
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
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClick(platform)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm" // Example style
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
    // Add validation for aid details if needed (e.g., require count if checked)
    for (const aidId of aidTypes.map((a) => a.id)) {
      if (checkedAidTypes[aidId]) {
        // Example: Check if at least one numerical field has a value > 0
        const details = aidDetails[aidId];
        let hasValue = false;
        for (const key in details) {
          // Check if it's a numerical field (simple check based on initial state structure)
          if (
            typeof initialAidDetailsState[aidId][
              key as keyof typeof details
            ] === 'string' &&
            key !== 'category' &&
            key !== 'kitType' &&
            key !== 'currency'
          ) {
            if (parseInt(details[key as keyof typeof details] || '0', 10) > 0) {
              hasValue = true;
              break;
            }
          } else if (details[key as keyof typeof details]) {
            // Check non-numerical optional fields if they have *any* value
            // This might need refinement based on specific requirements
          }
        }
        // If you want to enforce *at least one* value if the category is checked:
        // if (!hasValue) {
        //     const aidLabel = aidTypes.find(a => a.id === aidId)?.label || aidId;
        //     return `Please provide details for ${aidLabel} if it's selected.`;
        // }
      }
    }
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
      // Append main form data
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('contactNumber', formData.contactNumber);
      formDataObj.append('acctUsername', formData.acctUsername);
      formDataObj.append('password', formData.password);
      // Do NOT send retypePassword
      formDataObj.append('type', formData.type);
      formDataObj.append('description', formData.description);
      formDataObj.append('location', formData.location);
      formDataObj.append('dateOfEstablishment', formData.dateOfEstablishment);
      if (formData.type === 'other') {
        formDataObj.append('otherTypeText', formData.otherText); // Send specific field if type is 'other'
      }
      formDataObj.append('contactPerson', formData.contactPerson);
      formDataObj.append('orgPosition', formData.orgPosition);

      // Append main profile image
      if (image) {
        formDataObj.append('profileImage', image); // Ensure key matches backend
      }

      // Append social media data
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

      // Append Sponsors data
      const sponsorsDataForUpload = sponsors.map((s) => ({
        // id: s.id, // Backend might not need the temp frontend ID
        name: s.name,
        other: s.other,
        // Backend needs to associate the photo based on the key below
      }));
      if (sponsorsDataForUpload.length > 0) {
        formDataObj.append(
          'sponsors_json',
          JSON.stringify(sponsorsDataForUpload)
        );
      }

      sponsors.forEach((sponsor) => {
        if (sponsor.photoFile) {
          // Use a key the backend can easily parse, maybe include index or name
          formDataObj.append(
            `sponsor_photo_${sponsor.name.replace(/\s+/g, '_')}`, // Use name or index
            sponsor.photoFile,
            sponsor.photoFile.name // Include original filename
          );
        }
      });

      // --- START: Append Aid In Stock Details ---
      Object.entries(checkedAidTypes).forEach(([aidId, isChecked]) => {
        if (isChecked) {
          // Append a marker indicating this aid type is available
          formDataObj.append(`aid_${aidId}_available`, 'true');

          // Append details for the checked aid type
          const details = aidDetails[aidId as AidTypeId];
          Object.entries(details).forEach(([field, value]) => {
            // Only append if value is not empty or null
            if (value !== '' && value !== null) {
              formDataObj.append(`aid_${aidId}_${field}`, String(value)); // Ensure value is string
            }
          });
        }
      });
      // --- END: Append Aid In Stock Details ---

      // FOR DEBUGGING: Log FormData contents
      // for (let pair of formDataObj.entries()) {
      //     console.log(pair[0]+ ', ' + pair[1]);
      // }

      // Now call the API - assuming registerOrganization accepts FormData
      // IMPORTANT: The second 'image' argument might be redundant now if
      // 'profileImage' is appended to formDataObj. Adjust API call if needed.
      const response = await registerOrganization(formDataObj); // Assuming API now just takes FormData

      if (response.success) {
        setSuccess('Registration successful! Redirecting to login...');

        // Reset form
        setFormData({
          name: '',
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
        setOtherTextbox(false);
        setShowMainPassword(false);
        setShowRetypePassword(false);

        // Reset social media links state
        setSocialLinks({
          twitter: { ...initialSocialState },
          facebook: { ...initialSocialState },
          instagram: { ...initialSocialState },
        });
        setEditValues({ platform: null, username: '', link: '' });

        // Reset sponsors
        setSponsors([]);
        setIsAddingSponsor(false);

        // Reset Aid in Stock state
        setCheckedAidTypes(initialCheckedAidState);
        setAidDetails(initialAidDetailsState);

        setTimeout(() => {
          // Ensure this path is correct relative to your routing setup
          window.location.href = './login';
        }, 2000);
      } else {
        setError(
          response.message || 'Registration failed. Please check details.'
        );
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
        <div className="flex flex-col lg:flex-row items-start justify-around gap-6">
          {/* Left Column: Image */}
          <div className="flex justify-center mt-5 w-full lg:w-1/4 flex-col items-center">
            {/* Image Upload Section */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center border border-gray-400">
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
                accept="image/png, image/jpeg, image/webp" // Be specific
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" // Cover the area
              />
            </div>
            <label
              htmlFor="image-upload"
              className="mt-2 text-black text-center cursor-pointer text-sm hover:underline"
            >
              Upload Photo Here
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="mt-1 text-red-600 hover:text-red-800 text-sm"
              >
                Delete Photo
              </button>
            )}
          </div>
          {/* Right Column: Form Fields */}
          <div className="w-full lg:w-3/4 flex flex-col gap-4">
            {/* Row 1: Name, Location, Establishment Date */}
            <div className="flex flex-col md:flex-row w-full gap-4">
              <div className="items-center w-full">
                <label className="w-full text-left font-bold block mb-1">
                  Organization Name: <span className="text-red-500">*</span>
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
                <label className="w-full text-left font-bold block mb-1">
                  Location: <span className="text-red-500">*</span>
                </label>{' '}
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
                <label className="w-full text-left font-bold block mb-1">
                  Date of Establishment: <span className="text-red-500">*</span>
                </label>{' '}
                <input
                  className="textbox w-full"
                  type="date"
                  name="dateOfEstablishment"
                  value={formData.dateOfEstablishment}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  required
                />{' '}
              </div>
            </div>

            {/* Organization Type */}
            <div>
              <div className="relative mb-[-1rem] z-10 w-fit">
                {' '}
                {/* Adjusted for label positioning */}
                <label className="font-bold bg-white rounded-3xl px-4 py-1 border-2 border-[#ef8080]">
                  Type of Organization: <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="bg-white w-full text-black shadow-lg border-2 border-[#ef8080] rounded-lg px-6 pb-6 pt-8">
                {' '}
                {/* Added pt-8 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 w-full">
                  {/* Radio buttons using custom styles */}
                  {[
                    {
                      value: 'ngo',
                      label: 'Non-Governmental Organization (NGO)',
                    },
                    {
                      value: 'charity',
                      label: 'Local Community Organization (Charity)',
                    },
                    {
                      value: 'foundation',
                      label: 'Government Agency (Foundation)',
                    },
                    {
                      value: 'nonprofit',
                      label: 'Religious Organization (Non-Profit)',
                    },
                  ].map((orgType) => (
                    <label
                      key={orgType.value}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="type"
                        value={orgType.value}
                        checked={formData.type === orgType.value}
                        className="sr-only peer"
                        onChange={handleInputChange}
                        required
                      />
                      <span className="radio-container"></span>
                      <span className="ml-2">{orgType.label}</span>
                    </label>
                  ))}
                  {/* Other Option */}
                  <label className="flex items-center md:col-span-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="other"
                      checked={formData.type === 'other'}
                      className="sr-only peer"
                      onChange={handleInputChange}
                      required
                    />
                    <span className="radio-container"></span>
                    <span className="ml-2 mr-2">Others: (Specify)</span>
                    {otherTextbox && (
                      <input
                        type="text"
                        name="otherText"
                        value={formData.otherText}
                        onChange={handleInputChange}
                        className="textbox flex-grow" // Use flex-grow to take remaining space
                        required={formData.type === 'other'} // Required only if 'Other' is selected
                        placeholder="Specify type"
                      />
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Contact Info & Social Media */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Contact Info */}
              <div className="w-full md:w-1/2 flex flex-col">
                <h2 className="text-lg font-semibold mb-2">
                  Contact Information: <span className="text-red-500">*</span>
                </h2>
                <div className="flex flex-col gap-2.5 w-full">
                  {/* Combined Phone Input */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      +63
                    </span>
                    <input
                      type="tel" // Use tel type for phone numbers
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => {
                        // Allow only numbers and limit length (e.g., 10 digits after +63)
                        const numericValue = e.target.value.replace(
                          /[^0-9]/g,
                          ''
                        );
                        if (numericValue.length <= 10) {
                          handleInputChange(e); // Call original handler if valid
                          setFormData((prev) => ({
                            ...prev,
                            contactNumber: numericValue,
                          }));
                        }
                      }}
                      className="textbox pl-12 w-full" // Add padding for "+63"
                      placeholder="9XXXXXXXXX"
                      required
                      maxLength={10} // Max 10 digits
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      className="textbox placeholder:text-gray-400 w-full"
                      placeholder="Primary Contact Person Name"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="orgPosition"
                      value={formData.orgPosition}
                      onChange={handleInputChange}
                      className="textbox placeholder:text-gray-400 w-full"
                      placeholder="Position in organization"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-md font-semibold w-full block mb-1">
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
                </div>
              </div>

              {/* Social Media */}
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="relative mb-[-1rem] z-10 w-fit">
                  {' '}
                  {/* Container for label */}
                  <label className="font-bold bg-white rounded-3xl px-4 py-1 border-2 border-[#ef8080]">
                    Social Media:
                  </label>
                </div>
                {/* Main Content Box for Social Media */}
                <div className="flex flex-col justify-around items-start bg-white w-full h-full text-black shadow-lg border-2 border-[#ef8080] rounded-lg p-6 pt-8 gap-4">
                  {' '}
                  {/* Added h-full */}
                  {renderSocialEntry('twitter', BsTwitterX, 'Twitter')}
                  {renderSocialEntry('facebook', FaFacebook, 'Facebook')}
                  {renderSocialEntry('instagram', FaInstagram, 'Instagram')}
                </div>
              </div>
            </div>

            {/* --- START: Aid In Stock Section --- */}
            <div className="w-full py-4">
              <div className="relative mb-[-1rem] z-10 w-fit">
                {' '}
                {/* Container for label */}
                <label className="font-bold bg-white rounded-3xl px-4 py-1 border-2 border-[#ef8080]">
                  Type of Aid In Stock:
                </label>
              </div>
              <div className="flex flex-col bg-white w-full text-black shadow-lg border-2 border-[#ef8080] rounded-lg p-6 pt-8 gap-4">
                {' '}
                {/* Added pt-8 and flex-col */}
                {/* Checkbox Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3 mb-4">
                  {aidTypes.map((aid) => (
                    <div key={aid.id}>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name={aid.id}
                          checked={checkedAidTypes[aid.id]}
                          onChange={handleAidCheckboxChange}
                          className="custom-checkbox-input peer sr-only"
                        />
                        <span className="custom-checkbox-indicator"></span>
                        <span className="ml-2">{aid.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
                {/* Dynamic Detail Sections */}
                <div className="flex flex-col gap-5 mt-3 border-t pt-4">
                  {' '}
                  {/* Container for details */}
                  {checkedAidTypes.food && (
                    <div className="aid-detail-section">
                      <h3 className="font-semibold mb-2">Food Details:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Number of Food Packs:
                          </label>
                          <input
                            type="number"
                            name="food.foodPacks"
                            value={aidDetails.food.foodPacks}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 100"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Category (Optional):
                          </label>
                          <select
                            name="food.category"
                            value={aidDetails.food.category}
                            onChange={handleAidDetailChange}
                            className="textbox w-full bg-white" // Ensure bg for dropdown
                          >
                            <option value="">Select Category</option>
                            <option value="non-perishable">
                              Non-Perishable
                            </option>
                            <option value="ready-to-eat">Ready-to-Eat</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  {checkedAidTypes.clothing && (
                    <div className="aid-detail-section">
                      <h3 className="font-semibold mb-2">
                        Clothing Details (Counts):
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Male:
                          </label>
                          <input
                            type="number"
                            name="clothing.male"
                            value={aidDetails.clothing.male}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 50"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Female:
                          </label>
                          <input
                            type="number"
                            name="clothing.female"
                            value={aidDetails.clothing.female}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 50"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Children:
                          </label>
                          <input
                            type="number"
                            name="clothing.children"
                            value={aidDetails.clothing.children}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 30"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {checkedAidTypes.medicalSupplies && (
                    <div className="aid-detail-section">
                      <h3 className="font-semibold mb-2">
                        Medical Supplies Details:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Total Medical Kits:
                          </label>
                          <input
                            type="number"
                            name="medicalSupplies.kits"
                            value={aidDetails.medicalSupplies.kits}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 25"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Kit Type (Optional):
                          </label>
                          <select
                            name="medicalSupplies.kitType"
                            value={aidDetails.medicalSupplies.kitType}
                            onChange={handleAidDetailChange}
                            className="textbox w-full bg-white"
                          >
                            <option value="">Select Type</option>
                            <option value="first-aid">First Aid Kit</option>
                            <option value="emergency">Emergency Kit</option>
                            <option value="specialized">Specialized Kit</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  {checkedAidTypes.shelter && (
                    <div className="aid-detail-section">
                      <h3 className="font-semibold mb-2">Shelter Details:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Number of Tents:
                          </label>
                          <input
                            type="number"
                            name="shelter.tents"
                            value={aidDetails.shelter.tents}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 20"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Blankets/Sleeping Bags:
                          </label>
                          <input
                            type="number"
                            name="shelter.blankets"
                            value={aidDetails.shelter.blankets}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 100"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {checkedAidTypes.searchAndRescue && (
                    <div className="aid-detail-section">
                      <h3 className="font-semibold mb-2">
                        Search and Rescue Details:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Number of Rescue Kits:
                          </label>
                          <input
                            type="number"
                            name="searchAndRescue.rescueKits"
                            value={aidDetails.searchAndRescue.rescueKits}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 10"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Specialized Rescue Personnel:
                          </label>
                          <input
                            type="number"
                            name="searchAndRescue.rescuePersonnel"
                            value={aidDetails.searchAndRescue.rescuePersonnel}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 5"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {checkedAidTypes.financialAssistance && (
                    <div className="aid-detail-section">
                      <h3 className="font-semibold mb-2">
                        Financial Assistance Details:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Total Funds Available:
                          </label>
                          <input
                            type="number"
                            name="financialAssistance.totalFunds"
                            value={aidDetails.financialAssistance.totalFunds}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 50000"
                            min="0"
                            step="0.01" // Allow decimals for currency
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Currency:
                          </label>
                          <select
                            name="financialAssistance.currency"
                            value={aidDetails.financialAssistance.currency}
                            onChange={handleAidDetailChange}
                            className="textbox w-full bg-white"
                          >
                            <option value="PHP">PHP</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            {/* Add other common currencies if needed */}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  {checkedAidTypes.counseling && (
                    <div className="aid-detail-section">
                      <h3 className="font-semibold mb-2">
                        Counseling Details:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Number of Counselors Available:
                          </label>
                          <input
                            type="number"
                            name="counseling.counselors"
                            value={aidDetails.counseling.counselors}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 5"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Total Counseling Hours/Week:
                          </label>
                          <input
                            type="number"
                            name="counseling.hours"
                            value={aidDetails.counseling.hours}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 40"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {checkedAidTypes.technicalSupport && (
                    <div className="aid-detail-section">
                      <h3 className="font-semibold mb-2">
                        Technical/Logistical Support Details:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Number of Vehicles:
                          </label>
                          <input
                            type="number"
                            name="technicalSupport.vehicles"
                            value={aidDetails.technicalSupport.vehicles}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 3"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Communication Equipment Count:
                          </label>
                          <input
                            type="number"
                            name="technicalSupport.communication"
                            value={aidDetails.technicalSupport.communication}
                            onChange={handleAidDetailChange}
                            className="textbox w-full"
                            placeholder="e.g., 10 radios"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* End Dynamic Detail Sections */}
              </div>
            </div>
            {/* --- END: Aid In Stock Section --- */}

            {/* --- START: SPONSORS SECTION (DYNAMIC) --- */}
            <div className="w-full py-4">
              <div className="relative mb-[-1rem] z-10 w-fit">
                {' '}
                {/* Container for label */}
                <label className="font-bold bg-white rounded-3xl px-4 py-1 border-2 border-[#ef8080]">
                  Sponsors (Optional):
                </label>
              </div>
              <div className="bg-white w-full text-black shadow-lg border-2 border-[#ef8080] rounded-lg p-6 pt-8">
                {' '}
                {/* Added pt-8 */}
                {/* Display Existing Sponsors */}
                {sponsors.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {sponsors.map((sponsor) => (
                      <div
                        key={sponsor.id}
                        className="border p-3 rounded-lg shadow relative flex flex-col items-center text-center bg-gray-50"
                      >
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSponsor(sponsor.id)}
                          className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full p-0.5 leading-none text-lg"
                          aria-label="Delete sponsor"
                        >
                          &times; {/* HTML entity for X */}
                        </button>

                        {/* Sponsor Image Preview */}
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-2 flex items-center justify-center border">
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
                        <p className="font-semibold text-sm mb-1 break-words w-full">
                          {' '}
                          {/* Allow wrapping */}
                          {sponsor.name}
                        </p>
                        {/* Sponsor Other Info */}
                        {sponsor.other && (
                          <p className="text-xs text-gray-600 break-words w-full">
                            {' '}
                            {/* Allow wrapping */}
                            {sponsor.other}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Add Sponsor Form (Conditional) */}
                {isAddingSponsor ? (
                  <div className="border-t pt-4 mt-4 flex flex-col items-center gap-3">
                    <h2 className="font-semibold mb-2">Add New Sponsor</h2>
                    {/* Name Input */}
                    <div className="w-full max-w-sm">
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor={`sponsor-name-new`}
                      >
                        Sponsor Name: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id={`sponsor-name-new`}
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
                        htmlFor={`sponsor-other-new`}
                      >
                        Other Info (Link/Desc):
                      </label>
                      <input
                        type="text"
                        id={`sponsor-other-new`}
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
                        htmlFor={`sponsor-photo-new`}
                      >
                        Sponsor Photo (Optional):
                      </label>
                      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center border">
                        {!currentSponsorData.photoPreview && (
                          <span className="text-xs text-gray-500">Preview</span>
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
                          id={`sponsor-photo-new`}
                          accept="image/png, image/jpeg, image/webp"
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
                          htmlFor={`sponsor-photo-new`}
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
                  <div className="w-full flex justify-center pt-4 border-t mt-4">
                    <button
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                      type="button"
                      onClick={handleAddSponsorClick} // Use the new handler
                    >
                      <CiCirclePlus className="text-2xl" /> Add Sponsor
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* --- END: SPONSORS SECTION --- */}

            {/* Organization Description */}
            <div className="w-full mt-2 mb-4">
              <label className="block text-black font-bold mb-1">
                Organization Description:{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                className="shortDesc" // Make sure this class provides height/styling
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4} // Set a default height
                required
                placeholder="Tell us about your organization's mission and activities..."
              />
            </div>

            {/* Account Details */}
            <div className="w-full">
              <div className="relative mb-[-1rem] z-10 w-fit">
                {' '}
                {/* Container for label */}
                <label className="font-bold bg-white rounded-3xl px-4 py-1 border-2 border-[#ef8080]">
                  Account Details: <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex flex-col md:flex-row justify-center bg-white w-full text-black shadow-lg border-2 border-[#ef8080] rounded-lg p-6 pt-8 gap-4 md:gap-8">
                {' '}
                {/* Added pt-8 */}
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">
                    Account Username:
                  </label>
                  <input
                    className="textbox w-full"
                    type="text"
                    name="acctUsername"
                    value={formData.acctUsername}
                    onChange={handleInputChange}
                    required
                    autoComplete="username" // Help password managers
                  />
                </div>
                <div className="w-full relative">
                  <label className="block text-sm font-medium mb-1">
                    Account Password:
                  </label>
                  <input
                    type={showMainPassword ? 'text' : 'password'}
                    className="textbox w-full pr-10" // Padding for eye icon
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    autoComplete="new-password" // Help password managers
                  />
                  <button
                    type="button"
                    onClick={toggleMainPasswordVisibility}
                    className="absolute inset-y-0 right-0 top-5 pr-3 flex items-center text-gray-600 hover:text-gray-800" // Adjusted top position
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
                <div className="w-full relative">
                  <label className="block text-sm font-medium mb-1">
                    Retype Password:
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
                    className="absolute inset-y-0 right-0 top-5 pr-3 flex items-center text-gray-600 hover:text-gray-800" // Adjusted top position
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
          </div>{' '}
          {/* End Right Column */}
        </div>{' '}
        {/* End Main Flex Container */}
        {/* Submit Button */}
        <div className="mt-10 flex justify-end pb-8">
          <button
            type="submit"
            className={`bg-red-600 text-white font-semibold text-lg px-8 py-2.5 rounded-md hover:bg-red-700 transition duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register Organization'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrgRegistrationForm;
