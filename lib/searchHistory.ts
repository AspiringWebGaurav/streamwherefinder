import { collection, addDoc, query, where, orderBy, limit, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, isFirebaseEnabled } from './firebase';

export interface SearchHistoryItem {
    id?: string;
    query: string;
    timestamp: Date;
    userId?: string;
}

const SEARCH_HISTORY_COLLECTION = 'searchHistory';
const MAX_HISTORY_ITEMS = 50;
const LOCAL_STORAGE_KEY = 'streamwhere_search_history';

// Save search to Firestore for logged-in users
export async function saveSearchToFirestore(user: User, query: string): Promise<void> {
    if (!db || !isFirebaseEnabled) throw new Error('Firestore not configured properly');
    if (!user || !user.uid) throw new Error('Invalid user object provided');

    try {
        if (!query.trim()) return;

        const docData = {
            userId: user.uid,
            query: query.trim(),
            timestamp: Timestamp.now(),
        };

        await addDoc(collection(db, SEARCH_HISTORY_COLLECTION), docData);
        await cleanupOldSearches(user.uid);
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.error('Search history save failed:', { errorCode: (error as any)?.code, userId: user.uid });
        throw error;
    }
}

// Clean up old searches to maintain limit
async function cleanupOldSearches(userId: string): Promise<void> {
    if (!db || !isFirebaseEnabled) return;

    try {
        const q = query(
            collection(db, SEARCH_HISTORY_COLLECTION),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(MAX_HISTORY_ITEMS + 10)
        );

        const querySnapshot = await getDocs(q);
        const searches = querySnapshot.docs;

        if (searches.length > MAX_HISTORY_ITEMS) {
            const searchesToDelete = searches.slice(MAX_HISTORY_ITEMS);
            for (const searchDoc of searchesToDelete) {
                await deleteDoc(doc(db, SEARCH_HISTORY_COLLECTION, searchDoc.id));
            }
        }
    } catch (error) {
        console.error('Error cleaning up old searches:', error);
    }
}

// Get search history from Firestore
export async function getSearchHistoryFromFirestore(user: User): Promise<SearchHistoryItem[]> {
    if (!db || !isFirebaseEnabled) return [];

    try {
        const q = query(
            collection(db, SEARCH_HISTORY_COLLECTION),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(MAX_HISTORY_ITEMS)
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                query: data.query,
                timestamp: data.timestamp.toDate(),
                userId: data.userId,
            };
        });
    } catch (error) {
        console.error('Error fetching search history from Firestore:', error);
        return [];
    }
}

export async function deleteSearchFromFirestore(searchId: string): Promise<void> {
    if (!db || !isFirebaseEnabled) return;
    try {
        await deleteDoc(doc(db, SEARCH_HISTORY_COLLECTION, searchId));
    } catch (error) {
        console.error('Error deleting search from Firestore:', error);
    }
}

export function saveSearchToLocalStorage(query: string): void {
    if (!query.trim()) return;
    try {
        if (typeof window === 'undefined') return;
        const existingHistory = getSearchHistoryFromLocalStorage();
        const filteredHistory = existingHistory.filter(item => item.query !== query.trim());
        const newHistory: SearchHistoryItem[] = [
            { query: query.trim(), timestamp: new Date() },
            ...filteredHistory
        ].slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
        console.error('Error saving search to localStorage:', error);
    }
}

export function getSearchHistoryFromLocalStorage(): SearchHistoryItem[] {
    try {
        if (typeof window === 'undefined') return [];
        const history = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!history) return [];
        const parsedHistory = JSON.parse(history) as SearchHistoryItem[];
        return parsedHistory.map(item => ({
            ...item,
            timestamp: new Date(item.timestamp)
        }));
    } catch (error) {
        console.error('Error fetching search history from localStorage:', error);
        return [];
    }
}

export function clearLocalSearchHistory(): void {
    try {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    } catch (error) {
        console.error('Error clearing search history from localStorage:', error);
    }
}

export async function clearUserSearchHistory(userId: string): Promise<void> {
    if (!db || !isFirebaseEnabled) return;
    try {
        const q = query(
            collection(db, SEARCH_HISTORY_COLLECTION),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        for (const docSnapshot of querySnapshot.docs) {
            await deleteDoc(doc(db, SEARCH_HISTORY_COLLECTION, docSnapshot.id));
        }
    } catch (error) {
        console.error('Error clearing user search history:', error);
    }
}

export async function saveSearch(user: User | null, query: string): Promise<void> {
    if (!query.trim()) return;
    const trimmedQuery = query.trim();
    try {
        if (user) {
            await saveSearchToFirestore(user, trimmedQuery);
        } else {
            saveSearchToLocalStorage(trimmedQuery);
        }
    } catch (error) {
        console.error('Search history save failed:', error);
        if (user) {
            try {
                saveSearchToLocalStorage(trimmedQuery);
            } catch { }
        }
    }
}

export async function getSearchHistory(user: User | null): Promise<SearchHistoryItem[]> {
    if (user) {
        return await getSearchHistoryFromFirestore(user);
    } else {
        return getSearchHistoryFromLocalStorage();
    }
}
