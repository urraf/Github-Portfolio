import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET - fetch comments for a specific blog
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');

    if (!blogId) {
      return NextResponse.json({ error: 'blogId is required' }, { status: 400 });
    }

    const db = await getDb();
    
    const comments = await db.collection('comments')
      .find({ blogId })
      .sort({ createdAt: -1 })
      .toArray();

    const result = comments.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST - add a new comment anonymously
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.blogId || !data.name || !data.content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Very basic Math CAPTCHA validation
    if (String(data.captchaAnswer) !== String(data.expectedCaptcha)) {
      return NextResponse.json({ error: 'Incorrect CAPTCHA answer. Are you a bot?' }, { status: 403 });
    }

    const db = await getDb();

    const newComment = {
      blogId: data.blogId,
      name: data.name.trim(),
      content: data.content.trim(),
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection('comments').insertOne(newComment);

    return NextResponse.json({ id: result.insertedId.toString(), ...newComment }, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
