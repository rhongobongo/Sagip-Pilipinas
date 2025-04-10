"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import type { DefaultPin } from "@/types/types";
import { philippinesBounds, center, addMarkerPin, zoomMarkerPin } from "./MapUtils";

export interface MapRef<T extends DefaultPin = DefaultPin> {
    getMapInstance: () => google.maps.Map | null;
    addMarker?: (pin: T) => void;
    zoomMarker?: (pin: T) => void;
}


export interface MarkerRef {
    getMarkerInstance: () => google.maps.Marker | null;
}

interface GoogleMapComponentProps<T extends DefaultPin = DefaultPin> {
    pins?: T[];
    onClick?: (event: google.maps.MapMouseEvent) => void;
    mapStyle?: React.CSSProperties;
    options?: google.maps.MapOptions;
    width?: string;
    height?: string;
    setPin?: (pin: T) => void;
}

const GoogleMapComponent = forwardRef<MapRef, GoogleMapComponentProps>(
    ({ pins = [], onClick, mapStyle, options, width = "100vw", height = "100vh", setPin }, googleMapRef) => {


        const containerStyle: React.CSSProperties = {
            width, 
            height, 
            ...mapStyle, 
        };

        const getGoogleMapOptions = (overrides: Partial<google.maps.MapOptions> = {}): google.maps.MapOptions => {
            const defaultOptions: google.maps.MapOptions = {
                restriction: {
                    latLngBounds: philippinesBounds,
                    strictBounds: false,
                },
                minZoom: 8,
                maxZoom: 16,
            };

            return {
                ...defaultOptions,
                ...overrides,
            };
        };

        const mergedOptions = getGoogleMapOptions(options);

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
                options={mergedOptions}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={onClick}
            >
                {pins.length > 0 &&
                    pins.map((pin) => {
                        if (!pin.coordinates) return null; // Skip invalid pins

                        return (
                            <Marker
                                key={pin.id}
                                position={{
                                    lat: pin.coordinates.latitude,
                                    lng: pin.coordinates.longitude,
                                }}
                                onClick={() => {
                                    zoomMarkerPin(mapRef, pin);
                                    if (setPin) {
                                        setPin(pin);
                                    }
                                }}
                            />
                        );
                    })}
            </GoogleMap>
        );
    });

GoogleMapComponent.displayName = "GoogleMapComponent";

export default GoogleMapComponent;
