import { OrganizationPin } from '@/types/PinTypes';
import { PiMapPinFill } from 'react-icons/pi';

export const LocationMember: React.FC<{
  pin: OrganizationPin;
  onClick: () => void;
}> = ({ pin, onClick }) => {
  return (
    <button
      className={`grid grid-cols-5 text-black transform w-[93%] p-2 m-4 mx-auto
            rounded-xl hover:scale-105 hover:bg-red-500 hover:text-white focus:scale-105 focus:bg-red-600 focus:text-white duration-500`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <PiMapPinFill className="w-7 h-7 md:w-10 md:h-10" />
      </div>

      <div className="col-span-4 grid grid-rows-[1fr_auto] text-[1.5em] text-left -ml-6">
        <div className="font-bold">{pin.name}</div>
        <div className="text-sm">{pin.location}</div>
      </div>
    </button>
  );
};
