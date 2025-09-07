import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/random-movie`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Collection routes
  const collectionSlugs = [
    // Original Collections
    'trending',
    'popular',
    'upcoming',
    'best-of-2024',
    
    // Platform-Specific Collections
    'netflix-india',
    'prime-video-hindi',
    'hotstar-bollywood',
    
    // Duration-Based Collections
    'short-movies-under-90min',
    'long-movies-over-150min',
    
    // Genre + Duration Combinations
    'short-thriller-movies',
    'bollywood-comedy-classics',
    
    // Regional Collections
    'bollywood-2024',
    'south-indian-blockbusters',
    
    // Year-Based Collections
    'hollywood-2024',
    '90s-bollywood-classics',
    
    // High-Rating Collections
    'imdb-top-rated-indian',
    'hidden-gems-under-rated',
    
    // Genre-Specific Collections
    'sci-fi-masterpieces',
  ];

  const collectionRoutes = collectionSlugs.map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...collectionRoutes];
}