import { MetadataRoute } from 'next';
import { getDb } from '@/lib/mongodb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();
  const blogsCollection = db.collection('blogs');

  const publishedBlogs = await blogsCollection
    .find({ published: true })
    .project({ slug: 1, publishedAt: 1 })
    .toArray();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nahraf.tech";

  const blogEntries: MetadataRoute.Sitemap = publishedBlogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.publishedAt ? new Date(blog.publishedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/client-work`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/project-overview`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...blogEntries,
  ];
}
