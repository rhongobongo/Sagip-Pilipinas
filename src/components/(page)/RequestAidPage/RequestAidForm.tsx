'use client';

import { useState, useEffect } from 'react';
import { RequestPin } from '@/types/types';
import { requestAid } from '@/components/map/SubmitAid';
import { uploadImage } from './uploadImage';
import { format } from 'date-fns';
import { findNearbyOrganizations } from '@/components/map/findNearbyOrganizations';

// Import Email.js
import emailjs from '@emailjs/browser';

interface RequestFormProps {
  pin: RequestPin | null;
}

const RequestAidForm: React.FC<RequestFormProps> = ({ pin }) => {
  // --- State variables ---
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
  const [isNotifyingOrgs, setIsNotifyingOrgs] = useState(false);

  // --- ADDED: Initialize Email.js on component mount ---
  useEffect(() => {
    // Read the Public Key from environment variables
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (publicKey) {
       console.log("Initializing Email.js...");
       // Initialize Email.js with your Public Key
       emailjs.init(publicKey);
    } else {
       console.error("Email.js Public Key not found in environment variables (NEXT_PUBLIC_EMAILJS_PUBLIC_KEY). Initialization skipped.");
       // Optionally alert the user or handle this more gracefully in a real app
       // alert("Notification system configuration error: Missing Public Key. Cannot send notifications.");
    }
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // --- Helper functions (handleImageChange, handleRemoveImage, handleSubmit) ---
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
    // Basic client-side validation check before opening confirmation
    if (!pin || !image || !name || !contactNum || !calamityType || !calamityLevel || !aidRequest || (calamityType === 'other' && !otherCalamity) || (aidRequest === 'other' && !otherAidRequest)) {
        alert('Please fill out all required fields and select a location on the map.');
        return;
    }
    setIsConfirmationOpen(true);
  };

  // --- confirmSubmission function ---
   const confirmSubmission = async () => {
    setIsSubmittingConfirmation(true);
    // Redundant check as handleSubmit does basic validation now, but good for safety
    if (!pin || !image) {
      alert('Error: Location pin or image missing. Please try again.');
      setIsConfirmationOpen(false);
      setIsSubmittingConfirmation(false);
      return;
    }

    try {
      const imageURL = await uploadImage(image);

      const formattedDate = format(new Date(), 'MMMM dd, yyyy'); // Use yyyy for year
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

      // Submit the request to your database
      await requestAid(pin);

      // After successful submission, notify nearby organizations
      if (latitude !== null && longitude !== null) {
        setIsNotifyingOrgs(true);
        console.log("ConfirmSubmission: Coordinates found, attempting to notify organizations...");
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
        setIsNotifyingOrgs(false);
      } else {
         console.log("ConfirmSubmission: Coordinates missing, skipping organization notification.");
      }

      setIsConfirmationOpen(false);
      // Consider delaying reload slightly to ensure user sees confirmation/potential errors
      alert('Request submitted successfully! Nearby organizations are being notified.');
      setTimeout(() => window.location.reload(), 1500); // Reload after 1.5 seconds

    } catch (error: unknown) {
      console.error('Error submitting request:', error);
      if (error instanceof Error) {
        alert(`Failed to submit request: ${error.message}`);
      } else {
        alert('Failed to submit request: An unknown error occurred.');
        console.error('Unknown error during submission:', error);
      }
      setIsNotifyingOrgs(false);
    } finally {
      setIsSubmittingConfirmation(false);
    }
  };

  // --- cancelSubmission function ---
  const cancelSubmission = () => {
    setIsConfirmationOpen(false);
  };

  // --- notifyNearbyOrganizations function (using Email.js) ---
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
      console.log("NotifyOrgs: Starting notification process with Email.js...");

      // Get Email.js credentials from environment variables
      // Ensure these are prefixed with NEXT_PUBLIC_ in your .env.local file
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY; // Public key is needed for init and send

      // Check if Email.js is configured (important!)
      if (!serviceId || !templateId || !publicKey) {
          console.error("NotifyOrgs Error: Missing Email.js environment variables (check NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, NEXT_PUBLIC_EMAILJS_PUBLIC_KEY)");
          // Don't alert here, as init might have already alerted. Just stop processing.
          return;
      }

      // Find organizations within 30km
      const nearbyOrgs = await findNearbyOrganizations(latitude, longitude);
      console.log(`NotifyOrgs: Found ${nearbyOrgs?.length ?? 0} nearby organizations data objects.`);

      if (!nearbyOrgs || nearbyOrgs.length === 0) {
        console.log('NotifyOrgs: No organizations found within 30km of the emergency');
        return;
      }

      if (nearbyOrgs.length > 0) {
          console.log('NotifyOrgs: Sample organization data:', JSON.stringify(nearbyOrgs[0], null, 2));
      }

      const recipientEmails = nearbyOrgs
        .map(org => org?.email)
        .filter((email): email is string => typeof email === 'string' && email.includes('@'));

      console.log(`NotifyOrgs: Filtered ${recipientEmails.length} valid recipient emails:`, recipientEmails);

      if (recipientEmails.length === 0) {
        console.log('NotifyOrgs: No valid email addresses found in the nearby organizations data.');
        return;
      }

      const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}&q=${latitude},${longitude}`;

      console.log(`NotifyOrgs: Preparing to send emails via Email.js to: ${recipientEmails.join(', ')}`);

      // Send emails to each organization
      const sendPromises = recipientEmails.map(recipientEmail => {
        const templateParams = {
          to_email: recipientEmail,
          subject: `EMERGENCY ALERT: ${calamityType} Level ${calamityLevel} - Aid Needed`,
          emergency_type: calamityType,
          severity_level: calamityLevel,
          aid_requested: aidRequest,
          location_link: googleMapsLink,
          coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          contact_person: contactName,
          contact_number: contactNumber,
          description: description,
          image_url: imageURL || 'N/A',
          // Add other params matching your Email.js template here
        };

        console.log(`NotifyOrgs: Preparing to send to ${recipientEmail}`); // Avoid logging full params in production maybe

        // Send email using Email.js
        // Note: publicKey is passed here again as the 4th argument in v3 SDK
        return emailjs.send(
          serviceId,
          templateId,
          templateParams,
          publicKey // Pass Public Key here too
        );
      });

      const results = await Promise.allSettled(sendPromises);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      console.log(`NotifyOrgs: Email.js send attempt results: ${successful} successful, ${failed} failed`);

      if (failed > 0) {
        console.warn('NotifyOrgs: Some emails failed to send via Email.js.');
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`NotifyOrgs: Failed to send email to ${recipientEmails[index]}:`, result.reason);
          } else if (result.status === 'fulfilled') {
             console.log(`NotifyOrgs: Successfully sent email to ${recipientEmails[index]}. Response:`, result.value);
          }
        });
        // Consider a less intrusive way to inform user if needed, as alert might have already shown success
      } else {
        console.log("NotifyOrgs: All notifications sent successfully via Email.js.");
      }

    } catch (error) {
      console.error('NotifyOrgs: Error during notification process:', error);
      // Avoid alert here if main submission succeeded, just log the error.
      // alert("An unexpected error occurred while trying to notify organizations.");
    }
  };

  // --- useEffect for pin changes (no changes needed) ---
  useEffect(() => {
    if (pin && pin.coordinates) {
      setLatitude(pin.coordinates.latitude);
      setLongitude(pin.coordinates.longitude);
    } else {
      setLatitude(null);
      setLongitude(null);
    }
  }, [pin]);

  // --- return statement (JSX - no changes needed) ---
  return (
    <form onSubmit={handleSubmit} className="text-black font-sans w-full">
       {/* ... form elements ... */}
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

       <div className="flex flex-col sm:flex sm:flex-row justify-evenly items-center w-full">
         <div className="w-4/5 sm:ml-5 grid gap-2 sm:w-1/3">
            {/* Name, Contact, Calamity Type, Other Calamity */}
             <div className="items-center">
                <label className="w-24 text-right mr-2 whitespace-nowrap text-black">Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"/>
             </div>
             <div className="items-center">
                 <label className="w-24 text-right mr-2 whitespace-nowrap text-black">Contact #:</label>
                 <input type="text" value={contactNum} onChange={(e) => setContactNum(e.target.value)} required className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"/>
              </div>
              <div className=" items-center">
                 <label className="w-24 text-right mr-3 whitespace-nowrap text-black">Calamity Type:</label>
                 <select value={calamityType} onChange={(e) => setCalamityType(e.target.value)} required className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none">
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
                   <label className="w-24 text-right mr-3 whitespace-nowrap text-black">Input Calamity:</label>
                   <textarea value={otherCalamity} onChange={(e) => setOtherCalamity(e.target.value)} required className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"/>
                 </div>
               )}
         </div>
         <div className="w-4/5 grid gap-2 sm:w-1/3">
            {/* Lon, Lat, Calamity Level, Aid Request, Other Aid */}
             <div className="flex items-center mt-4">
               <label className="w-24 text-right mr-2 whitespace-nowrap text-black">Longitude:</label>
               <p className="opacity-60">{longitude !== null ? longitude.toFixed(6) : 'Not selected (Click map)'}</p>
             </div>
             <div className="flex items-center mb-2">
                <label className="w-24 text-right mr-2 whitespace-nowrap text-black">Latitude:</label>
                <p className="opacity-60">{latitude !== null ? latitude.toFixed(6) : 'Not selected (Click map)'}</p>
              </div>
              <div className=" items-center">
                <label className="w-24 text-right mr-3 whitespace-nowrap text-black">Calamity Level:</label>
                <select value={calamityLevel} onChange={(e) => setCalamityLevel(e.target.value)} required className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none">
                  <option value="">Select Level</option>
                  <option value="1">Level 1 - Minor</option>
                  <option value="2">Level 2 - Moderate</option>
                  <option value="3">Level 3 - Major</option>
                  <option value="4">Level 4 - Severe</option>
                  <option value="5">Level 5 - Catastrophic</option>
                </select>
              </div>
              <div className=" items-center">
                <label className="w-24 text-right mr-3 whitespace-nowrap text-black">Aid Request:</label>
                <select value={aidRequest} onChange={(e) => setAidRequest(e.target.value)} required className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none">
                   <option value="">Select Type</option>
                   <option value="Clothes">Clothes</option>
                   <option value="Food">Food</option>
                   <option value="Volunteers">Volunteers</option>
                   <option value="Medical">Medical Assistance</option>
                   <option value="Rescue">Rescue</option>
                   <option value="other">Other</option>
                </select>
               </div>
              {aidRequest === 'other' && (
                 <div className=" items-center mt-2">
                   <label className="w-24 text-right mr-3 whitespace-nowrap text-black">Input Aid:</label>
                   <textarea value={otherAidRequest} onChange={(e) => setOtherAidRequest(e.target.value)} required className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"/>
                 </div>
               )}
         </div>
       </div>

       {/* Description */}
       <div className="flex justify-center items-center mt-3 w-full">
         <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} required className="px-4 py-2 mt-4 border-red-400 border-2 rounded-2xl w-4/5 sm:w-4/5 bg-white h-36 placeholder:text-black focus:border-red-600 focus:border-2 focus:outline-none" placeholder="Short Description (e.g., number of people affected, specific needs)"/>
       </div>

       {/* Image Upload */}
       <div className="flex flex-col justify-center items-center mt-5 w-full">
         <div className="w-4/5 sm:w-4/6 flex flex-col">
           <label className="w-24 text-right whitespace-nowrap text-black mb-1">Attach Image: <span className="text-red-600">*</span></label>
           <div className="items-center">
             <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} required className="hidden"/>
             <label htmlFor="image-upload" className="bg-white border-2 border-red-400 text-black px-4 py-2 rounded-md hover:bg-red-400 cursor-pointer inline-block focus:border-red-600 focus:border-2 focus:outline-none">Choose Image</label>
             {image && (<button type="button" onClick={handleRemoveImage} className="ml-3 text-black hover:text-red-700">Remove</button>)}
           </div>
           {imagePreview && (
             <div className="mt-3 border-red-400 border-2 rounded-lg p-2 bg-gray-100 focus:border-red-600 focus:border-2 focus:outline-none">
               <img src={imagePreview} alt="Preview" className="max-h-40 max-w-full object-contain"/>
               <p className="text-black text-sm mt-1">{image?.name}</p>
             </div>
           )}
         </div>
       </div>

       {/* Submit Button */}
       <div className="mt-10 flex justify-end pb-8">
         <button type="submit" className="bg-red-700 text-white px-8 py-2 rounded-md hover:bg-red-800 sm:mr-36 mx-auto disabled:opacity-50" disabled={!pin || !image || !name || !contactNum || !calamityType || !calamityLevel || !aidRequest || (calamityType === 'other' && !otherCalamity) || (aidRequest === 'other' && !otherAidRequest)}>Send Request</button>
       </div>

       {/* Consent Note */}
       <div className="flex justify-center items-center justify mx-auto w-4/5 md:w-full">
         <p className="mb-2 text-xs opacity-70">- By filling up this form, you consent to our website using your given information, which includes your name, contact number, location, and submitted image, for the purpose of emergency aid coordination and notification to relevant organizations. -</p>
       </div>

      {/* Confirmation Dialog */}
      {isConfirmationOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center text-white z-50">
          <div className="bg-[#211E1E] p-8 rounded-md shadow-lg w-11/12 sm:w-2/5">
            <div className="flex mb-4 items-center">
              <img src="/Warning.svg" alt="Warning Symbol" width="32" height="32" className="mr-3"/>
              <p className="text-lg font-bold">Confirm Submission</p>
            </div>
            <p className="mb-4">
              {isSubmittingConfirmation
                ? isNotifyingOrgs
                  ? 'Notifying nearby organizations...'
                  : 'Submitting your request...'
                : 'Submit your aid request? This will notify organizations within 30km of your location.'
              }
            </p>
            <div className="flex justify-end mt-6">
              <button type="button" onClick={cancelSubmission} className="hover:bg-gray-600 px-4 py-2 rounded-md mr-2 font-normal" disabled={isSubmittingConfirmation}>No</button>
              <button type="button" onClick={confirmSubmission} className={`px-4 py-2 rounded-md font-semibold ${isSubmittingConfirmation ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-black'}`} disabled={isSubmittingConfirmation}>
                {isSubmittingConfirmation ? (isNotifyingOrgs ? 'Notifying...' : 'Submitting...') : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default RequestAidForm;