import { Metadata } from 'next'
import { getDb } from '@/lib/mongodb'
import AnimatedBackground from "@/components/animated-background"
import BlogListClient from "@/components/blog-list-client"

export const metadata: Metadata = {
  title: "Blog — Tech Articles on Engineering, AI & Development",
  description:
    "Read Nahraf's latest articles on software engineering, distributed systems, AI, full-stack development, and career growth. Deep dives into the tech that powers modern applications.",
  keywords: ["tech blog", "software engineering", "AI", "full-stack development", "distributed systems", "backend", "tutorials"],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.nahraf.tech"}/blog`,
  },
  openGraph: {
    title: "Nahraf's Tech Blog",
    description: "Deep dives into software engineering, AI, distributed systems, and building at scale.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.nahraf.tech"}/blog`,
    type: "website",
  },
}

export const revalidate = 60

interface BlogDoc {
  _id: any; title: string; slug: string; content: string; excerpt: string
  tags: string[]; publishedAt: string; published: boolean; imageUrl?: string; likes?: number; views?: number
}

export default async function BlogListPage() {
  const db = await getDb()
  const blogsCollection = db.collection('blogs')

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nahraf.tech"
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Blog — Tech Articles on Engineering, AI & Development",
    url: `${SITE_URL}/blog`,
    description: "Read Nahraf's latest articles on software engineering, distributed systems, AI, full-stack development, and career growth.",
    isPartOf: {
      "@type": "WebSite",
      name: "Nahraf — Software Engineer & Tech Blogger",
      url: SITE_URL
    }
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`
      }
    ]
  }

  // Fetch only published blogs
  const rawBlogs = await blogsCollection
    .find({ published: true })
    .sort({ publishedAt: -1 })
    .toArray() as BlogDoc[]

  // Compute read times server-side, then strip content before sending to client
  const blogs = rawBlogs.map(({ _id, content, ...rest }) => ({
    ...rest,
    id: _id.toString(),
    readTime: Math.max(1, Math.ceil((content || '').split(/\s+/).length / 200)),
    views: rest.views || 0,
  }))

  return (
    <div className="min-h-screen bg-[#0a0e17] selection:bg-[#00d4ff]/30 text-[#e2e8f0]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <AnimatedBackground />
      <BlogListClient blogs={blogs} />
    </div>
  )
}
