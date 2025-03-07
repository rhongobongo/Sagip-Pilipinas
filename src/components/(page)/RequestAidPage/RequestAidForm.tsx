"use client";

import { useState } from "react";
import { RequestPin } from "@/types/types";
import { requestAid } from "@/components/map/SubmitAid";

interface RequestFormProps {
  pin: RequestPin | null;
}

const RequestAidForm: React.FC<RequestFormProps> = ({ pin }) => {
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [calamityLevel, setCalamityLevel] = useState("");
  const [calamityType, setCalamityType] = useState("");
  const [shortDesc, setShortDesc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    if (pin) {
      e.preventDefault();

      Object.assign(pin, {
        date,
        location,
        calamityLevel,
        calamityType,
        shortDesc,
      });

      requestAid(pin);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-white font-sans ">
      <div className="flex justify-center items-center w-full gap-20">
        <div className="ml-5 grid gap-2 w-1/3">
          <div className="flex items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Date:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-2xl bg-red-800"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-right mr-2 whitespace-nowrap text-black">
              Location:
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border rounded-2xl bg-red-800"
            />
          </div>
        </div>
        <div className="grid gap-2 w-1/3">
          <div className="flex items-center">
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Calamity Type:
            </label>
            <select
              value={calamityType}
              onChange={(e) => setCalamityType(e.target.value)}
              className="w-full px-4 py-2 border rounded-2xl bg-red-800"
            >
              <option value="">Select Type</option>
              <option value="flood">Flood</option>
              <option value="earthquake">Earthquake</option>
              <option value="fire">Fire</option>
              <option value="typhoon">Typhoon</option>
              <option value="landslide">Landslide</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="w-24 text-right mr-3 whitespace-nowrap text-black">
              Calamity Level:
            </label>
            <select
              value={calamityLevel}
              onChange={(e) => setCalamityLevel(e.target.value)}
              className="w-full px-4 py-2 border rounded-2xl bg-red-800"
            >
              <option value="">Select Level</option>
              <option value="1">Level 1 - Minor</option>
              <option value="2">Level 2 - Moderate</option>
              <option value="3">Level 3 - Major</option>
              <option value="4">Level 4 - Severe</option>
              <option value="5">Level 5 - Catastrophic</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center mt-3 w-full pl-2">
        <label className="w-24 text-right whitespace-nowrap text-black -translate-x-10">
          Short Description:
        </label>
        <textarea
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          className="px-4 py-2 border rounded-2xl w-4/6 bg-red-800 h-36 resize-none"
        />
      </div>
      <div className="mt-10 flex justify-end pb-8">
        <button
          type="submit"
          className="bg-red-700 text-white px-8 py-2 rounded-md hover:bg-red-800 mr-36"
        >
          Send Request
        </button>
      </div>
    </form>
  );
};

export default RequestAidForm;
