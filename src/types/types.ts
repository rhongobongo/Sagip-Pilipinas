import type { Timestamp } from "firebase/firestore";

export interface DefaultPin {
    coordinates: { latitude: number; longitude: number };
}

export interface MainPin extends DefaultPin {
    id: string;
    disasterType?: string;
    date?: Timestamp;
}

export interface RequestPin extends DefaultPin {
    fullName?: string;
    contactNumber?: string;
    disasterType?: string;
    aidType?: string;
}