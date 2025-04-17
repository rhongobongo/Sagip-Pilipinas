import Link from 'next/link';
import { cookies } from 'next/headers';
import { getAuthTokens } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge';

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
    { displayName: 'My Profile', href: '/' },
    { displayName: 'Log out', href: '/' },
    ...(!user ? [{ displayName: 'Register Now', href: '/register' }] : []),
  ];

  return (
    <nav className="py-4 bg-[#B0022A] shadow-[inset_0_-1px_0_0_rgba(169,169,169,.5)] w-full">
      <div className="max-w-8xl mx-auto flex justify-between items-center border-4 border-[#B0022A]">
        <div className="flex items-center space-x-3 justify-end">
          <img
            src="/SGP_LOGO.svg"
            alt="Logo"
            className="h-16 w-16 object-contain ml-10"
          />
          <Link href="/" className="font-bold text-lg text-white">
            SAGIP PILIPINAS: HELP THOSE IN NEED!
          </Link>
        </div>

        <ul className="flex space-x-6 mr-10">
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
