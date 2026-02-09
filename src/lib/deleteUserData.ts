'use server';

import { getDatabase, ref, remove, get } from 'firebase/database';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

// Firebase config for server-side
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase for server-side
function getServerApp(): FirebaseApp {
    if (getApps().length === 0) {
        return initializeApp(firebaseConfig);
    }
    return getApps()[0];
}

export interface DeleteUserDataResult {
    success: boolean;
    deletedItems: {
        searchHistory: number;
        realtimeData: number;
    };
    error?: string;
}

/**
 * Deletes ALL user data from Firebase
 * - Firestore: searchHistory collection entries
 * - Realtime Database: any user-specific data
 */
export async function deleteAllUserData(userId: string): Promise<DeleteUserDataResult> {
    if (!userId) {
        return {
            success: false,
            deletedItems: { searchHistory: 0, realtimeData: 0 },
            error: 'User ID is required'
        };
    }

    const result: DeleteUserDataResult = {
        success: true,
        deletedItems: { searchHistory: 0, realtimeData: 0 }
    };

    try {
        const app = getServerApp();

        // 1. Delete all searchHistory from Firestore
        const db = getFirestore(app);
        const searchHistoryQuery = query(
            collection(db, 'searchHistory'),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(searchHistoryQuery);
        const deletePromises = querySnapshot.docs.map(docSnapshot =>
            deleteDoc(doc(db, 'searchHistory', docSnapshot.id))
        );

        await Promise.all(deletePromises);
        result.deletedItems.searchHistory = querySnapshot.docs.length;

        // 2. Delete any user data from Realtime Database
        const rtdb = getDatabase(app);

        // Check and delete user-specific paths in Realtime Database
        const userPaths = [
            `users/${userId}`,
            `userPreferences/${userId}`,
            `userSessions/${userId}`,
        ];

        for (const path of userPaths) {
            try {
                const dataRef = ref(rtdb, path);
                const snapshot = await get(dataRef);
                if (snapshot.exists()) {
                    await remove(dataRef);
                    result.deletedItems.realtimeData++;
                }
            } catch {
                // Path might not exist, continue
            }
        }

        console.log(`Successfully deleted all data for user ${userId}:`, result.deletedItems);

        return result;
    } catch (error) {
        console.error('Error deleting user data:', error);
        return {
            success: false,
            deletedItems: result.deletedItems,
            error: error instanceof Error ? error.message : 'Failed to delete user data'
        };
    }
}
