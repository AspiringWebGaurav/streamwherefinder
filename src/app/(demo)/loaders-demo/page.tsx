'use client';

import React, { useState, useEffect } from 'react';
import { SmartPosterImage, SmartBackdropImage, SmartThumbnailImage } from '@/components/SmartImage';
import { useLoader, useAsyncTask } from '@/app/providers/LoaderProvider';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';

// Sample TMDB movie data for demo
const DEMO_MOVIES = [
  {
    id: 1,
    title: "Avatar: The Way of Water",
    poster_path: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    backdrop_path: "/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    release_date: "2022-12-16"
  },
  {
    id: 2,
    title: "Top Gun: Maverick",
    poster_path: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    backdrop_path: "/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg",
    release_date: "2022-05-27"
  },
  {
    id: 3,
    title: "Black Panther: Wakanda Forever",
    poster_path: "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
    backdrop_path: "/xDMIl84Qo5Tsu62c9DGWhmPI67A.jpg",
    release_date: "2022-11-11"
  },
  {
    id: 4,
    title: "Spider-Man: No Way Home",
    poster_path: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    backdrop_path: "/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",
    release_date: "2021-12-17"
  },
  {
    id: 5,
    title: "Doctor Strange in the Multiverse of Madness",
    poster_path: "/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg",
    backdrop_path: "/wcKFYIiVDvRURrzglV9kGu7fpfY.jpg",
    release_date: "2022-05-06"
  },
  {
    id: 6,
    title: "Minions: The Rise of Gru",
    poster_path: "/wKiOkZTN9lUUUNZLmtnwubZYONg.jpg",
    backdrop_path: "/drBB8LoKNGdYl9IZo3VKMYUAJIf.jpg",
    release_date: "2022-07-01"
  },
  {
    id: 7,
    title: "Thor: Love and Thunder",
    poster_path: "/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg",
    backdrop_path: "/p1F51Lvj3sMopG948F5HsBbl43C.jpg",
    release_date: "2022-07-08"
  },
  {
    id: 8,
    title: "Jurassic World Dominion",
    poster_path: "/kAVRgw7GgK1CfYEJq8ME6EvRIgU.jpg",
    backdrop_path: "/53z2fXEKfnNg2uSOPss2unPBGX1.jpg",
    release_date: "2022-06-10"
  },
  {
    id: 9,
    title: "The Batman",
    poster_path: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdrop_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    release_date: "2022-03-04"
  },
  {
    id: 10,
    title: "Sonic the Hedgehog 2",
    poster_path: "/6DrHO1jr3qVrViUO6s6kFiAGM7.jpg",
    backdrop_path: "/egoyMDLqCyP0vz95gV6nnkeB5N.jpg",
    release_date: "2022-04-08"
  },
  {
    id: 11,
    title: "Fantastic Beasts: The Secrets of Dumbledore",
    poster_path: "/8ZbybiGYe8XM4WGmGlhF0ec5R7u.jpg",
    backdrop_path: "/zGLHX92Gk96O1DJvLil7ObJTbaL.jpg",
    release_date: "2022-04-15"
  },
  {
    id: 12,
    title: "Lightyear",
    poster_path: "/ox4goZd956BxqJH6iLwhWPL9ct4.jpg",
    backdrop_path: "/5P8SmMzSNYikXpxil6BYzJ16611.jpg",
    release_date: "2022-06-17"
  }
];

// Simulate network delay for demonstration
const simulateDelay = (min: number = 1000, max: number = 3000): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Demo component for manual loader testing
 */
