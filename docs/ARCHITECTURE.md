# 🏛️ StreamWhere: System Architecture

<div align="center">
  <i>A high-performance, edge-ready architecture for global movie discovery.</i>
</div>

<br />

## 📦 Tech Stack Overview

StreamWhere is built prioritizing **speed**, **SEO**, and **premium UX**.

*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript (Strict Mode)
*   **Styling**: Tailwind CSS + Framer Motion (micro-interactions)
*   **Database/Auth**: Firebase (Firestore & Authentication)
*   **External Data**: TMDB API (The Movie Database)
*   **Search Engine**: Custom Multi-Layer Ranking Engine + Fuse.js
*   **Analytics**: Google Analytics (gtag)
*   **Deployment**: Vercel (Edge Functions & ISR)

<hr />

## 🧩 Core Architectural Pillars

### 1. Hybrid Rendering Strategy (SSR + ISR + CSR)
To balance lightning-fast initial page loads with fresh data:
- **Home/Trending/Collections**: Utilizes **ISR (Incremental Static Regeneration)** to cache heavy TMDB API calls, revalidating periodically in the background to ensure data is fresh without hitting the API on every request.
- **Search API (`/api/search`)**: Runs dynamically via Edge Functions/Serverless to respond instantly to live user keystrokes.
- **Client Search State (`SearchPageClient`)**: Managed entirely on the client for zero-latency keystroke feedback and layout updates.

### 2. Enterprise Search Engine (`services/searchWrapper.ts`)
We bypass standard brute-force searching for a nuanced, 5-layer ranking engine:
1.  **Exact Match Boost**: Highest priority for literal matches.
2.  **Fuzzy/Containment**: Levenshtein distance grouping for typos (e.g., "Incepion" -> "Inception").
3.  **Franchise Detection**: Automatically groups and boosts sequels if the base word is queried (e.g., "Dhoom").
4.  **Regional Weighting**: Small lifts for locally popular cinema.
5.  **Popularity & Vote Composite**: Logarithmic scaling to ensure obscure movies with the same name don't outrank blockbusters.

### 3. "Atmospheric Glow" Engine (`hooks/useIntelligentGlow.ts`)
A highly optimized, React-driven local memory engine that avoids expensive database writes.
- Uses `localStorage` to track `visitCount` and `searchCount`.
- Triggers non-linear, CSS-variable-driven shadow adjustments based on user behavior (e.g., sharpening the search bar if they scroll aimlessly).
- Strictly uses `box-shadow` and `opacity` transitions to ensure zero layout shift and 60fps performance without taxing the React reconciliation cycle.

### 4. Resilient External Data Layer (`lib/tmdb.ts`)
- Implements robust error boundaries and graceful fallbacks.
- If TMDB rate-limits or fails, the UI gracefully downgrades without crashing, offering cached or fallback UI states.
- Provider endpoints are dynamically filtered to the user's default locale (e.g., `IN` for India, automatically reading from IP/Headers where available).

### 5. Secure Firebase Integration (`lib/firebase.ts`)
- Client-side data (like `Search History`) is written to Firestore only when an authenticated session exists.
- Fully isolated Firebase Admin SDK strictly limited to secure server contexts.
- Strict security rules applied at the Firestore level to ensure users can only read/write their own UID documents.

<br />

## 📁 Directory Structure

```text
/streamwhere
├── app/                  # Next.js 14 App Router pages & API routes
│   ├── api/              # Serverless API endpoints
│   ├── movies/           # Dynamic movie detail pages
│   └── globals.css       # Core design tokens and base styles
├── components/           # Reusable, atomic React components
├── hooks/                # Custom React hooks (IntelligentGlow, etc)
├── lib/                  # Core utilities (TMDB wrapper, types, firebase config)
├── services/             # Complex business logic (Search Engine)
├── docs/                 # Project documentation
└── tests/                # Playwright E2E and load testing scripts
```
