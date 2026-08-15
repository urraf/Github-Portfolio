import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// GET - returns blogs (published only for public, all for admin)
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const isAdmin = await isAuthenticated();
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get('public') === 'true';

    let blogs;
    if (publicOnly || !isAdmin) {
      blogs = await db.collection('blogs').find(
        { published: true },
        { projection: { content: 0 } }
      ).sort({ publishedAt: -1 }).toArray();
    } else {
      blogs = await db.collection('blogs').find({}).sort({ publishedAt: -1 }).toArray();
    }

    // Convert _id to id string for frontend compatibility
    const result = blogs.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error reading blogs:', error);
    return NextResponse.json({ error: 'Failed to read blogs' }, { status: 500 });
  }
}

// POST - create new blog
export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blogData = await request.json();
    const db = await getDb();

    const slug = blogData.slug || blogData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${Date.now()}`;

    // Check for duplicate slug
    const existing = await db.collection('blogs').findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const newBlog = {
      title: blogData.title || 'Untitled',
      slug: finalSlug,
      content: blogData.content || '',
      excerpt: blogData.excerpt || '',
      tags: blogData.tags || [],
      imageUrl: blogData.imageUrl || '',
      likes: 0,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: blogData.published ?? false,
    };

    const result = await db.collection('blogs').insertOne(newBlog);

    return NextResponse.json({ id: result.insertedId.toString(), ...newBlog }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
