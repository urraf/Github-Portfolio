const { createOpenAI } = require('@ai-sdk/openai');
const { generateText } = require('ai');

const groq = createOpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

async function main() {
  const topic = "React hooks";
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

  try {
    const result = await generateText({
      model: groq('openai/gpt-oss-120b'),
      system: 'You are a JSON-only API. Output strictly valid JSON.',
      prompt: prompt,
      temperature: 0.7,
    });
    console.log("Success:", result.text);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
