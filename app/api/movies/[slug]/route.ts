import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const movieId = tmdbClient.extractIdFromSlug(slug);
        if (!movieId || isNaN(movieId)) {
            return NextResponse.json({ error: 'Invalid movie slug' }, { status: 400 });
        }

        const raw = await tmdbClient.getMovieDetails(movieId);
        const movie = tmdbClient.transformMovie(raw);
        return NextResponse.json(movie);
    } catch (error) {
        console.error('Movie details API error:', error);
        return NextResponse.json(
            { error: 'Failed to get movie details', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
