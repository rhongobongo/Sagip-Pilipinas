import { cookies } from "next/headers";
import { getAuthTokens } from "@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge";
import admin from "@/lib/Firebase-Admin/FirebaseAdmin";

export default async function Dashboard() {
    try {
        const cookieStore = await cookies();
        const token = await getAuthTokens(cookieStore);
        
        if (token) {
            const decodedToken = token.decodedToken;
            const userRecord = await admin.auth().getUser(decodedToken.uid);
            const rolesObject = userRecord.customClaims || {}; 
            const roles = Object.keys(rolesObject);
            console.log(userRecord.customClaims);
            return (
                <div>
                    <h1>Welcome, {decodedToken.email}</h1>
                    <p>Your Roles: {roles.length > 0 ? roles.join(", ") : "No roles assigned."}</p>
                </div>
            );
        }

        return <p>You are not authorized.</p>;

    } catch (error) {
        console.error("Error in Dashboard:", error);
        return <p>An error occurred. Please try again later.</p>;
    }
}
