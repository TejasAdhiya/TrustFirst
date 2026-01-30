import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
if (!firebaseConfig.apiKey) {
    console.error("Firebase API Key is missing! Please populate your .env file with the credentials from your Firebase Console.");
}

import { getMessaging, isSupported } from "firebase/messaging";

// ... existing code ...

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let messaging: any = null;

if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            messaging = getMessaging(app);
        }
    });
}

export { auth, googleProvider, messaging };