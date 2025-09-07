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

// Only log in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('🔥 FIREBASE CONFIG DEBUG:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasAuthDomain: !!firebaseConfig.authDomain,
    isConfigured: isFirebaseConfigured,
    existingApps: getApps().length,
    nodeEnv: process.env.NODE_ENV
  });
}

// Initialize Firebase only if properly configured and not already initialized
let app;
if (isFirebaseConfigured && getApps().length === 0) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Initializing Firebase app...');
    }
    app = initializeApp(firebaseConfig);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Firebase app initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', {
      error: process.env.NODE_ENV === 'development' ? error : 'Check environment variables',
      errorMessage: (error as any)?.message,
      errorCode: (error as any)?.code,
    });
    app = null;
  }
} else if (isFirebaseConfigured) {
  app = getApps()[0];
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Using existing Firebase app');
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Firebase not configured properly - check environment variables');
  }
  app = null;
}

// Initialize Firebase services with error handling
let auth: Auth | null = null;
let db: Firestore | null = null;

if (app) {
  try {
    auth = getAuth(app);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Firebase Auth initialized');
    }
  } catch (error) {
    console.error('❌ Firebase Auth initialization failed:', error);
    auth = null;
  }

  try {
    db = getFirestore(app);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Firestore initialized');
    }
  } catch (error) {
    console.error('❌ Firestore initialization failed:', error);
    db = null;
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Firebase app not available - Auth and Firestore will be disabled');
  }
}

export { auth, db };

// Export configuration status
export const isFirebaseEnabled = isFirebaseConfigured && app !== null && auth !== null && db !== null;

// Only log in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('🔥 FIREBASE SERVICES STATUS:', {
    isFirebaseEnabled,
    hasApp: !!app,
    hasAuth: !!auth,
    hasDb: !!db,
    isConfigured: isFirebaseConfigured
  });
}

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