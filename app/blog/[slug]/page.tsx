"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Clock, BookOpen } from "lucide-react"
import AnimatedBackground from "@/components/animated-background"
import MarkdownRenderer from "@/components/markdown-renderer"
import BlogComments from "@/components/blog-comments"

interface Blog {
  id: string; title: string; slug: string; content: string; excerpt: string
  tags: string[]; publishedAt: string; published: boolean; imageUrl?: string
}

export default function BlogPostPage() {
  const params = useParams()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/blogs?public=true")
      .then(r => r.json())
      .then((blogs: Blog[]) => {
        const found = blogs.find(b => b.slug === params.slug)
        setBlog(found || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.slug])

  const estimateReadTime = (content: string) => Math.max(1, Math.ceil(content.split(/\s+/).length / 200))

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-[#58a6ff]/30 border-t-[#58a6ff] rounded-full animate-spin" />
    </div>
  )

  if (!blog) return (
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

      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14 relative z-10">
        <article>
          {/* Article Header */}
          <header className="mb-10 text-center">
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {blog.tags.map((tag, i) => (
                  <Badge key={i} className="bg-[#21262d] text-[#58a6ff] border-[#30363d] text-xs">{tag}</Badge>
                ))}
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              {blog.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-[#7d8590]">
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
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {estimateReadTime(blog.content)} min read
              </span>
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
          <BlogComments blogId={blog.id} />
        </article>

        {/* Bottom Navigation */}
        <div className="mt-14 pt-8 border-t border-[#21262d]">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="text-[#58a6ff] hover:text-[#79c0ff] inline-flex items-center gap-2 font-medium transition-colors">
              <ArrowLeft className="h-4 w-4" />
              All Posts
            </Link>
            <Link href="/" className="text-[#7d8590] hover:text-white text-sm transition-colors">
              View Portfolio →
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#21262d] bg-[#010409] px-4 py-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[#484f58] text-sm">Crafted with care • 2025</p>
        </div>
      </footer>
    </div>
  )
}
