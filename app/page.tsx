import { fetchTrending, fetchPopular } from '@/lib/api';
import { HomeClient } from '@/components/HomeClient';
import { Navbar } from '@/components/Navbar';

// Server component — parallel data fetch with no waterfall
export default async function HomePage() {
  const [trending, popular] = await Promise.all([
    fetchTrending(),
    fetchPopular(),
  ]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--saas-bg)]">
      <Navbar />
      <HomeClient
        trending={trending}
        popular={popular}
      />
    </div>
  );
}
