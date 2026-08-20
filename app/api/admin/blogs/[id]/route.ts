import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { notifyBlogPublished } from '@/lib/email';

// PUT - update a blog post
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
    const blogData = await request.json();
    const db = await getDb();

    let filter;
    try {
      filter = { $or: [{ _id: new ObjectId(id) }, { id: id }] };
    } catch {
      // If id is not a valid ObjectId (legacy data), try as string
      filter = { $or: [{ _id: id }, { id: id }] } as any;
    }

    const existing = await db.collection('blogs').findOne(filter);
    if (!existing) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Sanitize slug
    const rawSlug = blogData.slug ?? existing.slug;
    const sanitizedSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const updateData = {
      title: blogData.title ?? existing.title,
      slug: sanitizedSlug || existing.slug,
      content: blogData.content ?? existing.content,
      excerpt: blogData.excerpt ?? existing.excerpt,
      tags: blogData.tags ?? existing.tags,
      category: blogData.category ?? existing.category ?? '',
      metaTitle: blogData.metaTitle ?? existing.metaTitle ?? '',
      metaDescription: blogData.metaDescription ?? existing.metaDescription ?? '',
      published: blogData.published ?? existing.published,
      imageUrl: blogData.imageUrl ?? existing.imageUrl ?? '',
      likes: blogData.likes ?? existing.likes ?? 0,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('blogs').updateOne(filter, { $set: updateData });

    // If it was just published, send notification
    if (updateData.published && !existing.published) {
      // Don't await, send in background
      notifyBlogPublished({
        title: updateData.title,
        slug: updateData.slug,
        excerpt: updateData.excerpt,
        category: updateData.category,
        tags: updateData.tags,
        imageUrl: updateData.imageUrl,
        source: 'manual', // or ai-writer, but we use manual as blanket for editor
      }).catch(console.error);
    }

    const updated = {
      id,
      ...updateData,
      publishedAt: existing.publishedAt,
      views: existing.views ?? 0,
    };
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

// DELETE - delete a blog post
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();

    let filter;
    try {
      filter = { $or: [{ _id: new ObjectId(id) }, { id: id }] };
    } catch {
      filter = { $or: [{ _id: id }, { id: id }] } as any;
    }

    const result = await db.collection('blogs').deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
