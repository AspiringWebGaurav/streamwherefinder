import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
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
const LOCAL_STORAGE_KEY = 'streamwherefinder_search_history';

// Save search to Firestore for logged-in users
export async function saveSearchToFirestore(user: User, query: string): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== SEARCH HISTORY DEBUG: saveSearchToFirestore ===');
    console.log('Input parameters:', {
      hasUser: !!user,
      userId: user?.uid,
      userEmail: user?.email,
      query: query?.trim(),
      queryLength: query?.length,
      hasDb: !!db,
      isFirebaseEnabled,
      nodeEnv: process.env.NODE_ENV
    });
  }

  if (!db || !isFirebaseEnabled) {
    const errorMessage = 'Firestore not configured properly';
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ SEARCH HISTORY ERROR: Firestore not available', {
        hasDb: !!db,
        isFirebaseEnabled,
        firebaseConfig: {
          apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        }
      });
    }
    throw new Error(errorMessage);
  }

  if (!user || !user.uid) {
    const errorMessage = 'Invalid user object provided';
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ SEARCH HISTORY ERROR: Invalid user object', { user });
    }
    throw new Error(errorMessage);
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Firebase and user validation passed');
  }
  
  try {
    if (!query.trim()) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ SEARCH HISTORY WARNING: Empty search query, not saving');
      }
      return;
    }

    const docData = {
      userId: user.uid,
      query: query.trim(),
      timestamp: Timestamp.now(),
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Attempting to save document:', docData);
      console.log('Collection name:', SEARCH_HISTORY_COLLECTION);
    }

    const docRef = await addDoc(collection(db, SEARCH_HISTORY_COLLECTION), docData);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ SEARCH HISTORY SUCCESS: Document saved with ID:', docRef.id);
    }

    // Clean up old searches to maintain limit
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Starting cleanup of old searches...');
    }
    await cleanupOldSearches(user.uid);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Cleanup completed successfully');
    }
    
  } catch (error: any) {
    // Always log errors but with different detail levels
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ SEARCH HISTORY FIRESTORE ERROR:', {
        error: error,
        errorName: error?.name,
        errorCode: error?.code,
        errorMessage: error?.message,
        userId: user.uid,
        userEmail: user.email,
        query: query.trim(),
        timestamp: new Date().toISOString(),
        collection: SEARCH_HISTORY_COLLECTION,
        firestoreDb: !!db
      });
    } else {
      // Production: Log minimal error info
      console.error('Search history save failed:', {
        errorCode: error?.code,
        errorMessage: error?.message,
        userId: user.uid,
      });
    }
    
    // Log Firebase-specific error details
    if (error?.code && process.env.NODE_ENV === 'development') {
      console.error('🔥 Firebase Error Details:', {
        code: error.code,
        message: error.message,
      });
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'permission-denied':
          console.error('🚫 FIRESTORE PERMISSION DENIED: Check Firestore security rules for searchHistory collection');
          break;
        case 'unauthenticated':
          console.error('🔐 FIRESTORE UNAUTHENTICATED: User authentication may have expired');
          break;
        case 'unavailable':
          console.error('🌐 FIRESTORE UNAVAILABLE: Network connectivity or Firebase service issue');
          break;
        case 'quota-exceeded':
          console.error('💰 FIRESTORE QUOTA EXCEEDED: Daily quota limit reached');
          break;
      }
    }
    
    throw error; // Re-throw to allow calling code to handle
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
      limit(MAX_HISTORY_ITEMS + 10) // Get a few extra to delete
    );

    const querySnapshot = await getDocs(q);
    const searches = querySnapshot.docs;

    // Delete searches beyond the limit
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

// Get search history from Firestore for logged-in users
export async function getSearchHistoryFromFirestore(user: User): Promise<SearchHistoryItem[]> {
  if (!db || !isFirebaseEnabled) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Firestore not available, returning empty history');
    }
    return [];
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Fetching search history from Firestore for user:', user.uid);
  }
  
  try {
    const q = query(
      collection(db, SEARCH_HISTORY_COLLECTION),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(MAX_HISTORY_ITEMS)
    );

    const querySnapshot = await getDocs(q);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Firestore query result:', {
        userId: user.uid,
        documentsFound: querySnapshot.docs.length,
        isEmpty: querySnapshot.empty
      });
    }
    
    const history = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        query: data.query,
        timestamp: data.timestamp.toDate(),
        userId: data.userId,
      };
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Processed search history:', history);
    }

    return history;
  } catch (error) {
    console.error('Error fetching search history from Firestore:', {
      error,
      userId: user.uid,
      errorCode: (error as any)?.code,
      errorMessage: (error as any)?.message
    });
    return [];
  }
}

