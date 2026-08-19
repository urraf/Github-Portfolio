import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// POST - duplicate an existing blog post
export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    const db = await getDb();

    let filter;
    try {
      filter = { $or: [{ _id: new ObjectId(id) }, { id: id }] };
    } catch {
      filter = { $or: [{ _id: id }, { id: id }] } as any;
    }

    const existing = await db.collection('blogs').findOne(filter);
    if (!existing) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const baseSlug = `${existing.slug || 'post'}-copy`;
    const duplicateSlugExists = await db.collection('blogs').findOne({ slug: baseSlug });
    const finalSlug = duplicateSlugExists ? `${baseSlug}-${Date.now()}` : baseSlug;

    const now = new Date().toISOString();
    const newBlog = {
      title: `${existing.title || 'Untitled'} (Copy)`,
      slug: finalSlug,
      content: existing.content || '',
      excerpt: existing.excerpt || '',
      tags: existing.tags || [],
      imageUrl: existing.imageUrl || '',
      category: existing.category || '',
      metaTitle: existing.metaTitle || '',
      metaDescription: existing.metaDescription || '',
      likes: 0,
      views: 0,
      publishedAt: now,
      updatedAt: now,
      published: false,
    };

    const result = await db.collection('blogs').insertOne(newBlog);

    return NextResponse.json({ id: result.insertedId.toString(), ...newBlog }, { status: 201 });
  } catch (error) {
    console.error('Error duplicating blog:', error);
    return NextResponse.json({ error: 'Failed to duplicate blog' }, { status: 500 });
  }
}
