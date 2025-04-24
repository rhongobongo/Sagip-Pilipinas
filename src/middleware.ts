import MiddlewareFirebaseAdmin, {
    authConfig,
} from "@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge";
import { NextResponse, NextRequest } from "next/server";
import { authMiddleware, redirectToLogin } from "next-firebase-auth-edge";

const PUBLIC_PATHS = [
    "/",
    "/about",
    "/learnmore",
    "/request-aid",
    "/404",
    "/news",
    "/api/organizations",
];
const AUTH_PATHS = ["/register", "/login", "/forgot-password"];
const ADMIN_PATH_REGEX = /^\/admin(?:\/([a-zA-Z0-9-]+))?(?:\/|$)/;

const isPublicPath = (pathname: string) => {
    return PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/news/");
};

export default async function middleware(request: NextRequest) {
    const { nextUrl } = request;
    const isAdminRoute = ADMIN_PATH_REGEX.test(nextUrl.pathname);
    const pathname = request.nextUrl.pathname;

    return authMiddleware(request, {
        loginPath: "/api/login",
        logoutPath: "/api/logout",
        refreshTokenPath: "/api/refresh-token",
        enableMultipleCookies: authConfig.enableMultipleCookies,
        apiKey: authConfig.apiKey,
        cookieName: authConfig.cookieName,
        cookieSerializeOptions: authConfig.cookieSerializeOptions,
        cookieSignatureKeys: authConfig.cookieSignatureKeys,
        serviceAccount: authConfig.serviceAccount,
        enableCustomToken: authConfig.enableCustomToken,

        handleValidToken: async ({ token, decodedToken }, headers) => {
            if (isAdminRoute) {
                const user = await MiddlewareFirebaseAdmin.getUser(
                    decodedToken.uid
                );
                if (!user?.customClaims?.admin) {
                    return NextResponse.redirect(new URL("/403", request.url));
                }
            }
            return NextResponse.next({
                request: {
                    headers,
                },
                headers: {
                    "x-pathname": pathname,
                },
            });
        },

        handleInvalidToken: async (_reason) => {
            if (isAdminRoute) {
                return NextResponse.redirect(new URL("/404", request.url));
            }
            if (isPublicPath(pathname)) {
                return NextResponse.next({
                    headers: {
                        "x-pathname": pathname,
                    },
                });
            }

            return redirectToLogin(request, {
                path: "/login",
                publicPaths: [...PUBLIC_PATHS, ...AUTH_PATHS],
            });
        },
    });
}

export const config = {
    matcher: [
        "/",
        "/((?!_next|favicon.ico|__/auth|__/firebase|.*\\.).*)",
        "/api/login",
        "/api/logout",
        "/api/refresh-token",
    ],
};

const setPath = (req: NextRequest) => {
    const pathname = req.nextUrl.pathname;
    const res = NextResponse.next();
    res.headers.set("x-pathname", pathname);
};
