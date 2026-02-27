import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const limit = parseInt(searchParams.get('limit') || '10');
        const page = parseInt(searchParams.get('page') || '1');

        if (!query || query.trim().length < 2) {
            return NextResponse.json(
                { error: 'Query parameter is required and must be at least 2 characters' },
                { status: 400 }
            );
        }

        const response = await tmdbClient.searchMovies(query.trim(), page);

        if (limit <= 10) {
            const movies = response.results.slice(0, limit).map((m) => tmdbClient.transformPopularMovie(m));
            return NextResponse.json({ movies, isClientSide: false, totalResults: response.total_results, query: query.trim() });
        }

        const movies = response.results.map((m) => tmdbClient.transformMovie(m));
        return NextResponse.json({
            movies,
            isClientSide: false,
            totalResults: response.total_results,
            query: query.trim(),
            page: response.page,
            totalPages: response.total_pages,
        });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Failed to search movies', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
