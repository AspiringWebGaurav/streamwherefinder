# 🗺️ StreamWhere: Core User Journeys

<div align="center">
  <i>Mapping the psychological and technical paths our users take.</i>
</div>

<br />

StreamWhere is built to facilitate several distinct "User Journeys" (UJs) depending on the intent of the visitor. Below are the primary funnels architected within the platform.

<hr />

## 🟡 UJ-1: The "Direct Intent" Search (The Primary Flow)
*The user already knows exactly what movie they want to watch and just needs the regional link.*

1.  **Entry Point:** Lands directly on the `Home` page via organic search or bookmark.
2.  **Action:** Clicks the main Atmospheric Glow Search Bar. (Keyboard does *not* auto-open on mobile to prevent aggression).
3.  **Input:** Types the first 3 letters of the movie. 
4.  **System Action:** Real-time `/api/search` edge request triggers. Multi-layer engine processes fuzzy matching.
5.  **Selection:** Result snaps down efficiently. User clicks the poster.
6.  **Resolution:** Lands on `/movies/[slug]`. Checks the 'Watch Providers' component, clicks the "Netflix" icon, and is instantly routed out to watch. **Time to success: < 10 seconds.**

<br />

## 🔵 UJ-2: The "Discovery" Scroll
*The user is bored, doesn't have a specific title in mind, and wants inspiration.*

1.  **Entry Point:** Lands on the `Home` page.
2.  **Action:** Ignores the search bar and begins scrolling vertically.
3.  **System Interaction:** The Intelligent Glow engine notes a "scroll past hero" action and records an interaction weight, subtly altering the background lighting to accommodate deep reading.
4.  **Interaction:** Swipes horizontally through the `MovieCarousel` for "Trending" or "Popular Worldwide".
5.  **Selection:** Notices a compelling poster and clicks.
6.  **Resolution:** Lands on `/movies/[slug]`, reads the synopsis, notes it's available on a service they already subscribe to, and watches.

<br />

## 🟢 UJ-3: The "Persistent Viewer" (Logged-In Flow)
*The user wants to retain their search habits across multiple devices.*

1.  **Entry Point:** Any page element.
2.  **Action:** Clicks the Login/Signup icon in the `Navbar`.
3.  **Authentication:** Redirects securely through Firebase Google Auth popup.
4.  **Syncing:** Upon successful return, their local `localStorage` search history is silently parsed and pushed to Firestore if needed.
5.  **Ongoing use:** All subsequent searches are dual-written to Firebase, allowing them to recall previous interests from their iPad later that evening via the User Profile view.
6.  **Endgame:** User retains brand loyalty to StreamWhere because it actively "remembers" them safely.

<br />

## 🔴 UJ-4: The Error / Feedback Flow
*The user hits a snag and needs resolution.*

1.  **Entry Point:** Lands on `/movies/[slug]` natively.
2.  **Action:** Notices that the TMDB data says the film is on "Hulu", but they know Hulu recently dropped it.
3.  **Resolution Path:** User clicks the "Flag Error" or "Report" sub-link near the specific provider component.
4.  **System Action:** `trackOutboundClick` fires an internal analytics event labeled `${provider}_REPORT` so engineers can audit the API mismatch without blocking the user interface.
5.  **Alternative:** User types an absolute gibberish string in the search. The Enterprise Search Engine yields zero results, gracefully defaulting to a robust "No matches found, want to explore Trending?" UI, preventing a blank/white screen crash.
