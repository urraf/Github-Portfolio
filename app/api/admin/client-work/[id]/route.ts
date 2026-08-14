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

    const formData = await request.formData();
    const title = formData.get('title') as string | null;
    const clientName = formData.get('clientName') as string | null;
    const projectUrl = formData.get('projectUrl') as string | null;
    const description = formData.get('description') as string | null;
    const techStack = formData.getAll('techStack') as string[];
    const cost = formData.get('cost') as string | null;
    const status = formData.get('status') as string | null;
    const testimonial = formData.get('testimonial') as string | null;
    const imageFile = formData.get('image') as File | null;

    const db = await getDb();
    const updateFields: Record<string, unknown> = {};
    if (title !== null) updateFields.title = title;
    if (clientName !== null) updateFields.clientName = clientName;
    if (projectUrl !== null) updateFields.projectUrl = projectUrl;
    if (description !== null) updateFields.description = description;
    // techStack is always an array from getAll, even if empty. Only update if it has items, 
    // or if the frontend explicitly sends an empty array indicator.
    // Since FormData getAll('techStack') is empty if not appended, we'll check if the form had the 'techStack' key.
    if (formData.has('techStack')) updateFields.techStack = techStack;
    
    if (cost !== null) updateFields.cost = cost;
    if (status !== null) updateFields.status = status;
    if (testimonial !== null) updateFields.testimonial = testimonial;
    
    if (imageFile && imageFile.size > 0) {
      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const { uploadBuffer } = await import('@/lib/cloudinary');
        const result = await uploadBuffer(buffer, {
          folder: 'client_work',
        });
        updateFields.imageUrl = result.url;
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
    }

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
