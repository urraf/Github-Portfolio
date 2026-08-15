import { Metadata } from 'next'
import { cache } from 'react'
import Link from "next/link"
import { notFound } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Clock, BookOpen, ChevronRight } from "lucide-react"
import AnimatedBackground from "@/components/animated-background"
import MarkdownRenderer from "@/components/markdown-renderer"
import BlogComments from "@/components/blog-comments"
import BlogLikeButton from "@/components/blog-like-button"
import TableOfContents from "@/components/table-of-contents"
import { getDb } from '@/lib/mongodb'

interface Blog {
  _id?: any;
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  published: boolean;
  imageUrl?: string;
  likes?: number;
}

// Helper to fetch data
const getBlogData = cache(async (slug: string) => {
  const db = await getDb()
  const rawBlog = await db.collection('blogs').findOne({ slug, published: true })
  
  if (!rawBlog) return null

  const blog: Blog = {
    ...rawBlog as any,
    id: rawBlog._id.toString(),
    _id: undefined
  }

  // Get 4 random recommendations (lightweight, exclude content)
  const rawRecommendations = await db.collection('blogs')
    .find(
      { slug: { $ne: slug }, published: true },
      { projection: { content: 0 } }
    )
    .sort({ publishedAt: -1 })
    .limit(8)
    .toArray()

  // Shuffle and take 4
  const shuffled = rawRecommendations.sort(() => 0.5 - Math.random())
  const recommendedBlogs: Blog[] = shuffled.slice(0, 4).map(b => ({
    ...b as any,
    id: b._id.toString(),
    _id: undefined
  }))

  return { blog, recommendedBlogs }
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getBlogData(resolvedParams.slug)
  
  if (!data?.blog) {
    return { title: 'Post Not Found | Farhan' }
  }

  const blog = data.blog

  return {
    title: `${blog.title} | Farhan's Blog`,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: ['Farhan'],
      images: blog.imageUrl ? [blog.imageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt,
      images: blog.imageUrl ? [blog.imageUrl] : [],
    }
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getBlogData(resolvedParams.slug)

  if (!data?.blog) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-center p-4">
        <div>
          <BookOpen className="h-16 w-16 text-[#21262d] mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">Post Not Found</h1>
          <p className="text-[#7d8590] mb-6">This blog post doesn&apos;t exist or has been removed.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#58a6ff] hover:text-[#79c0ff] transition-colors font-medium">
            <ArrowLeft className="h-4 w-4" />Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const { blog, recommendedBlogs } = data
  const estimateReadTime = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 200))

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] relative">
      <AnimatedBackground />

      {/* Sticky Header */}
      <header className="border-b border-[#21262d] bg-[#010409]/95 backdrop-blur-md px-4 py-4 sticky top-0 z-50">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/blog" className="flex items-center gap-2 text-[#7d8590] hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Avatar className="h-8 w-8 border border-[#30363d]">
              <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
              <AvatarFallback className="bg-[#21262d] text-white text-sm">F</AvatarFallback>
            </Avatar>
            <span className="text-white font-semibold truncate">{blog.title}</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-[#7d8590] hover:text-white transition-colors">Portfolio</Link>
            <Link href="/blog" className="text-[#7d8590] hover:text-white transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:py-14 relative z-10 flex flex-col lg:flex-row gap-10">
        
        {/* Left Column - Main Content */}
        <div className="flex-1 lg:max-w-4xl w-full">
          <article>
            {/* Article Header */}
            <header className="mb-10 text-center lg:text-left">
              {blog.tags.length > 0 && (
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                  {blog.tags.map((tag, i) => (
                    <Badge key={i} className="bg-[#21262d] text-[#58a6ff] border-[#30363d] text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
                {blog.title}
              </h1>
              <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-[#7d8590]">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 border border-[#30363d]">
                    <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
                    <AvatarFallback className="bg-[#21262d] text-white text-xs">F</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-[#e6edf3]">Farhan</span>
                </div>
                <span className="text-[#30363d]">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(blog.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                <span className="text-[#30363d]">•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {estimateReadTime(blog.content)} min read
                </span>
                <span className="text-[#30363d]">•</span>
                <BlogLikeButton blogId={blog.id as string} initialLikes={blog.likes || 0} />
              </div>
            </header>

            {/* Hero Image */}
            {blog.imageUrl && (
              <div className="w-full h-64 sm:h-80 md:h-96 relative overflow-hidden rounded-2xl mb-12 shadow-2xl border border-[#30363d]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={blog.imageUrl} 
                  alt={blog.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/80 to-transparent pointer-events-none" />
              </div>
            )}

            {/* Divider if no image */}
            {!blog.imageUrl && (
              <div className="w-16 h-0.5 bg-gradient-to-r from-[#58a6ff] to-[#3fb950] mx-auto mb-10 rounded-full" />
            )}

            {/* Article Body */}
            <div className="bg-[#161b22]/80 border border-[#30363d] rounded-2xl p-6 sm:p-10 lg:p-12 shadow-xl backdrop-blur-sm prose prose-invert max-w-none prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-[#30363d] prose-a:text-[#58a6ff] hover:prose-a:text-[#79c0ff] prose-img:rounded-xl">
              <MarkdownRenderer content={blog.content} />
            </div>

            {/* Comments Section */}
            <BlogComments blogId={blog.id as string} />
          </article>
        </div>

        {/* Right Column - Sidebar */}
        <aside className="hidden lg:block w-[350px] flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <TableOfContents content={blog.content} />
            
            <div className="bg-[#161b22]/50 border border-[#30363d] rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-4 w-1 bg-[#58a6ff] rounded-full" />
                <h3 className="text-lg font-bold text-white">Author</h3>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-14 w-14 border border-[#30363d]">
                  <AvatarImage src="/profile2.jpeg" alt="Author" className="object-cover" />
                  <AvatarFallback className="bg-[#21262d] text-white">F</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-white">Farhan</h4>
                  <p className="text-sm text-[#7d8590]">Software Engineer</p>
                </div>
              </div>
              <p className="text-sm text-[#8b949e] leading-relaxed">
                Passionate about building scalable applications, AI integrations, and sleek user interfaces.
              </p>
              <Link href="/" className="mt-4 inline-block text-[#58a6ff] hover:text-[#79c0ff] text-sm font-medium transition-colors">
                View full portfolio →
              </Link>
            </div>

            <div className="bg-[#161b22]/50 border border-[#30363d] rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-4 w-1 bg-[#3fb950] rounded-full" />
                <h3 className="text-lg font-bold text-white">Recommended</h3>
              </div>
              <div className="space-y-6">
                {recommendedBlogs.slice(0, 3).map(rec => (
                  <Link href={`/blog/${rec.slug}`} key={rec.id} className="group flex gap-4 block">
                    <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border border-[#30363d] relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={rec.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors line-clamp-2 leading-snug">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-[#7d8590] mt-1">{new Date(rec.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Bottom Recommended Grid for Mobile/Tablet or just extra engagement */}
      <section className="mx-auto max-w-7xl px-4 py-12 relative z-10 border-t border-[#21262d]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">More Articles</h2>
          <Link href="/blog" className="text-[#58a6ff] hover:text-[#79c0ff] flex items-center gap-1 text-sm font-medium transition-colors">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedBlogs.map(rec => (
            <Link href={`/blog/${rec.slug}`} key={rec.id} className="group flex flex-col bg-[#161b22]/40 border border-[#30363d] rounded-xl overflow-hidden hover:border-[#58a6ff]/50 hover:-translate-y-1 transition-all duration-300">
              <div className="h-40 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={rec.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1 mb-3">
                  {rec.tags.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold text-[#58a6ff] bg-[#58a6ff]/10 px-2 py-0.5 rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-semibold text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors line-clamp-2 text-sm leading-snug mb-2 flex-1">
                  {rec.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#21262d] bg-[#010409] px-4 py-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[#484f58] text-sm">Crafted with care • 2025</p>
        </div>
      </footer>
    </div>
  )
}
