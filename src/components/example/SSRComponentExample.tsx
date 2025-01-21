import { cookies } from "next/headers";
import { getAuthTokens } from "@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge";

export default async function Dashboard() {
    try {
        const cookieStore = await cookies();
        const token = await getAuthTokens(cookieStore);
        if (token) {
            const decodedToken = token.decodedToken;

            return (
                <div>
                    Welcome, {decodedToken.email}
                </div>
            );
        }
        return <p>You are not authorized.</p>;

    } catch (error) {
        console.error("Error in Dashboard:", error);
        return <p>An error occurred. Please try again later.</p>;
    }
}
