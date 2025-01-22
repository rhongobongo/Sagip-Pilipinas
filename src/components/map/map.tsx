"use client"

import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100vw',
  height: '100vh',
};

const center = {
  lat: 14.5995, 
  lng: 120.9842,
};

const philippinesBounds = {
  north: 21.300, 
  south: 4.500,  
  west: 115.800, 
  east: 127.600, 
};

const MapComponent: React.FC = () => {
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
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
