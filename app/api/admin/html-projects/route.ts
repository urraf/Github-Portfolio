import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// GET - read all html projects
export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    // exclude the large 'content' field when listing
    const projects = await db.collection('htmlProjects')
      .find({}, { projection: { content: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error reading html projects:', error);
    return NextResponse.json({ error: 'Failed to read html projects' }, { status: 500 });
  }
}

// POST - add a new html project
export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string | null;
    const file = formData.get('htmlFile') as File | null;

    if (!title || !file) {
      return NextResponse.json({ error: 'Title and html file are required' }, { status: 400 });
    }

    if (typeof file === 'string') {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
    }

    const fileName = file.name || '';
    if (!fileName.endsWith('.html') && file.type !== 'text/html') {
      return NextResponse.json({ error: 'Only HTML files allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const content = Buffer.from(bytes).toString('utf-8');
    let slug = generateSlug(title);

    const db = await getDb();
    
    // Check if slug exists and make it unique if necessary
    let count = 1;
    let existingSlug = await db.collection('htmlProjects').findOne({ slug });
    while (existingSlug) {
      slug = `${generateSlug(title)}-${count}`;
      existingSlug = await db.collection('htmlProjects').findOne({ slug });
      count++;
    }

    const newProject = {
      title,
      slug,
      content,
      createdAt: new Date()
    };

    const result = await db.collection('htmlProjects').insertOne(newProject);

    return NextResponse.json({ success: true, id: result.insertedId, slug });
  } catch (error: any) {
    console.error('Error adding html project:', error);
    return NextResponse.json({ error: error.message || 'Failed to add html project' }, { status: 500 });
  }
}
