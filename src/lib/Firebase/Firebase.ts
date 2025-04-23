// @/lib/Firebase/Firebase.ts
import { FirebaseApp, initializeApp, getApps } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    Auth
} from 'firebase/auth';
import { 
    getFirestore, 
    collection as firestoreCollection, 
    addDoc as firestoreAddDoc, 
    Firestore,
    CollectionReference,
    DocumentData
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only once
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Initialize Firebase
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
    } catch (error) {
        console.error("Firebase initialization error:", error);
        throw new Error("Firebase services could not be initialized");
    }
} else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
}

// Helper function to safely get collection
const collection = (path: string, ...pathSegments: string[]) => {
    return firestoreCollection(db, path, ...pathSegments);
};

// Helper function to safely add document with proper typing
const addDoc = async <T>(
    collectionRef: CollectionReference<DocumentData>,
    data: T
) => {
    return firestoreAddDoc(collectionRef, data as DocumentData);
};

// Export initialized services
export { app, auth, db, storage };

// Export Firebase auth functions
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup };

// Export Firestore functions
export { collection, addDoc };

// Export provider
export const googleProvider = new GoogleAuthProvider();