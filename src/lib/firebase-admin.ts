import 'server-only';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Helper to format the private key correctly
const formatPrivateKey = (key: string) => {
    return key.replace(/\\n/g, '\n');
};

function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Missing Firebase Admin credentials in environment variables');
    }

    return initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey: formatPrivateKey(privateKey),
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
}

export function getAdminDb() {
    const app = getFirebaseAdminApp();
    return getDatabase(app);
}
