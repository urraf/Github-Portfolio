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

async function fetchLeetCodeStats(username: string) {
  try {
    const [statsRes, contestRes] = await Promise.all([
      fetch(`https://leetcode-api-faisalshohag.vercel.app/${username}`, { next: { revalidate: 3600 } }),
      fetch(`https://alfa-leetcode-api.onrender.com/${username}/contest`, { next: { revalidate: 3600 } })
    ]);
    
    let totalSolved = 0;
    let ranking = 0;
    let rating = 0;

    if (statsRes.ok) {
      const statsData = await statsRes.json();
      totalSolved = statsData.totalSolved || 0;
      ranking = statsData.ranking || 0;
    }

    if (contestRes.ok) {
      const contestData = await contestRes.json();
      rating = Math.round(contestData.contestRating || 0);
    }

    return { rating, totalSolved, ranking };
  } catch (e) {
    console.error('LeetCode API error:', e);
    return null;
  }
}

async function fetchCodeforcesStats(handle: string) {
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'OK' || !data.result || data.result.length === 0) return null;
    const user = data.result[0];
    return {
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'unrated',
    };
  } catch (e) {
    console.error('Codeforces API error:', e);
    return null;
  }
}

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

    // Fetch portfolio data for usernames
    const portfolioData = await db.collection('portfolio').findOne({ _id: 'main' as unknown as import('mongodb').ObjectId });
    const githubUsername = portfolioData?.socialLinks?.github?.split('/').pop() || 'urraf';
    const leetcodeUsername = 'Urraf';
    const codeforcesHandle = 'nahraf.xd';

    // Fetch all APIs in parallel
    const [github, leetcode, codeforces] = await Promise.all([
      fetchGitHubStats(githubUsername),
      fetchLeetCodeStats(leetcodeUsername),
      fetchCodeforcesStats(codeforcesHandle),
    ]);

    // Build stats array for the main stat cards
    const totalProblems = (leetcode?.totalSolved || 0);
    const stats = [
      {
        value: github ? `${github.publicRepos}+` : '25+',
        label: 'Github Repos',
        color: 'text-white',
      },
      {
        value: leetcode ? `${leetcode.rating}` : '1800+',
        label: 'LeetCode Rating',
        color: 'text-[#ffa116]',
      },
      {
        value: codeforces ? `${codeforces.rating}` : '1000+',
        label: 'Codeforces',
        color: 'text-[#1f8acb]',
      },
      {
        value: totalProblems ? `${totalProblems}+` : '700+',
        label: 'Problems Solved',
        color: 'text-[#2ea043]',
      },
    ];

    // Build coding stats for the sidebar cards
    const codingStats = [];

    if (leetcode) {
      codingStats.push({
        platform: 'LeetCode',
        rating: `${leetcode.rating}`,
        problems: `${leetcode.totalSolved}`,
        color: 'text-[#ffa116]',
        bgColor: 'bg-[#ffa116]/10',
        borderColor: 'border-[#ffa116]/20',
        url: `https://leetcode.com/u/Urraf`,
      });
    }

    if (codeforces) {
      codingStats.push({
        platform: 'Codeforces',
        rating: `${codeforces.rating} (${codeforces.rank})`,
        problems: '—',
        color: 'text-[#1f8acb]',
        bgColor: 'bg-[#1f8acb]/10',
        borderColor: 'border-[#1f8acb]/20',
        url: `https://codeforces.com/profile/nahraf.xd`,
      });
    }

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
