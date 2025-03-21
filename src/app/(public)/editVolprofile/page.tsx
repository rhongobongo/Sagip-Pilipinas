import { db } from "@/lib/Firebase-Admin";
import { cookies } from "next/headers";
import { getAuthTokens } from "@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge";
import VolunteerProfileManagement from "./component";

/*const fetchUser = async (): Promise<ProfileData | null> => {
  try {
    const cookieStore = await cookies();
    const token = await getAuthTokens(cookieStore);

    if (token) {
      const decodedToken = token.decodedToken;

      const volunteerSnapshot = await db.collection("volunteers")
        .where("uid", "==", decodedToken.uid)
        .get();

      if (!volunteerSnapshot.empty) {
        const volunteerData = volunteerSnapshot.docs[0].data();
        console.log("Volunteer Details:", volunteerData);

        // Constructing the ProfileData object to return
        const profileData: ProfileData = {
          name: volunteerData.name,
          email: volunteerData.email,
          contactNumber: volunteerData.contactNumber,
          username: volunteerData.username,
          profileImageUrl: volunteerData.profileImageUrl,
          organizationId: volunteerData.organizationId,
          createdAt: volunteerData.createdAt,
          updatedAt: volunteerData.updatedAt,
          userId: volunteerData.uid,
          organization: volunteerData.organization,
        };

        return profileData;
      } else {
        console.log("No volunteer found with this UID.");
        return null;
      }
    } else {
      console.log("No token found.");
      return null;
    }

  } catch (error) {
    console.error("Error in Dashboard:", error);
    return null;
  }
}*/

const VolunteerProfile: React.FC = async () => {

  return (
    <VolunteerProfileManagement></VolunteerProfileManagement>
  );
}


export default VolunteerProfile;  