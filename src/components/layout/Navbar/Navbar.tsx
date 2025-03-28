import Link from 'next/link';

interface LinkInterface {
  displayName: string;
  href: string;
}

const linksArray: LinkInterface[] = [
  { displayName: 'Home', href: '/' },
  { displayName: 'Map', href: '/map' },
  { displayName: 'Request Aid', href: '/request-aid' },
  { displayName: 'Learn More', href: '/learnmore' },
  { displayName: 'Register Now', href: '/register' },
];

const Navbar: React.FC = () => {
  return (
    <nav className="p-4 bg-[#B0022A] shadow-[inset_0_-1px_0_0_rgba(169,169,169,.5)]">
      <div className="max-w-8xl mx-auto flex justify-between items-center border-4 border-[#B0022A]">
        <div className="flex items-center space-x-3 justify-end">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 object-contain ml-10"
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
