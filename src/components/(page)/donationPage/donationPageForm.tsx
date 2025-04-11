'use client';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { CiCirclePlus } from 'react-icons/ci';

// Updated interface to match the server component
interface OrganizationData {
  name?: string;
  location?: string;
  contactNumber?: string;
  email?: string;
  // Updated to match new aidStock structure
  aidStock?: {
    food?: {
      available: boolean;
      foodPacks?: number;
    };
    clothing?: {
      available: boolean;
      male?: number;
      female?: number;
      children?: number;
    };
    medicalSupplies?: {
      available: boolean;
      kits?: number;
    };
    shelter?: {
      available: boolean;
      tents?: number;
      blankets?: number;
    };
    searchAndRescue?: {
      available: boolean;
      rescueKits?: number;
      rescuePersonnel?: number;
    };
    financialAssistance?: {
      available: boolean;
      totalFunds?: number;
    };
    counseling?: {
      available: boolean;
      counselors?: number;
      hours?: number;
    };
    technicalSupport?: {
      available: boolean;
      vehicles?: number;
      communication?: number;
    };
  };
}

interface DonationPageFormProps {
  fetchedOrgData: OrganizationData | null; // Accept the fetched data as a prop
}

const DonationPageForm: React.FC<DonationPageFormProps> = ({
  fetchedOrgData,
}) => {
  const now = new Date();

  // State for all checkboxes to match the image
  const [checkedDonationTypes, setCheckedDonationTypes] = useState({
    food: false,
    clothing: false,
    medicalSupplies: false,
    shelter: false,
    searchAndRescue: false,
    financialAssistance: false,
    counseling: false,
    technicalSupport: false,
  });

  // State for detailed donation information when checkboxes are selected
  const [donationDetails, setDonationDetails] = useState({
    food: {
      foodPacks: '',
      category: '',
    },
    clothing: {
      male: '',
      female: '',
      children: '',
    },
    medicalSupplies: {
      kits: '',
      kitType: '',
    },
    shelter: {
      tents: '',
      blankets: '',
    },
    searchAndRescue: {
      rescueKits: '',
      rescuePersonnel: '',
    },
    financialAssistance: {
      totalFunds: '',
      currency: 'PHP',
    },
    counseling: {
      counselors: '',
      hours: '',
    },
    technicalSupport: {
      vehicles: '',
      communication: '',
    },
  });

  // State for donation date and image
  const [donationDate, setDonationDate] = useState('');
  const [donationImage, setDonationImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Get inventory limits from fetchedOrgData or set defaults
  // Updated to use the new aidStock structure
  const inventoryLimits = {
    food: {
      maxFoodPacks: fetchedOrgData?.aidStock?.food?.foodPacks ?? 20,
    },
    clothing: {
      maxMale: fetchedOrgData?.aidStock?.clothing?.male ?? 50,
      maxFemale: fetchedOrgData?.aidStock?.clothing?.female ?? 50,
      maxChildren: fetchedOrgData?.aidStock?.clothing?.children ?? 30,
    },
    medicalSupplies: {
      maxMedicalKits: fetchedOrgData?.aidStock?.medicalSupplies?.kits ?? 25,
    },
    shelter: {
      maxTents: fetchedOrgData?.aidStock?.shelter?.tents ?? 20,
      maxBlankets: fetchedOrgData?.aidStock?.shelter?.blankets ?? 100,
    },
    searchAndRescue: {
      maxRescueKits: fetchedOrgData?.aidStock?.searchAndRescue?.rescueKits ?? 10,
      maxRescuePersonnel: fetchedOrgData?.aidStock?.searchAndRescue?.rescuePersonnel ?? 5,
    },
    financialAssistance: {
      maxFunds: fetchedOrgData?.aidStock?.financialAssistance?.totalFunds ?? 50000,
    },
    counseling: {
      maxCounselors: fetchedOrgData?.aidStock?.counseling?.counselors ?? 5,
      maxHours: fetchedOrgData?.aidStock?.counseling?.hours ?? 40,
    },
    technicalSupport: {
      maxVehicles: fetchedOrgData?.aidStock?.technicalSupport?.vehicles ?? 3,
      maxCommunication: fetchedOrgData?.aidStock?.technicalSupport?.communication ?? 10,
    },
  };

  // Initialize checkboxes based on available aid types
  React.useEffect(() => {
    if (fetchedOrgData?.aidStock) {
      const aidStock = fetchedOrgData.aidStock;
      setCheckedDonationTypes({
        food: aidStock.food?.available ?? false,
        clothing: aidStock.clothing?.available ?? false,
        medicalSupplies: aidStock.medicalSupplies?.available ?? false,
        shelter: aidStock.shelter?.available ?? false,
        searchAndRescue: aidStock.searchAndRescue?.available ?? false,
        financialAssistance: aidStock.financialAssistance?.available ?? false,
        counseling: aidStock.counseling?.available ?? false,
        technicalSupport: aidStock.technicalSupport?.available ?? false,
      });
    }
  }, [fetchedOrgData]);

  // Handler for checkbox changes
  const handleDonationCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = event.target;
    setCheckedDonationTypes((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handler for donation details changes with max limits
  const handleDonationDetailChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = event.target; // Use let for value as it might be modified
    let value = event.target.value;
    const [category, field] = name.split('.') as [keyof typeof donationDetails, string]; // Type assertion needed

    // Apply max limit validation only for number inputs
    if (event.target.type === 'number') {
      let maxValue: number | undefined = undefined;

      // Determine the max value based on category and field
      if (category === 'food' && field === 'foodPacks') maxValue = inventoryLimits.food.maxFoodPacks;
      else if (category === 'clothing' && field === 'male') maxValue = inventoryLimits.clothing.maxMale;
      else if (category === 'clothing' && field === 'female') maxValue = inventoryLimits.clothing.maxFemale;
      else if (category === 'clothing' && field === 'children') maxValue = inventoryLimits.clothing.maxChildren;
      else if (category === 'medicalSupplies' && field === 'kits') maxValue = inventoryLimits.medicalSupplies.maxMedicalKits;
      else if (category === 'shelter' && field === 'tents') maxValue = inventoryLimits.shelter.maxTents;
      else if (category === 'shelter' && field === 'blankets') maxValue = inventoryLimits.shelter.maxBlankets;
      else if (category === 'searchAndRescue' && field === 'rescueKits') maxValue = inventoryLimits.searchAndRescue.maxRescueKits;
      else if (category === 'searchAndRescue' && field === 'rescuePersonnel') maxValue = inventoryLimits.searchAndRescue.maxRescuePersonnel;
      else if (category === 'financialAssistance' && field === 'totalFunds') maxValue = inventoryLimits.financialAssistance.maxFunds;
      else if (category === 'counseling' && field === 'counselors') maxValue = inventoryLimits.counseling.maxCounselors;
      else if (category === 'counseling' && field === 'hours') maxValue = inventoryLimits.counseling.maxHours;
      else if (category === 'technicalSupport' && field === 'vehicles') maxValue = inventoryLimits.technicalSupport.maxVehicles;
      else if (category === 'technicalSupport' && field === 'communication') maxValue = inventoryLimits.technicalSupport.maxCommunication;

      // Validate and potentially cap the value
      if (maxValue !== undefined) {
        const numValue = field === 'totalFunds' ? parseFloat(value) : parseInt(value); // Use parseFloat for funds
        if (!isNaN(numValue)) {
          if (numValue > maxValue) {
            value = maxValue.toString(); // Cap at max value
          } else if (numValue < 0) {
            value = '0'; // Prevent negative numbers
          }
        } else if (value !== '') {
          // Handle non-numeric input in number field (optional: clear or keep current state)
          value = ''; // Or set to '0' or keep previous valid value
        }
      }
    }

    setDonationDetails((prev) => {
      // Ensure the category exists before trying to spread it
      const currentCategoryDetails = prev[category] || {};
      return {
        ...prev,
        [category]: {
          ...currentCategoryDetails,
          [field]: value, // Use the validated or original value
        },
      };
    });
  };

  // Handler for date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDonationDate(event.target.value);
  };

  // Handler for image change
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setDonationImage(file);
      // Create and revoke object URL to prevent memory leaks
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Optional: Revoke previous URL if exists
      // return () => URL.revokeObjectURL(previewUrl); // Cleanup logic if needed in useEffect
    } else {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview); // Clean up previous preview URL
      }
      setDonationImage(null);
      setImagePreview(null);
    }
  };

  // Handler for form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Collate data from state and submit it (e.g., send to an API)
    // ** REMEMBER: Implement actual API submission logic and server-side validation **
    console.log('Submitting donation data:', {
      donationTypes: checkedDonationTypes,
      details: donationDetails,
      date: donationDate,
      image: donationImage?.name, // Or pass the File object if needed by API
      targetOrgId: fetchedOrgData?.email, // Use org email as ID reference
    });
    alert('Donation Submitted (Check Console)'); // Placeholder feedback
  };

  // Display loading or message if data hasn't been fetched yet
  if (!fetchedOrgData) {
    return <p>Loading organization details or details are not available.</p>;
  }

  return (
  <form onSubmit={handleSubmit} className="h-full">
  {/* Date and Time Display */}
  <div className="mb-4 text-sm text-black">
  <h2>Date: {format(now, 'MMMM d, yyyy')}</h2> {/* Corrected format */}
  <h2>Time: {format(now, 'h:mm a')}</h2>
  </div>
  
  {/* Organization Details */}
  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 md:gap-16 lg:gap-32 justify-between sm:justify-evenly mt-4 mb-6 border-b pb-4">
  <div className="flex flex-col text-start gap-1 sm:gap-2">
  <div className="flex">
  <h2 className="font-semibold mr-1 text-sm">Organization Name:</h2>
  <h2 className="text-sm"> {fetchedOrgData.name || 'N/A'}</h2>
  </div>
  <div className="flex">
  <h2 className="font-semibold mr-1 text-sm">Office Address:</h2>
  <h2 className="text-sm">{fetchedOrgData.location || 'N/A'}</h2>
  </div>
  </div>
  <div className="flex flex-col text-start gap-1 sm:gap-2">
  <div className="flex">
  <h2 className="font-semibold mr-1 text-sm">Contact #:</h2>
  <h2 className="text-sm">{fetchedOrgData.contactNumber || 'N/A'}</h2>
  </div>
  <div className="flex">
  <h2 className="font-semibold mr-1 text-sm">Email Address:</h2>
  <h2 className="text-sm">{fetchedOrgData.email || 'N/A'}</h2>
  </div>
  </div>
  </div>

  {/* Donation Form Sections */}
  <div className="pinkContainerBorder space-y-4">
  {/* Purpose of Donation Checkboxes */}
  <div className="pinkBorder p-4">
  <h1 className="text-lg font-semibold mb-3">Purpose of Donation:</h1>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
  {/* Checkbox for Food */}
  <div>
  <label
  htmlFor="donation_food"
  className="flex items-center cursor-pointer text-sm"
  >
  <input
  type="checkbox"
  id="donation_food"
  name="food"
  checked={checkedDonationTypes.food}
  onChange={handleDonationCheckboxChange}
  className="sr-only custom-checkbox-input"
  />
  <span className="custom-checkbox-indicator"></span>
  <span className="ml-2">Food</span>
  </label>
  </div>
  
  {/* Checkbox for Clothing */}
  <div>
  <label
  htmlFor="donation_clothing"
  className="flex items-center cursor-pointer text-sm"
  >
  <input
  type="checkbox"
  id="donation_clothing"
  name="clothing"
  checked={checkedDonationTypes.clothing}
  onChange={handleDonationCheckboxChange}
  className="sr-only custom-checkbox-input"
  />
  <span className="custom-checkbox-indicator"></span>
  <span className="ml-2">Clothing</span>
  </label>
  </div>
  
  {/* Checkbox for Medical Supplies */}
  <div>
  <label
  htmlFor="donation_medical"
  className="flex items-center cursor-pointer text-sm"
  >
  <input
  type="checkbox"
  id="donation_medical"
  name="medicalSupplies"
  checked={checkedDonationTypes.medicalSupplies}
  onChange={handleDonationCheckboxChange}
  className="sr-only custom-checkbox-input"
  />
  <span className="custom-checkbox-indicator"></span>
  <span className="ml-2">Medical Supplies</span>
  </label>
  </div>
  
  {/* Checkbox for Shelter */}
  <div>
  <label
  htmlFor="donation_shelter"
  className="flex items-center cursor-pointer text-sm"
  >
  <input
  type="checkbox"
  id="donation_shelter"
  name="shelter"
  checked={checkedDonationTypes.shelter}
  onChange={handleDonationCheckboxChange}
  className="sr-only custom-checkbox-input"
  />
  <span className="custom-checkbox-indicator"></span>
  <span className="ml-2">Shelter</span>
  </label>
  </div>
  
  {/* Checkbox for Search and Rescue */}
  <div>
  <label
  htmlFor="donation_search_rescue"
  className="flex items-center cursor-pointer text-sm"
  >
  <input
  type="checkbox"
  id="donation_search_rescue"
  name="searchAndRescue"
  checked={checkedDonationTypes.searchAndRescue}
  onChange={handleDonationCheckboxChange}
  className="sr-only custom-checkbox-input"
  />
  <span className="custom-checkbox-indicator"></span>
  <span className="ml-2">Search and Rescue</span>
  </label>
  </div>
  
  {/* Checkbox for Financial Assistance */}
  <div>
  <label
  htmlFor="donation_financial"
  className="flex items-center cursor-pointer text-sm"
  >
  <input
  type="checkbox"
  id="donation_financial"
  name="financialAssistance"
  checked={checkedDonationTypes.financialAssistance}
  onChange={handleDonationCheckboxChange}
  className="sr-only custom-checkbox-input"
  />
  <span className="custom-checkbox-indicator"></span>
  <span className="ml-2">Financial Assistance</span>
  </label>
  </div>
  
  {/* Checkbox for Counseling */}
  <div>
  <label
  htmlFor="donation_counseling"
  className="flex items-center cursor-pointer text-sm"
  >
  <input
  type="checkbox"
  id="donation_counseling"
  name="counseling"
  checked={checkedDonationTypes.counseling}
  onChange={handleDonationCheckboxChange}
  className="sr-only custom-checkbox-input"
  />
  <span className="custom-checkbox-indicator"></span>
  <span className="ml-2">Counseling</span>
  </label>
  </div>
  
  {/* Checkbox for Technical Support */}
  <div>
  <label
  htmlFor="donation_technical"
  className="flex items-center cursor-pointer text-sm"
  >
  <input
  type="checkbox"
  id="donation_technical"
  name="technicalSupport"
  checked={checkedDonationTypes.technicalSupport}
  onChange={handleDonationCheckboxChange}
  className="sr-only custom-checkbox-input"
  />
  <span className="custom-checkbox-indicator"></span>
  <span className="ml-2">Technical/Logistical Support</span>
  </label>
  </div>
  </div>
  </div>

  {/* Detailed Fields for Selected Donation Types */}
  <div className="pinkBorder p-4">
  <h1 className="text-lg font-semibold mb-3">Donation Details:</h1>
  <div className="flex flex-col gap-5">
  {/* Food Details */}
  {checkedDonationTypes.food && (
  <div className="aid-detail-section">
  <h3 className="font-semibold mb-2">Food Details:</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <div>
  <label className="block text-sm font-medium mb-1">
  Number of Food Packs: (Max: {inventoryLimits.food.maxFoodPacks})
  </label>
  <input
  type="number"
  name="food.foodPacks"
  value={donationDetails.food.foodPacks}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.food.maxFoodPacks}`}
  min="0"
  max={inventoryLimits.food.maxFoodPacks}
  />
  </div>
  <div>
  <label className="block text-sm font-medium mb-1">
  Category (Optional):
  </label>
  <select
  name="food.category"
  value={donationDetails.food.category}
  onChange={handleDonationDetailChange}
  className="inputBox w-full bg-white"
  >
  <option value="">Select Category</option>
  <option value="non-perishable">Non-Perishable</option>
  <option value="ready-to-eat">Ready-to-Eat</option>
  </select>
  </div>
  </div>
  </div>
  )}

  {/* Clothing Details */}
  {checkedDonationTypes.clothing && (
  <div className="aid-detail-section">
  <h3 className="font-semibold mb-2">Clothing Details (Counts):</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
  <div>
  <label className="block text-sm font-medium mb-1">
  Male: (Max: {inventoryLimits.clothing.maxMale})
  </label>
  <input
  type="number"
  name="clothing.male"
  value={donationDetails.clothing.male}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.clothing.maxMale}`}
  min="0"
  max={inventoryLimits.clothing.maxMale}
  />
  </div>
  <div>
  <label className="block text-sm font-medium mb-1">
  Female: (Max: {inventoryLimits.clothing.maxFemale})
  </label>
  <input
  type="number"
  name="clothing.female"
  value={donationDetails.clothing.female}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.clothing.maxFemale}`}
  min="0"
  max={inventoryLimits.clothing.maxFemale}
  />
  </div>
  <div>
  <label className="block text-sm font-medium mb-1">
  Children: (Max: {inventoryLimits.clothing.maxChildren})
  </label>
  <input
  type="number"
  name="clothing.children"
  value={donationDetails.clothing.children}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.clothing.maxChildren}`}
  min="0"
  max={inventoryLimits.clothing.maxChildren}
  />
  </div>
  </div>
  </div>
  )}

  {/* Medical Supplies Details */}
  {checkedDonationTypes.medicalSupplies && (
  <div className="aid-detail-section">
  <h3 className="font-semibold mb-2">Medical Supplies Details:</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <div>
  <label className="block text-sm font-medium mb-1">
  Total Medical Kits: (Max: {inventoryLimits.medicalSupplies.maxMedicalKits})
  </label>
  <input
  type="number"
  name="medicalSupplies.kits"
  value={donationDetails.medicalSupplies.kits}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.medicalSupplies.maxMedicalKits}`}
  min="0"
  max={inventoryLimits.medicalSupplies.maxMedicalKits}
  />
  </div>
  <div>
  <label className="block text-sm font-medium mb-1">
  Kit Type (Optional):
  </label>
  <select
  name="medicalSupplies.kitType"
  value={donationDetails.medicalSupplies.kitType}
  onChange={handleDonationDetailChange}
  className="inputBox w-full bg-white"
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

  {/* Shelter Details */}
  {checkedDonationTypes.shelter && (
  <div className="aid-detail-section">
  <h3 className="font-semibold mb-2">Shelter Details:</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <div>
  <label className="block text-sm font-medium mb-1">
  Number of Tents: (Max: {inventoryLimits.shelter.maxTents})
  </label>
  <input
  type="number"
  name="shelter.tents"
  value={donationDetails.shelter.tents}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.shelter.maxTents}`}
  min="0"
  max={inventoryLimits.shelter.maxTents}
  />
  </div>
  <div>
  <label className="block text-sm font-medium mb-1">
  Blankets/Sleeping Bags: (Max: {inventoryLimits.shelter.maxBlankets})
  </label>
  <input
  type="number"
  name="shelter.blankets"
  value={donationDetails.shelter.blankets}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.shelter.maxBlankets}`}
  min="0"
  max={inventoryLimits.shelter.maxBlankets}
  />
  </div>
  </div>
  </div>
  )}

  {/* Search and Rescue Details */}
  {checkedDonationTypes.searchAndRescue && (
  <div className="aid-detail-section">
  <h3 className="font-semibold mb-2">Search and Rescue Details:</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <div>
  <label className="block text-sm font-medium mb-1">
  Number of Rescue Kits: (Max: {inventoryLimits.searchAndRescue.maxRescueKits})
  </label>
  <input
  type="number"
  name="searchAndRescue.rescueKits"
  value={donationDetails.searchAndRescue.rescueKits}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.searchAndRescue.maxRescueKits}`}
  min="0"
  max={inventoryLimits.searchAndRescue.maxRescueKits}
  />
  </div>
  <div>
  <label className="block text-sm font-medium mb-1">
  Specialized Rescue Personnel: (Max: {inventoryLimits.searchAndRescue.maxRescuePersonnel})
  </label>
  <input
  type="number"
  name="searchAndRescue.rescuePersonnel"
  value={donationDetails.searchAndRescue.rescuePersonnel}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.searchAndRescue.maxRescuePersonnel}`}
  min="0"
  max={inventoryLimits.searchAndRescue.maxRescuePersonnel}
  />
  </div>
  </div>
  </div>
  )}

  {/* Financial Assistance Details */}
  {checkedDonationTypes.financialAssistance && (
  <div className="aid-detail-section">
  <h3 className="font-semibold mb-2">Financial Assistance Details:</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <div>
  <label className="block text-sm font-medium mb-1">
  Total Funds Available: (Max: {inventoryLimits.financialAssistance.maxFunds})
  </label>
  <input
  type="number"
  name="financialAssistance.totalFunds"
  value={donationDetails.financialAssistance.totalFunds}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.financialAssistance.maxFunds}`}
  min="0"
  step="0.01"
  max={inventoryLimits.financialAssistance.maxFunds}
  />
  </div>
  <div>
  <label className="block text-sm font-medium mb-1">
  Currency:
  </label>
  <select
  name="financialAssistance.currency"
  value={donationDetails.financialAssistance.currency}
  onChange={handleDonationDetailChange}
  className="inputBox w-full bg-white"
  >
  <option value="PHP">PHP</option>
  <option value="USD">USD</option>
  <option value="EUR">EUR</option>
  </select>
  </div>
  </div>
  </div>
  )}

  {/* Counseling Details */}
  {checkedDonationTypes.counseling && (
  <div className="aid-detail-section">
  <h3 className="font-semibold mb-2">Counseling Details:</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <div>
  <label className="block text-sm font-medium mb-1">
  Number of Counselors Available: (Max: {inventoryLimits.counseling.maxCounselors})
  </label>
  <input
  type="number"
  name="counseling.counselors"
  // --- COMPLETION START ---
  value={donationDetails.counseling.counselors}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.counseling.maxCounselors}`}
  min="0"
  max={inventoryLimits.counseling.maxCounselors}
  />
  </div>
  <div>
  <label className="block text-sm font-medium mb-1">
  Total Counseling Hours/Week: (Max: {inventoryLimits.counseling.maxHours})
  </label>
  <input
  type="number"
  name="counseling.hours"
  value={donationDetails.counseling.hours}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.counseling.maxHours}`}
  min="0"
  max={inventoryLimits.counseling.maxHours}
  />
  </div>
  </div>
  </div>
  )}

  {/* Technical Support Details */}
  {checkedDonationTypes.technicalSupport && (
  <div className="aid-detail-section">
  <h3 className="font-semibold mb-2">Technical/Logistical Support Details:</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <div>
  <label className="block text-sm font-medium mb-1">
  Number of Vehicles: (Max: {inventoryLimits.technicalSupport.maxVehicles})
  </label>
  <input
  type="number"
  name="technicalSupport.vehicles"
  value={donationDetails.technicalSupport.vehicles}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.technicalSupport.maxVehicles}`}
  min="0"
  max={inventoryLimits.technicalSupport.maxVehicles}
  />
  </div>
  <div>
  <label className="block text-sm font-medium mb-1">
  Communication Equipment Count: (Max: {inventoryLimits.technicalSupport.maxCommunication})
  </label>
  <input
  type="number"
  name="technicalSupport.communication"
  value={donationDetails.technicalSupport.communication}
  onChange={handleDonationDetailChange}
  className="inputBox w-full"
  placeholder={`e.g., up to ${inventoryLimits.technicalSupport.maxCommunication}`}
  min="0"
  max={inventoryLimits.technicalSupport.maxCommunication}
  />
  </div>
  </div>
  </div>
  )}
  {/* --- COMPLETION END --- */}
  </div>
  </div>

  {/* Donation Photo Upload */}
  <div className="pinkBorder p-4">
  <label
  htmlFor="donation_photo_input"
  className="text-lg font-semibold mb-3 block"
  >
  Donation Photo:
  </label>
  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 min-h-[100px]">
  {imagePreview ? (
  <img src={imagePreview} alt="Donation preview" className="h-24 w-auto object-contain" />
  ) : (
  <CiCirclePlus size={40} className="text-gray-400" />
  )}
  <input
  id="donation_photo_input"
  type="file"
  accept="image/*"
  className="sr-only"
  onChange={handleImageChange}
  />
  </div>
  </div>

  {/* Estimated Drop-off Date */}
  <div className="pinkBorder p-4">
  <label
  htmlFor="donation_date"
  className="text-lg font-semibold mb-3 block"
  >
  Estimated Drop-off Date:
  </label>
  <input
  id="donation_date"
  type="date"
  className="inputBox w-full max-w-xs"
  value={donationDate}
  onChange={handleDateChange}
  />
  </div>
  </div>

  {/* Submit Button */}
  <div className="flex justify-end pt-2 mb-4">
  <button
  type="submit"
  className="px-6 py-2 bg-[#B3002A] text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
  >
  Submit Donation
  </button>
  </div>
  </form>
  );
 };

 export default DonationPageForm;