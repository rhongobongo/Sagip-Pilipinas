import VolunteerProfileProvider from "./VolunteerProfileProvider";
import VolunteerProfileSection from "./VolunteerProfileSection";

const VolunteerProfileManagement = () => {
    return (
        <VolunteerProfileProvider>
            <VolunteerProfileSection></VolunteerProfileSection>
        </VolunteerProfileProvider>
    );
};


export default VolunteerProfileManagement;
