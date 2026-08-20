import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse, NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getTrendingTopic, buildBlogPrompt } from '@/lib/blog-topics';
import { searchCoverImage } from '@/lib/pexels';
import { notifyBlogPublished } from '@/lib/email';

const groq = createOpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Allow up to 120s for generating a full blog post
export const maxDuration = 120;

/**
 * POST /api/cron/generate-blogs
 * 
 * Generates 1 AI blog post per call with a trending topic and cover image.
 * Secured with CRON_SECRET header.
 * 
 * Call this endpoint twice daily (morning + evening) from cron-job.org
 * or any external scheduler.
 * 
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 * 
 * Query params:
 *   ?count=1  (optional, default 1, max 3)
 */
export async function POST(req: NextRequest) {
  try {
    // ── Security: Verify cron secret ──────────────────────────────────
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Parse count ───────────────────────────────────────────────────
    const url = new URL(req.url);
    const count = Math.min(3, Math.max(1, parseInt(url.searchParams.get('count') || '1')));

    if (!process.env.GROK_API_KEY) {
      return NextResponse.json({ error: 'GROK_API_KEY not configured' }, { status: 500 });
    }

    // Run the generation asynchronously in the background so we can return immediately
    // This prevents cron-job.org from timing out after 30 seconds
    const runGeneration = async () => {
      try {
        const db = await getDb();
        const generatedBlogs: Array<{ title: string; slug: string; category: string }> = [];
        const generationErrors: any[] = [];

    // ── Generate blogs ────────────────────────────────────────────────
    for (let i = 0; i < count; i++) {
      try {
        // 1. Pick a trending topic
        const topicHint = await getTrendingTopic();
        const prompt = buildBlogPrompt(topicHint);

        // 2. Generate blog content with AI
        const result = await generateText({
          // @ts-ignore
          model: groq('openai/gpt-oss-120b'),
          system: 'You are a JSON-only API. Output strictly valid JSON. No markdown code fences. Keep content concise (800-1200 words max). Use only plain ASCII characters.',
          prompt,
          temperature: 0.8,
          maxTokens: 4096, // Limit output to prevent truncation
        });

        // 3. Parse the response (with repair for minor truncation)
        let jsonText = result.text
          .replace(/```json/gi, '')
          .replace(/```/gi, '')
          .trim();

        let data;
        try {
          data = JSON.parse(jsonText);
        } catch (parseErr) {
          // Attempt to repair truncated JSON
          console.warn(`[Cron Blog ${i + 1}] JSON parse failed, attempting repair...`);
          try {
            // If content was truncated, try to close the JSON structure
            // Find the last complete key-value pair
            const lastQuoteIdx = jsonText.lastIndexOf('"');
            if (lastQuoteIdx > 0) {
              // Try various closings
              const repairs = [
                jsonText + '"}',
                jsonText + '"],"metaTitle":"","metaDescription":""}',
                jsonText.substring(0, lastQuoteIdx + 1) + '}',
                jsonText.substring(0, lastQuoteIdx + 1) + ',"tags":[],"metaTitle":"","metaDescription":""}',
              ];
              for (const repair of repairs) {
                try {
                  data = JSON.parse(repair);
                  console.log(`[Cron Blog ${i + 1}] JSON repaired successfully`);
                  break;
                } catch { /* try next repair */ }
              }
            }
            if (!data) throw parseErr;
          } catch {
            console.error(`[Cron Blog ${i + 1}] JSON repair failed:`, parseErr);
            console.error('Raw text (first 500 chars):', jsonText.substring(0, 500));
            continue;
          }
        }

        // Validate required fields
        if (!data.title || !data.content) {
          console.error(`[Cron Blog ${i + 1}] Missing title or content`);
          continue;
        }

        // 4. Get a matching cover image
        const coverImage = await searchCoverImage(data.imageQuery || '', data.category || '', data.tags || []);

        // 5. Generate slug
        const baseSlug = (data.title as string)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .substring(0, 80);

        // Check for duplicate slug
        const existing = await db.collection('blogs').findOne({ slug: baseSlug });
        const finalSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

        // 6. Save to MongoDB as published
        const newBlog = {
          title: data.title,
          slug: finalSlug,
          content: data.content,
          excerpt: data.excerpt || '',
          tags: data.tags || [],
          imageUrl: coverImage.url,
          category: data.category || '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          likes: 0,
          views: 0,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          published: true, // Auto-publish!
          generatedBy: 'cron-ai',
          coverCredit: coverImage.credit,
        };

        await db.collection('blogs').insertOne(newBlog);

        generatedBlogs.push({
          title: data.title,
          slug: finalSlug,
          category: data.category || 'General',
        });

        console.log(`[Cron Blog ${i + 1}] ✅ Generated: "${data.title}"`);

        // Send email notification
        await notifyBlogPublished({
          title: data.title,
          slug: finalSlug,
          excerpt: data.excerpt || '',
          category: data.category || 'General',
          tags: data.tags || [],
          imageUrl: coverImage.url,
          source: 'cron-ai',
        });

        // Longer delay between generations to respect Groq free tier rate limits (8000 TPM)
        if (i < count - 1) {
          console.log(`[Cron] Waiting 40s for rate limit reset before next generation...`);
          await new Promise(resolve => setTimeout(resolve, 40000));
        }
      } catch (genError: any) {
        console.error(`[Cron Blog ${i + 1}] Generation error:`, genError);
        generationErrors.push({ attempt: i + 1, error: genError.message || genError.toString() });
        continue; // Skip this one, try the next
      }
    }

        if (generatedBlogs.length === 0) {
          console.error('[Cron] Failed to generate any blogs:', generationErrors);
        } else {
          console.log(`[Cron] Successfully finished background generation of ${generatedBlogs.length} blogs.`);
        }
      } catch (fatalErr) {
        console.error('[Cron] Fatal background error:', fatalErr);
      }
    };

    // Fire and forget!
    runGeneration();

    // Immediately return success so cron-job.org doesn't timeout
    return NextResponse.json({
      success: true,
      message: 'Background generation started',
      requested: count,
      timestamp: new Date().toISOString(),
    }, { status: 202 });

  } catch (error) {
    console.error('[Cron] Request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support GET for easier testing / webhook triggers
export async function GET(req: NextRequest) {
  // Rewrite as POST internally
  return POST(req);
}
