import { FaPeopleGroup } from 'react-icons/fa6';
import OrgRegFormInteractive from './OrgRegFormInteractive';
import { OrgRegistrationProvider } from './OrgRegFormProvider';

const OrgRegFormContainer = () => {
  return (
    <div className="w-full mx-auto bg-white text-black shadow-lg border-4 border-black rounded-lg p-4 md:p-8 ">
      <div className="w-full flex justify-center mb-4">
        <h1 className="flex items-center justify-center mb-4 -translate-y-8 md:-translate-y-12 bg-white px-4 rounded-3xl font-bold text-lg md:text-xl">
          <FaPeopleGroup className="text-3xl pr-1" /> Organization
        </h1>
      </div>
      <OrgRegistrationProvider>
        <OrgRegFormInteractive></OrgRegFormInteractive>
      </OrgRegistrationProvider>
    </div>
  );
};

export default OrgRegFormContainer;
