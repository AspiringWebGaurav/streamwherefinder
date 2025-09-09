import { NextRequest, NextResponse } from 'next/server';

// TMDB image configuration
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const ALLOWED_SIZES = ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'];
const MAX_CACHE_AGE = 60 * 60 * 24 * 30; // 30 days
const STALE_WHILE_REVALIDATE = 60 * 60 * 24 * 7; // 7 days

// Security: Validate TMDB poster path format
function isValidTMDBPath(path: string): boolean {
  // Must start with / and contain valid characters for TMDB paths
  return /^\/[a-zA-Z0-9_-]+\.jpg$/.test(path);
}

// Security: Validate image size parameter
function isValidSize(size: string): boolean {
  return ALLOWED_SIZES.includes(size);
}

// Generate fallback SVG for failed images
function generateFallbackSVG(title?: string, width = 300, height = 450): string {
  const aspectRatio = 2/3; // Movie poster aspect ratio
  const actualHeight = Math.round(width / aspectRatio);
  
  return `<svg width="${width}" height="${actualHeight}" viewBox="0 0 ${width} ${actualHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${actualHeight}" fill="#F3F4F6"/>
    <rect x="20" y="20" width="${width-40}" height="${actualHeight-40}" rx="8" fill="#E5E7EB" stroke="#D1D5DB" stroke-width="2"/>
    <circle cx="${width/2}" cy="${actualHeight/2 - 40}" r="30" fill="#9CA3AF"/>
    <path d="M${width/2 - 15},${actualHeight/2 - 50} L${width/2 + 15},${actualHeight/2 - 30} L${width/2 - 15},${actualHeight/2 - 10} Z" fill="#6B7280"/>
    ${title ? `<text x="${width/2}" y="${actualHeight/2 + 20}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="500" fill="#6B7280">${title.length > 20 ? title.substring(0, 18) + '...' : title}</text>` : ''}
    <text x="${width/2}" y="${actualHeight/2 + 40}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#9CA3AF">Image Unavailable</text>
  </svg>`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const size = searchParams.get('size') || 'w500';
    const title = searchParams.get('title') || undefined;

    // Validate required parameters
    if (!path) {
      return new NextResponse(
        generateFallbackSVG('Missing Path'),
        {
          status: 400,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        }
      );
    }

    // Security: Validate path format to prevent SSRF
    if (!isValidTMDBPath(path)) {
      console.warn(`[DEBUG] Invalid TMDB path attempted: ${path}`);
      console.warn(`[DEBUG] Path length: ${path.length}, starts with /: ${path.startsWith('/')}, ends with .jpg: ${path.endsWith('.jpg')}`);
      console.warn(`[DEBUG] Regex test result: ${/^\/[a-zA-Z0-9_-]+\.jpg$/.test(path)}`);
      return new NextResponse(
        generateFallbackSVG('Invalid Path'),
        {
          status: 400,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        }
      );
    }

    // Validate size parameter
    if (!isValidSize(size)) {
      console.warn(`Invalid size parameter: ${size}`);
      return new NextResponse(
        generateFallbackSVG('Invalid Size'),
        {
          status: 400,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        }
      );
    }

    // Construct TMDB image URL
    const imageUrl = `${TMDB_IMAGE_BASE}/${size}${path}`;
    
    console.log(`Fetching image: ${imageUrl}`);

    // Fetch image from TMDB with appropriate headers
    const response = await fetch(imageUrl, {
      headers: {
        'Accept': 'image/webp,image/avif,image/jpeg,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'StreamWhereFinder/1.0 (Movie Discovery App)',
        'Referer': 'https://www.themoviedb.org/',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    // Handle TMDB response errors
    if (!response.ok) {
      console.warn(`TMDB image fetch failed: ${response.status} ${response.statusText} for ${imageUrl}`);
      
      // Return SVG fallback for any failure
      return new NextResponse(
        generateFallbackSVG(title),
        {
          status: 200, // Return 200 to prevent client-side error handling
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': `public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400`,
          },
        }
      );
    }

    // Get content type from TMDB response
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Validate content type
    if (!contentType.startsWith('image/')) {
      console.warn(`Invalid content type received: ${contentType} for ${imageUrl}`);
      return new NextResponse(
        generateFallbackSVG(title),
        {
          status: 200,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': `public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400`,
          },
        }
      );
    }

    // Get image buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Validate image buffer
    if (!imageBuffer || imageBuffer.byteLength === 0) {
      console.warn(`Empty image buffer received for ${imageUrl}`);
      return new NextResponse(
        generateFallbackSVG(title),
        {
          status: 200,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': `public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400`,
          },
        }
      );
    }

    // Success - return image with aggressive caching
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Aggressive caching for successful images
        'Cache-Control': `public, max-age=${MAX_CACHE_AGE}, s-maxage=${MAX_CACHE_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}, immutable`,
        // Additional optimization headers
        'Vary': 'Accept-Encoding',
        'X-Image-Source': 'tmdb-proxy',
        'X-Cache-Status': 'miss',
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    });

  } catch (error) {
    // Handle any unexpected errors (network issues, timeouts, etc.)
    console.error('Image proxy error:', error);
    
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Error';
    
    return new NextResponse(
      generateFallbackSVG(title),
      {
        status: 200, // Return 200 to prevent cascading errors
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300, s-maxage=300', // Short cache for error cases
          'X-Error': 'image-proxy-error',
        },
      }
    );
  }
}

// Handle unsupported HTTP methods
export async function POST() {
  return new NextResponse('Method not allowed', { status: 405 });
}

export async function PUT() {
  return new NextResponse('Method not allowed', { status: 405 });
}

export async function DELETE() {
  return new NextResponse('Method not allowed', { status: 405 });
}