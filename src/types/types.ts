export interface Pin {
    id: string;
    coordinates: { latitude: number; longitude: number };
}

export interface RequestPin {
    coordinates: { latitude: number; longitude: number};
    disasterType?: string;
}