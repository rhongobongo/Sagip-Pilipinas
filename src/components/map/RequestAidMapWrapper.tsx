"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import { MapRef } from "./GoogleMapComponent";
import { DefaultPin } from "@/types/types";

const DynamicMap = dynamic(() => import("./GoogleMapComponent"), {
  ssr: false,
});

interface RequestAidMapWrapperProps {
  width?: string;
  height?: string;
  pin: DefaultPin | null;
  setPin: (pin: DefaultPin) => void;
}

const RequestAidMapWrapper: React.FC<RequestAidMapWrapperProps> = ({
  width = "100vw",
  height = "100vh",
  pin,
  setPin,
}) => {
  const mapRef = useRef<MapRef>(null);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const latitude = event.latLng.lat();
    const longitude = event.latLng.lng();

    setPin({
      coordinates: {
        latitude: latitude,
        longitude: longitude,
      },
    });

    mapRef.current?.addMarker?.({ coordinates: { latitude, longitude } });
  };

  return (
    <div style={{ width, height }}>
      <DynamicMap
        ref={mapRef}
        onClick={handleMapClick}
        width={width}
        height={height}
      />
    </div>
  );
};

export default RequestAidMapWrapper;
