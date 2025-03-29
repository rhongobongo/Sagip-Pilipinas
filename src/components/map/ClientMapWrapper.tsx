'use client';

import React, { useRef, useEffect } from 'react';
import { MapRef } from '@/components/map/GoogleMapComponent'; // Ensure path is correct
// Ensure DefaultPin type includes optional title and type properties
import type { DefaultPin } from '@/types/types'; // Ensure path is correct
import dynamic from 'next/dynamic';

const GoogleMapComponent = dynamic(() => import("./GoogleMapComponent"), { ssr: false });

interface ClientMapWrapperProps {
    pin: {
        id: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
        title?: string; 
        type?: string; 
    };
    options?: google.maps.MapOptions; 
    autoZoom?: boolean; 
}

export default function ClientMapWrapper({ pin, options, autoZoom = true }: ClientMapWrapperProps) {
    const mapRef = useRef<MapRef>(null);

    const formattedPin: DefaultPin = {
        id: pin.id,
        coordinates: {
            latitude: pin.coordinates.latitude,
            longitude: pin.coordinates.longitude
        },
        title: pin.title, // Pass title through
        type: pin.type    // Pass type through
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (autoZoom && mapRef?.current?.zoomMarker) {
                mapRef.current.zoomMarker(formattedPin);
            }
        }, 500); 

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