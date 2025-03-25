'use client';
import { useState } from 'react';
import preview from '../../../../public/PreviewPhoto.svg';
import Image from 'next/image';
import { registerOrganization } from '@/lib/APICalls/Auth/registerAuth';
import { FaPeopleGroup } from 'react-icons/fa6';

interface SocialLink {
  id: number;
  platform: string;
  username: string;
  link: string;
}

const OrgRegistrationForm: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    password: '',
    retypePassword: '',
    type: '',
    description: '',
    location: '', // Added location
    dateOfEstablishment: '', // Added dateOfEstablishment
    otherText: '', // Added otherText
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otherTextbox, setOtherTextbox] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: 1, platform: 'X', username: '', link: '' },
    { id: 2, platform: 'Instagram', username: '', link: '' },
    { id: 3, platform: 'Facebook', username: '', link: '' },
  ]);

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'type' && value === 'other') {
      setOtherTextbox(true);
      //Crucially, keep other text if they switch back
      setFormData((prevData) => ({ ...prevData, type: value }));
    } else if (name === 'type') {
      setOtherTextbox(false);
      // Reset otherText when a different radio button is selected
      setFormData((prevData) => ({ ...prevData, type: value, otherText: '' }));
    } else if (name === 'otherText') {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSocialInputChange = (
    id: number,
    field: 'username' | 'link',
    value: string
  ) => {
    setSocialLinks(
      socialLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const addLink = (platform: string) => {
    const newId = socialLinks.length + 1;
    setSocialLinks([
      ...socialLinks,
      { id: newId, platform, username: '', link: '' },
    ]);
  };

  const deleteLink = (id: number) => {
    setSocialLinks(socialLinks.filter((link) => link.id !== id));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      return 'Email format is invalid';
    if (!formData.contactNumber.trim()) return 'Contact number is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6)
      return 'Password must be at least 6 characters';
    if (formData.password !== formData.retypePassword)
      return "Passwords don't match";
    if (!formData.type) return 'Organization type is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!image) {
      setError('Profile image is required.');
      return;
    }

    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('contactNumber', formData.contactNumber);
      formDataObj.append('password', formData.password);
      formDataObj.append('retypePassword', formData.retypePassword);
      formDataObj.append('type', formData.type);
      formDataObj.append('description', formData.description);

      const response = await registerOrganization(formDataObj, image);

      if (response.success) {
        setSuccess('Registration successful! Redirecting to dashboard...');

        // Reset form
        setFormData({
          name: '',
          email: '',
          contactNumber: '',
          password: '',
          retypePassword: '',
          type: '',
          description: '',
          location: '', // Added location
          dateOfEstablishment: '', // Added dateOfEstablishment
          otherText: '', // Added otherText
        });
        setImage(null);
        setImagePreview(null);

        setTimeout(() => {
          window.location.href = './login';
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error during registration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] bg-white w-full text-black shadow-lg border-4 border-black rounded-lg p-8 ">
      <div className="w-1/6 flex justify-center">
        <h1 className="flex justify-start mb-4 -translate-y-12 bg-white px-4 rounded-3xl font-bold">
          <FaPeopleGroup className="text-3xl pr-1" /> ORGANIZATION
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex flex- items-start justify-around">
          <div className="flex justify-center mt-5 w-1/4 pl-2 flex-col items-center">
            {/* Image Upload Section */}
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
                  src={imagePreview}
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
            <div className="flex w-full gap-4">
              <div className="items-center">
                <label className="w-32 text-right font-bold">
                  Organization Name:
                </label>{' '}
                <input
                  className="textbox w-full"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />{' '}
              </div>
              <div className="items-center">
                <label className="w-32 text-right font-bold">Location:</label>{' '}
                <input
                  className="textbox w-full"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />{' '}
              </div>
              <div className="items-center">
                <label className="w-32 text-right font-bold">
                  Date of Establishment:
                </label>{' '}
                <input
                  className="textbox w-full"
                  type="date"
                  name="dateOfEstablishment"
                  value={formData.dateOfEstablishment}
                  onChange={handleInputChange}
                  required
                />{' '}
              </div>
            </div>
            <div>
              <div className="flex w-4/5 justify-start mt-4">
                <div className="mb-4 bg-white w-full text-black shadow-lg border-4 border-[#ef8080] rounded-lg px-6 pb-6">
                  <label className="flex justify-center font-bold -translate-x-7 -translate-y-3 bg-white rounded-3xl w-1/5">
                    Organization Type:
                  </label>
                  <div className="flex flex-wrap gap-2 justify-start w-full">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="ngo"
                        checked={formData.type === 'ngo'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">
                        Non-Governmental Organization (NGO)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="charity"
                        checked={formData.type === 'charity'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">
                        Local Community Organization (Charity)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="foundation"
                        checked={formData.type === 'foundation'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">
                        Government Agency (Foundation)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="nonprofit"
                        checked={formData.type === 'nonprofit'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container"></span>
                      <span className="ml-1">
                        Religious Organization (Non-Profit)
                      </span>
                    </label>
                    <label className="flex items-center w-2/3">
                      <input
                        type="radio"
                        name="type"
                        value="other"
                        checked={formData.type === 'other'}
                        className="sr-only peer"
                        onChange={handleInputChange}
                      />
                      <span className="radio-container "></span>
                      <span className="ml-1 ">Others: (Specify)</span>
                      <div className="flex pl-4 w-2/3">
                        {otherTextbox && (
                          <div className="w-full">
                            <input
                              type="text"
                              name="otherText" // Correct name
                              value={formData.otherText} // Correct value
                              onChange={handleInputChange}
                              className="textbox w-full" //Consistent Styling
                            />
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="h-[4.25rem] translate-y-24 translate-x-6 border-l-2 border-black"></div>
                <div className="flex flex-col items-start w-2/3">
                  <h2 className="text-lg font-semibold mb-4">
                    <div className="w-4 translate-y-28 translate-x-6 border-t-2 border-black"></div>
                    <div className="w-4 translate-y-40 translate-x-6 border-t-2 border-black"></div>
                    Contact Information:
                  </h2>
                  <div className="flex flex-col gap-1.5 w-full">
                    <div>
                      <input
                        type="text"
                        className="textbox placeholder:text-black w-2/3"
                        placeholder="+63 |"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="textbox placeholder:text-gray-300 w-[60%] ml-10"
                        placeholder="Primary Contact Person Name"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="textbox placeholder:text-gray-300 w-[60%] ml-10"
                        placeholder="Position in organization"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-col items-start">
                  <div className="">
                    <h1 className="text-lg font-semibold mb-4">
                      Social Media:
                    </h1>
                  </div>
                  <div className="">
                    <div>
                      <h1 className="text-lg font-semibold mb-4">Email:</h1>
                      <input type="text" className="textbox" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="flex items-center">
              <label className="w-32 text-right mr-2">Email:</label>
              <input
                className="textbox w-full"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-32 text-right mr-2">Contact #:</label>
              <input
                className="textbox w-full"
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
              />
            </div> */}

          {/* <div className="w-full flex flex-col gap-3">
            <div className="flex items-center">
              <label className="w-32 text-right mr-2">Password:</label>
              <input
                className="textbox w-full"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex items-center">
              <label className="w-32 text-right mr-2">Retype Password:</label>
              <input
                className="textbox w-full"
                type="password"
                name="retypePassword"
                value={formData.retypePassword}
                onChange={handleInputChange}
                required
              />
            </div>
          </div> */}
        </div>
        <div className="flex flex-col mt-8 mb-8 w-full pl-2">
          <label className="w-24 text-right whitespace-nowrap text-black">
            Organization Description:
          </label>
          <textarea
            className="shortDesc"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
        <div className="pl-2">
          <h1>Sponsors: </h1>
          <h1 className="flex items-center justify-center font-semibold">
            IM ASSUMING MGA PICTURES NI SA MGA NAG REGISTER ARI SO IDK PA
          </h1>
        </div>
        <div className="mt-10 flex justify-end pb-8">
          <button
            type="submit"
            className={`bg-gray-300 text-black font-semibold text-sm px-8 py-2 rounded-md hover:bg-gray-400 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrgRegistrationForm;
