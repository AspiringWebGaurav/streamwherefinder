import { track } from '@vercel/analytics';
import { getFirebaseAnalytics } from './firebase';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Track outbound clicks to streaming platforms
export function trackOutboundClick(platform: string, movieTitle: string, linkType: 'streaming' | 'rent' | 'buy') {
  try {
    // Vercel Analytics
    track('outbound_click', {
      platform,
      movie: movieTitle,
      type: linkType,
    });

    // Google Analytics (if available)
    const analytics = getFirebaseAnalytics();
    if (analytics && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'outbound_click', {
        event_category: 'streaming',
        event_label: `${platform}_${linkType}`,
        custom_parameter_1: movieTitle,
      });
    }
  } catch (error) {
    console.error('Error tracking outbound click:', error);
  }
}

// Track search events
export function trackSearch(query: string, resultsCount: number) {
  try {
    track('search', {
      query,
      results: resultsCount,
    });

    const analytics = getFirebaseAnalytics();
    if (analytics && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
        custom_parameter_1: resultsCount,
      });
    }
  } catch (error) {
    console.error('Error tracking search:', error);
  }
}

// Track page views
export function trackPageView(page: string, title?: string) {
  try {
    track('page_view', {
      page,
      ...(title && { title }),
    });

    const analytics = getFirebaseAnalytics();
    if (analytics && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: title || page,
        page_location: window.location.href,
        page_path: page,
      });
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

// Track user authentication
export function trackAuth(action: 'login' | 'logout' | 'signup', method?: string) {
  try {
    track('auth', {
      action,
      ...(method && { method }),
    });

    const analytics = getFirebaseAnalytics();
    if (analytics && typeof window !== 'undefined' && window.gtag) {
      if (action === 'login') {
        window.gtag('event', 'login', {
          method: method || 'unknown',
        });
      } else if (action === 'signup') {
        window.gtag('event', 'sign_up', {
          method: method || 'unknown',
        });
      }
    }
  } catch (error) {
    console.error('Error tracking auth:', error);
  }
}

// Track movie detail views
export function trackMovieView(movieId: number, movieTitle: string) {
  try {
    track('movie_view', {
      id: movieId,
      title: movieTitle,
    });

    const analytics = getFirebaseAnalytics();
    if (analytics && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        item_id: movieId.toString(),
        item_name: movieTitle,
        item_category: 'movie',
      });
    }
  } catch (error) {
    console.error('Error tracking movie view:', error);
  }
}

// Track random movie spins
export function trackRandomSpin(movieId: number, movieTitle: string) {
  try {
    track('random_spin', {
      movie_id: movieId,
      movie_title: movieTitle,
    });

    const analytics = getFirebaseAnalytics();
    if (analytics && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'spin_tonight', {
        custom_parameter_1: movieTitle,
        custom_parameter_2: movieId,
      });
    }
  } catch (error) {
    console.error('Error tracking random spin:', error);
  }
}