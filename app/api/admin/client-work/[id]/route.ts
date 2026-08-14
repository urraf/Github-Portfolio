import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT - update a client work entry
export async function PUT(
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
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, clientName, projectUrl, description, techStack, cost, status, testimonial } = body;

    const db = await getDb();
    const updateFields: Record<string, unknown> = {};
    if (title !== undefined) updateFields.title = title;
    if (clientName !== undefined) updateFields.clientName = clientName;
    if (projectUrl !== undefined) updateFields.projectUrl = projectUrl;
    if (description !== undefined) updateFields.description = description;
    if (techStack !== undefined) updateFields.techStack = techStack;
    if (cost !== undefined) updateFields.cost = cost;
    if (status !== undefined) updateFields.status = status;
    if (testimonial !== undefined) updateFields.testimonial = testimonial;
    updateFields.updatedAt = new Date();

    const result = await db.collection('clientWork').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating client work:', error);
    return NextResponse.json({ error: 'Failed to update client work' }, { status: 500 });
  }
}

// DELETE - delete a client work entry
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
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('clientWork').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client work:', error);
    return NextResponse.json({ error: 'Failed to delete client work' }, { status: 500 });
  }
}
