import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { blogId } = await request.json();

    if (!blogId) {
      return NextResponse.json({ error: 'blogId is required' }, { status: 400 });
    }

    const db = await getDb();
    
    let objectId;
    try {
      objectId = new ObjectId(blogId);
    } catch {
      return NextResponse.json({ error: 'Invalid blogId format' }, { status: 400 });
    }

    const result = await db.collection('blogs').findOneAndUpdate(
      { _id: objectId },
      { $inc: { likes: 1 } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ likes: result.likes }, { status: 200 });
  } catch (error) {
    console.error('Error liking blog:', error);
    return NextResponse.json({ error: 'Failed to like blog' }, { status: 500 });
  }
}
