import { NextRequest, NextResponse } from 'next/server';

// Test route for simulating various image loading scenarios
// This route should only be available in development
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Test routes only available in development', { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const scenario = searchParams.get('scenario') || 'success';
  const delay = parseInt(searchParams.get('delay') || '0');
  const width = parseInt(searchParams.get('width') || '500');
  const height = parseInt(searchParams.get('height') || '750');
  
  // Add artificial delay if requested
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, Math.min(delay, 5000))); // Max 5s delay
  }

  switch (scenario) {
    case 'success':
      return generateTestImage(width, height, 'success');
      
    case '404':
      return new NextResponse('Image not found', { status: 404 });
      
    case '500':
      return new NextResponse('Server error', { status: 500 });
      
    case 'timeout':
      // Simulate timeout by waiting 30 seconds
      await new Promise(resolve => setTimeout(resolve, 30000));
      return generateTestImage(width, height, 'timeout');
      
    case 'cors':
      return new NextResponse('CORS error', { 
        status: 403,
        headers: {
          'Access-Control-Allow-Origin': 'https://different-domain.com'
        }
      });
      
    case 'invalid-content':
      return new NextResponse('This is not an image', { 
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      
    case 'empty':
      return new NextResponse(null, { 
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': '0'
        }
      });
      
    case 'slow':
      // Return a chunked response with delays
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const svg = generateTestSVG(width, height, 'slow loading...');
          const chunks = svg.match(/.{1,100}/g) || []; // Split into 100-char chunks
          
          let index = 0;
          const sendChunk = () => {
            if (index < chunks.length) {
              controller.enqueue(encoder.encode(chunks[index]));
              index++;
              setTimeout(sendChunk, 200); // 200ms delay between chunks
            } else {
              controller.close();
            }
          };
          
          sendChunk();
        }
      });
      
      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'image/svg+xml',
        }
      });
      
    case 'large':
      // Generate a large test image
      return generateTestImage(2000, 3000, 'large image');
      
    case 'corrupted':
      // Return corrupted image data
      return new NextResponse('JFIF corrupted image data ', { 
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg'
        }
      });
      
    case 'redirect':
      return NextResponse.redirect(`${request.nextUrl.origin}/api/test-image?scenario=success&width=${width}&height=${height}`);
      
    default:
      return new NextResponse(
        JSON.stringify({
          error: 'Unknown scenario',
          availableScenarios: [
            'success', '404', '500', 'timeout', 'cors', 
            'invalid-content', 'empty', 'slow', 'large', 
            'corrupted', 'redirect'
          ]
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
  }
}

function generateTestImage(width: number, height: number, label: string): NextResponse {
  const svg = generateTestSVG(width, height, label);
  
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300', // 5 minute cache for testing
      'X-Test-Scenario': label
    }
  });
}

function generateTestSVG(width: number, height: number, label: string): string {
  const aspectRatio = width / height;
  const displayWidth = Math.min(width, 500);
  const displayHeight = Math.round(displayWidth / aspectRatio);
  
  return `<svg width="${displayWidth}" height="${displayHeight}" viewBox="0 0 ${displayWidth} ${displayHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Background gradient -->
    <defs>
      <linearGradient id="testGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:0.8" />
      </linearGradient>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#fff" stroke-width="0.5" opacity="0.3"/>
      </pattern>
    </defs>
    
    <!-- Background -->
    <rect width="${displayWidth}" height="${displayHeight}" fill="url(#testGrad)"/>
    <rect width="${displayWidth}" height="${displayHeight}" fill="url(#grid)"/>
    
    <!-- Border -->
    <rect x="2" y="2" width="${displayWidth-4}" height="${displayHeight-4}" fill="none" stroke="#fff" stroke-width="2" opacity="0.6"/>
    
    <!-- Test icon -->
    <circle cx="${displayWidth/2}" cy="${displayHeight/2 - 30}" r="25" fill="#fff" opacity="0.9"/>
    <path d="M${displayWidth/2 - 12},${displayHeight/2 - 35} L${displayWidth/2 + 12},${displayHeight/2 - 25} L${displayWidth/2 - 12},${displayHeight/2 - 15} Z" fill="#4F46E5"/>
    
    <!-- Label -->
    <text x="${displayWidth/2}" y="${displayHeight/2 + 10}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#fff">
      TEST IMAGE
    </text>
    <text x="${displayWidth/2}" y="${displayHeight/2 + 28}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#fff" opacity="0.9">
      ${label}
    </text>
    
    <!-- Dimensions -->
    <text x="${displayWidth/2}" y="${displayHeight/2 + 45}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#fff" opacity="0.7">
      ${width}x${height}
    </text>
    
    <!-- Timestamp -->
    <text x="5" y="${displayHeight - 5}" font-family="system-ui, sans-serif" font-size="8" fill="#fff" opacity="0.6">
      ${new Date().toISOString()}
    </text>
  </svg>`;
}

// Additional endpoints for testing
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not available', { status: 404 });
  }
  
  return new NextResponse(JSON.stringify({ message: 'Test image endpoint ready' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}