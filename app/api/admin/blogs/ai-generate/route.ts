import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse, NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

const groq = createOpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Configure long timeout since we are waiting for a full blog post
export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    if (!process.env.GROK_API_KEY) {
      return NextResponse.json({ error: 'Groq API Key missing' }, { status: 500 });
    }

    const prompt = `You are an expert technical blog writer for a developer's personal portfolio.
Write a comprehensive, engaging, and highly technical blog post about the following topic: "${topic}".

Format your response AS A STRICT JSON OBJECT with exactly the following schema. Do NOT wrap it in markdown code blocks (no \`\`\`json), just output raw JSON:
{
  "title": "A catchy, SEO-friendly title",
  "excerpt": "A short, 2-sentence summary of the post",
  "content": "The full blog post content formatted in Markdown. Include headings, code snippets (if applicable), and paragraphs.",
  "category": "One relevant technical category (e.g., 'Web Development', 'AI', 'Cloud', 'System Design')",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "metaTitle": "SEO meta title (under 60 chars)",
  "metaDescription": "SEO meta description (under 160 chars)"
}`;

    const result = await generateText({
      // @ts-ignore
      model: groq('llama-3.3-70b-versatile'),
      system: 'You are a JSON-only API. Output strictly valid JSON.',
      prompt: prompt,
      temperature: 0.7,
    });

    const jsonText = result.text.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog post. Please try again.' },
      { status: 500 }
    );
  }
}
