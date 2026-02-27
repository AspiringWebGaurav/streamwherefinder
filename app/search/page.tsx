import { Metadata } from 'next';
import { SearchPageClient } from './SearchPageClient';

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        page?: string;
    }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.q?.trim() || '';

    if (!query) {
        return {
            title: 'Search Movies | StreamWhereFinder',
            description: 'Search for any movie and find where to watch it legally using our Enterprise Search engine.',
        };
    }

    return {
        title: `Search results for "${query}" | StreamWhereFinder`,
        description: `Find where to watch "${query}" and similar movies online legally.`,
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.q?.trim() || '';
    const page = parseInt(resolvedSearchParams.page || '1', 10);

    return (
        <SearchPageClient initialQuery={query} initialPage={page} />
    );
}
