import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE - remove an html project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('htmlProjects').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting html project:', error);
    return NextResponse.json({ error: 'Failed to delete html project' }, { status: 500 });
  }
}
