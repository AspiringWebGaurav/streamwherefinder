import { Metadata } from 'next';
import { redirect } from 'next/navigation';
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
            title: 'Search Movies | StreamWhere',
            description: 'Search for any movie and find where to watch it legally using our Enterprise Search engine.',
        };
    }

    return {
        title: `Search results for "${query}" | StreamWhere`,
        description: `Find where to watch "${query}" and similar movies online legally.`,
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.q?.trim() || '';
    const page = parseInt(resolvedSearchParams.page || '1', 10);

    if (!query) {
        redirect('/');
    }

    return (
        <SearchPageClient initialQuery={query} initialPage={page} />
    );
}
