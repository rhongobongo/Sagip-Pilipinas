'use client';

import React, { useRef, useEffect } from 'react';
import { MapRef } from '@/components/map/GoogleMapComponent';
import type { DefaultPin } from '@/types/types';
import dynamic from 'next/dynamic';

const GoogleMapComponent = dynamic(() => import("./GoogleMapComponent"), { ssr: false });
interface ClientMapWrapperProps {
    pin: {
        id: string;
        coordinates: {
            latitude: number;
            longitude: number;
        }
    };
    options?: google.maps.MapOptions;
    autoZoom?: boolean; // New prop to control auto-zooming behavior
}

export default function ClientMapWrapper({ pin, options, autoZoom = true }: ClientMapWrapperProps) {
    const mapRef = useRef<MapRef>(null);

    const formattedPin: DefaultPin = {
        id: pin.id,
        coordinates: {
            latitude: pin.coordinates.latitude,
            longitude: pin.coordinates.longitude
        }
    };

    // Auto-zoom to the pin when the component mounts
    useEffect(() => {
        // Wait for the map to be fully loaded
        const timer = setTimeout(() => {
            if (autoZoom && mapRef?.current?.zoomMarker) {
                mapRef.current.zoomMarker(formattedPin);
            }
        }, 500); // Short delay to ensure map is ready

        return () => clearTimeout(timer);
    }, [formattedPin, autoZoom]);

    const handlePinClick = (clickedPin: DefaultPin) => {
        if (mapRef?.current?.zoomMarker) {
            mapRef.current.zoomMarker(clickedPin);
        }
    };

    return (
        <div className="h-full w-full overflow-hidden rounded-md">
            <GoogleMapComponent
                ref={mapRef}
                pins={[formattedPin]}
                options={options}
                width="100%"
                height="100%"
                setPin={handlePinClick}
            />
        </div>
    );
}