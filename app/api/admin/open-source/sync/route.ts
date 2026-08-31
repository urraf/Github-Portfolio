import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();

    // Get GitHub username from portfolio data, default to urraf
    const portfolioData = await db.collection('portfolio').findOne({ _id: 'main' as unknown as import('mongodb').ObjectId });
    const githubUrl = portfolioData?.socialLinks?.github || 'https://github.com/urraf';
    const githubUsername = githubUrl.split('/').pop() || 'urraf';

    // Fetch PRs from GitHub Search API
    const response = await fetch(`https://api.github.com/search/issues?q=author:${githubUsername}+type:pr`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Nahraf-Portfolio-App'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch from GitHub API' }, { status: 500 });
    }

    const data = await response.json();
    const items = data.items || [];
    let importedCount = 0;

    // Cache repo details to avoid hitting rate limits
    const repoCache: Record<string, any> = {};

    for (const item of items) {
      // Check if this PR already exists in our DB
      const existing = await db.collection('openSourceContributions').findOne({ prUrl: item.html_url });
      if (existing) continue; // Skip already imported PRs

      // Extract repo info from repository_url (e.g. "https://api.github.com/repos/user/repo")
      const repoApiUrl = item.repository_url;
      let stars = 0;
      let repoName = 'Unknown Repo';
      let repoHtmlUrl = '';

      if (repoApiUrl) {
        if (!repoCache[repoApiUrl]) {
          try {
            const repoRes = await fetch(repoApiUrl, {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Nahraf-Portfolio-App'
              }
            });
            if (repoRes.ok) {
              repoCache[repoApiUrl] = await repoRes.json();
            } else {
              repoCache[repoApiUrl] = null;
            }
          } catch (e) {
            console.error('Error fetching repo info:', e);
            repoCache[repoApiUrl] = null;
          }
        }

        const repoData = repoCache[repoApiUrl];
        if (repoData) {
          stars = repoData.stargazers_count || 0;
          repoName = repoData.full_name || repoData.name || 'Unknown Repo';
          repoHtmlUrl = repoData.html_url || '';
        } else {
           // Fallback if API fails
           const parts = repoApiUrl.split('/');
           repoName = parts.slice(-2).join('/');
           repoHtmlUrl = `https://github.com/${repoName}`;
        }
      }

      let status = 'Open';
      if (item.state === 'closed') {
        // merged_at is sometimes null in the search API response for closed PRs that were merged.
        // It's safer to rely on pull_request.merged_at if available, otherwise just use 'Merged' if closed as an optimistic default,
        // but it's better to check pull_request payload. 
        if (item.pull_request?.merged_at) {
          status = 'Merged';
        } else {
          // In GitHub search API, you can't easily tell apart closed vs merged without pulling the PR itself,
          // but pull_request.merged_at will be populated if it was merged.
          status = 'Closed';
        }
      }

      const newContribution = {
        projectName: repoName,
        repoUrl: repoHtmlUrl,
        prUrl: item.html_url,
        description: item.title,
        contributionType: 'Pull Request',
        status: status,
        techStack: [],
        stars: stars,
        createdAt: new Date(),
      };

      await db.collection('openSourceContributions').insertOne(newContribution);
      importedCount++;
    }

    return NextResponse.json({ success: true, imported: importedCount });
  } catch (error: any) {
    console.error('Error syncing GitHub PRs:', error);
    return NextResponse.json({ error: error.message || 'Failed to sync PRs' }, { status: 500 });
  }
}
