'use client';

import { useState, useEffect, useRef } from 'react';
import { RequestPin } from '@/types/types';
import { requestAid } from '@/components/map/SubmitAid';
import { uploadImage } from './uploadImage'; // Assuming this can upload any file and return a URL
import { format } from 'date-fns';
import emailjs from '@emailjs/browser';
import { getDistance } from 'geolib';
import Image from 'next/image';

interface RequestFormProps {
  pin: RequestPin | null;
}

type OrgData = {
  userId: string;
  coordinates: { latitude: number; longitude: number };
  email: string;
  name: string;
};

const RequestAidForm: React.FC<RequestFormProps> = ({ pin }) => {
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

  // New state for verification document
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const [verificationDocumentPreview, setVerificationDocumentPreview] = useState<string | null>(null); // For PDF, this might just be the name. For images, a preview.

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmittingConfirmation, setIsSubmittingConfirmation] =
    useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [organizations, setOrganizations] = useState<OrgData[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const YOUR_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const YOUR_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const YOUR_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY; // User's saved Email.js Public Key might be used here

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
        console.log('Raw organization data from API:', data);
        type RawOrgData = {
          userId: string;
          coordinates?: {
            latitude?: number;
            longitude?: number;
          };
          email?: string;
          name?: string;
        };

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
  }, []);

  useEffect(() => {
    if (pin && pin.coordinates) {
      setLatitude(pin.coordinates.latitude);
      setLongitude(pin.coordinates.longitude);
    } else {
      setLatitude(null);
      setLongitude(null);
    }
  }, [pin]);

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
    // Reset the file input visually
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Handler for verification document change
  const handleVerificationDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setVerificationDocument(selectedFile);
      // For images, you can generate a preview. For PDFs, you might just show the name.
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setVerificationDocumentPreview(event.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setVerificationDocumentPreview(selectedFile.name); // Show file name for non-images like PDFs
      }
    }
  };

  // Handler for removing verification document
  const handleRemoveVerificationDocument = () => {
    setVerificationDocument(null);
    setVerificationDocumentPreview(null);
     // Reset the file input visually
    const fileInput = document.getElementById('verification-document-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !pin ||
      !image ||
      !verificationDocument || // <-- Check for verification document
      !name ||
      !contactNum ||
      !calamityType ||
      !calamityLevel ||
      !shortDesc
    ) {
      alert(
        'Please fill out all fields, select a location on the map, attach an image, and upload a proof of verification.'
      );
      return;
    }
    if (isLoadingOrgs) {
      alert('Organization data is still loading, please wait a moment.');
      return;
    }
    setIsConfirmationOpen(true);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = rawValue.replace(/[^0-9]/g, '');
    const limitedValue = numericValue.slice(0, 10);
    setContactNum(limitedValue);
  };

  const cancelSubmission = () => {
    setIsConfirmationOpen(false);
  };

  const confirmSubmission = async () => {
    setIsSubmittingConfirmation(true);
    setStatusMessage('Submitting aid request...');
    let submissionError: Error | null = null;
    let finalRequestId: string | null = null;

    if (!pin || typeof latitude !== 'number' || typeof longitude !== 'number') {
      alert('Error: Location not selected on the map. Please place a pin.');
      setIsConfirmationOpen(false);
      setIsSubmittingConfirmation(false);
      setStatusMessage('Submission failed: Location missing.');
      return;
    }
    if (!image) {
      // This check is already in handleSubmit, but good for safety
      alert('Error: Image missing. Please attach an image.');
      setIsConfirmationOpen(false);
      setIsSubmittingConfirmation(false);
      setStatusMessage('Submission failed: Image missing.');
      return;
    }
    if (!verificationDocument) { // <-- Add check here as well
        alert('Error: Proof of Verification missing. Please attach a document.');
        setIsConfirmationOpen(false);
        setIsSubmittingConfirmation(false);
        setStatusMessage('Submission failed: Proof of Verification missing.');
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
      console.log('Uploading image...');
      const uploadedImageUrl: string = await uploadImage(image!); // Assuming uploadImage handles the actual upload
      console.log('Image uploaded:', uploadedImageUrl);

      console.log('Uploading verification document...');
      const uploadedVerificationDocUrl: string = await uploadImage(verificationDocument!); // Re-use uploadImage or create a specific one
      console.log('Verification document uploaded:', uploadedVerificationDocUrl);


      const formattedDate = format(new Date(), 'MMMM dd, yyyy');
      const formattedTime = format(new Date(), 'h:mm a');

      const finalAidRequestData: RequestPin = {
        ...pin,
        name,
        contactNum,
        calamityLevel,
        calamityType: calamityType === 'other' ? otherCalamity : calamityType,
        shortDesc,
        imageURL: uploadedImageUrl,
        verificationDocumentUrl: uploadedVerificationDocUrl, // <-- Add this
        submissionDate: formattedDate,
        submissionTime: formattedTime,
        coordinates: { latitude: latitude!, longitude: longitude! },
        aidNeeded: aidNeeded === 'other' ? otherAidRequest : aidNeeded,
      };

      console.log('Submitting aid request to Firestore...');
      const submissionResult = await requestAid(finalAidRequestData);

      if (!submissionResult || !submissionResult.requestId) {
        throw new Error(
          'Failed to get request ID after submission from server action.'
        );
      }
      finalRequestId = submissionResult.requestId;
      console.log('Aid Request submitted successfully. ID:', finalRequestId);
      setStatusMessage('Aid request submitted. Processing notifications...');

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
          );
          return false;
        }
        const distance = getDistance(requestCoords, org.coordinates);
        return distance <= MAX_DISTANCE_METERS;
      });

      console.log(`Found ${nearbyOrgs.length} nearby organizations to notify.`);

      if (nearbyOrgs.length > 0) {
        let emailSuccessCount = 0;
        let emailFailCount = 0;

        const appBaseUrl =
          process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
        const requestLink = `${appBaseUrl}/news/${finalRequestId}`;
        const templateParamsBase = {
          request_type: finalAidRequestData.calamityType || 'N/A',
          request_level: finalAidRequestData.calamityLevel || 'N/A',
          request_desc: finalAidRequestData.shortDesc || 'N/A',
          requester_name: finalAidRequestData.name || 'N/A',
          requester_contact: finalAidRequestData.contactNum || 'N/A',
          submission_date: finalAidRequestData.submissionDate || '',
          submission_time: finalAidRequestData.submissionTime || '',
          request_image_url: finalAidRequestData.imageURL || '',
          // You might want to add verificationDocumentUrl to the email template if relevant
          request_link: requestLink,
        };

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
              YOUR_PUBLIC_KEY! // This is where your Email.js Public Key is used
            );
            console.log(`EmailJS success sending to ${org.email}`);
            emailSuccessCount++;
          } catch (error: unknown) {
            const emailError = error as EmailJSError;
            console.error(
              `EmailJS failed sending to ${org.email}:`,
              emailError?.text || emailError?.message || error
            );
            emailFailCount++;
          }
        }

        setStatusMessage(
          `Aid request submitted! Notified ${emailSuccessCount} organizations nearby.` +
          (emailFailCount > 0 ? ` (${emailFailCount} failures)` : '')
        );
      } else {
        setStatusMessage(
          'Aid request submitted successfully! No nearby organizations found within 30km.'
        );
      }

      // This alert will now reflect the comprehensive statusMessage
      // No need for an additional alert if submissionError is null.
      // The setStatusMessage above handles success messages.

    } catch (error: unknown) {
      submissionError =
        error instanceof Error ? error : new Error(String(error));
      console.error('Error during submission process:', submissionError);
      const errorMessage =
        submissionError.message || 'An unknown error occurred.';
      setStatusMessage(`Submission Failed: ${errorMessage}`);
      alert(`Submission Failed: ${errorMessage}`); // Alert only on failure
    } finally {
      setIsSubmittingConfirmation(false);
      setIsConfirmationOpen(false);
      // Only set a timeout to clear status if it's a success message that doesn't have an alert
      if (!submissionError) {
        alert(statusMessage || 'Request processed successfully!'); // Alert on overall success
        setTimeout(() => setStatusMessage(''), 15000);
        setTimeout(() => document.location.reload(), 3000); // Increased delay for user to read message
      } else {
         // For errors, the message persists until user interaction, or you can add a timeout too
        setTimeout(() => setStatusMessage(''), 15000);
      }
    }
   // No automatic reload on error. Reload only on success after a delay.
   // The setTimeout for reload was moved into the success block within finally.
  };

  return (
    <form onSubmit={handleSubmit} className="text-black font-sans w-full">
      {/* ... (rest of your existing intro JSX: date, time, note) ... */}
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

      {isLoadingOrgs && (
        <p className="text-center text-gray-600">
          Loading organization data...
        </p>
      )}
      {statusMessage && !isConfirmationOpen && (
        <p className={`text-center font-semibold my-2 ${statusMessage.toLowerCase().includes('fail') ? 'text-red-600' : 'text-green-600'}`}>{statusMessage}</p>
      )}

      <div className="flex flex-col sm:flex sm:flex-row justify-evenly items-center w-full">
        {/* Column 1: Name, Contact, Calamity Type */}
        <div className="w-4/5 sm:ml-5 grid gap-2 sm:w-1/3">
          <div>
            <label className="block mb-1 text-sm font-medium text-black">Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-black">Contact # (10 digits, e.g., 9123456789):</label>
            <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-2xl">
                +63
                </span>
                <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                placeholder="9123456789"
                value={contactNum}
                onChange={handleContactChange}
                className="w-full px-4 py-2 border-red-400 border-2 rounded-e-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none placeholder:text-gray-400"
                required
                />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-black">Calamity Type:</label>
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
              <option value="medical_assistance">Medical Assistance</option>
              <option value="missing_person">Missing Person</option>
              <option value="other">Other</option>
            </select>
          </div>
          {calamityType === 'other' && (
            <div className="mt-2">
              <label className="block mb-1 text-sm font-medium text-black">Specify Other Calamity:</label>
              <input
                type="text"
                value={otherCalamity}
                onChange={(e) => setOtherCalamity(e.target.value)}
                className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
                required={calamityType === 'other'}
              />
            </div>
          )}
        </div>

        {/* Column 2: Coords, Calamity Level, Aid Needed */}
        <div className="w-4/5 grid gap-2 sm:w-1/3 mt-4 sm:mt-0">
          <div className="flex items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">Longitude:</label>
            <p className="opacity-60">{longitude !== null ? longitude.toFixed(6) : 'Select on map'}</p>
          </div>
          <div className="flex items-center mb-2">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">Latitude:</label>
            <p className="opacity-60">{latitude !== null ? latitude.toFixed(6) : 'Select on map'}</p>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-black">Calamity Level:</label>
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
          <div>
            <label className="block mb-1 text-sm font-medium text-black">Aid Needed:</label>
            <select
              value={aidNeeded}
              onChange={(e) => setAidNeeded(e.target.value)}
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
              required
            >
              <option value="">Select Aid Type</option>
              <option value="Food">Food (Non-perishable, Ready-to-eat)</option>
              <option value="Water">Water (Bottled)</option>
              <option value="Clothes">Clothes (All ages, blankets)</option>
              <option value="Medical">Medical Supplies (First-aid, hygiene kits)</option>
              <option value="Shelter">Temporary Shelter (Tarps, tents)</option>
              <option value="Rescue">Rescue / Evacuation</option>
              <option value="Financial">Financial Assistance</option>
              <option value="Volunteers">Volunteers</option>
              <option value="other">Other (Specify below)</option>
            </select>
          </div>
          {aidNeeded === 'other' && (
            <div className="mt-2">
              <label className="block mb-1 text-sm font-medium text-black">Specify Other Aid:</label>
              <input
                type="text"
                value={otherAidRequest}
                onChange={(e) => setOtherAidRequest(e.target.value)}
                className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
                required={aidNeeded === 'other'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Short Description Text Area */}
      <div className="flex justify-center items-center mt-6 w-full">
        <div className="w-4/5 sm:w-[68%]">
            <label className="block mb-1 text-sm font-medium text-black">Short Description of Situation & Needs:</label>
            <textarea
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            className="px-4 py-2 border-red-400 border-2 rounded-2xl w-full bg-white h-24 placeholder:text-gray-400 focus:border-red-600 focus:border-2 focus:outline-none"
            placeholder="e.g., 5 families affected by flood, need food, water, and clothes. Our house was damaged."
            required
            maxLength={500}
            />
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="flex flex-col justify-center items-center mt-5 w-full">
        <div className="w-4/5 sm:w-[68%] flex flex-col">
          <label className="w-full text-left mb-1 text-sm font-medium text-black">
            Attach Image of Situation (Required):
          </label>
          <div className="items-center">
            <input
              type="file"
              id="image-upload"
              accept="image/jpeg, image/png, image/gif"
              onChange={handleImageChange}
              className="hidden"
              required={!image} // Required if no image is already selected
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

      {/* Verification Document Upload Section - NEW */}
      <div className="flex flex-col justify-center items-center mt-5 w-full">
        <div className="w-4/5 sm:w-[68%] flex flex-col">
          <label className="w-full text-left mb-1 text-sm font-medium text-black">
            Attach Proof of Verification (Required):
          </label>
          <p className="text-xs text-gray-600 mb-1">
            E.g., Barangay Certificate, Medical Certificate, Valid ID showing address of incident, official document related to the situation.
          </p>
          <div className="items-center">
            <input
              type="file"
              id="verification-document-upload"
              accept="image/jpeg, image/png, application/pdf" // Accept images and PDFs
              onChange={handleVerificationDocumentChange}
              className="hidden"
              required={!verificationDocument} // Required if no document selected
            />
            <label
              htmlFor="verification-document-upload"
              className="bg-white border-2 border-red-400 text-black px-4 py-2 rounded-md hover:bg-red-100 cursor-pointer inline-block focus:border-red-600 focus:border-2 focus:outline-none"
            >
              Choose File
            </label>
            {verificationDocument && (
              <button
                type="button"
                onClick={handleRemoveVerificationDocument}
                className="ml-3 text-black hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
          {verificationDocumentPreview && (
            <div className="mt-3 border-red-400 border-2 rounded-lg p-2 bg-gray-100">
              {verificationDocument?.type.startsWith('image/') ? (
                <img
                  src={verificationDocumentPreview}
                  alt="Verification Preview"
                  className="max-h-40 max-w-full object-contain mx-auto"
                />
              ) : (
                <p className="text-black text-sm text-center py-2">Selected file: {verificationDocumentPreview}</p>
              )}
              <p className="text-black text-sm mt-1 text-center">
                {verificationDocument?.name}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex justify-center pb-8">
        <button
          type="submit"
          className="bg-red-700 text-white px-8 py-2 rounded-md hover:bg-red-800 disabled:bg-gray-400"
          disabled={isLoadingOrgs || isSubmittingConfirmation || !pin || !image || !verificationDocument }
        >
          Send Request
        </button>
      </div>

      <div className="flex justify-center items-center justify mx-auto w-4/5 md:w-full">
        <p className="mb-2 text-xs sm:text-sm text-center opacity-70">
          - By filling up this form, you consent to our website using your given
          information, which includes your name, contact number, and submitted documents for verification and aid purposes -
        </p>
      </div>

      {/* Confirmation Modal */}
      {isConfirmationOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center text-black z-50">
          <div className="bg-gray-100 p-6 sm:p-8 rounded-lg shadow-lg w-[90%] max-w-md border-2 border-red-500">
            <div className="flex mb-4 items-center">
              <Image
                src="/Warning.svg"
                alt="Warning Symbol"
                width="32"
                height="32"
                className="mr-3"
              />
              <p className="text-lg font-bold">Confirm Submission</p>
            </div>
            <p className="mb-1">Are you sure you want to submit this aid request?</p>
            <p className="text-xs text-gray-600 mb-4">Ensure all information and uploaded documents are accurate and truthful.</p>

            {isSubmittingConfirmation && statusMessage && (
              <p className="text-gray-600 my-2">{statusMessage}</p>
            )}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={cancelSubmission}
                className=" hover:bg-gray-300 px-4 py-2 rounded-md mr-2 font-normal"
                disabled={isSubmittingConfirmation}
              >
                No, Go Back
              </button>
              <button
                type="button"
                onClick={confirmSubmission}
                className={`px-4 py-2 rounded-md font-semibold ${
                  isSubmittingConfirmation
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                disabled={isSubmittingConfirmation}
              >
                {isSubmittingConfirmation ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default RequestAidForm;