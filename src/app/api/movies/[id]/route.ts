import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  
  try {
    const movieId = parseInt(resolvedParams.id);

    if (!movieId || isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Valid movie ID is required' },
        { status: 400 }
      );
    }

    const movieDetails = await tmdbClient.getMovieDetails(movieId);
    const transformedMovie = tmdbClient.transformMovie(movieDetails);

    return NextResponse.json({
      movie: transformedMovie,
      raw: movieDetails, // Include raw data for similar movies, etc.
    });

  } catch (error) {
    console.error(`Movie details API error for ID ${resolvedParams.id}:`, error);
    
    return NextResponse.json(
      {
        error: 'Failed to get movie details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}