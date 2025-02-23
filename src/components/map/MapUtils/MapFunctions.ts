import type { DefaultPin } from "@/types/types";

export const addMarkerPin = (mapRef: React.RefObject<google.maps.Map | null>, markerRef: React.RefObject<google.maps.Marker | null>, pin: DefaultPin) => {
    if (mapRef.current) {
        const position = {
            lat: pin.coordinates.latitude,
            lng: pin.coordinates.longitude,
        };

        if (markerRef.current) {
            markerRef.current.setPosition(position);
        } else {
            markerRef.current = new google.maps.Marker({
                position,
                map: mapRef.current,
            });
        }
    }
};

export const zoomMarkerPin = (mapRef: React.RefObject<google.maps.Map | null>, pin: DefaultPin) => {
    if (mapRef.current) {
        const position = new google.maps.LatLng(pin.coordinates.latitude, pin.coordinates.longitude);
        mapRef.current.panTo(position);
        setTimeout(() => {
            mapRef.current?.setZoom(12);
        }, 200);
    }
};

