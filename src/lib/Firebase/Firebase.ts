import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider} from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app : FirebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app)
const storage = getStorage(app);

export {app, db, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, collection, addDoc, storage};
export const googleProvider = new GoogleAuthProvider();