import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// POST - bulk operations on blogs (publish, unpublish, delete)
export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ids } = body;

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected action ("publish" | "unpublish" | "delete") and ids array' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Convert string IDs to ObjectId with fallback for string IDs
    const validObjectIds: ObjectId[] = [];
    const stringIds: string[] = [];

    for (const id of ids) {
      if (typeof id === 'string' && id.trim()) {
        try {
          validObjectIds.push(new ObjectId(id));
        } catch {
          // If not a valid ObjectId string
        }
        stringIds.push(id);
      }
    }

    const orConditions: any[] = [];
    if (validObjectIds.length > 0) {
      orConditions.push({ _id: { $in: validObjectIds } });
    }
    if (stringIds.length > 0) {
      orConditions.push({ _id: { $in: stringIds } });
      orConditions.push({ id: { $in: stringIds } });
    }

    if (orConditions.length === 0) {
      return NextResponse.json({ error: 'No valid IDs provided' }, { status: 400 });
    }

    const filter = { $or: orConditions };

    if (action === 'publish') {
      const result = await db.collection('blogs').updateMany(filter, {
        $set: {
          published: true,
          updatedAt: new Date().toISOString(),
        },
      });
      return NextResponse.json({ success: true, count: result.modifiedCount });
    }

    if (action === 'unpublish') {
      const result = await db.collection('blogs').updateMany(filter, {
        $set: {
          published: false,
          updatedAt: new Date().toISOString(),
        },
      });
      return NextResponse.json({ success: true, count: result.modifiedCount });
    }

    if (action === 'delete') {
      const result = await db.collection('blogs').deleteMany(filter);
      return NextResponse.json({ success: true, count: result.deletedCount });
    }

    return NextResponse.json(
      { error: 'Invalid action. Must be "publish", "unpublish", or "delete"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error performing bulk blog operation:', error);
    return NextResponse.json({ error: 'Failed to perform bulk operation' }, { status: 500 });
  }
}
