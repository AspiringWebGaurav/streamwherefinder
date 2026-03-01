import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, isFirebaseEnabled } from './firebase';

// ═══════════════════════════════════════════════════════════════════════════════
// StreamWhere — Local-First Search History
// localStorage is ALWAYS source of truth. Firestore is a lazy backup layer.
// ═══════════════════════════════════════════════════════════════════════════════

export interface SearchHistoryItem {
    id?: string;
    query: string;
    timestamp: Date;
    userId?: string;
}

interface FirestoreHistoryDoc {
    history: { query: string; timestamp: number }[];
    updatedAt: number;
}

const MAX_HISTORY_ITEMS = 50;
const LOCAL_STORAGE_KEY = 'streamwhere_search_history';
const SYNC_DEBOUNCE_MS = 5000;
const FIRESTORE_COLLECTION = 'userHistory';

// ── Internal state ───────────────────────────────────────────────────────────

let _syncTimer: ReturnType<typeof setTimeout> | null = null;
let _syncInProgress = false;
let _hasSyncedThisSession = false;
let _hasPendingChanges = false;

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API — These signatures are preserved for all consumers
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Save a search query. Always writes to localStorage first.
 * If user is logged in, schedules a debounced Firestore sync.
 */
export async function saveSearch(user: User | null, query: string): Promise<void> {
    if (!query.trim()) return;
    saveSearchToLocalStorage(query.trim());

    if (user) {
        _hasPendingChanges = true;
        _scheduleDebouncedSync(user);
    }
}

/**
 * Get search history. ALWAYS reads from localStorage — never Firestore.
 * The `user` param is kept for API compatibility but does not trigger reads.
 */
export async function getSearchHistory(_user?: User | null): Promise<SearchHistoryItem[]> {
    return getSearchHistoryFromLocalStorage();
}

/**
 * Delete a single search item by query + timestamp.
 * Removes from localStorage and schedules sync if logged in.
 */
export async function deleteSearchItem(user: User | null, query: string, timestamp: Date): Promise<void> {
    try {
        if (typeof window === 'undefined') return;
        const history = getSearchHistoryFromLocalStorage();
        const filtered = history.filter(
            item => !(item.query === query && item.timestamp.getTime() === timestamp.getTime())
        );
        _writeLocalHistory(filtered);

        if (user) {
            _hasPendingChanges = true;
            _scheduleDebouncedSync(user);
        }
    } catch (error) {
        console.error('Error deleting search item:', error);
    }
}

/**
 * Clear all search history.
 * Clears localStorage and immediately syncs an empty array if logged in.
 */
export async function clearAllHistory(user: User | null): Promise<void> {
    clearLocalSearchHistory();

    if (user && db && isFirebaseEnabled) {
        try {
            await setDoc(doc(db, FIRESTORE_COLLECTION, user.uid), {
                history: [],
                updatedAt: Date.now(),
            });
        } catch (error) {
            console.error('Error clearing Firestore history:', error);
        }
    }
}

/**
 * One-time merge on login. Called once when user signs in.
 * Reads the single Firestore doc, merges with localStorage (dedup), pushes diff.
 */
export async function syncHistoryOnLogin(user: User): Promise<void> {
    if (!db || !isFirebaseEnabled || !user?.uid) return;

    // Guard: only sync once per browser session to avoid per-page-load reads.
    // onAuthStateChanged fires immediately with cached user on every page load.
    if (_hasSyncedThisSession) return;
    _hasSyncedThisSession = true;

    try {
        // 1. Read the single Firestore document
        const docRef = doc(db, FIRESTORE_COLLECTION, user.uid);
        const snapshot = await getDoc(docRef);

        const localHistory = getSearchHistoryFromLocalStorage();
        let remoteHistory: SearchHistoryItem[] = [];

        if (snapshot.exists()) {
            const data = snapshot.data() as FirestoreHistoryDoc;
            remoteHistory = (data.history || []).map(entry => ({
                query: entry.query,
                timestamp: new Date(entry.timestamp),
            }));
        }

        // 2. Merge: deduplicate by query string, keep the most recent timestamp
        const merged = _mergeHistories(localHistory, remoteHistory);

        // 3. Write merged result back to localStorage
        _writeLocalHistory(merged);

        // 4. Push to Firestore only if there's a diff
        const localSet = new Set(localHistory.map(i => i.query));
        const remoteSet = new Set(remoteHistory.map(i => i.query));
        const hasDiff =
            merged.length !== remoteHistory.length ||
            merged.some(i => !remoteSet.has(i.query)) ||
            remoteHistory.some(i => !localSet.has(i.query));

        if (hasDiff) {
            await _pushToFirestore(user.uid, merged);
        }
    } catch (error) {
        console.error('Error syncing history on login:', error);
        // Non-fatal: local history still works
    }
}

/**
 * Flush any pending debounced sync. Call before logout.
 */
export async function flushPendingSync(user: User | null): Promise<void> {
    const hadPendingTimer = _syncTimer !== null;
    if (_syncTimer) {
        clearTimeout(_syncTimer);
        _syncTimer = null;
    }

    // Only push if there were actually pending changes (timer was active or flag set)
    if (user && db && isFirebaseEnabled && !_syncInProgress && (hadPendingTimer || _hasPendingChanges)) {
        _hasPendingChanges = false;
        const history = getSearchHistoryFromLocalStorage();
        await _pushToFirestore(user.uid, history);
    }

    // Reset session sync flag so next login triggers a fresh merge
    _hasSyncedThisSession = false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE — Always source of truth
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL — Debounced sync + Firestore push
// ═══════════════════════════════════════════════════════════════════════════════

function _writeLocalHistory(history: SearchHistoryItem[]): void {
    try {
        if (typeof window === 'undefined') return;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
    } catch (error) {
        console.error('Error writing local history:', error);
    }
}

function _scheduleDebouncedSync(user: User): void {
    if (_syncTimer) {
        clearTimeout(_syncTimer);
    }

    _syncTimer = setTimeout(async () => {
        _syncTimer = null;
        if (!db || !isFirebaseEnabled || !user?.uid) return;

        const history = getSearchHistoryFromLocalStorage();
        await _pushToFirestore(user.uid, history);
    }, SYNC_DEBOUNCE_MS);
}

async function _pushToFirestore(uid: string, history: SearchHistoryItem[]): Promise<void> {
    if (!db || !isFirebaseEnabled || _syncInProgress) return;

    _syncInProgress = true;
    try {
        const firestoreData: FirestoreHistoryDoc = {
            history: history.slice(0, MAX_HISTORY_ITEMS).map(item => ({
                query: item.query,
                timestamp: item.timestamp.getTime(),
            })),
            updatedAt: Date.now(),
        };

        await setDoc(doc(db, FIRESTORE_COLLECTION, uid), firestoreData);
    } catch (error) {
        console.error('Error pushing history to Firestore:', error);
    } finally {
        _syncInProgress = false;
    }
}

function _mergeHistories(local: SearchHistoryItem[], remote: SearchHistoryItem[]): SearchHistoryItem[] {
    const map = new Map<string, SearchHistoryItem>();

    // Add remote first (lower priority)
    for (const item of remote) {
        const existing = map.get(item.query);
        if (!existing || item.timestamp > existing.timestamp) {
            map.set(item.query, item);
        }
    }

    // Add/override with local (higher priority)
    for (const item of local) {
        const existing = map.get(item.query);
        if (!existing || item.timestamp > existing.timestamp) {
            map.set(item.query, item);
        }
    }

    // Sort by timestamp descending, limit to MAX
    return Array.from(map.values())
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, MAX_HISTORY_ITEMS);
}
