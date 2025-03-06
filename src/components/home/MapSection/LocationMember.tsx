import { OrganizationPin } from "@/types/PinTypes";
import { PiMapPinFill } from "react-icons/pi";

export const LocationMember: React.FC<{ pin: OrganizationPin, onClick: () => void }> = ({ pin, onClick }) => {
    return (
        <button className="grid grid-cols-5 items-center text-black w-full"
            onClick={onClick}>
            <div className="flex justify-center items-center">
                <PiMapPinFill className="w-10 h-10" />
            </div>

            <div className="col-span-4 grid grid-rows-2 text-[1.5em] text-left">
                <div className="font-bold">{pin.name}</div>
                <div className="text-sm text-gray-600">{pin.location}</div>
            </div>
        </button>
    );
};