// Delete a specific search from Firestore
export async function deleteSearchFromFirestore(searchId: string): Promise<void> {
  if (!db || !isFirebaseEnabled) return;
  
  try {
    await deleteDoc(doc(db, SEARCH_HISTORY_COLLECTION, searchId));
  } catch (error) {
    console.error('Error deleting search from Firestore:', error);
  }
}

// Save search to localStorage for anonymous users
export function saveSearchToLocalStorage(query: string): void {
  if (!query.trim()) return;

  try {
    const existingHistory = getSearchHistoryFromLocalStorage();
    
    // Remove duplicate if exists
    const filteredHistory = existingHistory.filter(item => item.query !== query.trim());
    
    // Add new search at the beginning
    const newHistory: SearchHistoryItem[] = [
      { query: query.trim(), timestamp: new Date() },
      ...filteredHistory
    ].slice(0, MAX_HISTORY_ITEMS); // Limit to MAX_HISTORY_ITEMS

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Error saving search to localStorage:', error);
  }
}

// Get search history from localStorage for anonymous users
export function getSearchHistoryFromLocalStorage(): SearchHistoryItem[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const history = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!history) return [];

    const parsedHistory = JSON.parse(history) as SearchHistoryItem[];
    
    // Convert timestamp strings back to Date objects
    return parsedHistory.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch (error) {
    console.error('Error fetching search history from localStorage:', error);
    return [];
  }
}

// Clear search history from localStorage
export function clearLocalSearchHistory(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing search history from localStorage:', error);
  }
}

// Clear all search history for a user from Firestore
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

// Combined function to save search based on auth state
export async function saveSearch(user: User | null, query: string): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== SEARCH HISTORY DEBUG: saveSearch ENTRY ===');
    console.log('saveSearch called with:', {
      hasUser: !!user,
      userId: user?.uid,
      userEmail: user?.email,
      query: query?.trim(),
      queryLength: query?.length,
      timestamp: new Date().toISOString()
    });
  }

  if (!query.trim()) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ SEARCH HISTORY WARNING: Empty query provided to saveSearch');
    }
    return;
  }

  const trimmedQuery = query.trim();
  if (process.env.NODE_ENV === 'development') {
    console.log('📋 Processing search query:', trimmedQuery);
  }

  try {
    if (user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('👤 User is authenticated, saving to Firestore...');
      }
      await saveSearchToFirestore(user, trimmedQuery);
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ SEARCH HISTORY SUCCESS: Firestore save completed');
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('👻 Anonymous user, saving to localStorage...');
      }
      saveSearchToLocalStorage(trimmedQuery);
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ SEARCH HISTORY SUCCESS: localStorage save completed');
      }
    }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ SEARCH HISTORY CRITICAL ERROR in saveSearch:', {
        error: error,
        errorMessage: error?.message,
        errorCode: error?.code,
        hasUser: !!user,
        userId: user?.uid,
        userEmail: user?.email,
        query: trimmedQuery,
        timestamp: new Date().toISOString()
      });
    } else {
      // Production: minimal logging
      console.error('Search history save failed:', {
        errorCode: error?.code,
        hasUser: !!user,
        userId: user?.uid
      });
    }
    
    // For authenticated users, try fallback to localStorage
    if (user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 FALLBACK: Attempting to save to localStorage as backup...');
      }
      try {
        saveSearchToLocalStorage(trimmedQuery);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ FALLBACK SUCCESS: Search saved to localStorage instead');
        }
      } catch (fallbackError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ FALLBACK FAILED: Could not save to localStorage either:', fallbackError);
        }
        // Don't throw - we don't want to completely break the search functionality
      }
    }
    
    // Don't throw the error - let the search continue even if history saving fails
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Search history saving failed, but allowing search to continue');
    }
  }
}

// Combined function to get search history based on auth state
export async function getSearchHistory(user: User | null): Promise<SearchHistoryItem[]> {
  if (user) {
    return await getSearchHistoryFromFirestore(user);
  } else {
    return getSearchHistoryFromLocalStorage();
  }
}