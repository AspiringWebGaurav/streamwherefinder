import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
};

// Check if Firebase is properly configured
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain &&
  firebaseConfig.appId
);


// Initialize Firebase only if properly configured and not already initialized
let app;
if (isFirebaseConfigured && getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    // Silent error handling - Firebase will gracefully degrade
    app = null;
  }
} else if (isFirebaseConfigured) {
  app = getApps()[0];
} else {
  app = null;
}

// Initialize Firebase services with error handling
let auth: Auth | null = null;
let db: Firestore | null = null;

if (app) {
  try {
    auth = getAuth(app);
  } catch (error) {
    auth = null;
  }

  try {
    db = getFirestore(app);
  } catch (error) {
    db = null;
  }
}

export { auth, db };

// Export configuration status
export const isFirebaseEnabled = isFirebaseConfigured && app !== null && auth !== null && db !== null;


// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Analytics (client-side only)
export const getFirebaseAnalytics = () => {
  if (typeof window !== 'undefined' && app && process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
    return getAnalytics(app);
  }
  return null;
};

export default app;