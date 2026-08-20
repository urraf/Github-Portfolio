/**
 * Trending & viral tech topic engine for automated blog generation.
 * 
 * Strategy:
 * - Instead of a static topic list, we ask the AI itself to pick trending topics
 * - We track recently generated titles in MongoDB to avoid repetition
 * - Each call returns a fresh, viral-worthy topic prompt
 */

import { getDb } from '@/lib/mongodb';

// Broad category pool — the AI picks a trending angle within each
const TOPIC_CATEGORIES = [
  // Hot & Trending
  "Latest AI breakthroughs and announcements (GPT, Claude, Gemini, open-source models)",
  "AI agents and autonomous coding tools in 2025-2026",
  "The current state of tech layoffs, hiring freezes, and the job market",
  "New programming languages and frameworks gaining traction",
  "The future of frontend: React Server Components, Astro, HTMX debate",
  "How AI is replacing or augmenting software developers right now",
  
  // AI & Machine Learning
  "Building production-ready AI applications with RAG and vector databases",
  "Fine-tuning open-source LLMs for custom use cases",
  "AI code generation tools: Copilot vs Cursor vs alternatives compared",
  "Computer vision breakthroughs and real-world applications",
  "Running AI models locally: Ollama, llama.cpp, and edge AI",
  "Prompt engineering best practices for developers",
  
  // Backend & System Design
  "Designing systems that scale to millions of users",
  "Microservices vs monoliths: the pendulum swings back",
  "Event-driven architecture with Kafka, RabbitMQ, or NATS",
  "Database wars: PostgreSQL vs MongoDB vs newer alternatives",
  "API design patterns: REST vs GraphQL vs tRPC vs gRPC",
  "Caching strategies: Redis, Memcached, and CDN patterns",
  
  // Cloud & DevOps
  "Kubernetes in production: lessons learned and best practices",
  "Serverless architecture: when it works and when it doesn't",
  "Infrastructure as Code: Terraform, Pulumi, and the future",
  "CI/CD pipeline optimization for faster deployments",
  "Cloud cost optimization strategies that actually work",
  "Multi-cloud vs single-cloud: making the right choice",
  
  // Web Development
  "Next.js 15 deep dive: new features and migration guide",
  "The state of CSS in 2026: new features changing everything",
  "Web performance optimization: Core Web Vitals masterclass",
  "Authentication in modern web apps: OAuth, JWT, passkeys",
  "WebAssembly: the future of web performance",
  "Progressive Web Apps vs Native Apps in 2026",
  
  // Cybersecurity
  "API security: common vulnerabilities and how to prevent them",
  "Zero-trust architecture explained for developers",
  "Supply chain attacks: securing your npm/pip dependencies",
  "OAuth 2.0 and OpenID Connect security best practices",
  
  // Career & Industry
  "How to stand out as a developer in an AI-saturated market",
  "Remote work in tech: the current state and future trends",
  "Building a developer portfolio that actually gets interviews",
  "The rise of indie hackers and solopreneurs in tech",
  "Tech salary trends and negotiation strategies",
  "Open source contribution: why and how to get started",
  
  // Emerging Tech
  "Edge computing: moving processing closer to users",
  "Blockchain beyond crypto: practical use cases in 2026",
  "Quantum computing: current state and developer implications",
  "AR/VR development: building spatial computing experiences",
  "The rise of Rust in systems programming",
  "Go vs Rust vs Zig: the systems programming battle",
  
  // Data & Analytics
  "Real-time data pipelines for modern applications",
  "Data engineering with Apache Spark, Flink, and newer tools",
  "Building data-driven products: analytics and experimentation",
  "Vector databases explained: Pinecone, Weaviate, ChromaDB",
  
  // Mobile
  "Cross-platform mobile development: React Native vs Flutter in 2026",
  "iOS and Android development trends and new APIs",
  "Building offline-first mobile applications",
];

