import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT - update an open source contribution
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { projectName, repoUrl, prUrl, description, contributionType, status, techStack, stars } = body;

    const db = await getDb();
    const updateData: Record<string, unknown> = {};

    if (projectName !== undefined) updateData.projectName = projectName;
    if (repoUrl !== undefined) updateData.repoUrl = repoUrl;
    if (prUrl !== undefined) updateData.prUrl = prUrl;
    if (description !== undefined) updateData.description = description;
    if (contributionType !== undefined) updateData.contributionType = contributionType;
    if (status !== undefined) updateData.status = status;
    if (techStack !== undefined) updateData.techStack = techStack;
    if (stars !== undefined) updateData.stars = parseInt(stars) || 0;

    await db.collection('openSourceContributions').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating contribution:', error);
    return NextResponse.json({ error: 'Failed to update contribution' }, { status: 500 });
  }
}

// DELETE - delete an open source contribution
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();
    await db.collection('openSourceContributions').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contribution:', error);
    return NextResponse.json({ error: 'Failed to delete contribution' }, { status: 500 });
  }
}
