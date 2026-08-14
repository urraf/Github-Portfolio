import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { uploadBuffer } from '@/lib/cloudinary';

// GET - list all resumes
export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const resumes = await db.collection('resumes')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(resumes);
  } catch (error) {
    console.error('Error reading resumes:', error);
    return NextResponse.json({ error: 'Failed to read resumes' }, { status: 500 });
  }
}

// POST - upload a new resume
export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const label = formData.get('label') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!label || !label.trim()) {
      return NextResponse.json({ error: 'Label is required' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique public_id based on label
    const publicId = `resume_${label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`;

    const result = await uploadBuffer(buffer, {
      folder: 'portfolio/resumes',
      public_id: publicId,
      resource_type: 'raw',
    });

    const db = await getDb();
    const newResume = {
      label: label.trim(),
      url: result.url,
      publicId: result.public_id,
      createdAt: new Date(),
    };

    const insertResult = await db.collection('resumes').insertOne(newResume);

    // Also update the legacy resumeUrl to the most recently uploaded resume
    await db.collection('portfolio').updateOne(
      { _id: 'main' as unknown as import('mongodb').ObjectId },
      { $set: { resumeUrl: result.url } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, id: insertResult.insertedId, url: result.url });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json({ error: 'Failed to upload resume' }, { status: 500 });
  }
}
