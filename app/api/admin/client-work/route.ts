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

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const clientName = formData.get('clientName') as string;
    const projectUrl = formData.get('projectUrl') as string;
    const description = formData.get('description') as string;
    const techStack = formData.getAll('techStack') as string[];
    const cost = formData.get('cost') as string;
    const status = formData.get('status') as string;
    const testimonial = formData.get('testimonial') as string;
    
    const imageFile = formData.get('image') as File | null;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    let imageUrl = '';

    if (imageFile) {
      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const { uploadBuffer } = await import('@/lib/cloudinary');
        const result = await uploadBuffer(buffer, {
          folder: 'client_work',
        });
        imageUrl = result.url;
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
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
      imageUrl: imageUrl,
      createdAt: new Date(),
    };

    const result = await db.collection('clientWork').insertOne(newEntry);
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error creating client work:', error);
    return NextResponse.json({ error: 'Failed to create client work' }, { status: 500 });
  }
}
