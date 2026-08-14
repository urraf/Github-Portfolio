import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// GET - read portfolio data from MongoDB
export async function GET() {
  try {
    const db = await getDb();
    const data = await db.collection('portfolio').findOne({ _id: 'main' as unknown as import('mongodb').ObjectId });

    if (!data) {
      return NextResponse.json({ error: 'Portfolio data not found' }, { status: 404 });
    }

    // Remove MongoDB _id from response
    const { _id, ...portfolioData } = data;
    void _id;
    return NextResponse.json(portfolioData);
  } catch (error) {
    console.error('Error reading portfolio data:', error);
    return NextResponse.json({ error: 'Failed to read portfolio data' }, { status: 500 });
  }
}

// PUT - update portfolio data in MongoDB
export async function PUT(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newData = await request.json();
    const db = await getDb();

    await db.collection('portfolio').updateOne(
      { _id: 'main' as unknown as import('mongodb').ObjectId },
      { $set: newData },
      { upsert: true }
    );

    // Invalidate the live stats cache so new values reflect immediately
    await db.collection('liveStats').deleteOne({ _id: 'current' as unknown as import('mongodb').ObjectId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating portfolio data:', error);
    return NextResponse.json({ error: 'Failed to update portfolio data' }, { status: 500 });
  }
}
