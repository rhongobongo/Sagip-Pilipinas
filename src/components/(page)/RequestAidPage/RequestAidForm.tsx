'use client';

import { useState, useEffect } from 'react';
import { RequestPin } from '@/types/types';
import { requestAid } from '@/components/map/SubmitAid';
import { uploadImage } from './uploadImage';
import { format } from 'date-fns';

import { findNearbyOrganizations } from '@/components/map/findNearbyOrganizations';

interface RequestFormProps {
  pin: RequestPin | null;
}

const RequestAidForm: React.FC<RequestFormProps> = ({ pin }) => {
  // Existing state variables from old code
  const [name, setName] = useState('');
  const [contactNum, setContactNum] = useState('');
  const [calamityLevel, setCalamityLevel] = useState('');
  const [calamityType, setCalamityType] = useState('');
  const [otherCalamity, setOtherCalamity] = useState('');
  const [aidRequest, setAidRequest] = useState('');
  const [otherAidRequest, setOtherAidRequest] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [shortDesc, setShortDesc] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmittingConfirmation, setIsSubmittingConfirmation] = useState(false);

  // Add new state for tracking email notifications (from new code)
  const [isNotifyingOrgs, setIsNotifyingOrgs] = useState(false);

  // Existing image handling functions from old code
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

  // Existing handleSubmit function from old code
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationOpen(true);
  };

  // Merged confirmSubmission function
  const confirmSubmission = async () => {
    setIsSubmittingConfirmation(true);
    if (!pin || !image) {
      alert('Error: Location pin or image missing. Please try again.');
      setIsConfirmationOpen(false);
      setIsSubmittingConfirmation(false);
      return;
    }

    try {
      const imageURL = await uploadImage(image);

      const formattedDate = format(new Date(), 'MMMM dd, yyyy'); // Corrected format string
      const formattedTime = format(new Date(), 'h:mm a');

      Object.assign(pin, {
        name,
        contactNum,
        location: `${latitude?.toFixed(6)}, ${longitude?.toFixed(6)}`,
        calamityLevel,
        calamityType: calamityType === 'other' ? otherCalamity : calamityType,
        aidRequest: aidRequest === 'other' ? otherAidRequest : aidRequest,
        shortDesc,
        imageURL,
        submissionDate: formattedDate,
        submissionTime: formattedTime,
        coordinates: { latitude, longitude },
      });

      // Submit the request to your database (from old code)
      await requestAid(pin);

      // After successful submission, notify nearby organizations (from new code)
      if (latitude !== null && longitude !== null) {
        setIsNotifyingOrgs(true); // Set state before starting notification
        await notifyNearbyOrganizations(
          latitude,
          longitude,
          calamityType === 'other' ? otherCalamity : calamityType,
          calamityLevel,
          aidRequest === 'other' ? otherAidRequest : aidRequest,
          shortDesc,
          name,
          contactNum,
          imageURL
        );
        setIsNotifyingOrgs(false); // Reset state after notification attempt
      }

      setIsConfirmationOpen(false);
      window.location.reload();
      // Updated alert message (from new code)
      alert('Request submitted successfully! Nearby organizations have been notified.');
    } catch (error: unknown) {
      console.error('Error submitting request:', error);
      if (error instanceof Error) {
        alert(`Failed to submit request: ${error.message}`);
      } else {
        alert('Failed to submit request: An unknown error occurred.');
        console.error('Unknown error:', error);
      }
      // Ensure notification state is reset on error too, if appropriate
      setIsNotifyingOrgs(false);
    } finally {
      setIsSubmittingConfirmation(false);
    }
  };

  // Existing cancelSubmission function from old code
  const cancelSubmission = () => {
    setIsConfirmationOpen(false);
  };

  // New function to notify nearby organizations (from new code)
  const notifyNearbyOrganizations = async (
    latitude: number,
    longitude: number,
    calamityType: string,
    calamityLevel: string,
    aidRequest: string,
    description: string,
    contactName: string,
    contactNumber: string,
    imageURL: string
  ) => {
    try {
      // Find organizations within 30km
      const nearbyOrgs = await findNearbyOrganizations(latitude, longitude);

      if (nearbyOrgs.length === 0) {
        console.log('No organizations found within 30km of the emergency');
        return; // No need to proceed if no orgs found
      }

      // Get email addresses
      const recipientEmails = nearbyOrgs.map(org => org.email);

      // Create email content
      const subject = `EMERGENCY ALERT: ${calamityType} Level ${calamityLevel} - Aid Needed`;

      // Corrected Google Maps link format
      const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

      const message = `
        <h2>Emergency Aid Request</h2>
        <p><strong>This is an automated alert for an emergency in your area (within 30km).</strong></p>

        <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Emergency Type:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${calamityType}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Severity Level:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${calamityLevel}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Aid Requested:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${aidRequest}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Location:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">
              <a href="${googleMapsLink}" target="_blank">
                View on Google Maps (${latitude.toFixed(6)}, ${longitude.toFixed(6)})
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Contact Person:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${contactName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Contact Number:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${contactNumber}</td>
          </tr>
        </table>

        <h3>Description:</h3>
        <p>${description}</p>

        ${imageURL ? `<img src="${imageURL}" alt="Emergency situation" style="max-width: 100%; height: auto; margin-top: 20px;">` : ''}

        <p style="margin-top: 20px;">Please respond as soon as possible if you can provide assistance.</p>
      `;

      // Send emails via backend API
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: recipientEmails,
          subject,
          message,
        }),
      });

      console.log(`Emails sent to ${recipientEmails.length} organizations`);
    } catch (error) {
      console.error('Failed to notify organizations:', error);
      // Optional: Show a non-blocking notification to the user that organization notification failed
      // alert('Could not notify nearby organizations. Please contact them directly if urgent.');
      // Don't re-throw the error - this is a secondary function that shouldn't break the main request flow
    }
  };


  // Existing useEffect from old code
  useEffect(() => {
    if (pin && pin.coordinates) {
      setLatitude(pin.coordinates.latitude);
      setLongitude(pin.coordinates.longitude);
    } else {
      setLatitude(null);
      setLongitude(null);
    }
  }, [pin]);

  // Return statement with merged confirmation dialog (from new code)
  return (
    <form onSubmit={handleSubmit} className="text-black font-sans w-full">
      {/* Existing form header from old code */}
      <div className="text-sm sm:text-base text-center justify opacity-60 flex justify-evenly items-center -translate-y-6 w-4/5 mx-auto">
        <div className="w-1/4 text-right">
          <p>Date: {format(new Date(), 'MMMM dd, yyyy')}</p> {/* Corrected format string */}
          <p>Time: {format(new Date(), 'h:mm a')}</p>
        </div>
        <div className="text-wrap w-3/4 text-end">
          Note: Place a pin in the map and fill out all necessary information
          before submitting request.
        </div>
      </div>

      {/* Existing form elements from old code */}
      <div className="flex flex-col sm:flex sm:flex-row justify-evenly items-center w-full">
        <div className="w-4/5 sm:ml-5 grid gap-2 sm:w-1/3">
          {/* Name Input */}
          <div className="items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required // Added required attribute
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
            />
          </div>
           {/* Contact Number Input */}
          <div className="items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Contact #:
            </label>
            <input
              type="text"
              value={contactNum}
              onChange={(e) => setContactNum(e.target.value)}
              required // Added required attribute
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
            />
          </div>
          {/* Calamity Type Select */}
          <div className=" items-center">
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Calamity Type:
            </label>
            <select
              value={calamityType}
              onChange={(e) => setCalamityType(e.target.value)}
              required // Added required attribute
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
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
          {/* Other Calamity Input (Conditional) */}
          {calamityType === 'other' && (
            <div className=" items-center mt-2">
              <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
                Input Calamity:
              </label>
              <textarea
                value={otherCalamity}
                onChange={(e) => setOtherCalamity(e.target.value)}
                required // Added required attribute
                className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
              />
            </div>
          )}
        </div>
        <div className="w-4/5 grid gap-2 sm:w-1/3">
          {/* Longitude Display */}
          <div className="flex items-center mt-4">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Longitude:
            </label>
            <p className="opacity-60">
              {longitude !== null ? longitude.toFixed(6) : 'Not selected (Click map)'}
            </p>
          </div>
           {/* Latitude Display */}
          <div className="flex items-center mb-2">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Latitude:
            </label>
            <p className="opacity-60">
              {latitude !== null ? latitude.toFixed(6) : 'Not selected (Click map)'}
            </p>
          </div>
          {/* Calamity Level Select */}
          <div className=" items-center">
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Calamity Level:
            </label>
            <select
              value={calamityLevel}
              onChange={(e) => setCalamityLevel(e.target.value)}
              required // Added required attribute
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
            >
              <option value="">Select Level</option>
              <option value="1">Level 1 - Minor</option>
              <option value="2">Level 2 - Moderate</option>
              <option value="3">Level 3 - Major</option>
              <option value="4">Level 4 - Severe</option>
              <option value="5">Level 5 - Catastrophic</option>
            </select>
          </div>
           {/* Aid Request Select */}
          <div className=" items-center">
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Aid Request:
            </label>
            <select
              value={aidRequest}
              onChange={(e) => setAidRequest(e.target.value)}
              required // Added required attribute
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
            >
              <option value="">Select Type</option>
              <option value="Clothes">Clothes</option> {/* Corrected values */}
              <option value="Food">Food</option>
              <option value="Volunteers">Volunteers</option>
              <option value="Medical">Medical Assistance</option>
              <option value="Rescue">Rescue</option>
              <option value="other">Other</option>
            </select>
          </div>
          {/* Other Aid Request Input (Conditional) */}
          {aidRequest === 'other' && (
            <div className=" items-center mt-2">
              <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
                Input Aid:
              </label>
              <textarea
                value={otherAidRequest}
                onChange={(e) => setOtherAidRequest(e.target.value)}
                required // Added required attribute
                className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
      {/* Short Description Textarea */}
      <div className="flex justify-center items-center mt-3 w-full">
        <textarea
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          required // Added required attribute
          className="px-4 py-2 mt-4 border-red-400 border-2 rounded-2xl w-4/5 sm:w-4/5 bg-white h-36 placeholder:text-black focus:border-red-600 focus:border-2 focus:outline-none"
          placeholder="Short Description (e.g., number of people affected, specific needs)"
        />
      </div>

      {/* Image Upload Section from old code */}
      <div className="flex flex-col justify-center items-center mt-5 w-full">
        <div className="w-4/5 sm:w-4/6 flex flex-col">
          <label className="w-24 text-right whitespace-nowrap text-black mb-1">
            Attach Image: <span className="text-red-600">*</span> {/* Indicate required */}
          </label>
          <div className="items-center">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              required // Added required attribute
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="bg-white border-2 border-red-400 text-black px-4 py-2 rounded-md hover:bg-red-400 cursor-pointer inline-block focus:border-red-600 focus:border-2 focus:outline-none"
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
            <div className="mt-3 border-red-400 border-2 rounded-lg p-2 bg-gray-100 focus:border-red-600 focus:border-2 focus:outline-none">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-40 max-w-full object-contain"
              />
              <p className="text-black text-sm mt-1">{image?.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button from old code */}
      <div className="mt-10 flex justify-end pb-8">
        <button
          type="submit"
          className="bg-red-700 text-white px-8 py-2 rounded-md hover:bg-red-800 sm:mr-36 mx-auto disabled:opacity-50" // Added disabled style
          disabled={!pin || !image || !name || !contactNum || !calamityType || !calamityLevel || !aidRequest || (calamityType === 'other' && !otherCalamity) || (aidRequest === 'other' && !otherAidRequest)} // Disable if required fields missing
        >
          Send Request
        </button>
      </div>
       {/* Consent Note from old code */}
      <div className="flex justify-center items-center justify mx-auto w-4/5 md:w-full">
        <p className="mb-2 text-xs opacity-70">
          - By filling up this form, you consent to our website using your given
          information, which includes your name, contact number, location, and submitted image, for the purpose of emergency aid coordination and notification to relevant organizations. -
        </p>
      </div>

      {/* Updated Confirmation Dialog (from new code) */}
      {isConfirmationOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center text-white z-50">
          <div className="bg-[#211E1E] p-8 rounded-md shadow-lg w-11/12 sm:w-2/5"> {/* Adjusted width for smaller screens */}
            <div className="flex mb-4 items-center">
              <img
                src="/Warning.svg" // Ensure path is correct relative to public folder
                alt="Warning Symbol"
                width="32"
                height="32"
                className="mr-3"
              />
              <p className="text-lg font-bold">Confirm Submission</p>
            </div>
            {/* Dynamically updated text */}
            <p className="mb-4">
              {isSubmittingConfirmation
                ? isNotifyingOrgs
                  ? 'Notifying nearby organizations...' // State when notifying
                  : 'Submitting your request...'       // State when submitting
                : 'Submit your aid request? This will notify organizations within 30km of your location.' // Initial confirmation message
              }
            </p>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={cancelSubmission}
                className="hover:bg-gray-600 px-4 py-2 rounded-md mr-2 font-normal"
                disabled={isSubmittingConfirmation} // Disable during submission
              >
                No
              </button>
              <button
                type="button"
                onClick={confirmSubmission}
                className={`px-4 py-2 rounded-md font-semibold ${
                  isSubmittingConfirmation
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' // Disabled style
                    : 'bg-green-500 hover:bg-green-600 text-black' // Enabled style
                }`}
                disabled={isSubmittingConfirmation} // Disable during submission
              >
                {/* Dynamically updated button text */}
                {isSubmittingConfirmation ?
                  (isNotifyingOrgs ? 'Notifying...' : 'Submitting...')
                  : 'Yes'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default RequestAidForm;