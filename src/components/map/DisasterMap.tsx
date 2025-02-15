"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { db } from "@/lib/Firebase/Firebase";
import { onSnapshot, collection, GeoPoint } from "firebase/firestore";
import { MapRef } from "./MapComponent";
import { Pin } from "@/types/types";

const DynamicMap = dynamic(() => import("./MapComponent"), { ssr: false });

interface DisasterMapProps {
    pinData: Pin[];
}

const DisasterMap: React.FC<DisasterMapProps> = ({ pinData }) => {

    const [pins, setPins] = useState<Pin[]>(pinData);
    const mapRef = useRef<MapRef>(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "map"), (snapshot) => {
            const updatedPins: Pin[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                coordinates: (doc.get("location") as GeoPoint),
            }));
            setPins(updatedPins);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div>
            <DynamicMap ref={mapRef} pins={pins} />
        </div>
    );
};

export default DisasterMap;
