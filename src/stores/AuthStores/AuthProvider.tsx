'use client';

import * as React from 'react';
import { AuthContext, User } from './AuthContext';

export interface AuthProviderProps {
    user: User | null;
    children: React.ReactNode;
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
    user,
    children
}) => {
    const contextValue = React.useMemo(() => ({ user }), [user]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
