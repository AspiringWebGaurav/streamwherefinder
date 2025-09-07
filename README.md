# StreamWhereFinder MVP

**Find where to stream movies legally with typo-tolerant search**

StreamWhereFinder is a modern movie discovery platform built with Next.js that helps users find where to watch movies legally online. The platform features typo-tolerant search, one-screen movie details, official streaming links, and a fun "Spin Tonight" randomizer.

🌐 **Live Demo:** [streamwherefinder.vercel.app](https://streamwherefinder.vercel.app)

## ✨ Key Features

### 🔍 Smart Search
- **Typo-tolerant search** - "Avvtarr" finds "Avatar"
- **Hybrid search system** - Client-side instant results + comprehensive server-side search
- **Auto-suggestions** with movie posters and ratings
- **Fuzzy matching** using Fuse.js for better user experience

### 🎬 Movie Discovery
- **Large hero search bar** with helpful placeholder text
- **Movie carousels**: Trending (IN), Popular, Upcoming, Best of Last Year
- **Platform-specific sections** for Netflix, Amazon Prime, Disney+ Hotstar
- **One-screen movie details** with poster, synopsis, trailer, and streaming info
- **"Spin Tonight" randomizer** with micro-animations

### 🔗 Legal-First Approach
- **Official streaming links only** - No piracy, ever
- **TMDb attribution** with proper licensing
- **Watch providers integration** with placeholder URLs for MVP
- **Copyright compliance** and takedown-ready infrastructure

### ⚡ Performance & SEO
- **Server-side rendering** for all pages
- **Schema.org structured data** for movies and collections  
- **OpenGraph & Twitter Cards** for social sharing
- **Automatic sitemap** generation
- **Green Core Web Vitals** optimized
- **Image optimization** with proper dimensions to prevent CLS

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Search:** Fuse.js for fuzzy matching
- **Data:** The Movie Database (TMDb) API
- **Deployment:** Vercel
- **Icons:** Lucide React

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- TMDb API account ([get your API key](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/streamwherefinder.git
   cd streamwherefinder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your TMDb credentials:
   ```env
   TMDB_API_KEY=your_tmdb_api_key_here
   TMDB_READ_TOKEN=your_tmdb_read_access_token_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with SEO metadata
│   ├── page.tsx           # Homepage with search & carousels
│   ├── movies/[slug]/     # Dynamic movie detail pages
│   ├── search/            # Search results page
│   ├── random-movie/      # Random movie picker
│   ├── collections/[slug] # Movie collections (trending, etc.)
│   ├── about/             # Static pages
│   ├── privacy/
│   ├── terms/
│   ├── contact/
│   ├── sitemap.ts         # Auto-generated sitemap
│   └── robots.ts          # SEO robots.txt
├── components/
│   ├── ui/                # Reusable UI components
│   │   └── Button.tsx
│   ├── search/
│   │   └── SearchBar.tsx  # Typo-tolerant search component
│   └── movie/
│       ├── MovieCard.tsx  # Movie poster cards
│       ├── MovieCarousel.tsx # Horizontal scrolling carousels
│       └── WatchProviders.tsx # "Where to watch" component
├── lib/
│   ├── tmdb.ts           # TMDb API client
│   ├── search.ts         # Hybrid search implementation
│   └── utils.ts          # Utility functions
├── types/
│   └── tmdb.ts           # TypeScript interfaces
└── data/
    └── popular-movies.ts # Dataset for client-side search
```

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit

# Lint code
npm run lint
```

### Key Development Guidelines

1. **Component Architecture**
   - Use TypeScript for all components
   - Follow the compound component pattern for complex UI
   - Implement proper accessibility (ARIA labels, keyboard navigation)

2. **Search Implementation**
   - Client-side search uses pre-loaded popular movies for instant results
   - Server-side search queries TMDb API for comprehensive results
   - Hybrid approach provides best user experience

3. **SEO Best Practices**
   - All pages use server-side rendering
   - Dynamic metadata generation for movie pages
   - Structured data for better search engine understanding

4. **Performance Optimization**
   - Images use Next.js Image component with proper sizing
   - Lazy loading for below-the-fold content
   - Optimized bundle splitting

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Set Environment Variables**
   
   In your Vercel dashboard, add:
   - `TMDB_API_KEY`
   - `TMDB_READ_TOKEN`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)

3. **Deploy**
   
   Push to your main branch - Vercel will auto-deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- **Netlify:** Use the `@netlify/plugin-nextjs` plugin
- **Railway:** Direct deployment from GitHub
- **DigitalOcean App Platform:** Node.js environment

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TMDB_API_KEY` | Yes | Your TMDb API key |
| `TMDB_READ_TOKEN` | Yes | TMDb read access token (preferred) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Full URL of your site (for SEO) |

## 📊 Features Roadmap

### Phase 2 - Enhanced Features
- [ ] User accounts with Firebase Auth
- [ ] Personal watchlists and history
- [ ] Advanced filtering (genre, year, rating)
- [ ] Movie recommendations based on preferences
- [ ] Social features (share lists, reviews)

### Phase 3 - Monetization  
- [ ] Affiliate links with streaming platforms
- [ ] Premium features (advanced search, notifications)
- [ ] Advertisement integration (non-intrusive)
- [ ] Partnership with streaming services

### Phase 4 - Advanced Features
- [ ] Mobile app (React Native)
- [ ] Real-time streaming availability updates
- [ ] Price comparison across platforms
- [ ] Watchlist notifications when movies become available

## 🧪 Testing

### Manual Testing Checklist

**Search Functionality:**
- [ ] Search with typos works ("Avvtarr" → "Avatar")
- [ ] Auto-suggestions appear and work
- [ ] Empty search shows appropriate message
- [ ] Search results pagination works

**Movie Details:**
- [ ] All movie information displays correctly
- [ ] Trailers embed and play properly
- [ ] "Where to watch" links work
- [ ] Similar movies carousel scrolls

**Navigation:**
- [ ] All routes load without errors
- [ ] Back buttons work correctly
- [ ] Collection pages display movies
- [ ] Random movie picker functions

**Performance:**
- [ ] Pages load in under 2 seconds
- [ ] Images load without layout shift
- [ ] Mobile experience is responsive
- [ ] Lighthouse scores are green

### Automated Testing (Future)

```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# Performance testing
npm run lighthouse
```

## 🎯 SEO & Analytics

### Built-in SEO Features

- **Meta tags:** Dynamic title, description, and OpenGraph tags
- **Structured data:** Schema.org markup for movies and collections
- **Sitemap:** Auto-generated and updated
- **Robots.txt:** Proper crawling guidelines
- **Canonical URLs:** Prevent duplicate content issues

### Analytics Setup (Optional)

Add analytics by updating `src/app/layout.tsx`:

```typescript
// Google Analytics
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="GA_MEASUREMENT_ID" />
      </body>
    </html>
  )
}
```

## 🛡 Legal & Compliance

### Copyright Compliance
- Only links to official streaming platforms
- TMDb API usage complies with their terms
- DMCA takedown process implemented
- Clear copyright notices on all pages

### Privacy
- No user tracking or data collection
- Anonymous usage by design
- Privacy policy clearly explains data handling
- GDPR compliant (minimal data processing)

### Terms of Service
- Clear acceptable use policy
- Legal disclaimers for streaming availability
- Contact information for legal issues

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Bug Reports
1. Check existing issues first
2. Create detailed bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and device information
   - Screenshots if applicable

### Feature Requests
1. Search existing feature requests
2. Create detailed proposal with:
   - User story and use case
   - Technical implementation ideas
   - Mockups or wireframes (if applicable)

### Development
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper TypeScript types
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Include proper accessibility attributes
- Add JSDoc comments for complex functions
- Use semantic commit messages

## 📞 Support

### Getting Help
- **Documentation:** Check this README first
- **Issues:** [GitHub Issues](https://github.com/your-username/streamwherefinder/issues)
- **Email:** support@streamwherefinder.com
- **Response Time:** 24-48 hours

### Common Issues

**"Movies not loading"**
- Check your TMDb API credentials in `.env.local`
- Verify API key has proper permissions
- Check browser console for error messages

**"Search not working"**
- Ensure client-side JavaScript is enabled
- Check if popular movies dataset is loading
- Verify network connectivity

**"Deployment issues"**
- Confirm environment variables are set correctly
- Check build logs for TypeScript errors
- Verify Node.js version compatibility

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[The Movie Database (TMDb)](https://www.themoviedb.org/)** - Movie data and poster images
- **[Vercel](https://vercel.com/)** - Hosting and deployment platform
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework
- **[Lucide](https://lucide.dev/)** - Beautiful icon library
- **[Fuse.js](https://fusejs.io/)** - Fuzzy search implementation

---

**Built with ❤️ for movie lovers everywhere**

*StreamWhereFinder - Because finding great movies should be effortless*
