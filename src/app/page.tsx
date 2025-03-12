export const dynamic = 'force-dynamic';

import MapSection from "@/components/home/MapSection/MapSection";
import NewsSection from "@/components/home/News/NewsSection";
import Primary from "@/components/home/primary/primary";

export default function Home() {
    return (
        <div>
            <Primary/>
            <MapSection/>
            <NewsSection/>
        </div>
    );
}
