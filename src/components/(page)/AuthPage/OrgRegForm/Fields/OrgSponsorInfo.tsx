'use client';

import { useOrgRegForm } from '../OrgRegFormContext';
import { CiCirclePlus } from 'react-icons/ci';
import imageCompression from 'browser-image-compression';

const OrgSponsorInfo = () => {
  const {
    sponsors,
    setSponsors,
    isAddingSponsor,
    setIsAddingSponsor,
    currentSponsorData,
    setCurrentSponsorData,
  } = useOrgRegForm();

  /** Handles opening the "Add Sponsor" form */
  const handleAddSponsorClick = () => {
    setIsAddingSponsor(true);
    setCurrentSponsorData({
      name: '',
      other: '',
      photoFile: null,
      photoPreview: null,
    });
  };

  /** Cancels adding a new sponsor */
  const handleCancelAddSponsor = () => {
    setIsAddingSponsor(false);
    setCurrentSponsorData({
      name: '',
      other: '',
      photoFile: null,
      photoPreview: null,
    });
  };

  /** Handles input changes in sponsor form */
  const handleCurrentSponsorInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setCurrentSponsorData((prev) => ({ ...prev, [name]: value }));
  };

  /** Handles sponsor image selection & compression */
  const handleCurrentSponsorImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.[0]) {
      const originalFile = e.target.files[0];
      console.log(
        `Original sponsor file size: ${originalFile.size / 1024 / 1024} MB`
      );
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      try {
        console.log('Compressing sponsor image...');
        const compressedFile = await imageCompression(originalFile, options);
        console.log(
          `Compressed sponsor file size: ${compressedFile.size / 1024 / 1024} MB`
        );

        const reader = new FileReader();
        reader.onload = (event) => {
          setCurrentSponsorData((prev) => ({
            ...prev,
            photoFile: compressedFile,
            photoPreview: (event.target?.result as string) ?? null,
          }));
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error during sponsor image compression:', error);
      }

      e.target.value = ''; // Reset file input
    }
  };

  /** Removes sponsor image */
  const handleRemoveCurrentSponsorImage = () => {
    setCurrentSponsorData((prev) => ({
      ...prev,
      photoFile: null,
      photoPreview: null,
    }));
  };

  /** Saves sponsor to list */
  const handleSaveSponsor = () => {
    if (!currentSponsorData.name.trim()) {
      alert('Sponsor name is required.');
      return;
    }

    const newSponsor = {
      id: `sponsor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ...currentSponsorData,
    };

    setSponsors((prev) => [...prev, newSponsor]);
    setIsAddingSponsor(false);
  };

  /** Deletes sponsor from list */
  const handleDeleteSponsor = (idToDelete: string) => {
    setSponsors((prev) => prev.filter((sponsor) => sponsor.id !== idToDelete));
  };

  return (
    <div className="w-full py-4">
      <div className="relative mb-[-1rem] z-10 w-fit">
        <div className="font-bold bg-white rounded-3xl px-4 py-1 border-2 border-[#ef8080]">
          Sponsors (Optional):
        </div>
      </div>
      <div className="bg-white w-full text-black shadow-lg border-2 border-[#ef8080] rounded-lg p-6 pt-8">
        {sponsors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {sponsors.map((s) => (
              <div
                key={s.id}
                className="border p-3 rounded-lg shadow relative flex flex-col items-center text-center bg-gray-50"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteSponsor(s.id)}
                  className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full p-0.5 leading-none text-lg"
                  aria-label="Delete sponsor"
                >
                  &times;
                </button>
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-2 flex items-center justify-center border">
                  {s.photoPreview ? (
                    <img
                      src={s.photoPreview}
                      alt={`${s.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-xs">No Photo</span>
                  )}
                </div>
                <p className="font-semibold text-sm mb-1 break-words w-full">
                  {s.name}
                </p>
                {s.other && (
                  <p className="text-xs text-gray-600 break-words w-full">
                    {s.other}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {isAddingSponsor ? (
          <div className="border-t pt-4 mt-4 flex flex-col items-center gap-3">
            <h2 className="font-semibold mb-2">Add New Sponsor</h2>
            <div className="w-full max-w-sm">
              <label
                htmlFor="sponsor-name-new"
                className="block text-sm font-medium mb-1"
              >
                Sponsor Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="sponsor-name-new"
                name="name"
                value={currentSponsorData.name}
                onChange={handleCurrentSponsorInputChange}
                className="textbox w-full"
                required
              />
            </div>
            <div className="w-full max-w-sm">
              <label
                htmlFor="sponsor-other-new"
                className="block text-sm font-medium mb-1"
              >
                Other Info (Link/Desc):
              </label>
              <input
                type="text"
                id="sponsor-other-new"
                name="other"
                value={currentSponsorData.other}
                onChange={handleCurrentSponsorInputChange}
                className="textbox w-full"
              />
            </div>
            <div className="flex flex-col items-center gap-2 w-full max-w-sm">
              <label
                htmlFor="sponsor-photo-new"
                className="block text-sm font-medium"
              >
                Sponsor Photo (Optional):
              </label>
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center border">
                {currentSponsorData.photoPreview ? (
                  <img
                    src={currentSponsorData.photoPreview}
                    alt="Sponsor Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-500">Preview</span>
                )}
                <input
                  type="file"
                  id="sponsor-photo-new"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleCurrentSponsorImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              {currentSponsorData.photoPreview ? (
                <button
                  type="button"
                  onClick={handleRemoveCurrentSponsorImage}
                  className="mt-1 text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Photo
                </button>
              ) : (
                <label
                  htmlFor="sponsor-photo-new"
                  className="mt-1 text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                >
                  Upload Photo
                </label>
              )}
            </div>
            <div className="flex gap-4 mt-3">
              <button
                type="button"
                onClick={handleSaveSponsor}
                className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Save Sponsor
              </button>
              <button
                type="button"
                onClick={handleCancelAddSponsor}
                className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center pt-4 border-t mt-4">
            <button
              type="button"
              onClick={handleAddSponsorClick}
              className="flex items-center gap-2 text-black hover:text-white hover:border-none hover:bg-red-300 p-2 rounded-lg font-medium mt-4"
            >
              <CiCirclePlus className="text-2xl" /> Add Sponsor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgSponsorInfo;
