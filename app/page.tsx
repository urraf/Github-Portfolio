import PortfolioClient from "../portfolio"

export const dynamic = 'force-dynamic'

export default async function Page() {
  let portfolioData = null

  // Try MongoDB first
  if (process.env.MONGODB_URI) {
    try {
      const { getDb } = await import("@/lib/mongodb")
      const db = await getDb()
      const data = await db.collection('portfolio').findOne({ _id: 'main' as unknown as import('mongodb').ObjectId })
      if (data) {
        const { _id, ...rest } = data
        void _id
        portfolioData = rest
      }
    } catch (e) {
      console.error('Failed to read from MongoDB:', e)
    }
  }

  // Fallback to JSON file (for local dev without MongoDB)
  if (!portfolioData) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const dataPath = path.join(process.cwd(), 'data', 'portfolio-data.json')
      const raw = fs.readFileSync(dataPath, 'utf-8')
      portfolioData = JSON.parse(raw)
    } catch (e) {
      console.error('Failed to read portfolio data:', e)
    }
  }
  // Fetch live stats and merge into portfolio data
  if (portfolioData && process.env.MONGODB_URI) {
    try {
      const { getDb } = await import("@/lib/mongodb")
      const db = await getDb()
      const cached = await db.collection('liveStats').findOne({ _id: 'current' as unknown as import('mongodb').ObjectId })
      if (cached) {
        const cacheAge = Date.now() - new Date(cached.fetchedAt).getTime()
        if (cacheAge < 60 * 60 * 1000) {
          portfolioData.liveStats = cached.stats
          if (cached.codingStats && cached.codingStats.length > 0) {
            portfolioData.codingStats = cached.codingStats
          }
        }
      }

      // Ensure manual overrides apply immediately even if cache is missing or stale
      if (portfolioData.stats || portfolioData.liveStats) {
        const statsToUpdate = portfolioData.liveStats || portfolioData.stats;
        statsToUpdate.forEach((stat: any) => {
          if (stat.label === 'Github Repos' && portfolioData.manualGithubRepos) {
            stat.value = `${portfolioData.manualGithubRepos}`;
          }
          if (stat.label === 'LeetCode Rating' && portfolioData.manualLeetcodeRating) {
            stat.value = `${portfolioData.manualLeetcodeRating}`;
          }
          if (stat.label === 'Codeforces Rating' && portfolioData.manualCodeforcesRating) {
            stat.value = `${portfolioData.manualCodeforcesRating}`;
          }
          if (stat.label === 'Total Problems Solved' && portfolioData.totalProblemsSolved !== undefined && portfolioData.totalProblemsSolved !== null) {
            stat.value = `${portfolioData.totalProblemsSolved}`;
          }
        });
        portfolioData.liveStats = statsToUpdate;
      }

      if (portfolioData.codingStats) {
        portfolioData.codingStats.forEach((stat: any) => {
          if (stat.platform === 'LeetCode') {
            if (portfolioData.manualLeetcodeRating) stat.rating = `${portfolioData.manualLeetcodeRating}`;
            if (portfolioData.totalProblemsSolved !== undefined && portfolioData.totalProblemsSolved !== null) stat.problems = `${portfolioData.totalProblemsSolved}`;
          }
          if (stat.platform === 'Codeforces') {
            if (portfolioData.manualCodeforcesRating) stat.rating = `${portfolioData.manualCodeforcesRating}`;
          }
        });
      }
    } catch (e) {
      console.error('Failed to read live stats:', e)
    }
  }

  return <PortfolioClient data={portfolioData} />
}