import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const response = await tmdbClient.getUpcomingMovies(page);
        const movies = response.results.slice(0, limit).map((m) => tmdbClient.transformPopularMovie(m));

        return NextResponse.json({ movies, totalResults: response.total_results, page: response.page, totalPages: response.total_pages });
    } catch (error) {
        console.error('Upcoming movies API error:', error);
        return NextResponse.json(
            { error: 'Failed to get upcoming movies', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
