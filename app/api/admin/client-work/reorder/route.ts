import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const db = await getDb();
    
    // Bulk write to update all orders
    const bulkOps = orderedIds.map((id: string, index: number) => ({
      updateOne: {
        filter: { _id: new ObjectId(id) },
        update: { $set: { order: index } }
      }
    }));

    if (bulkOps.length > 0) {
      await db.collection('clientWork').bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering client work:', error);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
