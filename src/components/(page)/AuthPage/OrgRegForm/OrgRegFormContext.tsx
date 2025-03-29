import { createContext, useContext } from 'react';
import { OrgRegistrationContextType } from './types';

export const OrgRegFormContext = createContext<OrgRegistrationContextType | undefined>(undefined);

export const useOrgRegForm = () => {
  const context = useContext(OrgRegFormContext);
  if (!context) {
    throw new Error('useOrgRegForm must be used within an OrgRegFormProvider');
  }
  return context;
};
