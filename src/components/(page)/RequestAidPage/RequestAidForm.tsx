'use client';

import { useState, useEffect } from 'react';
import { RequestPin } from '@/types/types';
import { requestAid } from '@/components/map/SubmitAid';
import { uploadImage } from './uploadImage';
import { format } from 'date-fns';

interface RequestFormProps {
  pin: RequestPin | null;
}

const RequestAidForm: React.FC<RequestFormProps> = ({ pin }) => {
  const [name, setName] = useState('');
  const [contactNum, setContactNum] = useState('');
  // const [date, setDate] = useState(''); unused
  // const [location, setLocation] = useState(''); unused
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

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false); // New state for dialog
  const [isSubmittingConfirmation, setIsSubmittingConfirmation] =
    useState(false); // New state for confirmation submission

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);

      // Create a preview URL for the image
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationOpen(true); // Open the confirmation dialog
    console.log('reached');
    if (!pin || !image) return;

    console.log('reached 2');
    const imageURL = await uploadImage(image);

    const formattedDate = format(new Date(), 'MMMM dd, yyyy');
    const formattedTime = format(new Date(), 'h:mm a');

    Object.assign(pin, {
      name,
      contactNum,
      location,
      calamityLevel,
      calamityType,
      shortDesc,
      imageURL,
      submissionDate: formattedDate,
      submissionTime: formattedTime,
    });

    await requestAid(pin);
  };

  const confirmSubmission = async () => {
    setIsSubmittingConfirmation(true); // Set submitting state to true
    if (!pin || !image) {
      setIsSubmittingConfirmation(false);
      return;
    }

    try {
      const imageURL = await uploadImage(image);
      const formattedDate = format(new Date(), 'MMMM dd, yyyy'); // Corrected date format
      const formattedTime = format(new Date(), 'h:mm a');

      Object.assign(pin, {
        name,
        contactNum,
        location: `${latitude?.toFixed(6)}, ${longitude?.toFixed(6)}`, // Include location here
        calamityLevel,
        calamityType: calamityType === 'other' ? otherCalamity : calamityType,
        aidRequest: aidRequest === 'other' ? otherAidRequest : aidRequest,
        shortDesc,
        imageURL,
        submissionDate: formattedDate,
        submissionTime: formattedTime,
        coordinates: { latitude, longitude }, // Ensure coordinates are included
      });

      await requestAid(pin);
      setIsConfirmationOpen(false); // Close the dialog after submission
      window.location.reload();
      alert('Request submitted successfully!'); // Example success message
    } catch (error: unknown) {
      console.error('Error submitting request:', error);
      if (error instanceof Error) {
        alert(`Failed to submit request: ${error.message}`);
      } else {
        alert('Failed to submit request: An unknown error occurred.');
        console.error('Unknown error:', error);
      }
    } finally {
      setIsSubmittingConfirmation(false); // Set submitting state back to false
    }
  };

  const cancelSubmission = () => {
    setIsConfirmationOpen(false); // Close the dialog
  };

  useEffect(() => {
    if (pin && pin.coordinates) {
      setLatitude(pin.coordinates.latitude);
      setLongitude(pin.coordinates.longitude);
    } else {
      setLatitude(null);
      setLongitude(null);
    }
  }, [pin]);

  return (
    <form onSubmit={handleSubmit} className="text-black font-sans">
      <div className="opacity-60 flex justify-evenly gap-[36rem] -translate-y-6">
        <div className="">
          <p>Date: {format(new Date(), 'MMMM dd, yyyy')}</p>
          <p>Time: {format(new Date(), 'h:mm a')}</p>
        </div>
        <div className="text-wrap">
          Note: Place a pin in the map and fill out all necessary inormation
          before submitting request.
        </div>
      </div>

      <div className="flex justify-center items-center w-full gap-20">
        <div className="ml-5 grid gap-2 w-1/3">
          <div className="flex items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-2xl bg-red-400"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Contact #:
            </label>
            <input
              type="text"
              value={contactNum}
              onChange={(e) => setContactNum(e.target.value)}
              className="w-full px-4 py-2 border rounded-2xl bg-red-400"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Calamity Type:
            </label>
            <select
              value={calamityType}
              onChange={(e) => setCalamityType(e.target.value)}
              className="w-full px-4 py-2 border rounded-2xl bg-red-400"
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
            <div className="flex items-center mt-2">
              {' '}
              {/* Added mt-2 for spacing */}
              <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
                Input Calamity:
              </label>
              <textarea
                value={otherCalamity}
                onChange={(e) => setOtherCalamity(e.target.value)}
                className="w-full px-4 py-2 border rounded-2xl bg-red-400"
              />
            </div>
          )}
          {/* <div className="flex items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Date:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-2xl bg-red-400"
            />
          </div> */}
          {/* <div className="flex items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Location:
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border rounded-2xl bg-red-400"
            />
          </div> */}
        </div>
        <div className="grid gap-2 w-1/3">
          <div className="flex items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Longitude:
            </label>
            <p className="opacity-60">
              {longitude !== null ? longitude.toFixed(6) : 'Not selected'}
            </p>
          </div>
          <div className="flex items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Latitude:
            </label>
            <p className="opacity-60">
              {latitude !== null ? latitude.toFixed(6) : 'Not selected'}
            </p>
          </div>

          <div className="flex items-center">
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Calamity Level:
            </label>
            <select
              value={calamityLevel}
              onChange={(e) => setCalamityLevel(e.target.value)}
              className="w-full px-4 py-2 border rounded-2xl bg-red-400"
            >
              <option value="">Select Level</option>
              <option value="1">Level 1 - Minor</option>
              <option value="2">Level 2 - Moderate</option>
              <option value="3">Level 3 - Major</option>
              <option value="4">Level 4 - Severe</option>
              <option value="5">Level 5 - Catastrophic</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Aid Request:
            </label>
            <select
              value={aidRequest}
              onChange={(e) => setAidRequest(e.target.value)}
              className="w-full px-4 py-2 border rounded-2xl bg-red-400"
            >
              <option value="">Select Type</option>
              <option value="flood">Clothes</option>
              <option value="earthquake">Food</option>
              <option value="fire">Volunteers</option>
              <option value="other">Other</option>
            </select>
          </div>
          {aidRequest === 'other' && (
            <div className="flex items-center mt-2">
              {' '}
              {/* Added mt-2 for spacing */}
              <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
                Input Aid:
              </label>
              <textarea
                value={otherAidRequest}
                onChange={(e) => setOtherAidRequest(e.target.value)}
                className="w-full px-4 py-2 border rounded-2xl bg-red-400"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center items-center mt-3 w-full pl-2">
        <label className="w-24 text-right whitespace-nowrap text-black -translate-x-10">
          Short Description:
        </label>
        <textarea
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          className="px-4 py-2 border rounded-2xl w-4/6 bg-red-400 h-36 resize-none"
        />
      </div>

      {/* Image Upload Section */}
      <div className="flex justify-center items-center mt-5 w-full pl-2">
        <label className="w-24 text-right whitespace-nowrap text-black -translate-x-10">
          Attach Image:
        </label>
        <div className="w-4/6 flex flex-col">
          <div className="flex items-center">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="bg-red-400 text-black px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer inline-block"
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

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-3 border rounded-lg p-2 bg-gray-100">
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

      <div className="mt-10 flex justify-end pb-8">
        <button
          type="submit"
          className="bg-red-700 text-white px-8 py-2 rounded-md hover:bg-red-800 mr-36"
        >
          Send Request
        </button>
      </div>
      <div className="flex justify-center items-center">
        <p className="mb-2">
          -By filling up this form, you consent to our website using your given
          information, which includes your name and contact number-
        </p>
      </div>
      {/* Confirmation Dialog */}
      {isConfirmationOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center text-white">
          <div className="bg-[#211E1E] p-8 rounded-md shadow-lg w-2/5">
            <div className="flex mb-4 -translate-x-3">
              <img // Warning Image
                src="/Warning.svg" // Replace with the correct path to your image
                alt="Warning Symbol"
                width="48" // Adjust size as needed
                height="48"
                className="-translate-y-3"
              />
              <p className="text-lg font-bold">Confirm Submission</p>
            </div>
            <p>Submit your aid request?</p>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={cancelSubmission}
                className=" hover:bg-gray-600 px-4 py-2 rounded-md mr-2 font-normal"
              >
                No
              </button>
              <button
                type="button"
                onClick={confirmSubmission}
                className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-md font-semibold"
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
