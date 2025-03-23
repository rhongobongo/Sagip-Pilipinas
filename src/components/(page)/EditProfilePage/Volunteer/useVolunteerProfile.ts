import { useContext } from 'react';
import { VolunteerProfileContext } from './VolunteerProfileContext';

export const useProfile = () => {
    const context = useContext(VolunteerProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
};
