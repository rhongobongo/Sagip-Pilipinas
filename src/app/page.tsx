export const dynamic = 'force-dynamic';

import MapSection from '@/components/home/MapSection/MapSection';
import NewsSection from '@/components/home/News/NewsSection';
import Primary from '@/components/home/primary/primary';

import { cookies } from 'next/headers';
import { getAuthTokens } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge';
import { setAdminRole } from '@/actions/example/setAdminRole';

export default async function Home() {
  const cookieStore = await cookies();
  const token = await getAuthTokens(cookieStore);

  if (token) {
    const decodedToken = token.decodedToken;
    setAdminRole(decodedToken.uid);
  }

  return (
    <div>
      <Primary />
      <MapSection />
      <NewsSection />
    </div>
  );
}
