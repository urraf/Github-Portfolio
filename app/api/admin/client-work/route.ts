import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// GET - list all client work entries
export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const entries = await db.collection('clientWork')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error reading client work:', error);
    return NextResponse.json({ error: 'Failed to read client work' }, { status: 500 });
  }
}

// POST - create a new client work entry
export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, clientName, projectUrl, description, techStack, cost, status, testimonial } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const db = await getDb();
    const newEntry = {
      title: title || '',
      clientName: clientName || '',
      projectUrl: projectUrl || '',
      description: description || '',
      techStack: techStack || [],
      cost: cost || '',
      status: status || 'Completed',
      testimonial: testimonial || '',
      createdAt: new Date(),
    };

    const result = await db.collection('clientWork').insertOne(newEntry);
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error creating client work:', error);
    return NextResponse.json({ error: 'Failed to create client work' }, { status: 500 });
  }
}
