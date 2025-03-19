'use client';
import { useState } from 'react';
import preview from '../../../../public/PreviewPhoto.svg';
import Image from 'next/image';

const VolRegistrationForm: React.FC = () => {
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

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  return (
    <div className="w-full text-black">
      <div className="">
        <h1 className="flex items-center justify-center mb-4">
          Help out people in their time of need by registering now! Choose an
          organization that is partnered with SAGIP PILIPINAS and start helping
          as soon as help is needed!
        </h1>
      </div>
      <div className="flex items-start justify-around mt-16">
        {' '}
        {/* Changed justify-evenly to justify-around and items-center to items-start */}
        <div className="flex justify-center mt-5 w-full pl-2 flex-col items-center">
          {/* Image Upload Section - No Changes Needed Here */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
            {!imagePreview && (
              <Image
                src={preview}
                alt="Placeholder"
                layout="fill"
                objectFit="cover"
              />
            )}
            {imagePreview && (
              <img
                src={preview && imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          {!imagePreview && (
            <label
              htmlFor="image-upload"
              className="mt-2 text-black text-center cursor-pointer text-sm"
            >
              Upload Photo Here
            </label>
          )}
          {imagePreview && (
            <div className="mt-2 text-black text-center text-sm">
              Upload Photo Here
            </div>
          )}
          {imagePreview && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="mt-1 text-black hover:text-red-700 text-sm"
            >
              Delete Photo
            </button>
          )}
        </div>
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center">
            <label className="w-32 text-right mr-2">Name:</label>{' '}
            <input className="textbox w-full" type="text" />{' '}
          </div>
          <div className="flex items-center">
            <label className="w-32 text-right mr-2">Email:</label>
            <input className="textbox w-full" type="text" />
          </div>
          <div className="flex items-center">
            <label className="w-32 text-right mr-2">Contact #:</label>
            <input className="textbox w-full" type="text" />
          </div>
        </div>
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center">
            <label className="w-32 text-right mr-2">Username:</label>
            <input className="textbox w-full" type="text" />
          </div>
          <div className="flex items-center">
            <label className="w-32 text-right mr-2">Password:</label>
            <input className="textbox w-full" type="text" />
          </div>
          <div className="flex items-center">
            <label className="w-32 text-right mr-2">Retype Password:</label>
            <input className="textbox w-full" type="text" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-right">
        <h1>Organizations: </h1>
        <h1 className="font-semibold mt-8">
          IM ASSUMING MGA PICTURES NI SA MGA ORGANIZATIONS ARI SO IDK PA
        </h1>
      </div>
      <div className="mt-10 flex justify-end pb-8">
        <button
          type="submit"
          className="bg-gray-300 text-black font-semibold text-sm px-8 py-2 rounded-md hover:bg-gray-400"
        >
          Register
        </button>
      </div>
      <div className="flex items-center justify-center">
        <h1>
          Already have an account? Log in{' '}
          <a className="text-blue-800" href="./login">
            here!
          </a>
        </h1>
      </div>
    </div>
  );
};

export default VolRegistrationForm;