/**
 * Get a trending topic that hasn't been used recently.
 * Checks MongoDB for recently generated blog titles to avoid repetition.
 */
export async function getTrendingTopic(): Promise<string> {
  const db = await getDb();
  
  // Get titles of blogs generated in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentBlogs = await db.collection('blogs')
    .find(
      { publishedAt: { $gte: thirtyDaysAgo.toISOString() } },
      { projection: { title: 1, tags: 1, category: 1 } }
    )
    .toArray();
  
  const recentTitles = recentBlogs.map(b => b.title?.toLowerCase() || '');
  const recentTags = recentBlogs.flatMap(b => b.tags || []).map(t => t.toLowerCase());
  const recentCategories = recentBlogs.map(b => b.category?.toLowerCase() || '');
  
  // Filter out categories that have been used too often recently
  const categoryUsage: Record<string, number> = {};
  recentCategories.forEach(c => { categoryUsage[c] = (categoryUsage[c] || 0) + 1; });
  
  // Shuffle the topics and pick one that's least represented
  const shuffled = [...TOPIC_CATEGORIES].sort(() => Math.random() - 0.5);
  
  // Try to find a topic whose keywords aren't overrepresented in recent posts
  for (const topic of shuffled) {
    const topicWords = topic.toLowerCase().split(/\s+/);
    const overlapScore = topicWords.reduce((score, word) => {
      if (recentTitles.some(t => t.includes(word) && word.length > 4)) score += 2;
      if (recentTags.includes(word)) score += 1;
      return score;
    }, 0);
    
    // Low overlap = good, pick this topic
    if (overlapScore < 4) {
      return topic;
    }
  }
  
  // Fallback: just return a random topic
  return shuffled[0];
}

/**
 * Build the full prompt for generating a trending, viral blog post.
 */
export function buildBlogPrompt(topicHint: string): string {
  return `You are an expert tech blogger who writes viral, trending articles for a developer's portfolio blog.

TOPIC DIRECTION: "${topicHint}"

YOUR MISSION:
1. Pick a SPECIFIC, trending angle within this topic area — something developers are actively discussing RIGHT NOW
2. Write a comprehensive, opinionated, and engaging blog post about it
3. Make it feel like a HOT TAKE or deep analysis that would go viral on Twitter/X and Hacker News
4. Include practical code examples where relevant
5. Be opinionated — developers love strong, well-argued opinions

WRITING STYLE:
- Conversational but technically deep
- Use analogies and real-world examples
- Include "hot take" opinions that spark discussion
- Reference real tools, frameworks, and companies
- Make it feel CURRENT — like it was written today about today's tech landscape

CRITICAL RULES:
- The "content" field MUST be 800-1200 words maximum. Be concise and impactful.
- Do NOT use special unicode characters like em-dashes (—) or smart quotes. Use plain ASCII only.
- Escape all double quotes inside strings with backslash.
- Your entire response must be valid, parseable JSON. Do NOT truncate.

Format your response AS A STRICT JSON OBJECT. Do NOT wrap it in markdown code blocks. Output raw JSON only:
{
  "title": "A catchy, click-worthy title that would trend on Hacker News",
  "excerpt": "A compelling 2-sentence hook that makes developers NEED to read more",
  "content": "The full blog post in Markdown. 800-1200 words MAX. Include ## headings, code blocks, bold text, and bullet points. Keep it focused and punchy.",
  "category": "One primary category (e.g., 'AI', 'Web Development', 'System Design', 'Cloud', 'Cybersecurity', 'Tech Industry', 'Programming', 'Data', 'Mobile', 'DevOps', 'Blockchain', 'Career')",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "imageQuery": "A 2-3 word search query for finding a relevant stock photo (e.g., 'neural network', 'server room', 'coding laptop', 'cloud computing')",
  "metaTitle": "SEO-optimized title (under 60 chars)",
  "metaDescription": "SEO meta description (under 160 chars)"
}`;
}
