import { Metadata } from 'next'
import { getDb } from '@/lib/mongodb'
import AnimatedBackground from "@/components/animated-background"
import BlogListClient from "@/components/blog-list-client"

export const metadata: Metadata = {
  title: "Blog — Tech Articles on Engineering, AI & Development",
  description:
    "Read Farhan's latest articles on software engineering, distributed systems, AI, full-stack development, and career growth. Deep dives into the tech that powers modern applications.",
  keywords: ["tech blog", "software engineering", "AI", "full-stack development", "distributed systems", "backend", "tutorials"],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://github-portfolio-nahraf.vercel.app"}/blog`,
  },
  openGraph: {
    title: "Farhan's Tech Blog",
    description: "Deep dives into software engineering, AI, distributed systems, and building at scale.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://github-portfolio-nahraf.vercel.app"}/blog`,
    type: "website",
  },
}

export const revalidate = 60

interface BlogDoc {
  _id: any; title: string; slug: string; content: string; excerpt: string
  tags: string[]; publishedAt: string; published: boolean; imageUrl?: string; likes?: number
}

export default async function BlogListPage() {
  const db = await getDb()
  const rawBlogs = await db.collection('blogs')
    .find({ published: true })
    .sort({ publishedAt: -1 })
    .toArray() as BlogDoc[]

  // Compute read times server-side, then strip content before sending to client
  const blogs = rawBlogs.map(({ _id, content, ...rest }) => ({
    ...rest,
    id: _id.toString(),
    readTime: Math.max(1, Math.ceil((content || '').split(/\s+/).length / 200)),
  }))

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0e17] text-[#e2e8f0] relative">
      <AnimatedBackground />
      <BlogListClient blogs={blogs} />
    </div>
  )
}
