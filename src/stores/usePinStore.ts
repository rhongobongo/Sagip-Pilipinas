import { create } from "zustand";
import { db } from "@/lib/Firebase/Firebase";
import { onSnapshot, collection, GeoPoint } from "firebase/firestore";
import { MainPin } from "@/types/types";

export interface PinsState {
    pins: MainPin[];
    initializePins: (initialPins: MainPin[]) => void;
    fetchPins: () => () => void;
}

export const usePinsStore = create<PinsState>((set) => ({
    pins: [],
    initializePins: (initialPins) => set({ pins: initialPins }),
    fetchPins: () => {
        const unsubscribe = onSnapshot(collection(db, "map"), (snapshot) => {
            const updatedPins: MainPin[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                coordinates: doc.get("location") as GeoPoint,
            }));
            set({ pins: updatedPins });
        });
        return unsubscribe;
    },
}));
