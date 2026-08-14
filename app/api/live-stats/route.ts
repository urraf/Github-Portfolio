import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

interface LiveStatsCache {
  stats: { value: string; label: string; color: string }[];
  codingStats: { platform: string; rating: string; problems: string; color: string; bgColor: string; borderColor: string; url: string }[];
  fetchedAt: Date;
}

async function fetchGitHubStats(username: string) {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      publicRepos: data.public_repos || 0,
      followers: data.followers || 0,
    };
  } catch (e) {
    console.error('GitHub API error:', e);
    return null;
  }
}

// Removed fetchLeetCodeStats and fetchCodeforcesStats at user request

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('force') === 'true';
    
    const db = await getDb();

    // Check cache (valid for 1 hour)
    if (!forceRefresh) {
      const cached = await db.collection('liveStats').findOne({ _id: 'current' as unknown as import('mongodb').ObjectId });
      if (cached) {
        const cacheAge = Date.now() - new Date(cached.fetchedAt).getTime();
        if (cacheAge < 60 * 60 * 1000) { // 1 hour
          return NextResponse.json({
            stats: cached.stats,
            codingStats: cached.codingStats,
            cached: true,
          }, {
            headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' },
          });
        }
      }
    }

    // Fetch portfolio data
    const portfolioData = await db.collection('portfolio').findOne({ _id: 'main' as unknown as import('mongodb').ObjectId });
    
    // Fetch API data
    const githubUsername = portfolioData?.socialLinks?.github?.split('/').pop() || 'urraf';
    const github = await fetchGitHubStats(githubUsername);

    // Fetch manual overrides from Admin Panel
    let totalProblems: string | number = '700+'; // Default fallback
    if (portfolioData?.totalProblemsSolved !== undefined && portfolioData.totalProblemsSolved !== null) {
      totalProblems = portfolioData.totalProblemsSolved;
    }

    const githubVal = portfolioData?.manualGithubRepos ? `${portfolioData.manualGithubRepos}` : (github ? `${github.publicRepos}+` : '25+');
    const leetcodeVal = portfolioData?.manualLeetcodeRating ? `${portfolioData.manualLeetcodeRating}` : '1800+';
    const codeforcesVal = portfolioData?.manualCodeforcesRating ? `${portfolioData.manualCodeforcesRating}` : '1000+';

    const stats = [
      {
        value: githubVal,
        label: 'Github Repos',
        color: 'text-white',
      },
      {
        value: leetcodeVal,
        label: 'LeetCode Rating',
        color: 'text-[#ffa116]',
      },
      {
        value: codeforcesVal,
        label: 'Codeforces Rating',
        color: 'text-[#1f8acb]',
      },
      {
        value: typeof totalProblems === 'number' ? `${totalProblems}+` : String(totalProblems),
        label: 'Total Problems Solved',
        color: 'text-[#2ea043]',
      },
    ];

    // Build coding stats for the sidebar cards
    const codingStats = [
      {
        platform: 'LeetCode',
        rating: leetcodeVal,
        problems: typeof totalProblems === 'number' ? `${totalProblems}+` : String(totalProblems),
        color: 'text-[#ffa116]',
        bgColor: 'bg-[#ffa116]/10',
        borderColor: 'border-[#ffa116]/20',
        url: `https://leetcode.com/u/Urraf`,
      },
      {
        platform: 'Codeforces',
        rating: portfolioData?.manualCodeforcesRating ? `${portfolioData.manualCodeforcesRating}` : '1000+ (unrated)',
        problems: '—', // Since we don't fetch live problems anymore
        color: 'text-[#1f8acb]',
        bgColor: 'bg-[#1f8acb]/10',
        borderColor: 'border-[#1f8acb]/20',
        url: `https://codeforces.com/profile/nahraf.xd`,
      }
    ];

    // Cache to MongoDB
    const cacheData: LiveStatsCache = {
      stats,
      codingStats: codingStats.length > 0 ? codingStats : (portfolioData?.codingStats || []),
      fetchedAt: new Date(),
    };

    await db.collection('liveStats').updateOne(
      { _id: 'current' as unknown as import('mongodb').ObjectId },
      { $set: cacheData },
      { upsert: true }
    );

    return NextResponse.json({
      stats,
      codingStats: cacheData.codingStats,
      cached: false,
    }, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' },
    });
  } catch (error) {
    console.error('Error fetching live stats:', error);

    // On error, fall back to manually-set stats from portfolio data
    try {
      const db = await getDb();
      const portfolioData = await db.collection('portfolio').findOne({ _id: 'main' as unknown as import('mongodb').ObjectId });
      return NextResponse.json({
        stats: portfolioData?.stats || [],
        codingStats: portfolioData?.codingStats || [],
        cached: true,
        error: 'Fallback to cached data',
      });
    } catch {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
  }
}
