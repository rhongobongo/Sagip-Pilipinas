import MiddlewareFirebaseAdmin, { authConfig } from "@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge";
import {
    NextResponse,
    NextRequest
} from "next/server";
import {
    authMiddleware,
    redirectToLogin
} from "next-firebase-auth-edge";

const PUBLIC_PATHS = ['/', '/about', '/contact-us', '/map', '/request-aid', '/404'];
const AUTH_PATHS = ['/register', '/login', 'forget-password'];

export default async function middleware(request: NextRequest) {

    const adminRegex = /^\/admin(?:\/([a-zA-Z0-9]+))?(?:\/|$)/;
    const { nextUrl } = request;

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

        handleValidToken: async ({ token, decodedToken }, headers) => {

            if (adminRegex.test(nextUrl.pathname)) {
                const user = await MiddlewareFirebaseAdmin.getUser(decodedToken.uid);
                if (!user?.customClaims?.admin) {
                    return NextResponse.redirect(new URL('/404', request.url));
                }
            }
            return NextResponse.next({
                request: {
                    headers,
                },
            });
        },

        handleInvalidToken: async (_reason) => {
            if (adminRegex.test(nextUrl.pathname)) {
                return NextResponse.redirect(new URL('/404', request.url));
            }
            return redirectToLogin(request, {
                path: '/login',
                publicPaths: [...PUBLIC_PATHS, ...AUTH_PATHS]
            })
        }
    })
}

export const config = {
    matcher: [
        '/',
        '/((?!_next|favicon.ico|__/auth|__/firebase|.*\\.).*)',
        '/api/login',
        '/api/logout',
        '/api/refresh-token'
    ]
};