function LoaderControls() {
  const { startTask, endTask, isLoading, taskCount } = useLoader();
  const [currentTaskId, setCurrentTaskId] = useState<string>('');

  const handleStartTask = () => {
    const taskId = `manual_${Date.now()}`;
    setCurrentTaskId(taskId);
    startTask(taskId);
  };

  const handleEndTask = () => {
    if (currentTaskId) {
      endTask(currentTaskId);
      setCurrentTaskId('');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Loader Controls</h2>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={handleStartTask}
          disabled={!!currentTaskId}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
        >
          Start Manual Task
        </button>
        
        <button
          onClick={handleEndTask}
          disabled={!currentTaskId}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded transition-colors"
        >
          End Manual Task
        </button>
      </div>
      
      <div className="text-white text-sm">
        <p>Loading Status: <span className={isLoading ? 'text-yellow-300' : 'text-green-300'}>
          {isLoading ? 'Loading' : 'Idle'}
        </span></p>
        <p>Active Tasks: <span className="text-blue-300">{taskCount}</span></p>
        {currentTaskId && <p>Current Task: <span className="text-purple-300">{currentTaskId}</span></p>}
      </div>
    </div>
  );
}

/**
 * Demo component for async task testing
 */
function AsyncTaskDemo() {
  const { execute, isLoading, error, data } = useAsyncTask('async_demo');
  const [result, setResult] = useState<string>('');

  const simulateAsyncOperation = async () => {
    await simulateDelay(2000, 4000);
    return `Operation completed at ${new Date().toLocaleTimeString()}`;
  };

  const handleAsyncTask = async () => {
    try {
      const result = await execute(simulateAsyncOperation);
      setResult(result);
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Async Task Demo</h2>
      
      <button
        onClick={handleAsyncTask}
        disabled={isLoading}
        className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded transition-colors mb-4 flex items-center gap-2"
      >
        {isLoading && <Spinner size="sm" variant="white" />}
        {isLoading ? 'Processing...' : 'Start Async Task'}
      </button>
      
      {result && (
        <p className={cn(
          "text-sm",
          error ? "text-red-300" : "text-green-300"
        )}>
          {result}
        </p>
      )}
    </div>
  );
}

/**
 * Movie poster grid with SmartImage components
 */
function MovieGrid({ delay = false }: { delay?: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {DEMO_MOVIES.map((movie, index) => (
        <div key={movie.id} className="space-y-2">
          <SmartPosterImage
            src={movie.poster_path}
            alt={movie.title}
            title={movie.title}
            className="w-full"
            priority={index < 4} // Priority for first 4 images
            onLoadComplete={() => {
              if (delay && Math.random() > 0.7) {
                // Randomly add extra delay for some images
                setTimeout(() => {}, 1000);
              }
            }}
          />
          
          <div className="text-white text-center">
            <h3 className="text-sm font-medium truncate">{movie.title}</h3>
            <p className="text-xs text-white/70">{movie.release_date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Backdrop showcase section
 */
function BackdropShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 4);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Backdrop Images</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_MOVIES.slice(currentIndex, currentIndex + 4).map((movie) => (
          <div key={movie.id} className="relative">
            <SmartBackdropImage
              src={movie.backdrop_path}
              alt={movie.title}
              title={movie.title}
              className="w-full"
            />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-bold">{movie.title}</h3>
              <p className="text-sm opacity-80">{movie.release_date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Thumbnail gallery section
 */
function ThumbnailGallery() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Thumbnail Gallery</h2>
      <div className="flex flex-wrap gap-3">
        {DEMO_MOVIES.slice(0, 8).map((movie) => (
          <SmartThumbnailImage
            key={movie.id}
            src={movie.poster_path}
            alt={movie.title}
            size="lg"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Main demo page component
 */
export default function LoadersDemoPage() {
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [simulateNetworkDelay, setSimulateNetworkDelay] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          StreamWhereFinder Loader System Demo
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">
          Experience our enterprise-quality loading system with global loaders, smart image components, 
          and various loading states. Test different scenarios below.
        </p>
      </div>

      {/* Demo Controls */}
      <div className="mb-8">
        <LoaderControls />
        <AsyncTaskDemo />
      </div>

      {/* Display Options */}
      <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-8">
        <h2 className="text-lg font-bold text-white mb-3">Display Options</h2>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center text-white">
            <input
              type="checkbox"
              checked={showSkeletons}
              onChange={(e) => setShowSkeletons(e.target.checked)}
              className="mr-2"
            />
            Show Skeleton Loading
          </label>
          
          <label className="flex items-center text-white">
            <input
              type="checkbox"
              checked={simulateNetworkDelay}
              onChange={(e) => setSimulateNetworkDelay(e.target.checked)}
              className="mr-2"
            />
            Simulate Network Delays
          </label>
        </div>
      </div>

      {/* Image Showcases */}
      <BackdropShowcase />
      <ThumbnailGallery />

      {/* Main Movie Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Movie Poster Grid</h2>
        <p className="text-white/70 text-sm mb-6">
          This grid demonstrates SmartImage components with IntersectionObserver lazy loading, 
          spinner states, error handling, and performance optimizations.
        </p>
        
        {showSkeletons ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <MovieGrid delay={simulateNetworkDelay} />
        )}
      </div>

      {/* Testing Instructions */}
      <div className="bg-white/5 backdrop-blur rounded-lg p-6 mt-12">
        <h2 className="text-xl font-bold text-white mb-4">Testing Instructions</h2>
        <div className="text-white/80 space-y-3 text-sm">
          <p>• <strong>Global Loader:</strong> Use the manual controls above or navigate between pages to see the global loading overlay.</p>
          <p>• <strong>Image Loading:</strong> Scroll down to trigger lazy loading. Images show spinners while loading.</p>
          <p>• <strong>Error Handling:</strong> Disable network or use invalid images to test error states.</p>
          <p>• <strong>Accessibility:</strong> Test with screen readers to verify ARIA labels and announcements.</p>
          <p>• <strong>Reduced Motion:</strong> Enable reduced motion in your browser/OS to test motion-safe alternatives.</p>
          <p>• <strong>Network Throttling:</strong> Use browser dev tools to simulate slow connections.</p>
        </div>
      </div>
    </div>
  );
}