'use client';
import React, { useState } from 'react'; // Import useState for component state
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

  // State for the 'Others' checkbox visibility
  const [isOthersChecked, setIsOthersChecked] = useState(false);
  // State for the 'Others' text input value
  const [othersValue, setOthersValue] = useState('');

  // --- You would likely need state for all checkboxes to collect data ---
  // Example:
  // const [donationPurposes, setDonationPurposes] = useState({
  //   food: false,
  //   clothing: false,
  //   shelter: false,
  //   hygiene: false,
  //   medical: false,
  //   school: false,
  //   blankets: false,
  //   others: false, // Mirror isOthersChecked or handle separately
  // });
  // const [donationDate, setDonationDate] = useState('');
  // const [donationImage, setDonationImage] = useState<File | null>(null);
  // const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Handler for the 'Others' checkbox change
  const handleOthersCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = event.target.checked;
    setIsOthersChecked(isChecked);
    // Optionally clear the text input when 'Others' is unchecked
    if (!isChecked) {
      setOthersValue('');
    }
    // --- Update your main state object if managing all checkboxes ---
    // setDonationPurposes(prev => ({ ...prev, others: isChecked }));
  };

  // Handler for the 'Others' text input change
  const handleOthersInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOthersValue(event.target.value);
    // --- Update your main state object or keep separate ---
  };

  // --- Add handlers for other checkboxes, date input, image input ---
  // const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, checked } = event.target;
  //   setDonationPurposes(prev => ({ ...prev, [name]: checked }));
  // };
  // const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //    setDonationDate(event.target.value);
  // }
  // const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.files && event.target.files[0]) {
  //     const file = event.target.files[0];
  //     setDonationImage(file);
  //     setImagePreview(URL.createObjectURL(file));
  //   } else {
  //       setDonationImage(null);
  //       setImagePreview(null);
  //   }
  // };

  // --- Handler for form submission ---
  // const handleSubmit = (event: React.FormEvent) => {
  //   event.preventDefault();
  //   // Collate data from state (donationPurposes, othersValue, donationDate, donationImage)
  //   // and submit it (e.g., send to an API)
  //   console.log('Submitting donation data:', {
  //       purposes: donationPurposes,
  //       otherDetails: othersValue,
  //       date: donationDate,
  //       image: donationImage?.name
  //   });
  // };

  // Display loading or message if data hasn't been fetched yet
  if (!fetchedOrgData) {
    // Consider a more sophisticated loading state
    return <p>Loading organization details or details are not available.</p>;
  }

  return (
    // Consider wrapping in a <form onSubmit={handleSubmit}>
    <div className="h-full">
      {/* Date and Time Display */}
      <div className="mb-4 text-sm text-black">
        {' '}
        {/* Added margin and styling */}
        <h2>Date: {format(now, 'MMMM d, yyyy')}</h2>{' '}
        {/* Corrected year format */}
        <h2>Time: {format(now, 'h:mm a')}</h2>
      </div>
      {/* Organization Details */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 md:gap-16 lg:gap-32 justify-between sm:justify-evenly mt-4 mb-6 border-b pb-4">
        {' '}
        {/* Responsive layout, border */}
        <div className="flex flex-col text-start gap-1 sm:gap-2">
          {' '}
          {/* Reduced gap */}
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
          {' '}
          {/* Reduced gap */}
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
        {' '}
        {/* Add space between inner sections */}
        {/* Purpose of Donation Checkboxes */}
        {/* Purpose of Donation Checkboxes */}
        <div className="pinkBorder p-4">
          <h1 className="text-lg font-semibold mb-3">Purpose of Donation:</h1>
          {/* Changed to Grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            {' '}
            {/* Adjusted gap-y */}
            {/* Item 1: Food */}
            <div className="flex flex-col">
              {' '}
              {/* Wrapper for each item */}
              <label
                htmlFor="donation_food"
                className="flex items-center cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  id="donation_food"
                  name="food"
                  value="food"
                  className="sr-only custom-checkbox-input" /* Add state handlers */
                />
                <span className="custom-checkbox-indicator"></span>
                <span className="ml-2">Food</span>
              </label>
              <span className="ml-7 text-xs text-gray-500 mt-1">
                {' '}
                {/* Stock text, indented and styled */}
                Stock: {/* Add real stock here later */}
              </span>
            </div>
            {/* Item 2: Clothing */}
            <div className="flex flex-col">
              <label
                htmlFor="donation_clothing"
                className="flex items-center cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  id="donation_clothing"
                  name="clothing"
                  value="clothing"
                  className="sr-only custom-checkbox-input" /* Add state handlers */
                />
                <span className="custom-checkbox-indicator"></span>
                <span className="ml-2">Clothing</span>
              </label>
              <span className="ml-7 text-xs text-gray-500 mt-1">Stock:</span>
            </div>
            {/* Item 3: Tent/Shelter Materials */}
            <div className="flex flex-col">
              <label
                htmlFor="donation_shelter"
                className="flex items-center cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  id="donation_shelter"
                  name="shelter"
                  value="shelter"
                  className="sr-only custom-checkbox-input" /* Add state handlers */
                />
                <span className="custom-checkbox-indicator"></span>
                <span className="ml-2">Tent/Shelter Materials</span>
              </label>
              <span className="ml-7 text-xs text-gray-500 mt-1">Stock:</span>
            </div>
            {/* Item 4: Hygiene Kits */}
            <div className="flex flex-col">
              <label
                htmlFor="donation_hygiene"
                className="flex items-center cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  id="donation_hygiene"
                  name="hygiene"
                  value="hygiene"
                  className="sr-only custom-checkbox-input" /* Add state handlers */
                />
                <span className="custom-checkbox-indicator"></span>
                <span className="ml-2">Hygiene Kits</span>
              </label>
              <span className="ml-7 text-xs text-gray-500 mt-1">Stock:</span>
            </div>
            {/* Item 5: Medical Supplies */}
            <div className="flex flex-col">
              <label
                htmlFor="donation_medical"
                className="flex items-center cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  id="donation_medical"
                  name="medical"
                  value="medical"
                  className="sr-only custom-checkbox-input" /* Add state handlers */
                />
                <span className="custom-checkbox-indicator"></span>
                <span className="ml-2">Medical Supplies</span>
              </label>
              <span className="ml-7 text-xs text-gray-500 mt-1">Stock:</span>
            </div>
            {/* Item 6: School Supplies */}
            <div className="flex flex-col">
              <label
                htmlFor="donation_school"
                className="flex items-center cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  id="donation_school"
                  name="school"
                  value="school"
                  className="sr-only custom-checkbox-input" /* Add state handlers */
                />
                <span className="custom-checkbox-indicator"></span>
                <span className="ml-2">School Supplies</span>
              </label>
              <span className="ml-7 text-xs text-gray-500 mt-1">Stock:</span>
            </div>
            {/* Item 7: Blankets/Mattresses */}
            <div className="flex flex-col">
              <label
                htmlFor="donation_blankets"
                className="flex items-center cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  id="donation_blankets"
                  name="blankets"
                  value="blankets"
                  className="sr-only custom-checkbox-input" /* Add state handlers */
                />
                <span className="custom-checkbox-indicator"></span>
                <span className="ml-2">Blankets/Mattresses</span>
              </label>
              <span className="ml-7 text-xs text-gray-500 mt-1">Stock:</span>
            </div>
            {/* Item 8: Others */}
            <div className="flex flex-col">
              {' '}
              {/* Wrapper for Others item */}
              <label
                htmlFor="donation_others"
                className="flex items-center cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  id="donation_others"
                  name="others"
                  value="others"
                  className="sr-only custom-checkbox-input"
                  checked={isOthersChecked}
                  onChange={handleOthersCheckboxChange}
                />
                <span className="custom-checkbox-indicator"></span>
                <span className="ml-2">Others:</span>
              </label>
              {/* No "Stock:" text needed for "Others", but keep conditional input */}
              {isOthersChecked && (
                <input
                  type="text"
                  placeholder="Please specify"
                  value={othersValue}
                  onChange={handleOthersInputChange}
                  className="inputBox ml-7 mt-1 w-full max-w-xs" // Keep styling
                  aria-label="Specify other donation purpose"
                />
              )}
            </div>
          </div>{' '}
          {/* End Grid */}
        </div>{' '}
        {/* End pinkBorder */}
        {/* Donation Photo Upload */}
        <div className="pinkBorder p-4">
          <label
            htmlFor="donation_photo_input"
            className="text-lg font-semibold mb-3 block"
          >
            Donation Photo:
          </label>{' '}
          {/* Make label clickable */}
          <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 min-h-[100px]">
            {/* Image Preview or Icon */}
            {/* {imagePreview ? (
              <img src={imagePreview} alt="Donation preview" className="h-24 w-auto object-contain" />
            ) : (
              <CiCirclePlus size={40} className="text-gray-400" />
            )} */}
            <CiCirclePlus size={40} className="text-gray-400" />{' '}
            {/* Simpler placeholder */}
            <input
              id="donation_photo_input"
              type="file"
              accept="image/*"
              className="sr-only"
              /* onChange={handleImageChange} */
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
          </label>{' '}
          {/* Make label clickable */}
          <input
            id="donation_date"
            type="date"
            className="inputBox w-full max-w-xs"
            /* value={donationDate} onChange={handleDateChange} */
          />
        </div>
      </div>{' '}
      <div className="flex justify-end pt-2 mb-4">
        <button
          type="submit"
          className="px-6 py-2 bg-[#B3002A] text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Submit Donation
        </button>
      </div>
      {/* End pinkContainerBorder */}
    </div> // End main div (or form)
  );
};

export default DonationPageForm;
