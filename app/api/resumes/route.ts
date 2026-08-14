import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// Public GET - return all resume entries (label + url only)
export async function GET() {
  try {
    const db = await getDb();
    const resumes = await db.collection('resumes')
      .find({}, { projection: { label: 1, url: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    // If no resumes in the new collection, fall back to the legacy single resume
    if (resumes.length === 0) {
      const portfolio = await db.collection('portfolio').findOne(
        { _id: 'main' as unknown as import('mongodb').ObjectId },
        { projection: { resumeUrl: 1 } }
      );
      if (portfolio?.resumeUrl) {
        return NextResponse.json([{ _id: 'legacy', label: 'Resume', url: portfolio.resumeUrl }], {
          headers: { 'Cache-Control': 'public, max-age=10, s-maxage=60' },
        });
      }
    }

    return NextResponse.json(resumes, {
      headers: { 'Cache-Control': 'public, max-age=10, s-maxage=60' },
    });
  } catch (error) {
    console.error('Error reading resumes:', error);
    return NextResponse.json({ error: 'Failed to read resumes' }, { status: 500 });
  }
}
