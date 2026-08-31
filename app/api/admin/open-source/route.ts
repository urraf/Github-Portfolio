import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// GET - list all open source contributions (admin)
export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const contributions = await db.collection('openSourceContributions')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(contributions);
  } catch (error) {
    console.error('Error reading open source contributions:', error);
    return NextResponse.json({ error: 'Failed to read contributions' }, { status: 500 });
  }
}

// POST - create a new open source contribution
export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectName, repoUrl, prUrl, description, contributionType, status, techStack, stars } = body;

    if (!projectName) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const db = await getDb();
    const newContribution = {
      projectName: projectName || '',
      repoUrl: repoUrl || '',
      prUrl: prUrl || '',
      description: description || '',
      contributionType: contributionType || 'Pull Request',
      status: status || 'Merged',
      techStack: techStack || [],
      stars: parseInt(stars) || 0,
      createdAt: new Date(),
    };

    const result = await db.collection('openSourceContributions').insertOne(newContribution);
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error creating contribution:', error);
    return NextResponse.json({ error: 'Failed to create contribution' }, { status: 500 });
  }
}
