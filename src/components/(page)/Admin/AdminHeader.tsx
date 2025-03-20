import Link from 'next/link';
import { Bell, User } from 'lucide-react';
import Image from 'next/image';

const AdminHeader: React.FC = () => {
  return (
    <div className="p-4 bg-[#B0022A] shadow-[inset_0_-1px_0_0_rgba(169,169,169,.5)] sticky">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 object-contain"
          />
          <Link href="/" className="font-bold text-lg text-white">
            SAGIP PILIPINAS: HELP THOSE IN NEED!
          </Link>
        </div>

        <div className="flex space-x-6">
          <div className="relative mr-4">
            <input
              type="text"
              placeholder="Search"
              className="px-3 py-1 pr-8 rounded-full text-sm text-black"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <Bell size={20} className="mr-4" />
          <User size={20} />
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
