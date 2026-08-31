import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// Public GET - list all open source contributions
export async function GET() {
  try {
    const db = await getDb();
    const contributions = await db.collection('openSourceContributions')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(contributions, {
      headers: { 'Cache-Control': 'public, max-age=10, s-maxage=60' },
    });
  } catch (error) {
    console.error('Error reading open source contributions:', error);
    return NextResponse.json({ error: 'Failed to read contributions' }, { status: 500 });
  }
}
