'use client';

import { useOrgRegForm } from '../OrgRegFormContext';

const OrgTypeInfo = () => {
  const { formData, setFormData } = useOrgRegForm(); // Use context

  /** Handles input change for organization type */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      otherText: value === 'other' ? prev.otherText : '', // Clear "otherText" if not "other"
    }));
  };

  return (
    <div>
      <div className="relative mb-[-1rem] z-10 w-fit">
        <label className="font-bold bg-white rounded-3xl px-4 py-1 border-2 border-[#ef8080]">
          Type of Organization: <span className="text-red-500">*</span>
        </label>
      </div>
      <div className="bg-white w-full text-black shadow-lg border-2 border-[#ef8080] rounded-lg px-6 pb-6 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 w-full">
          {[
            { value: 'ngo', label: 'Non-Governmental Organization (NGO)' },
            {
              value: 'charity',
              label: 'Local Community Organization (Charity)',
            },
            { value: 'foundation', label: 'Government Agency (Foundation)' },
            {
              value: 'nonprofit',
              label: 'Religious Organization (Non-Profit)',
            },
          ].map((orgType) => (
            <label
              key={orgType.value}
              className="flex items-center cursor-pointer"
            >
              <input
                type="radio"
                name="type"
                value={orgType.value}
                checked={formData.type === orgType.value}
                className="sr-only peer"
                onChange={handleInputChange}
                required
              />
              <span className="radio-container"></span>
              <span className="ml-2 text-sm sm:text-base">{orgType.label}</span>
            </label>
          ))}

          <label className="flex flex-col sm:flex-row items-start sm:items-center md:col-span-2 cursor-pointer">
            <div className="flex items-center">
              <input
                type="radio"
                name="type"
                value="other"
                checked={formData.type === 'other'}
                className="sr-only peer"
                onChange={handleInputChange}
                required
              />
              <span className="radio-container"></span>
              <span className="mx-2 text-sm sm:text-base">
                Others: (Specify)
              </span>
            </div>
            <div>
              {formData.type === 'other' && (
                <input
                  type="text"
                  name="otherText"
                  value={formData.otherText}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      otherText: e.target.value,
                    }))
                  }
                  className="textbox flex-grow overflow-x-auto w-full"
                  required
                  placeholder="Specify type"
                />
              )}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default OrgTypeInfo;
