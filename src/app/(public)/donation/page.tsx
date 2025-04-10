import DonationPageForm from '@/components/(page)/donationPage/donationPageForm';
import DonationPageMap from '@/components/(page)/donationPage/donationPageMap';

const DonationPage: React.FC = () => {
  return (
    <div className="bg-white w-full h-screen text-black">
      <div className="text-3xl font-semibold ml-[10%] pt-8">
        <h1>MAKE DONATIONS</h1>
      </div>
      <div className="flex justify-center items-center">
        <div>
          <h2 className="text-xl pt-6">
            Help disaster victims by making donations through filling up the
            form below. Anywhere you are, lending a helping hand is always
            possible.
          </h2>
        </div>
        <div>
          <DonationPageMap></DonationPageMap>
        </div>
        <div>
          {' '}
          <DonationPageForm></DonationPageForm>
        </div>
      </div>
    </div>
  );
};

export default DonationPage;
