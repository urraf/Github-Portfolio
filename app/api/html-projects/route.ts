import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET - read all html projects for public viewing
export async function GET() {
  try {
    const db = await getDb();
    // exclude the large 'content' field when listing
    const projects = await db.collection('htmlProjects')
      .find({}, { projection: { content: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(projects, {
      headers: {
        'Cache-Control': 'public, max-age=10, s-maxage=60',
      },
    });
  } catch (error) {
    console.error('Error reading html projects:', error);
    return NextResponse.json({ error: 'Failed to read html projects' }, { status: 500 });
  }
}
