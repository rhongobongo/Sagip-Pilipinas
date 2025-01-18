export const serverConfig = {
    useSecureCookies: false,
    firebaseApiKey: process.env.FIREBASE_API_KEY ?? '',
    serviceAccount: {
        projectId: process.env.FIREBASE_PROJECT_ID as string, 
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') as string,
    }
};
  
  
export const authConfig = {
    apiKey: serverConfig.firebaseApiKey,
    cookieName: 'AuthToken',
    cookieSignatureKeys: process.env.COOKIE_SIGNATURE_KEYS
        ? process.env.COOKIE_SIGNATURE_KEYS.split('\n')
        : [],
    cookieSerializeOptions: {
        path: '/',
        httpOnly: true,
        secure: serverConfig.useSecureCookies,
        sameSite: 'lax' as const,
        maxAge: 12 * 60 * 60 * 24
    },
    serviceAccount: serverConfig.serviceAccount,
    enableMultipleCookies: true,
    enableCustomToken: false,
};

