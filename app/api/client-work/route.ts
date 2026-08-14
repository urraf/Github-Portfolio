import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// Public GET - list all client work entries (excludes cost)
export async function GET() {
  try {
    const db = await getDb();
    const entries = await db.collection('clientWork')
      .find({}, { projection: { cost: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(entries, {
      headers: { 'Cache-Control': 'public, max-age=10, s-maxage=60' },
    });
  } catch (error) {
    console.error('Error reading client work:', error);
    return NextResponse.json({ error: 'Failed to read client work' }, { status: 500 });
  }
}
