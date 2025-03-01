"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import type { DefaultPin } from "@/types/types";
import { philippinesBounds, center, addMarkerPin, zoomMarkerPin } from "./MapUtils";

export interface MapRef {
    getMapInstance: () => google.maps.Map | null;
    addMarker?: (pin: DefaultPin) => void;
    zoomMarker?: (pin: DefaultPin) => void;
}

export interface MarkerRef {
    getMarkerInstance: () => google.maps.Marker | null;
}

interface GoogleMapComponentProps {
    pins?: DefaultPin[];
    onClick?: (event: google.maps.MapMouseEvent) => void;
    mapStyle?: React.CSSProperties;
}

const GoogleMapComponent = forwardRef<MapRef, GoogleMapComponentProps>(
    ({ pins = [], onClick, mapStyle }, googleMapRef) => {
        
        const containerStyle: React.CSSProperties = {
            width: mapStyle?.width ?? "100vw",
            height: mapStyle?.height ?? "100vh",
            ...mapStyle,
        };

        const mapRef = useRef<google.maps.Map | null>(null);
        const markerRef = useRef<google.maps.Marker | null>(null);

        const onLoad = (map: google.maps.Map) => {
            mapRef.current = map;
            map.setCenter(center);
        };

        const onUnmount = () => {
            mapRef.current = null;
        };

        useImperativeHandle(
            googleMapRef,
            () => ({
                getMapInstance: () => mapRef.current,
                addMarker: (pin) => addMarkerPin(mapRef, markerRef, pin),
                zoomMarker: (pin) => zoomMarkerPin(mapRef, pin),
            }),
            []
        );


        if (typeof window === "undefined" || !window.google?.maps) {
            return <div>Loading...</div>;
        }
        return (
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={6}
                options={{
                    restriction: {
                        latLngBounds: philippinesBounds,
                        strictBounds: false,
                    },
                    minZoom: 8,
                    maxZoom: 16,
                }}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={onClick}
            >
                {pins.length > 0 &&
                    pins.map((pin) => (
                        <Marker
                            key={`${pin.coordinates.latitude}-${pin.coordinates.longitude}`}
                            position={{
                                lat: pin.coordinates.latitude,
                                lng: pin.coordinates.longitude,
                            }}
                            onClick={() => zoomMarkerPin(mapRef, pin)}
                        />
                    ))}
            </GoogleMap>
        );
    });

GoogleMapComponent.displayName = "GoogleMapComponent";

export default GoogleMapComponent;
