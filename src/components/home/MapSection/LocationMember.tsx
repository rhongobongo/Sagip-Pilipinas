import { OrganizationPin } from "@/types/PinTypes";
import { PiMapPinFill } from "react-icons/pi";

export const LocationMember: React.FC<{ pin: OrganizationPin, onClick: () => void }> = ({ pin, onClick }) => {
    return (
        <button 
            className={`mt-3 grid grid-cols-5 items-center text-black transform translate-x-5 w-[550px] p-2
            rounded-xl hover:scale-105 focus:scale-105 focus:bg-[#B0022A] focus:text-white`}
            onClick={onClick}>
            <div className="flex items-center">
                <PiMapPinFill className="w-10 h-10 translate-x-5"/>
            </div>

            <div className="col-span-4 grid grid-rows-[1fr_auto] text-[1.5em] text-left -ml-6">
                <div className="font-bold">{pin.name}</div>
                <div className="text-sm">{pin.location}</div>
            </div>
        </button>
    );
};
