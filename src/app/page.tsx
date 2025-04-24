export const dynamic = 'force-dynamic';

import MapSection from '@/components/home/MapSection/MapSection';
import NewsSection from '@/components/home/News/NewsSection';
import Primary from '@/components/home/primary/primary';

import { cookies } from 'next/headers';
import { getAuthTokens } from '@/lib/Next-Firebase-Auth-Edge/NextFirebaseAuthEdge';
import { setAdminRole } from '@/actions/example/setAdminRole';

export default async function Home() {


  return (
    <div>
      <Primary />
      <MapSection />
      <NewsSection />
    </div>
  );
}
