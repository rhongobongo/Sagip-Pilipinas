'use client';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { CiCirclePlus } from 'react-icons/ci';

// Define the shape of the props it expects (the fetched data)
interface OrganizationData {
  name?: string;
  location?: string;
  contactNumber?: string;
  email?: string;
  // Add other fields if passed from the parent
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

  // Handler for donation details changes
  const handleDonationDetailChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    const [category, field] = name.split('.');

    setDonationDetails((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value,
      },
    }));
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
      setImagePreview(URL.createObjectURL(file));
    } else {
      setDonationImage(null);
      setImagePreview(null);
    }
  };

  // Handler for form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Collate data from state and submit it (e.g., send to an API)
    console.log('Submitting donation data:', {
      donationTypes: checkedDonationTypes,
      details: donationDetails,
      date: donationDate,
      image: donationImage?.name,
    });
  };

  // Display loading or message if data hasn't been fetched yet
  if (!fetchedOrgData) {
    return <p>Loading organization details or details are not available.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="h-full">
      {/* Date and Time Display */}
      <div className="mb-4 text-sm text-black">
        <h2>Date: {format(now, 'MMMM d, yyyy')}</h2>
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
            {/* Using the checkboxes that match the image */}
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
                      Number of Food Packs:
                    </label>
                    <input
                      type="number"
                      name="food.foodPacks"
                      value={donationDetails.food.foodPacks}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
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
                    <label className="block text-sm font-medium mb-1">Male:</label>
                    <input
                      type="number"
                      name="clothing.male"
                      value={donationDetails.clothing.male}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
                      placeholder="e.g., 50"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Female:</label>
                    <input
                      type="number"
                      name="clothing.female"
                      value={donationDetails.clothing.female}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
                      placeholder="e.g., 50"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Children:</label>
                    <input
                      type="number"
                      name="clothing.children"
                      value={donationDetails.clothing.children}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
                      placeholder="e.g., 30"
                      min="0"
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
                      Total Medical Kits:
                    </label>
                    <input
                      type="number"
                      name="medicalSupplies.kits"
                      value={donationDetails.medicalSupplies.kits}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
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
                      Number of Tents:
                    </label>
                    <input
                      type="number"
                      name="shelter.tents"
                      value={donationDetails.shelter.tents}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
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
                      value={donationDetails.shelter.blankets}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
                      placeholder="e.g., 100"
                      min="0"
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
                      Number of Rescue Kits:
                    </label>
                    <input
                      type="number"
                      name="searchAndRescue.rescueKits"
                      value={donationDetails.searchAndRescue.rescueKits}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
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
                      value={donationDetails.searchAndRescue.rescuePersonnel}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
                      placeholder="e.g., 5"
                      min="0"
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
                      Total Funds Available:
                    </label>
                    <input
                      type="number"
                      name="financialAssistance.totalFunds"
                      value={donationDetails.financialAssistance.totalFunds}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
                      placeholder="e.g., 50000"
                      min="0"
                      step="0.01"
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
                      Number of Counselors Available:
                    </label>
                    <input
                      type="number"
                      name="counseling.counselors"
                      value={donationDetails.counseling.counselors}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
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
                      value={donationDetails.counseling.hours}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
                      placeholder="e.g., 40"
                      min="0"
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
                      Number of Vehicles:
                    </label>
                    <input
                      type="number"
                      name="technicalSupport.vehicles"
                      value={donationDetails.technicalSupport.vehicles}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
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
                      value={donationDetails.technicalSupport.communication}
                      onChange={handleDonationDetailChange}
                      className="inputBox w-full"
                      placeholder="e.g., 10 radios"
                      min="0"
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