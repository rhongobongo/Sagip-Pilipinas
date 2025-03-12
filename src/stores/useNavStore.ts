import { create } from "zustand";

interface NavbarStore {
    isNavbarHidden: boolean;
    hideNavbar: () => void;
    showNavbar: () => void;
}

export const useNavbarStore = create<NavbarStore>((set) => ({
    isNavbarHidden: false,
    hideNavbar: () => set({ isNavbarHidden: true }),
    showNavbar: () => set({ isNavbarHidden: false }),
}));