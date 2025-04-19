'use client';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CiCirclePlus } from 'react-icons/ci';
import {
 CheckedDonationTypes,
 DonationDetails,
 FoodDetails,
 ClothingDetails,
 MedicalSuppliesDetails,
 ShelterDetails,
 SearchAndRescueDetails,
 FinancialAssistanceDetails,
 CounselingDetails,
 TechnicalSupportDetails,
} from './types';
import { donate, uploadDonation } from '@/lib/APICalls/Donation';

// Updated interface to match the server component
interface OrganizationData {
 id: string;
 email?: string;
 name?: string;
 location?: string;
 contactNumber?: string;
 // Update to match the structure from registerOrganization
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
 // Note: The instructions mentioned adding an optional prop,
 // but the implementation uses state derived from URL params.
}

const DonationPageForm: React.FC<DonationPageFormProps> = ({
 fetchedOrgData,
}) => {
 const now = new Date();

 // Add state to track the selected aid request ID
 const [selectedAidRequestId, setSelectedAidRequestId] = useState<string | null>(null);

 // Listen for query parameter changes
 useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const aidRequestId = searchParams.get('aidRequestId');
  if (aidRequestId) {
   setSelectedAidRequestId(aidRequestId);
  }
 }, []);


 const [checkedDonationTypes, setCheckedDonationTypes] =
  useState<CheckedDonationTypes>({
   food: false,
   clothing: false,
   medicalSupplies: false,
   shelter: false,
   searchAndRescue: false,
   financialAssistance: false,
   counseling: false,
   technicalSupport: false,
  });

 const [donationDetails, setDonationDetails] = useState<DonationDetails>({
  food: {
   foodPacks: '',
   category: '',
  } as FoodDetails,
  clothing: {
   male: '',
   female: '',
   children: '',
  } as ClothingDetails,
  medicalSupplies: {
   kits: '',
   kitType: '',
  } as MedicalSuppliesDetails,
  shelter: {
   tents: '',
   blankets: '',
  } as ShelterDetails,
  searchAndRescue: {
   rescueKits: '',
   rescuePersonnel: '',
  } as SearchAndRescueDetails,
  financialAssistance: {
   totalFunds: '',
   currency: 'PHP',
  } as FinancialAssistanceDetails,
  counseling: {
   counselors: '',
   hours: '',
  } as CounselingDetails,
  technicalSupport: {
   vehicles: '',
   communication: '',
  } as TechnicalSupportDetails,
 });

 // State for donation date and image
 const [donationDate, setDonationDate] = useState('');
 const [donationImage, setDonationImage] = useState<File | null>(null);
 const [imagePreview, setImagePreview] = useState<string | null>(null);

 const inventoryLimits = {
  food: {
   maxFoodPacks: fetchedOrgData?.aidStock?.food?.foodPacks,
  },
  clothing: {
   maxMale: fetchedOrgData?.aidStock?.clothing?.male,
   maxFemale: fetchedOrgData?.aidStock?.clothing?.female,
   maxChildren: fetchedOrgData?.aidStock?.clothing?.children,
  },
  medicalSupplies: {
   maxMedicalKits: fetchedOrgData?.aidStock?.medicalSupplies?.kits,
  },
  shelter: {
   maxTents: fetchedOrgData?.aidStock?.shelter?.tents,
   maxBlankets: fetchedOrgData?.aidStock?.shelter?.blankets,
  },
  searchAndRescue: {
   maxRescueKits: fetchedOrgData?.aidStock?.searchAndRescue?.rescueKits,
   maxRescuePersonnel:
    fetchedOrgData?.aidStock?.searchAndRescue?.rescuePersonnel,
  },
  financialAssistance: {
   maxFunds: fetchedOrgData?.aidStock?.financialAssistance?.totalFunds,
  },
  counseling: {
   maxCounselors: fetchedOrgData?.aidStock?.counseling?.counselors,
   maxHours: fetchedOrgData?.aidStock?.counseling?.hours,
  },
  technicalSupport: {
   maxVehicles: fetchedOrgData?.aidStock?.technicalSupport?.vehicles,
   maxCommunication:
    fetchedOrgData?.aidStock?.technicalSupport?.communication,
  },
 };

 // Initialize checkboxes based on available aid types
 useEffect(() => {
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
  const [category, field] = name.split('.') as [
   keyof typeof donationDetails,
   string,
  ]; // Type assertion needed

  // Apply max limit validation only for number inputs
  if (event.target.type === 'number') {
   let maxValue: number | undefined = undefined;

   // Determine the max value based on category and field
   if (category === 'food' && field === 'foodPacks')
    maxValue = inventoryLimits.food.maxFoodPacks ?? 0;
   else if (category === 'clothing' && field === 'male')
    maxValue = inventoryLimits.clothing.maxMale ?? 0;
   else if (category === 'clothing' && field === 'female')
    maxValue = inventoryLimits.clothing.maxFemale ?? 0;
   else if (category === 'clothing' && field === 'children')
    maxValue = inventoryLimits.clothing.maxChildren ?? 0;
   else if (category === 'medicalSupplies' && field === 'kits')
    maxValue = inventoryLimits.medicalSupplies.maxMedicalKits ?? 0;
   else if (category === 'shelter' && field === 'tents')
    maxValue = inventoryLimits.shelter.maxTents ?? 0;
   else if (category === 'shelter' && field === 'blankets')
    maxValue = inventoryLimits.shelter.maxBlankets ?? 0;
   else if (category === 'searchAndRescue' && field === 'rescueKits')
    maxValue = inventoryLimits.searchAndRescue.maxRescueKits ?? 0;
   else if (category === 'searchAndRescue' && field === 'rescuePersonnel')
    maxValue = inventoryLimits.searchAndRescue.maxRescuePersonnel ?? 0;
   else if (category === 'financialAssistance' && field === 'totalFunds')
    maxValue = inventoryLimits.financialAssistance.maxFunds ?? 0;
   else if (category === 'counseling' && field === 'counselors')
    maxValue = inventoryLimits.counseling.maxCounselors ?? 0;
   else if (category === 'counseling' && field === 'hours')
    maxValue = inventoryLimits.counseling.maxHours ?? 0;
   else if (category === 'technicalSupport' && field === 'vehicles')
    maxValue = inventoryLimits.technicalSupport.maxVehicles ?? 0;
   else if (category === 'technicalSupport' && field === 'communication')
    maxValue = inventoryLimits.technicalSupport.maxCommunication ?? 0;

   // Validate and potentially cap the value
   if (maxValue !== undefined) {
    const numValue =
     field === 'totalFunds' ? parseFloat(value) : parseInt(value); // Use parseFloat for funds
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
   const currentCategoryDetails = prev[category] || {};
   return {
    ...prev,
    [category]: {
     ...currentCategoryDetails,
     [field]: value,
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
  if (event.target.files?.[0]) {
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

 // Modify the handleSubmit function to include the aid request ID
 const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();

  const checkedDonationTypesToSend: CheckedDonationTypes = Object.fromEntries(
   Object.entries(checkedDonationTypes).filter(([, isChecked]) => isChecked)
  ) as CheckedDonationTypes;

  const filteredDonationDetails: Partial<DonationDetails> = {}; // Use Partial here

  for (const key in checkedDonationTypesToSend) {
   if (checkedDonationTypesToSend[key as keyof CheckedDonationTypes]) {
    switch (key) {
     case 'food':
      filteredDonationDetails[key] = donationDetails[key] as FoodDetails;
      break;
     case 'clothing':
      filteredDonationDetails[key] = donationDetails[
       key
      ] as ClothingDetails;
      break;
     case 'medicalSupplies':
      filteredDonationDetails[key] = donationDetails[
       key
      ] as MedicalSuppliesDetails;
      break;
     case 'shelter':
      filteredDonationDetails[key] = donationDetails[
       key
      ] as ShelterDetails;
      break;
     case 'searchAndRescue':
      filteredDonationDetails[key] = donationDetails[
       key
      ] as SearchAndRescueDetails;
      break;
     case 'financialAssistance':
      filteredDonationDetails[key] = donationDetails[
       key
      ] as FinancialAssistanceDetails;
      break;
     case 'counseling':
      filteredDonationDetails[key] = donationDetails[
       key
      ] as CounselingDetails;
      break;
     case 'technicalSupport':
      filteredDonationDetails[key] = donationDetails[
       key
      ] as TechnicalSupportDetails;
      break;
    }
   }
  }

  if (!fetchedOrgData) return;
  const response = await donate(
   checkedDonationTypesToSend,
   filteredDonationDetails,
   donationDate,
   fetchedOrgData.id,
   selectedAidRequestId // Add this parameter
  );

  if (response.success) {
   if (!donationImage || !response.donationUID) return;
   await uploadDonation(donationImage, response.donationUID);
   // Add success handling logic (e.g., show message, redirect)
   console.log('Donation submitted successfully for Aid Request:', selectedAidRequestId);
  } else {
   // Add error handling logic
   console.error('Donation failed:', response.error);
  }
 };

 // Display loading or message if data hasn't been fetched yet
 if (!fetchedOrgData) {
  return <p>Loading organization details or details are not available.</p>;
 }

 // Add UI to show which aid request is being donated to
 return (
  <form onSubmit={handleSubmit} className="h-full mx-4 mt-4">
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
      <h2 className="text-sm"> {fetchedOrgData.name ?? 'N/A'}</h2>
     </div>
     <div className="flex">
      <h2 className="font-semibold mr-1 text-sm">Office Address:</h2>
      <h2 className="text-sm">{fetchedOrgData.location ?? 'N/A'}</h2>
     </div>
    </div>
    <div className="flex flex-col text-start gap-1 sm:gap-2">
     <div className="flex">
      <h2 className="font-semibold mr-1 text-sm">Contact #:</h2>
      <h2 className="text-sm">{fetchedOrgData.contactNumber ?? 'N/A'}</h2>
     </div>
     <div className="flex">
      <h2 className="font-semibold mr-1 text-sm">Email Address:</h2>
      <h2 className="text-sm">{fetchedOrgData.email ?? 'N/A'}</h2>
     </div>
    </div>
   </div>

   {/* Donation Form Sections */}
   <div className="pinkContainerBorder space-y-4">

    {/* Display selected aid request if any */}
    {selectedAidRequestId && (
     <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
      <h3 className="text-md font-semibold text-red-700">
       Donating to Aid Request ID: {selectedAidRequestId}
      </h3>
     </div>
    )}

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
           Number of Food Packs: (Max:{' '}
           {inventoryLimits.food.maxFoodPacks})
          </label>
          <input
           type="number"
           name="food.foodPacks"
           value={donationDetails.food?.foodPacks}
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
           value={donationDetails.food?.category}
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
        <h3 className="font-semibold mb-2">
         Clothing Details (Counts):
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
         <div>
          <label className="block text-sm font-medium mb-1">
           Male: (Max: {inventoryLimits.clothing.maxMale})
          </label>
          <input
           type="number"
           name="clothing.male"
           value={donationDetails.clothing?.male}
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
           value={donationDetails.clothing?.female}
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
           value={donationDetails.clothing?.children}
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
        <h3 className="font-semibold mb-2">
         Medical Supplies Details:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
         <div>
          <label className="block text-sm font-medium mb-1">
           Total Medical Kits: (Max:{' '}
           {inventoryLimits.medicalSupplies.maxMedicalKits})
          </label>
          <input
           type="number"
           name="medicalSupplies.kits"
           value={donationDetails.medicalSupplies?.kits}
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
           value={donationDetails.medicalSupplies?.kitType}
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
           value={donationDetails.shelter?.tents}
           onChange={handleDonationDetailChange}
           className="inputBox w-full"
           placeholder={`e.g., up to ${inventoryLimits.shelter.maxTents}`}
           min="0"
           max={inventoryLimits.shelter.maxTents}
          />
         </div>
         <div>
          <label className="block text-sm font-medium mb-1">
           Blankets/Sleeping Bags: (Max:{' '}
           {inventoryLimits.shelter.maxBlankets})
          </label>
          <input
           type="number"
           name="shelter.blankets"
           value={donationDetails.shelter?.blankets}
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
        <h3 className="font-semibold mb-2">
         Search and Rescue Details:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
         <div>
          <label className="block text-sm font-medium mb-1">
           Number of Rescue Kits: (Max:{' '}
           {inventoryLimits.searchAndRescue.maxRescueKits})
          </label>
          <input
           type="number"
           name="searchAndRescue.rescueKits"
           value={donationDetails.searchAndRescue?.rescueKits}
           onChange={handleDonationDetailChange}
           className="inputBox w-full"
           placeholder={`e.g., up to ${inventoryLimits.searchAndRescue.maxRescueKits}`}
           min="0"
           max={inventoryLimits.searchAndRescue.maxRescueKits}
          />
         </div>
         <div>
          <label className="block text-sm font-medium mb-1">
           Specialized Rescue Personnel: (Max:{' '}
           {inventoryLimits.searchAndRescue.maxRescuePersonnel})
          </label>
          <input
           type="number"
           name="searchAndRescue.rescuePersonnel"
           value={donationDetails.searchAndRescue?.rescuePersonnel}
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
        <h3 className="font-semibold mb-2">
         Financial Assistance Details:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
         <div>
          <label className="block text-sm font-medium mb-1">
           Total Funds Available: (Max:{' '}
           {inventoryLimits.financialAssistance.maxFunds})
          </label>
          <input
           type="number"
           name="financialAssistance.totalFunds"
           value={donationDetails.financialAssistance?.totalFunds}
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
           value={donationDetails.financialAssistance?.currency}
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
           Number of Counselors Available: (Max:{' '}
           {inventoryLimits.counseling.maxCounselors})
          </label>
          <input
           type="number"
           name="counseling.counselors"
           value={donationDetails.counseling?.counselors}
           onChange={handleDonationDetailChange}
           className="inputBox w-full"
           placeholder={`e.g., up to ${inventoryLimits.counseling.maxCounselors}`}
           min="0"
           max={inventoryLimits.counseling.maxCounselors}
          />
         </div>
         <div>
          <label className="block text-sm font-medium mb-1">
           Total Counseling Hours/Week: (Max:{' '}
           {inventoryLimits.counseling.maxHours})
          </label>
          <input
           type="number"
           name="counseling.hours"
           value={donationDetails.counseling?.hours}
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
        <h3 className="font-semibold mb-2">
         Technical/Logistical Support Details:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
         <div>
          <label className="block text-sm font-medium mb-1">
           Number of Vehicles: (Max:{' '}
           {inventoryLimits.technicalSupport.maxVehicles})
          </label>
          <input
           type="number"
           name="technicalSupport.vehicles"
           value={donationDetails.technicalSupport?.vehicles}
           onChange={handleDonationDetailChange}
           className="inputBox w-full"
           placeholder={`e.g., up to ${inventoryLimits.technicalSupport.maxVehicles}`}
           min="0"
           max={inventoryLimits.technicalSupport.maxVehicles}
          />
         </div>
         <div>
          <label className="block text-sm font-medium mb-1">
           Communication Equipment Count: (Max:{' '}
           {inventoryLimits.technicalSupport.maxCommunication})
          </label>
          <input
           type="number"
           name="technicalSupport.communication"
           value={donationDetails.technicalSupport?.communication}
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

     <label
      htmlFor="donation_photo_input"
      className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 min-h-[100px]"
     >
      {imagePreview ? (
       <img
        src={imagePreview}
        alt="Donation preview"
        className="h-24 w-auto object-contain"
       />
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
     </label>
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
   <div className="flex justify-center sm:justify-end pt-2 mb-4">
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