import { useOrgRegForm } from '../OrgRegFormContext';

const OrgDescInfo = () => {
  const { formData, setFormData } = useOrgRegForm();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="w-full mt-2 mb-4">
      <label htmlFor="description" className="block text-black font-bold mb-1">
        Organization Description: <span className="text-red-500">*</span>
      </label>
      <textarea
        id="description"
        className="shortDesc placeholder:gray-400"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        rows={4}
        required
        placeholder="Tell us about your organization's mission and activities..."
      />
    </div>
  );
};

export default OrgDescInfo;
