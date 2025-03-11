'use client';

import RequestAidMapWrapper from '@/components/map/RequestAidMapWrapper';
import RequestAidForm from './RequestAidForm';

import { useState } from 'react';
import { DefaultPin } from '@/types/types';

const RequestMapContainer = () => {
  const [pin, setPin] = useState<DefaultPin | null>(null);

  return (
    <div className="grid bg-white">
      <div className="text-black">
        <h1 className=" font-semibolds">REQUEST AID</h1>
        <p>
          Request aid during or after a calamity by filling up this short form
          to alert our people to send help towards your location.
        </p>
      </div>
      <div className="flex justify-center items-center pt-10">
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
