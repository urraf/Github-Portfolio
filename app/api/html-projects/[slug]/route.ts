import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: 'Project slug is required' }, { status: 400 });
    }

    const db = await getDb();
    const project = await db.collection('htmlProjects').findOne({ slug });

    if (!project) {
      return new NextResponse('Project not found', { status: 404 });
    }

    return new NextResponse(project.content, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60', // Cache for 60 seconds
      },
    });
  } catch (error) {
    console.error('Error fetching html project:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
