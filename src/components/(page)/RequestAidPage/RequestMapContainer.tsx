'use client';

import RequestAidMapWrapper from '@/components/map/RequestAidMapWrapper';
import RequestAidForm from './RequestAidForm';

import { useState } from 'react';
import { DefaultPin } from '@/types/types';

const RequestMapContainer = () => {
  const [pin, setPin] = useState<DefaultPin | null>(null);

  return (
    <div className="grid bg-[#fffdfd]">
      <div className="text-black w-full">
        <h1 className="text-lg font-bold sm:text-2xl mt-8 w-4/5 mx-auto sm:px-16 sm:w-full">
          REQUEST AID
        </h1>
        <div className="flex items-center justify-center w-full">
          <p className="text-base sm:text-xl w-4/5 mx-auto sm:w-full sm:mx-24">
            Request aid during or after a calamity by filling up this short form
            to alert our people to send help towards your location.
          </p>
        </div>
      </div>
      <div className="flex justify-center items-center pt-4">
        <div className="border-red-400 border-8 rounded-lg overflow-hidden">
          <RequestAidMapWrapper
            pin={pin}
            setPin={setPin}
            width="80vw"
            height="60vh"
          ></RequestAidMapWrapper>
        </div>
      </div>
      <div className="pt-10">
        <RequestAidForm pin={pin}></RequestAidForm>
      </div>
    </div>
  );
};

export default RequestMapContainer;
