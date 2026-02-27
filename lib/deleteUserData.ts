'use server';

import { getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

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
    };
    error?: string;
}

export async function deleteAllUserData(userId: string): Promise<DeleteUserDataResult> {
    if (!userId) {
        return {
            success: false,
            deletedItems: { searchHistory: 0 },
            error: 'User ID is required'
        };
    }

    const result: DeleteUserDataResult = {
        success: true,
        deletedItems: { searchHistory: 0 }
    };

    try {
        const app = getServerApp();
        const db = getFirestore(app);

        // Delete all searchHistory from Firestore
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
