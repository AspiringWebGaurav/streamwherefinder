import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeWindow = searchParams.get('timeWindow') as 'day' | 'week' || 'week';
    const limit = parseInt(searchParams.get('limit') || '20');

    const response = await tmdbClient.getTrendingMovies(timeWindow);
    const movies = response.results
      .slice(0, limit)
      .map(movie => tmdbClient.transformPopularMovie(movie));

    return NextResponse.json({
      movies,
      totalResults: response.total_results,
      timeWindow,
    });

  } catch (error) {
    console.error('Trending movies API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get trending movies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}