import { authConfig } from "@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge";
import { NextResponse, 
        NextRequest } from "next/server";
import { authMiddleware,
    redirectToLogin } from "next-firebase-auth-edge";
import { headers } from "next/headers";

const PUBLIC_PATHS = ['/', '/about', '/contact-us', '/map'];
const AUTH_PATHS = ['/register', '/login', 'forget-password'];

export default async function middleware(request: NextRequest) {
    
    return authMiddleware(request, {
        loginPath: '/api/login',
        logoutPath: '/api/logout',
        refreshTokenPath: '/api/refresh-token',
        enableMultipleCookies: authConfig.enableMultipleCookies,
        apiKey: authConfig.apiKey,
        cookieName: authConfig.cookieName,
        cookieSerializeOptions: authConfig.cookieSerializeOptions,
        cookieSignatureKeys: authConfig.cookieSignatureKeys,
        serviceAccount: authConfig.serviceAccount,
        enableCustomToken: authConfig.enableCustomToken,

        handleValidToken: async ({token, decodedToken}, headers) => {
            return NextResponse.next({
                request: {
                  headers,
                },
              });
        }
    })
}