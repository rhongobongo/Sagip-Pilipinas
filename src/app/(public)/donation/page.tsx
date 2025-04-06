import DonationPageForm from '@/components/(page)/donationPage/donationPageForm';
import DonationPageMap from '@/components/(page)/donationPage/donationPageMap';

const DonationPage: React.FC = () => {
  return (
    <div>
      <div>
        <DonationPageMap></DonationPageMap>
      </div>
      <div>
        {' '}
        <DonationPageForm></DonationPageForm>
      </div>
    </div>
  );
};

export default DonationPage;
