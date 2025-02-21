import { create } from "zustand";
import { db } from "@/lib/Firebase/Firebase";
import { onSnapshot, collection, GeoPoint } from "firebase/firestore";
import { MainPin } from "@/types/types";

export interface PinsState {
    pins: MainPin[]; // The state for pins
    initializePins: (initialPins: MainPin[]) => void; // Action to initialize pins from SSR
    fetchPins: () => () => void; // Action to fetch real-time pins and return unsubscribe function
}

export const usePinsStore = create<PinsState>((set) => ({
    pins: [],
    initializePins: (initialPins) => set({ pins: initialPins }), // Set initial pins from SSR
    fetchPins: () => {
        const unsubscribe = onSnapshot(collection(db, "map"), (snapshot) => {
            const updatedPins: MainPin[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                coordinates: doc.get("location") as GeoPoint,
            }));
            set({ pins: updatedPins });
        });
        return unsubscribe; // Return unsubscribe function for cleanup
    },
}));
