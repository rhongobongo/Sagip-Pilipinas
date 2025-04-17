'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LinkInterface {
  displayName: string;
  href: string;
}

interface MobileMenuToggleProps {
  links: LinkInterface[];
}

const BurgerIcon = ({ isOpen }: { isOpen: boolean }) => (
  <div className="w-6 h-6 flex flex-col justify-between cursor-pointer overflow-hidden">
    <span
      className={`block h-0.5 w-full bg-white rounded-full transition-all duration-300 transform origin-top-left ${
        isOpen ? 'rotate-45 translate-y-1' : ''
      }`}
    ></span>
    <span
      className={`block h-0.5 w-full bg-white rounded-full transition-opacity duration-300 ${
        isOpen ? 'opacity-0' : 'opacity-100'
      }`}
    ></span>
    <span
      className={`block h-0.5 w-full bg-white rounded-full transition-all duration-300 transform origin-bottom-left ${
        isOpen ? '-rotate-45 -translate-y-1' : ''
      }`}
    ></span>
  </div>
);

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ links }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const fadeIn = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  };

  return (
    <div className="lg:hidden">
      <button
        onClick={toggleMenu}
        className="text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 duration-500"
      >
        <BurgerIcon isOpen={isOpen} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bg-[#B0022A] py-2 my-8 absolute left-0 right-0 z-20 duration-300"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ul className="flex flex-col items-center space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white block py-2 px-4 text-lg font-extralight transition-all ease-in-out duration-300 hover:text-white hover:decoration-white hover:underline hover:decoration-2 hover:underline-offset-8 hover:scale-110"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileMenuToggle;
