"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import type { DefaultPin } from "@/types/types";

const containerStyle = {
    width: "100vw",
    height: "100vh",
};

const center = {
    lat: 14.5995,
    lng: 120.9842,
};

const philippinesBounds = {
    north: 21.3,
    south: 4.5,
    west: 115.8,
    east: 127.6,
};

export interface MapRef {
    getMapInstance: () => google.maps.Map | null;
    addMarker: (pin: DefaultPin) => void;
}

interface MapComponentProps {
    pins?: DefaultPin[];
    onClick?: (event: google.maps.MapMouseEvent) => void;
}

const MapComponent = forwardRef<MapRef, MapComponentProps>(({ pins = [], onClick }, ref) => {
    const mapRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);

    const onLoad = (map: google.maps.Map) => {
        mapRef.current = map;
    };

    const onUnmount = () => {
        mapRef.current = null;

    };

    const addMarkerPin = (pin: DefaultPin) => {
        if (mapRef.current) {
            const position = {
                lat: pin.coordinates.latitude,
                lng: pin.coordinates.longitude,
            };

            if (markerRef.current) {
                markerRef.current.setPosition(position)
            } else {
                markerRef.current = new google.maps.Marker({
                    position,
                    map: mapRef.current,
                });
            }
        }
    }

    useImperativeHandle(ref, () => ({
        getMapInstance: () => mapRef.current,
        addMarker: (pin: DefaultPin) => addMarkerPin(pin),
    }));

    return (
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={6}
                options={{
                    restriction: {
                        latLngBounds: philippinesBounds,
                        strictBounds: false,
                    },
                }}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={onClick}
            >
                {
                    pins.length > 0 &&
                    pins.map((pin) => (
                        <Marker
                            key={`${pin.coordinates.latitude}-${pin.coordinates.longitude}`}
                            position={{
                                lat: pin.coordinates.latitude,
                                lng: pin.coordinates.longitude,
                            }}
                        />
                    ))
                }

            </GoogleMap>
        </LoadScript>
    );
});

MapComponent.displayName = "MapComponent";

export default MapComponent;
