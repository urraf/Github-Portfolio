import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const revalidate = 3600;

export async function GET() {
  const db = await getDb();
  const blogsCollection = db.collection('blogs');

  const publishedBlogs = await blogsCollection
    .find({ published: true })
    .project({ slug: 1, title: 1, excerpt: 1, publishedAt: 1 })
    .sort({ publishedAt: -1 })
    .toArray();

  const baseUrl = 'https://www.nahraf.com';
  const feedUrl = `${baseUrl}/feed.xml`;

  const itemsXml = publishedBlogs
    .map((blog) => {
      const url = `${baseUrl}/blog/${blog.slug}`;
      const pubDate = blog.publishedAt ? new Date(blog.publishedAt).toUTCString() : new Date().toUTCString();
      return `
    <item>
      <title><![CDATA[${blog.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${blog.excerpt || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Farhan's Tech Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Insights on software engineering, AI, and backend development.</description>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <language>en</language>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
