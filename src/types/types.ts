export interface DefaultPin {
    coordinates: { latitude: number; longitude: number };
}

export interface MainPin extends DefaultPin {
    id: string;
}

export interface RequestPin extends DefaultPin {
    disasterType?: string;
}