import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

const groq = createOpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(req: Request) {
  try {
    const { messages, blogContext } = await req.json();

    if (!process.env.GROK_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a helpful and knowledgeable AI assistant embedded in a developer portfolio blog.
The user is currently reading the following blog post:

TITLE: ${blogContext?.title || 'Unknown'}
TAGS: ${blogContext?.tags?.join(', ') || 'None'}

CONTENT:
${blogContext?.content || 'No content provided.'}

Your goal is to answer the user's questions specifically based on the context of this blog post. 
If they ask something unrelated, you can still answer it, but gently remind them of the blog topic if appropriate.
Keep your answers concise, clear, and formatted using markdown.`;

    const result = await streamText({
      // @ts-ignore: Version mismatch between ai and @ai-sdk/openai types
      model: groq('openai/gpt-oss-20b'),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
