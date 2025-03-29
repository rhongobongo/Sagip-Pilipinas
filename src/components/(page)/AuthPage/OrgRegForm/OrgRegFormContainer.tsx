import { FaPeopleGroup } from "react-icons/fa6";
import OrgRegFormInteractive from "./OrgRegFormInteractive";
import { OrgRegistrationProvider } from "./OrgRegFormProvider";

const OrgRegFormContainer = () => {
    return (
        <div className="max-w-[1600px] bg-white w-full text-black shadow-lg border-4 border-black rounded-lg p-8">
            <div className="w-1/6 flex justify-center">
                <h1 className="flex justify-start mb-4 -translate-y-12 bg-white px-4 rounded-3xl font-bold">
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
