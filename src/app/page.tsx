export const dynamic = 'force-dynamic';

import MapSection from "@/components/home/MapSection/MapSection";
import NewsGrid from "@/components/home/News/News";
import Primary from "@/components/home/primary/primary";

export default function Home() {
    return (
        <div>

            <Primary/>
            <MapSection/>
            <NewsGrid/>
        </div>
    );
}
