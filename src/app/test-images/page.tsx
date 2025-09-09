'use client';

import { useState } from 'react';
import { ImageWithFallback, PosterImage } from '@/components/ui/ImageWithFallback';
import { SearchResultItem } from '@/components/search/SearchResultItem';
import { MovieCard } from '@/components/movie/MovieCard';
import { PopularMovie } from '@/types/tmdb';

// Test scenarios for image loading
const TEST_SCENARIOS = [
  {
    name: 'Valid TMDB Image',
    path: '/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg',
    description: 'Real TMDB poster path'
  },
  {
    name: 'Invalid Path',
    path: '/nonexistent-image.jpg',
    description: 'Should show fallback'
  },
  {
    name: 'Null Path',
    path: null,
    description: 'Should show fallback immediately'
  },
  {
    name: 'Test Success',
    path: 'TEST:/api/test-image?scenario=success',
    description: 'Generated test image'
  },
  {
    name: 'Test 404',
    path: 'TEST:/api/test-image?scenario=404',
    description: 'Simulated 404 error'
  },
  {
    name: 'Test 500',
    path: 'TEST:/api/test-image?scenario=500',
    description: 'Simulated server error'
  },
  {
    name: 'Test Slow',
    path: 'TEST:/api/test-image?scenario=slow',
    description: 'Slow loading simulation'
  },
  {
    name: 'Test Empty',
    path: 'TEST:/api/test-image?scenario=empty',
    description: 'Empty response'
  },
  {
    name: 'Test Large',
    path: 'TEST:/api/test-image?scenario=large&width=2000&height=3000',
    description: 'Large image test'
  },
  {
    name: 'Test Delay',
    path: 'TEST:/api/test-image?scenario=success&delay=3000',
    description: '3 second delay'
  }
];

// Mock movie data for testing components
const createTestMovie = (scenario: any): PopularMovie => ({
  id: Math.random(),
  title: `Test Movie: ${scenario.name}`,
  slug: `test-movie-${scenario.name.toLowerCase().replace(/\s+/g, '-')}`,
  posterPath: scenario.path?.startsWith('TEST:') ? scenario.path.replace('TEST:', '') : scenario.path,
  releaseDate: '2024-01-01',
  rating: 8.5
});

export default function TestImagesPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Test page not available</h1>
          <p className="text-gray-600 mt-2">This page is only available in development mode</p>
        </div>
      </div>
    );
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  const clearLogs = () => setLogs([]);

  const testServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          addLog(`SW Response: ${JSON.stringify(event.data)}`);
        };
        
        registration.active?.postMessage(
          { type: 'GET_CACHE_INFO' },
          [messageChannel.port2]
        );
        
        addLog('Service Worker message sent');
      } catch (error) {
        addLog(`SW Error: ${error}`);
      }
    } else {
      addLog('Service Worker not supported');
    }
  };

  const clearServiceWorkerCache = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          addLog(`SW Clear Response: ${JSON.stringify(event.data)}`);
        };
        
        registration.active?.postMessage(
          { type: 'CLEAR_IMAGE_CACHE' },
          [messageChannel.port2]
        );
        
        addLog('Cache clear request sent');
      } catch (error) {
        addLog(`SW Clear Error: ${error}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Image Loading System Test
          </h1>
          <p className="text-gray-600 mb-4">
            Comprehensive testing for the image proxy and fallback system
          </p>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testServiceWorker}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Service Worker
            </button>
            <button
              onClick={clearServiceWorkerCache}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear SW Cache
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Logs
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Tests
            </button>
          </div>
        </div>

        {/* Basic ImageWithFallback Tests */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ImageWithFallback Component</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEST_SCENARIOS.slice(0, showAdvanced ? undefined : 6).map((scenario, index) => (
              <div key={index} className="text-center">
                <div className="mb-2">
                  <ImageWithFallback
                    src={scenario.path?.startsWith('TEST:') ? scenario.path.replace('TEST:', '') : scenario.path}
                    alt={`Test: ${scenario.name}`}
                    title={scenario.name}
                    width={200}
                    height={300}
                    aspectRatio="poster"
                    className="w-full border rounded-lg"
                    onLoad={() => addLog(`✅ ${scenario.name} loaded`)}
                    onError={() => addLog(`❌ ${scenario.name} failed`)}
                  />
                </div>
                <h3 className="font-semibold text-sm text-gray-900">{scenario.name}</h3>
                <p className="text-xs text-gray-600">{scenario.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PosterImage Tests */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">PosterImage Component</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {TEST_SCENARIOS.slice(0, 6).map((scenario, index) => (
              <div key={index} className="text-center">
                <PosterImage
                  src={scenario.path?.startsWith('TEST:') ? scenario.path.replace('TEST:', '') : scenario.path}
                  alt={`Poster: ${scenario.name}`}
                  title={scenario.name}
                  className="w-full mb-2"
                />
                <h3 className="font-semibold text-xs text-gray-900">{scenario.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* SearchResultItem Tests */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">SearchResultItem Component</h2>
          <div className="space-y-2 max-w-md">
            {TEST_SCENARIOS.slice(0, 5).map((scenario, index) => (
              <SearchResultItem
                key={index}
                movie={createTestMovie(scenario)}
                query="test"
                onClick={(movie) => addLog(`🔍 Search item clicked: ${movie.title}`)}
              />
            ))}
          </div>
        </div>

        {/* MovieCard Tests */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">MovieCard Component</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {TEST_SCENARIOS.slice(0, 6).map((scenario, index) => (
              <MovieCard
                key={index}
                movie={createTestMovie(scenario)}
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Performance Tests */}
        {showAdvanced && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Lazy Loading Test (50 images)</h3>
                <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
                  {Array.from({ length: 50 }, (_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <PosterImage
                        src="/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg"
                        alt={`Performance test ${i + 1}`}
                        title={`Test Image ${i + 1}`}
                        className="w-16 h-24 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-medium">Test Movie {i + 1}</h4>
                        <p className="text-sm text-gray-600">Lazy loading test</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Error Recovery Test</h3>
                <div className="space-y-4">
                  <ImageWithFallback
                    src="/api/test-image?scenario=404"
                    alt="404 Test"
                    width={200}
                    height={300}
                    className="w-full border rounded-lg"
                    onLoad={() => addLog('404 test loaded (unexpected!)')}
                    onError={() => addLog('404 test failed as expected')}
                  />
                  <ImageWithFallback
                    src="/api/test-image?scenario=500"
                    alt="500 Test"
                    width={200}
                    height={300}
                    className="w-full border rounded-lg"
                    onLoad={() => addLog('500 test loaded (unexpected!)')}
                    onError={() => addLog('500 test failed as expected')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Logs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Debug Logs</h2>
          <div className="h-64 overflow-y-auto bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Interact with the test images above.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-bold text-blue-900 mb-2">Testing Instructions</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Watch the debug logs for load/error events</li>
            <li>• Test with network throttling (DevTools → Network → Slow 3G)</li>
            <li>• Test with offline mode to verify fallbacks</li>
            <li>• Check DevTools → Application → Storage for cache entries</li>
            <li>• Verify intersection observer with scroll tests</li>
            <li>• Test service worker cache with refresh after clearing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}