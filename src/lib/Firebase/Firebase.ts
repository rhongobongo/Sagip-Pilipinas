import { FirebaseApp, initializeApp, getApps } from "firebase/app"; // Import getApps
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    Auth // Import Auth type if needed elsewhere
} from 'firebase/auth';
import { getFirestore, collection, addDoc, Firestore } from 'firebase/firestore'; // Import Firestore type
import { getStorage, FirebaseStorage } from "firebase/storage"; // Import FirebaseStorage type

// Your Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Declare variables for Firebase services
let app: FirebaseApp;
let auth: Auth;
let db: Firestore | null = null; // Initialize as null, check before use
let storage: FirebaseStorage;

// --- Singleton Initialization Pattern ---
// Check if Firebase App is already initialized to prevent errors
if (!getApps().length) {
    // Check if essential config values are present before initializing
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        try {
            app = initializeApp(firebaseConfig);
        } catch (error) {
            console.error("Firebase initialization error:", error);
            // Optionally throw the error or handle it based on your app's needs
            // For now, we'll let subsequent initializations fail gracefully
            // @ts-expect-error - Allowing null assignment on app which is otherwise strictly typed as FirebaseApp
            app = null;
        }
    } else {
        console.error("Firebase config (apiKey or projectId) is missing. App cannot be initialized.");
        // @ts-expect-error - Allowing null assignment for error state handling when config is incomplete
        app = null;
    }
} else {
    app = getApps()[0];
}

if (app) {
    auth = getAuth(app);
    storage = getStorage(app);
    if (firebaseConfig.projectId) {
        try {
            db = getFirestore(app);
        } catch(error) {
            console.error("Firestore initialization error:", error);
            db = null;
        }
    } else {
         console.warn("Firebase projectId is missing in config. Firestore cannot be initialized.");
         db = null;
    }

} else {
    console.error("Firebase App failed to initialize. Other services (Auth, Firestore, Storage) cannot be initialized.");
    // Assign default/null values or handle the error state appropriately
    // @ts-expect-error - Auth expects to be initialized with a valid app, but allowing null for fallback error state
    auth = null;
    // @ts-expect-error - Storage expects to be initialized with a valid app, but allowing null for fallback error state
    storage = null;
    db = null;
}

export { app, db, auth, storage };

export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, collection, addDoc };
export const googleProvider = new GoogleAuthProvider();