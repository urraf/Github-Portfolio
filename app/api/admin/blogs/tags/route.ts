import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// GET - aggregates all unique tags across all blogs with usage counts
export async function GET(_request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();

    const pipeline = [
      { $match: { tags: { $exists: true, $type: 'array', $ne: [] } } },
      { $unwind: '$tags' },
      { $match: { tags: { $ne: '' } } },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      {
        $project: {
          _id: 0,
          tag: '$_id',
          count: 1,
        },
      },
    ];

    const tags = await db.collection('blogs').aggregate(pipeline).toArray();

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
