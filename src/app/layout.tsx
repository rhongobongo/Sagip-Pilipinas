import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import NavbarWrapper from '@/components/layout/Navbar/NavbarWrapper';
import Footer from '@/components/layout/footer';
import { AuthProvider } from '@/stores/AuthStores/AuthProvider';
import { getAuthTokens } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge';
import { cookies } from 'next/headers';
import { User } from '@/stores/AuthStores/AuthContext';
import { filterStandardClaims } from 'next-firebase-auth-edge/lib/auth/claims';
import { Tokens } from 'next-firebase-auth-edge';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Optional: for CSS variables
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sagip-Pilipinas',
  description: 'Generated by create next app',
};

const toUser = ({ decodedToken }: Tokens): User => {
  const {
    uid,
    email,
    picture: photoURL,
    email_verified: emailVerified,
    phone_number: phoneNumber,
    name: displayName,
    source_sign_in_provider: signInProvider,
  } = decodedToken;

  const customClaims = filterStandardClaims(decodedToken);

  return {
    uid,
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    phoneNumber: phoneNumber ?? null,
    emailVerified: emailVerified ?? false,
    providerId: signInProvider,
    customClaims,
  };
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tokens = await getAuthTokens(await cookies());

  const user = tokens ? toUser(tokens) : null;

  return (
    <html lang="en" className={inter.className}>
      <head></head>
      <body
        className={`${inter.variable} antialiased flex flex-col min-h-screen`}
      >
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />

        <AuthProvider user={user}>
          <NavbarWrapper />
          <div className="flex-1>">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
