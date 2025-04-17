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

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmittingConfirmation, setIsSubmittingConfirmation] =
    useState(false);

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
    setIsConfirmationOpen(true);
  };

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

      const formattedDate = format(new Date(), 'MMMM dd, yyyy');
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

      await requestAid(pin);
      setIsConfirmationOpen(false);
      window.location.reload();
      alert('Request submitted successfully!');
    } catch (error: unknown) {
      console.error('Error submitting request:', error);
      if (error instanceof Error) {
        alert(`Failed to submit request: ${error.message}`);
      } else {
        alert('Failed to submit request: An unknown error occurred.');
        console.error('Unknown error:', error);
      }
    } finally {
      setIsSubmittingConfirmation(false);
    }
  };

  const cancelSubmission = () => {
    setIsConfirmationOpen(false);
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
    <form onSubmit={handleSubmit} className="text-black font-sans w-full">
      <div className="text-sm sm:text-base text-center justify opacity-60 flex justify-evenly items-center -translate-y-6 w-4/5 mx-auto">
        <div className="w-1/4 text-right">
          <p>Date: {format(new Date(), 'MMMM dd, yyyy')}</p>
          <p>Time: {format(new Date(), 'h:mm a')}</p>
        </div>
        <div className="text-wrap w-3/4 text-end">
          Note: Place a pin in the map and fill out all necessary inormation
          before submitting request.
        </div>
      </div>

      {/* Rest of the JSX remains the same */}
      <div className="flex flex-col sm:flex sm:flex-row justify-evenly items-center w-full">
        <div className="w-4/5 sm:ml-5 grid gap-2 sm:w-1/3">
          <div className="items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
            />
          </div>
          <div className="items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Contact #:
            </label>
            <input
              type="text"
              value={contactNum}
              onChange={(e) => setContactNum(e.target.value)}
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
            />
          </div>
          <div className=" items-center">
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Calamity Type:
            </label>
            <select
              value={calamityType}
              onChange={(e) => setCalamityType(e.target.value)}
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
          {calamityType === 'other' && (
            <div className=" items-center mt-2">
              <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
                Input Calamity:
              </label>
              <textarea
                value={otherCalamity}
                onChange={(e) => setOtherCalamity(e.target.value)}
                className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
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
              {longitude !== null ? longitude.toFixed(6) : 'Not selected'}
            </p>
          </div>
          <div className="flex items-center mb-2">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Latitude:
            </label>
            <p className="opacity-60">
              {latitude !== null ? latitude.toFixed(6) : 'Not selected'}
            </p>
          </div>
          <div className=" items-center">
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Calamity Level:
            </label>
            <select
              value={calamityLevel}
              onChange={(e) => setCalamityLevel(e.target.value)}
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
          <div className=" items-center">
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Aid Request:
            </label>
            <select
              value={aidRequest}
              onChange={(e) => setAidRequest(e.target.value)}
              className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
            >
              <option value="">Select Type</option>
              <option value="flood">Clothes</option>
              <option value="earthquake">Food</option>
              <option value="fire">Volunteers</option>
              <option value="other">Other</option>
            </select>
          </div>
          {aidRequest === 'other' && (
            <div className=" items-center mt-2">
              <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
                Input Aid:
              </label>
              <textarea
                value={otherAidRequest}
                onChange={(e) => setOtherAidRequest(e.target.value)}
                className="w-full px-4 py-2 border-red-400 border-2 rounded-2xl bg-white focus:border-red-600 focus:border-2 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center items-center mt-3 w-full">
        <textarea
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          className="px-4 py-2 mt-4 border-red-400 border-2 rounded-2xl w-4/5 sm:w-4/5 bg-white h-36 placeholder:text-black focus:border-red-600 focus:border-2 focus:outline-none"
          placeholder="Short Description"
        />
      </div>

      {/* Image Upload Section */}
      <div className="flex flex-col justify-center items-center mt-5 w-full">
        <div className="w-4/5 sm:w-4/6 flex flex-col">
          <label className="w-24 text-right whitespace-nowrap text-black">
            Attach Image:
          </label>
          <div className="items-center">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
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

      <div className="mt-10 flex justify-end pb-8">
        <button
          type="submit"
          className="bg-red-700 text-white px-8 py-2 rounded-md hover:bg-red-800 sm:mr-36 mx-auto"
        >
          Send Request
        </button>
      </div>
      <div className="flex justify-center items-center justify mx-auto w-4/5 md:w-full">
        <p className="mb-2">
          -By filling up this form, you consent to our website using your given
          information, which includes your name and contact number-
        </p>
      </div>
      {/* Confirmation Dialog */}
      {isConfirmationOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center text-white z-50">
          {' '}
          {/* Added z-index */}
          <div className="bg-[#211E1E] p-8 rounded-md shadow-lg w-2/5">
            <div className="flex mb-4 items-center">
              {' '}
              {/* Adjusted alignment */}
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
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={cancelSubmission}
                className=" hover:bg-gray-600 px-4 py-2 rounded-md mr-2 font-normal"
                disabled={isSubmittingConfirmation}
              >
                No
              </button>
              <button
                type="button"
                onClick={confirmSubmission}
                className={`px-4 py-2 rounded-md font-semibold ${
                  isSubmittingConfirmation
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' // Adjusted disabled style
                    : 'bg-green-500 hover:bg-green-600 text-black'
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
