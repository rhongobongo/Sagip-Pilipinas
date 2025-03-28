import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/Firebase-Admin';
import { getAuthTokens } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge';
import VolunteerProfileManagement from './Volunteer/VolunteerProfileManagement';

const EditProfilePageWrapper = async () => {
  const cookieStore = await cookies();
  const token = await getAuthTokens(cookieStore);

  if (!token) {
    redirect('/login');
  }

  const decodedToken = token.decodedToken;
  const userRecord = await auth.getUser(decodedToken.uid);
  const rolesObject = userRecord.customClaims || {};

  // Uncomment later const isVolunteer = rolesObject["volunteer"] === true;
  const isOrganization = rolesObject['organization'] === true;

  const isVolunteer = true;

  /*
    UNCOMMENT LATER

    if (!isVolunteer && !isOrganization) {
        redirect("/login");
    }
    */

  if (isVolunteer) {
    return <VolunteerProfileManagement />;
  }

  if (isOrganization) {
    return (
      <div>
        <h1>Welcome, Organization!</h1>
        <p>You have access to organization-specific content.</p>
      </div>
    );
  }

  redirect('/login');
};

export default EditProfilePageWrapper;
