'use client';

import { useState, useEffect, useRef } from 'react';
import { RequestPin } from '@/types/types';
import { requestAid } from '@/components/map/SubmitAid';
import { uploadImage } from './uploadImage';
import { format } from 'date-fns';
import emailjs from '@emailjs/browser';
import { getDistance } from 'geolib';
// import { GeoPoint } from 'firebase/firestore'; // Client-side GeoPoint if needed

interface RequestFormProps {
  pin: RequestPin | null;
}

// Define a type for the organization data we need
type OrgData = {
  userId: string;
  coordinates: { latitude: number; longitude: number };
  email: string;
  name: string;
  // include other fields if needed by your template
};

const RequestAidForm: React.FC<RequestFormProps> = ({ pin }) => {
  // --- State ---
  const [name, setName] = useState('');
  const [contactNum, setContactNum] = useState('');
  const [calamityLevel, setCalamityLevel] = useState('');
  const [calamityType, setCalamityType] = useState('');
  const [otherCalamity, setOtherCalamity] = useState('');
const [aidNeeded, setAidNeeded] = useState('');
  const [otherAidRequest, setOtherAidRequest] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [shortDesc, setShortDesc] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmittingConfirmation, setIsSubmittingConfirmation] =
    useState(false);
  const [statusMessage, setStatusMessage] = useState(''); // Added for better feedback
  const [organizations, setOrganizations] = useState<OrgData[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

  // --- EmailJS Configuration ---
  const YOUR_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const YOUR_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID; // Template for Org Notifications
  const YOUR_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  // --- Fetch Organizations on Mount ---
  useEffect(() => {
    const fetchOrgs = async () => {
      console.log('Fetching organizations...');
      setIsLoadingOrgs(true);
      setOrganizations([]);

      try {
        const response = await fetch('/api/organizations');
        if (!response.ok) {
          throw new Error(
            `Failed to fetch organizations: ${response.statusText}`
          );
        }
        const data = await response.json();
        console.log('Raw organization data from API:', data); // Debugging log

        // Filter for organizations with valid coordinates and email
        type RawOrgData = {
          userId: string;
          coordinates?: {
            latitude?: number;
            longitude?: number;
          };
          email?: string;
          name?: string;
          // Add other fields as needed
        };

        // Then use this type in the filter function
        const validOrgs = data.filter((org: RawOrgData) => {
          const lat = org?.coordinates?.latitude;
          const lng = org?.coordinates?.longitude;
          const email = org?.email;
          const hasValidCoords =
            typeof lat === 'number' && typeof lng === 'number';
          const hasValidEmail =
            typeof email === 'string' && email.includes('@');
          return hasValidCoords && hasValidEmail;
        });

        setOrganizations(validOrgs);
        console.log(
          `Client Filtering Result: Kept ${validOrgs.length} valid organizations.`
        );
      } catch (error) {
        console.error('Error fetching or processing organizations:', error);
        setStatusMessage(
          `Error loading organization data: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setIsLoadingOrgs(false);
      }
    };
    fetchOrgs();
  }, []); // Empty dependency array ensures this runs once on mount

  // --- Update coordinates when pin changes ---
  useEffect(() => {
    if (pin && pin.coordinates) {
      setLatitude(pin.coordinates.latitude);
      setLongitude(pin.coordinates.longitude);
    } else {
      setLatitude(null);
      setLongitude(null);
    }
  }, [pin]);

  // --- Handlers ---
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add basic validation before opening confirmation
    if (
      !pin ||
      !image ||
      !name ||
      !contactNum ||
      !calamityType ||
      !calamityLevel ||
      !shortDesc
    ) {
      alert(
        'Please fill out all fields, select a location on the map, and attach an image.'
      );
      return;
    }
    if (isLoadingOrgs) {
      alert('Organization data is still loading, please wait a moment.');
      return;
    }
    setIsConfirmationOpen(true);
  };

  const cancelSubmission = () => {
    setIsConfirmationOpen(false);
  };

  // --- Main Submission Logic ---
  const confirmSubmission = async () => {
    setIsSubmittingConfirmation(true);
    setStatusMessage('Submitting aid request...');
    let submissionError: Error | null = null; // Store potential error object
    let finalRequestId: string | null = null; // Store the ID for logging/use

    // --- 1. Prerequisites Check ---
    // Check for missing essential data before proceeding
    if (!pin || typeof latitude !== 'number' || typeof longitude !== 'number') {
      alert('Error: Location not selected on the map. Please place a pin.');
      setIsConfirmationOpen(false);
      setIsSubmittingConfirmation(false);
      setStatusMessage('Submission failed: Location missing.');
      return;
    }
    if (!image) {
      alert('Error: Image missing. Please attach an image.');
      setIsConfirmationOpen(false);
      setIsSubmittingConfirmation(false);
      setStatusMessage('Submission failed: Image missing.');
      return;
    }
    if (!YOUR_SERVICE_ID || !YOUR_TEMPLATE_ID || !YOUR_PUBLIC_KEY) {
      console.error('EmailJS environment variables not set!');
      alert('Configuration error. Cannot send notifications.');
      setIsConfirmationOpen(false);
      setIsSubmittingConfirmation(false);
      setStatusMessage('Submission failed: Email configuration error.');
      return;
    }
    if (!name || !contactNum || !calamityType || !calamityLevel || !shortDesc) {
      alert('Please ensure all required form fields are filled.');
      setIsConfirmationOpen(false);
      setIsSubmittingConfirmation(false);
      setStatusMessage('Submission failed: Required fields missing.');
      return;
    }

    try {
      // --- 2. Upload Image ---
      console.log('Uploading image...');
      // Use non-null assertion for image because we checked it above
      const uploadedImageUrl: string = await uploadImage(image!);
      console.log('Image uploaded:', uploadedImageUrl);

      // --- 3. Prepare Aid Request Data ---
      const formattedDate = format(new Date(), 'MMMM dd, yyyy');
      const formattedTime = format(new Date(), 'h:mm a');

      // Construct the data object for Firestore, assert non-null for checked values
      const finalAidRequestData: RequestPin = {
        ...pin, // Spread the pin object
        name,
        contactNum,
        calamityLevel,
        calamityType: calamityType === 'other' ? otherCalamity : calamityType,
        shortDesc,
        imageURL: uploadedImageUrl,
        submissionDate: formattedDate,
        submissionTime: formattedTime,
        coordinates: { latitude: latitude!, longitude: longitude! }, // Use confirmed non-null coords
        aidNeeded: aidNeeded === 'other' ? otherAidRequest : aidNeeded,
      };

      // --- 4. Submit Aid Request to Firestore & Get ID ---
      console.log('Submitting aid request to Firestore...');
      // Call the server action and destructure the returned object
      const submissionResult = await requestAid(finalAidRequestData);

      // Check if the expected properties were returned
      if (!submissionResult || !submissionResult.requestId) {
        throw new Error(
          'Failed to get request ID after submission from server action.'
        );
      }
      finalRequestId = submissionResult.requestId; // Store the ID
      console.log('Aid Request submitted successfully. ID:', finalRequestId);
      setStatusMessage('Aid request submitted. Processing notifications...');

      // --- 5. Prepare for Email Notifications ---
      const requestCoords = { latitude: latitude!, longitude: longitude! };
      const MAX_DISTANCE_METERS = 30 * 1000; // 30km

      const nearbyOrgs = organizations.filter((org) => {
        if (
          !org.coordinates ||
          typeof org.coordinates.latitude !== 'number' ||
          typeof org.coordinates.longitude !== 'number'
        ) {
          console.warn(
            `Filtering out org ${org.userId} due to invalid/missing coordinates.`
          ); // Keep warning explanation
          return false;
        }
        const distance = getDistance(requestCoords, org.coordinates);
        return distance <= MAX_DISTANCE_METERS;
      });

      console.log(`Found ${nearbyOrgs.length} nearby organizations to notify.`);

      // --- 6. Send Emails (if nearby orgs found) ---
      if (nearbyOrgs.length > 0) {
        let emailSuccessCount = 0;
        let emailFailCount = 0;

        const appBaseUrl =
          process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
        const requestLink = `${appBaseUrl}/news/${finalRequestId}`; // Use the obtained ID

        // Prepare base parameters (using data from finalAidRequestData)
        const templateParamsBase = {
          request_type: finalAidRequestData.calamityType || 'N/A',
          request_level: finalAidRequestData.calamityLevel || 'N/A',
          request_desc: finalAidRequestData.shortDesc || 'N/A',
          requester_name: finalAidRequestData.name || 'N/A',
          requester_contact: finalAidRequestData.contactNum || 'N/A',
          submission_date: finalAidRequestData.submissionDate || '',
          submission_time: finalAidRequestData.submissionTime || '',
          request_image_url: finalAidRequestData.imageURL || '',
          request_link: requestLink, // Include the generated link
        };

        // Loop and send emails
        for (const org of nearbyOrgs) {
          const templateParams = {
            ...templateParamsBase,
            org_name: org.name || 'Organization',
            to_email: org.email,
          };
          type EmailJSError = {
            text?: string;
            message?: string;
          };

          try {
            await emailjs.send(
              YOUR_SERVICE_ID!,
              YOUR_TEMPLATE_ID!,
              templateParams,
              YOUR_PUBLIC_KEY!
            );
            console.log(`EmailJS success sending to ${org.email}`);
            emailSuccessCount++;
          } catch (error: unknown) {
            // Type guard for the error object
            const emailError = error as EmailJSError;
            console.error(
              `EmailJS failed sending to ${org.email}:`,
              emailError?.text || emailError?.message || error
            );
            emailFailCount++;
          }
        }

        // Update status based on email results
        setStatusMessage(
          `Aid request submitted! Notified ${emailSuccessCount} organizations nearby.` +
            (emailFailCount > 0 ? ` (${emailFailCount} failures)` : '')
        );
      } else {
        // No nearby orgs found
        setStatusMessage(
          'Aid request submitted successfully! No nearby organizations found within 30km.'
        );
      }

      // Display final success message to user if no prior error occurred
      if (!submissionError) {
        alert(statusMessage || 'Request processed successfully!');
        // Consider resetting form fields here if desired
      }
    } catch (error: unknown) {
      // Catch errors from uploadImage or requestAid or ID check
      submissionError =
        error instanceof Error ? error : new Error(String(error)); // Ensure it's an Error object
      console.error('Error during submission process:', submissionError);
      const errorMessage =
        submissionError.message || 'An unknown error occurred.';
      setStatusMessage(`Submission Failed: ${errorMessage}`);
      alert(`Submission Failed: ${errorMessage}`);
    } finally {
      // This block runs regardless of success or failure in the try block
      setIsSubmittingConfirmation(false);
      setIsConfirmationOpen(false);
      // Clear status message after a delay, even if there was an error
      setTimeout(() => setStatusMessage(''), 15000);
    }
    setTimeout(() => document.location.reload(), 1000);
  };

  // --- JSX ---
  return (
    <form onSubmit={handleSubmit} className="text-black font-sans w-full">
      <div className="text-sm sm:text-base text-center justify opacity-60 flex justify-evenly items-center -translate-y-6 w-4/5 mx-auto">
        <div className="w-1/4 text-right">
          <p>Date: {format(new Date(), 'MMMM dd, yyyy')}</p>
          <p>Time: {format(new Date(), 'h:mm a')}</p>
        </div>
        <div className="text-wrap w-3/4 text-end">
          Note: Place a pin in the map and fill out all necessary information
          before submitting request.
        </div>
      </div>

      {/* Display Loading/Status */}
      {isLoadingOrgs && (
        <p className="text-center text-gray-600">
          Loading organization data...
        </p>
      )}
      {statusMessage && !isConfirmationOpen && (
        <p className="text-center font-semibold my-2">{statusMessage}</p>
      )}

      <div className="flex flex-col sm:flex sm:flex-row justify-evenly items-center w-full">
        <div className="w-4/5 sm:ml-5 grid gap-2 sm:w-1/3">
          <div>
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Contact #:
            </label>
            <input
              type="text"
              value={contactNum}
              onChange={(e) => setContactNum(e.target.value)}
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Calamity Type:
            </label>
            <select
              value={calamityType}
              onChange={(e) => setCalamityType(e.target.value)}
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
              required
            >
              <option value="">Select Type</option>
              <option value="flood">Flood</option>
              <option value="earthquake">Earthquake</option>
              <option value="fire">Fire</option>
              <option value="typhoon">Typhoon</option>
              <option value="landslide">Landslide</option>
              <option value="other">Other</option>
            </select>
          </div>
          {calamityType === 'other' && (
            <div className=" items-center mt-2">
              <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
                Input Calamity:
              </label>
              <input
                type="text"
                value={otherCalamity}
                onChange={(e) => setOtherCalamity(e.target.value)}
                className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
                required // Required if 'other' is selected
              />
            </div>
          )}
        </div>
        <div className="w-4/5 grid gap-2 sm:w-1/3">
          <div className="flex items-center mt-4">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Longitude:
            </label>
            <p className="opacity-60">
              {longitude !== null ? longitude.toFixed(6) : 'Select on map'}
            </p>
          </div>
          <div className="flex items-center mb-2">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Latitude:
            </label>
            <p className="opacity-60">
              {latitude !== null ? latitude.toFixed(6) : 'Select on map'}
            </p>
          </div>
          <div>
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Calamity Level:
            </label>
            <select
              value={calamityLevel}
              onChange={(e) => setCalamityLevel(e.target.value)}
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
              required
            >
              <option value="">Select Level</option>
              <option value="1">Level 1 - Minor</option>
              <option value="2">Level 2 - Moderate</option>
              <option value="3">Level 3 - Major</option>
              <option value="4">Level 4 - Severe</option>
              <option value="5">Level 5 - Catastrophic</option>
            </select>
          </div>
          {/* Aid Request Type Select - NOTE: Added based on previous structure, using 'aidRequestDesc' state */}
          <div>
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Aid Needed:
            </label>
            <select
              value={aidNeeded}
              onChange={(e) => setAidNeeded(e.target.value)}
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
              required
            >
              <option value="">Select Aid Type</option>
              <option value="Clothes">Clothes</option>
              <option value="Food">Food</option>
              <option value="Medical">Medical Supplies</option>
              <option value="Rescue">Rescue</option>
              <option value="Shelter">Shelter</option>
              <option value="Volunteers">Volunteers</option>
              <option value="other">Other</option>
            </select>
          </div>
          {aidNeeded === 'other' && (
            <div className=" items-center mt-2">
              <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
                Specify Aid:
              </label>
              <input
                type="text"
                value={otherAidRequest}
                onChange={(e) => setOtherAidRequest(e.target.value)}
                className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
                required // Required if 'other' is selected
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center items-center mt-3 w-full">
        <textarea
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          className="px-4 py-2 mt-4 border-red-400 border-2 rounded-2xl w-4/5 sm:w-[68%] bg-white h-36 placeholder:text-black focus:border-red-600 focus:border-2 focus:outline-none"
          placeholder="Short Description (e.g., families affected, specific needs)"
          required
        />
      </div>

      <div className="flex flex-col justify-center items-center mt-5 w-full">
        <div className="w-4/5 sm:w-[68%] flex flex-col">
          <label className="w-full text-left mb-1 whitespace-nowrap text-black">
            Attach Image (Required):
          </label>
          <div className="items-center">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden" // Keep hidden for styling via label
              required={!image} // Make input required only if no image is selected
            />
            <label
              htmlFor="image-upload"
              className="bg-white border-2 border-red-400 text-black px-4 py-2 rounded-md hover:bg-red-100 cursor-pointer inline-block focus:border-red-600 focus:border-2 focus:outline-none"
            >
              Choose Image
            </label>
            {image && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="ml-3 text-black hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
          {imagePreview && (
            <div className="mt-3 border-red-400 border-2 rounded-lg p-2 bg-gray-100">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-40 max-w-full object-contain mx-auto"
              />
              <p className="text-black text-sm mt-1 text-center">
                {image?.name}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex justify-center pb-8">
        <button
          type="submit"
          className="bg-red-700 text-white px-8 py-2 rounded-md hover:bg-red-800 disabled:bg-gray-400"
          // Disable if loading orgs or submitting or no pin/image selected
          disabled={isLoadingOrgs || isSubmittingConfirmation || !pin || !image}
        >
          Send Request
        </button>
      </div>

      <div className="flex justify-center items-center justify mx-auto w-4/5 md:w-full">
        <p className="mb-2 text-xs sm:text-sm text-center opacity-70">
          - By filling up this form, you consent to our website using your given
          information, which includes your name and contact number -
        </p>
      </div>

      {/* Confirmation Dialog */}
      {isConfirmationOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center text-black z-50">
          <div className="bg-gray-100 p-6 sm:p-8 rounded-lg shadow-lg w-[90%] max-w-md border-2 border-red-500">
            <div className="flex mb-4 items-center">
              <img
                src="/Warning.svg" // Ensure path is correct
                alt="Warning Symbol"
                width="32"
                height="32"
                className="mr-3"
              />
              <p className="text-lg font-bold">Confirm Submission</p>
            </div>
            <p className="mb-4">Submit your aid request?</p>
            {/* Show status inside dialog during submission */}
            {isSubmittingConfirmation && statusMessage && (
              <p className="text-gray-400 my-2">{statusMessage}</p>
            )}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={cancelSubmission}
                className=" hover:bg-gray-300 px-4 py-2 rounded-md mr-2 font-normal"
                disabled={isSubmittingConfirmation}
              >
                No
              </button>
              <button
                type="button"
                onClick={confirmSubmission}
                className={`px-4 py-2 rounded-md font-semibold ${
                  isSubmittingConfirmation
                    ? 'bg-gray-400 text-gray-300 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-black'
                }`}
                disabled={isSubmittingConfirmation}
              >
                {isSubmittingConfirmation ? 'Submitting...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default RequestAidForm;
