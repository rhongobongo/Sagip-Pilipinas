// Navbar.tsx (Server Component)
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getAuthTokens } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge';
import MobileMenuToggle from './MobileMenuToggle';
import LogoutButton from './LogoutButton'; // Ensure this import is correct

interface LinkInterface {
  displayName: string;
  href: string;
}

const Navbar = async () => {
  const cookieStore = await cookies();
  const user = await getAuthTokens(cookieStore);

  const linksArray: LinkInterface[] = [
    { displayName: 'Home', href: '/' },
    { displayName: 'Map', href: '/map' },
    { displayName: 'Request Aid', href: '/request-aid' },
    { displayName: 'Learn More', href: '/learnmore' },
  ];

  return (
    <nav className="py-4 bg-[#B0022A] shadow-[inset_0_-1px_0_0_rgba(169,169,169,.5)] w-full">
      <div className="max-w-8xl mx-auto flex justify-between items-center border-4 border-[#B0022A] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <img
            src="/SGP_LOGO.svg"
            alt="Logo"
            className="h-12 w-12 object-contain md:h-16 md:w-16"
          />
          <Link href="/" className="font-bold text-lg text-white md:text-lg">
            SAGIP PILIPINAS: HELP THOSE IN NEED!
          </Link>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex gap-4">
          {linksArray.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-white px-1.5 py-0.5 inline-block text-lg font-extralight transition-all ease-in-out duration-300 hover:text-white hover:decoration-white hover:underline hover:decoration-2 hover:underline-offset-8 hover:scale-110"
              >
                {link.displayName}
              </Link>
            </li>
          ))}
          {user ? (
            <>
              <li>
                <Link
                  href="/profileedit"
                  className="text-white px-1.5 py-0.5 inline-block text-lg font-extralight transition-all ease-in-out duration-300 hover:text-white hover:decoration-white hover:underline hover:decoration-2 hover:underline-offset-8 hover:scale-110"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <LogoutButton /> {/* Render the client-side LogoutButton */}
              </li>
            </>
          ) : (
            <li>
              <Link
                href="/register"
                className="text-white px-1.5 py-0.5 inline-block text-lg font-extralight transition-all ease-in-out duration-300 hover:text-white hover:decoration-white hover:underline hover:decoration-2 hover:underline-offset-8 hover:scale-110"
              >
                Register Now
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile Menu Toggle (Client Component) */}
        <MobileMenuToggle
          links={
            user
              ? [
                  ...linksArray,
                  { displayName: 'My Profile', href: '/profileedit' },
                  { displayName: 'Log out', href: '#' }, // Placeholder - needs client-side handling
                ]
              : [
                  ...linksArray,
                  { displayName: 'Register Now', href: '/register' },
                ]
          }
        />
      </div>
    </nav>
  );
};

export default Navbar;
